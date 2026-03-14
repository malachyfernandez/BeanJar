import React from 'react';
import PoppinsText from '../ui/PoppinsText';
import FriendListItem from '../ui/FriendListItem';
import FindFollowing from './FindFollowing';

interface FollowingProps {
    followingList: string[];
    currentUserId: string;
    addFollowing: (friend: any) => void;
}

const Following = ({ followingList, currentUserId, addFollowing }: FollowingProps) => {

    return (
        <>
            <FindFollowing currentUserId={currentUserId} addFollowing={addFollowing} followingList={followingList} />
            <PoppinsText>Following</PoppinsText>
            {followingList?.map((friend, index) => (

                <FriendListItem key={index} friend={friend} />
            ))}
        </>
    );
};

export default Following;
