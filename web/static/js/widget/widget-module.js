/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-10
 */
import LineGraph from '../plotter/line-graph.js'
import BarGraph from '../plotter/bar-graph.js'
import BubbleGraph from '../plotter/bubble-graph.js'
import ScatterGraph from '../plotter/scatter-graph.js'
import ContourGraph from '../plotter/contour-graph.js'

export default class WidgetModule {
    static CHART_LIST = [
        {type: LineGraph.TAG, url: AAPL_URL},
        {type: BarGraph.TAG, url: ALPHABET_URL},
        {type: BubbleGraph.TAG, url: COUNTRIES_URL},
        {type: ScatterGraph.TAG, url: DRIVING_URL},
        {type: ContourGraph.TAG, url: FAITHFUL_URL},
    ]

    static get instance() {
        this._instance = this._instance ?? new WidgetModule()

        return this._instance
    }

    constructor(element) {
        this.$holder = element ?? null

        this.charts = new Map()

        this.initElements()
        this.initListeners()
        this.initCharts()
    }

    initElements() {
        this.$holder = document.getElementById('plot')
        this.$btnDAll = document.getElementById('btn-dall-png')
    }

    initListeners() {
        this.$btnDAll.onclick = () => {
            const items = [...document.querySelectorAll('svg')]

            for (const item of items) {
                const svg = item.cloneNode(true) // clone your original svg
                svg.setAttribute('width', item.clientWidth) // set svg to be the g dimensions
                svg.setAttribute('height', item.clientHeight)

                const svgAsXML = (new XMLSerializer).serializeToString(svg)
                const svgURI = `data:image/svg+xml,${encodeURIComponent(svgAsXML)}`
                // const svgURI = `data:image/svg+xml;base64,${btoa(svgAsXML)}`
                const output = {'name': 'chart-image.png', 'width': item.clientWidth, 'height': item.clientHeight}

                const img = new Image()
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    [canvas.width, canvas.height] = [output.width, output.height]
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, output.width, output.height)

                    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality
                    const a = document.createElement('a')
                    const quality = 1.0
                    a.style.setProperty('display', 'none')
                    a.href = canvas.toDataURL('image/png', quality)
                    a.download = output.name
                    a.append(canvas)
                    a.click()
                    a.remove()
                }
                img.src = svgURI
            }

            // const link = document.createElement('a')
            // link.style.setProperty('display', 'none')
            // document.body.appendChild(link)
            // link.setAttribute('href', svgData)
            // link.setAttribute('download', 'image.svg')
            // link.click()
        }
    }

    initCharts() {
        WidgetModule.CHART_LIST.forEach(c => {
            let chart
            switch (c.type) {
                case LineGraph.TAG:
                    chart = new LineGraph(null, {
                        x: {mapper: d => d.date},
                        y: {mapper: d => d.close, label: '↑ 일일 마감($)'},
                        width: 1440,
                        height: 960,
                        line: {stroke: {color: '#36a2eb'}},
                    })
                    break
                case BarGraph.TAG:
                    chart = new BarGraph(null, {
                        x: {
                            mapper: d => d.letter,
                            sort: {
                                reducer: ([d]) => -d.frequency,
                                indexer: d => d.letter,
                            },
                        },
                        y: {mapper: d => d.frequency, label: '↑ 빈도', format: '%'},
                        width: 1440,
                        height: 960,
                        bar: {color: '#36a2eb'},
                    })
                    break
                case BubbleGraph.TAG:
                    chart = new BubbleGraph(null, {
                        x: {
                            mapper: d => d.gdp,
                            label: '1인당 GDP →',
                        },
                        y: {
                            mapper: d => d.life,
                            label: '↑ 기대 수명(년)',
                        },
                        width: 1440,
                        height: 960,
                        bubble: {
                            mapper: d => d.population,
                            group: d => d.continent,
                            title: d => `${d.country}`,
                        },
                    })
                    break
                case ScatterGraph.TAG:
                    chart = new ScatterGraph(null, {
                        x: {
                            mapper: d => d.miles,
                            label: '주행 마일(1인당 연간) →',
                        },
                        y: {
                            mapper: d => d.gas,
                            label: '↑ 가스 가격(갤런당, 조정된 평균 $)',
                            format: '.2f',
                        },
                        width: 1440,
                        height: 960,
                        scatter: {
                            title: d => d.year,
                            stroke: {color: '#36a2eb'},
                        },
                    })
                    break
                case ContourGraph.TAG:
                    chart = new ContourGraph(null, {
                        x: {
                            mapper: d => d.waiting,
                            label: '유휴(최소) →',
                        },
                        y: {
                            mapper: d => d.eruptions,
                            label: '↑ 분출(최소)',
                        },
                        width: 1440,
                        height: 960,
                        contour: {
                            stroke: {
                                color: 'black',
                                linejoin: 'round',
                            },
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

        this.$holder.appendChild(node)
    }
}