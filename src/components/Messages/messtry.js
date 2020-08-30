import React from 'react';
// import imgicon from '../../Images/Sir.jpg';
import './Messages.css';
import firebase from '../../firebase/firebase';
import { Button } from 'reactstrap';
// import defaultAvtar from '../../Images/default-avatar.jpg';
import classroomdefaultavatar from '../../Images/classroom-default-avatar.jpg';
import { updateRecieverId } from '../../redux/MessageRecieverID/RecieverIDActions';
import ScrollToBottom from 'react-scroll-to-bottom';
import { connect } from 'react-redux';

const database = firebase.database();

let retrieverRef;
let retrieverRefx;


class Messages extends React.Component {
    static defaultProps = {
        avtar: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            AllUsersArr: [],
            newMessage: '',
            uniques: [],
            retrievedMessages: [],
            otherpersonID: '',
            otherpersonName: '',
            Chats: [],
            SendButtonDisabled: true
        }
    }

    async componentDidMount() {
        // const {Chats} = this.state; // aise nai chaltaa nichey
        await this.RetrieveInboxUserAndMessages();
        await this.ShowAllUsers();
        // console.log(this.state.Chats[0]);
        this.state.Chats.length && await this.RetrieveAllMessagesOfSelectedUser(this.state.Chats[0].userid, this.state.Chats[0].username);
    }

    componentWillUnmount() {
        retrieverRef.off();
        retrieverRefx.off();
    }

    ShowAllUsers = async () => {
        const { UserInfo } = this.props;
        const userid = UserInfo.userid;

        const UsersClasses = await database.ref(`Users/${userid}/MyClasses`).once('value');
        const UsersClassesData = UsersClasses.val();
        const classKeys = Object.keys(UsersClassesData);

        let UsersWithoutKey = [];
        for (const classid of classKeys) {
            const MembersRef = await database.ref(`Classes/${classid}/Members`).once('value');
            const MembersData = MembersRef.val();
            UsersWithoutKey = [...UsersWithoutKey, ...Object.values(MembersData)];
        }

        const uniqueUsers = UsersWithoutKey.filter((obj, pos, arr) => arr.map(mapObj => mapObj['userid']).indexOf(obj['userid']) === pos);
        // console.log('Users List from all classes', uniqueUsers);
        this.setState({ AllUsersArr: uniqueUsers });
    }


    SendMessage = async (retrieverID) => {
        const { newMessage, otherpersonName, otherpersonID } = this.state;
        const { UserInfo } = this.props;
        const senderID = UserInfo.userid;
        const senderName = UserInfo.username;



        await database.ref(`Conversations/${retrieverID}/${senderID}`).once('value', async (snap) => {
            if (!snap.val()) {
                const newSenderRef = await database.ref(`Conversations/${retrieverID}/${senderID}`);
                await newSenderRef.set({
                    userid: senderID,
                    username: senderName,
                    latestTimestamp: Date.now(),
                    latestMessage: newMessage,
                    unread: true
                })
            }
            else {
                var updates3 = {};
                updates3[`/Conversations/${retrieverID}/${senderID}/latestTimestamp`] = Date.now();
                updates3[`/Conversations/${retrieverID}/${senderID}/latestMessage`] = newMessage;
                updates3[`/Conversations/${retrieverID}/${senderID}/unread`] = true;
                return database.ref().update(updates3);
            }
        })

        const newMsgRetrieverRef = await database.ref(`Conversations/${retrieverID}/${senderID}/Messages`);
        const msgID = await newMsgRetrieverRef.push().key;
        await newMsgRetrieverRef.child(msgID).set({
            messageText: newMessage,
            messageid: msgID,
            chatid: retrieverID
        })


        await database.ref(`Conversations/${senderID}/${retrieverID}`).once('value', async (snap) => {
            if (!snap.val()) {
                const newSenderRef = await database.ref(`Conversations/${senderID}/${retrieverID}`);
                await newSenderRef.set({
                    userid: otherpersonID,
                    username: otherpersonName,
                    latestTimestamp: Date.now(),
                    latestMessage: newMessage,
                    // unread: true
                })
            }
            else {
                var updates4 = {};
                updates4[`/Conversations/${senderID}/${retrieverID}/latestTimestamp`] = Date.now();
                updates4[`/Conversations/${senderID}/${retrieverID}/latestMessage`] = newMessage;
                // updates4[`/Conversations/${senderID}/${retrieverID}/unread`] = true;
                return database.ref().update(updates4);
            }
        })

        const newMesgRetrieverRef = await database.ref(`Conversations/${senderID}/${retrieverID}/Messages`);//new
        await newMesgRetrieverRef.child(msgID).set({
            messageText: newMessage,
            messageid: msgID,
            chatid: retrieverID
        })
        this.setState({ newMessage: '' });
    }


    RetrieveInboxUserAndMessages = async () => {
        const { UserInfo } = this.props;
        const retrieverid = UserInfo.userid;

        retrieverRefx = await database.ref(`Conversations/${retrieverid}`).orderByChild('latestTimestamp');
        await retrieverRefx.on('value', (conversation) => {
            const CONVO = conversation.val();
            // console.log('CONVO', CONVO);
            const con = CONVO && Object.values(CONVO);
            con && con.forEach(async (cnvrstion) => {
                // console.log('Inbox users ids', cnvrstion.userid);
                const eachConvoInfo = {
                    latestMessage: cnvrstion.latestMessage,
                    latestTimestamp: cnvrstion.latestTimestamp,
                    userid: cnvrstion.userid,
                    username: cnvrstion.username
                }
                await this.setState({ Chats: [] });
                await this.setState({ Chats: [...this.state.Chats, eachConvoInfo] }, () => {
                    // console.log(this.state.Chats);
                })
            })

        })
    }


    RetrieveAllMessagesOfSelectedUser = (senderid, sendername) => {
        const { UserInfo } = this.props;
        const retrieverid = UserInfo.userid;
        this.props.updateRecieverId(retrieverid);
        var exists = false;
        retrieverRef = database.ref(`Conversations/${retrieverid}/${senderid}/Messages`);
        retrieverRef.on('value', (messages) => {
            const msgs = messages.val();
            // console.log('msgs', msgs);
            let messagesArr = [];
            if (msgs !== null) {
                exists = true;
                const msgsKeys = Object.keys(msgs);
                msgsKeys.forEach((id) => {
                    // console.log(msgs[id]);
                    messagesArr.push(msgs[id]);
                })
            }
            this.setState({
                retrievedMessages: messagesArr,
                otherpersonID: senderid,
                otherpersonName: sendername
            });
        })
        if (exists) {
            var updatezz = {};
            updatezz[`/Conversations/${retrieverid}/${senderid}/unread`] = false;
            updatezz[`/Conversations/${senderid}/${retrieverid}/unread`] = false;
            // updatezz[`/Sender/${retrieverid}/${senderid}/unread`] = false;
            // updatezz[`/Sender/${senderid}/${retrieverid}/unread`] = false;
            return database.ref().update(updatezz);
        }
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, () => {
            this.state.newMessage ? this.setState({ SendButtonDisabled: false }) : this.setState({ SendButtonDisabled: true })
        })
    }


    render() {
        const { newMessage, AllUsersArr, retrievedMessages, otherpersonID, otherpersonName, Chats, SendButtonDisabled } = this.state;
        const { avtar } = this.props;
        // const user = this.props.user || { user: {} };
        const UserInfo = this.props.UserInfo || { UserInfo: {} };

        return (
            <div className='container-fluid row' style={{backgroundColor:'#90A4AE',marginTop:'-20px'}}>

                <div className='hidden-xs hidden-sm col-md-3 col-lg-3' style={{backgroundColor:''}}>
                    <h3 className='AlignMiddle' id='messHead'>Inbox</h3>
                    <div id='bodyMessage' className='overflow'>
                        {
                            Chats.map((chat) => {
                                return (
                                    <div key={chat.userid} className='classname recents' onClick={() => this.RetrieveAllMessagesOfSelectedUser(chat.userid, chat.username)}>

                                        <div className='avatarmess col-xs-3 col-sm-3 col-md-3 col-lg-3'>
                                            <img className='img-responsive' src={avtar ? avtar : classroomdefaultavatar} alt="Img" />
                                        </div>

                                        <div className='classname col-xs-9 col-sm-9 col-md-9 col-lg-9' style={{ paddingLeft: '10px' }}>
                                            {
                                                chat.unread ?
                                                    <>
                                                        <p><b>{chat.username}</b></p>
                                                        <p className='classname'><b>{chat.latestMessage}</b></p>
                                                    </>
                                                    :
                                                    <>
                                                        <span>{chat.username}</span>
                                                        <p className='classname'>{chat.latestMessage}</p>
                                                    </>
                                            }
                                        </div>

                                    </div>
                                )
                            })
                        }
                    </div>
                </div>

                <div className='col-xs-12 col-sm-12 col-md-12 col-lg-7' style={{backgroundColor:''}}>
                    <h3 id='messHead'>{otherpersonName}</h3>
                    <div>
                        <ScrollToBottom id='bodyMessage' className='overflowMess'>
                            {
                                retrievedMessages.map((eachmsg) => {
                                    return (
                                        <div key={eachmsg.messageid} className={(UserInfo.userid === eachmsg.chatid) ? 'messcontainer' : 'messcontainer darker'} style={{ display: 'inline-block' }}>
                                            <img src={/*imgicon*/ classroomdefaultavatar} className={(UserInfo.userid === eachmsg.chatid) ? '' : 'right'} alt="" style={{ width: '40px', height: '40px' }} />
                                            <p>{eachmsg.messageText}</p>
                                            <span className={(UserInfo.userid === eachmsg.chatid) ? 'time-right' : 'time-left'}>11:00</span>
                                        </div>
                                    )
                                })
                            }
                        </ScrollToBottom>

                        {this.props.RecieverId &&
                            <div className='align-center container row' style={{ padding: '30px 10px 0px 20px' }}>
                                <textarea style={{ resize: 'none', border: 'solid 1px #007BFF' }} value={newMessage} rows={2} name='newMessage' onChange={e => this.handleChange(e)} className='col-sm-12 col-md-12 col-lg-10 form-control' />
                                <Button color='primary' className='col-xs-12 col-sm-12 col-md-12 col-lg-2' onClick={() => this.SendMessage(otherpersonID)} disabled={SendButtonDisabled} id='btnSnd' size='md'>Send &nbsp;<i className="fas fa-share"></i></Button>
                            </div>
                        }

                    </div>
                </div>

                <div className='col-xs-12 col-sm-12 col-md-12 col-lg-2' style={{backgroundColor:''}}>
                    <h3 id='messHead'>People You Know</h3>
                    <div id='bodyMessage' className='overflow float-right'>{
                        AllUsersArr.map((user) => {
                            if (user.userid !== UserInfo.userid) {
                                return (
                                    <div key={user.userid} className='recents' onClick={() => this.RetrieveAllMessagesOfSelectedUser(user.userid, user.username)}>
                                        {user.username}
                                    </div>
                                )
                            }
                            return null;
                        })
                    }
                    </div>
                </div>
            </div >

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
        updateRecieverId: (RecieverId) => dispatch(updateRecieverId(RecieverId)),
        // updateUser: (user) => dispatch(updateUser(user)),
        // updateUserInfo: (userinfo) => dispatch(updateUserInfo(userinfo))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Messages);  
