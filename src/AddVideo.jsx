import styled from 'styled-components';
import { useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import ReactPlayer from 'react-player';
import { db, storage } from './firebase';
import captureVideoFrame from 'capture-video-frame';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from '@firebase/firestore';
const AddVideo = () => {
	const [videoFilePath, setVideoFilePath] = useState('');
	const [imageURL, setImageURL] = useState(null);
	const [success, setSuccess] = useState(null);
	const [error, setError] = useState(null);
	const [uploading, setUploading] = useState(null);
	const videoRef = useRef();
	const playerRef = useRef();
	const handleVideoUpload = (event) => {
		setImageURL(null);
		setVideoFilePath(URL.createObjectURL(event.target.files[0]));
	};
	const captureThumbnail = () => {
		const frame = captureVideoFrame(playerRef.current.getInternalPlayer());
		setImageURL(frame);
		console.log('captured frame', frame);
	};

	const handleUpload = async () => {
		const video = videoRef.current.files[0];
		if (!video) {
			window.alert('Please select a Video');
			return;
		}
		if (!imageURL) {
			window.alert('Please capture Thumbnail');
			return;
		}
		const imageStorageRef = ref(storage, `${Math.random()}`);
		const videoStorageRef = ref(storage, video.name);
		const uploadVideoTask = uploadBytesResumable(videoStorageRef, video);
		const uploadThumbnailTask = uploadBytesResumable(
			imageStorageRef,
			imageURL?.blob
		);
		let v;
		uploadVideoTask.on(
			'state_changed',
			(snapshot) => {
				const uploadProgress =
					(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				setUploading(true);
			},
			(error) => {
				setUploading(false);
			},
			() => {
				getDownloadURL(uploadVideoTask.snapshot.ref).then((downloadURL) => {
					v = downloadURL;
					uploadThumbnailTask.on(
						'state_changed',

						(snapshot) => {},
						(error) => {
							window.alert(error);
							setUploading(false);
						},
						() => {
							getDownloadURL(uploadThumbnailTask.snapshot.ref).then(
								(downloadURL) => {
									addDoc(collection(db, 'videos'), {
										videoURL: v,
										thumbnailURL: downloadURL,
										timestamp: serverTimestamp(),
									});
									setSuccess({
										success: true,
										message: 'Video uploaded successfully.',
									});
									setImageURL(null);
									setVideoFilePath(null);
									setUploading(false);
								}
							);
						}
					);
				});
			}
		);
	};
	return (
		<Container>
			{uploading && (
				<Progress>
					<LinearProgress />
				</Progress>
			)}
			<AlertMessage>
				{success && (
					<Alert
						onClose={() => {
							setSuccess(null);
						}}
					>
						{success.message}
					</Alert>
				)}
			</AlertMessage>
			<AddContainer>
				<Step>
					<h1>Step 1</h1>
					<VideoContainer>
						<Label htmlfor="video-upload">
							Add Video
							<input
								id="video-upload"
								type="file"
								onChange={handleVideoUpload}
								accept="video/mp4"
								ref={videoRef}
							/>
						</Label>
						{videoFilePath && (
							<ReactPlayer
								url={videoFilePath}
								controls={true}
								ref={playerRef}
								width="400px"
							/>
						)}
					</VideoContainer>
				</Step>
				<Step>
					<h1>Step 2</h1>
					<ThumbnailContainer>
						<div>
							<Button onClick={captureThumbnail} disabled={!videoFilePath}>
								Capture Thumbnail
							</Button>
						</div>
						{imageURL && <img src={imageURL?.dataUri} alt="Video Thumnail" />}
					</ThumbnailContainer>
				</Step>
				<Step>
					<h1>Step 3</h1>
					<Button
						onClick={handleUpload}
						disabled={!(videoRef.current?.files[0] && imageURL)}
					>
						Upload Video
					</Button>
				</Step>
			</AddContainer>
		</Container>
	);
};

export default AddVideo;
const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;
const Progress = styled.div`
	position: fixed;
	top: 5%;
	width: 500px;
	max-width: 60%;
	padding: 1.5rem 2rem;
	border: 8px;
	background-color: lightgray;
`;
const AlertMessage = styled.div`
	position: fixed;
	top: 5%;
`;
const AddContainer = styled.div`
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	align-items: flex-start;
	gap: 1rem;
`;
const VideoContainer = styled.div`
	height: 100%;
	div {
		padding: 1rem 0;
	}
`;
const ThumbnailContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;

	img {
		max-width: 500px;
		max-height: 400px;
	}
`;
const Button = styled.button`
	padding: 0.5rem 1.5rem;
	background-color: #28b463;
	outline: none;
	border: none;
	border-radius: 8px;
	font-size: 1rem;
	font-weight: 600;
	color: #333;
	&:disabled {
		background: gray;
		cursor: not-allowed;
		color: white;
	}
	cursor: pointer;
	input {
		opacity: 0;
	}
`;
const Label = styled.label`
	padding: 0.5rem 1rem;
	display: inline-block;
	font-weight: 600;
	background: #3b49df;
	color: #f3f3f3;
	border-radius: 8px;
	cursor: pointer;
	input {
		display: none;
	}
`;
const Step = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	gap: 2rem;
	margin: 1rem 0;
`;
