import React from 'react'
import macro from '../lib/macro'
import { Intro } from './small'
import { connect } from 'react-redux'

const tickerTips = '支持沪深市场，股票代码6位数字，如: 000423'

class Search extends React.Component {
    constructor() {
        super()
        this.state = {
            inputTips: null
        }
        this.inputRef = React.createRef()
        this.onBtnSearch = this.onBtnSearch.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    onBtnSearch(event) {
        event.preventDefault()
        if (this.checkInput()) {
            const ticker = this.inputRef.current.value.trim()
            this.props.startAnalysis(ticker)
            if (!this.props.common.searched) this.props.actionSearch()
        }
    }

    onChange(event) {
        const input = this.inputRef.current.value
        let pass = false
        if (isNaN(input) || input.length > 6) {
            this.setState({ inputTips: tickerTips })
        } else {
            this.setState({ inputTips: null })
            pass = true
        }
        return pass
    }


    checkInput(event) {
        const input = this.inputRef.current.value
        let pass = false
        if (isNaN(input) || input.length != 6) {
            this.setState({ inputTips: tickerTips })
        } else {
            this.setState({ inputTips: null })
            pass = true
        }
        return pass
    }

    render() {
        return <div className='search'>
            <Intro />
            <div className='form' onSubmit={this.onBtnSearch}>
                <p className='placeholder'>股票代码:</p>
                <input type='text' ref={this.inputRef} onChange={this.onChange} required />
                <button onClick={this.onBtnSearch}>评估</button>
            </div>
            {this.state.inputTips ? this.renderTips() : null}
        </div>
    }

    renderTips() {
        return <div className='tips'>
            <p>{this.state.inputTips}</p>
        </div>
    }
}
const mapStateToProps = (state) => {
    return {
        common: state.common
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actionSearch: () => { dispatch({ type: macro.ActionSearch, payload: null }) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)