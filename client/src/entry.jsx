import React from 'react'
import axios from 'axios'
import { DataTable, TransformTable } from './table.jsx'
import tool from '../lib/tool.js'
import pjson from '../../package.json'
import { BarChart, LineChart } from './chart.jsx'
import { DCFAnalysis } from './dcf.jsx'

class Entry extends React.Component {
    constructor() {
        super()
        this.state = {
            quote: null,
            keyRatio: null,
            income: null,
            balance: null,
            cashflow: null,
            dcfData: null,
        }
        this.analysisState = [
            { name: 'quote', path: 'quote', open: true, pass: false, },
            { name: 'keyRatio', path: 'key_ratio', open: true, pass: false },
            { name: 'income', path: 'income_statement', open: true, pass: false },
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
        } else {
            this.receiveAllData()
            console.log('Analysis Finish!')
        }
    }

    receiveAllData() {
        const beta = parseFloat(this.state.quote['Beta'][0])
        const marketEquity = tool.toMillion(this.state.quote['Market Cap.'][0])
        const marketDebt = 0

        const data = {}
        data['Provision for income taxes'] = tool.toNumList(this.state.income['Provision for income taxes'])
        data['Income before taxes'] = tool.toNumList(this.state.income['Income before taxes'])
        const len = data['Provision for income taxes'].length
        let rateSum = 0
        for(let i=0; i < len; i++){
            let taxPay = data['Provision for income taxes'][i]
            let income = data['Income before taxes'][i]
            let rate = taxPay / income
            rateSum += rate
        }
        const taxRate = parseFloat((rateSum / len).toFixed(2))
        
        const fcf = {}
        fcf['Year'] = this.state.cashflow['Fiscal year ends in December. CNY in millions except per share data.']
        fcf['Free cash flow'] = this.state.cashflow['Free cash flow']
        fcf['Year'] = tool.sliceYearList(fcf['Year'].slice(0, -1))
        fcf['Free cash flow'] = tool.toNumList(fcf['Free cash flow'].slice(0, -1))

        const dcfData = {beta, marketEquity, marketDebt, taxRate, fcf}
        this.setState({dcfData})
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

            <DebtMeasure data={this.state.balance} />

            <div className='row'>
                <div className='col'>
                    <ConditionChart
                        data={this.state.keyRatio}
                        xkey='Cash Flow Ratios'
                        ykey='Book Value Per Share * CNY'
                        title='每股净资产(M)'
                    />
                </div>
                <div className='col'>
                    <ConditionChart
                        data={this.state.keyRatio}
                        xkey='Cash Flow Ratios'
                        ykey='Earnings Per Share CNY'
                        title='每股净利润(M)'
                    />
                </div>
            </div>

{/*
            <div className='row'>
                <div className='col'>
                    <ConditionChart
                        data={this.state.cashflow}
                        xkey='Fiscal year ends in December. CNY in millions except per share data.'
                        ykey='Free cash flow'
                        title='自由现金流(M)'
                    />
                </div>
                <div className='col'>
                    <ConditionChart
                        data={this.state.cashflow}
                        xkey='Fiscal year ends in December. CNY in millions except per share data.'
                        ykey='Free cash flow'
                        title='自由现金流(M)'
                        line
                    />
                </div>
            </div>
*/}

            <DCFAnalysis data={this.state.dcfData} />
        </div>
    }
}

const DebtMeasure = (props) => {
    if (tool.empty(props.data)) {
        return null
    } else {
        const measureList = [
            'Fiscal year ends in December. CNY in millions except per share data.',
            'Short-term debt',
            'Other long-term liabilities',
            "Total stockholders' equity",
            'Total current assets',
            'Total current liabilities'
        ]
        let measureData = {}
        for (let i = 0; i < measureList.length; i++) {
            let k = measureList[i]
            if (i == 0)
                measureData['Year'] = tool.sliceYearList(props.data[k])
            else
                measureData[k] = tool.toNumList(props.data[k])
        }

        for (let i = 0; i < measureData['Short-term debt'].length; i++) {
            if (i == 0) {
                measureData['债务权益比'] = []
                measureData['流动比率'] = []
            }
            let debtOnEquity =
                (measureData['Short-term debt'][i] + measureData['Other long-term liabilities'][i])
                / measureData["Total stockholders' equity"][i]
            measureData['债务权益比'][i] = debtOnEquity.toFixed(2)

            let currentRatio = measureData['Total current assets'][i] / measureData['Total current liabilities'][i]
            measureData['流动比率'][i] = currentRatio.toFixed(2)
        }
        return <TransformTable title='权益与负债(M)' data={measureData} />
    }
}


const ConditionChart = (props) => {
    if (tool.empty(props.data))
        return null
    else {
        const x = props.data[props.xkey].slice(0, -1)
        const y = props.data[props.ykey].slice(0, -1)
        return props.line ?
            <LineChart x={x} y={y} title={props.title} /> :
            <BarChart x={x} y={y} title={props.title} />

    }
}

export default Entry
