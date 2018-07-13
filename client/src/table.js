import React from 'react'
import tool from '../lib/tool'

const DataTable = (props) => {
    const data = props.data
    let heads = []
    let rows = []
    let i = 0
    Object.keys(data).forEach((key) => {
        const values = data[key]
        let row = []
        row.push(<td key={i}>{key}</td>)
        let targets = i == 0 ? heads : rows
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
    const divColor = props.warn ? tool.DIV_COLOR_WARN: tool.DIV_COLOR
    return <div className='jumbotron' style={{backgroundColor: divColor}}>
        <h4>{props.title}</h4>
        <p>{props.desc}</p>
        <table className='table table-bordered' style={{backgroundColor: tool.TABLE_COLOR}}>
            <thead>{heads}</thead>
            <tbody>{rows}</tbody>
        </table>
    </div>
}

const TransformTable = (props) => {
    const data = props.data
    let heads = []
    let rows = []
    let i = 0
    Object.keys(data).forEach(key => {
        heads.push(<th key={i}>{key}</th>)
        let values = data[key]
        for(let j= 0; j < values.length; j++){
            if(!rows[j])  rows[j] = []
            rows[j].push(<td key={`${i}-${j}`}>{values[j]}</td>)
        }
        i++
    })
    let rowsTab = []
    for(let i=0; i < rows.length; i++){
        rowsTab.push(<tr key={i}>{rows[i]}</tr>)
    }
    return <div className='jumbotron' style={{backgroundColor:tool.DIV_COLOR}}>
        <h4>{props.title}</h4>
        <p>{props.desc}</p>
        <table className='table table-bordered' style={{backgroundColor:tool.TABLE_COLOR}}>
            <thead><tr>{heads}</tr></thead>
            <tbody>{rowsTab}</tbody>
        </table>
    </div>

}


export {DataTable, TransformTable}