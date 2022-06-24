/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-13
 */
export default class D3Graph {
    static DEFAULT_MARGIN = {top: 20, right: 30, bottom: 30, left: 50}
    static DEFAULT_WIDTH = 640 // outer width, in pixels
    static DEFAULT_HEIGHT = 400 // outer height, in pixels

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

    static DEFAULT_X_VAR = {
        mapper: ([x]) => x, // given d in data, returns the (quantitative) x-value
        type: d3.scaleLinear, // type of x-scale
        domain: null, // [xmin, xmax]
        range: [D3Graph.DEFAULT_MARGIN.left, D3Graph.DEFAULT_WIDTH - D3Graph.DEFAULT_MARGIN.right], // [left, right]
        scale: null, // function to compute x-scale
        axis: null, // function to compute x-axis ticks
        sort: null, // function to short x-values
        label: null, // a label for the x-axis
        format: null, // a format specifier string for the x-axis
    }

    static DEFAULT_Y_VAR = {
        mapper: ([, y]) => y, // given d in data, returns the (quantitative) y-value
        type: d3.scaleLinear, // the y-scale type
        domain: null, // [ymin, ymax]
        range: [D3Graph.DEFAULT_HEIGHT - D3Graph.DEFAULT_MARGIN.bottom, D3Graph.DEFAULT_MARGIN.top], // [bottom, top]
        scale: null, // function to compute y-scale
        axis: null, // function to compute y-axis ticks
        sort: null, // function to short y-values
        label: null, // a label for the y-axis
        format: null, // a format specifier string for the y-axis
    }

    static DEFAULT_CHART = {
        title: null,
        stroke: D3Graph.DEFAULT_STROKE,
        halo: D3Graph.DEFAULT_HALO,
    }

    constructor(margin, width, height) {
        this.X = null
        this.Y = null
        this.I = null

        this.margin = this.simpleMerge(D3Graph.DEFAULT_MARGIN, margin)

        this.width = width ?? D3Graph.DEFAULT_WIDTH
        this.height = height ?? width ?? D3Graph.DEFAULT_HEIGHT

        this.chart = {
            width: this.width - this.margin.left - this.margin.right,
            height: this.height - this.margin.top - this.margin.bottom,
        }

        this.chart = this.simpleMerge(D3Graph.DEFAULT_CHART, this.chart)
        this.chart.stroke = this.simpleMerge(D3Graph.DEFAULT_STROKE, this.chart.stroke)
        this.chart.halo = this.simpleMerge(D3Graph.DEFAULT_HALO, this.chart.halo)

        this.x = D3Graph.DEFAULT_X_VAR
        this.y = D3Graph.DEFAULT_Y_VAR

        this.x.range = [this.margin.left, this.width - this.margin.right]
        this.y.range = [this.height - this.margin.bottom, this.margin.top]
    }

    initToggle() {
        this.tooltip = this.svg.append('g').style('pointer-events', 'none')
    }

    async loadCSV(url) {
        await this.loadFromURL(url)
    }

    async loadFromURL(url) {
        // load the external data
        const d = await d3.csv(url, d3.autoType)
        this.load(d)
    }

    load(data) {
        console.log({data, xMapper: this.x.mapper, yMapper: this.y.mapper})

        this.loadXY(data)

        // Compute titles.
        this.computeTitles()

        // Compute default domains.
        this.computeDomains()

        // Construct scales and axes.
        this.constructScales()
        this.constructAxes()
    }

    loadXY(data) {
        this.X = d3.map(data, this.x.mapper)
        this.Y = d3.map(data, this.y.mapper)

        this.O = d3.map(data, d => d)
        this.I = d3.map(data, (_, i) => i)

        console.log({X: this.X, Y: this.Y, I: this.I})
    }

    computeDomains() {
        this.x.domain = this.x.domain ?? d3.extent(this.X)
        this.y.domain = this.y.domain ?? d3.extent(this.Y)
    }

