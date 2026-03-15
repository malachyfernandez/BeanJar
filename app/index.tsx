import { Platform, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { SignedIn, SignedOut, useOAuth, useUser } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";

import AuthButton from "./components/ui/AuthButton";
import ContainerCol from "./components/layout/ContainerCol";
import MainPage from "./components/MainPage";

const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS === "web") return;
    void WebBrowser.warmUpAsync();
    return () => { void WebBrowser.coolDownAsync(); };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function HomeScreen() {
  useWarmUpBrowser();

  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });
  const { user } = useUser();
  const [searchText, setSearchText] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
      <SignedIn>
        <MainPage />
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
    </SafeAreaView>
  );
}

// ============================================================================
// DEV NUKE COMPONENT - Uncomment entire section to enable
// ============================================================================
// import { SafeAreaView } from "react-native-safe-area-context";
// import React from "react";

// import MainPage from "./components/MainPage";
// import DatabaseNukeButton from "./components/dev/DatabaseNukeButton";
// import { useNukeDatabase, useTableCounts } from "../hooks/useNukeDatabase";

// export default function DevNukeScreen() {


//   return (
//     <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
//       <DatabaseNukeButton />


//     </SafeAreaView>
//   );
// }
