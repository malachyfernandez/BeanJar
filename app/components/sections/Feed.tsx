import React from 'react';
import PoppinsText from '../ui/PoppinsText';
import { useUserListGet } from 'hooks/useUserListGet';
import { View } from 'react-native';
import ContainerCol from '../layout/ContainerCol';
import PostList from './PostList';

const Feed = ({ friendsList }: { friendsList: string[] }) => {
    const posts = useUserListGet({
        key: "posts",
        userIds: friendsList,
    });
    
    return (

        <ContainerCol gap={2}>
            <PoppinsText>Feed</PoppinsText>
            <PostList posts={posts} />
        </ContainerCol>
    );
};

export default Feed;