    constructScales() {
        this.x.scale = this.x.type(this.x.domain, this.x.range)
        this.y.scale = this.y.type(this.y.domain, this.y.range)
    }

    constructAxes() {
        this.x.axis = d3.axisBottom(this.x.scale).tickSizeOuter(0)
        this.y.axis = d3.axisLeft(this.y.scale).tickSizeOuter(0)

        this.x.topAxis = d3.axisTop().scale(this.x.scale).tickSize(0).tickValues([])
        this.y.rightAxis = d3.axisRight().scale(this.y.scale).tickSize(0).tickValues([])
    }

    computeTitles() {
        if (this.chart.title == null) {
            this.chart.title = i => `${this.X[i]}\n${this.Y[i]}`
        } else {
            this.O = d3.map(data, d => d)
            this.T = this.chart.title
            this.chart.title = i => this.T(this.O[i], i, data)
        }
    }

    createMainSVG() {
        this.svg = d3.create('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', [0, 0, this.width, this.height])
            .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10)
            .style('-webkit-tap-highlight-color', 'transparent')
            .style('overflow', 'visible')
    }

    renderXAxes() {
        const axis = this.svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${this.chart.height + this.margin.top})`)
            .call(this.x.axis)
            .call(g => g.selectAll('.tick line').clone()
                .attr('y2', -this.chart.height)
                .attr('stroke-opacity', 0.1))

        if (this.x.label != null) {
            axis.call(g => g.append('text')
                .attr('x', this.width)
                .attr('y', this.margin.bottom - 4)
                .attr('fill', 'currentColor')
                .attr('text-anchor', 'end')
                .text(this.x.label))
        }

        this.svg.append('g')
            .attr('transform', `translate(0, ${this.margin.top})`)
            .call(this.x.topAxis)
    }

    renderYAxes() {
        const axis = this.svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', `translate(${this.margin.left},0)`)
            .call(this.y.axis)
            .call(g => g.selectAll('.tick line').clone()
                .attr('x2', this.chart.width)
                .attr('stroke-opacity', 0.1))

        if (this.y.label != null) {
            axis.call(g => g.append('text')
                .attr('x', -this.margin.left)
                .attr('y', 10)
                .attr('fill', 'currentColor')
                .attr('text-anchor', 'start')
                .text(this.y.label))
        }

        this.svg.append('g')
            .attr('transform', `translate(${this.chart.width + this.margin.left}, 0)`)
            .call(this.y.rightAxis)
    }

    //TODO
    renderTooltip() {
        if (this.T) this.svg.append('g')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .selectAll('text')
            .data(this.I)
            .join('text')
            .attr('dx', 7)
            .attr('dy', '0.35em')
            .attr('x', i => this.x.scale(this.X[i]))
            .attr('y', i => this.y.scale(this.Y[i]))
            .text(i => this.T[i])
            .call(text => text.clone(true))
            .attr('fill', 'none')
            .attr('stroke', this.chart.halo.color)
            .attr('stroke-width', this.chart.halo.width)
    }

    simpleMerge(...objects) {
        return objects.reduce((p, o) => ({...p, ...o}), {})
    }

    mergeOptions(...objects) {
        const extended = {}
        const length = objects.length
        let deep = false
        let i = 0

        // Check if a deep merge
        const isBoolean = b => 'boolean' === typeof b
        if (isBoolean(objects[0])) {
            deep = objects[0]
            i++
        }

        // Loop through each object and conduct a merge
        for (; i < length; i++) {
            const object = objects[i]
            this.mergeObject(extended, object, deep)
        }

        return extended
    }

    // Merge the object into the extended object
    mergeObject(extended, object, deep) {
        for (const prop in object) {
            if (object.hasOwnProperty(prop)) {
                // If deep merge and property is an object, merge properties
                const isObject = o => o?.constructor === Object
                if (deep && isObject(object[prop])) {
                    extended[prop] = this.mergeOptions(true, extended[prop], object[prop])
                } else {
                    extended[prop] = object[prop]
                }
            }
        }
    }
}