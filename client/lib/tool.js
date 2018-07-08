const empty = (obj) => {
    if (obj === null) return true
    if (Object.keys(obj).length === 0) return true
    return false
}

const toNumList = (list) => {
    let newList = []
    for (let i = 0; i < list.length; i++) {
        let value = list[i]
        if (isNaN(value) || value == '')
            newList.push(0)
        else
            newList.push(parseFloat(value))
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

const toMillion = (value) => {
    let v = value.slice(0, -1)
    let u = value.slice(-1)
    if(u == 'B')
        return parseFloat(v) * 1000
    else if(u == 'M')
        return parseFloat(v)
}

export default {
    empty,
    toNumList,
    sliceYearList,
    toMillion,
}