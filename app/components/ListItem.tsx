import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

interface ListItemProps extends PropsWithChildren {
    className?: string;
}

const ListItem = ({ children, className }: ListItemProps) => {
    return (
        <View className={`w-[90vw] h-16 justify-center p-4 flex-row ${className}`}>
            {children}
        </View>            
    );
};

export default ListItem;