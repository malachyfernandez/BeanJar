import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

interface ContainerRowProps extends PropsWithChildren {
    className?: string;
    gap?: number;
}

const ContainerRow = ({ children, className, gap = 4 }: ContainerRowProps) => {
    return (
        <View className={`flex-row ${className}`} style={{ gap: gap * 4 }}>
            {children}
        </View>
    );
};

export default ContainerRow;
