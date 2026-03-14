import React from 'react';
import PoppinsText from './PoppinsText';
import { useUserVariableGet } from 'hooks/useUserVariableGet';
import ContainerCol from '../layout/ContainerCol';
import ContainerRow from '../layout/ContainerRow';

interface FriendListItemProps {
    friend: string;
}

const FriendListItem = ({ friend }: FriendListItemProps) => {
    const friendData = useUserVariableGet({
        key: "userData",
        userIds: [friend],
    });

    const email = friendData?.[0]?.value.email;
    const userId = friendData?.[0]?.value.userId;
    const name = friendData?.[0]?.value.name;


    return (
        <ContainerCol gap={1}>
            {email && (
                <ContainerRow>
                    <PoppinsText weight='bold'>{email}</PoppinsText>
                </ContainerRow>
            )}
            {name && (
                <ContainerRow>
                    <PoppinsText>{name}</PoppinsText>
                </ContainerRow>
            )}
            {userId && (
                <ContainerRow>
                    <PoppinsText className='text-sm opacity-50'>{`User ID: ${userId}`}</PoppinsText>
                </ContainerRow>
            )}
            
        </ContainerCol>
    );
};

export default FriendListItem;
