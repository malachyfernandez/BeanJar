import React, { PropsWithChildren, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInLeft, FadeInRight, FadeOut, FadeOutDown, FadeOutLeft, FadeOutRight } from 'react-native-reanimated';
import BeanSVG from './BeanSVG';
import CameraSVG from './CameraSVG';
import SendSVG from './SendSVG';
import PoppinsText from './PoppinsText';
import PoppinsTextInput from './PoppinsTextInput';
import TaskList from './TaskList';
import BeanCoverSVG from './BeanCoverSVG';
import AppButton from './AppButton';

interface BeanContainerProps extends PropsWithChildren {
    className?: string;
    beanText: string;
    setBeanText: (text: string) => void;
}

type ScreenState = "typing" | "settings";

const BeanContainer = ({ className, beanText, setBeanText }: BeanContainerProps) => {

    const [screenState, setScreenState] = useState<ScreenState>("typing");

    return (
        <View className={`w-[100vw] h-[100vw] flex items-center justify-center ${className}`}>

            <View className='absolute'>
                <BeanSVG color="#BE185D" sizeVW={80} />
            </View>

            <TaskList isAnimationEnabled={(beanText === "")} />
            <View className='absolute'>
                {screenState == "typing" ?
                <Animated.View
                    exiting={FadeOut}
                >
                    <PoppinsTextInput
                        className="w-[70vw] h-14 rounded-md px-4 text-white text-xl border border-[#fff9]"
                        weight="bold"
                        placeholderTextColor="#FFffFF99"
                        value={beanText}
                        onChangeText={setBeanText}
                    />
                </Animated.View>
                    :
                    <View
                        className="w-[70vw] h-14 rounded-md px-4 text-white text-xl border border-[#fff0] flex justify-center"
                    >
                        <PoppinsText
                            className='text-xl'
                            weight="bold"
                        >{beanText}</PoppinsText>
                    </View>
                }
            </View>



            <View
                className='absolute border-[#0F172A] border-[20px]'
                pointerEvents="none">
                <BeanCoverSVG color="#0F172A" sizeVW={91} />
            </View>

            {/* fake duplaicate element to hide odd rendering issue on edge of border (90 VW instead of 91 fills the 1px gap) */}
            <View
                className='absolute border-[#0F172A] border-[20px]'
                pointerEvents="none">
                <BeanCoverSVG color="#FFF0" sizeVW={90} />
            </View>


            {(screenState == "typing") ?
                (beanText ?
                    <Animated.View
                        className='absolute flex-row flex items-center justify-center mt-[10rem] w-[85vw] gap-4'
                        exiting={FadeOutLeft}
                    >
                        <Animated.View className="flex-1" entering={FadeInLeft.duration(300)}>
                            <AppButton
                                variant="blur"
                                className="flex-1 drop-shadow-lg"
                            >

                                <CameraSVG size={22} />
                                <PoppinsText weight="medium" className='text-xl'>Snap a Photo</PoppinsText>
                            </AppButton>
                        </Animated.View>

                        <Animated.View entering={FadeInRight.duration(300)}>
                            <AppButton
                                variant="blue"
                                className="w-24"
                                onPress={() => {
                                    setScreenState("settings");
                                }}
                            >
                                <SendSVG size={22} />

                            </AppButton>
                        </Animated.View>

                    </Animated.View>
                    :
                    <View className='w-24 h-16' />
                )
                :
                <Animated.View
                    className='absolute flex-row flex items-center justify-center bg-l w-[85vw] gap-4'
                    exiting={FadeOutLeft}
                >
                    <Animated.View className="flex-1" entering={FadeInLeft.duration(300)}>
                        <AppButton
                            variant="blur"
                            className="flex-1 drop-shadow-lg"
                        >

                            <CameraSVG size={22} />
                            <PoppinsText weight="medium" className='text-xl'>Snap a Photo</PoppinsText>
                        </AppButton>
                    </Animated.View>

                    <Animated.View entering={FadeInRight.duration(300)}>
                        <AppButton
                            variant="blue"
                            className="w-24"
                            onPress={() => {
                                setScreenState("settings");
                            }}
                        >
                            <SendSVG size={22} />

                        </AppButton>
                    </Animated.View>

                </Animated.View>
            }
        </View>


    );
};

export default BeanContainer;

