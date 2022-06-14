/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-13
 */
import * as d3 from 'https://cdn.skypack.dev/d3@7'

export default class D3Graph {
    static DEFAULT_MARGIN = {top: 20, right: 30, bottom: 30, left: 50}
    static DEFAULT_WIDTH = 640 // outer width, in pixels
    static DEFAULT_HEIGHT = 400 // outer height, in pixels

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

    constructor(margin, width, height) {
        this.X = null
        this.Y = null
        this.I = null

        this.margin = this.simpleMerge(D3Graph.DEFAULT_MARGIN, margin)

        this.width = width ?? D3Graph.DEFAULT_WIDTH
        this.height = height ?? width ?? D3Graph.DEFAULT_HEIGHT

        this.plot = {
            width: this.width - this.margin.left - this.margin.right,
            height: this.height - this.margin.top - this.margin.bottom,
        }

        this.x = D3Graph.DEFAULT_X_VAR
        this.y = D3Graph.DEFAULT_Y_VAR

        this.x.range = [this.margin.left, this.width - this.margin.right]
        this.y.range = [this.height - this.margin.bottom, this.margin.top]

    }

    initToggle(svg) {
        this.tooltip = svg.append('g')
            .style('pointer-events', 'none')
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

        this.X = d3.map(data, this.x.mapper)
        this.Y = d3.map(data, this.y.mapper)
        this.I = d3.range(this.X.length)
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