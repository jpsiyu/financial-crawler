import React from 'react'

class DataTable extends React.Component {
    constructor() {
        super()
    }

    render() {
        const data = this.props.data
        let heads = []
        let rows = []
        let i = 0
        Object.keys(data).forEach((key) => {
            const values = data[key]
            let row = []
            row.push(<td key={i}>{key}</td>)
            let targets = i == 0 ? heads: rows 
            for (let j = 0; j < values.length; j++) {
                if (i == 0) {
                    row.push(<th key={`${i}-${j}`}>{values[j]}</th>)
                }
                else {
                    row.push(<td key={`${i}-${j}`}>{values[j]}</td>)
                }
            }
            targets.push(<tr key={i}>{row}</tr>)
            i++
        })
        return <div className='jumbotron'>
            <h2>{this.props.title}</h2>
            <table className='table table-striped table-bordered'>
                <thead>{heads}</thead>
                <tbody>{rows}</tbody>
            </table>
        </div>
    }
}

export default DataTable