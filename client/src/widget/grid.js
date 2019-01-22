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
    const add = props.isLast ? 'high-light' : ''
    return <div className={`col ${add}`}>
        <span className='label'>{props.name}</span>
        <span className='label'>{props.value}</span>
    </div>
}

const Grid = (props) => {
    const data = props.data
    const rows = []
    const columns = []
    const keyList = Object.keys(data)
    const len = keyList.length
    keyList.forEach((name, i) => {
        const value = data[name]
        const isLast = i == (len - 1)
        columns.push(<Column key={i} name={name} value={value} isLast={isLast} />)
        if (isLast && (len % 2 == 1)) {
            columns.push(<Column key={i + 1} name='' value='' />)
        }
    })
    rows.push(<div key={0} className='row'>{columns}</div>)
    return <div className='grid section'>
        <h3 className='title'>{props.title}</h3>
        {rows}
    </div>
}

export { Grid }