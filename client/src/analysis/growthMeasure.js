import React from 'react'
import tool from '../../lib/tool'
import macro from '../../lib/macro'
import { DataTable } from '../table'
import { connect } from 'react-redux'
import { BarChart } from '../chart'

class GrowthMeasure extends React.Component {
    constructor() {
        super()
        this.state = {
            health: macro.DATA_EMPTY,
            lose: {},
            measureData: null
        }
    }

    check() {
        const data = this.props.keyRatio
        if (tool.empty(data)) {
            this.state.health = macro.DATA_EMPTY
            return
        }
        const measureList = [
            'Cash Flow Ratios',
            'Book Value Per Share * CNY',
            'Earnings Per Share CNY'
        ]
        const lose = {}
        const measureData = {}
        for (let i = 0; i < measureList.length; i++) {
            let key = measureList[i]
            let value = data[key]
            if (!value || value.length === 0) {
                lose[key] = []
                continue
            }
            measureData[key] = i === 0 ? tool.sliceYearList(value).slice(0, -1) : tool.toNumList(value).slice(0, -1)
        }

        if (!tool.empty(lose)) {
            this.state.health = macro.DATA_LOSE
            this.state.lose = lose
            return
        }


        this.state.health = macro.DATA_PERFECT
        this.state.measureData = measureData
    }

    render() {
        this.check()
        const title = '成长性分析'
        const standard = '选取标准：Book Value与净利润稳定增长，成长趋势可预测'
        switch (this.state.health) {
            case macro.DATA_EMPTY:
                return null
            case macro.DATA_LOSE:
                return <DataTable warn title={title} desc='以下数据缺失:' data={this.state.lose} />
            case macro.DATA_PERFECT:
                const x = this.state.measureData['Cash Flow Ratios']
                const y1 = this.state.measureData['Book Value Per Share * CNY']
                const y2 = this.state.measureData['Earnings Per Share CNY']
                return <div className='jumbotron' style={{backgroundColor:tool.DIV_COLOR}}>
                    <h4>{title}</h4>
                    <p>{standard}</p>
                    <div className='row'>
                        <div className='col'>
                            <BarChart x={x} y={y1} title='每股净资产(M)' />
                        </div>
                        <div className='col'>
                            <BarChart x={x} y={y2} title='每股净利润(M)' />
                        </div>
                    </div>
                </div>
            default:
                return null
        }

    }
}

const mapStateToProps = (state) => {
    return {
        keyRatio: state.keyRatio
    }
}

export default connect(mapStateToProps)(GrowthMeasure)