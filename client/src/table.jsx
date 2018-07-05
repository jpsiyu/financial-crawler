import React from 'react'

class DataTable extends React.Component {
    constructor() {
        super()
    }

    render() {
        const data = this.props.data
        let heads = []
        let columns = []
        Object.keys(data).forEach((key, index) => {
            let value = data[key]
            columns.push(<td key={index}>{value}</td>)
            heads.push(<th key={index}>{key}</th>)
        })
        return <div>
            <h2>Info</h2>
            <table className='table'>
                <thead><tr>{heads}</tr></thead>
                <tbody><tr>{columns}</tr></tbody>
            </table>
        </div>
    }
}

export default DataTable