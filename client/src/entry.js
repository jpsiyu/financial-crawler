import React from 'react'
import axios from 'axios'
import pjson from '../../package.json'
import DebtMeasure from './analysis/debtMeasure'
import GrowthMeasure from './analysis/growthMeasure'
import DCFMeasure from './analysis/dcfMeasure'
import macro from './lib/macro';
import Search from './widget/search'
import { connect } from 'react-redux'
import { Hello, TickerNameWrap } from './widget/small'

class Entry extends React.Component {
    constructor() {
        super()
        this.state = {
            loading: false,
        }
        this.ticker = undefined
        this.analysisState = [
            { name: 'quote', path: 'quote', open: true, pass: false, },
            { name: 'keyRatio', path: 'key_ratio', open: true, pass: false },
            { name: 'income', path: 'income_statement', open: true, pass: false },
            { name: 'balance', path: 'balance_sheet', open: true, pass: false },
            { name: 'cashflow', path: 'cashflow', open: true, pass: false },
        ]
        this.url = pjson.production ? pjson.url : "http://localhost"
        this.clearState = this.clearState.bind(this)
    }

    clearState() {
        this.props.actionClear()
        for (let i = 0; i < this.analysisState.length; i++) {
            let state = this.analysisState[i]
            state.pass = false
        }
    }

    getTickerName(ticker) {
        axios.get(`${this.url}/ticker_name?ticker=${ticker}`).then(response => {
            const serverMsg = response.data
            const info = JSON.parse(serverMsg.msg)

            if (info.tickerName) {
                this.props.actionTickername(info)
            }
        }).catch(error => console.log('ERR:', error))

    }

    startAnalysis(ticker) {
        this.getTickerName(ticker)
        this.getTickerName(ticker)
        this.setState({ loading: true })
        this.clearState()
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
            this.setState({ loading: false })
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
            this.props.actionReceive(state.name, dictData)
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
        if (this.props.common.searched) {
            return <div className="container">
                <Search startAnalysis={ticker => this.startAnalysis(ticker)} loading={this.state.loading} />
                <TickerNameWrap />
                <DebtMeasure />
                <GrowthMeasure />
                <DCFMeasure />
            </div>
        } else {
            return <div className="container">
                <Search startAnalysis={ticker => this.startAnalysis(ticker)} loading={this.state.loading} />
                <Hello />
            </div>
        }
    }
}

const mapStateToProps = (state) => {
    return {
        common: state.common
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actionTickername: (tickerInfo) => dispatch({type:macro.ActionTickerInfo, payload:tickerInfo}),
        actionReceive: (name, dictData) => dispatch({ type: name, payload: dictData }),
        actionClear: () => dispatch({ type: macro.ActionStateClear, payload: {} })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Entry)
