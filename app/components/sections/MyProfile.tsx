import React from 'react';
import PoppinsText from '../ui/PoppinsText';
import { useUserListSet } from 'hooks/useUserListSet';
import { useUserListGet } from 'hooks/useUserListGet';
import ContainerCol from '../layout/ContainerCol';
import PostList from './PostList';

interface MyProfileProps {
    currentUserID: string;
}

const MyProfile = ({ currentUserID }: MyProfileProps) => {
    const setPost = useUserListSet();

    const posts = useUserListGet({
        key: "posts",
        userIds: [currentUserID],
    });

    return (
        <ContainerCol gap={2}>
            <PoppinsText>My Profile</PoppinsText>
            <PostList posts={posts} />
        </ContainerCol>
    );
};

export default MyProfile;
