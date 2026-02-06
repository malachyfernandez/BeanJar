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

        "I drank a glass of water!",

        "I got out of bed!",

        "I made the bed!",

        "I went outside for fresh air!",

        "I brushed my teeth!",

        "I ate a vegetable!",

        "I put on real clothes!",

        "I took the stairs!",

        "I texted a friend back!",

        "I washed my face!",

        "I stretched for two minutes!",

        "I watered the plants!",

        "I saved my work!",

        "I wrote a to-do list!",

        "I showed up to class!",

        "I showed up to work!",

        "I cooked a meal at home!",

        "I put the phone down!",

        "I read a book!",

        "I took my vitamins!",

        "I put the laundry away!",

        "I emptied the dishwasher!",

        "I took the trash out!",

        "I replied to that email!",

        "I asked for help!",

        "I said no when I needed to!",

        "I stopped eating when I was full!",

        "I washed my hair!",

        "I cleaned off my desk!",

        "I turned my camera on for the meeting!",

        "I paid a bill on time!",

        "I matched all my socks!",

        "I pumped gas before the light came on!",

        "I returned my library book!",

        "I cancelled that subscription!",

        "I didn't buy the thing I didn't need!",

        "I checked my bank account balance!",

        "I apologized!",

        "I forgave myself!",

        "I unfollowed an account that made me feel bad!",

        "I cleaned the hair out of the drain!",

        "I updated my passwords!",

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