import React from 'react';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { DropdownMenu, MenuItem } from 'react-bootstrap-dropdown-menu';
import SignOutButton from '../SignOut/SignOut';
// import * as routes from '../../constants/routes';
// import { Link } from 'react-router-dom';


class Notification extends React.Component {
	createNotification = (type) => {
		return () => {
			
			switch (type) {
				case 'info':
					NotificationManager.info('Every Think');
					break;
				case 'success':
					NotificationManager.success('Every Think', 'Sir Rafi ');
					break;
				case 'warning':
					NotificationManager.warning('','User successfully deleted', 3000);
					break;
				case 'error':
					NotificationManager.error('Error message', 'Click me!', 5000, () => {
						alert('Ali Asgher');
					});
					break;
				default:
					break;
			}
		};
	};
	render() {
		return (
			<div>
				<div className="dropdown">
					<DropdownMenu userName="Ali Asgher">
						<MenuItem text="Home" location="https://www.google.com" />
						<p onClick={this.createNotification('info')}>Info</p><br />

						<p onClick={this.createNotification('success')}>Success</p><br />

						<p onClick={this.createNotification('warning')}>Warning</p><br />

						<p onClick={this.createNotification('error')}>Error</p> <br />
						
						<p onClick={this.createNotification('error')}><SignOutButton /></p>
					</DropdownMenu>

				</div>

				<NotificationContainer />
			</div>
		);
	}
}

//Hamza ka Notifiation with routing


// {/* <div>
// 	<div className="dropdown">
// 		<DropdownMenu userName="Ali Asgher">
// 			<MenuItem text="Home" location="https://www.google.com" />

// 			<a onClick={this.createNotification('info')}>Info</a><br />

// 			<a onClick={this.createNotification('success')}>Success</a><br />

// 			<a onClick={this.createNotification('warning')}>Warning</a><br />

// 			<a onClick={this.createNotification('error')}>Error</a> <br />
// 			<Link to={routes.ACCOUNT}>Account</Link>
// 			<a><SignOutButton /></a>
// 		</DropdownMenu>
// 		<DropdownMenu userName="Ali Asgher">
// 			<MenuItem text="Home" location="/#" />
// 			<MenuItem text="Edit Profile" location="/#" />
// 			<MenuItem text="Change Password" location="#" />
// 			<MenuItem text="Privacy Settings" location="#" />
// 			<MenuItem text="Delete Account" />
// 			<MenuItem text="Logout" />
// 		</DropdownMenu>
// 	</div>

// 	<NotificationContainer />
// </div> */}







export default Notification;