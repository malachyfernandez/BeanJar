import React from 'react';
import { View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import PoppinsTextInput from './PoppinsTextInput';

type ScreenState = "typing" | "settings" | "falling" | "lead-in-to-animation" | "animating";

interface BeanInputProps {
    screenState: ScreenState;
    beanText: string;
    setBeanText: (text: string) => void;
}

const BeanInput = ({ screenState, beanText, setBeanText }: BeanInputProps) => {
    const TextStyle = {
        primary: "text-xl",
        secondary: "text-md opacity-50"
    } as const;

    return (
        <View className='absolute'>
            {screenState == "typing" && (
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
            ) }
        </View>
    );
};

export default BeanInput;
