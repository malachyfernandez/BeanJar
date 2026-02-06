import React, { PropsWithChildren } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import BeanSVG from './BeanSVG';
import CameraSVG from './CameraSVG';
import PoppinsText from './PoppinsText';
import PoppinsTextInput from './PoppinsTextInput';
import TaskList from './TaskList';
import BeanCoverSVG from './BeanCoverSVG';

interface BeanContainerProps extends PropsWithChildren {
    className?: string;
    beanText: string;
    setBeanText: (text: string) => void;
}

const BeanContainer = ({ className, beanText, setBeanText }: BeanContainerProps) => {
    return (
        <View className={`w-[100vw] h-[100vw] flex items-center justify-center ${className}`}>

            <View className='absolute'>
                <BeanSVG color="#BE185D" sizeVW={80} />
            </View>

            <TaskList isAnimationEnabled={(beanText === "")} />
            <View className='absolute'>


                <PoppinsTextInput
                    className="w-[70vw] h-12 rounded-md px-4 text-white text-xl border border-[#FFffFF99]"
                    weight="bold"
                    placeholderTextColor="#FFffFF99"
                    value={beanText}
                    onChangeText={setBeanText}
                />

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

            <Animated.View
                className='absolute w-full flex items-center justify-center'
            >
                <TouchableOpacity
                    className="w-[70vw] h-16 flex items-center justify-center rounded-[15px] border border-white/30 bg-[#0f1627bf] flex-row gap-2"
                >
                    <CameraSVG />
                    <PoppinsText weight="bold">HELLO</PoppinsText>
                </TouchableOpacity>
            </Animated.View>
        </View>


    );
};

export default BeanContainer;

