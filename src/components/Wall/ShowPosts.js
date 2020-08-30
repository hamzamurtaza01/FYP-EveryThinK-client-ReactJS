import React, { Component } from 'react';
import FbImageLibrary from 'react-fb-image-grid';
import { db } from '../../firebase/firebase';
// import FacebookEmoji from 'react-facebook-emoji';
import './ShowPosts.css';
import defaultAvtar from '../../Images/default-avatar.jpg';
// import LikeBtn from '../../Images/like-btn.PNG';
// import CommentBtn from '../../Images/comment-btn.PNG';
// import ShareBtn from '../../Images/share-btn.PNG';
import Liked from '../../Images/liked.PNG';
import Comments from './Comments';
import ReactPlayer from 'react-player';
// import { message, Button, Icon } from 'antd';
import { Upload, Modal, Popover, Popconfirm } from 'antd';
import TextArea from 'antd/lib/input/TextArea';

// import { updateUser } from '../../redux/Auth/AuthActions';
import { connect } from 'react-redux';

// let LikeBtnImg = LikeBtn;

class ShowPost extends Component {
	static defaultProps = {
		avtar: false,
		name: 'Your Name',
		time: 'Just Now',
		privacy: 'public',
		caption: 'Some Awesome Caption',
		images: [],
		likes: 0,
		editedCaption: ''
	};

	constructor(props) {
		super(props);
		this.state = {
			emoji: null,
			iLiked: props.iLiked,
			visible: false,
			confirmLoading: false,
			ShowComments: false
		};
	}

	componentDidMount() {
		// this.setState({ iLiked: true });
	}

	showEditModal = (prevCaption) => {
		this.setState({
			visible: true,
			editedCaption: prevCaption
		})
	}
	handleOk = (PostID) => {
		const { editedCaption } = this.state;
		const { UpdatePost } = this.props;

		this.setState({
			confirmLoading: true,
		},
			() => UpdatePost(PostID, editedCaption)
		);
		setTimeout(() => {
			this.setState({
				visible: false,
				confirmLoading: false
			});
		}, 1000);
	}
	handleCancel = () => {
		// console.log('Clicked cancel button');
		this.setState({
			visible: false,
			editedCaption: ''
		});
	}

	LikedByMe = (PostID) => {
		const { iLiked } = this.state;
		const { user, UserInfo, ClassID } = this.props;
		const Userid = user.user.uid;
		const Username = UserInfo.username;

		const UserLikeRef = db.ref(`Classes/${ClassID}/Posts/${PostID}/Likes`).child(Userid);

		if (!iLiked) {
			UserLikeRef.set({
				username: Username,
				Liked: true
			}).then(() => { this.setState({ iLiked: true }); console.log('liked') })
		} else {
			UserLikeRef.remove()
				.then(() => { this.setState({ iLiked: false }); console.log('disliked') })
		}
	}

	ToggleCommentsSection = () => {
		const { ShowComments } = this.state;
		this.setState({ ShowComments: !ShowComments })
	}

