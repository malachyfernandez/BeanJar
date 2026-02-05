import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
    useSharedValue,
    withTiming,
    withDelay,
    withSequence,
    withSpring
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import ListItemScrolling from './ListItemScrolling';

const TaskList = () => {
    const scrollAmount = useSharedValue(0);

    const startAnimationLoop = () => {
        // 1. Calculate the NEW target (current position - 1)
        const nextTarget = Math.floor(scrollAmount.value) - 1;

        scrollAmount.value = withSequence(

            withSpring(nextTarget, { damping: 80 }),

            // 3. Wait 1 second, then trigger the loop again
            withDelay(1000, withTiming(nextTarget, { duration: 0 }, (finished) => {
                if (finished) {
                    runOnJS(startAnimationLoop)();
                }
            }))
        );
    };


    useEffect(() => {
        startAnimationLoop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    useEffect(() => {
        
        const intervalId = setInterval(() => {
            setLoopedListItems((prev) => [...prev,listItems[prev.length % listItems.length]] ); 
        }, 1000);


        return () => clearInterval(intervalId);
    }, []); 

    return (
        <View className='absolute'>
            <View className='w-[70vw] h-12 px-4 justify-center'>
                {loopedListItems.map((item, index) => (
                    <ListItemScrolling
                        key={index}
                        scrollAmount={scrollAmount}
                        offset={index}
                        text={item}
                    />
                ))}
            </View>
        </View>
    );
};

export default TaskList;