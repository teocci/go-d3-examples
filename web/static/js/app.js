/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-10
 */
import LineGraph from './plotter/line-graph.js'
import WidgetModule from './widget/widget-module.js'

const aaplURL = 'https://gist.githubusercontent.com/teocci/d156e6eafbbe8ba4425ffb5d89b8605a/raw/c8b6371cca54fc0822cf327ce2b2989d5e753512/data.csv'

window.onload = () => {
    console.log('init')

    widgetModule = WidgetModule.instance

    const chart = new LineGraph(null, {
        x: {mapper: d => d.date},
        y: {mapper: d => d.close, label: '↑ Daily close ($)',},
        width: 720,
        height: 480,
        stroke: {color: 'blue',},
    })
    chart.loadCSV(aaplURL).then(r => widgetModule.render(chart))

}