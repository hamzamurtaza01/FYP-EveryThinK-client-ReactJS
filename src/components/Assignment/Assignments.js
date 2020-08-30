import React, { Component } from 'react';
import '../Quiz/Quiz.css';
import firebase from '../../firebase/firebase';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
// import { CardBody, CardHeader, CardFooter, CardTitle, Card, CardText } from 'reactstrap';
// import classnames from 'classnames';
// import { Divider } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
// import ReactDOM from 'react-dom';
// import Countdown from 'react-countdown-now';
// import { ProgressBar } from 'reactstrap';
import { Input, Button, DropdownToggle, UncontrolledDropdown, DropdownMenu, DropdownItem, Card, CardText, CardBody } from 'reactstrap';
import { message, Modal, Progress, Spin, Divider } from 'antd';
// import swal from 'sweetalert';
// import Timer from 'react-compound-timer';
import * as routes from '../../constants/routes';
import { connect } from 'react-redux';

const database = firebase.database();
const confirm = Modal.confirm;
var AssignRef;


class Assignments extends Component {
	constructor(props) {
		super(props);
		this.toggle = this.toggle.bind(this);
		this.state = {
			activeTab: '1',
			Teacher_ID: '',
			assignId: '',
			AssignName: '',
			AssignListKeys: [],
			AssignListValues: [],
			timeInSeconds: 0,
			Assignment_Questions: [],
			Assign_solutions: [],
			score: 0,
			ShowScore: false,
			ShowResult: false,
			resultKeysArr: [],
			resultValuesArr: []

		};
	}


	componentDidMount() {
		this.CheckTeacher();
		this.RetrieveAssignList();
		// await this.RetrieveAssignQuestions();
		// this.init_answers_Array();
	}

	componentWillUnmount() {
		AssignRef.off();
	}


	toggle(tab) {
		if (this.state.activeTab !== tab) {
			this.setState({
				activeTab: tab
			});
		}
	}

	showDeleteConfirm = (a_ID) => {
		confirm({
			title: 'Are you sure to delete this assignment?',
			// content: 'Some descriptions',
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk: () => {
				this.DeleteAssign(a_ID);
				console.log('Assignment Deleted!');
			},
			onCancel() {

			},
		});
	}

	CheckTeacher = () => {
		const { ClassID } = this.props;

		const classRef = database.ref(`Classes/${ClassID}`);
		classRef.once('value', (clsinfo) => {
			const cls = clsinfo.val();
			const Teacher_ID = cls.teacherID;
			this.setState({ Teacher_ID: Teacher_ID });
		})
	}

	RetrieveAssignList = () => {
		const { ClassID } = this.props;

		AssignRef = database.ref(`Assignment_Questions/${ClassID}`);
		AssignRef.on('value', (assignObj) => {
			const ASSIGN = assignObj.val();
			if (!ASSIGN) {
				return;
			}
			const qkeys = Object.keys(ASSIGN);
			const qvalues = Object.values(ASSIGN);
			// const AssignNames = [];

			// qkeys.forEach((key, index) => {
			//     AssignNames[index] = qvalues[index].name;
			// })

			// console.log(qkeys, qvalues);

			this.setState({ AssignListValues: qvalues, AssignListKeys: qkeys });
		})
	}


	RetrieveAssignQuestions = (assignId) => {
		const { ClassID } = this.props;
		// this.setState({ assignId: assignId, AssignName: Aname });

		const AssignQuesRef = database.ref(`Assignment_Questions/${ClassID}/${assignId}`);
		AssignQuesRef.once('value', (quesObj) => {
			const QUES = quesObj.val();
			if (!QUES) {
				return;
			}

			const questions = QUES.Questions; //Yahan pe error dega jab bhi, mtlab classID selected nahi hai, FLOW SAHI KRNA PREGA NAV. KA
			// const Teacher_ID = QUES.Teacherid;
			const timeInSeconds = QUES.timeInSeconds;
			console.log(questions);
			this.setState({ Assignment_Questions: questions, /*Teacher_ID: Teacher_ID,*/ timeInSeconds: timeInSeconds }, () => this.init_answers_Array);
		})
	}

