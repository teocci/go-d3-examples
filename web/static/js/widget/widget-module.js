/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-10
 */
export default class WidgetModule {
    static get instance() {
        this._instance = this._instance ?? new WidgetModule()

        return this._instance
    }

    constructor(element) {
        this.placeholder = element ?? null

        this.initElements()
    }

    render(chart) {
        if (chart == null) throw new Error('InvalidChart: null chart')

        const node = chart.render()
        this.placeholder.appendChild(node)
    }

    initElements() {
        this.placeholder = document.getElementById('plot')
    }
}