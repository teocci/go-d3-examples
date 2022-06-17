/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-16
 */
import D3Graph from './d3-graph.js'

export default class ContourGraph extends D3Graph {
    static TAG = 'contour'

    static DEFAULT_RADIUS = 2
    static DEFAULT_INTERVAL = 10
    static DEFAULT_GRID_SIZE = 10
    static DEFAULT_GRID_N = ContourGraph.DEFAULT_GRID_SIZE
    static DEFAULT_GRID_M = ContourGraph.DEFAULT_GRID_SIZE
    static DEFAULT_PIXEL_SCALE = 40

    static DEFAULT_GRID = {
        n: ContourGraph.DEFAULT_GRID_N,
        m: ContourGraph.DEFAULT_GRID_M,
    }

    static DEFAULT_STROKE = {
        color: 'currentColor',
        linecap: 'round',
        linejoin: 'round',
        width: 1.5,
        opacity: 0.5,
    }

    static DEFAULT_HALO = {
        color: '#fff',
        width: 3,
    }

    static DEFAULT_CONTOUR = {
        title: null,
        r: ContourGraph.DEFAULT_RADIUS,
        interval: ContourGraph.DEFAULT_INTERVAL,
        mapper: (x, y) => Math.sin(x) ** 100 + Math.cos(10 + y * x) * Math.cos(x),
        // mapper: (x, y) => Math.exp(-(x ** 2 + 3 * y ** 2)),
        threshold: ([min, max], interval) => {
            console.log({min, max, interval})
            return d3.ticks(Math.round(min / interval) * interval, max, interval)
        },
        grid: ContourGraph.DEFAULT_GRID,
        fill: 'none',
        stroke: ContourGraph.DEFAULT_STROKE,
        halo: ContourGraph.DEFAULT_HALO,
        pixelScale: ContourGraph.DEFAULT_PIXEL_SCALE,
    }

    constructor(data, options) {
        super(options.margin, options.width, options.height)

        this.x = this.simpleMerge(this.x, options.x)
        this.y = this.simpleMerge(this.y, options.y)

        this.contour = this.simpleMerge(ContourGraph.DEFAULT_CONTOUR, options.contour)
        this.contour.grid = this.simpleMerge(ContourGraph.DEFAULT_GRID, options.contour.grid)
        this.contour.stroke = this.simpleMerge(ContourGraph.DEFAULT_STROKE, options.contour.stroke)
        this.contour.halo = this.simpleMerge(ContourGraph.DEFAULT_HALO, options.contour.halo)

        console.log({x: this.x, y: this.y, contour: this.contour})

        if (data != null) this.load(data)
    }

    get type() {
        return ContourGraph.TAG
    }

    load(data) {
        super.load(data)

        this.D = d3.map(this.I, i => ({x: this.X[i], y: this.Y[i]}))
        this.Z = d3.map(this.I, i => this.contour.mapper(this.X[i], this.Y[i]))

        console.log({D: this.D, Z: this.Z})

        this.T = this.contour.title == null ? null : d3.map(data, this.contour.title)

        const zRange = d3.extent(this.Z)
        const thresholds = this.contour.threshold(zRange, this.contour.interval)

        this.color = d3.scaleSequential(d3.extent(thresholds), d3.interpolateMagma)
        // this.color = d => d3.interpolateViridis((d - zRange[0]) / (zRange[1] - zRange[0]))

        console.log({thresholds, color: this.color})

        // Construct scales and axes.
        this.x.scale = this.x.type(this.x.domain, this.x.range).nice()
        this.y.scale = this.y.type(this.y.domain, this.y.range).nice()

        // Compute the contour polygons at log-spaced intervals; returns an array of MultiPolygon.
        this.contours = d3.contours()
            .thresholds(thresholds)
            .size([this.contour.grid.n, this.contour.grid.m])
            (this.Z)
    }

    transform(contours, scale) {
        return contours.map(({type, value, coordinates}) => ({
            type, value, coordinates: coordinates.map(
                rings => rings.map(points => points.map(([x, y]) => [x * scale, y * scale]))
            )
        }))
    }

    buildGrid() {
        const q = 4 // The level of detail, e.g., sample every 4 pixels in x and y.
        const x0 = -q / 2, x1 = this.width + 28 + q
        const y0 = -q / 2, y1 = this.height + q
        const n = Math.ceil((x1 - x0) / q)
        const m = Math.ceil((y1 - y0) / q)
        const grid = new Array(n * m)

        for (let j = 0; j < m; ++j) {
            for (let i = 0; i < n; ++i) {
                grid[j * n + i] = this.D[j * n + i]
            }
        }

        grid.x = -q
        grid.y = -q
        grid.k = q
        grid.n = n
        grid.m = m

        return grid
    }

    async loadCSV(url) {
        await this.loadFromURL(url)
    }

    render() {
        const svg = d3.create('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', [0, 0, this.width, this.height])
            .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')

        svg.append('g')
            .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
            .call(this.x.axis)
            .call(g => g.selectAll('.tick line').clone()
                .attr('y2', this.margin.top + this.margin.bottom - this.height)
                .attr('stroke-opacity', 0.1))
            .call(g => g.append('text')
                .attr('x', this.width)
                .attr('y', this.margin.bottom - 4)
                .attr('fill', 'currentColor')
                .attr('text-anchor', 'end')
                .text(this.x.label))

        svg.append('g')
            .attr('transform', `translate(${this.margin.left},0)`)
            .call(this.y.axis)
            .call(g => g.selectAll('.tick line').clone()
                .attr('x2', this.plot.width)
                .attr('stroke-opacity', 0.1))
            .call(g => g.append('text')
                .attr('x', -this.margin.left)
                .attr('y', 10)
                .attr('fill', 'currentColor')
                .attr('text-anchor', 'start')
                .text(this.y.label))

        if (this.T) svg.append('g')
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
            .attr('stroke', this.contour.halo.color)
            .attr('stroke-width', this.contour.halo.width)

        const data = this.transform(this.contours, this.contour.pixelScale)
        svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
            .attr('fill', this.contour.fill)
            .attr('stroke', this.contour.stroke.color)
            .attr('stroke-linejoin', this.contour.stroke.linejoin)
            .attr('stroke-opacity', this.contour.stroke.opacity)
            .selectAll('path')
            .data(data)
            .join('path')
            // .attr('stroke-width', (d, i) => i % 5 ? 0.25 : 1)
            .attr('fill', d => this.color(d.value))
            .attr('d', d3.geoPath())

        // svg.append('g')
        //     .attr('stroke', 'white')
        //     .selectAll('circle')
        //     .data(this.I)
        //     .join('circle')
        //     .attr('cx', i => this.x.scale(this.X[i]))
        //     .attr('cy', i => this.y.scale(this.Y[i]))
        //     .attr('r', this.contour.r)

        return svg.node()
    }
}