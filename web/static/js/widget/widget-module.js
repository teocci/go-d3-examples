/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-10
 */
import LineGraph from '../plotter/line-graph.js'
import BarGraph from '../plotter/bar-graph.js'
import BubbleGraph from '../plotter/bubble-graph.js'
import ScatterGraph from '../plotter/scatter-graph.js'

export default class WidgetModule {
    static CHART_LIST = [
        {type: LineGraph.TAG, url: AAPL_URL},
        {type: BarGraph.TAG, url: ALPHABET_URL},
        {type: BubbleGraph.TAG, url: FLARE_URL},
        {type: ScatterGraph.TAG, url: DRIVING_URL},
    ]

    static get instance() {
        this._instance = this._instance ?? new WidgetModule()

        return this._instance
    }

    constructor(element) {
        this.placeholder = element ?? null

        this.charts = new Map()

        this.initElements()
        this.initCharts()
    }

    initElements() {
        this.placeholder = document.getElementById('plot')
    }

    initCharts() {
        WidgetModule.CHART_LIST.forEach(c => {
            let chart
            switch (c.type) {
                case LineGraph.TAG:
                    chart = new LineGraph(null, {
                        x: {mapper: d => d.date},
                        y: {mapper: d => d.close, label: '↑ Daily close ($)',},
                        width: 720,
                        height: 480,
                        line: {stroke: {color: 'blue',},},
                    })
                    break
                case BarGraph.TAG:
                    chart = new BarGraph(null, {
                        x: {
                            mapper: d => d.letter,
                            sort: {
                                reducer: ([d]) => -d.frequency,
                                indexer: d => d.letter
                            },
                        },
                        y: {mapper: d => d.frequency, label: '↑ Frequency', format: '%',},
                        width: 720,
                        height: 480,
                        bar: {color: 'blue',},
                    })
                    break
                case BubbleGraph.TAG:
                    chart = new BubbleGraph(null, {
                        width: 1152,
                        bubble: {
                            label: d => [...d.id.split('.').pop().split(/(?=[A-Z][a-z])/g), d.value.toLocaleString('en')].join('\n'),
                            value: d => d.value,
                            group: d => d.id.split('.')[1],
                            title: d => `${d.id}\n${d.value.toLocaleString('en')}`,
                        },
                    })
                    break
                case ScatterGraph.TAG:
                    chart = new ScatterGraph(null, {
                        x: {
                            mapper: d => d.miles,
                            label: "Miles driven (per capita per year) →",
                        },
                        y: {
                            mapper: d => d.gas,
                            label: '↑ Price of gas (per gallon, adjusted average $)',
                            format: '.2f',
                        },
                        width: 1200,
                        height: 720,
                        scatter: {
                            title: d => d.year,
                            stroke: {color: 'steelblue'}
                        },
                    })
                    break
                default:
                    throw new Error(`InvalidChartType: ${c.type} not supported`)
            }

            this.charts.set(c.type, chart)

            chart.loadCSV(c.url).then(r => this.render(chart))
        })
    }

    render(chart) {
        if (chart == null) throw new Error('InvalidChart: null chart')

        console.log(`Start rendering: ${chart.type}`)
        const node = chart.render()
        console.log(`Rendering done: ${chart.type}`)

        this.placeholder.appendChild(node)
    }
}