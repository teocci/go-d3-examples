/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-10
 */
import D3Graph from './d3-graph.js'

export default class LineGraph extends D3Graph {
    static TAG = 'line'

    static DEFAULT_STROKE = {
        color: 'currentColor',
        lineCap: 'round',
        lineJoin: 'round',
        width: 1.5,
        opacity: 1,
    }

    static DEFAULT_LINE = {
        title: null,
        defined: null,
        curve: d3.curveLinear,
        stroke: LineGraph.DEFAULT_STROKE,
    }

    constructor(data, options) {
        super(options.margin, options.width, options.height)

        this.D = null

        this.x = this.simpleMerge(this.x, options.x)
        this.y = this.simpleMerge(this.y, options.y)

        this.x.type = d3.scaleUtc
        this.y.type = d3.scaleLinear

        this.line = this.simpleMerge(LineGraph.DEFAULT_LINE, options.line)
        this.line.defined = options.defined ?? null
        this.line.curve = options.curve ?? d3.curveLinear
        this.line.stroke = this.simpleMerge(LineGraph.DEFAULT_STROKE, options.line.stroke)

        console.log({x: this.x, y: this.y, line: this.line})

        if (data != null) this.load(data)
    }

    get type() {
        return LineGraph.TAG
    }

    load(data) {
        super.load(data)

        this.O = d3.map(data, d => d)
        this.I = d3.map(data, (_, i) => i)

        if (this.line.defined == null) this.line.defined = (d, i) => !isNaN(this.X[i]) && !isNaN(this.Y[i])
        this.D = d3.map(data, this.line.defined)

        console.log({X: this.X, Y: this.Y, I: this.I, D: this.D})

        // Compute default domains.
        if (this.x.domain == null) this.x.domain = d3.extent(this.X)
        if (this.y.domain == null) this.y.domain = [0, d3.max(this.Y)]

        // Construct  axes.
        this.x.axis = d3.axisBottom(this.x.scale).ticks(this.width / 80).tickSizeOuter(0)
        this.y.axis = d3.axisLeft(this.y.scale).ticks(this.height / 40, this.y.format)

        // Compute titles.
        if (this.line.title == null) {
            const formatDate = this.x.scale.tickFormat(null, '%b %-d, %Y')
            const formatValue = this.y.scale.tickFormat(100, this.y.format)
            this.line.title = i => `${formatDate(this.X[i])}\n${formatValue(this.Y[i])}`
        } else {
            this.O = d3.map(data, d => d)
            this.T = this.line.title
            this.line.title = i => this.T(this.O[i], i, data)
        }
    }

    async loadCSV(url) {
        await this.loadFromURL(url)
    }

    render() {
        // Construct a line generator.
        const line = d3.line()
            .curve(this.line.curve)
            .defined(i => this.D[i])
            .x(i => this.x.scale(this.X[i]))
            .y(i => this.y.scale(this.Y[i]))

        this.svg = d3.create('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', [0, 0, this.width, this.height])
            .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10)
            .style('-webkit-tap-highlight-color', 'transparent')
            .style('overflow', 'visible')
            .on('pointerenter pointermove', e => this.pointerMoved(e))
            .on('pointerleave', e => this.pointerLeft())
            .on('touchstart', e => e.preventDefault())

        this.svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${this.plot.height + this.margin.top})`)
            .call(this.x.axis)

        this.svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', `translate(${this.margin.left}, 0)`)
            .call(this.y.axis)
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line').clone()
                .attr('x2', this.plot.width)
                .attr('stroke-opacity', 0.1))
            .call(g => g.append('text')
                .attr('x', -this.margin.left)
                .attr('y', 10)
                .attr('fill', 'currentColor')
                .attr('text-anchor', 'start')
                .text(this.y.label))

        this.svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', this.line.stroke.color)
            .attr('stroke-width', this.line.stroke.width)
            .attr('stroke-linecap', this.line.stroke.lineCap)
            .attr('stroke-linejoin', this.line.stroke.lineJoin)
            .attr('stroke-opacity', this.line.stroke.opacity)
            .attr('d', line(this.I))

        this.initToggle(this.svg)

        return this.svg.node()
    }

    pointerMoved(event) {
        const i = d3.bisectCenter(this.X, this.x.scale.invert(d3.pointer(event)[0]))
        this.tooltip.style('display', null)
        this.tooltip.attr('transform', `translate(${this.x.scale(this.X[i])},${this.y.scale(this.Y[i])})`)

        const path = this.tooltip.selectAll('path')
            .data([,])
            .join('path')
            .attr('fill', 'white')
            .attr('stroke', 'black')

        const text = this.tooltip.selectAll('text')
            .data([,])
            .join('text')
            .call(text => text
                .selectAll('tspan')
                .data(`${this.line.title(i)}`.split(/\n/))
                .join('tspan')
                .attr('x', 0)
                .attr('y', (_, i) => `${i * 1.1}em`)
                .attr('font-weight', (_, i) => i ? null : 'bold')
                .text(d => d));

        const {x, y, width: w, height: h} = text.node().getBBox()
        text.attr('transform', `translate(${-w / 2},${15 - y})`)
        path.attr('d', `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`)
        this.svg.property('value', this.O[i]).dispatch('input', {bubbles: true})
    }

    pointerLeft() {
        this.tooltip.style('display', 'none')
        this.svg.node().value = null
        this.svg.dispatch('input', {bubbles: true})
    }
}