import React from 'react'
import tool from '../lib/tool'
import {Intro} from './small'
import {connect} from 'react-redux'

const loadingSize = 30

class Search extends React.Component {
    constructor() {
        super()
        this.state = {
            inputTips: null
        }
        this.searchInput = null
        this.onBtnSearch = this.onBtnSearch.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    onBtnSearch(event) {
        event.preventDefault()
        if (this.checkInput()) {
            const ticker = this.searchInput.value.trim()
            this.props.startAnalysis(ticker)
            if(!this.props.common.searched) this.props.actionSearch()
        }
    }

    onChange(event) {
        const input = this.searchInput.value
        let pass = false
        if (isNaN(input) || input.length > 6) {
            this.setState({ inputTips: '输入股票代码6位数字，如: 000423' })
        } else {
            this.setState({ inputTips: null })
            pass = true
        }
        return pass
    }


    checkInput(event) {
        const input = this.searchInput.value
        let pass = false
        if (isNaN(input) || input.length != 6) {
            this.setState({ inputTips: '输入股票代码6位数字，如: 000423' })
        } else {
            this.setState({ inputTips: null })
            pass = true
        }
        return pass
    }

    conditionImg() {
        if (!this.props.loading) return null
        return <img src="loading2.gif"
            className="img-fluid"
            alt="loading..."
            width={loadingSize}
            height={loadingSize}
            style={{ marginLeft: 10 }}
        />
    }

    render() {
        return <div className='jumbotron mt-3' style={{ backgroundColor: tool.DIV_COLOR}}>
            <Intro />
            <div className='d-flex justify-content-left' >
                <form onSubmit={this.onBtnSearch}>
                    <div className='form-group form-inline'>
                        <input type='text' placeholder='股票代码:'
                            className='form-control'
                            ref={element => this.searchInput = element}
                            onChange={this.onChange}
                            required
                            style={{ width: 300 }} />
                        {this.conditionImg()}
                    </div>
                    <div className='form-group'>
                        <span className="badge badge-danger">{this.state.inputTips}</span>
                    </div>
                </form>
            </div>
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
        actionSearch: () => { dispatch({type:'searched', payload:null})} 
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)