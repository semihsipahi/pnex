import { useRef, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated"
import { Colors, Fonts, Spacing } from "@/constants/theme"
import { GoldButton } from "@/components/GoldButton"
import { Divider } from "@/components/Divider"

const { width } = Dimensions.get("window")
const CODE_LENGTH = 6

export default function Gate() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const handleSubmit = () => {
    if (code.length < CODE_LENGTH) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.replace("/(auth)/verify")
    }, 1100)
  }

  const cells = Array.from({ length: CODE_LENGTH })

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(201,162,75,0.16)", "transparent"]}
        style={styles.topGlow}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={[styles.content, { paddingTop: insets.top + Spacing.xxl }]}>
          <Animated.View entering={FadeIn.duration(800)} style={styles.logoWrap}>
            <Text style={styles.logoText}>PNEX</Text>
          </Animated.View>
          <Animated.View entering={FadeIn.duration(1000)} style={styles.dividerLine} />

          <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.headingBlock}>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark-outline" size={13} color={Colors.gold} />
              <Text style={styles.badgeText}>SADECE ÜYELER</Text>
            </View>
            <Text style={styles.title}>Davetiye ile</Text>
            <Text style={styles.subtitle}>
              NEXA kapalı bir ağdır. Devam etmek için davetiyenizdeki erişim şifresini girin.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(700)} style={styles.codeBlock}>
            <Pressable style={styles.cells} onPress={() => inputRef.current?.focus()}>
              {cells.map((_, i) => {
                const char = code[i]
                const active = i === code.length
                return (
                  <View key={i} style={[styles.cell, (char || active) && styles.cellActive]}>
                    <Text style={styles.cellText}>{char ? char.toUpperCase() : ""}</Text>
                    {active && <View style={styles.caret} />}
                  </View>
                )
              })}
            </Pressable>

            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(t) => setCode(t.replace(/[^a-zA-Z0-9]/g, "").slice(0, CODE_LENGTH))}
              autoFocus
              autoCapitalize="characters"
              maxLength={CODE_LENGTH}
              style={styles.hiddenInput}
              caretHidden
              keyboardType="default"
            />
          </Animated.View>

          <View style={styles.flex} />

          <Animated.View
            entering={FadeInDown.delay(600).duration(700)}
            style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
          >
            <GoldButton
              label="Erişim Talebi"
              onPress={handleSubmit}
              loading={loading}
              disabled={code.length < CODE_LENGTH}
            />
            <View style={styles.dividerWrap}>
              <Divider label="Davetiyeniz yok mu?" dark />
            </View>
            <Pressable hitSlop={10}>
              <Text style={styles.waitlist}>Bekleme listesine katıl</Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const CELL = (width - Spacing.lg * 2 - 8 * 5) / 6

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.obsidian },
  flex: { flex: 1 },
  topGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 280 },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  logoWrap: { alignItems: "center", height: 80, justifyContent: "center" },
  logoText: { fontFamily: Fonts.serifBold, fontSize: 44, color: Colors.goldBright, letterSpacing: 12 },
  dividerLine: { width: 40, height: 1, backgroundColor: Colors.gold, marginBottom: Spacing.lg },
  headingBlock: { alignItems: "center", marginTop: Spacing.sm },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(201,162,75,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: Spacing.lg,
  },
  badgeText: { color: Colors.gold, fontFamily: Fonts.sansMedium, fontWeight: "500", fontSize: 10, letterSpacing: 2 },
  title: {
    fontFamily: Fonts.serifBold,
    fontSize: 38,
    color: Colors.goldBright,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.inkFaint,
    textAlign: "center",
    paddingHorizontal: Spacing.md,
  },
  codeBlock: { marginTop: Spacing.xxl, alignItems: "center" },
  cells: { flexDirection: "row", gap: 8 },
  cell: {
    width: CELL,
    height: CELL * 1.25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: Colors.onyx,
    alignItems: "center",
    justifyContent: "center",
  },
  cellActive: { borderColor: Colors.gold, backgroundColor: "rgba(201,162,75,0.08)" },
  cellText: { color: Colors.goldBright, fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: 22, letterSpacing: 1 },
  caret: { position: "absolute", width: 2, height: 22, backgroundColor: Colors.gold },
  hiddenInput: { position: "absolute", opacity: 0, height: 1, width: 1 },
  footer: { gap: Spacing.lg },
  dividerWrap: { marginTop: Spacing.xs },
  waitlist: {
    textAlign: "center",
    color: Colors.inkFaint,
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: 13,
    letterSpacing: 0.5,
    textDecorationLine: "underline",
  },
})
