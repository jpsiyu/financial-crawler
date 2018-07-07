import React from 'react'

class DataTable extends React.Component {
    constructor() {
        super()
    }

    render() {
        const data = this.props.data
        let heads = []
        let rows = []
        for (let i = 0; i < data.length; i++) {
            let row = []
            const values = data[i]
            for (let j = 0; j < values.length; j++) {
                row.push(<th key={`${i}-${j}`}>{values[j]}</th>)
            }
            if(i == 0)
                heads.push(<tr key={i}>{row}</tr>)
            else
                rows.push(<tr key={i}>{row}</tr>)
        }
        return <div>
            <h2>{this.props.title}</h2>
            <table className='table'>
                <thead>{heads}</thead>
                <tbody>{rows}</tbody>
            </table>
        </div>
    }
}

export default DataTable