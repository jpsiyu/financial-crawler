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
 * units: tr, bn, m, B, M
 */
const toMillion = (value) => {
    const v1 = value.slice(0, -1)
    const v2 = value.slice(0, -2)
    let res = 0
    if (value.match('tr'))
        res = parseFloat(v2) * 1000 * 1000
    else if (value.match('bn'))
        res = parseFloat(v2) * 1000
    else if (value.match('B'))
        res = parseFloat(v1) * 1000
    else if (value.match('m'))
        res = parseFloat(v1)
    else if (value.match('M'))
        res = parseFloat(v1)

    return res

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

const zeroList = (len) => {
    const l = []
    for(let i = 0; i < len; i++)
        l.push(0)
    return l
}

export default {
    empty,
    toNumList,
    sliceYearList,
    toMillion,
    toFloat,
    copy,
    zeroList,
}