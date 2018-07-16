import React from 'react'
import { TransformTable, DataTable } from '../widget/table'
import { BarAndBarChart } from '../widget/chart'
import macro from '../lib/macro'
import { NoData } from '../widget/small'
import DcfCalculator from './dcfCalculator'

class DCFMeasure extends React.Component {
    constructor() {
        super()
        this.dcfCalculator = new DcfCalculator()
        this.onMethodChange = this.onMethodChange.bind(this)
        this.onDurationChange = this.onDurationChange.bind(this)
        this.state = {
            method: macro.MethodRegression,
            duration: macro.Duration5,
        }
    }

    analysis() {
        const report = this.dcfCalculator.settingReport()
        const predictData = this.state.method === macro.MethodRegression ?
            this.dcfCalculator.predictRegression(this.state.duration) : 
            this.dcfCalculator.predictOperatingGrowth(this.state.duration)

        const fcfReport = {
            'Year': predictData.futureX,
            'Predict': predictData.futureY,
            'Terminal': [],
            'Sum Predict Terminal': [],
            'Sum Discount': [],
        }
        this.dcfCalculator.fillFcfReport(fcfReport)

        const valuationReport = this.dcfCalculator.valuationReport(fcfReport)

        return <div>
            <TransformTable data={report} title='DCF模型参数' />
            <PredictChart
                method={this.state.method}
                onMethodChange={this.onMethodChange}
                predictData={predictData}
                duration={this.state.duration}
                onDurationChange={this.onDurationChange}
            />
            <TransformTable data={fcfReport} title='现金流预测(M)' />
            <TransformTable data={valuationReport} title='估值计算' />
        </div>

    }

    onMethodChange(event) {
        this.setState({
            method: event.target.value
        })
    }

    onDurationChange(event){
        this.setState({
            duration: parseInt(event.target.value)
        })
    }

    render() {
        this.dcfCalculator.startAnalyse()
        const title = '自由现金流分析'
        switch (this.dcfCalculator.health) {
            case macro.DATA_EMPTY:
                return <NoData title={title} />
            case macro.DATA_LOSE:
                return <DataTable warn title={title} desc='以下数据缺失:' data={this.dcfCalculator.lose} />
            case macro.DATA_PERFECT:
                return this.analysis()
            default:
                return null
        }
    }
}

const PredictChart = (props) => {
    const chartTitle = '现金流线性回归预测'
    const bar1Title = '自由现金流(M)'
    const bar2Title = props.method === macro.MethodRegression ? '自由现金流线性回归' : '自由现金流均值增长'

    return <div className='jumbotron' style={{ backgroundColor: macro.DIV_COLOR }} >
        <h4>{chartTitle}</h4>
        <div className='row'>
            <div className='col-md-5'>

                <div className="input-group " >
                    <div className="input-group-prepend">
                        <label className="input-group-text" htmlFor="inputGroupSelect01">预测方法</label>
                    </div>

                    <select className="custom-select"
                        id="inputGroupSelect01"
                        onChange={props.onMethodChange}>

                        <option value={macro.MethodRegression}>自由现金流线性回归</option>
                        <option value={macro.MethodCAGR}>营业利润复合增长率</option>
                    </select>
                </div>

                <div className="input-group " >
                    <div className="input-group-prepend">
                        <label className="input-group-text" htmlFor="inputGroupSelect02">预测时长</label>
                    </div>

                    <select className="custom-select"
                        id="inputGroupSelect02"
                        onChange={props.onDurationChange}>

                        <option value={macro.Duration5}>未来5年</option>
                        <option value={macro.Duration10}>未来10年</option>
                    </select>
                </div>
            </div>
            <div className='col-md-7'>
                <BarAndBarChart
                    x={props.predictData.fullX}
                    y={props.predictData.fullHistoryY}
                    y2={props.predictData.fullPredictY}
                    title={bar1Title}
                    title2={bar2Title}
                />
            </div>
        </div>
    </div>
}

export default DCFMeasure