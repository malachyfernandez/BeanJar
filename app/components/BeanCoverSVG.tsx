import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { useWindowDimensions } from 'react-native';

interface BeanCoverSVGProps {
    color?: string;
    size?: number;
    sizeVW?: number;
    className?: string;
}

const BeanCoverSVG = ({ color = '#0F172A', size, sizeVW, className }: BeanCoverSVGProps) => {
    const { width: screenWidth } = useWindowDimensions();
    const finalSize = sizeVW ? (sizeVW / 100) * screenWidth : (size || 400);
    
    const scale = finalSize / 400; 
    return (
        <Svg 
            width={finalSize} 
            height={finalSize * (311 / 400)} 
            viewBox="0 0 400 311" 
            fill="none" 
            className={className}
        >
            <Path 
                fillRule="evenodd"
                d="M399.5 3.99998L3.73004e-05 -2.15321e-06L3.11754e-05 311L399.5 311L399.5 3.99998ZM209.393 66.9619C196.583 80.0433 184.815 92.0602 170.673 92.0602C164.596 92.0602 157.454 91.5055 149.648 90.8991C119.583 88.5638 79.6616 85.4629 52.7462 110.339C18.8422 141.673 14.4199 218.704 60.1167 248.733C98.4428 273.918 207.649 295.226 275.333 255.261C337.245 218.704 371.472 187.327 374.097 123.395C377.045 51.5867 309.237 28.0376 259.118 34.6138C238.41 37.3309 223.288 52.7726 209.393 66.9619Z" 
                fill={color}
            />
        </Svg>

        
    );
};

export default BeanCoverSVG;

