import React from 'react'
import axios from 'axios'
import DataTable from './table.jsx'
import tool from '../lib/tool.js'

class Entry extends React.Component {
    constructor() {
        super()
        this.state = {
            quoteData: null
        }
        this.searchInput = null
        this.onBtnSearch = this.onBtnSearch.bind(this)
    }

    onBtnSearch(event) {
        event.preventDefault()
        console.log('onBtnSearch....', this.searchInput.value)
        axios.get('http://localhost/quote').then(response => {
            const serverMsg = response.data
            const quoteData = JSON.parse(serverMsg.msg)
            this.setState({
                quoteData:quoteData
            })
        }).catch(error => console.log('ERR:',error))
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

            <Quote quoteData={this.state.quoteData} />
        </div>
    }
}

const Quote = (props) =>{
    if(tool.empty(props.quoteData)){
        return null
    }else{
        return <DataTable quoteData={props.quoteData}/>
    }
}

export default Entry
