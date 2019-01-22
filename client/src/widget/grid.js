import React from 'react'
import macro from '../lib/macro'

const data = {
    AAAAAAA: 'apple',
    BBBBBBB: 'banana',
    CCCCCCC: 'candy',
    DDDDDDD: 'dam',
    EEEEEEE: 'eagle',
    FFFFFFF: 'fluid',
    AAAAAAA2: 'apple',
    BBBBBBB2: 'banana',
    CCCCCCC2: 'candy',
    DDDDDDD2: 'dam',
    EEEEEEE2: 'eagle',
    FFFFFFF2: 'fluid',
}

const Column = (props) => {
    return <div className='col'>
        <span className='key'>{props.name}</span>
        <span className='value'>{props.value}</span>
    </div>
}

const Grid = (props) => {
    const data = props.data
    const rows = []
    let columns = []
    const keyList = Object.keys(data)
    const num = Math.min(20, keyList.length)
    keyList.forEach((name, i) => {
        const value = data[name]
        columns.push(<Column key={i} name={name} value={value} />)
        if (columns.length === num) {
            rows.push(<div key={i} className='row'>{columns}</div>)
            columns = []
        }
    })
    return <div className='grid section'>
        <h3 className='title'>{props.title}</h3>
        {rows}
    </div>
}

export { Grid }