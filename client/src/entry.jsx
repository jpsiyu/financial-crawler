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
            { name: 'quote', open:false, callback: this.quoteAnalysis.bind(this), pass: false, },
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
            target.callback()
        }else
            console.log('Analysis Finish!')
    }

    analysisPass(name){
        for(let i = 0; i < this.analysisState.length; i++){
            let state = this.analysisState[i]
            if(state.name == name){
                state.pass = true
                break
            }
        }
    }

    quoteAnalysis() {
        axios.get(`${this.url}/quote`).then(response => {
            const serverMsg = response.data
            const quote = JSON.parse(serverMsg.msg)
            this.setState({
                quote: quote
            })
            this.analysisPass('quote')
            this.analysisLoop()
        }).catch(error => console.log('ERR:', error))
    }

    keyRatioAnalysis() {
        axios.get(`${this.url}/key_ratio`).then(response => {
            const serverMsg = response.data
            const keyRatio = JSON.parse(serverMsg.msg)
            this.setState({
                keyRatio
            })
    }

        axios.get(`${this.url}/income_statement`).then(response => {
            const serverMsg = response.data
            const income = JSON.parse(serverMsg.msg)
            this.setState({
                income
            })
    }

        axios.get(`${this.url}/balance_sheet`).then(response => {
            const serverMsg = response.data
            const balance = JSON.parse(serverMsg.msg)
            this.setState({
                balance
            })
    }

        axios.get(`${this.url}/cashflow`).then(response => {
            const serverMsg = response.data
            const cashflow = JSON.parse(serverMsg.msg)
            this.setState({
                cashflow
            })
    }

    render() {
        return <div className="container">
            <div className="row align-items-center">
                <div className="col-6 mx-auto">
                    <form onSubmit={this.onBtnSearch}>
                        <div className='form-group form-inline'>
                            <input type='text' placeholder='Enter Ticker Symbol'
                                className='form-control'
                                required
                            />
                            <button type='submit' className='btn btn-primary'>Search</button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    }
}

        return null
    }else{
    }
}

        return null

    }
}

export default Entry
