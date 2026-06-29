import { Platform, NativeModules } from "react-native"

const isNative = Platform.OS === "ios" || Platform.OS === "android"

function getHaptics(): any {
  return NativeModules.RNHaptics
}

export async function triggerImpact() {
  if (!isNative) {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20)
    }
    return
  }

  const h = getHaptics()
  if (!h?.impactHeavy) {
    console.warn("[HAPTICS] RNHaptics not available")
    return
  }

  try {
    await h.impactHeavy()
  } catch (e) {
    console.warn("[HAPTICS] impactHeavy failed:", String(e))
  }
}

export async function triggerNotification(type?: "success" | "error" | "warning") {
  if (!isNative) {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 30, 10])
    }
    return
  }

  const h = getHaptics()
  if (!h?.notificationSuccess) {
    console.warn("[HAPTICS] RNHaptics not available")
    return
  }

  try {
    const method = !type || type === "success" ? "notificationSuccess"
      : type === "error" ? "notificationError"
      : "notificationWarning"
    await h[method]()
  } catch (e) {
    console.warn("[HAPTICS] notification failed:", String(e))
  }
}
