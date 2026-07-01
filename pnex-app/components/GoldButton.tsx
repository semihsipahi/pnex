import { Pressable, Text, StyleSheet, ActivityIndicator, View, type ViewStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Colors, Fonts, Radius } from "@/constants/theme"

type Props = {
  label: string
  onPress?: () => void
  loading?: boolean
  disabled?: boolean
  variant?: "gold" | "outline" | "dark"
  style?: ViewStyle
}

export function GoldButton({ label, onPress, loading, disabled, variant = "gold", style }: Props) {
  const isGold = variant === "gold"
  const isDark = variant === "dark"

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {isGold ? (
        <LinearGradient
          colors={[Colors.goldBright, Colors.gold, Colors.goldDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          {loading ? (
            <ActivityIndicator color={Colors.obsidian} />
          ) : (
            <Text style={[styles.label, styles.labelDark]}>{label}</Text>
          )}
        </LinearGradient>
      ) : (
        <View style={[styles.fill, isDark ? styles.darkFill : styles.outlineFill]}>
          {loading ? (
            <ActivityIndicator color={isDark ? Colors.gold : Colors.ink} />
          ) : (
            <Text style={[styles.label, isDark ? styles.labelGold : styles.labelInk]}>{label}</Text>
          )}
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 66,
    borderRadius: Radius.pill,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  fill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineFill: {
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: Radius.pill,
  },
  darkFill: {
    backgroundColor: Colors.onyx,
    borderWidth: 1,
    borderColor: "rgba(201,162,75,0.4)",
    borderRadius: Radius.pill,
  },
  label: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 17,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  labelDark: { color: Colors.obsidian },
  labelInk: { color: Colors.ink },
  labelGold: { color: Colors.goldBright },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
})
