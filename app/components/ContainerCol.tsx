import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

interface ContainerColProps extends PropsWithChildren {
    className?: string;
}

const ContainerCol = ({ children, className }: ContainerColProps) => {
    return (
        <View className={`flex-col gap-4 ${className}`} >
            {children}
        </View>
    );
};

export default ContainerCol;