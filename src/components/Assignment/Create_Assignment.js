import React, { Component } from 'react';
import '../Quiz/CreateQuiz.css';
import firebase from '../../firebase/firebase';
import { Button, Input, DropdownToggle, UncontrolledDropdown, DropdownMenu, DropdownItem } from 'reactstrap';
// import { CardBody, CardHeader, CardFooter, CardTitle, Card, CardText } from 'reactstrap';
import { Spin } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { connect } from 'react-redux';
import { message, Divider } from 'antd';
import DateTimePicker from 'react-datetime-picker';
// import moment from 'moment';

const database = firebase.database();
const format = 'HH:mm';

class Create_Assignment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            assignname: '',
            submissionDay: '',
            submissionDate: '',
            submissionTime: '',
            submissionTimestamp: 0,
            questions: [''],
            answers: [''],
            UploadAssignButtonDisabled: true,
            date: new Date(),
        };
    }
    onChangeDate = date => {
        const dateToShow = date.toString().split(' GMT+')[0];
        const DATE = dateToShow.substring(0, dateToShow.length - 3).split(' ');
        const submissionDay = DATE[0];
        const submissionDate = DATE[1] + ' ' + DATE[2] + ', ' + DATE[3];
        const submissionTime = DATE[4];

        const timestamp = date.getTime();
        // console.log(DATE)
        // console.log(submissionDay + ' ', submissionDate + ' ', submissionTime + ' ', timestamp);
        this.setState({ date, submissionDay, submissionDate, submissionTime, submissionTimestamp: timestamp }, () => console.log(this.state.date))
    }

    CreateNewQuestionField = () => {
        const { questions, answers } = this.state;
        questions.push('');
        answers.push('');
        // questions.forEach((ques, index) =>
        //     answers[index] = ''
        // )
        console.log(questions, answers);
        this.setState({ questions, answers }, () => this.isUploadAssignButtonDisabled());
    }


    saveQuestion = (e, index) => {
        const { questions } = this.state;
        questions[index] = e.target.value;
        this.setState({ questions }, () => this.isUploadAssignButtonDisabled());
    }
    saveAnswer = (e, index) => {
        const { answers } = this.state;
        answers[index] = e.target.value;
        this.setState({ answers }, () => this.isUploadAssignButtonDisabled());
    }
    isUploadAssignButtonDisabled = () => {
        const { answers, questions } = this.state;

        const isQues = this.checkArray(questions);
        const isAns = this.checkArray(answers);

        // console.log(isQues, isAns)
        const is = isQues || isAns;
        // console.info('disabled: ', is);

        this.setState({ UploadAssignButtonDisabled: is })
    }
    checkArray = (my_arr) => {
        for (var i = 0; i < my_arr.length; i++) {
            if (my_arr[i] === "")
                return true;
        }
        return false;
    }

    RemoveQuestion = (thisQues, thisAns) => {
        console.log(thisAns);
        const { questions, answers } = this.state;
        const quesArr = questions.filter(question => question !== thisQues);

        // console.log({ answers });
        const ansArr = answers.filter(answer => answer !== thisAns);
        // console.log({ ansArr });

        this.setState({ questions: quesArr, answers: ansArr }, () => this.renderQuestionsAndCheckUploadAssignButtonDisabled())
    }

    renderQuestionsAndCheckUploadAssignButtonDisabled = () => {
        this.isUploadAssignButtonDisabled();
        this.renderQuestions();
    }


    // GetTimeFunc = (e) => {
    //     // const {submissionTime} = this.state;
    //     console.log(Date.now())
    //     console.log(Date)

    //     const time_d = e && e._d && e._d.toString();
    //     // console.log(time_d);
    //     if (time_d) {
    //         const tym = time_d.split(' ')[4].toString();
    //         // console.log(tym);
    //         const secondcolonIndex = tym.lastIndexOf(':');
    //         const Time = tym.slice(0, secondcolonIndex);
    //         console.log(Time);

    //         this.setState({ submissionTime: Time });
    //     }
    // }

    UploadQuestions = async () => {
        const { assignname, questions, answers, submissionDay, submissionDate, submissionTime, submissionTimestamp } = this.state;
        const { ClassID, UserInfo } = this.props;

        const assignQuesRef = database.ref(`Assignment_Questions/${ClassID}`);
        const assignID = await assignQuesRef.push().key;
        await assignQuesRef.child(assignID).set({
            Teacherid: UserInfo.userid,
            Questions: questions,
            name: assignname,
            submissionDay,
            submissionDate,
            submissionTime,
            submissionTimestamp,
            latestTimestamp: Date.now(),         // For order by ........
            isDeleted: false,
            // expired: true                     // jisne attempt krliya hai usky pas show na hou Quiz, ye rehtaa hai abhi
        })

        const assignAnsRef = database.ref(`Assignment_Answers/${ClassID}`);
        await assignAnsRef.child(assignID).set({
            Answers: answers,
            latestTimestamp: Date.now(),
        })
        message.success('Assignment Uploaded');
        this.historyGoBack();
    }
    historyGoBack = () => {
        this.props.history.goBack();
    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }


    renderQuestions = () => {
        const { questions, answers } = this.state;

        return questions.map((ques, index) => {
            return (
                <div className='post' key={index} style={{ margin: '16px 0px 16px 0px', padding: '20px', borderRadius: '8px' }}>
                    <div>
                        <UncontrolledDropdown>
                            <DropdownToggle className='pull-right' style={{ backgroundColor: 'white' }}>
                                <span className='dot' /><span className='dot' /><span className='dot' />
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={() => this.RemoveQuestion(ques, answers[index])}>Remove Question</DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                        <label>Question#{index + 1}:</label>
                        {/* <p>{ques}</p> */}
                        {/* <textarea rows='2' value={ques || ''} onChange={(e) => this.saveQuestion(e, index)} style={{ resize: 'none', margin: '0px 0px 5px 0px', fontWeight: 'bold' }} type='text' className='form-control' /> */}
                        <TextArea value={ques || ''} onChange={(e) => this.saveQuestion(e, index)} style={{ resize: 'none', margin: '0px 0px 5px 0px', fontWeight: 'bold' }} className='form-control' type='text' autosize={{ minRows: 2, maxRows: 5 }} /><br />
                        {/* <TextArea style={{ resize: 'none' }} value={'value'} autosize={{ minRows: 3, maxRows: 9 }} /> */}

                    </div>
                    <label>Answer:</label>
                    {/* <textarea rows='2' value={answers[index] || ''} onChange={(e) => this.saveAnswer(e, index)} style={{ resize: 'none', margin: '0px 0px 5px 0px' }} type='text' className='form-control' /> */}
                    <TextArea value={answers[index] || ''} onChange={(e) => this.saveAnswer(e, index)} style={{ resize: 'none', margin: '0px 0px 5px 0px' }} className='form-control' type='text' autosize={{ minRows: 3, maxRows: 9 }} /><br />
                </div>
            )
        })
    }


    render() {
        const { assignname, questions } = this.state;

        return (
            <div className='container'>

                <Button size='lg' outline color='primary' onClick={this.historyGoBack} className=' col-lg-1 col-md-2 col-sm-2 col-xs-2'><i className="fas fa-arrow-left"></i> back</Button>

                <div>
                    <div className='post' style={{ margin: '16px 0px 16px 0px', padding: '20px', borderRadius: '8px' }}>
                        <h4>Assignment Name</h4><br />
                        <Input bssize='lg' value={assignname} name='assignname' onChange={(e) => this.handleChange(e)} type='text' className='form-control form' placeholder='Assignment Name' />
                        <br />
                        <h4>Select Deadline for Submission</h4><br />
                        <DateTimePicker onChange={this.onChangeDate} value={this.state.date} />
                    </div>

                    {questions.length > 0 &&
                        <h3 className='text-center'>Assignment Questions</h3>
                    }

                    {/* <Spin size='large' spinning={false} tip="Loading... type text to show here"> */}
                    {this.renderQuestions()}
                    {/* </Spin> */}

                    <Button size='lg' color='primary' type="button" className='pull-right' onClick={this.CreateNewQuestionField}>More Questions?</Button>
                    <br />
                    <br />
                    <Divider />
                    <br/>
                    <br/>
                    {questions.length > 0 &&
                        <Button size='lg' color='success' className='pull-right' disabled={this.state.UploadAssignButtonDisabled} onClick={this.UploadQuestions}>Upload Assignment</Button>
                    }
                </div>
            </div>
        );
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

export default connect(mapStateToProps, mapDispatchToProps)(Create_Assignment);
