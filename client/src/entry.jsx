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
        }
        this.searchInput = null
        this.onBtnSearch = this.onBtnSearch.bind(this)
    }

    onBtnSearch(event) {
        event.preventDefault()
        this.analyPipeline()
    }

    analyPipeline(){
        this.quoteAnalysis()
    }

    quoteAnalysis(){
        axios.get('http://localhost/quote').then(response => {
            const serverMsg = response.data
            const quote = JSON.parse(serverMsg.msg)
            this.setState({
                quote:quote
            })
        }).catch(error => console.log('ERR:',error))
        .then(this.keyRatioAnalysis())
    }

    keyRatioAnalysis(){
        axios.get('http://localhost/key_ratio').then(response => {
            const serverMsg = response.data
            const keyRatio = JSON.parse(serverMsg.msg)
            this.setState({
                keyRatio
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

export default Entry
