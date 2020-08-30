import React from 'react';
import './Quiz.css';
// import ReactDOM from 'react-dom';
// import Countdown from 'react-countdown-now';
// import { ProgressBar } from 'reactstrap';
import * as routes from '../../constants/routes';
import firebase from '../../firebase/firebase';
import { Input, Button, DropdownToggle, UncontrolledDropdown, DropdownMenu, DropdownItem, Card, CardText, CardBody } from 'reactstrap';
import { message, Modal, Progress, Spin, Divider } from 'antd';
// import swal from 'sweetalert';
import { connect } from 'react-redux';
import Timer from 'react-compound-timer';

const database = firebase.database();
const confirm = Modal.confirm;
var QuizRef;


class Quiz extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Teacher_ID: '',
            quizId: '',
            Quizname: '',
            QuizListkeys: [],
            QuizListvalues: [],
            timeInSeconds: 0,
            Quiz_Questions: [],
            Quiz_solutions: [],
            enteredQuizKey: '',
            isQuizKeyValid: false,
            quizCODE: '',
            visible: false,
            score: '',
            ShowScore: false,
            ShowResult: false,
            resultKeysArr: [],
            resultValuesArr: []
        };
    }

    componentDidMount() {
        this.CheckTeacher();
        this.RetrieveQuizList();
        // await this.RetrieveQuizQuestions();
        // this.init_answers_Array();
        // this.CheckStudentAttendanceForQuiz('-LgEsOLYqfD8Ry2HJcgk')        

    }

    componentWillUnmount() {
        QuizRef.off();
    }


    showModalForQuizCode = (index) => {
        this.setState({
            visible: true,
            quizCODE: this.state.QuizListvalues[index].quizcode
        });
    };
    handleOkForQuizCode = () => {
        this.setState({
            visible: false,
            quizCODE: ''
        });
    };
    handleCancelForQuizCode = () => {
        this.setState({
            visible: false,
            quizCODE: ''
        });
    };


    showDeleteConfirm = (q_ID) => {
        confirm({
            title: 'Are you sure to delete this quiz?',
            // content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                this.DeleteQuiz(q_ID);
                console.log('Quiz Deleted!');
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

    RetrieveQuizList = () => {
        const { UserInfo, ClassID } = this.props;
        const userid = UserInfo.userid;

        QuizRef = database.ref(`Quiz_Questions/${ClassID}`);
        QuizRef.on('value', (quizObj) => {
            const QUIZ = quizObj.val();
            if (!QUIZ) {
                return;
            }
            var qkeys = Object.keys(QUIZ);
            const qvalues = Object.values(QUIZ);

            var StudentQuizKeys;
            var Quizzes = [];
            const QuizAttemptedRef = database.ref(`Quiz_Attempted/${ClassID}/${userid}`);
            QuizAttemptedRef.once('value', (Obj) => {
                const Info = Obj.val();
                // console.log(Info)
                StudentQuizKeys = Object.keys(Info);

                for (var i = 0; i < qkeys.length; i++) {
                    // console.log('StudentQuizKeys', StudentQuizKeys, 'qkeys', qkeys)
                    if (!StudentQuizKeys && StudentQuizKeys.indexOf(qkeys[i]) !== -1) {
                        qkeys.slice(i, 1)
                    }
                }
            })
                .then(() => {
                    for (var i = 0; i < qkeys.length; i++) {
                        if (qkeys[i] !== qvalues[i].quizId) {
                            Quizzes.push(qvalues[i]);
                        }
                    }
                    this.setState({ QuizListkeys: qkeys, QuizListvalues: Quizzes }, () => console.log(this.state.QuizListkeys, this.state.QuizListvalues));
                })
        })
    }


    CheckProctoringKey = () => {
        const { quizId, enteredQuizKey } = this.state;
        const { ClassID } = this.props;

        const QuizRef = database.ref(`Quiz_Questions/${ClassID}/${quizId}`);
        QuizRef.once('value', (quiz) => {
            const Quiz = quiz.val();
            const QuizCodeKey = Quiz.quizcode;
            var isValid = false;
            if (QuizCodeKey === enteredQuizKey) {
                isValid = true;
            }
            else { message.warning('Invalid Code Entered') }
            this.setState({ isQuizKeyValid: isValid }, () => this.RetrieveQuizQuestions(quizId));
        })
    }

    // CheckProctoringKey = () => {
    //     const { quizId, enteredQuizKey } = this.state;
    //     const { ClassID } = this.props;

    //     const QuizRef = database.ref(`Quiz_Questions/${ClassID}/${quizId}`);
    //     QuizRef.once('value', (quiz) => {
    //         const Quiz = quiz.val();
    //         const QuizCodeKey = Quiz.quizcode;
    //         this.setState({ isQuizKeyValid: QuizCodeKey === enteredQuizKey }, () => this.RetrieveQuizQuestions(quizId));
    //     })
    // }

    RetrieveQuizQuestions = (quizId) => {
        const { ClassID } = this.props;
        // this.setState({ quizId: quizId, Quizname: Qname });

        const QuizQuesRef = database.ref(`Quiz_Questions/${ClassID}/${quizId}`);
        QuizQuesRef.once('value', (quesObj) => {
            const QUES = quesObj.val();
            if (!QUES) {
                return;
            }


            const questions = QUES.Questions; //Yahan pe error dega jab bhi, mtlab classID selected nahi hai, FLOW SAHI KRNA PREGA NAV. KA
            // const Teacher_ID = QUES.Teacherid;
            const timeInSeconds = QUES.timeInSeconds;
            // console.log('questions', questions, timeInSeconds);
            this.setState({ Quiz_Questions: questions, /*Teacher_ID: Teacher_ID,*/ timeInSeconds: timeInSeconds }, () => this.init_answers_Array(quizId));
        })
    }
    init_answers_Array = (quizId) => {
        const { Quiz_Questions, Quiz_solutions } = this.state;
        Quiz_Questions.forEach((ques, index) =>
            Quiz_solutions[index] = ''
        )
        this.setState({ Quiz_solutions }, () => {
            this.MarkStudentAttendanceForQuiz(quizId);
        });
    }
    MarkStudentAttendanceForQuiz = (quizId) => {
        const { UserInfo, ClassID } = this.props;
        const userid = UserInfo.userid;

        const QuizAttemptedRef = database.ref(`Quiz_Attempted/${ClassID}/${userid}/${quizId}`);
        QuizAttemptedRef.set({
            attemptedQuiz: true
        })
    }
    CheckStudentAttendanceForQuiz = (quizId) => {
        const { UserInfo, ClassID } = this.props;
        const userid = UserInfo.userid;

        const QuizAttemptedRef = database.ref(`Quiz_Attempted/${ClassID}/${userid}`);
        QuizAttemptedRef.once('value', (Obj) => {
            const Info = Obj.val();
            const QKeys = Object.keys(Info);
            this.setState({ StudentQuizKeys: QKeys })

            // return Info;
        })
        // .then((Info) => {
        //     const theInfo = Info.val()
        //     if (theInfo && theInfo.attemptedQuiz) {
        //         console.log('Attempted Quiz')
        //         return true;
        //     }
        //     else {
        //         console.log('Unattempted Quiz')
        //         return false;
        //     }
        // })
    }

    saveAnswer = (e, index) => {
        const { Quiz_solutions } = this.state;
        Quiz_solutions[index] = e.target.value;
        this.setState({ Quiz_solutions });
    }

    On_Quiz_Submit = () => {
        const { Quiz_solutions, quizId } = this.state;
        const { ClassID, UserInfo } = this.props;
        const userid = UserInfo.userid;
        const username = UserInfo.username;
        const nodename = 'Quiz_Results';
        const ansRef = 'Quiz_Answers';
        fetch(`http://localhost:8000/result?solutions=${Quiz_solutions}&ClassID=${ClassID}&Q_or_A_ID=${quizId}&NodeName=${nodename}&studentId=${userid}&answerRef=${ansRef}&StudentName=${username}`)
            .then((response) => {
                return response.json();
            })
            .then((myJson) => {
                const Xcore = myJson.score;
                const theScore = Number(Xcore);
                this.setState({ score: theScore }, () => {
                    console.log(this.state.score);
                    this.showModalForScore();
                    message.success('Quiz Successfully Submitted');
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
        });
    };
    handleCancelForScore = () => {
        this.setState({
            ShowScore: false,
            score: ''
        });
    };


    GetReport = (QuizID) => {
        const { ClassID } = this.props;
        // console.log('assignID', assignID)

        const ResultRef = database.ref(`Quiz_Results/${ClassID}/${QuizID}`);
        ResultRef.once('value', (Obj) => {
            const result = Obj.val();
            console.log(result)
            const resultKeysArr = result && Object.keys(result);
            const resultValuesArr = result && Object.values(result);
            console.log(resultKeysArr, resultValuesArr);
            this.setState({ resultKeysArr, resultValuesArr });
        })
    }
    showModalForResult = (QuizID) => {
        this.GetReport(QuizID);
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


    DeleteQuiz = (quizkiID) => {
        const { ClassID } = this.props;
        var updatesQuiz = {};
        updatesQuiz[`/Quiz_Questions/${ClassID}/${quizkiID}/isDeleted`] = true;
        return database.ref().update(updatesQuiz);
    }

    ChangeComponentToQuizCreate = () => {
        this.props.history.push(routes.QUIZ_CREATE);
    }

    LeaveQuizConfirm = () => {
        confirm({
            title: "Are you sure to leave this quiz? You won't be able to attempt this quiz again",
            // content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                this.LeaveQuiz();
            },
            onCancel() {

            },
        });
    }
    LeaveQuiz = () => {
        this.setState({ isQuizKeyValid: false, quizId: '' })
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }


    renderQuestions = () => {
        const { Quiz_Questions, Quiz_solutions } = this.state;

        return Quiz_Questions.map((ques, index) => {
            // console.log(ques)
            return (
                <div className='post' key={index} style={{ margin: '16px 0px 16px 0px', padding: '20px', borderRadius: '8px' }}>
                    <div>
                        <label>Question#{index + 1}:</label>
                        <p><b>{ques}</b></p>
                    </div>

                    <textarea rows='2' value={Quiz_solutions[index] || ''} name='Quiz_solutions' onChange={(e) => this.saveAnswer(e, index)} style={{ resize: 'none' }} type='text' className='form-control' />

                </div>
            )
        })
    }

    render() {
        const { quizId, Quizname, Teacher_ID, QuizListkeys, QuizListvalues, quizCODE, enteredQuizKey, isQuizKeyValid, timeInSeconds, score, resultKeysArr, resultValuesArr } = this.state;
        const { UserInfo } = this.props;
        const userid = UserInfo.userid;
        // console.log(QuizListkeys, resultKeysArr)
        // console.log(this.CheckStudentAttendanceForQuiz('-LgEsOLYqfD8Ry2HJcgk'))
        return (
            <div>
                {/* // IF teacher, show created Quizzes */}
                {/* // Show QuizCode */}
                {
                    Teacher_ID === userid ?
                        <div className='col-md-3 col-lg-3 col-sm-12 col-xs-12' style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Button size='lg' color='primary' onClick={this.ChangeComponentToQuizCreate} className=' col-lg-9 col-md-12 col-sm-12 col-xs-12'>Create new quiz</Button>
                            <h3 style={{ fontWeight: 'bold', color: '#395498' }}>Created quizzes</h3><br />
                            <div className='overflow' style={{ overflowY: 'auto' }}>
                                {
                                    QuizListkeys.map((key, index) => {
                                        // console.log(key)
                                        const Qname = QuizListvalues[index].name;
                                        // const QtimeDuration = QuizListvalues[index].timeInHoursMinutes;
                                        return (
                                            !QuizListvalues[index].isDeleted &&
                                            <Card key={key} style={{ color: 'white', backgroundColor: '#262f3d', marginBottom: '5px' }}>
                                                <CardBody>
                                                    <CardText className='TextOverFlowControl'>{Qname}</CardText>
                                                    <UncontrolledDropdown className='float-right'>
                                                        <DropdownToggle style={{ backgroundColor: '#262f3d', zIndex: 1 }}>
                                                            <span className='dotsDropDown' /><span className='dotsDropDown' /><span className='dotsDropDown' />
                                                        </DropdownToggle>

                                                        <DropdownMenu>
                                                            <DropdownItem onClick={() => this.showModalForQuizCode(index)}><i className="far fa-eye"></i>&nbsp;Show Quiz Code</DropdownItem>
                                                            <DropdownItem onClick={() => this.showModalForResult(key)}><i className="fas fa-poll"></i>&nbsp;Show Results</DropdownItem>
                                                            <DropdownItem onClick={() => this.showDeleteConfirm(key)}><i className="fas fa-trash"></i>&nbsp;Delete Quiz</DropdownItem>
                                                        </DropdownMenu>
                                                    </UncontrolledDropdown>
                                                </CardBody>
                                                <Modal title="Quiz Code" visible={this.state.visible} onOk={this.handleOkForQuizCode} onCancel={this.handleCancelForQuizCode} footer={''}>
                                                    <h1 style={{ textAlign: 'center' }}>{quizCODE}</h1>
                                                </Modal>

                                                <Modal title={Qname} visible={this.state.ShowResult} onOk={this.handleOkForResult} onCancel={this.handleCancelForResult} footer={[]}>
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
                                            </Card>
                                        )
                                    })
                                }

                            </div>
                        </div>



                        :
                        // ELSE
                        // IF STUDENTS
                        <div>
                            {
                                // if Quiz id is NOT present in state, then render 
                                // list of quizzes of that class
                                !quizId && isQuizKeyValid === false ?
                                    <div className='col-md-3 col-lg-3 col-sm-12 col-xs-12' style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontWeight: 'bold', color: '#395498' }}>Created quizzes</h3>
                                        <div className='overflow' style={{ overflowY: 'auto' }}>
                                            {
                                                !QuizListkeys.length ?
                                                    <h4 style={{ color: '#262f3d' }}>No Quizzes!</h4 >
                                                    :
                                                    QuizListkeys.map((key, index) => {
                                                        const Qname = QuizListvalues[index].name;
                                                        const QtimeDuration = QuizListvalues[index].timeInHoursMinutes;
                                                        return (
                                                            !QuizListvalues[index].isDeleted &&
                                                            <Card key={key} onClick={() => this.setState({ quizId: key, Quizname: Qname })} style={{ color: 'white', backgroundColor: '#262f3d', marginBottom: '5px' }}>
                                                                <CardBody>
                                                                    <CardText className='TextOverFlowControl'>{Qname}</CardText>
                                                                    <CardText className='TextOverFlowControl' style={{ color: 'rgba(255,255,255,.7)' }}>{QtimeDuration}</CardText>
                                                                </CardBody>
                                                            </Card>
                                                        )
                                                    })
                                            }
                                        </div>
                                    </div>
                                    :
                                    quizId && isQuizKeyValid === false ?
                                        <div className='container' >
                                            <div><br /><br /><br /><br /><br /><br /><br /><br />
                                                <div className='form-group'>
                                                    <h2 className='text-center'>Enter Proctoring Key</h2><br /><br />
                                                    <Input name='enteredQuizKey' value={enteredQuizKey} onChange={(e) => this.handleChange(e)} bsSize='lg' type="password" placeholder="Quiz Code" className='col-md-10 col-sm-12 col-lg-10 col-xs-12 form-control input-lg' required />
                                                    <Button size='lg' color='primary' className='col-xs-12 col-sm-12 col-md-2 col-lg-2' type="submit" onClick={this.CheckProctoringKey}>Enter Quiz >></Button>
                                                    {!isQuizKeyValid && <p>Invalid quiz code entered!</p>}
                                                </div>
                                            </div>
                                        </div>

                                        :
                                        // if Quiz id is present in state, then render this
                                        quizId && isQuizKeyValid &&
                                        <div className='container'>
                                            <Button size='lg' outline color='primary' onClick={this.LeaveQuizConfirm} className='btn'><i class="fas fa-chevron-left"></i><i class="fas fa-chevron-left"></i><i class="fas fa-chevron-left"></i> Back</Button>
                                            {/* <br /><br /><br /> */}
                                            <div className='text-center'>
                                                <h1>Quiz Title: {Quizname}</h1>
                                            </div>
                                            <div className='float-right' style={{ color: 'RED' }}>
                                                <Timer direction='backward' initialTime={timeInSeconds}>
                                                    <h4>Your quiz will end in the given time below</h4>
                                                    <h4><Timer.Hours /> Hours &nbsp;<Timer.Minutes /> Minutes &nbsp;<Timer.Seconds /> Seconds</h4>
                                                </Timer>
                                            </div>

                                            {/* <Spin size='large' tip="Loading... type text to show here"> */}
                                            {this.renderQuestions()}
                                            {/* </Spin> */}

                                            <Button color='warning' className='btn-lg pull-right' onClick={this.On_Quiz_Submit}>Submit</Button>
                                            {/* <Button color='warning' className='btn-lg pull-right' onClick={this.On_Quiz_Submit}>Submit</Button> */}

                                            <Modal title="Your Result" visible={this.state.ShowScore} onOk={this.handleOkForScore} onCancel={this.handleCancelForScore}
                                                footer={[
                                                    <Progress key={score} percent={score} showInfo={false} />
                                                ]}>
                                                <h1 style={{ textAlign: 'center' }}>{score}</h1>
                                                {/* <div className='table-responsive'>
                                                <table className='table'>
                                                    <tr>
                                                        <th>ClassName</th>
                                                        <th>Quiz Heading / Quiz Number/Quiz Name</th>
                                                    </tr>
                                                    <tr className='text-center'>
                                                        <td>fyp2</td>
                                                        <td>Quiz#1</td>
                                                    </tr>
                                                </table>
                                            </div> */}
                                            </Modal>

                                        </div>


                            }
                        </div>
                }
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

export default connect(mapStateToProps, mapDispatchToProps)(Quiz);
