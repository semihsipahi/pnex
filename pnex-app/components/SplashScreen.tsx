import { useEffect } from "react"
import { View, Text, StyleSheet, Dimensions, Image } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  cancelAnimation,
  Easing,
} from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { Colors, Fonts } from "@/constants/theme"

const { width, height } = Dimensions.get("window")
const HALF = height / 2

type Props = {
  onFinish?: () => void
}

interface StreakCfg {
  delay: number
  dur: number
  topPct: number
  h: number
  op: number
  angle: number
}

const STREAKS: StreakCfg[] = [
  { delay: 1.80, dur: 1.40, topPct: 37, h: 1.5, op: 0.72, angle: 6 },
  { delay: 2.20, dur: 1.80, topPct: 41, h: 3.0, op: 0.55, angle: 8 },
  { delay: 2.50, dur: 1.10, topPct: 44, h: 1.0, op: 0.90, angle: 5 },
  { delay: 2.90, dur: 1.55, topPct: 47, h: 2.5, op: 0.62, angle: 10 },
  { delay: 3.40, dur: 1.30, topPct: 43, h: 1.2, op: 0.80, angle: 7 },
]

const vaultEase = Easing.bezier(0.76, 0, 0.24, 1)

function LightStreak({ delay, dur, topPct, h, op, angle }: StreakCfg) {
  const translateX = useSharedValue(-width)

  useEffect(() => {
    const t = setTimeout(() => {
      translateX.value = withTiming(width * 2, { duration: Math.round(dur * 1000), easing: Easing.inOut(Easing.ease) })
    }, Math.round(delay * 1000))

    return () => {
      clearTimeout(t)
      cancelAnimation(translateX)
    }
  }, [])

  const streakStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: `${angle}deg` }],
  }))

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: `${topPct}%` as unknown as number,
          left: 0,
          width: "100%",
          height: h,
        },
        streakStyle,
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={[
          "transparent",
          `rgba(255,255,255,0)`,
          `rgba(255,255,255,${op * 0.45})`,
          `rgba(255,255,255,${op})`,
          `rgba(255,255,255,${op * 0.45})`,
          `rgba(255,255,255,0)`,
          "transparent",
        ]}
        locations={[0, 0.18, 0.36, 0.50, 0.64, 0.82, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  )
}

export function SplashScreen({ onFinish }: Props) {
  const curtainOpacity = useSharedValue(1)
  const topTranslateY = useSharedValue(0)
  const bottomTranslateY = useSharedValue(0)
  const taglineOpacity = useSharedValue(0)
  const seamOpacity = useSharedValue(0)
  const seamScaleX = useSharedValue(0)

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    curtainOpacity.value = withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.ease) })

    taglineOpacity.value = withDelay(1800, withTiming(1, { duration: 800 }))

    const vaultTimer = setTimeout(() => {
      topTranslateY.value = withTiming(-HALF, { duration: 1400, easing: vaultEase })
      bottomTranslateY.value = withTiming(HALF, { duration: 1400, easing: vaultEase })

      seamOpacity.value = withSequence(
        withTiming(1, { duration: 66 }),
        withDelay(650, withTiming(0, { duration: 380 })),
      )
      seamScaleX.value = withSequence(
        withTiming(1, { duration: 66 }),
        withTiming(1, { duration: 1034 }),
      )

      taglineOpacity.value = withTiming(0, { duration: 200 })

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    }, 4200)

    const doneTimer = setTimeout(() => {
      onFinish?.()
    }, 5600)

    return () => {
      clearTimeout(vaultTimer)
      clearTimeout(doneTimer)
      cancelAnimation(curtainOpacity)
      cancelAnimation(taglineOpacity)
      cancelAnimation(topTranslateY)
      cancelAnimation(bottomTranslateY)
      cancelAnimation(seamOpacity)
      cancelAnimation(seamScaleX)
    }
  }, [])

  const curtainStyle = useAnimatedStyle(() => ({
    opacity: curtainOpacity.value,
  }))

  const topStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: topTranslateY.value }],
  }))

  const bottomStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bottomTranslateY.value }],
  }))

  const taglineAnimStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }))

  const seamStyle = useAnimatedStyle(() => ({
    opacity: seamOpacity.value,
    transform: [{ scaleX: seamScaleX.value }, { translateY: -0.75 }],
  }))

  return (
    <View style={styles.container}>
      {/* Üst yarı — logo top half */}
      <Animated.View style={[styles.half, styles.halfTop, topStyle]}>
        <Image
          source={require("@/assets/images/pnex-logo.png")}
          style={styles.imageFillTop}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Alt yarı — logo bottom half */}
      <Animated.View style={[styles.half, styles.halfBottom, bottomStyle]}>
        <Image
          source={require("@/assets/images/pnex-logo.png")}
          style={styles.imageFillBottom}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Parıltı şeritleri */}
      <View style={styles.streakContainer} pointerEvents="none">
        {STREAKS.map((s, i) => <LightStreak key={i} {...s} />)}
      </View>

      {/* Kasa açılma ışık çizgisi */}
      <Animated.View style={[styles.seam, seamStyle]} pointerEvents="none">
        <LinearGradient
          colors={["transparent", "rgba(201,162,75,0.55)", "rgba(255,255,255,0.95)", "rgba(201,162,75,0.55)", "transparent"]}
          locations={[0, 0.15, 0.50, 0.85, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Siyah perde — en üst katman */}
      <Animated.View style={[styles.curtain, curtainStyle]} pointerEvents="none" />

      {/* Tagline */}
      <Animated.View style={[styles.tagline, taglineAnimStyle]} pointerEvents="none">
        <Text style={styles.taglineText}>INVITATION ONLY</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.black,
    zIndex: 999,
  },
  half: {
    position: "absolute",
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  halfTop: {
    top: 0,
    height: "50%",
  },
  halfBottom: {
    bottom: 0,
    height: "50%",
  },
  imageFillTop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height,
  },
  imageFillBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height,
  },
  streakContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  seam: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1.5,
    zIndex: 20,
  },
  curtain: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.black,
    zIndex: 25,
  },
  tagline: {
    position: "absolute",
    bottom: "9%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  taglineText: {
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: 10,
    letterSpacing: 3.8,
    color: "rgba(255,255,255,0.28)",
  },
})
