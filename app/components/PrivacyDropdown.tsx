import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import CloseIconSVG from './CloseIconSVG';
import AppButton from './AppButton';
import PoppinsText from './PoppinsText';
import ContainerCol from './ContainerCol';
import ContainerRow from './ContainerRow';
import RowSpacer from './RowSpacer';
import Divider from './Divider';

type BeanPrivacy = "public" | "private";

interface PrivacyDropdownProps {
    setIsDropdownOpen: (open: boolean) => void;
    setBeanPrivacy: (privacy: BeanPrivacy) => void;
}

const PrivacyDropdown = ({ setIsDropdownOpen, setBeanPrivacy }: PrivacyDropdownProps) => {
    const TextStyle = {
        primary: "text-xl",
        secondary: "text-md opacity-50"
    } as const;

    return (
        <Animated.View
            key="dropdown"
            entering={FadeInUp.duration(100)}
            exiting={FadeOut.duration(100)}
            className='absolute flex-col gap-4 w-[100vw] h-[100vh] bg-black/50 z-10 justify-center items-center p-5'
        >
            <Pressable
                onPress={() => setIsDropdownOpen(false)}
                className='absolute w-full h-full'
            />

            <ContainerCol gap={4}>
                <ContainerRow gap={1}>
                    <RowSpacer />
                    <AppButton
                        variant="grey"
                        className="w-16"
                        onPress={() => setIsDropdownOpen(false)}
                    >
                        <CloseIconSVG size={24} />
                    </AppButton>
                </ContainerRow>

                <ContainerCol
                    gap={0}
                    className='bg-slate-700 rounded-2xl'
                >
                    <AppButton
                        variant="grey"
                        className="w-full h-20 p-4"
                        onPress={() => {
                            setBeanPrivacy("public");
                            setIsDropdownOpen(false);
                        }}
                        dropShadow={false}
                    >
                        <ContainerCol gap={1}>
                            <PoppinsText weight="regular" className={TextStyle.primary}>It's a Friendly Bean</PoppinsText>
                            <PoppinsText weight="regular" className={TextStyle.secondary}>Share it with your friends</PoppinsText>
                        </ContainerCol>
                        <RowSpacer />
                    </AppButton>

                    <Divider percentFromEdge={4} />

                    <AppButton
                        variant="grey"
                        className="w-full h-20 p-4"
                        onPress={() => {
                            setBeanPrivacy("private");
                            setIsDropdownOpen(false);
                        }}
                        dropShadow={false}
                    >
                        <ContainerCol gap={1}>
                            <PoppinsText weight="regular" className={TextStyle.primary}>This bean's a Secret 🤫</PoppinsText>
                            <PoppinsText weight="regular" className={TextStyle.secondary}>Friends still see the bean in your jar</PoppinsText>
                        </ContainerCol>
                        <RowSpacer />
                    </AppButton>
                </ContainerCol>
            </ContainerCol>
        </Animated.View>

    );
};

export default PrivacyDropdown;
