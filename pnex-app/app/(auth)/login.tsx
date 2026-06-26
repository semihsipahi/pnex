import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  FadeInDown,
  FadeIn,
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated"
import { Colors, Fonts, Spacing, Radius } from "@/constants/theme"

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
  // Bottom line animation
  const lineWidth = useSharedValue(0)

  useEffect(() => {
    lineWidth.value = withTiming(focused ? 1 : 0, { duration: 350 })
  }, [focused])

  const bottomLineStyle = useAnimatedStyle(() => ({
    width: `${interpolate(lineWidth.value, [0, 1], [0, 100], Extrapolation.CLAMP)}%` as any,
  }))

  const buttonShimmer = useSharedValue(0)

  const triggerButtonShimmer = () => {
    buttonShimmer.value = 0
    buttonShimmer.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
  }

  const buttonShimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(buttonShimmer.value, [0, 1], [-200, 400], Extrapolation.CLAMP) }],
  }))

  const handleSubmit = () => {
    if (!isValid) return
    triggerButtonShimmer()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (raw === "5555555555") {
        router.replace("/(tabs)/wall")
      } else {
        router.push("/(auth)/gate")
      }
    }, 800)
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

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={[styles.content, { paddingTop: insets.top + Spacing.xxl }]}>
          <View style={styles.spacerTop} />

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).duration(700)} style={[styles.form, { marginTop: 220 }]}>
            <View style={styles.field}>
              <Pressable onPress={() => inputRef.current?.focus()} style={styles.inputOuter}>
                <View style={styles.inputRow}>
                  <Text style={styles.prefix}>+90</Text>
                  <View style={styles.prefixDot} />
                  <TextInput
                    ref={inputRef}
                    value={phone}
                    onChangeText={(t) => setPhone(formatPhone(t))}
                    placeholder="5XX XXX XX XX"
                    placeholderTextColor="rgba(255,255,255,0.15)"
                    keyboardType="phone-pad"
                    autoFocus
                    style={styles.input}
                    selectionColor={Colors.gold}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                  />
                  {raw.length === 10 && (
                    <Animated.View entering={FadeIn.duration(200)}>
                      <Ionicons name="checkmark-circle" size={20} color="#2E7D5B" />
                    </Animated.View>
                  )}
                </View>
                {/* Animated bottom line */}
                <Animated.View style={[styles.bottomLine, bottomLineStyle]} />
              </Pressable>
            </View>
          </Animated.View>

          <View style={styles.spacerBottom} />

          {/* Footer */}
          <Animated.View entering={FadeInDown.delay(400).duration(700)} style={styles.footer}>
            <Pressable
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleSubmit}
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
              {/* Press shimmer — light sweep across the button */}
              <Animated.View style={[styles.btnShimmer, buttonShimmerStyle]} pointerEvents="none">
                <LinearGradient
                  colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </Pressable>

            <View style={styles.assurance}>
              <Ionicons name="lock-closed" size={11} color="rgba(255,255,255,0.3)" />
              <Text style={styles.assuranceText}>
                Uçtan uca şifreli · Davetiye ile
              </Text>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070707",
  },
  flex: { flex: 1 },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  spacerTop: { flex: 0.9 },
  spacerBottom: { flex: 0.6 },
  form: { marginTop: Spacing.lg },
  field: { gap: 10 },
  inputOuter: {
    position: "relative",
    height: 60,
    borderRadius: Radius.sm,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
    overflow: "hidden",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  prefix: {
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: 15,
    color: Colors.gold,
  },
  prefixDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: 17,
    letterSpacing: 2,
    height: 40,
  },
  bottomLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 1.5,
    backgroundColor: Colors.gold,
    borderRadius: 1,
  },
  footer: {
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
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
  btnShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "50%",
    height: "100%",
    opacity: 0.9,
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
