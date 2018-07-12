import React from 'react'
import axios from 'axios'
import pjson from '../../package.json'
import store from './store'
import DebtMeasure from './analysis/debtMeasure'
import GrowthMeasure from './analysis/growthMeasure'
import DCFMeasure from './analysis/dcfMeasure'
import macro from '../lib/macro';
import Search from './search'

class Entry extends React.Component {
    constructor() {
        super()
        this.state = {
            loading: false
        }
        this.ticker = undefined
        this.analysisState = [
            { name: 'quote', path: 'quote', open: true, pass: false, },
            { name: 'keyRatio', path: 'key_ratio', open: true, pass: false },
            { name: 'income', path: 'income_statement', open: true, pass: false },
            { name: 'balance', path: 'balance_sheet', open: true, pass: false },
            { name: 'cashflow', path: 'cashflow', open: true, pass: false },
        ]
        this.url = pjson.runOnServer ? "http://120.78.240.132:3000" : "http://localhost"
        this.clearState = this.clearState.bind(this)
    }

    clearState() {
        store.dispatch({ type: macro.STATE_CLEAR, payload: {} })
        for (let i = 0; i < this.analysisState.length; i++) {
            let state = this.analysisState[i]
            state.pass = false
        }
    }

    startAnalysis(ticker) {
        this.setState({ loading: true })
        this.ticker = ticker
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
        if (target)
            this.specifyAnalysis(target)
        else
            this.setState({ loading: false})
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
        axios.get(`${this.url}/${state.path}?ticker=${this.ticker}`).then(response => {
            const serverMsg = response.data
            const rawData = JSON.parse(serverMsg.msg)
            const dictData = this.rawData2Dict(rawData)
            store.dispatch({ type: state.name, payload: dictData })
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
            <Search
                startAnalysis={ticker => this.startAnalysis(ticker)}
                clearState={this.clearState}
                loading={this.state.loading}
            />
            <DebtMeasure />
            <GrowthMeasure />
            <DCFMeasure />
        </div>
    }
}

export default Entry
