import React, { Component } from 'react';
import SignUp from '../SignUp/SignUp';
import * as routes from '../../constants/routes';
import LandingImage from '../../Images/test.png';
import './Landing.css';

// import { Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, Button } from 'reactstrap';
// import { Divider } from 'antd';
// import logo from '../../Images/message.png';

import { updateUser } from '../../redux/Auth/AuthActions';
import { connect } from 'react-redux';


class LandingPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {}
        }
    }

    componentDidMount() {
        // CDM me user ka obj lakr redux se.. check rkengy user hai to SWITCH wala msla hai yeh....

        const { user, history, ClassID } = this.props;
        if (user && ClassID) {
            history.push(routes.LIST_OF_CLASSES)
        }
        else if (user) {
            history.push(routes.HOME)
            // <Redirect to='/login' /> 
        }
    }

    render() {
        return (
            < div className="container" >

                <div className='col-md-7 col-lg-7 col-sm-7 row'>
                    <img className='rounded mx-auto d-block img-responsive' src={LandingImage} alt='landingImage' />
                </div>
                <div className='col-md-5 col-lg-5 col-sm-5'>
                    <SignUp />
                </div>

            </div >
        )
    }
}


const mapStateToProps = (state) => {
    return {
        user: state.authReducers.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateUser: (user) => dispatch(updateUser(user))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
