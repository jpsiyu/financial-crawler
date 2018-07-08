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
        newList.push(value.slice(0, 4))
    }
    return newList
}


export default {
    empty,
    toNumList,
    sliceYearList,
}