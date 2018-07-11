import React from 'react'
import ReactDOM from 'react-dom'
import Entry from './entry'
import { HashRouter, Route } from 'react-router-dom'
import store from './store'
import { Provider } from 'react-redux'

class App extends React.Component {
    render() {
        return <Provider store={store}>
            <HashRouter>
                <div>
                    <Route exact path="/" component={Entry} />
                    <Route path="/test" component={() => <p>HaHa</p>} />
                </div>
            </HashRouter>
        </Provider >
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('container')
)