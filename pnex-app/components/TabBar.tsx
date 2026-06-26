import { useRef } from "react"
import { View, Text, Pressable, StyleSheet, Animated } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { Colors, Fonts } from "@/constants/theme"

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap; label: string }> = {
  wall: { active: "grid", inactive: "grid-outline", label: "Duvar" },
  network: { active: "people", inactive: "people-outline", label: "Ağ" },
  account: { active: "person", inactive: "person-outline", label: "Hesap" },
}

interface TabBarProps extends BottomTabBarProps {
  onPlusPress?: () => void
}

export function TabBar({ state, navigation, onPlusPress }: TabBarProps) {
  const insets = useSafeAreaInsets()
  const plusScale = useRef(new Animated.Value(1)).current

  const onPlusPressIn = () => {
    Animated.spring(plusScale, { toValue: 0.88, useNativeDriver: true, friction: 10 }).start()
  }

  const onPlusPressOut = () => {
    Animated.spring(plusScale, { toValue: 1, useNativeDriver: true, friction: 6 }).start()
  }

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom || 8 }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index
          const conf = ICONS[route.name]
          if (!conf) return null

          const scale = useRef(new Animated.Value(1)).current

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true })
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name)
          }

          const onPressIn = () => {
            Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, friction: 12 }).start()
          }

          const onPressOut = () => {
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start()
          }

          return (
            <Pressable key={route.key} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.touch}>
              <Animated.View style={[styles.item, { transform: [{ scale }] }]}>
                <View style={focused && styles.activeDot} />
                <Ionicons
                  name={focused ? conf.active : conf.inactive}
                  size={20}
                  color={focused ? Colors.goldBright : "rgba(255,255,255,0.25)"}
                />
                <Text style={[styles.label, focused && styles.labelActive]}>{conf.label}</Text>
              </Animated.View>
            </Pressable>
          )
        })}

        {/* Center plus action */}
        <View style={styles.plusWrap}>
          <Animated.View style={[styles.plusOuter, { transform: [{ scale: plusScale }] }]}>
            <LinearGradient
              colors={[Colors.gold, Colors.goldBright]}
              style={styles.plusGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Pressable
              onPressIn={onPlusPressIn}
              onPressOut={onPlusPressOut}
              onPress={onPlusPress}
              style={styles.plusTouch}
              hitSlop={12}
            >
              <Ionicons name="add" size={32} color={Colors.obsidian} />
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#0A0A0A",
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    paddingTop: 12,
    alignItems: "flex-end",
  },
  touch: {
    flex: 1,
    alignItems: "center",
  },
  item: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gold,
    marginBottom: 2,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: 10,
    letterSpacing: 0.3,
    color: "rgba(255,255,255,0.25)",
  },
  labelActive: {
    color: Colors.goldBright,
  },
  plusWrap: {
    flex: 1,
    alignItems: "center",
    marginTop: -24,
  },
  plusOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#0A0A0A",
  },
  plusGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  plusTouch: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
})
