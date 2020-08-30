import React, { Component } from 'react';
import withAuthorization from '../withAuthorization';
import Post from '../Wall/Post';
import '../Home/Home.css';
import { connect } from 'react-redux';


class HomePage extends Component {

    render() {
        return (
            <div className='container-fluid'>

                <div className='SideBar hidden-xs hidden-sm hidden-md col-lg-2' style={{ border: '1px solid #007BFF', borderRadius: '25px', backgroundColor: '#FFFFFF' }} >

                    <div className='text-center col-md-12 col-xs-12 col-sm-12 col-lg-12'>
                        <h2 style={{ fontFamily: 'Times New Roman, Times, serif' }}>Assignments Center</h2>
                        <br />
                    </div>
                    <h4>Upcoming</h4>
                    <br />
                    <h5 style={{ color: '#a6a7a8' }}>Due Today</h5>
                    <p>11:59 PM - Assignment # 1</p>
                    <h5 style={{ color: '#a6a7a8' }}>Due Tommorow</h5>
                    <p>11:59 PM - Assignment # 2</p>
                    <h5 style={{ color: '#a6a7a8' }}>Due next week</h5>
                    <p>11:59 PM - Assignment # 3</p>
                    <br />
                    <p className='float-right'>View All</p><br /><br />
                </div>


                <div className='col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-8 ' >
                    <Post />
                </div>


                <div className='SideBar hidden-xs hidden-sm hidden-md col-lg-2' style={{ border: '1px solid #007BFF', borderRadius: '25px', backgroundColor: '#FFFFFF' }}>
                    <h4>News & Updates</h4><br />
                    <p>There are 3 programs in PIAIC Batch-1 that are Artificial Intelligence, Cloud Native Computing and BlockChain.</p><br />
                    <p>The mission of PIAIC is to reshape Pakistan by revolutionizing education, research, and business by adopting latest, cutting-edge technologies. Experts are calling this the 4th industrial revolution. We want Pakistan to become a global hub for AI, data science, cloud native computing, edge computing, blockchain, augmented reality, and internet of things.</p><br />
                    <p className='float-right'>View All</p><br /><br />
                </div>

            </div>
        );
    }
}

// const UserList = ({ users }) =>
//     <div>
//         <h2>List of Usernames of Users</h2>
//         <p>(Saved on Sign Up in Firebase Database)</p>
//         {Object.keys(users).map(key =>
//             <div key={key}>{users[key].username}</div>
//         )}
//     </div>

const mapStateToProps = (/*state*/) => {
    return {
        // user: state.authReducers.user
    }
}

const mapDispatchToProps = (/*dispatch*/) => {
    return {
        // modifyUser: (user) => dispatch(updateUser(user))
    }
}

const authCondition = (authUser) => !!authUser;
export default connect(mapStateToProps, mapDispatchToProps)(withAuthorization(authCondition)(HomePage));
