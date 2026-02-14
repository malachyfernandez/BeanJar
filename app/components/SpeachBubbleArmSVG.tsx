import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface SpeachBubbleArmSVGProps {
    size?: number;
    color?: string;
    className?: string;
    style?: any;
}

const SpeachBubbleArmSVG = ({ size = 33, color = 'white', className, style }: SpeachBubbleArmSVGProps) => {
    return (
        <Svg 
            width={size} 
            height={size * (44 / 33)} 
            viewBox="0 0 33 44" 
            fill="none" 
            className={className}
            style={style}
        >
            <Path 
                d="M27.5 44L0 0H33L27.5 44Z" 
                fill={color}
            />
        </Svg>
    );
};

export default SpeachBubbleArmSVG;
