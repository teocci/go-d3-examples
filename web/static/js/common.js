/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-10
 */

function serialize(o) {
    return JSON.stringify(o)
}

function unserialize(s) {
    return JSON.parse(s)
}

function simpleMerge(...objects) {
    return objects.reduce((p, o) => ({...p, ...o}), {})
}

function addPadding(n, length = null) {
    return String(n).padStart(length ?? 2, '0')
}

function serializeDate() {
    const now = new Date()
    return `${now.getFullYear()}${addPadding(now.getMonth() + 1)}${addPadding(now.getDate())}${addPadding(now.getHours())}${addPadding(now.getMinutes())}`
}

function rand(min, max) {
    return Math.random() * (max - min) + min
}

function truncate(n, p) {
    return Math.trunc(n * Math.pow(10, p)) / Math.pow(10, p)
}

function round(n, p) {
    return Math.trunc((n + Number.EPSILON) * Math.pow(10, p)) / Math.pow(10, p)
}

function distanceFormatter(d, precision = 2) {
    const rx = /\.0+$|(\.\d*[1-9])0+$/;
    const lookup = [
        {value: 1, symbol: ""},
        {value: 1e3, symbol: "k"},
        {value: 1e6, symbol: "M"},
        {value: 1e9, symbol: "G"},
        {value: 1e12, symbol: "T"},
        {value: 1e15, symbol: "P"},
        {value: 1e18, symbol: "E"}
    ]
    const item = lookup.slice().reverse().find(item => d >= item.value) ?? {value: 1, symbol: ""}
    const val = (d / item.value).toFixed(precision).replace(rx, '$1')

    return `${val} ${item.symbol}m`
}