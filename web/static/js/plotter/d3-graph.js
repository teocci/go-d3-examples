/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-13
 */

export default class D3Graph {
    static DEFAULT_MARGIN = {top: 20, right: 30, bottom: 30, left: 50}
    static DEFAULT_WIDTH = 640 // outer width, in pixels
    static DEFAULT_HEIGHT = 400 // outer height, in pixels

    static DEFAULT_X_VAR = {
        type: d3.scaleUtc,
        domain: null,
        range: [D3Graph.DEFAULT_MARGIN.left, D3Graph.DEFAULT_WIDTH - D3Graph.DEFAULT_MARGIN.right], // [left, right]
    }

    static DEFAULT_Y_VAR = {
        type: d3.scaleLinear, // the y-scale type
        domain: null, // [ymin, ymax]
        range: [D3Graph.DEFAULT_HEIGHT - D3Graph.DEFAULT_MARGIN.bottom, D3Graph.DEFAULT_MARGIN.top], // [bottom, top]
        format: null, // a format specifier string for the y-axis
        label: null, // 1a label for the y-axis
    }

    static DEFAULT_STROKE = {
        color: 'currentColor',
        lineCap: 'round',
        lineJoin: 'round',
        width: 1.5,
        opacity: 1
    }

    constructor(defined, margin, width, height) {
        this.X = null
        this.Y = null
        this.I = null
        this.D = null

        this.defined = defined ?? null

        this.margin = this.simpleMerge(D3Graph.DEFAULT_MARGIN, margin)
        this.plot = {
            width: width - this.margin.left - this.margin.right,
            height: height - this.margin.top - this.margin.bottom,
        }

        this.width = width ?? D3Graph.DEFAULT_WIDTH
        this.height = height ?? D3Graph.DEFAULT_HEIGHT

        this.x = D3Graph.DEFAULT_X_VAR
        this.y = D3Graph.DEFAULT_Y_VAR

        this.x.range = [this.margin.left, this.width - this.margin.right]
        this.y.range = [this.height - this.margin.bottom, this.margin.top]
    }

    async loadFromURL(url) {
        // load the external data
        const d = await d3.csv(url, d3.autoType)
        this.load(d)
    }

    load(data) {
        console.log({data, xMapper: this.x.mapper, yMapper: this.y.mapper})

        this.X = d3.map(data, this.x.mapper)
        this.Y = d3.map(data, this.y.mapper)
        this.I = d3.range(this.X.length)

        if (this.defined == null) this.defined = (d, i) => !isNaN(this.X[i]) && !isNaN(this.Y[i])
        this.D = d3.map(data, this.defined)

        console.log({X: this.X, Y: this.Y, I: this.I, D: this.D})

        // Compute default domains.
        if (this.x?.domain == null) this.x.domain = d3.extent(this.X)
        if (this.y?.domain == null) this.y.domain = [0, d3.max(this.Y)]

        // Construct scales and axes.
        this.xScale = this.x.type(this.x.domain, this.x.range)
        this.yScale = this.y.type(this.y.domain, this.y.range)

        this.xAxis = d3.axisBottom(this.xScale).ticks(this.width / 80).tickSizeOuter(0)
        this.yAxis = d3.axisLeft(this.yScale).ticks(this.height / 40, this.y.format)
    }

    simpleMerge(...objects) {
        return objects.reduce((p, o) => ({...p, ...o}), {})
    }
}