	init_answers_Array = () => {
		const { Assignment_Questions, Assign_solutions } = this.state;
		Assignment_Questions.forEach((ques, index) =>
			Assign_solutions[index] = ''
		)
		this.setState({ Assign_solutions });
	}



	saveAnswer = (e, index) => {
		const { Assign_solutions } = this.state;
		Assign_solutions[index] = e.target.value;
		this.setState({ Assign_solutions });
	}

	On_Assign_Submit = () => {
		const { Assign_solutions, assignId } = this.state;
		const { ClassID, UserInfo } = this.props;
		const userid = UserInfo.userid;
		const username = UserInfo.username;
		const nodename = 'Assignment_Results';
		const ansRef = 'Assignment_Answers';
		message.success('Assignment Successfully Submitted');
		// console.log(Assign_solutions);
		fetch(`http://localhost:8000/result?solutions=${Assign_solutions}&ClassID=${ClassID}&Q_or_A_ID=${assignId}&NodeName=${nodename}&studentId=${userid}&answerRef=${ansRef}&StudentName=${username}`)
			.then((response) => {
				return response.json();
			})
			.then((myJson) => {
				// console.log(myJson);
				// const my_json = JSON.stringify(myJson);
				// console.log(my_json);
				const Xcore = myJson.score;
				const theScore = Number(Xcore);
				this.setState({ score: theScore }, () => {
					console.log(this.state.score);
					this.showModalForScore();
				})
			});
	}

	showModalForScore = () => {
		this.setState({
			ShowScore: true,
		});
	};
	handleOkForScore = () => {
		this.setState({
			ShowScore: false,
			score: ''
		}, () => {
			this.LeaveAssign();
		});
	};
	handleCancelForScore = () => {
		this.setState({
			ShowScore: false,
			score: ''
		}, () => {
			this.LeaveAssign();
		});
	};


	GetReport = (assignID) => {
		const { ClassID } = this.props;
		// console.log('assignID', assignID)

		const ResultRef = database.ref(`Assignment_Results/${ClassID}/${assignID}`);
		ResultRef.once('value', (Obj) => {
			const result = Obj.val();
			console.log(result)
			if (result !== null){
			const resultKeysArr = Object.keys(result);
			const resultValuesArr = Object.values(result);
			console.log(resultKeysArr, resultValuesArr);
			this.setState({ resultKeysArr, resultValuesArr });
		}
		})
	}
	showModalForResult = (assignID) => {
		this.GetReport(assignID);
		this.setState({
			ShowResult: true,
		});
	};
	handleOkForResult = () => {
		this.setState({
			ShowResult: false
		});
	};
	handleCancelForResult = () => {
		this.setState({
			ShowResult: false
		});
	};


	DeleteAssign = (assignkiID) => {
		const { ClassID } = this.props;
		var updatesAssign = {};
		updatesAssign[`/Assignment_Questions/${ClassID}/${assignkiID}/isDeleted`] = true;
		return database.ref().update(updatesAssign);
	}

	ChangeComponentToAssignCreate = () => {
		this.props.history.push(routes.ASSIGN_CREATE);
	}

	LeaveAssignConfirm = () => {
		confirm({
			title: "Are you sure to leave this assignment page? Your progress will be lost.",
			// content: 'Some descriptions',
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk: () => {
				this.LeaveAssign();
			},
			onCancel() {

			},
		});
	}
	LeaveAssign = () => {
		this.setState({ assignId: '' })
	}

