import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

type fetchableNumber = number | null | undefined;

interface Props {
    count: fetchableNumber;
    setCount: (value: number) => void;
    amount: number;
    label: string;
}

const ChangeCountButton = ({ count, setCount, amount, label }: Props) => {
    return (
        <TouchableOpacity
            onPress={() => {
                if (count !== undefined && count !== null) {
                    setCount(count + amount);
                }
            }}
            className="bg-blue-600 px-8 py-4 rounded-full active:opacity-80 mb-4 min-w-32 items-center"
        >
            <Text className="text-white text-xl font-bold">{label}</Text>
        </TouchableOpacity>
    );
};

export default ChangeCountButton;