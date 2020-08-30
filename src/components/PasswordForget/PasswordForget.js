import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
// import * as routes from '../../constants/routes';
import firebase from '../../firebase/firebase';
// import { Button } from 'antd';
import { Button } from 'reactstrap';


// const PasswordForgetPage = () =>
//     <div>
//         <h1>Password Forget Page</h1>
//         <PasswordForgetForm />
//     </div>

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value,
});

class PasswordForgetForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            error: null
        }
    }

    onSubmit = (event) => {
        event.preventDefault();
        const { email } = this.state;
        const { CloseModal } = this.props;

        // auth.doPasswordReset(email) // in firebase.js
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                this.setState(byPropKey('email', email));
                console.log("Password Reset link sent via email");
            })
            .then(() => CloseModal())
            .catch(error => {
                this.setState(byPropKey('error', error));
                console.log("Error resetting email");
            });
    }

    render() {
        const { email, error } = this.state;
        const isInvalid = email === '';

        return (
            <form onSubmit={this.onSubmit}>
                <input className='form-control' value={email} onChange={event => this.setState(byPropKey('email', event.target.value))} type="text" placeholder="Email Address" />
                <br />
                {/* <Button outline color='primary' className='form-control' disabled={isInvalid} type="submit">Reset My Password</Button> */}
                <Button color='primary' type="submit" className="btn btn-block" disabled={isInvalid}>Reset My Password</Button>

                {error && <p>{error.message}</p>}
                <br/>
                <br/>

            </form>
        );
    }
}

// const PasswordForgetLink = () =>
//     <p><Link to={routes.PASSWORD_FORGET}>Forgot Password?</Link></p>

export default PasswordForgetForm;