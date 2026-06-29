import { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, Pressable, Dimensions, TextInput } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { triggerImpact } from "@/utils/haptics"
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated"
import { Colors, Fonts, Spacing } from "@/constants/theme"
import { GoldButton } from "@/components/GoldButton"

const { width } = Dimensions.get("window")
const LEN = 4
const BOX = 64

function BlinkingCaret() {
  const opacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1,
      true,
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return <Animated.View style={[styles.caret, style]} />
}

function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, "")
  if (d.length < 10) return `+90 5** *** **${d.slice(-2)}`
  return `+90 ${d.slice(0, 3)} *** ** ${d.slice(-2)}`
}

export default function Verify() {
  const router = useRouter()
  const { phone: phoneParam } = useLocalSearchParams<{ phone: string }>()
  const insets = useSafeAreaInsets()
  const [otp, setOtp] = useState<string[]>(Array(LEN).fill(""))
  const [seconds, setSeconds] = useState(42)
  const [loading, setLoading] = useState(false)
  const refs = useRef<Array<TextInput | null>>([])

  const displayPhone = maskPhone(phoneParam || "")

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [])

  useEffect(() => {
    if (seconds <= 0) return
    const t = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [seconds])

  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/[^0-9]/g, "")
    const next = [...otp]
    next[i] = clean.slice(-1)
    setOtp(next)
    if (clean && i < LEN - 1) refs.current[i + 1]?.focus()
  }

  const filled = otp.every((d) => d !== "")

  const handleVerify = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      console.log("[VERIFY] navigating to wall, firing haptic...")
      triggerImpact()
      router.replace("/(tabs)/wall")
    }, 1200)
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(212,175,55,0.14)", "transparent"]}
        style={styles.topGlow}
        pointerEvents="none"
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.sm,
            paddingBottom: Math.max(insets.bottom, 16) + Spacing.lg,
          },
        ]}
      >
        {/* Back button */}
        <Pressable hitSlop={8} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={17} color="rgba(255,255,255,0.6)" />
        </Pressable>

        {/* Icon */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.iconRing}>
          <Ionicons name="phone-portrait-outline" size={26} color={Colors.gold} />
        </Animated.View>

        {/* Title + subtitle */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <Text style={styles.title}>Kimliğini Doğrula</Text>
          <Text style={styles.sub}>
            {displayPhone} numarasına{"\n"}4 haneli doğrulama kodu gönderildi.
          </Text>
        </Animated.View>

        {/* OTP boxes */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.otpRow}>
          {otp.map((d, i) => (
            <Pressable
              key={i}
              style={[styles.otpBox, d !== "" && styles.otpBoxActive]}
              onPress={() => refs.current[i]?.focus()}
            >
              <TextInput
                ref={(el) => {
                  refs.current[i] = el
                }}
                value={d}
                onChangeText={(v) => setDigit(i, v)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace" && !d && i > 0) {
                    refs.current[i - 1]?.focus()
                  }
                }}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.otpInput}
                caretHidden
                selectionColor={Colors.gold}
              />
              {d ? (
                <Text style={styles.otpDigit}>{d}</Text>
              ) : (
                <BlinkingCaret />
              )}
            </Pressable>
          ))}
        </Animated.View>

        {/* Timer / Resend */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.timerRow}>
          {seconds > 0 ? (
            <Text style={styles.timerText}>
              Kod geçerlilik süresi:{" "}
              <Text style={styles.timerGold}>{seconds}sn</Text>
            </Text>
          ) : (
            <Pressable onPress={() => setSeconds(42)}>
              <Text style={styles.resendActive}>Kodu yeniden gönder</Text>
            </Pressable>
          )}
        </Animated.View>

        <View style={styles.flex} />

        <GoldButton
          label="Onayla ve Gir"
          onPress={handleVerify}
          loading={loading}
          disabled={!filled}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  flex: {
    flex: 1,
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 240,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  iconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
    backgroundColor: "rgba(212,175,55,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  header: {
    alignItems: "center",
    marginTop: 28,
  },
  title: {
    fontFamily: Fonts.serifBold,
    fontSize: 32,
    color: Colors.white,
  },
  sub: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 22,
    color: "rgba(255,255,255,0.36)",
    textAlign: "center",
    marginTop: 8,
  },
  otpRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 28,
    justifyContent: "center",
  },
  otpBox: {
    width: BOX,
    height: 72,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  otpBoxActive: {
    borderColor: "rgba(212,175,55,0.33)",
    backgroundColor: "rgba(212,175,55,0.06)",
  },
  otpInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  otpDigit: {
    fontFamily: Fonts.serifBold,
    fontSize: 30,
    fontWeight: "700",
    color: Colors.goldBright,
  },
  caret: {
    width: 1.5,
    height: 28,
    backgroundColor: "rgba(212,175,55,0.33)",
    borderRadius: 1,
  },
  timerRow: {
    alignItems: "center",
    marginTop: 28,
  },
  timerText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
  },
  timerGold: {
    color: Colors.gold,
    fontWeight: "700",
  },
  resendActive: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 14,
    color: Colors.goldBright,
    textDecorationLine: "underline",
  },
})
