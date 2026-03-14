import React from 'react';
import PoppinsText from '../ui/PoppinsText';
import { useUserListGet } from 'hooks/useUserListGet';
import { View } from 'react-native';
import ContainerCol from '../layout/ContainerCol';
import PostList from './PostList';

const Feed = ({ followingList }: { followingList: string[] }) => {
    const posts = useUserListGet({
        key: "posts",
        userIds: followingList,
    });
    
    return (

        <ContainerCol gap={2}>
            <PoppinsText>Feed</PoppinsText>
            <PostList posts={posts} />
        </ContainerCol>
    );
};

export default Feed;
