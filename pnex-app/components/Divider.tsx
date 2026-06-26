import { View, Text, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Colors, Fonts } from "@/constants/theme"

/** Ornamental divider with optional centered label. */
export function Divider({ label, dark }: { label?: string; dark?: boolean }) {
  const line = dark ? "rgba(201,162,75,0.35)" : Colors.hairlineStrong
  return (
    <View style={styles.row}>
      <LinearGradient
        colors={["transparent", line]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.line}
      />
      {label ? (
        <Text style={[styles.label, { color: dark ? Colors.gold : Colors.inkFaint }]}>{label}</Text>
      ) : null}
      <LinearGradient
        colors={[line, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.line}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  line: { flex: 1, height: 1 },
  label: {
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
})
