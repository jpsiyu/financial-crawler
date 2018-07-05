import React from 'react'

class DataTable extends React.Component {
    constructor() {
        super()
    }

    render() {
        const data = this.props.data
        let heads = []
        let rows = []
        Object.keys(data).forEach((key, index) => {
            let value = data[key]
            for (let i = 0; i < value.length; i++) {
                if(rows[i] == null)
                    rows[i] = []
                rows[i].push(<td key={`${key}-${i}`}>{value[i]}</td>)
            }
            heads.push(<th key={index}>{key}</th>)
        })
        let trRows = []
        for(let i in rows){
            let r = rows[i]
            trRows.push(<tr key={i}>{r}</tr>)
        }
        return <div>
            <h2>Info</h2>
            <table className='table'>
                <thead><tr>{heads}</tr></thead>
                <tbody>{trRows}</tbody>
            </table>
        </div>
    }
}

export default DataTable