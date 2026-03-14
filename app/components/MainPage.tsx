import React, { PropsWithChildren, useState } from 'react';

import { useUserVariable } from 'hooks/useUserVariable';
import { useSyncUserData } from 'hooks/useSyncUserData';
import ContainerCol from './layout/ContainerCol';
import { useClerk } from '@clerk/clerk-expo';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import PoppinsText from './ui/PoppinsText';
import { useUserVariableGet } from 'hooks/useUserVariableGet';
import { useUserVariablePrivacy } from 'hooks/useUserVariablePrivacy';
import ContainerRow from './layout/ContainerRow';
import AppButton from './ui/AppButton';
import { useUserList } from 'hooks/useUserList';
import { useUserListSet } from 'hooks/useUserListSet';
import { useUserListGet } from 'hooks/useUserListGet';
import PoppinsTextInput from './ui/PoppinsTextInput';
import MyProfile from './sections/MyProfile';
import FindFollowing from './sections/FindFollowing';
import Following from './sections/Following';
import Feed from './sections/Feed';
import AddPost from './sections/AddPost';
import NavButton from './ui/NavButton';

type FontWeight = 'regular' | 'medium' | 'bold';

interface MainPageProps extends PropsWithChildren {
    className?: string;
}

const MainPage = ({
    className = '',
}: MainPageProps) => {


    interface UserData {
        email?: string;
        name?: string;
        userId?: string
    };

    const [userData, setUserData] = useUserVariable<UserData>({
        key: "userData",
        defaultValue: {},
        privacy: "PUBLIC",
        searchKeys: ["name"],
    });




    useSyncUserData(userData.value, setUserData);

    const { signOut } = useClerk();

    const [followingList, setFollowingList] = useUserVariable<string[]>({
        key: "followingList",
        defaultValue: [],
    })

    const addFollowing = (friend: any) => {
        if (!friend?.userId) {
            return;
        }

        setFollowingList([...(followingList.value || []), friend.userId])
    }


    const currentUserID = (userData?.value.userId || "LOADING...")
    const currentUserEmail = (userData?.value.email || "LOADING...")

    type PageState = "Profile" | "Following" | "Feed";

    const [pageState, setPageState] = useState<PageState>("Profile");

    return (
        <View className='justify-between w-full h-full'>

            <ContainerCol>

                <AppButton variant="grey" className="w-full" onPress={() => signOut()}>
                    <ContainerRow>
                        <PoppinsText>Sign Out</PoppinsText>
                        <PoppinsText>{currentUserEmail}</PoppinsText>
                    </ContainerRow>
                </AppButton>

                <ContainerRow className='w-full justify-between'>
                    <NavButton buttonID="Profile" pageState={pageState} setPageState={setPageState} />
                    <NavButton buttonID="Following" pageState={pageState} setPageState={setPageState} />
                    <NavButton buttonID="Feed" pageState={pageState} setPageState={setPageState} />
                </ContainerRow>



                {pageState === "Profile" && <MyProfile currentUserID={currentUserID} />}

                {pageState === "Following" && <Following followingList={followingList.value || []} currentUserId={currentUserID} addFollowing={addFollowing} />}

                {pageState === "Feed" && <Feed followingList={followingList.value || []} />}

            </ContainerCol>

            <AddPost />
        </View>
    );
};

export default MainPage;
