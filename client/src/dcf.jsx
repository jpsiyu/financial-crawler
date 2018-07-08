import React from 'react'
import {TransformTable} from './table.jsx'

class DcfModule{
    constructor(beta, taxRate) {
        this.riskFree = 0.036
        this.riskPremium = 0.035
        this.perpetuityGrowth = 0.03
    }

    modelInit(beta, taxRate, marketEquity, marketDebt) {
        this.beta = beta
        this.taxRate = taxRate
        this.marketEquity = marketEquity
        this.marketDebt = marketDebt
    }

    costOfEquity() {
        const res = this.riskFree + this.riskPremium * this.beta
        return res.toFixed(4)
    }

    costOfDebtPreTax() {
        return 0.03
    }

    costOfDebtAfterTax() {
        const preTax = this.costOfDebtPreTax()
        const afterTax = preTax * (1 - this.taxRate)
        return afterTax.toFixed(4)
    }

    wacc() {
        const res = (this.marketEquity * this.costOfEquity() + this.marketDebt * this.costOfDebtAfterTax()) /
            (this.marketEquity + this.marketDebt)
        return res.toFixed(4)
    }
}

const DcfSetting = (props) => {
    const dcf = new DcfModule()
    dcf.modelInit(props.beta, props.taxRate, props.marketEquity, props.marketDebt)
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
    console.log('report', report)
    return <TransformTable data={report} title='DCF模型参数' />
}

export {DcfSetting}