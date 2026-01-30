import { View, Text, TouchableOpacity, ScrollView, Platform, FlatList, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { SignedIn, SignedOut, useOAuth, useClerk, useUser } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";

import { useUserVariable } from "../hooks/useUserVariable";
import { useGlobalVariable } from "../hooks/useGlobalVariable";
import { useSyncUserData } from "../hooks/useSyncUserData";
import { useSearch } from "../hooks/useSearch";

import ChangeCountButton from "./components/ChangeCountButton";
import AuthButton from "./components/AuthButton";
import DigitalScore from "./components/DigitalScore";
import ContainerCol from "./components/ContainerCol";
import ContainerRow from "./components/ContainerRow";
import ListSeparator from "./components/ListSeparator";
import SearchItemCard from "./components/SearchItemCard";
import SearchList from "./components/SearchList";

// Warm up the browser (required for Android reliability)
export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS === "web") return;
    void WebBrowser.warmUpAsync();
    return () => { void WebBrowser.coolDownAsync(); };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
  useWarmUpBrowser();
  const { signOut } = useClerk();

  // Setup OAuth Hooks for both providers
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });

  const { user } = useUser();

  interface UserData {
    email?: string;
    name?: string;
    userId?: string
  };

  const [userData, setUserData] = useUserVariable<UserData>({
    key: "userData",
    defaultValue: {},
    isPublic: true,
    searchKey: "name"
  });
  
  // updates userData
  useSyncUserData(userData, setUserData);

  const [globalScore, setGlobalScore] = useGlobalVariable<number>("globalScore", 0);
  const [userScore, setUserScore] = useUserVariable<number>({
    key: "userScore",
    defaultValue: 0,
    isPublic: true,
  });


  const [searchText, setSearchText] = useState("");
  const userSearchArray = useSearch<UserData>(searchText, "userData")

  // Keyboard listener
  useEffect(() => {
    const handleKeyPress = (event: any) => {
      const key = event.key;

      if (key == '1') {
        if (globalScore !== null && globalScore !== undefined) {
          setGlobalScore(globalScore + 1);
        }
      }

      //Shift version (1 is !)
      if (key == '!') {
        if (globalScore !== null && globalScore !== undefined) {
          setGlobalScore(globalScore - 1);
        }
      }
    };

    // Add keyboard event listener
    if (Platform.OS === 'web') {
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [globalScore, setGlobalScore]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ContainerCol className="w-full items-center absolute top-20 z-10">
        <TextInput
          className="w-[90vw] h-12 bg-gray-800 rounded-full px-4 text-white text-xl"
          placeholder="Search users..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
        <SearchList data={userSearchArray}/>
      </ContainerCol>

      <ScrollView className="pt-20 mt-2" contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>



        <SignedIn>
          <View>
            {userData?.name ?
              (<Text className="text-white text-2xl">{`Welcome ${userData?.name}!`}</Text>) :
              (<Text className="text-white text-2xl">Welcome!</Text>)
            }
          </View>
        </SignedIn>

        <DigitalScore score={globalScore} />

        <ContainerRow>
          <ChangeCountButton count={globalScore} setCount={setGlobalScore} amount={1} label="+" />
          <ChangeCountButton count={globalScore} setCount={setGlobalScore} amount={-1} label="-" />
        </ContainerRow>

        <SignedIn>

          <DigitalScore score={userScore} />

          <ContainerRow>
            <ChangeCountButton count={userScore} setCount={setUserScore} amount={1} label="+" />
            <ChangeCountButton count={userScore} setCount={setUserScore} amount={-1} label="-" />
          </ContainerRow>



          {/* <TouchableOpacity className="bg-blue-600 px-8 py-4 rounded-full active:opacity-80 mb-4 min-w-32 items-center">
            <Text className="text-white text-xl font-bold">{JSON.stringify(userSearchArray)}</Text>
          </TouchableOpacity> */}

          {/* Search input */}


          <TouchableOpacity onPress={() => signOut()} className="mt-8">
            <Text className="text-gray-500">Log Out</Text>
          </TouchableOpacity>

        </SignedIn>

        <SignedOut>
          <ContainerCol>
            <AuthButton
              authFlow={startAppleFlow}
              buttonText="Continue with Apple"
            />
            <AuthButton
              authFlow={startGoogleFlow}
              buttonText="Continue with Google"
            />
          </ContainerCol>



        </SignedOut>
      </ScrollView>
    </SafeAreaView >
  );
}