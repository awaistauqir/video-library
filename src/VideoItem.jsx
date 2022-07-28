import React from 'react';
import styled from 'styled-components';
const VideoItem = (props) => {
	return (
		<Card>
			<video src={props.videoURL} poster={props.thumbnailURL} controls></video>
		</Card>
	);
};

export default VideoItem;
const Card = styled.div`
	background-color: #fff;
	border-radius: 10px;

	video {
		border-radius: 1rem;
		width: 400px;
		object-fit: contain;
	}
`;
