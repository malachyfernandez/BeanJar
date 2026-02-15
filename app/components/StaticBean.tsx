import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, withSpring, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import BeanSVG from './BeanSVG';
import BeanCoverSVG from './BeanCoverSVG';
import TaskList from './TaskList';
import BeanInput from './BeanInput';
import SpeachBubble from './SpeachBubble';

type ScreenState = "typing" | "settings" | "falling" | "lead-in-to-animation" | "animating";

interface BeanProps {
    scale: SharedValue<number> | number;
    translateX: SharedValue<number> | number;
    translateY: SharedValue<number> | number;
    rotation: SharedValue<number> | number;
    cameraY: SharedValue<number> | number;
}

const StaticBean = ({ scale, translateX, translateY, rotation, cameraY }: BeanProps) => {



    //animated style
    const animatedStyle = useAnimatedStyle(() => {
        const scaleValue = typeof scale === 'number' ? scale : scale.value;
        const translateXValue = typeof translateX === 'number' ? translateX : translateX.value;
        const translateYValue = typeof translateY === 'number' ? translateY : translateY.value;
        const rotationValue = typeof rotation === 'number' ? rotation : rotation.value;
        const cameraYValue = typeof cameraY === 'number' ? cameraY : cameraY.value;


        return {
            transform: [
                { scale: scaleValue },
                { translateX: translateXValue },
                { translateY: translateYValue + cameraYValue * (1/scaleValue) },
                { rotate: rotationValue + "deg" }
            ]
        };
    });

    return (
        <Animated.View
            className={`w-[100vw] h-[100vw] flex items-center justify-center`}
            style={animatedStyle}
        >
            <View className='absolute'>
                <BeanSVG color="#BE185D" sizeVW={80} />
            </View>
        </Animated.View>
    );
};

export default StaticBean;

