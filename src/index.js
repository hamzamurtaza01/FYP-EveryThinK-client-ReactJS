import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import 'react-notifications/lib/notifications.css';
import { Provider } from 'react-redux';
import store  from './redux/store';
// import 'bootstrap/dist/css/bootstrap.css';


import 'antd/dist/antd.css'; // Copied from FbPost of OyeOvi :D

ReactDOM.render(
    <Provider store={store}>
            <App />
    </Provider>,
    document.getElementById('root'));
registerServiceWorker();
