/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-14
 */
import D3Graph from './d3-graph.js'

export default class ScatterGraph extends D3Graph {
    static TAG = 'scatter'

    static DEFAULT_RADIUS = 3
    static DEFAULT_INSET_VALUE = 2 * ScatterGraph.DEFAULT_RADIUS

    static DEFAULT_INSET = {
        value: ScatterGraph.DEFAULT_INSET_VALUE,
        top: ScatterGraph.DEFAULT_INSET_VALUE,
        right: ScatterGraph.DEFAULT_INSET_VALUE,
        bottom: ScatterGraph.DEFAULT_INSET_VALUE,
        left: ScatterGraph.DEFAULT_INSET_VALUE,
    }

    static DEFAULT_STROKE = {
        color: 'currentColor',
        lineCap: 'round',
        lineJoin: 'round',
        width: 1.5,
        opacity: 1,
    }

    static DEFAULT_HALO = {
        color: '#fff',
        width: 3,
    }

    static DEFAULT_SCATTER = {
        title: null,
        r: ScatterGraph.DEFAULT_RADIUS,
        fill: 'none',
        inset: ScatterGraph.DEFAULT_INSET,
        stroke: ScatterGraph.DEFAULT_STROKE,
        halo: ScatterGraph.DEFAULT_HALO,
    }

    constructor(data, options) {
        super(options.margin, options.width, options.height)

        this.x = this.simpleMerge(this.x, options.x)
        this.y = this.simpleMerge(this.y, options.y)

        this.scatter = this.simpleMerge(ScatterGraph.DEFAULT_SCATTER, options.scatter)
        this.scatter.inset = this.simpleMerge(ScatterGraph.DEFAULT_INSET, options.scatter.inset)
        this.scatter.stroke = this.simpleMerge(ScatterGraph.DEFAULT_STROKE, options.scatter.stroke)
        this.scatter.halo = this.simpleMerge(ScatterGraph.DEFAULT_HALO, options.scatter.halo)

        // this.x.range = [this.margin.left + this.scatter.inset.left, this.width - this.margin.right - this.scatter.inset.right]
        // this.y.range = [this.height - this.margin.bottom - this.scatter.inset.bottom, this.margin.top + this.scatter.inset.top]

        console.log({x: this.x, y: this.y, scatter: this.scatter})

        if (data != null) this.load(data)
    }

    get type() {
        return ScatterGraph.TAG
    }

    load(data) {
        super.load(data)

        this.T = this.scatter.title == null ? null : d3.map(data, this.scatter.title)
        this.I = d3.range(this.X.length).filter(i => !isNaN(this.X[i]) && !isNaN(this.Y[i]))

        this.x.axis = d3.axisBottom(this.x.scale).ticks(this.width / 80, this.x.format).tickSizeOuter(0)
        this.y.axis = d3.axisLeft(this.y.scale).ticks(this.height / 50, this.y.format).tickSizeOuter(0)
    }

    async loadCSV(url) {
        await this.loadFromURL(url)
    }

    render() {
        this.createMainSVG()

        this.renderXAxes()
        this.renderYAxes()

        // this.renderTooltip()
        this.renderChart()

        return this.svg.node()
    }

    renderChart() {
        this.svg.append('g')
            .attr('fill', this.scatter.fill)
            .attr('stroke', this.scatter.stroke.color)
            .attr('stroke-width', this.scatter.stroke.width)
            .selectAll('circle')
            .data(this.I)
            .join('circle')
            .attr('cx', i => this.x.scale(this.X[i]))
            .attr('cy', i => this.y.scale(this.Y[i]))
            .attr('r', this.scatter.r)
    }
}