import React, { PropsWithChildren } from 'react';
import { Text } from 'react-native';

interface SubheadingProps extends PropsWithChildren {
    className?: string;
}

const Subheading = ({ children, className }: SubheadingProps) => {
    return (
        <Text className="text-white text-2xl font-bold ${className}">{children}</Text>
    );
};

export default Subheading;