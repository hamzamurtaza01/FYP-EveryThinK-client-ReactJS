import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import withAuthentication from './withAuthentication';
import Navigation from './Navigation/Navigation';
import LandingPage from './Landing/Landing';
// import SignUpPage from './SignUp/SignUp';
// import SignInPage from './SignIn/SignIn';
// import PasswordForgetPage from './PasswordForget/PasswordForget';
import HomePage from './Home/Home';
import AccountPage from './Account/Account';
import ListOfClasses from './ListOfClasses/ListOfClasses';

import Bootstrap from '../bootstrap-3.3.7-dist/css/bootstrap.css';
// import 'react-notification-center/src/less/index.less';

// import Footer from './Footer/Footer';
// import 'react-bootstrap';
import Messages from './Messages/messtry';
import * as routes from '../constants/routes';
import firebase from 'firebase';
import loading from '../Images/spinner.gif';
import Create_Assignment from './Assignment/Create_Assignment';
import Assignments from './Assignment/Assignments';
import Quiz from './Quiz/Quiz';
import CreateQuiz from './Quiz/CreateQuiz';

import { updateUser } from '../redux/Auth/AuthActions';
import { connect } from 'react-redux';

import { history } from './History'

// import 'react-bootstrap';


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authUser: null,
            screenLoading: true,
        };
    }

    componentDidMount() {
        document.title = "EveryThink";
        firebase.auth().onAuthStateChanged(authUser => {
            authUser
                ? this.setState(() => ({ authUser, screenLoading: false }))
                : this.setState(() => ({ authUser: null, screenLoading: false }));
        });
    }

    // logout
    logout = () => {
        this.setState({ screenLoading: true });

        firebase.auth().signOut()
            .then(() => {
                history.push(routes.LANDING);
                // window.location.reload();
            })
            .catch(err => {
                console.log('ERROR => ', err);
                this.setState({ screenLoading: false });
            });
    };

    render() {
        const { authUser, screenLoading } = this.state;
        // const { ClassID } = this.props;
        // console.log(ClassID);

        return (
            <Router>
                <div id=''>
                    {
                        screenLoading &&
                        <div style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: '100%', zIndex: 100, background: '#ffffff' }}> <img style={{ margin: '200px' }} className='rounded mx-auto d-block img-responsive' src={loading} alt='Loading' /></div>
                    }
                    {/* <div id='abc' className='container-fluid'> */}
                    <Navigation authUser={authUser} logout={this.logout} />
                    {/* </div> */}

                    {!authUser ? (<LandingPage />) :
                        <Switch>
                            <Route exact path={routes.LANDING} component={ListOfClasses} />
                            <Route exact path={routes.HOME} component={HomePage} />
                            <Route exact path={routes.ACCOUNT} component={AccountPage} />
                            <Route exact path={routes.LIST_OF_CLASSES} component={ListOfClasses} />
                            <Route exact path={routes.MESSAGES} component={Messages} />
                            <Route exact path={routes.ASSIGN_CREATE} component={Create_Assignment} />
                            <Route exact path={routes.ASSIGNMENTS} component={Assignments} />
                            <Route exact path={routes.QUIZ} component={Quiz} />
                            <Route exact path={routes.QUIZ_CREATE} component={CreateQuiz} />
                        </Switch>
                    }

                    {/* <div className='App'>
                        {authUser ? (<HomePage />) : (<LandingPage />)}
                    </div> */}
                </div>
            </Router>
        );
    }

}


const mapStateToProps = (state) => {
    return {
        authUser: state.authReducers.user,
        ClassID: state.ClassIDReducers.ClassId,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        modifyUser: (user) => dispatch(updateUser(user))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withAuthentication(App));