	setAssignIDandName = (key, Aname) => {
		this.setState({ assignId: key, AssignName: Aname }, () => this.RetrieveAssignQuestions(key))
	}
	handleChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	}


	renderQuestions = () => {
		const { Assignment_Questions, Assign_solutions } = this.state;

		return Assignment_Questions.map((ques, index) => {
			// console.log(ques)
			return (
				<div className='post' key={index} style={{ margin: '16px 0px 16px 0px', padding: '20px', borderRadius: '8px' }}>
					<div>
						<label>Question#{index + 1}:</label>
						<p><b>{ques}</b></p>
					</div>

					<textarea rows='2' value={Assign_solutions[index] || ''} name='Assign_solutions' onChange={(e) => this.saveAnswer(e, index)} style={{ resize: 'none' }} type='text' className='form-control' />

				</div>
			)
		})
	}

	render() {
		const { assignId, AssignName, Teacher_ID, AssignListKeys, AssignListValues, score, resultKeysArr, resultValuesArr } = this.state;
		const UserInfo = this.props.UserInfo || { UserInfo: {} };
		const userid = UserInfo.userid;

		return (
			<div className="container">

				{
					Teacher_ID === userid ?
						<div>
							<Button size='md' color='warning' onClick={this.ChangeComponentToAssignCreate} className='form-control col-lg-3 col-md-4 col-sm-12 col-xs-12 float-right'>Create new assignment &nbsp;&nbsp;&nbsp; <i className="fas fa-plus"></i></Button>
							<br />
							<br />
							<br />
							<br />
							{/* <h3 style={{ fontWeight: 'bold', color: '#395498' }}>Created Assignments</h3><br /> */}
							{/* <div className='overflow' style={{ overflowY: 'auto' }}> */}

							<Nav pills>
								<NavItem>
									<NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
										Assignments Assigned
                        			</NavLink>
								</NavItem>
								<NavItem>
									<NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
										Previous Assignments
                        			</NavLink>
								</NavItem>
							</Nav>

							<TabContent activeTab={this.state.activeTab}>
								<TabPane tabId="1">
									{
										AssignListKeys.map((key, index) => {
											const A = AssignListValues[index];
											const date = new Date();

											return (
												!A.isDeleted && A.submissionTimestamp > date.getTime() &&

												<div key={key} id='classesHover' style={{ margin: '16px 0px 16px 0px', padding: '20px', backgroundColor: 'white' }} className="container">
													<UncontrolledDropdown className='float-right'>
														<DropdownToggle style={{ zIndex: 1 }}>
															<span className='dotsDropDown' /><span className='dotsDropDown' /><span className='dotsDropDown' />
														</DropdownToggle>

														<DropdownMenu>



															<DropdownItem onClick={() => this.showDeleteConfirm(key)}><i className="fas fa-trash"></i>&nbsp;Delete Assignment</DropdownItem>
														</DropdownMenu>
													</UncontrolledDropdown>
													<div className='pull-left' style={{ padding: '0px 0px 0px 15px' }}>
														<h3>{A.name}</h3>
													</div>

													<div className='pull-right' style={{ padding: '15px 50px 0px 0px' }}>
														<h4>Submission Date: {A.submissionDay}, {A.submissionDate}</h4>
														<h4>{A.submissionTime}</h4>
														{/* <h4 className='text-danger'>22 Days late</h4> */}
													</div>
												</div>
											)
										})
									}
								</TabPane>
								<TabPane tabId="2">
									{
										AssignListKeys.map((key, index) => {
											const A = AssignListValues[index];
											const date = new Date();
											return (
												!A.isDeleted && A.submissionTimestamp <= date.getTime() &&

												<div key={key} id='classesHover' style={{ margin: '16px 0px 16px 0px', padding: '20px', backgroundColor: 'white' }} className="container">
													<UncontrolledDropdown className='float-right'>
														<DropdownToggle style={{ zIndex: 1 }}>
															<span className='dotsDropDown' /><span className='dotsDropDown' /><span className='dotsDropDown' />
														</DropdownToggle>

														<DropdownMenu>
															<DropdownItem onClick={() => this.showModalForResult(key)}><i className="fas fa-poll"></i>&nbsp;Show Results</DropdownItem>
														</DropdownMenu>
													</UncontrolledDropdown>
													<div className='pull-left' style={{ padding: '0px 0px 0px 15px' }}>
														<h3>{A.name}</h3>
														{/* <p>Today is Sep 25, 2018</p> */}
														{/* <h2>Late</h2> */}
													</div>

													<div className='pull-right' style={{ padding: '15px 50px 0px 0px' }}>
														<h4 className='text-secondary'>Date: {A.submissionDay}, {A.submissionDate}</h4>
														<h4 className='text-secondary'>{A.submissionTime}</h4>
														{/* <h4 className='text-danger'>22 Days late</h4> */}
													</div>

													<Modal title={A.name} visible={this.state.ShowResult} onOk={this.handleOkForResult} onCancel={this.handleCancelForResult} footer={[]}>
														{/* <h1 style={{ textAlign: 'center' }}>{score}</h1> */}
														<div className='table-responsive'>
															<table className='table'>
																<tbody>
																	<tr>
																		<th>Student Name</th>
																		<th>Score</th>
																	</tr>

																	{
																		resultKeysArr.map((key, index) => {
																			const res = resultValuesArr[index];
																			return (
																				<tr key={key} className='text-center'>
																					<td>{res.username}</td>
																					<td>{res.score}</td>
																				</tr>
																			)
																		})
																	}
																</tbody>
															</table>
														</div>
													</Modal>
												</div>
											)
										})
									}
								</TabPane>
							</TabContent>

						</div>


						:

						// ELSE
						// IF STUDENTS
						<div>
							{
								// if Assign id is NOT present in state, then render 
								// list of assignments of that class
								!assignId ?
									<div>
										<Nav pills>
											<NavItem>
												<NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
													Pending Assignments
                        						</NavLink>
											</NavItem>
											<NavItem>
												<NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
													Finished Assignments
                    			    			</NavLink>
											</NavItem>
											{/* <NavItem>
												<NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
													Unfinished Assignments
                        						</NavLink>
											</NavItem> */}
										</Nav>

										<TabContent activeTab={this.state.activeTab}>
											<TabPane tabId="1">
												{
													AssignListKeys.map((key, index) => {
														const A = AssignListValues[index];
														const date = new Date();

														return (
															!A.isDeleted && A.submissionTimestamp > date.getTime() &&

															<div key={key} onClick={() => this.setAssignIDandName(key, A.name)} id='classesHover' style={{ margin: '16px 0px 16px 0px', padding: '20px', backgroundColor: 'white' }} className="container">
																<div className='pull-left' style={{ padding: '0px 0px 0px 15px' }}>
																	<h3>{A.name}</h3>
																	{/* <p>Today is Sep 25, 2018</p> */}
																	{/* <h2>Late</h2> */}
																</div>

																<div className='pull-right' style={{ padding: '0px 50px 0px 0px' }}>
																	<h4 className='text-secondary'>Due {A.submissionDay}, {A.submissionDate}</h4>
																	<h4 className='text-dark'>{A.submissionTime}</h4>
																	{/* <p>{A.submissionTime}</p> */}
																	{/* <h4 className='text-danger'>22 Days late</h4> */}
																</div>
															</div>

															// <Card key={key} style={{ color: 'white', backgroundColor: '#262f3d', marginBottom: '5px' }}>
															// 	<CardBody>
															// 		<CardText className='TextOverFlowControl'>{A.name}</CardText>
															// 		<UncontrolledDropdown className='float-right'>
															// 			<DropdownToggle style={{ backgroundColor: '#262f3d', zIndex: 1 }}>
															// 				<span className='dotsDropDown' /><span className='dotsDropDown' /><span className='dotsDropDown' />
															// 			</DropdownToggle>

															// 			<DropdownMenu>
															// 				{/* <DropdownItem onClick={() => this.showModalForAssignCode(index)}><i className="far fa-eye"></i>&nbsp;Show Assign Code</DropdownItem> */}
															// 				<DropdownItem onClick={() => this.showDeleteConfirm(key)}><i className="fas fa-trash"></i>&nbsp;Delete Assignment</DropdownItem>
															// 			</DropdownMenu>
															// 		</UncontrolledDropdown>
															// 	</CardBody>
															// 	{/* <Modal title="Assign Code" visible={this.state.visible} onOk={this.handleOkForAssignCode} onCancel={this.handleCancelForAssignCode} footer={''}>
															// 		<h1 style={{ textAlign: 'center' }}>{quizCODE}</h1>
															// 	</Modal> */}
															// </Card>
														)
													})
												}
											</TabPane>
											<TabPane tabId="2">
												{
													AssignListKeys.map((key, index) => {
														const A = AssignListValues[index];
														const date = new Date();

														return (
															!A.isDeleted && A.submissionTimestamp <= date.getTime() &&

															<div key={key} style={{ margin: '16px 0px 16px 0px', padding: '20px', backgroundColor: 'white' }} className="container">

																<div className='pull-left' style={{ padding: '0px 0px 0px 15px' }}>
																	<h3>{A.name}</h3>
																	<h4 className='text-dark'>{A.submissionDay}, {A.submissionDate}</h4>

																	{/* <p>Today is Sep 25, 2018</p> */}
																	{/* <h2>Late</h2> */}
																</div>

																{/* <div className='pull-right' style={{ padding: '15px 50px 0px 0px' }}>
																	<h4>Due Sep 25, 2018</h4>
																	<p>11:45 pm</p>
																	<h4 className='text-danger'>22 Days late</h4>
																</div> */}
															</div>
														)
													})
												}
											</TabPane>
											{/* <TabPane tabId="3">
												{
													AssignListKeys.map((key, index) => {
														const A = AssignListValues[index];
														const date = new Date();

														return (
															!A.isDeleted && A.submissionTimestamp <= date.getTime() &&

															<div key={key} style={{ margin: '16px 0px 16px 0px', padding: '20px', backgroundColor: 'white' }} className="container">

																<div className='pull-left' style={{ padding: '0px 0px 0px 15px' }}>
																	<h3>{A.name}</h3>
																	<h4 className='text-danger'>Missed {A.submissionDay}, {A.submissionDate}</h4>
																</div>
															</div>
														)
													})
												}
											</TabPane> */}
										</TabContent>

									</div>

									:

									// if Assign id is present in state, then render this
									assignId && //show question paper to solve assignment
									<div className='container'>
										<Button size='lg' color='primary' onClick={this.LeaveAssignConfirm} className=' col-lg-2 col-md-3 col-sm-12 col-xs-12'>back</Button>

										<h1 className=''>{AssignName}</h1>
										<div className='' style={{ position: 'fixed', zIndex: '1', top: '90px', right: '110px' }}>

											{/* <Timer direction='backward' initialTime={timeInSeconds}>
												<h4>Your assignment will end in the given time below</h4>
												<h4><Timer.Hours /> Hours &nbsp;<Timer.Minutes /> Minutes &nbsp;<Timer.Seconds /> Seconds</h4>
											</Timer> */}

										</div>

										{/* <Spin size='large' tip="Loading... type text to show here"> */}
										{this.renderQuestions()}
										{/* </Spin> */}

										<Button color='warning' className='btn-lg pull-right' onClick={this.On_Assign_Submit}>Submit</Button>
										{/* <Button color='warning' className='btn-lg pull-right' onClick={this.On_Assign_Submit}>Submit</Button> */}

										<Modal title="Your Result" visible={this.state.ShowScore} onOk={this.handleOkForScore} onCancel={this.handleCancelForScore}
											footer={[
												<Progress key={score} percent={score} showInfo={false} />
											]}>
											<h1 style={{ textAlign: 'center' }}>{score}</h1>
											{/* <div className='table-responsive'>
												<table className='table'>
													<tr>
														<th>ClassName</th>
														<th>Assign Heading / Assign Number/Assign Name</th>
													</tr>
													<tr className='text-center'>
														<td>fyp2</td>
														<td>Assign#1</td>
													</tr>
												</table>
											</div> */}
										</Modal>

									</div>

							}
						</div>
				}
			</div>
		)
	}
}


const mapStateToProps = (state) => {
	return {
		user: state.authReducers.user,
		ClassID: state.ClassIDReducers.ClassId,
		UserInfo: state.UserInfoReducers.info,
		RecieverId: state.RecieverIDReducers.RecieverId,
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		// updateRecieverId: (RecieverId) => dispatch(updateRecieverId(RecieverId))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Assignments);