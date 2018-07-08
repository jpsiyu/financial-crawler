import React from 'react'
import { Bar } from 'react-chartjs-2'

const blue = 'rgb(69,69,127)'
const yellow = '#EC932F'

const BarChart = (props) => {
    const labels = props.x
    const values = props.y
    const title = props.title ? props.title : ''
    let data = {
        labels: labels,
        datasets: [
            {
                label: title,
                backgroundColor: blue,
                borderColor: blue,
                data: values
            },
        ]
    }
    let options = { maintainAspectRatio: false }
    return <div className='jumbotron' >
        <Bar data={data} width={400} height={400} options={options} />
    </div>
}

const LineChart = (props) => {
    const labels = props.x
    const values = props.y
    const title = props.title ? props.title : ''
    let data = {
        labels: labels,
        datasets: [
            {
                type: 'line',
                label: title,
                fill: false,
                backgroundColor: yellow,
                borderColor: yellow,
                data: values
            },
        ]
    }
    let options = { maintainAspectRatio: false }
    return <div className='jumbotron' >
        <Bar data={data} width={400} height={400} options={options} />
    </div>

}

const BarAndLineChart = (props) => {
    const labels = props.x
    const values = props.y
    const title = props.title ? props.title : ''
    let data = {
        labels: labels,
        datasets: [
            {
                label: title,
                backgroundColor: blue,
                borderColor: blue,
                data: values
            },
            {
                label: title,
                data: values,
                type: 'line',
                borderColor: yellow,
                backgroundColor: yellow,
                pointBorderColor: yellow,
                pointBackgroundColor: yellow,
                fill: false,
            }
        ]
    }
    let options = { maintainAspectRatio: false }
    return <div className='jumbotron' >
        <Bar data={data} width={400} height={400} options={options} />
    </div>
}

export { BarChart, LineChart, BarAndLineChart }