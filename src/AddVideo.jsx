import styled from 'styled-components';
import { useRef, useState } from 'react';

import ReactPlayer from 'react-player';
import { db, storage } from './firebase';
import captureVideoFrame from 'capture-video-frame';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from '@firebase/firestore';
const AddVideo = () => {
	const [videoFilePath, setVideoFilePath] = useState('');
	const [imageURL, setImageURL] = useState(null);
	const videoRef = useRef();
	const playerRef = useRef();
	const handleVideoUpload = (event) => {
		setImageURL(null);
		setVideoFilePath(URL.createObjectURL(event.target.files[0]));
		console.log(event.target);
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
				console.log('uploading video');
			},
			(error) => {
				console.log(error);
				window.alert(error);
			},
			async () => {
				await getDownloadURL(uploadVideoTask.snapshot.ref).then(
					(downloadURL) => {
						v = downloadURL;
						uploadThumbnailTask.on(
							'state_changed',

							(snapshot) => {
								console.log('uploading capture');

								const progress =
									(snapshot.bytesTransferred / snapshot.totalBytes) * 100;

								console.log('Thumbnail Upload is ', progress + '% done');
							},
							(error) => {
								console.log(error);
							},
							() => {
								getDownloadURL(uploadThumbnailTask.snapshot.ref).then(
									(downloadURL) => {
										console.log(downloadURL);
										addDoc(collection(db, 'videos'), {
											videoURL: v,
											thumbnailURL: downloadURL,
											timestamp: serverTimestamp(),
										});
										window.alert('added successfully');
										setImageURL(null);
										setVideoFilePath(null);
									}
								);
							}
						);
					}
				);
			}
		);
	};
	return (
		<Container>
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
								Capture
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
						Upload Video+Poster
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
