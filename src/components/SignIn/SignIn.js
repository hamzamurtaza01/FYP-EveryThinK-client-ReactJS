import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
// import { SignUpLink } from '../SignUp/SignUp';
// import { PasswordForgetLink } from '../PasswordForget/PasswordForget';
import firebase from '../../firebase/firebase';
import * as routes from '../../constants/routes';
import { db } from '../../firebase/firebase';
// import { doGetCurrentUser } from '../db';
// import Notification from '../Navigation/Notification';
import { Button, Input } from 'reactstrap';
import { updateUserInfo } from '../../redux/UserInfo/UserInfoActions';
import { updateUser } from '../../redux/Auth/AuthActions';
import { connect } from 'react-redux';
import PasswordForgetForm from '../PasswordForget/PasswordForget';
// import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import { message } from 'antd';
const SignInPage = (props) =>
    <div>
        <SignInForm {...props} />
        {/* <PasswordForgetLink /> */}
    </div>


class SignInForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            error: null,
            visible: false
        };
        this.login = this.login.bind(this);
    }

    login = (e) => {
        e.preventDefault();
        const { email, password } = this.state;
        var { history } = this.props;

        // history = {}; ye hamza ne kiya hai 24/5/2019
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((users) => {
                this.setState({ user: users })

                const id = users.user.uid;
                console.log("Sign In successful. Welcome!" + id);
                this.props.updateUser(users);

                // return this.GetUserInfo(UserID)
                return db.ref(`Users/${id}`).once('value', (user) => {
                    const userinfo = user.val();
                    return userinfo;
                })
            })
            .then(resp => {
                // console.log({resp: resp.val()});
                const U_info = resp.val();
                this.props.updateUserInfo(U_info);
                history.push(routes.LIST_OF_CLASSES);
            })
            .catch(err => {
                console.log(err);
                message.error('Invalid Username or Password');
                // this.setState({ error });
            });
    }

    showModal = () => {
        this.setState({ visible: true });
    }
    // handleOk = (e) => {
    //     console.log(e);
    //     this.setState({ visible: false });
    // }
    handleCancel = (e) => {
        console.log(e);
        console.log('handle cancel of Forget Paassword');
        this.setState({ visible: false });
    }


    GetUserInfo = async (UserID) => {  // Get user info from DB and save in REDUX state 
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
        const { email, password, error, visible } = this.state;
        const isInvalid = password === '' || email === '';

        return (
            <div>
                <form className='pull-right'>
                    <div className='row'>
                        {/* <div className='col-xs-12 col-sm-12 col-md-8 col-lg-12'> */}
                        <div className='col-md-6'>
                            <Input bsSize='lg' value={email} name="email" onChange={e => this.handleChange(e)} type="text" placeholder="Email Address" />
                        </div>
                        <div className='col-md-6'>
                            <Input bsSize='lg' value={password} name="password" onChange={e => this.handleChange(e)} type="password" placeholder="Password" />
                        </div>
                    </div>

                    <div className='row'>
                        <div className='col-md-12'>
                            <span>
                                <Button color='primary' disabled={isInvalid} type="submit" onClick={this.login} className='pull-right'>Sign In</Button>
                                {error && <p>{error.message}</p>}
                                {/* <PasswordForgetLink /> */}
                                <p style={{ color: '#1A0DAB',cursor:'default' }} onClick={this.showModal}>Forgot Password?</p>

                                <Modal title="Forgot Password?" visible={visible} onCancel={this.handleCancel} footer={''}>
                                    <PasswordForgetForm CloseModal={this.handleCancel} />
                                </Modal>
                            </span>
                        </div>


                    </div>
                </form>
            </div>
        );
    }
}


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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SignInPage));

export { SignInForm };