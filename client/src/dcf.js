import React from 'react'
import { TransformTable } from './table'
import { BarChart, BarAndLineChart } from './chart'
import regression from 'regression'

class DCFAnalysis extends React.Component {
    constructor() {
        super()
        this.riskFree = 0.036
        this.riskPremium = 0.035
        this.perpetuityGrowth = 0.03
    }

    modelInit(data) {
        this.beta = data.beta
        this.taxRate = data.taxRate
        this.marketEquity = data.marketEquity
        this.marketDebt = data.marketDebt
        this.fcfPass = data.fcfPass
        this.shareOutstanding = data.shareOutstanding
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
            let sum = predict + termValue
            let discount = parseFloat((sum / Math.pow(1 + wacc, i + 1)).toFixed(2))
            fcfReport['Terminal'].push(termValue)
            fcfReport['Sum Predict Terminal'].push(sum)
            fcfReport['Sum Discount'].push(discount)
        }
    }

    valuationReport(fcfReport) {
        const valuationReport = {}
        let totalValue = 0
        for (let i = 0; i < fcfReport['Sum Discount'].length; i++) {
            totalValue+= fcfReport['Sum Discount'][i]
        }
        const intrinsic = totalValue - this.marketDebt
        const valuePerShare = parseFloat((intrinsic / this.shareOutstanding).toFixed(2))
        valuationReport['Total Value'] = [totalValue]
        valuationReport['Market Price Debt'] = [this.marketDebt]
        valuationReport['Intrinsic Value'] = [intrinsic]
        valuationReport['Shares Outstanding'] = [this.shareOutstanding]
        valuationReport['Value Per Share'] = [valuePerShare]
        return valuationReport
    }

    render() {
        const data = this.props.data
        if (!data) return null
        this.modelInit(data)

        // DCF Setting
        const report = {
            'Beta': [this.beta],
            'Risk Free': [this.riskFree],
            'Risk Premium': [this.riskPremium],
            'Cost Of Equity': [this.costOfEquity()],
            'Tax Rate': [this.taxRate],
            'Cost Of Debt': [this.costOfDebtAfterTax()],
            'Market Price Equity': [this.marketEquity],
            'Market Price Debt': [this.marketDebt],
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
            <TransformTable data={fcfReport} title='现金流预测(M)' />
            <TransformTable data={valuationReport} title='估值计算' />
        </div>
    }

}
export { DCFAnalysis }