import { useRef, useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  Alert,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import Animated, {
  FadeInDown,
  FadeIn,
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withSpring,
} from "react-native-reanimated"
import { Colors, Fonts, Spacing } from "@/constants/theme"
import { GoldButton } from "@/components/GoldButton"
import { apiService } from "@/services/api"

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window")
const CODE_LENGTH = 6
const CELL = (SCREEN_W - 28 * 2 - 8 * 5) / 6
const IMAGE_ASPECT = 704 / 1525
const IMAGE_DISP_H = SCREEN_W / IMAGE_ASPECT
const HERO_H = SCREEN_H * 0.44
const HERO_IMAGE_TOP = HERO_H * 0.5 - IMAGE_DISP_H * 0.38

function BlinkingCaret() {
  const opacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 550 }),
        withTiming(1, { duration: 550 }),
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

function SpringChar({ char }: { char: string }) {
  const scale = useSharedValue(0.4)
  const opacity = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 200 })
    opacity.value = withTiming(1, { duration: 100 })
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <Animated.Text style={[styles.cellChar, style]}>
      {char.toUpperCase()}
    </Animated.Text>
  )
}

export default function Gate() {
  const router = useRouter()
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const insets = useSafeAreaInsets()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const keyboardTranslateY = useSharedValue(0)

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

  const handleSubmit = async () => {
    if (code.length < CODE_LENGTH) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setLoading(true)
    try {
      await apiService.invites.verify(code)
      router.replace({ pathname: "/(auth)/register", params: { code, phone } })
    } catch (err: any) {
      Alert.alert('Geçersiz Kod', err.message || 'Davetiye kodu geçerli değil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, contentStyle]}>
        {/* Logo hero container — figma object-position: center 38% */}
        <Animated.View
          entering={FadeIn.duration(1100)}
          style={styles.heroContainer}
        >
          <Image
            source={require("@/assets/images/pnex-logo.png")}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.55)", Colors.black]}
            locations={[0, 0.4, 1]}
            style={styles.heroFade}
            pointerEvents="none"
          />
        </Animated.View>

        {/* Geri butonu */}
        <Animated.View
          entering={FadeIn.delay(400).duration(500)}
          style={[styles.backWrap, { top: insets.top + Spacing.sm }]}
        >
          <Pressable
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={16} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </Animated.View>

        {/* Alt içerik */}
        <View style={[styles.bottomContent, { paddingBottom: Math.max(insets.bottom, 16) + Spacing.lg }]}>
          {/* Rozet */}
          <Animated.View
            entering={FadeInDown.delay(350).duration(650)}
            style={styles.badge}
          >
            <Ionicons name="shield-checkmark-outline" size={10} color={Colors.gold} />
            <Text style={styles.badgeText}>Sadece Üyeler · Davetiye İle</Text>
          </Animated.View>

          {/* Başlık */}
          <Animated.View
            entering={FadeInDown.delay(450).duration(650)}
            style={styles.heading}
          >
            <Text style={styles.title}>Davetiye Kodunuz</Text>
            <Text style={styles.subtitle}>
              Size özel 6 haneli davetiye kodunu girin.
            </Text>
          </Animated.View>

          {/* Altın separator */}
          <Animated.View
            entering={FadeIn.delay(550).duration(700)}
            style={styles.goldDivider}
          >
            <View style={styles.goldLine} />
            <View style={styles.goldDot} />
            <View style={[styles.goldLine, styles.goldLineRight]} />
          </Animated.View>

          {/* Kod giriş hücreleri */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(650)}
            style={styles.cellsWrap}
          >
            <Pressable style={styles.cellsRow} onPress={() => inputRef.current?.focus()}>
              {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                const filled = i < code.length
                const active = i === code.length
                return (
                  <View
                    key={i}
                    style={[
                      styles.cell,
                      filled && styles.cellFilled,
                      active && styles.cellActive,
                    ]}
                  >
                    {/* Top accent line */}
                    {(active || filled) && (
                      <LinearGradient
                        colors={["transparent", filled ? "rgba(212,175,55,0.55)" : Colors.gold, "transparent"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cellAccent}
                      />
                    )}
                    {filled ? (
                      <SpringChar char={code[i]} />
                    ) : active ? (
                      <BlinkingCaret />
                    ) : (
                      <View style={styles.cellEmpty} />
                    )}
                  </View>
                )
              })}
            </Pressable>

            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(t) => setCode(t.replace(/[^a-zA-Z0-9]/g, "").slice(0, CODE_LENGTH).toUpperCase())}
              autoFocus
              autoCapitalize="characters"
              maxLength={CODE_LENGTH}
              style={styles.hiddenInput}
              caretHidden
              keyboardType="default"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </Animated.View>

          {/* CTA */}
          <Animated.View
            entering={FadeInDown.delay(700).duration(600)}
            style={styles.ctaWrap}
          >
            <GoldButton
              label="Erişim Talebi"
              onPress={handleSubmit}
              loading={loading}
              disabled={code.length < CODE_LENGTH}
            />
          </Animated.View>

          {/* Alt link */}
          <Animated.View
            entering={FadeIn.delay(850).duration(700)}
            style={styles.footerLink}
          >
            <Text style={styles.footerMuted}>Davetiyeniz yok mu?</Text>
            <Pressable onPress={async () => {
              try {
                setLoading(true)
                await apiService.invites.joinWaitlist(`+90${phone}`)
                Alert.alert('Başvuru Alındı', 'Bekleme listesine eklendiniz. Onaylandığınızda bilgilendirileceksiniz.')
                router.replace('/(auth)/login')
              } catch (err: any) {
                Alert.alert('Hata', err.message)
              } finally {
                setLoading(false)
              }
            }}>
              <Text style={styles.footerAction}>  Bekleme listesine katıl →</Text>
            </Pressable>
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
  heroContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "44%",
    overflow: "hidden",
  },
  heroImage: {
    position: "absolute",
    top: HERO_IMAGE_TOP,
    left: 0,
    width: SCREEN_W,
    height: IMAGE_DISP_H,
  },
  heroFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  backWrap: {
    position: "absolute",
    left: 24,
    zIndex: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.28)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "rgba(212,175,55,0.07)",
    marginBottom: 18,
  },
  badgeText: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "700",
    fontSize: 9,
    letterSpacing: 2.5,
    color: Colors.gold,
    textTransform: "uppercase",
  },
  heading: {
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 22,
    color: "rgba(255,255,255,0.92)",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: "rgba(255,255,255,0.30)",
    marginTop: 6,
    lineHeight: 20,
    textAlign: "center",
  },
  goldDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    marginBottom: 24,
  },
  goldLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(212,175,55,0.15)",
  },
  goldLineRight: {
    backgroundColor: "rgba(212,175,55,0.15)",
  },
  goldDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(212,175,55,0.38)",
  },
  cellsWrap: {
    position: "relative",
    width: "100%",
    marginBottom: 24,
  },
  cellsRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  cell: {
    width: CELL,
    height: CELL * 1.3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.025)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  cellActive: {
    borderColor: "rgba(212,175,55,0.45)",
    backgroundColor: "rgba(212,175,55,0.04)",
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  cellFilled: {
    borderColor: "rgba(212,175,55,0.55)",
    backgroundColor: "rgba(212,175,55,0.08)",
  },
  cellAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  cellChar: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "700",
    fontSize: 20,
    color: Colors.goldBright,
  },
  caret: {
    width: 1.5,
    height: 20,
    backgroundColor: Colors.gold,
    borderRadius: 1,
  },
  cellEmpty: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  ctaWrap: {
    width: "100%",
    marginBottom: 20,
  },
  footerLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerMuted: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: "rgba(255,255,255,0.18)",
  },
  footerAction: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: "rgba(212,175,55,0.55)",
  },
})
