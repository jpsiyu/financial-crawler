import React from 'react'

class Entry extends React.Component {
    render() {
        return <div className="container">
            <div className="row align-items-center">
                <div className="col-6 mx-auto">
                    <form >
                        <div className='form-group form-inline'>
                            <input type='text' placeholder='Enter Ticker Symbol' className='form-control' />
                            <button type='submit' className='btn btn-primary'>Search</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    }
}

export default Entry
