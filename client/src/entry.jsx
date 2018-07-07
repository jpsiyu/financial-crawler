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
            { name: 'keyRatio', path: 'key_ratio', open: false, pass: false },
            { name: 'income', path: 'income_statement', open: false, pass: false },
            { name: 'balance', path: 'balance_sheet', open: false, pass: false },
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

    rawData2Dict(rawData){
        let d = {}
        for(let i = 0; i < rawData.length; i++){
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

            <ConditionTable title='Quote Info' data={this.state.quote} />
            <ConditionTable title='Key Ratio' data={this.state.keyRatio} />
            <ConditionTable title='Income Statement' data={this.state.income} />
            <ConditionTable title='Balance Sheet' data={this.state.balance} />
            <ConditionTable title='Cashflow' data={this.state.cashflow} />
            <ConditionChart data={this.state.cashflow} />
        </div>
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
        const x = props.data['Fiscal year ends in December. CNY in millions except per share data.']
        const y = props.data['Free cash flow']
        return <Chart x={x} y={y} title='自由现金流' />

    }
}

export default Entry
