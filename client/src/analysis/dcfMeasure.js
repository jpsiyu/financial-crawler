import React from 'react'
import { TransformTable, DataTable } from '../table'
import { BarChart, BarAndLineChart } from '../chart'
import regression from 'regression'
import tool from '../../lib/tool';
import { connect } from 'react-redux';
import macro from '../../lib/macro'
import {NoData} from '../small'

class DCFMeasure extends React.Component {
    constructor() {
        super()
        this.riskFree = 0.036
        this.riskPremium = 0.035
        this.perpetuityGrowth = 0.03
        this.state = {
            health: macro.DATA_EMPTY,
            lose: {},
            measureData: null
        }
    }

    modelInit() {
        const debt = this.state.measureData['Short-term debt'] + this.state.measureData['Other long-term liabilities']

        const len = this.state.measureData['Provision for income taxes'].length
        let rateSum = 0
        for (let i = 0; i < len; i++) {
            let taxPay = this.state.measureData['Provision for income taxes'][i]
            let income = this.state.measureData['Income before taxes'][i]
            let rate = taxPay / income
            rateSum += rate
        }
        const taxRate = tool.toFloat((rateSum / len))

        this.beta = this.state.measureData['Beta']
        this.taxRate = taxRate
        this.marketEquity = this.state.measureData['Market Cap.']
        this.marketDebt = debt
        this.fcfPass = {
            'Year': this.state.measureData['Year'],
            'Free cash flow': this.state.measureData['Free cash flow']
        }
        this.shareOutstanding = this.state.measureData['Shares Outstanding']
    }

    costOfEquity() {
        const res = this.riskFree + this.riskPremium * this.beta
        return parseFloat(res.toFixed(4))
    }

    costOfDebtPreTax() {
        return 0.03
    }

    costOfDebtAfterTax() {
        const preTax = this.costOfDebtPreTax()
        const afterTax = preTax * (1 - this.taxRate)
        return parseFloat(afterTax.toFixed(4))
    }

    wacc() {
        const res = (this.marketEquity * this.costOfEquity() + this.marketDebt * this.costOfDebtAfterTax()) /
            (this.marketEquity + this.marketDebt)
        return parseFloat(res.toFixed(4))
    }

    predict(num = 5) {
        let data = []
        for (let i = 0; i < this.fcfPass['Year'].length; i++) {
            data.push([this.fcfPass['Year'][i], this.fcfPass['Free cash flow'][i]])
        }
        const result = regression.linear(data)
        const k = result.equation[0]
        const b = result.equation[1]
        const startYear = parseInt(this.fcfPass['Year'][0])
        const lastYear = parseInt(this.fcfPass['Year'][this.fcfPass['Year'].length - 1])
        const endYear = lastYear + num

        const predictData = {
            regressionX: [],
            regressionY: [],
            historyY: [],
            futureX: [],
            futureY: [],
        }
        for (let i = startYear, j = 0; i <= endYear; i++ , j++) {
            predictData.regressionX.push(i)
            let predictValue = parseFloat((k * i + b).toFixed(2))
            predictData.regressionY.push(predictValue)
            let value = (j >= this.fcfPass['Year'].length) ? 0 : this.fcfPass['Free cash flow'][j]
            predictData.historyY.push(value)
            if (i > lastYear) {
                predictData.futureX.push(i)
                predictData.futureY.push(predictValue)
            }
        }
        return predictData
    }

    terminalValue(fcfEnd, num = 5) {
        const wacc = this.wacc()
        const res = fcfEnd * (1 + this.perpetuityGrowth) / (wacc - this.perpetuityGrowth)
        return parseFloat(res.toFixed(2))
    }

    fillFcfReport(fcfReport) {
        const wacc = this.wacc()
        const l = fcfReport['Year'].length
        for (let i = 0; i < l; i++) {
            let year = fcfReport['Year'][i]
            let predict = fcfReport['Predict'][i]
            let termValue = 0
            if (i == (l - 1)) {
                termValue = this.terminalValue(predict, l)
            }
            let sum = tool.toFloat(predict + termValue)
            let discount = tool.toFloat((sum / Math.pow(1 + wacc, i + 1)))
            fcfReport['Terminal'].push(termValue)
            fcfReport['Sum Predict Terminal'].push(sum)
            fcfReport['Sum Discount'].push(discount)
        }
    }

    valuationReport(fcfReport) {
        const valuationReport = {}
        let totalValue = 0
        for (let i = 0; i < fcfReport['Sum Discount'].length; i++) {
            totalValue += fcfReport['Sum Discount'][i]
        }
        totalValue = tool.toFloat(totalValue)
        const intrinsic = tool.toFloat(totalValue - this.marketDebt)
        const valuePerShare = parseFloat((intrinsic / this.shareOutstanding).toFixed(2))
        valuationReport['Total Value'] = [totalValue]
        valuationReport['Market Price Debt'] = [this.marketDebt]
        valuationReport['Intrinsic Value'] = [intrinsic]
        valuationReport['Shares Outstanding'] = [this.shareOutstanding]
        valuationReport['Value Per Share'] = [valuePerShare]
        return valuationReport
    }

