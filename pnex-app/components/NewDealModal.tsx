import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutUp,
} from "react-native-reanimated"
import { Colors, Fonts, Spacing, Radius, Tracking, TypeSize } from "@/constants/theme"

type DealType = "buy" | "sell"
type MetalType = "has" | "22ayar" | "usd" | "eur"

interface Props {
  visible: boolean
  onClose: () => void
}

const METALS: { key: MetalType; label: string }[] = [
  { key: "has", label: "Has" },
  { key: "22ayar", label: "22 Ayar" },
  { key: "usd", label: "USD" },
  { key: "eur", label: "EUR" },
]

const EXPIRY_OPTIONS = [
  { label: "15dk", seconds: 900 },
  { label: "30dk", seconds: 1800 },
  { label: "1sa", seconds: 3600 },
  { label: "2sa", seconds: 7200 },
  { label: "4sa", seconds: 14400 },
]

export default function NewDealModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const [type, setType] = useState<DealType>("buy")
  const [metal, setMetal] = useState<MetalType>("has")
  const [amount, setAmount] = useState("")
  const [price, setPrice] = useState("")
  const [premiumPrice, setPremiumPrice] = useState("")
  const [maxBid, setMaxBid] = useState("")
  const [maxBidEnabled, setMaxBidEnabled] = useState(false)
  const [expiry, setExpiry] = useState(1800)

  if (!visible) return null

  const numericPrice = parseFloat(price) || 0
  const numericPremium = parseFloat(premiumPrice) || 0
  const premiumValid = numericPremium > numericPrice
  const premiumDiff = numericPrice > 0 ? ((numericPremium - numericPrice) / numericPrice) * 100 : 0

  const handleSubmit = () => {
    const newDeal = {
      id: Date.now().toString(),
      firm: "Ben",
      role: "İstanbul · Kapalıçarşı",
      tier: "FOUNDING" as const,
      type,
      metal,
      amount: metal === "usd" || metal === "eur" ? `$${amount}` : `${amount} gr`,
      price: metal === "usd" || metal === "eur" ? `${price} ₺` : `${price} ₺/gr`,
      pricePremium: premiumPrice ? (metal === "usd" || metal === "eur" ? `${premiumPrice} ₺` : `${premiumPrice} ₺/gr`) : "",
      trust: 5.0,
      limit: "-",
      mutual: 0,
      expiresIn: expiry,
      status: "active" as const,
    }
    console.log("Yeni ilan:", newDeal)
    onClose()
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[StyleSheet.absoluteFill, styles.overlay]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.duration(400).springify().damping(20)}
        exiting={SlideOutUp.duration(300)}
        style={[styles.sheet, { paddingTop: insets.top + Spacing.md }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.inkFaint} />
            </Pressable>
            <Text style={styles.headerTitle}>Yeni İlan</Text>
            <View style={{ width: 34 }} />
          </View>

          <ScrollView style={styles.flex} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>İşlem Türü</Text>
            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleBtn, type === "buy" && styles.toggleActive]}
                onPress={() => setType("buy")}
              >
                <Text style={[styles.toggleText, type === "buy" && styles.toggleTextActive]}>AL</Text>
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, type === "sell" && styles.toggleActiveSell]}
                onPress={() => setType("sell")}
              >
                <Text style={[styles.toggleText, type === "sell" && styles.toggleTextActive]}>SAT</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Metal / Döviz</Text>
            <View style={styles.metalGrid}>
              {METALS.map((m) => (
                <Pressable
                  key={m.key}
                  style={[styles.metalBtn, metal === m.key && styles.metalActive]}
                  onPress={() => setMetal(m.key)}
                >
                  <Text style={[styles.metalText, metal === m.key && styles.metalTextActive]}>
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Miktar</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={Colors.inkFaint}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputSuffix}>
                {metal === "usd" || metal === "eur" ? "$" : "gr"}
              </Text>
            </View>

            <Text style={styles.label}>Fiyat</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                placeholderTextColor={Colors.inkFaint}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputSuffix}>
                {metal === "usd" || metal === "eur" ? "₺" : "₺/gr"}
              </Text>
            </View>

            {/* Premium price */}
            <Text style={styles.label}>Hemen Al Fiyatı (Premium)</Text>
            <View style={[styles.inputRow, !premiumValid && premiumPrice !== "" && styles.inputRowError]}>
              <TextInput
                style={styles.input}
                value={premiumPrice}
                onChangeText={setPremiumPrice}
                placeholder={numericPrice > 0 ? `En az ${(numericPrice * 1.01).toFixed(0)}` : "0"}
                placeholderTextColor={Colors.inkFaint}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputSuffix}>
                {metal === "usd" || metal === "eur" ? "₺" : "₺/gr"}
              </Text>
            </View>
            {numericPrice > 0 && premiumPrice !== "" && (
              <View style={styles.premiumHelper}>
                <Text style={[styles.premiumHelperText, premiumValid && styles.premiumHelperValid]}>
                  Normal: {parseInt(price).toLocaleString()} {premiumValid ? `· +%${premiumDiff.toFixed(1)} ⬆` : "· Premium fiyat normal fiyattan yüksek olmalı"}
                </Text>
                {premiumValid && <Ionicons name="checkmark-circle" size={14} color={Colors.success} />}
              </View>
            )}

            {/* Max Bid */}
            <View style={styles.maxBidHead}>
              <Text style={styles.label}>Maksimum Teklif Limiti</Text>
              <Pressable
                style={[styles.maxBidToggle, maxBidEnabled && styles.maxBidToggleActive]}
                onPress={() => setMaxBidEnabled(!maxBidEnabled)}
              >
                <View style={[styles.maxBidKnob, maxBidEnabled && styles.maxBidKnobActive]} />
              </Pressable>
            </View>
            {maxBidEnabled && (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={maxBid}
                  onChangeText={setMaxBid}
                  placeholder="Otomatik teklif üst limiti"
                  placeholderTextColor={Colors.inkFaint}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.inputSuffix}>₺/gr</Text>
              </View>
            )}

            {/* Expiry */}
            <Text style={styles.label}>İlan Süresi</Text>
            <View style={styles.chipRow}>
              {EXPIRY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.seconds}
                  style={[styles.chip, expiry === opt.seconds && styles.chipActive]}
                  onPress={() => setExpiry(opt.seconds)}
                >
                  <Text style={[styles.chipText, expiry === opt.seconds && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.submitBtn} onPress={handleSubmit}>
              <LinearGradient
                colors={[Colors.gold, Colors.goldBright]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.submitText}>İlanı Yayınla</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: "rgba(10,10,10,0.5)", zIndex: 100 },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 80,
    backgroundColor: Colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 101,
    overflow: "hidden",
  },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  closeBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontWeight: "600",
    fontSize: TypeSize.h3,
    color: Colors.ink,
    letterSpacing: Tracking.subtitle,
  },
  body: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 40 },
  label: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: TypeSize.caption,
    color: Colors.inkSoft,
    letterSpacing: Tracking.label,
    textTransform: "uppercase",
    marginBottom: Spacing.xs,
  },
  toggleRow: { flexDirection: "row", gap: Spacing.sm },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    backgroundColor: Colors.paperAlt,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  toggleActive: { backgroundColor: Colors.goldFaint, borderColor: Colors.gold },
  toggleActiveSell: { backgroundColor: "rgba(168,57,47,0.1)", borderColor: Colors.danger },
  toggleText: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: TypeSize.body,
    color: Colors.inkSoft,
    letterSpacing: Tracking.button,
  },
  toggleTextActive: { color: Colors.ink },
  metalGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  metalBtn: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 12,
    borderRadius: Radius.sm,
    backgroundColor: Colors.paperAlt,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  metalActive: { backgroundColor: Colors.goldFaint, borderColor: Colors.gold },
  metalText: { fontFamily: Fonts.sansMedium, fontWeight: "500", fontSize: TypeSize.body, color: Colors.inkSoft },
  metalTextActive: { color: Colors.ink },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    overflow: "hidden",
  },
  inputRowError: { borderColor: Colors.danger },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: TypeSize.body,
    color: Colors.ink,
  },
  inputSuffix: {
    paddingRight: Spacing.md,
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: TypeSize.caption,
    color: Colors.inkFaint,
    letterSpacing: Tracking.body,
  },
  premiumHelper: { flexDirection: "row", alignItems: "center", gap: 4 },
  premiumHelperText: {
    fontFamily: Fonts.sans,
    fontSize: TypeSize.caption,
    color: Colors.danger,
  },
  premiumHelperValid: { color: Colors.success },
  chipRow: { flexDirection: "row", gap: Spacing.sm },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.paperAlt,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  chipActive: { backgroundColor: Colors.goldFaint, borderColor: Colors.gold },
  chipText: {
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: TypeSize.caption,
    color: Colors.inkSoft,
    letterSpacing: Tracking.tight,
  },
  chipTextActive: { color: Colors.ink },
  maxBidHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  maxBidToggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.hairlineStrong,
    padding: 2,
  },
  maxBidToggleActive: { backgroundColor: Colors.gold },
  maxBidKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.paper,
  },
  maxBidKnobActive: { alignSelf: "flex-end" },
  submitBtn: {
    height: 50,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    overflow: "hidden",
  },
  submitText: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: TypeSize.body,
    color: Colors.obsidian,
    letterSpacing: Tracking.button,
  },
})
