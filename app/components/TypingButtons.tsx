import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight } from 'react-native-reanimated';
import CameraSVG from './CameraSVG';
import SendSVG from './SendSVG';
import AppButton from './AppButton';
import PoppinsText from './PoppinsText';

type ScreenState = "typing" | "settings" | "falling";
type TextStyle = "text-xl" | "text-md opacity-50";

interface TypingButtonsProps {
    beanText: string;
    setScreenState: (state: ScreenState) => void;
}

const TypingButtons = ({ beanText, setScreenState }: TypingButtonsProps) => {
    const TextStyle = {
        primary: "text-xl",
        secondary: "text-md opacity-50"
    } as const;

    return (
        <Animated.View
            key="typing-buttons"
            entering={FadeInLeft}
            exiting={FadeOutLeft}
            className='w-[85vw]  mt-[10rem]'
        >
            {beanText !== "" ? (
                <View className='flex-row items-center justify-center gap-4'>
                    <Animated.View
                        key="button-left"
                        className="flex-1"
                        entering={FadeInLeft.duration(300)}
                        exiting={FadeOutLeft.duration(300)}
                    >
                        <AppButton
                            variant="outline"
                            className="flex-1 drop-shadow-lg"
                        >
                            <CameraSVG size={24} />
                            <PoppinsText weight="medium" className={TextStyle.primary}>Snap a Photo</PoppinsText>
                        </AppButton>
                    </Animated.View>

                    <Animated.View
                        key="button-right"
                        entering={FadeInRight.duration(300)}
                        exiting={FadeOutRight.duration(300)}
                    >
                        <AppButton
                            variant="blue"
                            className="w-24"
                            onPress={() => setScreenState("settings")}
                        >
                            <SendSVG size={24} />
                        </AppButton>
                    </Animated.View>
                </View>
            ) : (
                <View className='w-24 h-16' />
            )}
        </Animated.View>
    );
};

export default TypingButtons;
