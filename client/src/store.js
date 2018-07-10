import {createStore, combineReducers} from 'redux'
import {composeWithDevTools} from 'redux-devtools-extension'

const quoteReducer = (state={}, action) => {
    switch(action.type){
        case 'quote':
            return action.payload
        default:
            return state
    }
}

const keyRatioReducer = (state={}, action) => {
    switch(action.type){
        case 'keyRatio':
            return action.payload
        default:
            return state
    }
}

const incomeReducer = (state={}, action) => {
    switch(action.type){
        case 'income':
            return action.payload
        default:
            return state
    }
}

const balanceReducer = (state={}, action) => {
    switch(action.type){
        case 'balance':
            return action.payload
        default:
            return state
    }
}
const cashflowReducer = (state={}, action) => {
    switch(action.type){
        case 'cashflow':
            return action.payload
        default:
            return state
    }
}

const store = createStore(
    combineReducers({
        quote: quoteReducer, 
        keyRatio:keyRatioReducer,
        income: incomeReducer,
        balance: balanceReducer,
        cashflow:cashflowReducer
    }),
    composeWithDevTools()
)

export default store