import React from 'react'

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
        } else {
            this.props.clearState()
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
        return <img src="loading.gif"
            className="img-fluid"
            alt="loading..."
            width={loadingSize}
            height={loadingSize}
            style={{ marginLeft: 10 }}
        />
    }

    render() {
        return <div className="container">
            <div className='d-flex justify-content-left' style={{ marginTop: 50, marginBottom: 50 }}>
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
                        <input type="submit"
                            style={{ position: 'absolute', left: -9999, width: 1, height: 1 }}
                            tabIndex="-1" />
                    </div>
                </form>
            </div>
        </div>

    }
}

export default Search