import React, { Component } from 'react';
import './CreateQuiz.css';
import firebase from '../../firebase/firebase';
// import { Divider } from 'antd';
import { Button, Input, DropdownToggle, UncontrolledDropdown, DropdownMenu, DropdownItem } from 'reactstrap';
import { connect } from 'react-redux';
import { Spin, Modal, TimePicker } from 'antd';
// import moment from 'moment';

const database = firebase.database();

const format = 'HH:mm';
class CreateQuiz extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            quizname: '',
            noOfQuestions: '',
            chapterText: '',
            timeInSeconds: 0,
            questions: [],
            answers: [],
            showQuizCode: false,
            Quizcode: '',
            UploadQuizButtonDisabled: true,
            showSpinner: false
        }
    }

    showQuizCodeModal = () => {
        this.setState({
            showQuizCode: true,
        });
    };

    handleQuizCodeOk = () => {
        this.setState({
            showQuizCode: false
        })
    };

    handleQuizCodeCancel = () => {
        this.setState({
            showQuizCode: false
        })
    };

    GetQuestionsFromText = async () => {
        this.setState({ showSpinner: true });
        this.fetchData(); // removed await from here and wrote in the next line
        await this.init_answers_Array();
    }
    fetchData = () => {
        const { chapterText, noOfQuestions } = this.state;
        const num = noOfQuestions;
        const NumOfQues = Number(num);
        this.setState({ showSpinner: true });

        fetch(`http://localhost:8000/questions?chapterText=${chapterText}&NumOfQues=${NumOfQues}`)
            .then((response) => {
                return response.json();
            })
            .then((myJson) => {
                // console.log(myJson);
                // const my_json = JSON.stringify(myJson);
                // console.log(my_json);
                this.setState({ questions: myJson.result }, () => console.log(this.state.questions))
            });
    }
    init_answers_Array = () => {
        const { questions, answers } = this.state;
        questions.forEach((ques, index) =>
            answers[index] = ''
        )
        this.setState({ answers, showSpinner: false });
    }




    saveAnswer = (e, index) => {
        const { answers } = this.state;
        answers[index] = e.target.value;
        this.setState({ answers }, () => this.isUploadQuizButtonDisabled());
    }

    isUploadQuizButtonDisabled = () => {
        const { answers } = this.state;

        const is = this.checkArray(answers); // TEST THIS, srf disabled={!UploadQuizButtonDisabled} krna hai
        // console.log(is)

        this.setState({ UploadQuizButtonDisabled: is })
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

        this.setState({ questions: quesArr, answers: ansArr }, () => this.renderQuestionsAndCheckUploadQuizButtonDisabled());
    }

    renderQuestionsAndCheckUploadQuizButtonDisabled = () => {
        this.isUploadQuizButtonDisabled();
        this.renderQuestions();
    }


    GenerateQuizCode = () => {
        const code = Math.random().toString(36).slice(2, 8).toUpperCase();
        this.setState({ Quizcode: code }, () => {
            this.showQuizCodeModal();
        })
    }

    GetTimeFunc = (e) => {
        // const {timeInSeconds} = this.state;
        const time_d = e && e._d && e._d.toString();
        // console.log(time_d);
        if (time_d) {
            const tym = time_d.split(' ')[4].toString();
            // console.log(tym);
            const tymArr = tym.split(':');
            console.log(tymArr);
            const hours = tymArr[0] === '00' ? '' : tymArr[0] === '01' ? `${tymArr[0]} hour` : `${tymArr[0]} hours`;
            const minutes = tymArr[1] === '00' ? '' : tymArr[1] === '01' ? `${tymArr[1]} minute` : `${tymArr[1]} minutes`;
            const And = (tymArr[0] === '00' || tymArr[1] === '00') ? '' : ' and ';


            const timeInHoursMinutes = `${hours}${And}${minutes}`;
            // const timeInHoursMinutes = `${tymArr[0]} hours, ${tymArr[1]} minutes`;
            console.log(timeInHoursMinutes);
            const timeInSeconds = tymArr[0] * 3600 + tymArr[1] * 60;
            // console.log(timeInSeconds);
            this.setState({ timeInSeconds, timeInHoursMinutes });
        }
    }

    UploadQuestions = async () => {
        const { quizname, questions, answers, timeInSeconds } = this.state;
        const { ClassID, UserInfo } = this.props;

        this.GenerateQuizCode();

        const QuizQuesRef = database.ref(`Quiz_Questions/${ClassID}`);
        const QuizID = await QuizQuesRef.push().key;
        await QuizQuesRef.child(QuizID).set({
            Teacherid: UserInfo.userid,
            Questions: questions,
            name: quizname,
            quizcode: this.state.Quizcode,
            timeInSeconds: timeInSeconds,
            latestTimestamp: Date.now(),
            isDeleted: false,
            expired: true
        })

        const QuizAnsRef = database.ref(`Quiz_Answers/${ClassID}`);
        await QuizAnsRef.child(QuizID).set({
            Answers: answers,
            latestTimestamp: Date.now(),
        })

        // this.setState({})
        // this.historyGoBack();
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
                        <p>{ques}</p>

                    </div>
                    <textarea rows='2' value={answers[index] || ''} name='answers' onChange={(e) => this.saveAnswer(e, index)} style={{ resize: 'none' }} type='text' className='form-control' />

                </div>
            )
        })
    }

    render() {
        const { quizname, noOfQuestions, chapterText, Quizcode, questions, showSpinner } = this.state;

        return (
            <div className='container'>
                <Button size='lg' color='primary' onClick={this.historyGoBack} className=' col-lg-1 col-md-2 col-sm-2 col-xs-2'>back</Button>

                <div>
                    <div className='post' style={{ margin: '16px 0px 16px 0px', padding: '20px', borderRadius: '8px' }}>
                        <h4>Quiz Name</h4>
                        <Input bssize='lg' value={quizname} name='quizname' onChange={(e) => this.handleChange(e)} type='text' className='form-control form' placeholder='Quiz Name' />
                        {/* <Divider /> */}
                        <br />
                        <h4>Select Time Duration</h4>
                        <TimePicker size="large" format={format} name='timeInSeconds' onChange={(e) => this.GetTimeFunc(e)} />
                        <br />
                        <br />
                        <h4>Total Number of questions (optional)</h4>
                        <Input bssize='lg' value={noOfQuestions} name='noOfQuestions' onChange={(e) => this.handleChange(e)} type='number' className='form-control form' placeholder='1,2,3,4,5....' />
                        {/* <Divider /> */}
                        <br />
                        <h4>Type a text for generating a quiz</h4>
                        <textarea rows='5' value={chapterText} name='chapterText' onChange={(e) => this.handleChange(e)} style={{ resize: 'none' }} type='text' className='form-control' placeholder='Example : EveryThink is an easy way to get your students connected so they can safely collaborate, get and stay organized, and access assignments, quizzes...' />
                        <br />

                        <Button color='success' className='btn-lg pull-right' disabled={!chapterText} onClick={this.GetQuestionsFromText}>Generate Questions</Button>
                    </div>
                    {/* <Divider /> */}

                    {questions.length > 0 &&
                        <h3 className='text-center'>Quiz Questions</h3>
                    }

                    {showSpinner ?
                        <Spin size='large' spinning={false} tip="Loading... type text to show here">
                            <br/><br/><br/><br/><br/><br/>
                        </Spin>
                        :
                        <>
                            {this.renderQuestions()}
                        </>
                    }

                    {questions.length > 0 &&
                        <Button color='success' className='btn-lg pull-right' disabled={this.state.UploadQuizButtonDisabled} onClick={this.UploadQuestions}>Upload Quiz</Button>
                    }
                    <br /><br /><br /><br />

                    {/* <Button color='success' className='btn-lg pull-right' onClick={this.showModal}>Upload Quiz</Button> */}


                    <Modal title="Quiz Code" visible={this.state.showQuizCode} onOk={this.handleQuizCodeOk} onCancel={this.handleQuizCodeCancel} footer={''}
                    // footer={[
                    //     <Progress percent={30} showInfo={false} />
                    // ]}
                    >
                        <div>
                            <p>Enter the quiz key for student to start the quiz. This code can also be viewed later by the Teacher, from the created quizzes list.</p>
                            <h1 style={{ textAlign: 'center' }}>{Quizcode}</h1>

                            {/* QUIZ # 1
                                SCORE: 40% */}

                            {/* <table className='table'>
                                <tr>
                                    <th>ClassName</th>
                                    <th>Quiz Heading / Quiz Number/Quiz Name</th>
                                </tr>
                                <tr className='text-center'>
                                    <td>fyp2</td>
                                    <td>Quiz#1</td>
                                </tr>
                            </table> */}

                        </div>
                    </Modal>


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

export default connect(mapStateToProps, mapDispatchToProps)(CreateQuiz);
