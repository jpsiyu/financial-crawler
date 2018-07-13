import React from 'react'
import { Bar } from 'react-chartjs-2'
import tool from '../lib/tool'

const blue = 'rgb(69,69,127)'
const yellow = '#EC932F'
const height = 280
const width = 420

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
    return <div className='jumbotron' style={{backgroundColor:tool.CHART_COLOR}} >
        <Bar data={data} width={width} height={height} options={options} />
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
    return <div className='jumbotron' style={{backgroundColor:tool.CHART_COLOR}} >
        <Bar data={data} width={width} height={height} options={options} />
    </div>

}

const BarAndLineChart = (props) => {
    const labels = props.x
    const values = props.y
    const values2 = props.y2
    const title = props.title ? props.title : ''
    const title2 = props.title2 ? props.title2 : ''
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
                label: title2,
                data: values2,
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
    return <div className='jumbotron' style={{backgroundColor:tool.CHART_COLOR}} >
        <Bar data={data} width={width} height={height} options={options} />
    </div>
}

export { BarChart, LineChart, BarAndLineChart}