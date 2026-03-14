import React from 'react';

import AppButton from './AppButton';
import PoppinsText from './PoppinsText';

interface NavButtonProps {
    buttonID: string;
    pageState: string;
    setPageState: (value: string) => void;
}

const NavButton = ({ buttonID, pageState, setPageState }: NavButtonProps) => (
    <AppButton variant="grey" className="w-20%" onPress={() => setPageState(buttonID)}>
        <PoppinsText weight={pageState === buttonID ? 'bold' : 'regular'}>
            {buttonID}
        </PoppinsText>
    </AppButton>
);

export default NavButton;
