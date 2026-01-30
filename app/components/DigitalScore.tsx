import React, { PropsWithChildren } from 'react';
import { Text } from 'react-native';
import { useFonts } from 'expo-font';





interface DigitalScoreProps extends PropsWithChildren {
    score: number | null | undefined;
    className?: string;
}

const DigitalScore = ({ score, className }: DigitalScoreProps) => {

    const [fontsLoaded] = useFonts({
        'SevenSegment': require('../../assets/fonts/7segment.ttf'),
    });

    if (!fontsLoaded) {
        return <Text
            className={`text-red-700 text-9xl text-center my-10 ${className}`}
        >
            {'--'}
        </Text>;
    }
    return (
        <Text
            className={`text-red-700 text-9xl text-center my-10 ${className}`}
            style={{ fontFamily: 'SevenSegment' }}
        >
            {score ?? '--'}
        </Text>

    );
};

export default DigitalScore;