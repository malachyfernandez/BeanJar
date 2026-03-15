import React from 'react';

import ContainerCol from '../layout/ContainerCol';
import PoppinsText from '../ui/PoppinsText';
import { useUserVariableGet } from 'hooks/useUserVariableGet';
import Comments from './Comments';
import AppButton from '../ui/AppButton';

import { useUserVariableLength } from 'hooks/useUserVariableLength';

import { useUserVariable } from 'hooks/useUserVariable';
import { useUserList } from 'hooks/useUserList';
import { useUserListLength } from 'hooks/useUserListLength';
import { useUserListSet } from 'hooks/useUserListSet';
import { useUserListGet } from 'hooks/useUserListGet';
interface PostProps {
    title: string;
    description: string;
    postId: string;
    posterID: string;
}

const Post = ({ title, description, postId, posterID }: PostProps) => {
    const safePosterId = posterID || '';

    const userDatas = useUserVariableGet({
        key: "userData",
        userIds: [safePosterId],
    });

    const email = userDatas?.[0]?.value?.email;

    const addLike = (postId: string) => {
        setLike({ state: `liked` })
    }

    const removeLike = (postId: string) => {
        setLike({ state: `not-liked` })
    }

    const getNumberOfLikes = useUserListLength({
        key: "likes",
        filterFor: `liked`,
        itemId: postId,
    });


    const [like, setLike] = useUserList({
        key: "likes",
        itemId: postId,
        privacy: "PUBLIC",
        filterKey: "state",
        defaultValue: { state: `not-liked` },
    });

    return (
        <ContainerCol gap={1} className='p-4 bg-slate-800'>
            <PoppinsText className='text-sm opacity-50'>{email || 'Loading...'}</PoppinsText>

            <PoppinsText weight='bold'>{title}</PoppinsText>
            <PoppinsText>{description}</PoppinsText>

            {like?.value.state === 'liked' ? (
                <AppButton variant='blue' onPress={() => removeLike(postId)}>
                    <PoppinsText>{`Liked ${getNumberOfLikes}`}</PoppinsText>
                </AppButton>
            ) :
                <AppButton variant='blue' onPress={() => addLike(postId)}>
                    <PoppinsText>{`Like ${getNumberOfLikes}`}</PoppinsText>
                </AppButton>
            }

            <Comments postId={postId} />
        </ContainerCol>
    );
};

export default Post;
