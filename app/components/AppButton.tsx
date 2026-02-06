import React, { useState } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

interface AppButtonProps {
    children: React.ReactNode;
    variant?: 'blur' | 'blue';
    className?: string;
    onPress?: () => void;
}

const AppButton = ({ 
    children, 
    variant = 'blur', 
    className = '', 
    onPress 
}: AppButtonProps) => {
    const [isPressed, setIsPressed] = useState(false);

    const getButtonStyles = (): string => {
        const baseStyles = 'h-16 flex items-center justify-center rounded-[15px] flex-row gap-2';
        
        if (variant === 'blur') {
            if (isPressed) {
                return `${baseStyles} border border-white/30 bg-[#0a0d1a]`;
            }
            return `${baseStyles} border border-white/30 bg-[#0f1627bf]`;
        } else {
            if (isPressed) {
                return `${baseStyles} bg-[#026aa0]`;
            }
            return `${baseStyles} bg-[#0284C7]`;
        }
    };

    const shadowStyle = {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,
        elevation: 24,
    };

    return (
        <TouchableOpacity
            className={`${getButtonStyles()} ${className}`}
            style={shadowStyle}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            onPress={onPress}
            activeOpacity={1}
        >
            {children}
        </TouchableOpacity>
    );
};

export default AppButton;
