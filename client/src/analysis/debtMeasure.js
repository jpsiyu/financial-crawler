import React from 'react'
import tool from '../lib/tool'
import macro from '../lib/macro'
import {TransformTable, DataTable} from '../widget/table'
import {connect} from 'react-redux'
import {NoData} from '../widget/small'

class DebtMesure extends React.Component {
    constructor() {
        super()
        this.state = {
            health: macro.DATA_EMPTY,
            lose: {},
            measureData: null 
        }
    }

    check() {
        const data = this.props.balance
        if (tool.empty(data)) {
            this.state.health = macro.DATA_EMPTY
            return
        }

        const measureList = [
            'Fiscal year ends in December. CNY in millions except per share data.',
            'Short-term debt',
            'Long-term debt',
            "Total stockholders' equity",
            'Total current assets',
            'Total current liabilities'
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
            if (i == 0)
                measureData['Year'] = tool.sliceYearList(data[key])
            else
                measureData[key] = tool.toNumList(data[key])
        }
        // replace with 0 if not exist
        const replaceList = ['Long-term debt']
        const dataLen = measureData[Object.keys(measureData)[0]].length
        replaceList.forEach( key => {
            delete lose[key]
            measureData[key] = tool.zeroList(dataLen)
        })

        if (!tool.empty(lose)) {
            this.state.health = macro.DATA_LOSE
            this.state.lose = lose
            return
        }

        for (let i = 0; i < measureData['Short-term debt'].length; i++) {
            if (i == 0) {
                measureData['Total Debt'] = []
                measureData['Debt on Equity'] = []
                measureData['Current Ratio'] = []
            }
            const totalDebt = (measureData['Short-term debt'][i] + measureData['Long-term debt'][i])
            const debtOnEquity = totalDebt == 0 ? 0 : totalDebt / measureData["Total stockholders' equity"][i]
            measureData['Total Debt'][i] = tool.toFloat(totalDebt)
            measureData['Debt on Equity'][i] = tool.toFloat(debtOnEquity)

            const currentRatio = measureData['Total current assets'][i] / measureData['Total current liabilities'][i]
            measureData['Current Ratio'][i] = currentRatio.toFixed(2)
        }
        this.state.health = macro.DATA_PERFECT
        this.state.measureData = measureData
    }

    render() {
        this.check()
        const title = '权益与负债(M)'
        const standard = '选取标准：1.债务权益比 < 0.5; 2.流动比率 > 1.5'
        switch (this.state.health) {
            case macro.DATA_EMPTY:
                return <NoData title={title} />
            case macro.DATA_LOSE:
                return <DataTable warn title={title} desc='以下数据缺失:' data={this.state.lose}/>
            case macro.DATA_PERFECT:
                return <TransformTable title={title} desc={standard} data={this.state.measureData} />
            default:
                return null
        }
    }
}

const mapStateToProps = (state) => {
    return {
        balance: state.balance
    }
}
export default connect(mapStateToProps)(DebtMesure)