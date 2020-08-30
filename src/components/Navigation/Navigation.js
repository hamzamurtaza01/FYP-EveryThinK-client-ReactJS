// import { type } from 'os';
import { Badge, Drawer } from 'antd';
import 'antd/dist/antd.css';
import React, { Component } from 'react';
// import { updateUser } from '../../redux/Auth/AuthActions';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Collapse, DropdownItem, DropdownMenu, DropdownToggle, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, UncontrolledDropdown } from 'reactstrap';
import * as routes from '../../constants/routes';
import firebase from '../../firebase/firebase';
// import Notification from './Notification';
import logo from '../../Images/Logo.png';
import AuthUserContext from '../AuthUserContext';
import SignIn from '../SignIn/SignIn';
import SignOutButton from '../SignOut/SignOut';
import './Navigation.css';


const database = firebase.database();

let retrieverRef;


class Navigation extends Component {
	// constructor(props) {
	// 	super(props);
	// }

	logout = () => {
		this.props.logout();
	}

	render() {
		return (
			<AuthUserContext.Consumer>
				{authUser =>
					authUser ? <NavigationAuth {...this.props} /> : <NavigationNonAuth />
				}
			</AuthUserContext.Consumer>
		)
	}
}


class NavigationAuth extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
			visible: false,
			UnreadMessagesCount: 0,
			UnreadNotificationsCount: 0
		};
		this.toggle = this.toggle.bind(this);
	}

	componentDidMount() {
		this.getUnreadMessagesCount();
	}

	componentWillUnmount() {
		// retrieverRef.off();
	}

	getUnreadMessagesCount = async () => {

		// const { UnreadMessagesCount } = this.state;
		const { UserInfo } = this.props;
		if (!UserInfo) return;
		const retrieverid = UserInfo.userid;

		retrieverRef = database.ref(`Conversations/${retrieverid}`);
		await retrieverRef.on('value', (data) => {
			let count = 0;
			const DATA = data.val();
			// console.log({ DATA });

			const CONVOkeys = DATA !== null && Object.keys(DATA);
			CONVOkeys.length && CONVOkeys.forEach((convo) => {
				// console.log(DATA[convo].unread);
				DATA[convo].unread
					? this.setState({ UnreadMessagesCount: ++count })
					: this.setState({ UnreadMessagesCount: count })

			})
		})
	}


	toggle() {
		this.setState({
			isOpen: !this.state.isOpen
		});
	}

	logout = () => {
		this.props.logout();
	}

	showDrawer = () => {
		this.setState({
			visible: true,
		});
	};
	onClose = () => {
		this.setState({
			visible: false,
		});
	};


	render() {
		const { UnreadMessagesCount, UnreadNotificationsCount } = this.state;
		const { user, ClassID, RecieverID } = this.props;

		return (
			<div>
				<Navbar color="light" light expand="md">
					<NavbarBrand href={routes.HOME}><img width="200px" src={logo} alt="" /></NavbarBrand>
					<NavbarToggler onClick={this.toggle} />

					{(!ClassID && !RecieverID) ?
						<Collapse isOpen={this.state.isOpen} navbar>
							<Nav /*fill={true}*/ style={{float:'right'}}>
								<NavItem id='navbar'>
									<Link className='nav-item' id='linkColor' to={routes.LIST_OF_CLASSES}><i className="fas fa-graduation-cap"></i>&nbsp;My Classes</Link>
								</NavItem>

								<NavItem id='navbar'>
									<Link id='linkColor' to={routes.MESSAGES}><i className="fas fa-envelope"></i>
										<Badge count={UnreadMessagesCount} style={{ backgroundColor: '#F15A2D', marginBottom: '10px' }} />
									</Link>
								</NavItem>

								{/* <NavItem id='navbar'>
									<Link to={""} id='linkColor' onClick={this.showDrawer}>
										<i className="fas fa-bell"></i>
										<Badge count={UnreadNotificationsCount} style={{ backgroundColor: '#F15A2D', marginBottom: '10px' }} />
									</Link>
								</NavItem> */}

								<NavItem>
									<UncontrolledDropdown inNavbar>
										<DropdownToggle nav caret>
											{user && <b>{user.user.email}</b>}
										</DropdownToggle>
										<DropdownMenu>
											<DropdownItem>
												<Link id='linkColor' to={routes.ACCOUNT}>Account Settings</Link>
											</DropdownItem>
											<SignOutButton {...this.props} />
										</DropdownMenu>
									</UncontrolledDropdown>
								</NavItem>
							</Nav>
						</Collapse>

						:

						<Collapse isOpen={this.state.isOpen} navbar>
							<Nav /*fill={true}*/ style={{float:'right'}}>
								<NavItem id='navbar'>
									<Link className='nav-item' id='linkColor' to={routes.LIST_OF_CLASSES}><i className="fas fa-graduation-cap"></i>&nbsp;My Classes</Link>
								</NavItem>

								<NavItem id='navbar'>
									<Link id='linkColor' to={routes.HOME}><i className="fas fa-home"></i>&nbsp;Home</Link><span></span>
								</NavItem>

								<NavItem id='navbar'>
									<Link id='linkColor' to={routes.ASSIGNMENTS}><i className="fas fa-briefcase "></i>&nbsp;Assignments</Link>
								</NavItem>

								<NavItem id='navbar'>
									<Link id='linkColor' to={routes.QUIZ}><i className="fas fa-question-circle"></i>&nbsp;Quizzes</Link>
								</NavItem>

								<NavItem id='navbar'>
									<Link id='linkColor' to={routes.MESSAGES}><i className="fas fa-envelope"></i>
										<Badge count={UnreadMessagesCount} style={{ backgroundColor: '#F15A2D', marginBottom: '10px' }} />
									</Link>
								</NavItem>

								{/* <NavItem id='navbar'>
									<Link to={""} id='linkColor' onClick={this.showDrawer}>
										<i className="fas fa-bell"></i>
										<Badge count={UnreadNotificationsCount} style={{ backgroundColor: '#F15A2D', marginBottom: '10px' }} />
									</Link>
								</NavItem> */}

								<NavItem>
									<UncontrolledDropdown inNavbar>
										<DropdownToggle nav caret>
											{user && <b>{user.user.email}</b>}
										</DropdownToggle>
										<DropdownMenu>
											<DropdownItem>
												<Link id='linkColor' to={routes.ACCOUNT}>Account Settings</Link>
											</DropdownItem>
											<SignOutButton {...this.props} />
										</DropdownMenu>
									</UncontrolledDropdown>
								</NavItem>
							</Nav>
						</Collapse>
					}

					<Drawer title="Notifications" placement="right" closable={false} onClose={this.onClose} visible={this.state.visible}>
						<p>Some contents...</p>
						<p>Some contents...</p>
						<p>Some contents...</p>
					</Drawer>

				</Navbar>
			</div>
		);
	}
}

const NavigationNonAuth = () =>
	<Navbar color="light" light expand="md">
		<NavbarBrand href={routes.HOME}><img width="200px" src={logo} alt="" /></NavbarBrand>
		<NavItem style={{ listStyleType: 'none' }} className="ml-auto">
			<SignIn />
		</NavItem>
	</Navbar>




const mapStateToProps = (state) => {
	// console.log(state.UserInfoReducers);
	return {
		user: state.authReducers.user,
		ClassID: state.ClassIDReducers.ClassId,
		UserInfo: state.UserInfoReducers.info,
		RecieverID: state.RecieverIDReducers.RecieverId
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);