	render() {
		const { emoji, iLiked, visible, confirmLoading, editedCaption, ShowComments } = this.state;
		const { avtar, name, userid, time, caption, deletePost, type_of_files, files, filesInfo, likes, PostID, isEdited } = this.props;
		const user = this.props.user || { user: {} };
		let fileList = [];



		return (
			<div>
				<div className="post">

					<div className="head">
						<div className="avatar">
							<img src={avtar ? avtar : defaultAvtar} alt="Img" />
						</div>

						<span className="name"><p style={{}}>{name}</p></span>

						<div className="time">
							{isEdited && <span><b>Edited&nbsp;&nbsp;</b></span>}
							{time}
						</div>

						<div className='dots'>
							{(user.user.uid === userid) &&
								<Popconfirm title="Are you sure you want to delete this Post?" onConfirm={() => { deletePost(PostID) }} okText="Yes" cancelText="No">
									<Popover content="Delete post">
										<label><i className="far fa-trash-alt"></i></label>
									</Popover>
								</Popconfirm>
							}
							<br />

							{(user.user.uid === userid) &&
								<Popover onClick={() => this.showEditModal(caption)} content="Edit post">
									<label><i className="far fa-edit"></i></label>
								</Popover>
							}
							<Modal title="Update your post" visible={visible} onOk={() => this.handleOk(PostID)} confirmLoading={confirmLoading} onCancel={this.handleCancel}>
								<TextArea value={editedCaption} onChange={(e) => this.setState({ editedCaption: e.target.value })} style={{ resize: 'none' }} className='form-control' type='text' autosize={{ minRows: 3, maxRows: 9 }} /><br />
							</Modal>
						</div>
					</div>


					<div className="caption">{caption}</div>


					{type_of_files === 'image' &&
						<div className="images" style={files.length > 0 ? { height: 'auto' } : { height: 0 }}>
							<FbImageLibrary beautify images={files} />
						</div>
					}
					{type_of_files === 'video' &&
						<div>
							<ReactPlayer url={files} controls width='100%' />
						</div>
					}

					{type_of_files === 'application' &&
						<div style={{}}>
							{filesInfo.forEach((file, index) => {
								fileList.push({
									uid: index,
									name: file.fileName,
									status: 'done',
									url: file.url,
									thumbUrl: file.url, // For IE 8/9
								});
							})
							}

							{/* Boolean or { showPreviewIcon?: boolean, showRemoveIcon?: boolean } */}
							<Upload fileList={fileList} listType='picture' /*showUploadList={false}*/ /* action='//jsonplaceholder.typicode.com/posts/' */ />
						</div>
					}

					<div className="likesCount">
						<div className="likes">
							{(iLiked || likes > 0) && (
								// niche thumbs-up wali image aegi liked krne pey.
								<img src={Liked} alt="." />
							)}

							{/* {emoji}{likes} */}
							{/* {iLiked && ' You'}
							{iLiked && likes > 0 && ' & '}
							{likes > 0 && likes}
							{iLiked && likes > 0 && ' Others'} */}

							{likes > 0 && emoji}
							{likes > 0 && ` ${likes} `}
							{(likes === 1 && ` student `) || (likes > 1 && ` students `)}
							{likes > 0 && ` liked this post`}

							{/* Agar current user ki id hai sirf to & 3 Others show nahi karnaaa */}
							{/* {emoji && ' You'} {emoji && likes > 0 && ' & '}
							{likes > 0 && likes} {emoji && likes > 0 && ' Others'} */}
						</div>
					</div>


					<div className="btns">
						<div className="likeBtn" onClick={() => this.LikedByMe(PostID)}>
							<label className="form-control btn btn-outline-default" style={{ border: '1px solid #e9ebee', display: 'flex', justifyContent: 'center', alignContent: 'center' }} >
								{
									iLiked ? (
										<i className="fas fa-thumbs-up fa-2x" />
									) : (
											<i className="far fa-thumbs-up fa-2x" />
										)
								}
								{/* <i className={`${iLiked ? 'fas' : 'far'} fa-thumbs-up fa-2x`}></i>
								<i className={`${iLiked ? 'fas' : 'far'} fa-thumbs-up fa-2x`}></i> */}
								<b style={{ fontSize: '17px' }}>&nbsp;{iLiked ? 'Liked' : 'Like'}</b>
							</label>
						</div>

						<div className="commentBtn" onClick={this.ToggleCommentsSection}>
							<label className="form-control btn btn-outline-default" style={{ border: '1px solid #e9ebee', display: 'flex', justifyContent: 'center', alignContent: 'center' }} /*onClick={this.CommentBox}*/ >
								<i className="far fa-comment-alt fa-2x"></i>
								<b style={{ fontSize: '17px' }}>&nbsp;Comments</b>
							</label>
						</div>
					</div>


					<div>
						{ShowComments && <Comments PostID={PostID} />}
					</div>
					<br />

				</div>
				<div>&nbsp;</div>
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
		// updateUser: (user) => dispatch(updateUser(user))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ShowPost);
