/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-14
 */
import D3Graph from './d3-graph.js'

export default class BubbleGraph extends D3Graph {
    static TAG = 'bubble'

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
        label: ([x]) => x,
        value: ([, y]) => y,
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

        this.bubble = this.simpleMerge(BubbleGraph.DEFAULT_BUBBLE, options.bubble)
        this.bubble.fill = this.simpleMerge(BubbleGraph.DEFAULT_FILL, options.bubble.fill)
        this.bubble.stroke = this.simpleMerge(BubbleGraph.DEFAULT_STROKE, options.bubble.stroke)

        if (data != null) this.load(data)
    }

    get type() {
        return BubbleGraph.TAG
    }

    load(raw) {
        const data = raw.filter(d => d.value !== null)

        // Compute the values.
        this.D = d3.map(data, d => d)
        this.V = d3.map(data, this.bubble.value)
        this.G = this.bubble.group == null ? null : d3.map(data, this.bubble.group)

        this.I = d3.range(this.V.length).filter(i => this.V[i] > 0)

        // Unique the groups.
        if (this.G && this.bubble.groups == null) this.bubble.groups = this.I.map(i => this.G[i])
        this.bubble.groups = this.G && new d3.InternSet(this.bubble.groups)

        // Compute labels and titles.
        this.L = this.bubble.label == null ? null : d3.map(data, this.bubble.label)
        this.T = this.bubble.title == null ? this.L : d3.map(data, this.bubble.title)

        this.root = d3.pack()
            .size([this.plot.width, this.plot.height])
            .padding(this.bubble.padding)
            (d3.hierarchy({children: this.I}).sum(i => this.V[i]))


        console.log({plot: this.plot})
    }

    render() {
        const color = this.G && d3.scaleOrdinal(this.bubble.groups, this.bubble.colors)

        const svg = d3.create('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', [-this.margin.left, -this.margin.top, this.width, this.height])
            .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
            .attr('fill', 'currentColor')
            .attr('font-size', 10)
            .attr('font-family', 'sans-serif')
            .attr('text-anchor', 'middle')

        const leaf = svg.selectAll('a')
            .data(this.root.leaves())
            .join('a')
            .attr('xlink:href', this.bubble.link == null ? null : (d, i) => this.bubble.link(this.D[d.data], i, data))
            .attr('target', this.bubble.link == null ? null : this.bubble.linkTarget)
            .attr('transform', d => `translate(${d.x},${d.y})`)

        leaf.append('circle')
            .attr('stroke', this.bubble.stroke)
            .attr('stroke-width', this.bubble.stroke.width)
            .attr('stroke-opacity', this.bubble.stroke.opacity)
            .attr('fill', this.G ? d => color(this.G[d.data]) : this.bubble.fill == null ? 'none' : this.bubble.fill)
            .attr('fill-opacity', this.bubble.fill.opacity)
            .attr('r', d => d.r)

        if (this.T) leaf.append('title')
            .text(d => this.T[d.data])

        if (this.L) {
            // A unique identifier for clip paths (to avoid conflicts).
            const uid = `O-${Math.random().toString(16).slice(2)}`;

            leaf.append('clipPath')
                .attr('id', d => `${uid}-clip-${d.data}`)
                .append('circle')
                .attr('r', d => d.r);

            leaf.append('text')
                .attr('clip-path', d => `url(${new URL(`#${uid}-clip-${d.data}`, location)})`)
                .selectAll('tspan')
                .data(d => `${this.L[d.data]}`.split(/\n/g))
                .join('tspan')
                .attr('x', 0)
                .attr('y', (d, i, D) => `${i - D.length / 2 + 0.85}em`)
                .attr('fill-opacity', (d, i, D) => i === D.length - 1 ? 0.7 : null)
                .text(d => d);
        }

        return Object.assign(svg.node(), {scales: {color}})
    }
}