import React from 'react';
import firebase from '../../firebase/firebase';
// import pp from '../../Images/Sir.jpg';
import './ListOfClasses.css';
// import Home from '../Home/Home';
import 'bootstrap/dist/css/bootstrap.css';
import * as routes from '../../constants/routes';

import { Card, CardText, CardBody, Input, UncontrolledDropdown, Button, CardHeader, CardFooter, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap';
// import { Divider } from 'antd';
import { message, Modal } from 'antd';
import { Collapse } from 'antd';
import { updateClassId, removeClassId } from '../../redux/ClassID/ClassIDActions';
import { removeRecieverId } from '../../redux/MessageRecieverID/RecieverIDActions';
// import { updateUser } from '../../redux/Auth/AuthActions';
import { connect } from 'react-redux';
const Panel = Collapse.Panel;
const database = firebase.database();
let myClassesRef;


class ListOfClasses extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			users: {},
			joinclassName: '',
			joinclassCode: '',
			nameOfUser: '',
			classname: '',
			subjectname: '',
			generatedclasscode: '',
			isGenerateCodeDisabled: true,
			showCodeInput: false,
			CreateClassButtonDisabled: true,
			JoinClassButtonDisabled: true,
			Userz_Classes: [],
			editableClassname: '',
			editableSubject: '',
			visible: false,
			confirmLoading: false,
			visibles: false,
			confirmLoadings: false,
			UpdateButtonDisabled: true
		}
	}

	componentDidMount() {
		this.props.removeClassId();
		this.props.removeRecieverId();
		this.ShowAllClassesOfUser();
	}

	componentWillUnmount() {
		myClassesRef.off();
	}

	showModalClassCode = () => {
		this.setState({
			visibles: true,
		});
	}
	handleOkforclasscode = () => {
		this.setState({
			ModalText: 'The modal will be closed after two seconds',
			confirmLoadings: true,
		});
		setTimeout(() => {
			this.setState({
				visibles: false,
				confirmLoadings: false,
			});
		}, 1000);
	}
	handleCancelforclasscode = () => {
		console.log('Clicked cancel button');
		this.setState({
			visibles: false,
		});
	}


	showModalForEdit = (Prevclassname, PrevSubject) => {
		this.setState({
			visible: true,
			editableClassname: Prevclassname,
			editableSubject: PrevSubject
		});
	}
	EditClassInfo = (Classid, editedClassname, editedSubject) => {
		this.setState({
			ModalText: 'The modal will be closed after two seconds',
			confirmLoading: true,
		},
			() => this.UpdateClassInfo(Classid, editedClassname, editedSubject));

		setTimeout(() => {
			this.setState({
				visible: false,
				confirmLoading: false,
			});
		}, 1000);
	}
	UpdateClassInfo = (Classid, editedClassname, editedSubject) => {
		var updates = {};
		updates[`/Classes/${Classid}/classname`] = editedClassname;
		updates[`/Classes/${Classid}/subjectName`] = editedSubject;

		// return database.ref().update(updates, () => {
		database.ref(`Classes/${Classid}/Members`).once('value', students => {
			const stds = students.val();
			for (var key in stds) {
				const studentID = stds[key].userid;
				// var updatesInUsersNode = {};
				updates[`Users/${studentID}/MyClasses/${Classid}/classname`] = editedClassname;
				updates[`Users/${studentID}/MyClasses/${Classid}/subjectName`] = editedSubject;
			}
			return database.ref().update(updates);
		})
			.then(() => {
				this.setState({
					//
				})
			})
		// })
	}
	handleCancelForUpdate = () => {
		console.log('Clicked cancel button');
		this.setState({
			visible: false,
			UpdateButtonDisabled: true
		});
	}



	ShowAllClassesOfUser = () => {
		const { user } = this.props;

		// SHOW ALL CLASSES OF A USER.......
		const authUserId = user.user.uid;
		// console.log("authUserId", authUserId);
		myClassesRef = database.ref(`Users/${authUserId}/MyClasses`);
		myClassesRef.on('value', (MyClassex) => {
			// console.log("MyClass.val()", MyClassex.val())
			let myClasses = MyClassex.val();
			let filteredClasses = [];
			let filteredkeys = [];
			if (myClasses !== null) {
				for (var key in myClasses) {
					if (myClasses.hasOwnProperty(key)) {
						// console.log(key + " -> " + myClasses[key]);
						filteredClasses.push(myClasses[key])
					}
				}
				filteredkeys.push(Object.keys(myClasses));
				// console.log('myClasses.key', myClasses);
				// console.log('giltereedkeys', filteredkeys[0]);
				this.setState({
					ClassKeys: filteredkeys[0],
					Userz_Classes: filteredClasses
				})
			}
		})
	}
	SelectedClassIDfromCardClick = (ClassKeys, index) => {
		this.setState({ ClassID: ClassKeys[index] }) // is line ko safely comment bhe kr skte haiin
		this.props.updateClassId(ClassKeys[index]);
		this.props.history.push(routes.HOME);
	}
	// ..........................................................................................
	CreateClass = () => {
		const { user } = this.props;

		// YAHAN PE JAB BHI ERROR AE SMJH JAO DB ME WO WALA USER EXIST NAI KRTA
		const authUserId = user.user.uid;
		// console.log("authUserId", authUserId);
		database.ref('Users/' + authUserId).once('value', (authUserId) => {
			// console.log("authUserId", authUserId);
			// console.log("authUserId.VAL()", authUserId.val());
			// console.log("Object.keys(authUserId)", Object.keys(authUserId));

			const username = authUserId.val().username;
			this.setState({ nameOfUser: username });
		})
			.then(() => {
				const { nameOfUser, classname, subjectname, generatedclasscode } = this.state;

				// add a new class to the Classes node in DB
				const newClassRef = database.ref('Classes').push();
				const ClassID = newClassRef.key;
				newClassRef.set({
					classId: ClassID,
					isDeleted: false,
					classname: classname,
					subjectName: subjectname,
					teacherID: authUserId,
					teacherName: nameOfUser,
					classcode: generatedclasscode
				})
				this.postClassDataInUsersNode(subjectname, generatedclasscode, authUserId, ClassID, classname, nameOfUser, authUserId);
				this.postUserDataInClassesNode(authUserId, nameOfUser, ClassID);
			})
			.then(() => {
				message.success('New Class Created');
				console.log("Class Created");
				document.getElementById('code').style.display = 'none';
				document.getElementById('generateCodeButton').disabled = false;
				this.setState({
					classname: '',
					subjectname: '',
					generatedclasscode: '',
					CreateClassButtonDisabled: true
				})
			})
			.catch(function (error) {
				message.error(`${error}`);
				console.log("Error creating class !");
				console.log(error.code);
				console.log(error.message);
			})
	}
	postClassDataInUsersNode = (subjectname, generatedclasscode, authUserId, ClassID, classname, teachername, teacherID) => {
		// Write the new class's data simultaneously in the MyClasses node in the User's list.
		var ClassData = {
			ClassID: ClassID,
			subjectName: subjectname,
			classcode: generatedclasscode,
			classname: classname,
			teachername: teachername,
			teacherID: teacherID
		};
		return database.ref(`/Users/${authUserId}/MyClasses/${ClassID}`).update(ClassData);
	}
	postUserDataInClassesNode = (authUserId, nameOfUser, ClassID) => {
		// Write the new user's data simultaneously in the Members node in the Classes's list.
		var UsersData = {
			username: nameOfUser,
			userid: authUserId
		};
		var userUpdates = {};
		userUpdates[`/Classes/${ClassID}/Members/${authUserId}`] = UsersData;
		return database.ref().update(userUpdates);
	}
	GenerateCode = () => {
		const code = Math.random().toString(36).slice(2, 8).toUpperCase();
		this.setState({ showCodeInput: true, isGenerateCodeDisabled: true });

		const myEvent = {
			target: {
				name: 'generatedclasscode',
				value: code
			}
		};
		this.updateValue_Create(myEvent);
		message.info("Class Code Generated");
	}
	// ..........................................................................................
	JoinClass = () => {
		const { joinclassName, joinclassCode } = this.state;
		const { user } = this.props;

		const authUserId = user.user.uid;
		// console.log("authUserId", authUserId);
		database.ref('Users/' + authUserId).once('value', (authUserId) => {
			const username = authUserId.val().username;
			this.setState({ nameOfUser: username });
		})
			.then(() => {
				const { nameOfUser } = this.state;

				database.ref('Classes').once('value', Classes => {
					Classes.forEach(data => {
						const Class = data.val();
						// console.log(Class.classname);

						if (Class.classname === joinclassName && Class.classcode === joinclassCode) {
							// console.log("Class=>", Class);

							const classID = data.key;
							const classCode = Class.classcode;
							const className = Class.classname;
							const classSubject = Class.subjectName;
							const teacherName = Class.teacherName;
							const teacherID = Class.teacherID;

							this.postJoinClassDataInUsersNode(classSubject, classCode, authUserId, classID, className, teacherName, teacherID);
							this.postJoinUserDataInClassesNode(authUserId, nameOfUser, classID);
							console.log("Class Joined");
							message.success('Class Joined');
							return true;
						}
					})
					message.warning('Invalid Classname or Code');
				})
			})
			.then(() => {
				this.setState({
					joinclassName: '',
					joinclassCode: '',
					JoinClassButtonDisabled: true
				})
			})
			.catch(function (error) {
				message.error(`${error}`);
				console.log("Error joining class !");
				console.log(error.code);
				console.log(error.message);
			})
	}
	postJoinClassDataInUsersNode = (classSubject, classCode, authUserId, classID, classname, teachername, teacherID) => {
		// Write the new class's data simultaneously in the MyClasses node in the User's list.
		var ClassData = {
			ClassID: classID,
			subjectName: classSubject,
			classcode: classCode,
			classname: classname,
			teachername: teachername,
			teacherID: teacherID
		};
		var classUpdates = {};
		classUpdates[`/Users/${authUserId}/MyClasses/${classID}`] = ClassData;
		return database.ref().update(classUpdates);
	}
	postJoinUserDataInClassesNode = (authUserId, nameOfUser, ClassID) => {
		// Write the new user's data simultaneously in the Members node in the Classes's list.
		var UsersData = {
			username: nameOfUser,
			userid: authUserId
		};
		var userUpdates = {};
		userUpdates[`/Classes/${ClassID}/Members/${authUserId}`] = UsersData;
		return database.ref().update(userUpdates);
	}
	// ..........................................................................................
	updateValue_Join = (e) => {
		this.setState({ [e.target.name]: e.target.value },
			() => {
				(this.state.joinclassCode && this.state.joinclassName) ?
					this.setState({ JoinClassButtonDisabled: false }) : this.setState({ JoinClassButtonDisabled: true });
			}
		)
	}
	updateValue_Create = (e) => {
		this.setState({ [e.target.name]: e.target.value },
			() => {
				if (this.state.classname && this.state.subjectname) {
					this.setState({ isGenerateCodeDisabled: false })
				}
				else {
					this.setState({ isGenerateCodeDisabled: true, showCodeInput: false })
				}

				if (this.state.classname && this.state.subjectname && this.state.generatedclasscode) {
					this.setState({ CreateClassButtonDisabled: false })
				}
				else {
					this.setState({ CreateClassButtonDisabled: true })
				}
			}
		)
	}
	// ..........................................................................................
	LeaveClass = (cls_ID) => {
		const { user } = this.props;
		const userid = user.user.uid;
		console.log('cls_ID', cls_ID);
		console.log('userid', userid);

		database.ref(`Users/${userid}/MyClasses/${cls_ID}`).remove();
		database.ref(`Classes/${cls_ID}/Members/${userid}`).remove();
		console.log("Class Left");
		message.warning('Class Left');
	}
	DeleteClass = (cls_ID) => {
		database.ref(`Classes/${cls_ID}/Members`).once('value', students => {
			const stds = students.val();
			for (var key in stds) {
				const studentID = stds[key].userid;
				database.ref(`Users/${studentID}/MyClasses/${cls_ID}`).remove();
			}
		})
			.then(() => {
				var updates = {};
				updates[`/Classes/${cls_ID}/isDeleted`] = true;
				message.warning('Class Deleted')
				return database.ref().update(updates);
			})
		// .then(() => removeClassId())
	}

	handleChange = (e) => {
		this.setState({ [e.target.name]: e.target.value }, () => {
			if (this.state.editedClassname === '' || this.state.editedSubject === '') {
				this.setState({ UpdateButtonDisabled: true })
			}
			else {
				this.setState({ UpdateButtonDisabled: false })
			}
		})
	}



	render() {
		const { Userz_Classes, ClassKeys, generatedclasscode, classname, subjectname, joinclassName, joinclassCode, isGenerateCodeDisabled, showCodeInput, CreateClassButtonDisabled, JoinClassButtonDisabled, visible, confirmLoading, visibles, confirmLoadings, editableClassname, editableSubject, UpdateButtonDisabled } = this.state;
		// const { user } = this.props;
		const user = this.props.user || { user: {} };
		// console.log('Userz_Classes', Userz_Classes);

		return (
			<div>

				<div className='hidden-lg hidden-md'>
					<Collapse>
						<Panel header="Join/Create Class">
							<div style={{ textAlign: 'center', border: '1px solid #007BFF', borderRadius: '25px', backgroundColor: '#FFFFFF' }} className='col-md-3 col-sm-6 col-lg-3 col-xs-12'>
								<br />
								<br />

								<h3>Join a Class Room</h3>
								<Input bsSize='lg' value={joinclassName} name="joinclassName" onChange={e => this.updateValue_Join(e)} type="text" className='placeholder-input form-control' placeholder="Class Name" /><br />
								<Input bsSize='lg' value={joinclassCode} name="joinclassCode" onChange={e => this.updateValue_Join(e)} type="text" className='placeholder-input form-control' placeholder="Class Code" /><br />
								<Button color='primary' type="button" className="btn btn-default btn-block" disabled={JoinClassButtonDisabled} onClick={this.JoinClass}>Join</Button>
								<br />
								<br />
								<h3>Create a Class Room</h3>
								<Input bsSize='lg' value={classname} name="classname" onChange={e => this.updateValue_Create(e)} type="text" className='placeholder-input form-control' placeholder="Class Name" required /><br />
								<Input bsSize='lg' value={subjectname} name="subjectname" onChange={e => this.updateValue_Create(e)} type="text" className='placeholder-input form-control' placeholder="Class Subject" required /><br />
								<Button outline color='primary' className='btn btn-block' id='generateCodeButton' type="button" disabled={isGenerateCodeDisabled} onClick={this.GenerateCode}>Create Class</Button>
								<Input bsSize='lg' id='code' style={{ display: showCodeInput ? 'block' : 'none' }} value={generatedclasscode} name="generatedclasscode" onChange={e => this.updateValue_Create(e)} type="text" readOnly />
								<Button color='primary' type="button" style={{ margin: '0px 0px 10px 0px' }} className="btn btn-block" disabled={CreateClassButtonDisabled} onClick={this.CreateClass}>Add</Button>
								<br />
								<br />
							</div>
						</Panel>
					</Collapse>
				</div>
				{/* JOIN AND CREATE CLASS */}
				<div style={{ textAlign: 'center', border: '1px solid #007BFF', borderRadius: '25px', backgroundColor: '#FFFFFF' }} className='col-md-3 hidden-sm col-lg-3 hidden-xs'>
					<br />
					<br />

					<h3>Join a Class Room</h3>
					<Input bsSize='lg' value={joinclassName} name="joinclassName" onChange={e => this.updateValue_Join(e)} type="text" className='placeholder-input form-control' placeholder="Class Name" /><br />
					<Input bsSize='lg' value={joinclassCode} name="joinclassCode" onChange={e => this.updateValue_Join(e)} type="text" className='placeholder-input form-control' placeholder="Class Code" /><br />
					<Button color='primary' type="button" className="btn btn-default btn-block" disabled={JoinClassButtonDisabled} onClick={this.JoinClass}>Join</Button>
					<br />
					<br />
					<h3>Create a Class Room</h3>
					<Input bsSize='lg' value={classname} name="classname" onChange={e => this.updateValue_Create(e)} type="text" className='placeholder-input form-control' placeholder="Class Name" required /><br />
					<Input bsSize='lg' value={subjectname} name="subjectname" onChange={e => this.updateValue_Create(e)} type="text" className='placeholder-input form-control' placeholder="Class Subject" required /><br />
					<Button outline color='primary' className='btn btn-block' id='generateCodeButton' type="button" disabled={isGenerateCodeDisabled} onClick={this.GenerateCode}>Create Class</Button>
					<Input bsSize='lg' id='code' style={{ display: showCodeInput ? 'block' : 'none' }} value={generatedclasscode} name="generatedclasscode" onChange={e => this.updateValue_Create(e)} type="text" readOnly />
					<Button color='primary' type="button" style={{ margin: '0px 0px 10px 0px' }} className="btn btn-block" disabled={CreateClassButtonDisabled} onClick={this.CreateClass}>Add</Button>
					<br />
					<br />
				</div>

				{/* SHOW CLASS LIST */}
				<div className='col-md-9 col-sm-6 col-lg-9 col-xs-6'>
					{
						Userz_Classes.map((cls, index) => {
							// console.log(cls.ClassID);
							return (
								<Card className="col-sm-5 col-lg-5 col-md-5" id='classesHover' outline color='primary' key={cls.ClassID} body style={{ width: '30rem', margin: '10px' }}>
									<CardHeader><h3 className='classname'>{cls.classname}</h3></CardHeader>
									<CardBody onClick={() => this.SelectedClassIDfromCardClick(ClassKeys, index)}>
										{/* <h3 color='dark'>{cls.classname}</h3> */}
										<br />
										<CardText className='classname'>{cls.subjectName}</CardText>
										<CardText className='classname'>Admin : {cls.teachername}</CardText>
									</CardBody>

									<CardFooter>
										<UncontrolledDropdown>
											<DropdownToggle className='pull-right' style={{ backgroundColor: '#F7F7F7', zIndex: 1 }}>
												<span className='dot' /><span className='dot' /><span className='dot' />
											</DropdownToggle>



											<DropdownMenu>
												{(user.user.uid === cls.teacherID) &&
													<DropdownItem onClick={() => this.showModalForEdit(cls.classname, cls.subjectName)}><i className="far fa-edit"></i>&nbsp;Edit Class/Subject Name</DropdownItem>
												}
												<Modal title="Edit Class Name/Subject" visible={visible} confirmLoading={confirmLoading}
													onOk={() => this.EditClassInfo(cls.ClassID, editableClassname, editableSubject)} onCancel={this.handleCancelForUpdate}
													footer={[<Button key='cancel' onClick={this.handleCancelForUpdate}>Cancel</Button>,
													<Button key='update' type="primary" disabled={UpdateButtonDisabled} onClick={() => this.EditClassInfo(cls.ClassID, editableClassname, editableSubject)}>Update</Button>,]}>
													<input value={editableClassname} name='editableClassname' onChange={(e) => this.handleChange(e)} className='form-control' type='text' placeholder='New Class Name' /><br />
													<input value={editableSubject} name='editableSubject' onChange={(e) => this.handleChange(e)} className='form-control' type='text' placeholder='New Subject Name' />
												</Modal>



												{(user.user.uid === cls.teacherID) &&
													<DropdownItem onClick={this.showModalClassCode}><i className="far fa-eye"></i>&nbsp;Show Class Code</DropdownItem>
												}
												<Modal title="Class Code" visible={visibles} onOk={this.handleOkforclasscode} confirmLoading={confirmLoadings} onCancel={this.handleCancelforclasscode} footer={''}>
													<h1 style={{ textAlign: 'center' }}>{cls.classcode}</h1>
												</Modal>

												{(user.user.uid !== cls.teacherID)
													? <DropdownItem onClick={() => this.LeaveClass(cls.ClassID)}><i className="fas fa-ban"></i>&nbsp;Leave Class</DropdownItem>
													: <DropdownItem onClick={() => this.DeleteClass(cls.ClassID)}><i className="fas fa-trash"></i>&nbsp;Delete Class</DropdownItem>
												}
											</DropdownMenu>



										</UncontrolledDropdown>
									</CardFooter>
								</Card>
								// style={{backgroundColor:'blue', width:'inherit',margin:'0px 0px 0px -13px'}}
							)
						})
					}
				</div>
			</div>
		)
	}
}



const mapStateToProps = (state) => {
	return {
		user: state.authReducers.user
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		// updateUser: (user) => dispatch(updateUser(user)),
		updateClassId: (ClassId) => dispatch(updateClassId(ClassId)),
		removeClassId: () => dispatch(removeClassId()),
		removeRecieverId: () => dispatch(removeRecieverId())
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ListOfClasses);
