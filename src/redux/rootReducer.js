import {combineReducers} from 'redux';
import authReducers from './Auth/AuthReducers';
import ClassIDReducers from './ClassID/ClassIDReducers';
import UserInfoReducers from './UserInfo/UserInfoReducers';
import RecieverIDReducers from './MessageRecieverID/RecieverIDReducers';

export default combineReducers({
    authReducers,
    ClassIDReducers,
    UserInfoReducers,
    RecieverIDReducers
})
