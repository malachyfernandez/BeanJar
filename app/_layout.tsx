// import "../polyfills"; // Import polyfills before Convex
// import { ConvexProvider, ConvexReactClient } from "convex/react";
// import { Stack } from "expo-router";
// import "../global.css"; // Import your Tailwind CSS here

// // Initialize Convex
// const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

// export default function RootLayout() {
//   return (

//     <ConvexProvider client={convex}>

//       <Stack>

//         <Stack.Screen name="index" options={{ headerShown: false }} />


//       </Stack>
//     </ConvexProvider>
//   );
// }

import "../polyfills";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { Slot } from "expo-router";
import { tokenCache } from '../utils/tokenCache';
import "../global.css";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {/* Slot renders the current screen (Home or Auth) */}
          <Slot />
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
