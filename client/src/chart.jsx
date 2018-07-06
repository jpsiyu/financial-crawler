import React from 'react'
import { Bar } from 'react-chartjs-2'

class Chart extends React.Component {
    constructor() {
        super()
    }

    render() {
        const labels = this.props.x
        const values = this.props.y
        const title = this.props.title ? this.props.title : ''
        let data = {
            labels: labels,
            datasets: [{
                label: title,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: values
            }]
        }
        let options = {maintainAspectRatio:false}
        return <div >
            <Bar data={data} width={400} height={400} options={options}/>
        </div>
    }
}

export default Chart