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
    const size = 400
    const desc = '数据尚未采集'
    return <div className='jumbotron' style={{ backgroundColor: macro.DIV_COLOR_WARN }}>
        <h4>{props.title}</h4>
        <p>{desc}</p>
        <img className='img-fluid' src='nodata.gif' style={{ width: size }} />
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