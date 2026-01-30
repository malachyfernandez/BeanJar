import React from 'react';
import { Text, View } from 'react-native';
import { useUserVariable } from "../../hooks/useUserVariable";

interface FriendItem {
    userId: string;
    data: {
        name?: string;
        email?: string;
    };
}

interface FriendCardItemProps {
    item: FriendItem;
}

const FriendCardItem = ({ item }: FriendCardItemProps) => {
    const [score] = useUserVariable<number>("count", 0, {
        userId: item.userId
    });

    return (
        <View className="p-4 border-b border-slate-700 flex-row justify-between items-center">
            <View>
                <Text className="text-white font-bold text-lg">
                    {item.data.name || "No Name"}
                </Text>
                <Text className="text-slate-400 text-sm">
                    {item.data.email || "No Email"}
                </Text>
            </View>
            <Text className="text-white font-bold text-lg">
                <Text className="text-white font-bold text-lg">
                    {score !== undefined ? score : "..."}
                </Text>
            </Text>
        </View>
    );
};

export default FriendCardItem;