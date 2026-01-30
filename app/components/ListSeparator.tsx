import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

interface ListSeparatorProps extends PropsWithChildren {
    className?: string;
}

const ListSeparator = ({ className }: ListSeparatorProps) => {
    return (
        <View className="w-full items-center">
            <View className={`w-[80vw] h-[1px] justify-center bg-gray-700 ${className}`}>
            </View>  
        </View>          
    );
};

export default ListSeparator;