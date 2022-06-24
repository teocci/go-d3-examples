/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-14
 */
import D3Graph from './d3-graph.js'

export default class BubbleGraph extends D3Graph {
    static TAG = 'bubble'

    static DEFAULT_MIN_RANGE = 2
    static DEFAULT_MAX_RANGE = 30

    static DEFAULT_FILL = {
        color: '#ccc',
        opacity: .7,
    }

    static DEFAULT_STROKE = {
        color: 'currentColor',
        width: 1.5,
        opacity: 1
    }

    static DEFAULT_BUBBLE = {
        label: d => Object.values(d)[0],
        mapper: d => Object.values(d)[1],
        domain: null,
        range: [BubbleGraph.DEFAULT_MIN_RANGE, BubbleGraph.DEFAULT_MAX_RANGE],
        type: d3.scaleSqrt,
        scale: null,
        groups: null,
        group: null,
        title: null,
        link: null,
        linkTarget: '_blank',
        colors: d3.schemeTableau10,
        fill: BubbleGraph.DEFAULT_FILL,
        stroke: BubbleGraph.DEFAULT_STROKE,
        padding: 3,
        margin: 1,
    }

    constructor(data, options) {
        super(options.margin, options.width, options.height)

        this.x = this.simpleMerge(this.x, options.x)
        this.y = this.simpleMerge(this.y, options.y)

        this.bubble = this.simpleMerge(BubbleGraph.DEFAULT_BUBBLE, options.bubble)
        this.bubble.fill = this.simpleMerge(BubbleGraph.DEFAULT_FILL, options.bubble.fill)
        this.bubble.stroke = this.simpleMerge(BubbleGraph.DEFAULT_STROKE, options.bubble.stroke)

        if (data != null) this.load(data)
    }

    get type() {
        return BubbleGraph.TAG
    }

    load(data) {
        super.load(data)

        // Compute the values.
        this.D = d3.map(data, d => d)
        this.V = d3.map(data, this.bubble.mapper)
        this.G = this.bubble.group == null ? null : d3.map(data, this.bubble.group)

        this.bubble.domain = this.bubble.domain ?? d3.extent(this.V)
        this.bubble.scale = this.bubble.scale ?? this.bubble.type(this.bubble.domain, this.bubble.range)

        // Unique the groups.
        if (this.G && this.bubble.groups == null) this.bubble.groups = this.I.map(i => this.G[i])
        this.bubble.groups = this.G && new d3.InternSet(this.bubble.groups)

        // Compute labels and titles.
        this.L = this.bubble.label == null ? null : d3.map(data, this.bubble.label)
        this.T = this.bubble.title == null ? this.L : d3.map(data, this.bubble.title)

        console.log({x: this.x, y: this.y, bubble: this.bubble})

        this.color = this.G && d3.scaleOrdinal(this.bubble.groups, this.bubble.colors)

        this.root = d3.pack()
            .size([this.chart.width, this.chart.height])
            .padding(this.bubble.padding)
            (d3.hierarchy({children: this.I}).sum(i => this.V[i]))
    }

    render() {

        this.createMainSVG()

        this.renderXAxes()
        this.renderYAxes()

        this.renderChart()

        return Object.assign(this.svg.node(), {scales: {color: this.color}})
    }


    renderChart() {
        const leaf = this.svg.selectAll('a')
            .data(this.I)
            .join('a')
            .attr('xlink:href', this.bubble.link == null ? null : (d, i) => this.bubble.link(this.D[i], i, data))
            .attr('target', this.bubble.link == null ? null : this.bubble.linkTarget)
            .attr('transform', i => `translate(${this.x.scale(this.X[i])},${this.y.scale(this.Y[i])})`)

        leaf.append('circle')
            .attr('class', i => `bubble ${this.V[i]}`)
            .attr('r', i => this.bubble.scale(this.V[i]))
            .attr('stroke', this.bubble.stroke)
            .attr('stroke-width', this.bubble.stroke.width)
            .attr('stroke-opacity', this.bubble.stroke.opacity)
            .attr('fill', this.G ? i => this.color(this.G[i]) : this.bubble.fill == null ? 'none' : this.bubble.fill)
            .attr('fill-opacity', this.bubble.fill.opacity)

        if (this.T) leaf.append('title')
            .text(i => this.T[i])
    }
}