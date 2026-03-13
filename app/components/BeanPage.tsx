import React, { PropsWithChildren, useEffect } from 'react';

import { useUserVariable } from 'hooks/useUserVariable';
import { useSyncUserData } from 'hooks/useSyncUserData';
import ContainerCol from './layout/ContainerCol';
import { useClerk } from '@clerk/clerk-expo';
import { Text, TouchableOpacity, View } from 'react-native';
import PoppinsText from './ui/PoppinsText';
import { useUserVariableGet } from 'hooks/useUserVariableGet';
import { useUserVariablePrivacy } from 'hooks/useUserVariablePrivacy';
import ContainerRow from './layout/ContainerRow';
import AppButton from './ui/AppButton';
import { useUserList } from 'hooks/useUserList';

type FontWeight = 'regular' | 'medium' | 'bold';

interface BeanPageProps extends PropsWithChildren {
    className?: string;
}

const BeanPage = ({
    className = '',
}: BeanPageProps) => {


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

    const [myGames, setMyGames] = useUserList({
        key: "myGames",
        itemId: "gameId",
        defaultValue: {title: "hello", description: "world", players: 2},
    })

    return (
        <View className='justify-between w-full h-full'>

            <ContainerCol>
<PoppinsText>{JSON.stringify(myGames.value)}</PoppinsText>
            </ContainerCol>

            <View className='w-full items-center p-5 border-t border-slate-700'>
                <ContainerRow className='w-full justify-between'>
                    <AppButton variant="grey" className="w-40" onPress={() => setMyGames({title: "hello", description: "world", players: 3})}>
                        <PoppinsText>New WolffsPoint</PoppinsText>
                    </AppButton>

                    <AppButton variant="grey" className="w-40" onPress={() => signOut()}>
                        <PoppinsText>Sign Out</PoppinsText>
                    </AppButton>

                </ContainerRow>
            </View>
        </View>
    );
};

export default BeanPage;
