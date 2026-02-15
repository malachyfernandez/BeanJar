import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeOutDown, FadeOutRight, FadeOutUp, SharedValue, useSharedValue, withSpring } from 'react-native-reanimated';
import Bean from './Bean';
import TypingButtons from './TypingButtons';
import SettingsButtons from './SettingsButtons';
import PrivacyDropdown from './PrivacyDropdown';

import AppButton from './AppButton';
import BackArrowSVG from './BackArrowSVG';
import { translateXsAnimation as translateXsAnimation1, translateYsAnimation as translateYsAnimation1, rotationsAnimation as rotationsAnimation1 } from './BeanAnimations';
import { translateXsAnimation as translateXsAnimation2, translateYsAnimation as translateYsAnimation2, rotationsAnimation as rotationsAnimation2 } from './BeanAnimations-2';
import Jar from './Jar';
import StaticBean from './StaticBean';

interface BeanContainerProps extends PropsWithChildren {
    className?: string;
    beanText: string;
    setBeanText: (text: string) => void;
    numberOfBeans: number;
}

type ScreenState = "typing" | "settings" | "falling" | "lead-in-to-animation" | "animating";

type BeanPrivacy = "public" | "private";


const BeanContainer = ({ className, beanText, setBeanText, numberOfBeans }: BeanContainerProps) => {
    const TextStyle = {
        primary: "text-xl",
        secondary: "text-md opacity-50"
    } as const;

    const [screenState, setScreenState] = useState<ScreenState>("typing");

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [beanPrivacy, setBeanPrivacy] = useState<BeanPrivacy>("public");

    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotation = useSharedValue(0);
    const cameraY = useSharedValue(0);

    const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    //screen state bean animations
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
            // translateY.value = withSpring(0, { damping: 20, stiffness: 10 });
            scale.value = withSpring((.7), { duration: 400 });

            rotationTimeoutRef.current = setTimeout(() => {
                setScreenState("lead-in-to-animation");
            }, 1000);
        } else {
            clearTimeout(rotationTimeoutRef.current || undefined);
        }
        if (screenState === "lead-in-to-animation") {
            scale.value = withSpring((.3), { duration: 100 });
            translateY.value = withSpring(-2000, { duration: 400 });

            timeoutRef.current = setTimeout(() => {
                setScreenState("animating");
            }, 1000);
        } else {
            clearTimeout(timeoutRef.current || undefined);
        }

        if (screenState === "animating") {
            cameraY.value = withSpring(-700, { duration: 4000 });
        } else 
            if (screenState === "lead-in-to-animation") {
            cameraY.value = withSpring(-400, { duration: 1000 });
        } else {
            cameraY.value = withSpring(0, { duration: 400 });
        }


        return () => {
            clearTimeout(rotationTimeoutRef.current || undefined);
        };
    }, [screenState]);

    const intervalIndex = useRef<number>(0);


    const animationFrameDuration = 20;

    const animationScale = 70;

    const startingAnimationIndex = 50;


    const getFinalTranslateY = (val: number) => -1 * val * animationScale  + 3470;
    const getAdjustedTranslateX = (val: number) => val * animationScale;
    const getAdjustedRotation = (val: number) => (-1 * val * 27) + 100;

    //Animation frame-by-frame
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
            // console.log("Animation:", finalTranslateY, adjustedTranslateX, adjustedRotation);
            rotation.value = withSpring(adjustedRotation, { duration: animationFrameDuration });

            

        }, animationFrameDuration);


        return () => clearInterval(intervalId);
    }, [screenState, intervalIndex]);


    const beanLocations = [{ translateX: 6.0905, translateY: 2.2181, rotation: -9.0400 }]


    

    return (
        <View className={`w-[100vw] h-[100vw] flex items-center justify-center ${className}`}>

            <View
                className="absolute w-full items-center justify-center"
                pointerEvents="box-none"
            >
                <Jar
                    svg="back-jar"
                    screenState={screenState}
                    cameraY={cameraY}
                />
            </View>

            {(screenState === "animating" || screenState === "lead-in-to-animation") && (
                <View
                    className="absolute w-full items-center justify-center"

                >
                    <StaticBean
                        scale={0.3}
                        translateX={getAdjustedTranslateX(beanLocations[0].translateX)}
                        translateY={getFinalTranslateY(beanLocations[0].translateY)}
                        rotation={getAdjustedRotation(beanLocations[0].rotation)}
                        cameraY={cameraY}
                    />

                </View>
            )}

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





            <View
                className="absolute w-full items-center justify-center"
                pointerEvents="box-none"
            >
                <Jar
                    svg="front-jar"
                    screenState={screenState}
                    cameraY={cameraY}
                />
            </View>

            <View
                className="absolute w-full items-center justify-center"
                pointerEvents="box-none"
            >

                {(screenState === "typing") && (
                    <TypingButtons
                        beanText={beanText}
                        setScreenState={setScreenState}
                    />
                )}


                {(screenState === "settings" || screenState === "falling") && (
                    <Animated.View
                        key="settings-buttons"
                        entering={FadeInRight}
                        exiting={FadeOutRight}
                        className="absolute w-[100vw] h-[100vw] items-center justify-center"
                    >
                        {(screenState !== "falling") && (
                            <Animated.View
                                key="settings-buttons-down"
                                exiting={FadeOutUp}
                                className="w-[100vw] h-[100vw] items-center justify-center"
                            >
                                <SettingsButtons
                                    beanPrivacy={beanPrivacy}
                                    setScreenState={setScreenState}
                                    setIsDropdownOpen={setIsDropdownOpen}
                                />
                            </Animated.View>
                        )
                        }
                    </Animated.View>
                )}

                {(screenState == "falling" || screenState == "lead-in-to-animation" || screenState == "animating") && (
                    <AppButton
                        variant="grey"
                        className="w-16"
                        onPress={() => setScreenState("settings")}
                    >
                        <BackArrowSVG size={24} />
                    </AppButton>
                )
                }

                {(isDropdownOpen === true) && (
                    <PrivacyDropdown
                        setIsDropdownOpen={setIsDropdownOpen}
                        setBeanPrivacy={setBeanPrivacy}
                    />
                )}
            </View>
        </View >
    );
};

export default BeanContainer;

