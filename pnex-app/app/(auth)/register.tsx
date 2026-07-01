import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated"
import { Colors, Fonts, Spacing } from "@/constants/theme"
import { GoldButton } from "@/components/GoldButton"
import { useAuth } from "@/contexts/AuthContext"

export default function Register() {
  const router = useRouter()
  const { code } = useLocalSearchParams<{ code: string }>()
  const insets = useSafeAreaInsets()
  const { registerWithInvite } = useAuth()
  const [companyName, setCompanyName] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)

  const isValid = companyName.trim().length >= 2

  const handleSubmit = async () => {
    if (!isValid || loading) return
    setLoading(true)
    try {
      await registerWithInvite(code, companyName.trim(), username.trim() || undefined)
      router.replace("/(tabs)/wall")
    } catch (err: any) {
      Alert.alert("Kayıt Hatası", err.message || "Bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + Spacing.lg }]}>
        {/* Geri */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={[styles.backWrap, { top: insets.top + Spacing.sm }]}
        >
          <Pressable hitSlop={8} onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </Animated.View>

        {/* Başlık */}
        <Animated.View entering={FadeInDown.delay(200).duration(650)} style={styles.header}>
          <Text style={styles.badge}>DAVETİYE KODU ONAYLANDI</Text>
          <Text style={styles.title}>Profilini Oluştur</Text>
          <Text style={styles.subtitle}>
            Kapalıçarşı'ya adım at. Firma bilgilerinle kaydını tamamla.
          </Text>
        </Animated.View>

        {/* Firma Adı */}
        <Animated.View entering={FadeInDown.delay(350).duration(650)} style={styles.inputGroup}>
          <Text style={styles.label}>Firma Adı</Text>
          <View style={styles.inputOuter}>
            <TextInput
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Örn: Kapalıçarşı Kuyumculuk"
              placeholderTextColor="rgba(255,255,255,0.15)"
              style={styles.input}
              selectionColor={Colors.gold}
              autoFocus
              returnKeyType="next"
            />
            <Animated.View style={[styles.bottomLine, { width: companyName.length > 0 ? "100%" : "0%" }]} />
          </View>
        </Animated.View>

        {/* Kullanıcı Adı (opsiyonel) */}
        <Animated.View entering={FadeInDown.delay(450).duration(650)} style={styles.inputGroup}>
          <Text style={styles.label}>Kullanıcı Adı (opsiyonel)</Text>
          <View style={styles.inputOuter}>
            <Text style={styles.prefix}>@</Text>
            <TextInput
              value={username}
              onChangeText={(t) => setUsername(t.replace(/[^a-zA-Z0-9_]/g, ""))}
              placeholder="kullaniciadi"
              placeholderTextColor="rgba(255,255,255,0.15)"
              style={[styles.input, { paddingLeft: 28 }]}
              selectionColor={Colors.gold}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(550).duration(600)} style={styles.ctaWrap}>
          <GoldButton
            label="Kaydı Tamamla"
            onPress={handleSubmit}
            loading={loading}
            disabled={!isValid}
          />
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
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
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  badge: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 9,
    letterSpacing: 3,
    color: Colors.gold,
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 24,
    color: "rgba(255,255,255,0.92)",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  inputOuter: {
    position: "relative",
    height: 52,
    backgroundColor: "rgba(255,255,255,0.03)",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontFamily: Fonts.sans,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  prefix: {
    position: "absolute",
    left: 14,
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: "rgba(255,255,255,0.3)",
    zIndex: 1,
  },
  bottomLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 1,
    backgroundColor: Colors.gold,
  },
  ctaWrap: {
    marginTop: 20,
  },
})
