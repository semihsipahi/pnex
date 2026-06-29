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
  Platform,
  Dimensions,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { triggerImpact } from "@/utils/haptics"
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  Easing,
} from "react-native-reanimated"
import { Colors, Fonts, Spacing } from "@/constants/theme"

const { width } = Dimensions.get("window")

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

  const keyboardTranslateY = useSharedValue(0)

  useEffect(() => {
    lineWidth.value = withTiming(focused ? 1 : 0, { duration: 400 })
  }, [focused])

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        keyboardTranslateY.value = withTiming(-e.endCoordinates.height * 0.75, {
          duration: 320,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })
      },
    )
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        keyboardTranslateY.value = withTiming(0, {
          duration: 320,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })
      },
    )
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: keyboardTranslateY.value }],
  }))

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
        console.log("[LOGIN] dev shortcut → wall, firing haptic...")
        triggerImpact()
        router.replace("/(tabs)/wall")
      } else {
        router.push({ pathname: "/(auth)/gate", params: { phone: raw } })
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
      <Animated.View style={[styles.wrapper, contentStyle]}>
        {/* Full screen background */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Image
            source={require("@/assets/images/pnex-logo.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>

        {/* Bottom gradient overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.92)", "#000000"]}
          locations={[0, 0.4, 0.7]}
          style={styles.gradientOverlay}
          pointerEvents="none"
        />

        {/* Form content at bottom */}
        <View style={[styles.formWrap, { paddingBottom: Math.max(insets.bottom, 16) + Spacing.lg }]}>
          <Animated.View
            entering={FadeIn.duration(1000).delay(400)}
            style={styles.formInner}
          >
            <Text style={styles.label}>Telefon Numarası</Text>

            <View style={styles.inputOuter}>
              <View style={styles.inputRow}>
                <Text style={styles.prefix}>+90</Text>
                <View style={styles.separator} />
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
            </View>

            <Animated.View style={buttonAnimatedStyle}>
              <Pressable
                style={[styles.button, !isValid && styles.buttonDisabled]}
                onPress={handleSubmit}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={!isValid || loading}
              >
                <LinearGradient
                  colors={
                    isValid
                      ? [Colors.goldDeep, Colors.gold, Colors.goldBright]
                      : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.04)"]
                  }
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
              <Ionicons name="lock-closed" size={12} color="rgba(255,255,255,0.3)" />
              <Text style={styles.assuranceText}>
                UÇTAN UCA ŞİFRELİ · DAVETİYE İLE
              </Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  wrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  formWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
  },
  formInner: {
    gap: 0,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontWeight: "600",
    fontSize: 10,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  inputOuter: {
    position: "relative",
    height: 60,
    backgroundColor: "rgba(255,255,255,0.03)",
    marginBottom: 28,
    justifyContent: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  prefix: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: "400",
    letterSpacing: 2,
    color: Colors.gold,
    paddingHorizontal: 8,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: "300",
    letterSpacing: 3,
    height: 40,
    paddingHorizontal: 8,
  },
  bottomLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 1,
    backgroundColor: Colors.gold,
  },
  btnShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "50%",
    height: "100%",
    opacity: 0.9,
  },
  button: {
    height: 56,
    borderRadius: 999,
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
    fontSize: 13,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: Colors.obsidian,
  },
  buttonTextDisabled: {
    color: "rgba(255,255,255,0.18)",
  },
  assurance: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },
  assuranceText: {
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: 9,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.3)",
  },
})
