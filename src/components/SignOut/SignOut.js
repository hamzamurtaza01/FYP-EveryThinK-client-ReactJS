import React from 'react';
import firebase from '../../firebase/firebase';
// import 'bootstrap/dist/css/bootstrap.css';
import { Button } from 'reactstrap';
// import * as routes from '../../constants/routes';

import { removeClassId } from '../../redux/ClassID/ClassIDActions';
import { removeUser } from '../../redux/Auth/AuthActions';
import { removeUserInfo } from '../../redux/UserInfo/UserInfoActions';
import { removeRecieverId } from '../../redux/MessageRecieverID/RecieverIDActions';
import { connect } from 'react-redux';



class SignOutButton extends React.Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         // user: {}
    //     }
    // }

    logout = (e) => {
        e.preventDefault();

        firebase.auth().signOut()
            .then(() => {
                // Remove user and ClassId from Redux store...
                this.props.removeUser();
                this.props.removeClassId();
                this.props.removeUserInfo();
                this.props.removeRecieverId();
            })
            .then(() => {
                this.props.logout();
            })
            .catch((error) => {
                console.log(error);
            })
    }

    render() {
        return (
            <form>
                <Button size='lg' outline color='danger' style={{ width: '100%' }} type="submit" onClick={this.logout}>Sign Out</Button>
            </form>
        )
    }
}


const mapStateToProps = (/*state*/) => {
    return {
        // user: state.authReducers.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        removeUser: () => dispatch(removeUser()),//auth
        removeClassId: () => dispatch(removeClassId()),
        removeUserInfo: () => dispatch(removeUserInfo()),
        removeRecieverId: () => dispatch(removeRecieverId())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignOutButton);
