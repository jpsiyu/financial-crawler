import React from 'react'
import { TransformTable } from './table.jsx'
import { BarChart, BarAndLineChart } from './chart.jsx'
import regression from 'regression'

class DcfModule {
    constructor(beta, taxRate) {
        this.riskFree = 0.036
        this.riskPremium = 0.035
        this.perpetuityGrowth = 0.03
    }

    modelInit(beta, taxRate, marketEquity, marketDebt, fcfPass) {
        this.beta = beta
        this.taxRate = taxRate
        this.marketEquity = marketEquity
        this.marketDebt = marketDebt
        this.fcfPass = fcfPass
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
}

const DCFAnalysis = (props) => {
    const data = props.data
    if (!data) return null
    const dcf = new DcfModule()
    dcf.modelInit(data.beta, data.taxRate, data.marketEquity, data.marketDebt, data.fcf)
    const report = {
        'Beta': [dcf.beta],
        'Risk Free': [dcf.riskFree],
        'Risk Premium': [dcf.riskPremium],
        'Cost Of Equity': [dcf.costOfEquity()],
        'Tax Rate': [dcf.taxRate],
        'Cost Of Debt': [dcf.costOfDebtAfterTax()],
        'Market Price Equity': [dcf.marketEquity],
        'Market price Debt': [dcf.marketDebt],
        'Wacc': [dcf.wacc()]
    }
    const predictData = dcf.predict()
    console.log('redict:', predictData)
    return <div>
        <TransformTable data={report} title='DCF模型参数' />
        <div className='row'>
                <div className='col'>
                    <BarChart
                        x = {dcf.fcfPass['Year']}
                        y = {dcf.fcfPass['Free cash flow']}
                        title='自由现金流(M)'
                    />
                </div>
                <div className='col'>
                    <BarAndLineChart
                        x = {predictData.regressionX}
                        y = {predictData.historyY}
                        y2 = {predictData.regressionY}
                        title='自由现金流(M)'
                        title2='自由现金流线性回归(M)'
                    />
                </div>
            </div>
    </div>
}

export { DCFAnalysis }