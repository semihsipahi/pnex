import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Dimensions, Image, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { Colors, Fonts } from "@/constants/theme"

const { width } = Dimensions.get("window")

type Props = {
  onFinish?: () => void
}

export function SplashScreen({ onFinish }: Props) {
  const logoOpacity = useRef(new Animated.Value(0)).current
  const sweep = useRef(new Animated.Value(0)).current
  const tagline = useRef(new Animated.Value(0)).current
  const lockProgress = useRef(new Animated.Value(0)).current
  const ambient = useRef(new Animated.Value(0)).current
  const fadeOut = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ambient, { toValue: 1, duration: 7000, useNativeDriver: true }),
        Animated.timing(ambient, { toValue: 0, duration: 7000, useNativeDriver: true }),
      ]),
    ).start()

    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 2200, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(1400),
        Animated.timing(sweep, { toValue: 1, duration: 2800, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(2800),
        Animated.timing(tagline, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(4200),
        Animated.timing(lockProgress, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ]),
    ]).start()

    const t = setTimeout(() => {
      Animated.timing(fadeOut, { toValue: 0, duration: 1000, useNativeDriver: true }).start(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        onFinish?.()
      })
    }, 8500)

    return () => clearTimeout(t)
  }, [])

  const sweepOpacity = sweep.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.9, 0.9, 0],
  })
  const sweepTranslateX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.7, width * 0.7],
  })
  const taglineTranslateY = tagline.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  })
  const lockTranslateY = lockProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  })
  const ambientOpacity = ambient.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.55],
  })

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <View style={styles.center}>
        <Animated.View style={[styles.logoWrap, { opacity: logoOpacity }]}>
          <Image source={require("@/assets/images/pnex-logo.png")} style={styles.logo} resizeMode="contain" />

          {/* Sweep shimmer */}
          <Animated.View
            style={[
              styles.sweep,
              { opacity: sweepOpacity, transform: [{ translateX: sweepTranslateX }, { rotate: "18deg" }] },
            ]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={["transparent", "rgba(255,245,210,0.55)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: tagline, transform: [{ translateY: taglineTranslateY }] }]}>
        <Animated.View style={[styles.lockWrap, { opacity: lockProgress, transform: [{ translateY: lockTranslateY }] }]}>
          <Text style={styles.lockText}>{"\u2014  ENCRYPTED  \u00B7  INVITATION ONLY  \u2014"}</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.obsidian,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  center: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  logoWrap: { width: "100%", height: "100%", overflow: "hidden" },
  logo: { width: "100%", height: "100%" },
  sweep: { position: "absolute", top: -40, bottom: -40, width: 90 },
  footer: { position: "absolute", bottom: 64, alignItems: "center" },
  lockWrap: { alignItems: "center" },
  lockText: {
    color: Colors.gold,
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: 11,
    letterSpacing: 3,
  },
})
