import React from 'react'
import macro from '../lib/macro'
import { connect } from 'react-redux'

const Intro = (props) => {
    const iconSize = 50
    return <div>
        <div className="media mb-1">
            <img src="logo.png" alt="Logo" className="mr-3 align-self-start" style={{ width: iconSize }} />
            <div className="media-body">
                <h5 className='mt-2'>牛大车估值</h5>
            </div>
        </div>
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

const Hello = () => {
    const size = 300
    return <div className='jumbotron' style={{ backgroundColor: macro.DIV_COLOR }}>
        <img src='welcome.gif' style={{ width: size, margin: 'auto', display: 'block' }} />
    </div>
}

class TickerName extends React.Component {
    render() {
        const tickerInfo = this.props.common.tickerInfo
        if (!tickerInfo) return null
        return <div className='jumbotron' style={{ backgroundColor: macro.DIV_COLOR , color:macro.FontGray}} >
            <span className='d-inline-block'>
                <h4>{tickerInfo.tickerName}</h4>
            </span>
            <span className='d-inline-block ml-3'>
                <p>{tickerInfo.ticker}</p>
            </span>
        </div>

    }
}
const TickerNameWrap = connect((state) => { return { common: state.common } })(TickerName)
export {
    Intro,
    NoData,
    Hello,
    TickerNameWrap,
}