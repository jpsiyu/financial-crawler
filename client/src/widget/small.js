import React from 'react'
import macro from '../lib/macro'
import { connect } from 'react-redux'

const Intro = (props) => {
    return <div className='intro'>
        <img src='logo.png' />
        <p>牛大车估值</p>
    </div>
}

const NoData = (props) => {
    const desc = '数据尚未采集'
    return <div className='nodata section'>
        <h3 className='title'>{props.title}</h3>
        <p>{desc}</p>
        <img className='img-fluid' src='nodata.gif' />
    </div>

}

class TickerName extends React.Component {
    render() {
        const tickerInfo = this.props.common.tickerInfo
        if (!tickerInfo) return null
        return <div className='ticker section'>
            <p>{tickerInfo.tickerName}</p>
            <p>({tickerInfo.ticker})</p>
        </div>
    }
}
const TickerNameWrap = connect((state) => { return { common: state.common } })(TickerName)
export {
    Intro,
    NoData,
    TickerNameWrap,
}