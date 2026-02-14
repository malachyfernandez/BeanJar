import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import PoppinsText from './PoppinsText';
import SpeachBubbleArmSVG from './SpeachBubbleArmSVG';

interface SpeachBubbleProps {
    animationCompletion: SharedValue<number>;
    beanText: string;
}

const SpeachBubble = ({ animationCompletion, beanText }: SpeachBubbleProps) => {
    const TextStyle = {
        primary: "text-xl",
        secondary: "text-md opacity-50"
    } as const;

    const containerAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            animationCompletion.value,
            [0, 1],
            [0, -95] // before: -120, after: -95
        );
        
        const translateX = interpolate(
            animationCompletion.value,
            [0, 1],
            [0, -20] // before: -40, after: -20
        );

        const opacity = interpolate(
            animationCompletion.value,
            [0, 1],
            [0, 1] // before: transparent, after: fully visible
        );

        return {
            transform: [{ translateY }, { translateX }],
            opacity
        };
    });

    const bubbleAnimatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            animationCompletion.value,
            [0, 1],
            [0.8, 1] // before: smaller, after: normal size
        );

        const opacity = interpolate(
            animationCompletion.value,
            [0, 1],
            [0, 1] // before: transparent, after: fully visible
        );

        return {
            transform: [{ scale }],
            opacity
        };
    });

    const armAnimatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            animationCompletion.value,
            [0, 1],
            [10, 20] // before: 0, after: 20
        );
        
        const translateY = interpolate(
            animationCompletion.value,
            [0, 1],
            [-20, -8] // before: 0, after: -8
        );

        const opacity = interpolate(
            animationCompletion.value,
            [0, 1],
            [0, 1] // before: transparent, after: fully visible
        );

        return {
            transform: [{ translateX }, { translateY }],
            opacity
        };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            animationCompletion.value,
            [0, 1],
            [0, 1] // before: transparent, after: fully visible
        );

        return {
            opacity
        };
    });

    return (
        <Animated.View
            className="max-w-[70vw] min-h-14 border border-[#fff0] flex justify-center"
            style={containerAnimatedStyle}
        >
            <Animated.View
                className="max-w-[70vw] min-h-14 rounded-xl px-4 border border-[#fff0] flex justify-center"
                style={[bubbleAnimatedStyle, { backgroundColor: "#fff" }]}
            >
                <Animated.View style={textAnimatedStyle}>
                    <PoppinsText
                        className={TextStyle.primary}
                        weight="bold"
                        style={{ color: "#000" }}
                    >{beanText}</PoppinsText>
                </Animated.View>
            </Animated.View>
            <Animated.View style={armAnimatedStyle}>
                <SpeachBubbleArmSVG size={24} />
            </Animated.View>
        </Animated.View>
    );
};

export default SpeachBubble;
