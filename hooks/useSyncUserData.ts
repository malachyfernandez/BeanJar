import { useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";

export const useSyncUserData = (userData: any, setUserData: any) => {
    const { user } = useUser();

    useEffect(() => {
        const isLoggedIn = !!user;
        const isLoaded = userData !== undefined;

        if (isLoggedIn && isLoaded) {
            const clerkEmail = user.primaryEmailAddress?.emailAddress;
            const clerkName = user.fullName;

            // Check if data actually needs updating to avoid infinite loops
            const needsUpdate =
                !userData.email ||
                userData.email !== clerkEmail ||
                userData.name !== clerkName;

            if (needsUpdate) {
                setUserData({
                    ...userData,
                    name: clerkName,
                    email: clerkEmail,
                    userId: user.id,
                });
                console.log("✅ Synced UserData with Clerk:");
            }
        }
    }, [user, userData]);
};