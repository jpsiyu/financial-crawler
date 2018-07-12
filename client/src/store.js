import { createStore, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import macro from '../lib/macro'

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

const rootReducer = (state = {}, action) => {
    if (action.type === macro.STATE_CLEAR){
        return action.payload
    }
    else
        return appReducer(state, action)
}

const appReducer = combineReducers({
    quote: quoteReducer,
    keyRatio: keyRatioReducer,
    income: incomeReducer,
    balance: balanceReducer,
    cashflow: cashflowReducer
})

const store = createStore(
    rootReducer,
    composeWithDevTools()
)

export default store