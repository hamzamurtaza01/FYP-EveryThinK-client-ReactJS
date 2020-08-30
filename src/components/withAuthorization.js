import React from 'react';
import { withRouter } from 'react-router-dom';

import AuthUserContext from './AuthUserContext';
import firebase from '../firebase/firebase';
import * as routes from '../constants/routes';

const withAuthorization = (authCondition) => (Component) => {
    class WithAuthorization extends React.Component {

        componentDidMount() {
            const { history } = this.props;

            firebase.auth().onAuthStateChanged(authUser => {
                if (!authCondition(authUser)) {
                    // delete user wala kam
                    history.push(routes.LANDING);
                }
                // else{
                //     history.push(routes.LIST_OF_CLASSES);
                // }
            });
        }

        render() {
            return (
                <AuthUserContext.Consumer>
                    {authUser =>
                        authUser ? <Component {...this.props} /> : null
                    }
                </AuthUserContext.Consumer>
            )
        }
    }
    return withRouter(WithAuthorization);
}

export default withAuthorization;