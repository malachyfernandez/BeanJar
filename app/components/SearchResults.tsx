import React from 'react';
import { View } from 'react-native';
import AppButton from './ui/AppButton';
import PoppinsText from './ui/PoppinsText';
import { useUserVariableGet } from 'hooks/useUserVariableGet';

type SearchResultsProps = {
    query?: string;
    currentUserId?: string;
    addFollowing?: (friend: any) => void;
    followingList?: string[];
}

const SearchResults = ({ query, currentUserId, addFollowing, followingList }: SearchResultsProps) => {

    const userlist = useUserVariableGet({
        key: 'userData',
        searchFor: query,
    });

    return (
        <View>

            {userlist?.map((user, index) => {
                const userId = user.value.userId;

                if (userId === currentUserId) {
                    return null;
                }

                if (followingList?.includes(userId)) {
                    return (
                        <AppButton key={index} variant="grey" onPress={() => {
                            addFollowing?.(user.value);
                        }}>
                            <PoppinsText className='color-green-500'>{`${user.value.email || 'No email'} - Following`}</PoppinsText>
                        </AppButton>
                    );
                }

                return (
                    <AppButton key={index} variant="grey" onPress={() => {
                        addFollowing?.(user.value);
                    }}>
                        <PoppinsText>{user.value.email || 'No email'}</PoppinsText>
                    </AppButton>
                );
            })}


        </View>
    );
};

export default SearchResults;
