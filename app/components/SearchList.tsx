import React, { useEffect, useState, useRef } from "react";
import { FlatList, Text } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import SearchItemCard from "./SearchItemCard";
import ListSeparator from "./ListSeparator";

interface UserData {
    email?: string;
    name?: string;
    userId?: string
};

interface SearchListProps {
    data: UserData[] | undefined;
}

const SearchList = ({ data }: SearchListProps) => {
    const [loadingTime, setLoadingTime] = useState(0);
    const [cachedData, setCachedData] = useState<UserData[]>([]);
    const [showLoading, setShowLoading] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Determine loading state: true when data is undefined, false for anything else (including null)
    const loading = data === undefined;


    //     Whenever isLoading true {
    // 	Loading Time ++ every 1 second
    // Whenever isLoading false {
    // 	Cancel loading time ++ every 1 second
    // 	Set loading time to 0

    // Whenever Data is not null or undefined { 
    // 	Set Cached Data = data

    // Whenever loadingTime > 4 {
    // 	Set ShowLoading true

    // Whenever loadingTime <= 4 {
    // 	Set ShowLoading false

    
    useEffect(() => {
        if (loading) {
            intervalRef.current = setInterval(() => {
                setLoadingTime(prev => prev + 1);
            }, 1000);
        } else {
            
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setLoadingTime(0);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [loading]);

    
    useEffect(() => {
        if (data !== null && data !== undefined) {
            setCachedData(data);
        }
    }, [data]);

    // Show loading after 4 seconds
    useEffect(() => {
        setShowLoading(loadingTime > 4);
    }, [loadingTime]);

    if (showLoading) {
        return <Text className="text-white text-xl p-4">Loading...</Text>;
    }

    if (cachedData.length === 0) return null;

    return (
        <Animated.View
            className="w-[90vw] items-center rounded-lg bg-slate-900"
            entering={FadeInDown.duration(100)}
            exiting={FadeOutDown.duration(100)}
        >
            <FlatList
                data={cachedData}
                keyExtractor={(item, index) => item.userId ?? index.toString()}
                ItemSeparatorComponent={() => <ListSeparator />}
                renderItem={({ item }) => <SearchItemCard userId={item.userId} />}
            />
        </Animated.View>
    );
};

export default SearchList;