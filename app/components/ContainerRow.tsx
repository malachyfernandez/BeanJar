import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

interface ContainerRowProps extends PropsWithChildren {
    className?: string;
}

const ContainerRow = ({ children, className }: ContainerRowProps) => {
    return (
        <View className={`flex-row gap-3 ${className}`} >
            {children}
        </View>
    );
};

export default ContainerRow;