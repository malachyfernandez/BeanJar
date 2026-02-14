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
    screenState: ScreenState;
    beanText: string;
    setBeanText: (text: string) => void;
    scale: SharedValue<number>;
    translateX: SharedValue<number>;
    translateY: SharedValue<number>;
    rotation: SharedValue<number>;
}

const Bean = ({ screenState, beanText, setBeanText, scale, translateX, translateY, rotation }: BeanProps) => {
    const animationCompletion = useSharedValue(0);
    const [isCoverVisible, setIsCoverVisible] = useState(true);

    useEffect(() => {
        if (screenState !== "typing") {
            animationCompletion.value = withSpring(1);
        } else {
            animationCompletion.value = withSpring(0);
        }

        if (screenState === "falling" || screenState === "lead-in-to-animation" || screenState === "animating") {
            setIsCoverVisible(false);
        } else {
            setIsCoverVisible(true);
        }
    }, [screenState]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: rotation.value + "deg" }
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

            <TaskList isAnimationEnabled={(beanText === "")} />
            <BeanInput
                screenState={screenState}
                beanText={beanText}
                setBeanText={setBeanText}
            />

            {isCoverVisible &&
                <View
                    className='absolute border-[#0F172A] border-[20px]'
                    pointerEvents="none">
                    <BeanCoverSVG color="#0F172A" sizeVW={91} />
                </View>
            }

            {isCoverVisible &&
                // {/* fake duplaicate element to hide odd rendering issue on edge of border (90 VW instead of 91 fills the 1px gap) */}
                <View
                    className='absolute border-[#0F172A] border-[20px]'
                    pointerEvents="none">
                    <BeanCoverSVG color="#FFF0" sizeVW={90} />
                </View>
            }
            <SpeachBubble
                animationCompletion={animationCompletion}
                beanText={beanText}
            />
        </Animated.View>
    );
};

export default Bean;
