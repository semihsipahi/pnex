import { useState, useRef, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Keyboard,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated"
import { Colors, Fonts, Spacing, Radius, Tracking, TypeSize } from "@/constants/theme"

function formatPhone(text: string) {
  const digits = text.replace(/[^0-9]/g, "").slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`
}



export default function Login() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const raw = phone.replace(/[^0-9]/g, "")
  const isValid = raw.length === 10
  const lineWidth = useSharedValue(0)

  useEffect(() => {
    lineWidth.value = withTiming(focused ? 1 : 0, { duration: 350 })
  }, [focused])

  const bottomLineStyle = useAnimatedStyle(() => ({
    width: `${interpolate(lineWidth.value, [0, 1], [0, 100], Extrapolation.CLAMP)}%` as any,
  }))

  const buttonScale = useSharedValue(1)
  const buttonShimmer = useSharedValue(0)

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))

  const buttonShimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(buttonShimmer.value, [0, 1], [-200, 400], Extrapolation.CLAMP) }],
  }))

  const triggerButtonShimmer = useCallback(() => {
    buttonShimmer.value = 0
    buttonShimmer.value = withTiming(1, { duration: 400 })
  }, [buttonShimmer])

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handlePressOut = () => {
    buttonScale.value = withSpring(1)
  }

  const handleSubmit = useCallback(() => {
    if (!isValid || loading) return
    triggerButtonShimmer()
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (raw === "5555555555") {
        router.replace("/(tabs)/wall")
      } else {
        router.push("/(auth)/gate")
      }
    }, 800)
  }, [isValid, loading, raw, router, triggerButtonShimmer])

  const handleDone = useCallback(() => {
    Keyboard.dismiss()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }, [])

  const handleChangeText = (t: string) => {
    setPhone(formatPhone(t))
  }

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Image
          source={require("@/assets/images/login-bg.png")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + Spacing.sm }]}>
        {/* Top section — background PNEX text shows here */}
        <View style={styles.topSection} />

        {/* Form — centered */}
        <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.form}>
          <View style={styles.field}>
            <Pressable onPress={() => inputRef.current?.focus()} style={styles.inputOuter}>
              <View style={styles.inputRow}>
                <Text style={styles.prefix}>+90</Text>
                <View style={styles.prefixDot} />
                <TextInput
                  ref={inputRef}
                  value={phone}
                  onChangeText={handleChangeText}
                  placeholder="5XX XXX XX XX"
                  placeholderTextColor="rgba(255,255,255,0.15)"
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  autoFocus
                  style={styles.input}
                  selectionColor={Colors.gold}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onSubmitEditing={handleDone}
                />
              </View>
              <Animated.View style={[styles.bottomLine, bottomLineStyle]} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Bottom section */}
        <View style={styles.bottomSection} />

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(400).duration(700)} style={styles.footer}>
          <Animated.View style={buttonAnimatedStyle}>
            <Pressable
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleSubmit}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={!isValid || loading}
            >
              <LinearGradient
                colors={isValid ? [Colors.goldDeep, Colors.gold, Colors.goldBright] : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.04)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonFill}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.obsidian} size="small" />
                ) : (
                  <Text style={[styles.buttonText, !isValid && styles.buttonTextDisabled]}>
                    İlerle
                  </Text>
                )}
              </LinearGradient>
              <Animated.View style={[styles.btnShimmer, buttonShimmerStyle]} pointerEvents="none">
                <LinearGradient
                  colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </Pressable>
          </Animated.View>

          <View style={styles.assurance}>
            <Ionicons name="lock-closed" size={11} color="rgba(255,255,255,0.3)" />
            <Text style={styles.assuranceText}>
              Uçtan uca şifreli · Davetiye ile
            </Text>
          </View>
        </Animated.View>

        {/* Bottom padding — pushes footer up */}
        <View style={styles.bottomPadding} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070707",
  },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  topSection: { flex: 1.2 },
  bottomSection: { flex: 0.5 },
  bottomPadding: { flex: 0.5 },

  form: {},
  field: { gap: Spacing.sm },
  inputOuter: {
    position: "relative",
    height: 58,
    borderRadius: Radius.sm,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
    overflow: "hidden",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  prefix: {
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: 15,
    color: Colors.gold,
    letterSpacing: Tracking.label,
  },
  prefixDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: 17,
    letterSpacing: 3,
    height: 40,
  },
  bottomLine: {
    position: "absolute",
    bottom: 0,
    left: 12,
    right: 12,
    height: 1.5,
    backgroundColor: Colors.gold,
    borderRadius: 1,
  },
  btnShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "50%",
    height: "100%",
    opacity: 0.9,
  },
  footer: {
    gap: Spacing.md,
  },
  button: {
    height: 56,
    borderRadius: Radius.pill,
    overflow: "hidden",
  },
  buttonDisabled: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  buttonFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: Colors.obsidian,
  },
  buttonTextDisabled: {
    color: "rgba(255,255,255,0.2)",
  },
  assurance: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  assuranceText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 0.5,
  },
})
