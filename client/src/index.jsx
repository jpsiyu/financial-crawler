import React from 'react'
import ReactDOM from 'react-dom'
import {HashRouter, Route} from 'react-router-dom'

class App extends React.Component{
    render(){
        return <HashRouter>
            <Route exact path="/" component={Entry} />
            <Route path="/test" component={ () => <p>HaHa</p>} />
        </HashRouter>
    }
}

class Entry extends React.Component{
    render(){
        return <div>
            Good Job Boy!    
            Wait a Minius!
        </div>
    }
}

ReactDOM.render(
    <Entry />,
    document.getElementById('container')
)