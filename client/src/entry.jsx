import React from 'react'
import axios from 'axios'
import DataTable from './table.jsx'
import tool from '../lib/tool.js'

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
        this.searchInput = null
        this.onBtnSearch = this.onBtnSearch.bind(this)
        this.axiosConfig = {headers: {"Access-Control-Allow-Origin": "*"}}
        this.url = 'http://120.78.240.132:3000'
    }

    onBtnSearch(event) {
        event.preventDefault()
        this.analyPipeline()
    }

    analyPipeline(){
        this.quoteAnalysis()
    }

    quoteAnalysis(){
        axios.get(`${this.url}/quote`, this.axiosConfig).then(response => {
            const serverMsg = response.data
            const quote = JSON.parse(serverMsg.msg)
            this.setState({
                quote:quote
            })
        }).catch(error => console.log('ERR:',error))
        .then(this.keyRatioAnalysis())
    }

    keyRatioAnalysis(){
        axios.get(`${this.url}/key_ratio`, this.axiosConfig).then(response => {
            const serverMsg = response.data
            const keyRatio = JSON.parse(serverMsg.msg)
            this.setState({
                keyRatio
            })
        }).catch(error => console.log('ERR:',error))
        .then(this.incomeAnalysis())
    }

    incomeAnalysis(){
        axios.get(`${this.url}/income_statement`, this.axiosConfig).then(response => {
            const serverMsg = response.data
            const income = JSON.parse(serverMsg.msg)
            this.setState({
                income
            })
        }).catch(error => console.log('ERR:',error))
        .then(this.balanceAnalysis())
    }

    balanceAnalysis(){
        axios.get(`${this.url}/balance_sheet`, this.axiosConfig).then(response => {
            const serverMsg = response.data
            const balance = JSON.parse(serverMsg.msg)
            this.setState({
                balance
            })
        }).catch(error => console.log('ERR:',error))
        .then(this.cashflowAnalysis())
    }

    cashflowAnalysis(){
        axios.get(`${this.url}/cashflow`, this.axiosConfig).then(response => {
            const serverMsg = response.data
            const cashflow = JSON.parse(serverMsg.msg)
            this.setState({
                cashflow
            })
        }).catch(error => console.log('ERR:',error))
        .then(console.log('analyse finish...'))
    }

    render() {
        return <div className="container">
            <div className="row align-items-center">
                <div className="col-6 mx-auto">
                    <form onSubmit={this.onBtnSearch}>
                        <div className='form-group form-inline'>
                            <input type='text' placeholder='Enter Ticker Symbol'
                                className='form-control'
                                ref={ element => this.searchInput = element}
                                required
                            />
                            <button type='submit' className='btn btn-primary'>Search</button>
                        </div>
                    </form>
                </div>
            </div>

            <Quote quote={this.state.quote} />
            <KeyRatio keyRatio={this.state.keyRatio} />
            <IncomeStatement income={this.state.income} />
            <BalanceSheet balance={this.state.balance} />
            <Cashflow cashflow={this.state.cashflow} />
        </div>
    }
}

const Quote = (props) => {
    if(tool.empty(props.quote)){
        return null
    }else{
        return <DataTable data={props.quote}/>
    }
}

const KeyRatio = (props) => {
    if(tool.empty(props.keyRatio)){
        return null
    }else{
        return <DataTable data={props.keyRatio}/>
    }
}

const IncomeStatement = (props) => {
    if(tool.empty(props.income)){
        return null
    }else{
        return <DataTable data={props.income}/>
    }
}

const BalanceSheet = (props) => {
    if(tool.empty(props.balance)){
        return null
    }else{
        return <DataTable data={props.balance}/>
    }
}

const Cashflow = (props) => {
    if(tool.empty(props.cashflow)){
        return null
    }else{
        return <DataTable data={props.cashflow}/>
    }
}
export default Entry
