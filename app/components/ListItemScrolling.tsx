import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import PoppinsText from './PoppinsText';

interface ListItemScrollingProps {
  scrollAmount: SharedValue<number>;
  offset?: number;
  text?: string;
}

const ListItemScrolling = ({ scrollAmount, offset = 0, text = "i returned my library pen" }: ListItemScrollingProps) => {

  const dynamicStyle = useAnimatedStyle(() => {
    const currentScrollAmount = scrollAmount.value + offset;
    const distance = Math.abs(currentScrollAmount - 1);
    
    const scale = Math.max(0.2, 1 - distance * 0.2);
    const opacity = Math.max(0.05, 0.6 - distance * 0.25);
    const margin = Math.max(0, 16 - distance * 8);
    const translateY = (currentScrollAmount - 1) * 40;

    return {
      margin: margin,
      opacity: opacity,
      transformOrigin: ['0%', '50%', 0],
      transform: [
        { translateY: translateY },
        { scale: scale }
      ],
    };
  });

  return (
    <View className='absolute'>
      
      <View className='w-[70vw] h-12 px-4 justify-center overflow-visible'>
        <Animated.View className='absolute justify-center' style={dynamicStyle}>
          <PoppinsText 
            // 'w-[200vw] tricks the renderer into drawing the full text regardless of parent size.
            className="text-xl text-[#fff] flex-none w-[200vw]" 
            weight="bold" 
            
          >
            {text}
          </PoppinsText>
        </Animated.View>
      </View>
    </View>
  );
};

export default ListItemScrolling;