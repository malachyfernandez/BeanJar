import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
    useSharedValue,
    withTiming,
    withDelay,
    withSequence,
    withSpring,
    cancelAnimation
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import ListItemScrolling from './ListItemScrolling';

const TaskList = ({ isAnimationEnabled }: { isAnimationEnabled: boolean }) => {
    const scrollAmount = useSharedValue(0);

    const listItems = [

        "i drank a glass of water!",

        "i got out of bed!",

        "i made the bed!",

        "i went outside for fresh air!",

        "i brushed my teeth!",

        "i ate a vegetable!",

        "i put on real clothes!",

        "i took the stairs!",

        "i texted a friend back!",

        "i washed my face!",

        "i stretched for two minutes!",

        "i watered the plants!",

        "i saved my work!",

        "i wrote a to-do list!",

        "i showed up to class!",

        "i showed up to work!",

        "i cooked a meal at home!",

        "i put the phone down!",

        "i read a book!",

        "i took my vitamins!",

        "i put the laundry away!",

        "i emptied the dishwasher!",

        "i took the trash out!",

        "i replied to that email!",

        "i asked for help!",

        "i said no when i needed to!",

        "i stopped eating when i was full!",

        "i washed my hair!",

        "i cleaned off my desk!",

        "i turned my camera on for the meeting!",

        "i paid a bill on time!",

        "i matched all my socks!",

        "i pumped gas before the light came on!",

        "i returned my library book!",

        "i cancelled that subscription!",

        "i didn't buy the thing i didn't need!",

        "i checked my bank account balance!",

        "i apologized!",

        "i forgave myself!",

        "i unfollowed an account that made me feel bad!",

        "i cleaned the hair out of the drain!",

        "i updated my passwords!",

    ];


    const [loopedListItems, setLoopedListItems] = useState(
        listItems.slice(0, 5)
    );

    const [MainItemIndex, setMainItemIndex] = useState(1);

    useEffect(() => {
        if (!isAnimationEnabled) {
            return;
        }

        const intervalId = setInterval(() => {
            setLoopedListItems((prev) => [...prev, listItems[prev.length % listItems.length]]);
            scrollAmount.value = withSpring((-1 * MainItemIndex), { damping: 80 });
            setMainItemIndex((prev) => prev + 1);
        }, 2000);


        return () => clearInterval(intervalId);
    }, [isAnimationEnabled, MainItemIndex]);

    const isTextInInput = !isAnimationEnabled;

    const itemOpacity = useSharedValue(1);

    useEffect(() => {
        itemOpacity.value = withSpring(isTextInInput ? 0 : 1, {
            damping: 2000,
            mass: 100,
        });
    }, [isTextInInput]);

    return (
        <View className='absolute'>
            <View className='w-[70vw] h-12 px-4 justify-center'>
                {loopedListItems.map((item, index) => {
                    const isMainItem = MainItemIndex === index;
                    return (
                        <ListItemScrolling
                            key={index}
                            scrollAmount={scrollAmount}
                            offset={index}
                            text={(isMainItem && isTextInInput) ?
                                "" :
                                item}
                            opacity={itemOpacity}
                        />
                    );
                })}
            </View>
        </View>
    );
};

export default TaskList;