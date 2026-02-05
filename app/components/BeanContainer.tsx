import React, { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';
import BeanSVG from './BeanSVG';
import PoppinsText from './PoppinsText';
import PoppinsTextInput from './PoppinsTextInput';
import TaskList from './TaskList';

interface BeanContainerProps extends PropsWithChildren {
    className?: string;
    beanText: string;
    setBeanText: (text: string) => void;
}

const BeanContainer = ({ className, beanText, setBeanText }: BeanContainerProps) => {
    return (
        <View className={`w-[100vw] h-[100vw] bg-red-500 flex items-center justify-center ${className}`}>
            <BeanSVG className='absolute' color="#BE185D" sizeVW={80} />
            <TaskList/>
            <View className='absolute'>
                
                
                <PoppinsTextInput
                    className="w-[70vw] h-12 rounded-md px-4 text-white text-xl border border-[#FFffFF99]"
                    weight="bold"
                    placeholderTextColor="#FFffFF99"
                    value={beanText}
                    onChangeText={setBeanText}
                />

            </View>
        </View>

        // <PoppinsText className='absolute' weight="regular">Regular text</PoppinsText>
        // <PoppinsText className='absolute' weight="medium">Medium text</PoppinsText>
        // <PoppinsText className='absolute' weight="bold">Bold text</PoppinsText>


    );
};

export default BeanContainer;

