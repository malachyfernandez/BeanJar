import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

interface ContainerColProps extends PropsWithChildren {
    className?: string;
    style?: any;
    gap?: number;
}

const ContainerCol = ({ children, className, style, gap = 4 }: ContainerColProps) => {
    return (
        <View className={`flex-col ${className}`} style={{ gap: gap * 4, ...style }}>
            {children}
        </View>
    );
};

export default ContainerCol;