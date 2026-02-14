import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, withSpring, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import JarFrontSVG from './JarFrontSVG';
import JarBackSVG from './JarBackSVG';

type ScreenState = "typing" | "settings" | "falling" | "lead-in-to-animation" | "animating";

interface JarProps {
    svg: "front-jar" | "back-jar";
    screenState: ScreenState;
    cameraY: SharedValue<number>;
}

const Jar = ({ svg, screenState, cameraY }: JarProps) => {
    // const animationCompletion = useSharedValue(0);

    // useEffect(() => {
    //     if (screenState !== "typing") {
    //         animationCompletion.value = withSpring(1);
    //     } else {
    //         animationCompletion.value = withSpring(0);
    //     }
    // }, [screenState]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: (cameraY.value + 750) },
            ]
        };
    });

    return (
        <Animated.View
            className={`w-[100vw] h-[100vw] flex items-center justify-center pointer-events-none`}
            style={animatedStyle}
        >
            <View className='absolute opacity-50'>
                {svg === "front-jar" &&
                    <JarFrontSVG color="#FFF5" sizeVW={100} />
                }
                {svg === "back-jar" &&
                    <JarBackSVG color="#FFF5" sizeVW={100} />
                }
            </View>

        </Animated.View>
    );
};

export default Jar;
