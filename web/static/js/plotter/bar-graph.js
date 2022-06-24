/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-13
 */
import D3Graph from './d3-graph.js'

export default class BarGraph extends D3Graph {
    static TAG = 'bar'

    static DEFAULT_BAR = {
        color: 'currentColor',
        title: null,
        padding: .1,
    }

    constructor(data, options) {
        super(options.margin, options.width, options.height)

        this.x = this.simpleMerge(this.x, options.x)
        this.y = this.simpleMerge(this.y, options.y)

        this.bar = this.simpleMerge(BarGraph.DEFAULT_BAR, options.bar)

        console.log({x: this.x, y: this.y})

        if (data != null) this.load(data)
    }

    get type() {
        return BarGraph.TAG
    }

    load(data) {
        super.load(data)

        // Compute default domains.
        if (this.x.domain == null) this.x.domain = this.X
        if (this.y.domain == null) this.y.domain = [0, d3.max(this.Y)]
        if (this.x.sort != null) this.x.domain = d3.groupSort(data, this.x.sort.reducer, this.x.sort.indexer)

        this.x.domain = new d3.InternSet(this.x.domain)

        // Omit any data not present in the x-domain.
        this.I = d3.range(this.X.length).filter(i => this.x.domain.has(this.X[i]))

        // Construct scales and axes.
        this.x.scale = d3.scaleBand(this.x.domain, this.x.range).padding(this.bar.padding)
        this.y.scale = this.y.type(this.y.domain, this.y.range)

        this.x.axis = d3.axisBottom(this.x.scale).tickSizeOuter(0)
        this.y.axis = d3.axisLeft(this.y.scale).ticks(this.height / 40, this.y.format)

        if (this.bar.title == null) {
            const formatValue = this.y.scale.tickFormat(100, this.y.format)
            this.bar.title = i => `${this.X[i]}\n${formatValue(this.Y[i])}`
        } else {
            const O = d3.map(data, d => d)
            const T = this.bar.title
            this.bar.title = i => T(O[i], i, data)
        }
    }

    render() {
        this.createMainSVG()

        this.renderXAxes()
        this.renderYAxes()

        this.renderChart()

        return this.svg.node()
    }


    renderChart() {

        const bar = this.svg.append('g')
            .attr('fill', this.bar.color)
            .selectAll('rect')
            .data(this.I)
            .join('rect')
            .attr('x', i => this.x.scale(this.X[i]))
            .attr('y', i => this.y.scale(this.Y[i]))
            .attr('height', i => this.y.scale(0) - this.y.scale(this.Y[i]))
            .attr('width', this.x.scale.bandwidth())

        if (this.bar.title) bar.append('title').text(this.bar.title)


        this.svg.append('g')
            .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
            .call(this.x.axis);
    }
}