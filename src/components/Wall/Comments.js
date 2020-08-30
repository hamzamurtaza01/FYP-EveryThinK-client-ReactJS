import React, { Component } from 'react';
import { Skeleton, Comment, Avatar, Form, Button, List, Input, Modal } from 'antd';
import moment from 'moment';
import firebase from '../../firebase/firebase';
import defaultAvatar from '../../Images/default-avatar.jpg';
import { connect } from 'react-redux';
import './Comments.css';
import { UncontrolledDropdown, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap';

const TextArea = Input.TextArea;

const database = firebase.database();
let CommentsRef;

const CommentList = ({ comments, CommentsKeys, DeleteComment, showModal, userid }) => (
    <List
        dataSource={comments}
        // bordered={true}
        header={<p style={{ padding: 5 }}>{comments.length > 0 ? comments.length : ''} {comments.length > 1 ? 'replies' : 'reply'}</p>}
        itemLayout={window.innerWidth <= 768 ? 'horizontal' : 'vertical'} //horizontal tha by default
        // renderItem={props => <Comment {...props} />}
        renderItem={(item, index) => (
            <List.Item
                actions={userid === item.USERID && [
                    <UncontrolledDropdown>
                        <DropdownToggle style={{ backgroundColor: 'white', display: 'flex', justifyContent: 'center' }}>
                            <span className='DotCOmments' /><span className='DotCOmments' /><span className='DotCOmments' />
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={() => showModal(CommentsKeys[index], comments[index].content)}>Edit Comment</DropdownItem>
                            <DropdownItem onClick={() => DeleteComment(CommentsKeys[index])}>Delete Comment</DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                ]}
            >
                <Skeleton avatar title={false} loading={item.loading} active>
                    <List.Item.Meta
                        avatar={<Avatar src={defaultAvatar} style={{ marginLeft: 10, marginRight: 20 }} />}
                        title={<p style={{ color: '#455A64', fontWeight: 'bold', fontSize: 14 }}>{item.author}</p>} //name of user who commented
                        description={<p style={{ color: '#37474F' }}>{item.content}</p>} // comment text
                    />
                </Skeleton>
            </List.Item>
        )}
    />
);

const Editor = ({ name, onChange, onSubmit, submitting, value, checkIFdisabled }) => (
    <div>
        <Form.Item>
            <TextArea style={{ resize: 'none' }} name={name} onChange={onChange} value={value} autosize={{ minRows: 3, maxRows: 9 }} />
        </Form.Item>
        <Form.Item>
            <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary" disabled={checkIFdisabled}>
                Add Comment
            </Button>
        </Form.Item>
    </div>
);


class Comments extends Component {
    state = {
        comments: [],
        submitting: false,
        value: '',
        disableCommenting: true,
        CommentsKeys: [],
        datetime: '',
        editingCommentID: '',
        editedcomment: '',
        visible: false,
        disableUpdateCommentButton: true
    }

    componentDidMount() {
        this.RetrieveComments();
    }

    componentWillUnmount() {
        CommentsRef.off();
    }

    showModal = (editingCommentID, commentText) => {
        this.setState({
            visible: true,
            editingCommentID: editingCommentID,
            editedcomment: commentText
        });
    }
    handleOk = (e) => {
        const { editedcomment, editingCommentID } = this.state;
        console.log(e);
        this.UpdateComment(editingCommentID, editedcomment);
        this.setState({ visible: false });
    }
    UpdateComment = async (CommentID, editedcomment) => {
        const { ClassID, PostID } = this.props;
        const Date_Time = await this.getDateandTime();

        var updates = {};
        updates[`/PostsComments/${ClassID}/${PostID}/${CommentID}/commentText`] = editedcomment;
        updates[`/PostsComments/${ClassID}/${PostID}/${CommentID}/datetime`] = Date_Time;
        updates[`/PostsComments/${ClassID}/${PostID}/${CommentID}/isEdited`] = 'true';

        return database.ref().update(updates, () =>
            this.setState({
                datetime: '',
                editedcomment: ''
            })
        );
    }
    handleCancel = (e) => {
        console.log(e);
        this.setState({ visible: false });
    }


    CreateNewComment = async () => {
        const { value } = this.state;
        const { ClassID, PostID, UserInfo } = this.props;

        if (!value) {
            return;
        }
        const Date_Time = await this.getDateandTime();
        const newCommentRef = database.ref(`PostsComments/${ClassID}/${PostID}`).push();
        const commentID = newCommentRef.key;
        newCommentRef.set({
            commentText: value,
            username: UserInfo.username,
            datetime: Date_Time,
            ClassID: ClassID,
            PostID: PostID,
            CommentID: commentID,
            userid: UserInfo.userid
        })
        this.setState({
            submitting: true,
        });
        setTimeout(() => {
            this.setState({
                submitting: false,
                value: ''
            }
                // , () => console.log(this.state.comments[0].datetime)
            )
        }, 1000);
    }
    getDateandTime = () => {
        const today = new Date();
        const day = today.toLocaleDateString('en-us', { weekday: 'short' });
        const month = today.toLocaleString('en-us', { month: 'short' });
        const date = today.getDate()
        const year = today.getFullYear()
        let hours = today.getHours()
        let minutes = today.getMinutes().toString()
        var dayORnight = "AM";
        if (hours > 11) { dayORnight = "PM"; }
        if (hours > 12) { hours = hours - 12; }
        if (hours === 0) { hours = 12; }
        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }

        const datetime = `${day}, ${month} ${date}, ${year} at ${hours}:${minutes} ${dayORnight}`;
        // console.log(datetime);
        // this.setState({ datetime: datetime });
        return datetime;
    }

    RetrieveComments = () => {
        // const { Posts_Comments } = this.state;
        const { ClassID, PostID } = this.props;

        CommentsRef = database.ref(`PostsComments/${ClassID}/${PostID}`);
        CommentsRef.on('value', (commentzx) => {
            // console.log('commentzx', commentzx.exists());
            if (!commentzx.exists()) return;
            let Comments = commentzx.val();
            // let filteredComments = [];
            let filteredCommentskeys = [];
            let CommentsArr = [];
            if (Comments !== null) {
                for (var key in Comments) {
                    if (Comments.hasOwnProperty(key)) {
                        // console.log('Comments', Comments);
                        // console.log('Comments[key] -->>', Comments[key]);
                        // filteredComments.push(Comments[key]);
                        // console.log('filteredComments', filteredComments);
                        CommentsArr = [
                            {
                                author: Comments[key].username,
                                avatar: Comment,
                                content: Comments[key].commentText,
                                datetime: moment().fromNow(),
                                USERID: Comments[key].userid
                            },
                            ...CommentsArr,
                        ]
                    }
                }

                CommentsArr.reverse();
                filteredCommentskeys.push(Object.keys(Comments));
                filteredCommentskeys = filteredCommentskeys.reverse();
                // filteredComments = filteredComments.reverse();
                // console.log({filteredComments});

                // console.log('Comments', Comments);
                // console.log('CommentsArr', CommentsRef);
                // console.log('filteredCommentskeys[0]', filteredCommentskeys[0]);
                // Posts_Comments: filteredComments,
                this.setState({
                    CommentsKeys: filteredCommentskeys[0],
                    comments: CommentsArr
                })
            }
            else {
                this.setState({
                    CommentsKeys: [],
                    // Posts_Comments: filteredComments,
                    comments: []
                })
            }
        })
        // .catch(function (error) {
        //     console.log("Error retrieving post !");
        //     console.log(error.code);
        //     console.log(error.message);
        // })
    }

    DeleteComment = (CommentID) => {
        const { ClassID, PostID } = this.props;
        database.ref(`PostsComments/${ClassID}/${PostID}/${CommentID}`).remove();
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        },
            () => {
                if (!this.state.editedcomment) {
                    this.setState({
                        disableUpdateCommentButton: true
                    })
                }
                else {
                    this.setState({
                        disableUpdateCommentButton: false
                    })
                }

                if (!this.state.value) {
                    this.setState({
                        disableCommenting: true
                    })
                }
                else {
                    this.setState({
                        disableCommenting: false
                    })
                }
            });
    }



    render() {
        const { UserInfo } = this.props;
        const { comments, submitting, value, CommentsKeys, visible, editedcomment, disableUpdateCommentButton, disableCommenting } = this.state;

        return (
            <div>
                {comments.length && <CommentList comments={comments} CommentsKeys={CommentsKeys} userid={UserInfo.userid} DeleteComment={this.DeleteComment} showModal={this.showModal} />}
                <Comment
                    avatar={(
                        <Avatar src={defaultAvatar} alt={UserInfo.username} style={{ margin: 10 }} />
                    )}

                    content={(
                        <Editor name='value' value={value} onChange={e => this.handleChange(e)} onSubmit={this.CreateNewComment} submitting={submitting} checkIFdisabled={disableCommenting} />
                    )}
                />
                <Modal title='Edit Comment' visible={visible} onOk={(e) => this.handleOk(e)} onCancel={this.handleCancel}
                    footer={[<Button key='cancel' onClick={this.handleCancel}>Cancel</Button>, <Button key='update' type="submit" onClick={this.handleOk} disabled={disableUpdateCommentButton}>Update</Button>,]}>
                    <br />
                    <input className='form-control' name='editedcomment' value={editedcomment} onChange={e => this.handleChange(e)} type='text' /><br />
                </Modal>
            </div>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        // user: state.authReducers.user,
        ClassID: state.ClassIDReducers.ClassId,
        UserInfo: state.UserInfoReducers.info
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // updateUser: (user) => dispatch(updateUser(user)),
        // updateClassId: (ClassId) => dispatch(updateClassId(ClassId))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Comments);
