/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-10
 */

import * as d3 from 'https://cdn.skypack.dev/d3@7'
import D3Graph from './d3-graph.js'

export default class LineGraph extends D3Graph {
    static TAG = 'line'

    constructor(data, options) {
        super(options.defined, options.margin, options.width, options.height)

        this.x = this.simpleMerge(D3Graph.DEFAULT_X_VAR, options.x)
        this.y = this.simpleMerge(D3Graph.DEFAULT_Y_VAR, options.y)

        this.curve = options.curve ?? d3.curveLinear
        this.stroke = this.simpleMerge(D3Graph.DEFAULT_STROKE, options.stroke)

        console.log({x: this.x, y: this.y})

        if (data != null) this.load(data)
    }

    async loadCSV(url) {
        await this.loadFromURL(url)
    }

    render() {
        // Construct a line generator.
        const line = d3.line()
            .curve(this.curve)
            .defined(i => this.D[i])
            .x(i => this.xScale(this.X[i]))
            .y(i => this.yScale(this.Y[i]))

        const svg = d3.create('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', [0, 0, this.width, this.height])
            .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${this.plot.height + this.margin.top})`)
            .call(this.xAxis)
            .call(g => g.select('.domain').remove())

        svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', `translate(${this.margin.left}, 0)`)
            .call(this.yAxis)
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

        svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', this.stroke.color)
            .attr('stroke-width', this.stroke.width)
            .attr('stroke-linecap', this.stroke.lineCap)
            .attr('stroke-linejoin', this.stroke.lineJoin)
            .attr('stroke-opacity', this.stroke.opacity)
            .attr('d', line(this.I));

        return svg.node()
    }
}