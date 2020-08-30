import React, { Component } from 'react';
import firebase from '../../firebase/firebase';
import {message} from 'antd';

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value,
});

class PasswordChangeForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            passwordOne: '',
            passwordTwo: '',
            error: null
        };
    }

    onSubmit = (event) => {
        event.preventDefault();
        const { passwordOne, passwordTwo } = this.state;
        const { ModalClose } = this.props;

        // firebase.auth().doPasswordUpdate(passwordOne)
        firebase.auth().currentUser.updatePassword(passwordOne)
            .then(() => {
                this.setState({ passwordOne, passwordTwo });
                console.log('password changed successfully!');
                message.success('password changed successfully');
            })
            .then(() => ModalClose())
            .catch(error => {
                this.setState(byPropKey('error', error));
                console.log(error);
                message.error(`${error}`);
                console.log('Error changing password');
            });
    }

    render() {
        const { passwordOne, passwordTwo, error } = this.state;
        const isInvalid = passwordOne !== passwordTwo || passwordOne === '';

        return (
            <form onSubmit={this.onSubmit}>
                <input className='form-control' value={passwordOne} onChange={event => this.setState(byPropKey('passwordOne', event.target.value))} type="password" placeholder="New Password" /><br />
                <input className='form-control' value={passwordTwo} onChange={event => this.setState(byPropKey('passwordTwo', event.target.value))} type="password" placeholder="Confirm New Password" /><br />
                <button className='btn btn-primary' disabled={isInvalid} type="submit">Reset My Password</button>
                {/* {error && <p>{error.message}</p>} */}
            </form>
        );
    }
}

export default PasswordChangeForm;