    check() {
        const quote = this.props.quote
        const income = this.props.income
        const balance = this.props.balance
        const cashflow = this.props.cashflow
        if (tool.empty(quote) || tool.empty(income) || tool.empty(balance) || tool.empty(cashflow)) {
            this.state.health = macro.DATA_EMPTY
            return
        }

        const measureData = {}
        const lose = {}

        // measure quote data
        let measureList = [
            'Beta',
            'Market Cap.',
            'Shares Outstanding'
        ]
        for (let i = 0; i < measureList.length; i++) {
            let key = measureList[i]
            let value = quote[key]
            if (!value || value.length === 0) {
                lose[key] = []
            }
            else if (value[0] == '' || value[0] == '-')
                lose[key] = value
            else
                measureData[key] = key == 'Beta' ? tool.toFloat(value[0]) : tool.toMillion(value[0])
        }

        // measure balance data
        measureList = [
            'Short-term debt',
            'Other long-term liabilities'
        ]
        for (let i = 0; i < measureList.length; i++) {
            let key = measureList[i]
            let value = balance[key]
            if (!value || value.length === 0) {
                lose[key] = []
            }
            else {
                measureData[key] = tool.toFloat(value[value.length - 1])
            }
        }

        // measure income data
        measureList = [
            'Provision for income taxes',
            'Income before taxes'
        ]
        for (let i = 0; i < measureList.length; i++) {
            let key = measureList[i]
            let value = income[key]
            if (!value || value.length === 0) {
                lose[key] = []
            }
            else {
                measureData[key] = tool.toNumList(value)
            }
        }

        // measure cashflow data
        measureList = [
            'Fiscal year ends in December. CNY in millions except per share data.',
            'Free cash flow'
        ]
        for (let i = 0; i < measureList.length; i++) {
            let key = measureList[i]
            let value = cashflow[key]
            if (!value || value.length === 0) {
                lose[key] = []
            }
            else {
                if (i === 0)
                    measureData['Year'] = tool.sliceYearList(value).slice(0, -1)
                else {
                    measureData[key] = tool.toNumList(value).slice(0, -1)
                }
            }
        }

        if (!tool.empty(lose)) {
            this.state.health = macro.DATA_LOSE
            this.state.lose = lose
        } else {
            this.state.health = macro.DATA_PERFECT
            this.state.measureData = measureData
            this.modelInit()
        }
    }

    analysis() {
        // DCF Setting
        const report = {
            'Beta': [this.beta],
            'Risk Free': [this.riskFree],
            'Risk Premium': [this.riskPremium],
            'Cost Of Equity': [this.costOfEquity()],
            'Cost Of Debt PreTax': [this.costOfDebtPreTax()],
            'Tax Rate': [this.taxRate],
            'Cost Of Debt': [this.costOfDebtAfterTax()],
            'Market Price Equity': [this.marketEquity],
            'Market Price Debt': [this.marketDebt],
            'Perpetuity Growth': [this.perpetuityGrowth],
            'Wacc': [this.wacc()]
        }
        const predictData = this.predict()

        // Cash Flow Discount
        const fcfReport = {
            'Year': predictData.futureX,
            'Predict': predictData.futureY,
            'Terminal': [],
            'Sum Predict Terminal': [],
            'Sum Discount': [],
        }
        this.fillFcfReport(fcfReport)

        // Valuation
        const valuationReport = this.valuationReport(fcfReport)

        return <div>
            <TransformTable data={report} title='DCF模型参数' />
            <div className='jumbotron' style={{ backgroundColor: tool.DIV_COLOR}} >
                <h4>现金流线性回归预测</h4>
                <div className='row'>
                    <div className='col'>
                        <BarChart
                            x={this.fcfPass['Year']}
                            y={this.fcfPass['Free cash flow']}
                            title='自由现金流(M)'
                        />
                    </div>
                    <div className='col'>
                        <BarAndLineChart
                            x={predictData.regressionX}
                            y={predictData.historyY}
                            y2={predictData.regressionY}
                            title='自由现金流(M)'
                            title2='自由现金流线性回归(M)'
                        />
                    </div>
                </div>
            </div>
            <TransformTable data={fcfReport} title='现金流预测(M)' />
            <TransformTable data={valuationReport} title='估值计算' />
        </div>

    }

    render() {
        this.check()
        const title = '自由现金流分析'
        switch (this.state.health) {
            case macro.DATA_EMPTY:
                return <NoData title={title} />
            case macro.DATA_LOSE:
                return <DataTable warn title={title} desc='以下数据缺失:' data={this.state.lose} />
            case macro.DATA_PERFECT:
                return this.analysis()
            default:
                return null
        }
    }
}

const mapStateToProps = (state) => {
    return {
        quote: state.quote,
        income: state.income,
        balance: state.balance,
        cashflow: state.cashflow
    }
}

export default connect(mapStateToProps)(DCFMeasure)