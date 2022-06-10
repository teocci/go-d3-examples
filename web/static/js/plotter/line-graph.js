/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-10
 */

import * as d3 from 'https://cdn.skypack.dev/d3@7'

export default class LineGraph {
    constructor(data, {
        x = ([x]) => x, // given d in data, returns the (temporal) x-value
        y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
        defined, // for gaps in data
        margin = {top: 20, right: 30, bottom: 30, left: 50}, // margin, in pixels
        width = 640, // outer width, in pixels
        height = 400, // outer height, in pixels
        curve = d3.curveLinear, // method of interpolation between points
        xVar = {
            type: d3.scaleUtc, // the x-scale type
            domain: null, // [xmin, xmax]
            range: [margin.left, width - margin.right], // [left, right]
        },
        yVar = {
            type: d3.scaleLinear, // the y-scale type
            domain: null, // [ymin, ymax]
            range: [height - margin.bottom, margin.top], // [bottom, top]
            format: null, // a format specifier string for the y-axis
            label: null, // 1a label for the y-axis
        },
        stroke = {color: 'currentColor', lineCap: 'round', lineJoin: 'round', width: 1.5, opacity: 1}, // stroke setup of line
    } = {}) {

        console.log({data})

        this.X = d3.map(data, x)
        this.Y = d3.map(data, y)
        this.I = d3.range(this.X.length)

        if (defined == null) this.defined = (d, i) => !isNaN(this.X[i]) && !isNaN(this.Y[i])
        this.D = d3.map(data, this.defined)
g
        console.log({X: this.X, Y: this.Y, I: this.I, D: this.D})

        this.xVar = xVar ?? {}
        this.yVar = yVar ?? {}

        // Compute default domains.
        if (xVar?.domain == null) this.xVar.domain = d3.extent(this.X)
        if (yVar?.domain == null) this.yVar.domain = [0, d3.max(this.Y)]

        this.margin = margin
        this.plotArea = {
            width: width - margin.left - margin.right,
            height: height - margin.top - margin.bottom,
        }

        this.width = width
        this.height = height
        this.curve = curve ?? d3.curveLinear
        this.stroke = stroke

        // Construct scales and axes.
        this.xScale = this.xVar.type(this.xVar.domain, xVar.range)
        this.yScale = this.yVar.type(this.yVar.domain, yVar.range)

        this.xAxis = d3.axisBottom(this.xScale).ticks(width / 80).tickSizeOuter(0)
        this.yAxis = d3.axisLeft(this.yScale).ticks(height / 40, yVar.format)
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
            .attr('transform', `translate(0,${this.plotArea.height + this.margin.top})`)
            .call(this.xAxis)
            .call(g => g.select('.domain').remove())

        svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', `translate(${this.margin.left}, 0)`)
            .call(this.yAxis)
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line').clone()
                .attr('x2', this.plotArea.width)
                .attr('stroke-opacity', 0.1))
            .call(g => g.append('text')
                .attr('x', -this.margin.left)
                .attr('y', 10)
                .attr('fill', 'currentColor')
                .attr('text-anchor', 'start')
                .text(this.yVar.label))

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