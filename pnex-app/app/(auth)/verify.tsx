import { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, Pressable, Dimensions, TextInput } from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, { FadeInDown } from "react-native-reanimated"
import { Colors, Fonts, Spacing } from "@/constants/theme"
import { GoldButton } from "@/components/GoldButton"

const { width } = Dimensions.get("window")
const LEN = 4

export default function Verify() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [otp, setOtp] = useState<string[]>(Array(LEN).fill(""))
  const [seconds, setSeconds] = useState(42)
  const [loading, setLoading] = useState(false)
  const refs = useRef<Array<TextInput | null>>([])

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
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.replace("/(tabs)/wall")
    }, 1200)
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["rgba(201,162,75,0.16)", "transparent"]} style={styles.topGlow} pointerEvents="none" />
      <View style={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={Colors.gold} />
        </Pressable>

        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <View style={styles.iconRing}>
            <Ionicons name="keypad-outline" size={28} color={Colors.goldBright} />
          </View>
          <Text style={styles.title}>Kimliğini Doğrula</Text>
          <Text style={styles.sub}>
            Kayıtlı cihazınıza 4 haneli bir güvenlik kodu gönderildi. Ağı açmak için kodu girin.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(600)} style={styles.otpRow}>
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
                  if (nativeEvent.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus()
                }}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.otpInput}
                caretHidden
                selectionColor={Colors.gold}
              />
            </Pressable>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.resendRow}>
          {seconds > 0 ? (
            <Text style={styles.resendMuted}>
              Kodu yeniden gönder <Text style={styles.resendGold}>0:{seconds.toString().padStart(2, "0")}</Text>
            </Text>
          ) : (
            <Pressable onPress={() => setSeconds(42)}>
              <Text style={styles.resendActive}>Kodu yeniden gönder</Text>
            </Pressable>
          )}
        </Animated.View>

        <View style={styles.flex} />

        <GoldButton label="Onayla ve Gir" onPress={handleVerify} loading={loading} disabled={!filled} />
      </View>
    </View>
  )
}

const BOX = (width - Spacing.lg * 2 - Spacing.md * 3) / 4

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.obsidian },
  flex: { flex: 1 },
  topGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 200 },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  back: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  header: { alignItems: "center", marginTop: Spacing.xl },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(201,162,75,0.4)",
    backgroundColor: "rgba(201,162,75,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: { fontFamily: Fonts.serifBold, fontSize: 30, color: Colors.goldBright },
  sub: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.inkFaint,
    textAlign: "center",
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  otpRow: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.xxl, justifyContent: "center" },
  otpBox: {
    width: BOX,
    height: BOX * 1.15,
    borderRadius: 16,
    backgroundColor: Colors.onyx,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxActive: { borderColor: Colors.gold, backgroundColor: "rgba(201,162,75,0.08)" },
  otpInput: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    color: Colors.goldBright,
    fontSize: 28,
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
  },
  resendRow: { alignItems: "center", marginTop: Spacing.xl },
  resendMuted: { color: Colors.inkFaint, fontFamily: Fonts.sans, fontSize: 13 },
  resendGold: { color: Colors.gold, fontFamily: Fonts.sansSemibold, fontWeight: "600" },
  resendActive: { color: Colors.goldBright, fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: 14, textDecorationLine: "underline" },
})
