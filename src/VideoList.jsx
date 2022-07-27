import { useEffect, useState } from 'react';
import styled from 'styled-components';
import VideoItem from './VideoItem';
import { collection, orderBy, query, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
const VideoList = () => {
	const [videoList, setVideoList] = useState([]);
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		const getPosts = async () => {
			setLoading(true);
			onSnapshot(
				query(collection(db, 'videos'), orderBy('timestamp', 'desc')),
				(snapShot) => {
					setVideoList(
						snapShot.docs.map((doc) => {
							return {
								id: doc.id,
								data: doc.data(),
							};
						})
					);
					setLoading(false);
				}
			);
		};
		getPosts();
	}, []);

	return (
		<StyledVideoList>
			<Title>Added Videos</Title>
			<VideosContainer>
				{loading ? (
					<h3>Loading...</h3>
				) : (
					videoList.map(({ id, data }) => {
						return (
							<VideoItem
								videoURL={data.videoURL}
								thumbnailURL={data.thumbnailURL}
								key={id}
							/>
						);
					})
				)}
			</VideosContainer>
		</StyledVideoList>
	);
};

export default VideoList;
const StyledVideoList = styled.div`
	padding: 2rem;
	background: #f4f4f4;
`;
const Title = styled.h3`
	font-weight: 600;
	text-align: center;
	margin-bottom: 1rem;
`;
const VideosContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 3rem;
	flex-direction: column;
`;
