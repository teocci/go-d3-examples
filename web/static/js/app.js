/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-10
 */
import LineGraph from './plotter/line-graph.js'

const plot = document.getElementById('plot')

window.onload = () => {
    console.log('init')

    // load the external data
    d3.csv('https://gist.githubusercontent.com/teocci/d156e6eafbbe8ba4425ffb5d89b8605a/raw/c8b6371cca54fc0822cf327ce2b2989d5e753512/data.csv', d3.autoType).then(d => {
        const chart = new LineGraph(d, {
            x: d => d.date,
            y: d => d.close,
            yLabel: '↑ Daily close ($)',
            width: 720,
            height: 480,
            stroke: {color: 'blue',},
        })
        plot.appendChild(chart.render())
    })
}