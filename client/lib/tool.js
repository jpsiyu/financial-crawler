import React from 'react'

const DIV_COLOR = 'rgb(250,250,250)'
const TABLE_COLOR = 'white'
const DIV_COLOR_WARN = 'rgb(255,255,200)'
const CHART_COLOR = 'white'
const BG_COLOR = 'white'

const empty = (obj) => {
    if (!obj) return true
    if (Object.keys(obj).length === 0) return true
    return false
}

const toNumList = (list) => {
    if (!list) return []
    let newList = []
    for (let i = 0; i < list.length; i++) {
        let value = list[i]
        newList.push(toFloat(value))
    }
    return newList
}

const sliceYearList = (list) => {
    let newList = []
    for (let i = 0; i < list.length; i++) {
        let value = list[i]
        newList.push(parseInt(value.slice(0, 4)))
    }
    return newList
}

/**
 * units: tr, bn, m
 */
const toMillion = (value) => {
    let v = value.slice(0, -2)
    let u = value.slice(-2)
    if (value.match('tr'))
        return parseFloat(v) * 1000 * 1000
    else if (value.match('bn'))
        return parseFloat(v) * 1000
    else if (value.match('m'))
        return parseFloat(v)
}

const toFloat = (value, d = 2) => {
    if (value == '' || isNaN(value)) return 0
    return parseFloat(value).toFixed(2) * 1
}

export default {
    empty,
    toNumList,
    sliceYearList,
    toMillion,
    DIV_COLOR,
    DIV_COLOR_WARN,
    TABLE_COLOR,
    CHART_COLOR,
    BG_COLOR,
    toFloat,
}