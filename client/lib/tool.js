function empty(obj){
    if(obj === null) return true
    if(Object.keys(obj).length === 0) return true
    return false
}

export default {
    empty,
}