import React, { Component } from 'react';
import firebase from '../../firebase/firebase';
// import ShowPost from './ShowPosts';
import './Post.css';
// import {db} from 'db';
// import { db } from '../../firebase/firebase';
import { Input } from 'antd';
// import { doGetCurrentUser } from '../db';
import ShowPost from './ShowPosts';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';

// import { updateUser } from '../../redux/Auth/AuthActions';
import { connect } from 'react-redux';

const storage = firebase.storage();
const database = firebase.database();

let Posts;

class Post extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // avtars: [],
            datetime: '',
            caption: '',
            editedcap: '',
            Classes_Posts: [],
            isPostButtonDisabled: false,
            UploadFilesInfoArr: [],
            attachment_type: ''
        };
    }


    componentDidMount() {
        this.RetrievePostsData();
    }

    componentWillUnmount() {
        Posts.off();
    }

    // cancelPreviousUploads = () => {
    //     taskref.cancel();
    // }


    setAttachmentType = (e) => {
        this.setState({ attachment_type: e.target.name });
    }
    UploadAllFiles = (e) => {
        this.setState({ UploadFilesInfoArr: [], isPostButtonDisabled: true });
        const { user, ClassID } = this.props;
        try {
            var taskref;
            taskref && taskref.cancel();
        }
        catch (e) {
            console.log(e.code, e.message);
        }
        // uploadTask && uploadTask.cancel();
        finally {
            // add post to the Posts list
            const files = e.target.files;
            const filesArray = Object.values(files);
            const UserID = user.user.uid;
            filesArray.forEach(file => {
                const StorageRef = storage.ref(`ClassesFiles/${ClassID}/${UserID}/${file.name}`);
                console.log(file.name);
                const uploadTask = StorageRef.put(file);
                taskref = StorageRef.put(file);
                uploadTask.on('state_changed', this.loadUpload, this.errUpload, () => this.completeUpload(uploadTask))
            });
        }
    }
    // while uploading
    loadUpload = () => {
        // ANY ANIMATION WHILE THE PICTURES ARE BEING UPLOADED, GO HERE .....
    }
    // if couldn't upload
    errUpload = (err) => {
        console.log(err);
    }
    // on upload success
    completeUpload = (uploadTask) => {
        const { UploadFilesInfoArr } = this.state;

        uploadTask.snapshot.ref.getMetadata()
            .then(({ contentType, name }) => {

                uploadTask.snapshot.ref.getDownloadURL()
                    .then((url) => {

                        // console.log(contentType.substring(0, contentType.indexOf("/")));
                        const FileInfo = {
                            type: contentType.substring(0, contentType.indexOf("/")),
                            url: url,
                            fileName: name
                        }
                        UploadFilesInfoArr.push(FileInfo);
                    })
            })
            .then(() => {
                this.setState({ isPostButtonDisabled: false })
            })
    }



    PostData = async () => {
        const { caption } = this.state;
        const { ClassID, user, UserInfo } = this.props;
        const UserID = user.user.uid;
        const nameOfUser = UserInfo.username;
        const Date_Time = await this.getDateandTime();
        this.writePostDataInClassesPostsNode(UserID, nameOfUser, caption, Date_Time, ClassID);
    }
    writePostDataInClassesPostsNode = (UserID, nameOfUser, caption, Date_Time, ClassID) => {
        const { UploadFilesInfoArr, attachment_type } = this.state;

        // Write the new post's data in the Posts node in the Classes's list.
        const newPostRef = database.ref(`Classes/${ClassID}/Posts`).push();
        const postID = newPostRef.key;
        const PostInfo = {
            PostText: caption,
            UserId: UserID,
            Username: nameOfUser,
            time: Date_Time,
            isDeleted: false,
            isEdited: false,
            PostID: postID
        };
        newPostRef.set(PostInfo);
        const keysArr = Object.keys(UploadFilesInfoArr);
        keysArr.forEach(key => { // replaced map with forEach, not tested yet!
            console.log(UploadFilesInfoArr[key]);
            const newPostFilesInfoRef = database.ref(`Classes/${ClassID}/Posts/${postID}/Files/${attachment_type}`).push();
            newPostFilesInfoRef.set(UploadFilesInfoArr[key]);
        })
        this.setState({
            datetime: '',
            caption: '',
            isPostButtonDisabled: false,
            UploadFilesInfoArr: [],
            attachment_type: ''
        })
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


    RetrievePostsData = () => {
        const { ClassID } = this.props;

        Posts = database.ref(`Classes/${ClassID}/Posts`);
        Posts.on('value', (Postzx) => {
            // console.log('Postzx', Postzx.val());
            if (!Postzx.exists()) return;
            let myPosts = Postzx.val();
            let filteredPosts = [];
            for (var key in myPosts) {
                filteredPosts.push(myPosts[key]);
            }
            filteredPosts = filteredPosts.reverse();

            // console.log('myPosts', myPosts);
            // console.log('FiltereedPostkeys', filteredPostkeys[0]);
            this.setState({ Classes_Posts: filteredPosts })
        })
        // .catch(function (error) {
        //     console.log("Error retrieving post !");
        //     console.log(error.code);
        //     console.log(error.message);
        // })
    }

    UpdatePost = async (PostID, editedcap) => {
        const { ClassID } = this.props;
        const Date_Time = await this.getDateandTime();

        var updates = {};
        updates[`/Classes/${ClassID}/Posts/${PostID}/PostText`] = editedcap;
        updates[`/Classes/${ClassID}/Posts/${PostID}/time`] = Date_Time;
        updates[`/Classes/${ClassID}/Posts/${PostID}/isEdited`] = 'true';

        return database.ref().update(updates, () =>
            this.setState({
                datetime: '',
                editedcap: ''
            })
        );
    }

    deletePost = (PostID) => {
        const { ClassID } = this.props;

        var updates = {};
        updates[`/Classes/${ClassID}/Posts/${PostID}/isDeleted`] = true;
        return database.ref().update(updates);
    }


    render() {
        const { caption, Classes_Posts, isPostButtonDisabled, editedcap } = this.state;
        const user = this.props.user || { user: {} };        
        // const { user } = this.props;
        // const { avtars, name, caption, time, privacy, likes, images } = this.state;
        // let { includeLike } = this.state;

        return (
            <div>
                <div className="editor">
                    <div className=''>
                        <div id="file_browse_container">
                            <label htmlFor="a-file" className="btn"><i className="far fa-images fa-2x"></i><b>&nbsp;&nbsp;&nbsp;Choose Images</b></label>
                            <input id="a-file" multiple accept='image/*' name="image" onClick={(e) => this.setAttachmentType(e)} onChange={(e) => this.UploadAllFiles(e)} type="file" className="__required" style={{ visibility: "hidden" }} />
                        </div>

                        <div id="file_browse_container">
                            <label htmlFor="b-file" className="btn"><i className="fas fa-video fa-2x"></i><b>&nbsp;&nbsp;&nbsp;Choose Video</b></label>
                            <input id="b-file" multiple accept='video/*,audio/*' name="video" onClick={(e) => this.setAttachmentType(e)} onChange={(e) => this.UploadAllFiles(e)} type="file" className="__required" style={{ visibility: "hidden" }} />
                        </div>

                        <div id="file_browse_container">
                            <label htmlFor="c-file" className="btn"><i className="fas fa-upload fa-2x"></i><b>&nbsp;&nbsp;&nbsp;Choose files</b></label>
                            <input id="c-file" multiple accept='application/*,text/*' name="application" onClick={(e) => this.setAttachmentType(e)} onChange={(e) => this.UploadAllFiles(e)} type="file" className="__required" style={{ visibility: "hidden" }} />
                        </div>
                    </div>

                    <div>
                        <div className="editor_caption">
                            <Input.TextArea value={caption} style={{ resize: 'none' }} rows={3} placeholder="Is Every Think ok ?" onChange={e => this.setState({ caption: e.target.value })} />
                        </div>
                        <div>&nbsp;</div>
                        <div className='pull-right'>
                            <div>
                                <label className='btn btn-primary btn-sm ' onClick={this.PostData} disabled={isPostButtonDisabled}><i className="far fa-check-square fa-2x"></i>&nbsp;&nbsp;&nbsp;Post</label>
                            </div>
                        </div>

                    </div>
                    <div>&nbsp;</div>

                </div>
                <br />


                <div className="result">
                    {
                        Classes_Posts.map((post, index) => {
                            // console.log(Classes_Posts);
                            // console.log(post);
                            // console.log('post.FilesURL', post.FilesURL);

                            let likesArr;
                            let likes;
                            const files = [];
                            const filesInfo = [];
                            let type_of_files = '';
                            let iLiked = false;

                            if (post.Files) {
                                const imagekeys = post.Files.image && Object.keys(post.Files.image);
                                post.Files.image &&
                                    imagekeys.forEach(key => {
                                        files.push(post.Files.image[key].url);
                                        type_of_files = 'image';
                                    })
                                const videokeys = post.Files.video && Object.keys(post.Files.video);
                                post.Files.video &&
                                    videokeys.forEach(key => {
                                        files.push(post.Files.video[key].url);
                                        type_of_files = 'video';
                                    })
                                const applicationkeys = post.Files.application && Object.keys(post.Files.application);
                                post.Files.application &&
                                    applicationkeys.forEach(key => {
                                        files.push(post.Files.application[key].url);
                                        filesInfo.push(post.Files.application[key]);
                                        type_of_files = 'application';
                                    })
                            }

                            if (post.Likes) {
                                likesArr = Object.keys(post.Likes);
                                // console.log(likesArr);
                                likesArr.forEach(id => {
                                    // console.log(id);
                                    if (id === user.user.uid) {
                                        iLiked = true;
                                    }
                                })
                                likes = likesArr.length;
                            }
                            // console.log({iLiked})

                            return (
                                !post.isDeleted &&
                                <ShowPost
                                    key={post.PostID}
                                    // avtar={avtars[0] ? avtars[0].thumbUrl : false}
                                    name={post.Username}
                                    userid={post.UserId}
                                    time={post.time}
                                    caption={post.PostText}
                                    type_of_files={type_of_files}
                                    files={files}
                                    filesInfo={filesInfo}
                                    deletePost={this.deletePost}
                                    UpdatePost={this.UpdatePost}
                                    isEdited={post.isEdited}
                                    editedcaption={editedcap}
                                    PostID={post.PostID}
                                    likes={likes}
                                    iLiked={iLiked}
                                />
                            )
                        })
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
        UserInfo: state.UserInfoReducers.info
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // updateUser: (user) => dispatch(updateUser(user)),
        // updateUserInfo: (userinfo) => dispatch(updateUserInfo(userinfo))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Post);  
