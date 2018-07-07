import React from 'react'
import axios from 'axios'
import DataTable from './table.jsx'
import tool from '../lib/tool.js'
import pjson from '../../package.json'
import Chart from './chart.jsx'

class Entry extends React.Component {
    constructor() {
        super()
        this.state = {
            quote: null,
            keyRatio: null,
            income: null,
            balance: null,
            cashflow: null,
        }
        this.analysisState = [
            { name: 'quote', path: 'quote', open: false, pass: false, },
            { name: 'keyRatio', path: 'key_ratio', open: true, pass: false },
            { name: 'income', path: 'income_statement', open: false, pass: false },
            { name: 'balance', path: 'balance_sheet', open: true, pass: false },
            { name: 'cashflow', path: 'cashflow', open: true, pass: false },
        ]
        this.searchInput = null
        this.onBtnSearch = this.onBtnSearch.bind(this)
        this.url = pjson.runOnServer ? "http://120.78.240.132:3000" : "http://localhost"
    }

    onBtnSearch(event) {
        event.preventDefault()
        this.analysisLoop()
    }

    analysisLoop() {
        let target = null
        for (let i = 0; i < this.analysisState.length; i++) {
            let state = this.analysisState[i]
            if (state.open && !state.pass) {
                target = state
                break
            }
        }
        if (target) {
            this.specifyAnalysis(target)
        } else
            console.log('Analysis Finish!')
    }

    analysisPass(name) {
        for (let i = 0; i < this.analysisState.length; i++) {
            let state = this.analysisState[i]
            if (state.name == name) {
                state.pass = true
                break
            }
        }
    }

    specifyAnalysis(state) {
        axios.get(`${this.url}/${state.path}`).then(response => {
            const serverMsg = response.data
            const rawData = JSON.parse(serverMsg.msg)
            const dictData = this.rawData2Dict(rawData)
            const newState = {}
            newState[state.name] = dictData
            this.setState(newState)
            this.analysisPass(state.name)
            this.analysisLoop()
        }).catch(error => console.log('ERR:', error))
    }

    rawData2Dict(rawData) {
        let d = {}
        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i]
            d[row[0]] = row.slice(1)
        }
        return d
    }

    render() {
        return <div className="container">
            <div className="row align-items-center">
                <div className="col-6 mx-auto">
                    <form onSubmit={this.onBtnSearch}>
                        <div className='form-group form-inline'>
                            <input type='text' placeholder='Enter Ticker Symbol'
                                className='form-control'
                                ref={element => this.searchInput = element}
                                required
                            />
                            <button type='submit' className='btn btn-primary'>Search</button>
                        </div>
                    </form>
                </div>
            </div>

            {/*
            <ConditionTable title='Quote Info' data={this.state.quote} />
            <ConditionTable title='Income Statement' data={this.state.income} />
            <ConditionTable title='Balance Sheet' data={this.state.balance} />
            <ConditionTable title='Cashflow' data={this.state.cashflow} />
            <ConditionTable title='Key Ratio' data={this.state.keyRatio} />
            */}

            <DebtMeasure data={this.state.balance} />

            <div className='row'>
                <div className='col'>
                    <ConditionChart
                        data={this.state.keyRatio}
                        xkey='Cash Flow Ratios'
                        ykey='Book Value Per Share * CNY'
                        title='每股净资产'
                    />
                </div>
                <div className='col'>
                    <ConditionChart
                        data={this.state.keyRatio}
                        xkey='Cash Flow Ratios'
                        ykey='Earnings Per Share CNY'
                        title='每股净利润'
                    />
                </div>
            </div>
            <ConditionChart
                data={this.state.cashflow}
                xkey='Fiscal year ends in December. CNY in millions except per share data.'
                ykey='Free cash flow'
                title='自由现金流'
            />
        </div>
    }
}

const DebtMeasure = (props) => {
    if(tool.empty(props.data)){
        return null
    }else{
        const measureList = [
            'Fiscal year ends in December. CNY in millions except per share data.',
            'Short-term debt', 
            'Other long-term liabilities', 
            "Total stockholders' equity", 
            'Total current assets',
            'Total current liabilities'
        ]
        let measureData = {}
        for(let i=0; i < measureList.length; i++){
            let k = measureList[i]
            measureData[k] = props.data[k]
        }
        return <DataTable title='权益与负债' data={measureData} />
    }
}

const ConditionTable = (props) => {
    if (tool.empty(props.data)) {
        return null
    } else {
        return <DataTable title={props.title} data={props.data} />
    }
}

const ConditionChart = (props) => {
    if (tool.empty(props.data))
        return null
    else {
        const x = props.data[props.xkey].slice(0, -1)
        const y = props.data[props.ykey].slice(0, -1)
        return <Chart x={x} y={y} title={props.title} />

    }
}

export default Entry
