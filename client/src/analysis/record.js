import tool from '../lib/tool'

class Record {
    constructor(data) {
        this.data = data
    }

    replaceZeros(num){
        if(this.isEmpty()){
            this.data = tool.zeroList(num)
        }
    }

    isEmpty() {
        return !this.data || this.data.length === 0 || this.data[0] === '-'
    }

    first() {
        return this.data[0]
    }

    firstAsNum(toMillion = false) {
        if (toMillion)
            return tool.toMillion(this.data[0])
        else
            return tool.toFloat(this.data[0])
    }

    removeAllHeadSymbol(){
        const newData = [] 
        this.data.forEach(d => {
            const nd = d.slice(1)
            newData.push(nd)
        })
        this.data = newData
    }

    last() {
        return this.data[this.data.length - 1]
    }

    lastAsNum() {
        return tool.toFloat(this.data[this.data.length - 1])
    }

    asNum(){
        return tool.toNumList(this.data)
    }

    sliceLast() {
        return this.data.slice(0, -1)
    }

    sliceLastAsNum() {
        return tool.toNumList(this.data.slice(0, -1))
    }

    sliceLastAsYear() {
        return tool.sliceYearList(this.data.slice(0, -1))
    }
}

class RecordManager {
    constructor() {
        this.records = {}
    }

    add(key, record) {
        this.records[key] = record
    }

    get(key) {
        return this.records[key]
    }

    getLose() {
        const lose = {}
        Object.keys(this.records).forEach(key => {
            const r = this.records[key]
            if (r.isEmpty())
                lose[key] = []
        })
        return lose
    }

    all() {
        return this.records
    }
}

export {Record, RecordManager}