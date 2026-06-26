import { useEffect, useState } from "react"
import { Stack, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import * as ExpoSplash from "expo-splash-screen"
import { useFonts } from "expo-font"
import { Colors } from "@/constants/theme"
import { SplashScreen } from "@/components/SplashScreen"

ExpoSplash.preventAutoHideAsync().catch(() => {})

export default function RootLayout() {
  const router = useRouter()
  const [loaded] = useFonts({
    "CormorantGaramond": require("@/assets/fonts/CormorantGaramond_400Regular.ttf"),
    "CormorantGaramond-SemiBold": require("@/assets/fonts/CormorantGaramond_600SemiBold.ttf"),
    "CormorantGaramond-Bold": require("@/assets/fonts/CormorantGaramond_700Bold.ttf"),
  })
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    if (loaded) {
      requestAnimationFrame(() => {
        ExpoSplash.hideAsync().catch(() => {})
      })
    }
  }, [loaded])

  const handleSplashFinish = () => {
    router.replace("/(auth)/login")
    setShowSplash(false)
  }

  if (!loaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.obsidian }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.obsidian },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
    </GestureHandlerRootView>
  )
}
