import React from 'react'
import axios from 'axios'
import pjson from '../../package.json'
import store from './store'
import DebtMeasure from './analysis/debtMeasure'
import GrowthMeasure from './analysis/growthMeasure'
import DCFMeasure from './analysis/dcfMeasure'

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

    clearState() {
        const newState = {}
        Object.keys(this.state).forEach(key => {
            newState[key] = null
        })
        this.setState(newState)
        for (let i = 0; i < this.analysisState.length; i++) {
            let state = this.analysisState[i]
            state.pass = false
        }
    }

    onBtnSearch(event) {
        event.preventDefault()
        this.clearState()
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
            console.log('Fetch All Data!')
        }
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
        const t = this.searchInput.value.trim()
        axios.get(`${this.url}/${state.path}?ticker=${t}`).then(response => {
            const serverMsg = response.data
            const rawData = JSON.parse(serverMsg.msg)
            const dictData = this.rawData2Dict(rawData)
            const newState = {}
            newState[state.name] = dictData
            store.dispatch({ type: state.name, payload: dictData })
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
            <div className='d-flex justify-content-left' style={{ marginTop: 50, marginBottom: 50 }}>
                <form onSubmit={this.onBtnSearch}>
                    <div className='form-group form-inline'>
                        <input type='text' placeholder='股票代码:'
                            className='form-control'
                            ref={element => this.searchInput = element}
                            required
                            style={{ width: 300 }}
                        />
                        <input type="submit"
                            style={{ position: 'absolute', left: -9999, width: 1, height: 1 }}
                            tabIndex="-1" />
                    </div>
                </form>
            </div>

            <DebtMeasure />
            <GrowthMeasure />
            <DCFMeasure />
        </div>
    }
}

export default Entry
