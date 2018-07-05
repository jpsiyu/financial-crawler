import React from 'react'
import ReactDOM from 'react-dom'
import Entry from './entry.jsx'
import { HashRouter, Route } from 'react-router-dom'

class App extends React.Component {
    render() {
        return <HashRouter>
            <div>
                <Route exact path="/" component={Entry} />
                <Route path="/test" component={() => <p>HaHa</p>} />
            </div>
        </HashRouter>
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('container')
)