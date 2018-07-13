import React from 'react'
import tool from '../lib/tool'

const iconSize = 50

class Intro extends React.Component {
    constructor() {
        super()
    }

    render() {
        return <div className='jumbotron' style={{backgroundColor:tool.DIV_COLOR}}>
            <div className="media">
                <img src="logo.png" alt="Logo" className="mr-3 align-self-start" style={{ width: iconSize }} />
                <div className="media-body">
                    <h5>牛大车估值</h5>
                    <p>欢迎使用牛大车估值工具！输入股票代码，牛大车为您掂量掂量！</p>
                </div>
            </div>
        </div>
    }
}

export default Intro