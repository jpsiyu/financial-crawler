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
    return parseFloat(value).toFixed(d) * 1
}

const copy = (obj, add) => {
    const target = {}
    Object.keys(obj).forEach( key => {
        target[key] = obj[key]
    }) 
    Object.keys(add).forEach( key => {
        target[key] = add[key]
    })
    return target
}

export default {
    empty,
    toNumList,
    sliceYearList,
    toMillion,
    toFloat,
    copy,
}