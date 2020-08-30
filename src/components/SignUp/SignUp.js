import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as routes from '../../constants/routes';
import { db } from '../../firebase/firebase';
import firebase from '../../firebase/firebase';
// import { doCreateUser } from '../db';
// import { NotificationContainer, NotificationManager } from 'react-notifications';
import { Button, Input } from 'reactstrap';
import { updateUserInfo } from '../../redux/UserInfo/UserInfoActions';

import { updateUser } from '../../redux/Auth/AuthActions';
import { connect } from 'react-redux';
import { message} from 'antd';

const database = firebase.database();
let id;

const SignUpPage = (props) =>
    <div>
        {/* <h1>Create Account at EveryThinK</h1> */}
        <h2>Don't have EveryThink?</h2>
        <h3>Create Free Account</h3>
        <br />
        <SignUpForm {...props} />
    </div>


class SignUpForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            username: '',
            email: '',
            passwordOne: '',
            passwordTwo: '',
            phoneNumber: '',
            subject: '',
            interest: '',
            error: null
        };

        this.SignUp = this.SignUp.bind(this);
    }

    SignUp(e) {
        e.preventDefault();
        const { interest, phoneNumber, subject, username, email, passwordTwo } = this.state;
        const { history } = this.props;

        firebase.auth().createUserWithEmailAndPassword(email, passwordTwo)
            .then(users => {
                this.setState({ user: users });
                id = users.user.uid;
                console.log("Sign Up successful. Welcome!"  + id);
                return users;
            })
            .then((users) => {

                // add user to the Users list
                const newUsersRef = database.ref('Users');
                newUsersRef.child(id).set({
                    userid: id,
                    username: username,
                    email: email,
                    phoneNumber: phoneNumber,
                    subject: subject,
                    interest: interest
                })

                // add user to the relevant subject list
                const newSubjectRef = database.ref(`Subject/${subject}`);
                newSubjectRef.child(id).set({
                    username: username // giving email here would save us from the duplication..NO, PUSH() will solve the problem
                })

                // add user to the relevant interest-area list
                const newInterestRef = database.ref(`Interest Area/${interest}`);
                newInterestRef.child(id).set({
                    username: username
                })

                console.log("Sign Up successful. Account created!");
                this.props.updateUser(users);
                history.push(routes.LIST_OF_CLASSES);
                return id;
            })
            .then(async (UserID) => {
                await this.GetUserInfo(UserID);
            })
            .catch(error => {
                console.log(error);
                message.error(`${error}`);
                this.setState({'error': error});
            });
        e.preventDefault();
    }

    GetUserInfo = (UserID) => {  // Get user info from DB and save in REDUX state 
        db.ref(`Users/${UserID}`).once('value', (user) => {
            const userinfo = user.val();
            // console.log('userinfo', userinfo);
            return userinfo;
        })
            .then((userinfo) => {
                this.props.updateUserInfo(userinfo);
            })
    }
    
    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }


    render() {
        const { Interest, phoneNumber, Subject, username, email, passwordOne, passwordTwo, error } = this.state;

        const isInvalid = passwordOne !== passwordTwo || passwordOne === '' || email === '' || username === '' || Subject === '' || Interest === '' || phoneNumber === '';
        return (
            <form>
                <Input bsSize='lg' value={this.username} name="username" onChange={e => this.handleChange(e)} type="text" placeholder="Full Name" className='form-control input-lg' required /><br />
                <Input bsSize='lg' value={this.email} name="email" onChange={e => this.handleChange(e)} type="text" placeholder="Email Address" className='form-control input-lg' required /><br />

                <div className='row'>
                    <div className='col-md-6'>
                        <Input bsSize='lg' value={this.passwordOne} name="passwordOne" onChange={e => this.handleChange(e)} type="password" placeholder="Password" className='form-control input-lg' required />
                    </div>

                    <div className='col-md-6'>
                        <Input bsSize='lg' value={this.passwordTwo} name="passwordTwo" onChange={e => this.handleChange(e)} type="password" placeholder="Confirm Password" className='form-control input-lg' required />
                    </div>

                </div>
                <br />
                <Input bsSize='lg' value={this.phoneNumber} name="phoneNumber" onChange={e => this.handleChange(e)} type="text" placeholder="Phone Number" className='form-control input-lg' required />
                <br />
                <div className='row'>
                    <div className='col-md-6'>
                        <Input bsSize='lg' value={this.subject} name="subject" onChange={e => this.handleChange(e)} type="text" placeholder="Subject" className='form-control input-lg' required />
                    </div>
                    <div className='col-md-6'>
                        <Input bsSize='lg' value={this.interest} name="interest" onChange={e => this.handleChange(e)} type="text" placeholder="Interest Area" className='form-control input-lg' required />
                    </div>
                </div>
                <br />
                <Button size='lg' color='success' className='col-md-12' disabled={isInvalid} type="submit" onClick={this.SignUp}>Sign Up</Button>
                {/* {error && <p>{error.message}</p>} */}
                <br/><br/><br/>
            </form>
        );
    }
}

// const SignUpLink = () =>
//     <p>
//         Don't have an account?
//         {''}<br />
//         <Link to={routes.SIGN_UP}>Sign Up</Link>
//     </p>




const mapStateToProps = (state) => {
    return {
        user: state.authReducers.user,
        UserInfo: state.UserInfoReducers.info
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateUser: (user) => dispatch(updateUser(user)),
        updateUserInfo: (userinfo) => dispatch(updateUserInfo(userinfo))
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SignUpPage));

export { SignUpForm };
