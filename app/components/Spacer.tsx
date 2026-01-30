import React from 'react';
import { View } from 'react-native';

interface SpacerProps {
    className?: string;
}

const Spacer = ({ className }: SpacerProps) => {
    return (
        <View className={`flex-grow ${className}`} />
    );
};

export default Spacer;