import React from 'react'

class DataTable extends React.Component {
    constructor() {
        super()
    }

    render() {
        const quote = this.props.quoteData
        let heads = []
        let columns = []
        Object.keys(quote).forEach((key, index) => {
            let value = quote[key]
            columns.push(<td key={index}>{value}</td>)
            heads.push(<th key={index}>{key}</th>)
        })
        return <div>
            <h2>Quote Info</h2>
            <table className='table'>
                <thead><tr>{heads}</tr></thead>
                <tbody><tr>{columns}</tr></tbody>
            </table>
        </div>
    }
}

export default DataTable