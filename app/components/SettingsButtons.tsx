import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInRight, FadeOutRight } from 'react-native-reanimated';
import BackArrowSVG from './BackArrowSVG';
import CameraSVG from './CameraSVG';
import DoubleBeanItArrowSVG from './DoubleBeanItArrowSVG';
import DropDownArrowSVG from './DropDownArrowSVG';
import AppButton from './AppButton';
import PoppinsText from './PoppinsText';
import ContainerCol from './ContainerCol';
import RowSpacer from './RowSpacer';

type ScreenState = "typing" | "settings" | "falling";
type BeanPrivacy = "public" | "private";

interface SettingsButtonsProps {
    beanPrivacy: BeanPrivacy;
    setScreenState: (state: ScreenState) => void;
    setIsDropdownOpen: (open: boolean) => void;
}

const SettingsButtons = ({
    beanPrivacy,
    setScreenState,
    setIsDropdownOpen
}: SettingsButtonsProps) => {
    const TextStyle = {
        primary: "text-xl",
        secondary: "text-md opacity-50"
    } as const;

    return (

            <ContainerCol gap={10}>
                <View className='flex-row items-center justify-center w-[85vw] gap-4'>
                    <AppButton
                        variant="grey"
                        className="w-16"
                        onPress={() => setScreenState("typing")}
                    >
                        <BackArrowSVG size={24} />
                    </AppButton>

                    <RowSpacer />

                    <AppButton
                        variant="grey"
                        className="w-16"
                        onPress={() => setScreenState("typing")}
                    >
                        <CameraSVG size={24} />
                    </AppButton>
                </View>

                <View className='flex-col items-center justify-center w-[85vw] gap-4'>
                    <AppButton
                        variant="outline"
                        className="w-full h-20 p-4"
                        onPress={() => setIsDropdownOpen(true)}
                    >
                        {beanPrivacy === "public" ? (
                            <ContainerCol gap={1}>
                                <PoppinsText weight="regular" className={TextStyle.primary}>It's a Friendly Bean</PoppinsText>
                                <PoppinsText weight="regular" className={TextStyle.secondary}>Share it with your friends</PoppinsText>
                            </ContainerCol>
                        ) : (
                            <ContainerCol gap={1}>
                                <PoppinsText weight="regular" className={TextStyle.primary}>This bean's a Secret 🤫</PoppinsText>
                                <PoppinsText weight="regular" className={TextStyle.secondary}>Friends still see the bean in your jar</PoppinsText>
                            </ContainerCol>
                        )}

                        <RowSpacer />
                        <DropDownArrowSVG size={24} />
                    </AppButton>

                    <AppButton
                        variant="blue"
                        className="w-44"
                        onPress={() => setScreenState("falling")}
                    >
                        <PoppinsText weight="medium" className='text-2xl'>BEAN IT</PoppinsText>
                        <DoubleBeanItArrowSVG size={32} />
                    </AppButton>
                </View>
            </ContainerCol>
        
    );
};

export default SettingsButtons;
