import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useSharedValue, withSpring, SharedValue } from 'react-native-reanimated';
import Bean from './Bean';
import { translateXsAnimation as translateXsAnimation1, translateYsAnimation as translateYsAnimation1, rotationsAnimation as rotationsAnimation1 } from './BeanAnimations';
import { translateXsAnimation as translateXsAnimation2, translateYsAnimation as translateYsAnimation2, rotationsAnimation as rotationsAnimation2 } from './BeanAnimations-2';
import { translateXsAnimation as translateXsAnimation3, translateYsAnimation as translateYsAnimation3, rotationsAnimation as rotationsAnimation3 } from './BeanAnimations-3';

type ScreenState = "typing" | "settings" | "falling" | "lead-in-to-animation" | "animating";

interface AnimatedBeanProps {
    screenState: ScreenState;
    beanText: string;
    setBeanText: (text: string) => void;
    numberOfBeans: number;
    cameraY: SharedValue<number>;
}

const jarSceneScale = 0.31;

const AnimatedBean = ({ 
    screenState, 
    beanText, 
    setBeanText, 
    numberOfBeans, 
    cameraY 
}: AnimatedBeanProps) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotation = useSharedValue(0);

    const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Screen state bean animations
    useEffect(() => {
        if (screenState === "typing") {
            translateX.value = withSpring(0, { damping: 20, stiffness: 10 });
            translateY.value = withSpring(0, { damping: 20, stiffness: 10 });
            scale.value = withSpring(1, { damping: 20, stiffness: 10 });
        } else if (screenState === "settings") {
            translateX.value = withSpring(0, { damping: 20, stiffness: 10 });
            translateY.value = withSpring(-100, { damping: 20, stiffness: 10 });
            scale.value = withSpring(1, { damping: 20, stiffness: 10 });
            rotation.value = withSpring(0, { damping: 20, stiffness: 10 });
        }
        if (screenState === "falling") {
            scale.value = withSpring((.7), { duration: 400 });

        } else {
            clearTimeout(rotationTimeoutRef.current || undefined);
        }
        if (screenState === "lead-in-to-animation") {
            scale.value = withSpring((jarSceneScale), { duration: 100 });
            translateY.value = withSpring(-2000, { duration: 400 });

        } else {
            clearTimeout(timeoutRef.current || undefined);
        }

        return () => {
            clearTimeout(rotationTimeoutRef.current || undefined);
        };
    }, [screenState]);

    const intervalIndex = useRef<number>(0);
    const animationFrameDuration = 20;
    const animationScale = 63;
    const startingAnimationIndex = 40;

    const getFinalTranslateY = (val: number) => -1 * val * animationScale + 3350;
    const getAdjustedTranslateX = (val: number) => val * animationScale;
    const getAdjustedRotation = (val: number) => (-1 * val * 27) + 100;

    // Animation frame-by-frame
    useEffect(() => {
        if (!(screenState === "animating")) {
            intervalIndex.current = startingAnimationIndex;
            return;
        }

        const intervalId = setInterval(() => {
            intervalIndex.current++;

            let finalTranslateY = 0, adjustedTranslateX = 0, adjustedRotation = 0;

            if (numberOfBeans === 0) {
                finalTranslateY = getFinalTranslateY(translateYsAnimation1[intervalIndex.current]);
                adjustedTranslateX = getAdjustedTranslateX(translateXsAnimation1[intervalIndex.current]);
                adjustedRotation = getAdjustedRotation(rotationsAnimation1[intervalIndex.current]);

            } else if (numberOfBeans === 1) {
                finalTranslateY = getFinalTranslateY(translateYsAnimation2[intervalIndex.current]);
                adjustedTranslateX = getAdjustedTranslateX(translateXsAnimation2[intervalIndex.current]);
                adjustedRotation = getAdjustedRotation(rotationsAnimation2[intervalIndex.current]);

            } else if (numberOfBeans === 2) {
                finalTranslateY = getFinalTranslateY(translateYsAnimation3[intervalIndex.current]);
                adjustedTranslateX = getAdjustedTranslateX(translateXsAnimation3[intervalIndex.current]);
                adjustedRotation = getAdjustedRotation(rotationsAnimation3[intervalIndex.current]);
            }

            const isAnimationComplete = (
                isNaN(finalTranslateY) ||
                isNaN(adjustedTranslateX) ||
                isNaN(adjustedRotation)
            );

            if (isAnimationComplete) {
                clearInterval(intervalId);
                return;
            }

            // Apply to shared values
            translateY.value = withSpring(finalTranslateY, { duration: animationFrameDuration });
            translateX.value = withSpring(adjustedTranslateX, { duration: animationFrameDuration });
            rotation.value = withSpring(adjustedRotation, { duration: animationFrameDuration });

        }, animationFrameDuration);

        return () => clearInterval(intervalId);
    }, [screenState, numberOfBeans]);

    return (
        <View
            className="absolute w-full items-center justify-center"
        >
            <Bean
                screenState={screenState}
                beanText={beanText}
                setBeanText={setBeanText}
                scale={scale}
                translateX={translateX}
                translateY={translateY}
                rotation={rotation}
                cameraY={cameraY}
            />
        </View>
    );
};

export default AnimatedBean;
