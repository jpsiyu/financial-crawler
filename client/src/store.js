import { createStore, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import macro from './lib/macro'
import pjson from '../../package.json'
import tool from './lib/tool'

const quoteReducer = (state = {}, action) => {
    switch (action.type) {
        case 'quote':
            return action.payload
        default:
            return state
    }
}

const keyRatioReducer = (state = {}, action) => {
    switch (action.type) {
        case 'keyRatio':
            return action.payload
        default:
            return state
    }
}

const incomeReducer = (state = {}, action) => {
    switch (action.type) {
        case 'income':
            return action.payload
        default:
            return state
    }
}

const balanceReducer = (state = {}, action) => {
    switch (action.type) {
        case 'balance':
            return action.payload
        default:
            return state
    }
}
const cashflowReducer = (state = {}, action) => {
    switch (action.type) {
        case 'cashflow':
            return action.payload
        default:
            return state
    }
}

const commonReducer = (state = { searched: false }, action) => {
    switch (action.type) {
        case macro.ActionSearch:
            return tool.copy(state, {searched: true})
        case macro.ActionTickerInfo:
            return tool.copy(state, {tickerInfo: action.payload})
        default:
            return state
    }
}

const rootReducer = (state = {}, action) => {
    if (action.type === macro.STATE_CLEAR) {
        const s = {
            common: state.common
        }
        return s
    }
    else
        return appReducer(state, action)
}

const appReducer = combineReducers({
    quote: quoteReducer,
    keyRatio: keyRatioReducer,
    income: incomeReducer,
    balance: balanceReducer,
    cashflow: cashflowReducer,
    common: commonReducer,
})

const build = () => {
    if (pjson.production)
        return createStore(rootReducer)
    else
        return createStore(rootReducer, composeWithDevTools())
}

const store = build()

export default store