import React, { Component } from 'react';
import AuthUserContext from '../AuthUserContext';
import firebase from '../../firebase/firebase';
// import { PasswordForgetForm } from '../PasswordForget/PasswordForget';
import PasswordChangeForm from '../PasswordChange/PasswordChange';
import withAuthorization from '../withAuthorization';
import { Modal, Button, Input, message, /*Select, Col, Row, Drawer, Form, DatePicker, Icon */ } from 'antd';
import * as routes from '../../constants/routes';

import { updateUserInfo } from '../../redux/UserInfo/UserInfoActions';
import { connect } from 'react-redux';

const database = firebase.database();

// const { Option } = Select;

class AccountPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visibleChangePass: false,
            visibleForUpdate: false,
            editName: '',
            editPhoneno: '',
            editSubject: '',
            editInterest: '',
            Name: '',
            Email: '',
            Phoneno: '',
            Subject: '',
            Interest: ''
        }
    }

    // componentDidMount() {
    //     this.getUserData();
    // }

    // getUserData = () => {
    //     const { UserInfo } = this.props;
    //     this.setState({
    //         Name: UserInfo.username,
    //         Email: UserInfo.email,
    //         Phoneno: UserInfo.phoneNumber,
    //         Subject: UserInfo.subject,
    //         Interest: UserInfo.interest
    //     })
    // }

    // static getDerivedStateFromProps(nextProps, prevState) {
    //     const { UserInfo } = nextProps;
    //     console.log('Userinfo updated in static', UserInfo);
    //     return {subject : nextProps.subject};
    // //     }
    // //     else return null;
    // }

    // shouldComponentUpdate(nextProps, nextState) {
    //     if(nextProps !== nextState){
    //         return true;
    //     }
    //     return false;
    // }

    // componentDidUpdate(prevProps, prevState, prevContext) {
    //     const { UserInfo } = prevProps;
    //     console.log('Userinfo updated in DIDUPDATE', UserInfo);
    // }

    // componentDidUpdate(prevProps, prevState) {
    //     if (prevState.path !== this.state.path) {
    //       let firebaseRef=firebase.database().ref(this.state.path);
    //       this.setState({firebaseRef});
    //       this.getData(firebaseRef);
    //     }
    //   }

    //   static getDerivedStateFromProps(nextProps, prevState){
    //     if(nextProps.path!==prevState.path){
    //       let firebaseRef=prevState.firebaseRef;

    //       firebaseRef.off("value"); //Turn off the connection to previous path.

    // //       We can't do this here as we can't access `this` inside this method.
    // //       firebaseRef=firebase.database().ref(nextProps.path);
    // //       this.setState({firebaseRef, path :nextProps.path });
    // //       this.getData(firebaseRef);

    //       return {path : nextProps.path};
    //     }
    //     else return null;
    //   }

    // static getDerivedStateFromProps(nextProps, prevState) {
    //     if (nextProps.someValue !== prevState.someValue) {
    //         return { someState: nextProps.someValue };
    //     }
    //     else return null;
    // }

    // componentDidUpdate(prevProps, prevState) {
    //     if (prevProps.someValue !== this.props.someValue) {
    //         //Perform some operation here
    //         this.setState({ someState: someValue });
    //         this.classMethod();
    //     }
    // }


    showModalChangePass = () => {
        this.setState({ visibleChangePass: true });
    }
    handleOkChangePass = () => {
        // console.log(e);
        // console.log('handle cancel of Change Password');
        this.setState({ visibleChangePass: false });
    }
    handleCancelChangePass = () => {
        // console.log(e);
        this.setState({ visibleChangePass: false });
    }

    // ..........................>>>>>>>>

    showModalForUpdate = () => {
        // const { Name, Phoneno, Subject, Interest } = this.state;
        const { UserInfo } = this.props;
        this.setState({
            visibleForUpdate: true,
            editName: UserInfo.username,
            editPhoneno: UserInfo.phoneNumber,
            editSubject: UserInfo.subject,
            editInterest: UserInfo.interest
        });
    }
    handleOkForUpdate = () => {
        this.setState({ visibleForUpdate: false },
            () => this.UpdateUserInformation());
    }
    UpdateUserInformation = () => {
        const { /*editName,*/ editPhoneno, editSubject, editInterest } = this.state;
        const { UserInfo } = this.props;
        const userid = UserInfo.userid;
        const Username = UserInfo.username;

        const prevSubject = UserInfo.subject;
        const prevInterest = UserInfo.interest;

        database.ref(`Subject/${prevSubject}/${userid}`).remove();
        database.ref(`Subject/${editSubject}`).child(userid).set({
            username: Username
        })
        database.ref(`Interest Area/${prevInterest}/${userid}`).remove();
        database.ref(`Interest Area/${editInterest}`).child(userid).set({
            username: Username
        })

        var updates = {};
        updates[`/Users/${userid}/phoneNumber`] = editPhoneno;
        updates[`/Users/${userid}/subject`] = editSubject;
        updates[`/Users/${userid}/interest`] = editInterest;

        return database.ref().update(updates,
            () => {
                this.GetUserInfo(userid);
                this.handleCancelForUpdate();
            })
    }
    GetUserInfo = (UserID) => {  // Get user info from DB and save in REDUX state 
        database.ref(`Users/${UserID}`).on('value', (user) => {
            const userinfo = user.val();
            // console.log('userinfo', userinfo);44
            this.props.updateUserInfo(userinfo);
        })
        message.success('Profile Updated');
    }
    handleCancelForUpdate = () => {
        this.setState({
            visibleForUpdate: false
        });
    }

    handleChange = (e) => {
        const { /*editName,*/ editPhoneno, editSubject, editInterest } = this.state;
        this.setState({
            [e.target.name]: e.target.value
        },
            () => {
                if (/* !editName || */ !editPhoneno || !editSubject || !editInterest) {
                    this.setState({
                        disableUpdateInfoButton: true
                    })
                }
                else {
                    this.setState({
                        disableUpdateInfoButton: false
                    })
                }
            });
    }


    render() {
        const { visibleChangePass, visibleForUpdate, /*Name, Email, Phoneno, Subject, Interest,*/ /*editName,*/ editPhoneno, editSubject, editInterest } = this.state;
        // const { UserInfo } = this.props;

        return (
            <AuthUserContext.Consumer>
                {authUser =>
                    <div className='container'>
                        {/* <h3 style={{ textAlign: 'center' }}>Hello<h2>{authUser.email}</h2></h3> */}
                        <div className='container'>
                            <br />

                            {/* <div>Personal Information</div> */}
                            <div className='table-responsive'>
                                <table className='table'>
                                    <tbody>
                                        <tr>
                                            <td><h4><i className="fas fa-user"></i>&nbsp;Name</h4></td>
                                            <td><h4>{this.props.UserInfo.username}</h4></td>
                                        </tr>

                                        <tr>
                                            <td><h4><i className="fas fa-at"></i>&nbsp;Email</h4></td>
                                            <td><h4>{this.props.UserInfo.email}</h4></td>
                                        </tr>

                                        <tr>
                                            <td><h4><i className="fas fa-phone"></i>&nbsp;Phone Number</h4></td>
                                            <td><h4>{this.props.UserInfo.phoneNumber}</h4></td>
                                        </tr>

                                        <tr>
                                            <td><h4><i className="fas fa-code"></i>&nbsp;Subject</h4></td>
                                            <td><h4>{this.props.UserInfo.subject}</h4></td>
                                        </tr>

                                        <tr>
                                            <td><h4><i className="fas fa-heart"></i>&nbsp;Interest Area:</h4></td>
                                            <td><h4>{this.props.UserInfo.interest}</h4></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <Button size='large' type="primary" shape="round" onClick={this.showModalForUpdate}>Update Information</Button>&nbsp;   
                            <Modal title="Update Information" visible={visibleForUpdate} onOk={this.handleOkForUpdate} onCancel={this.handleCancelForUpdate}
                                footer={[<Button key='cancel' onClick={this.handleCancelForUpdate}>Cancel</Button>, <Button key='updateInfo' type="primary" onClick={this.handleOkForUpdate}>Update</Button>,]}>

                                {/* NAME CHANGE KIYA TOU POSTS ME SE JAA JAA KR KOUN KREY GA?? */}
                                {/* <label>Name</label> */}
                                {/* <input name='editName' value={editName} onChange={this.handleChange} className='form-control' type='text' /><br /> */}
                                <label>Phone Number</label>
                                <Input name='editPhoneno' value={editPhoneno} onChange={this.handleChange} className='form-control' type='text' /><br />
                                <label>Subject</label>
                                <Input name='editSubject' value={editSubject} onChange={this.handleChange} className='form-control' type='text' /><br />
                                <label>Interest Area</label>
                                <Input name='editInterest' value={editInterest} onChange={this.handleChange} className='form-control' type='text' /><br />

                            </Modal>

                            <Button size='large' type="primary" shape="round" onClick={this.showModalChangePass}>Change Password</Button>
                            <Modal title="Change Password" visible={visibleChangePass} onOk={this.handleOkChangePass} onCancel={this.handleCancelChangePass} footer={''}>
                                <PasswordChangeForm ModalClose={this.handleOkChangePass} />
                            </Modal>

                        </div >
                    </div>
                }
            </AuthUserContext.Consumer>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        // user: state.authReducers.user,
        ClassID: state.ClassIDReducers.ClassId,
        UserInfo: state.UserInfoReducers.info
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateUserInfo: (userinfo) => dispatch(updateUserInfo(userinfo))
    }
}

const authCondition = (authUser) => !!authUser;
export default connect(mapStateToProps, mapDispatchToProps)(withAuthorization(authCondition)(AccountPage));
