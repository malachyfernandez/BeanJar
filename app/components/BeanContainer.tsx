import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeOutDown, FadeOutRight, FadeOutUp, SharedValue, useSharedValue, withSpring } from 'react-native-reanimated';
import Bean from './Bean';
import TypingButtons from './TypingButtons';
import SettingsButtons from './SettingsButtons';
import PrivacyDropdown from './PrivacyDropdown';

import AppButton from './AppButton';
import BackArrowSVG from './BackArrowSVG';
import AnimatedBean from './AnimatedBean';
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

const jarSceneScale = 0.31;


const BeanContainer = ({ className, beanText, setBeanText, numberOfBeans }: BeanContainerProps) => {
    const TextStyle = {
        primary: "text-xl",
        secondary: "text-md opacity-50"
    } as const;

    const [screenState, setScreenState] = useState<ScreenState>("typing");

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [beanPrivacy, setBeanPrivacy] = useState<BeanPrivacy>("public");

    const cameraY = useSharedValue(0);

    const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Camera Y animation logic
    useEffect(() => {
        if (screenState === "animating") {
            cameraY.value = withSpring(-700, { duration: 4000 });
        } else if (screenState === "lead-in-to-animation") {
            cameraY.value = withSpring(-400, { duration: 1000 });
        } else {
            cameraY.value = withSpring(0, { duration: 400 });
        }
    }, [screenState]);

    // Screen state transition logic
    useEffect(() => {
        if (screenState === "falling") {
            rotationTimeoutRef.current = setTimeout(() => {
                setScreenState("lead-in-to-animation");
            }, 1000);
        } else {
            clearTimeout(rotationTimeoutRef.current || undefined);
        }
        
        if (screenState === "lead-in-to-animation") {
            timeoutRef.current = setTimeout(() => {
                setScreenState("animating");
            }, 1000);
        } else {
            clearTimeout(timeoutRef.current || undefined);
        }

        return () => {
            clearTimeout(rotationTimeoutRef.current || undefined);
        };
    }, [screenState]);

    // Helper functions for static beans
    const animationScale = 63;
    const getFinalTranslateY = (val: number) => -1 * val * animationScale + 3350;
    const getAdjustedTranslateX = (val: number) => val * animationScale;
    const getAdjustedRotation = (val: number) => (-1 * val * 27) + 100;




    const beanLocations = [
        { translateX: 6.0905, translateY: 2.2181, rotation: -9.0400 },
        { translateX: -4.6952, translateY: 1.4688, rotation: -3.8818 }


    ]




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
                
                    Array.from({ length: numberOfBeans }, (_, index) => (
                        <View
                            className="absolute w-full items-center justify-center"
                            key={index}
                        >

                            <StaticBean
                                scale={jarSceneScale}
                                translateX={getAdjustedTranslateX(beanLocations[index].translateX)}
                                translateY={getFinalTranslateY(beanLocations[index].translateY)}
                                rotation={getAdjustedRotation(beanLocations[index].rotation)}
                                cameraY={cameraY}
                            />


                        </View>
                    ))
                
            )}

            <AnimatedBean
                screenState={screenState}
                beanText={beanText}
                setBeanText={setBeanText}
                numberOfBeans={numberOfBeans}
                cameraY={cameraY}
            />





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

