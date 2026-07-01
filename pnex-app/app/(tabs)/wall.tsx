import React, { useEffect, useState, useRef, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, ImageBackground, Pressable, Dimensions, ActivityIndicator } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, { FadeInDown } from "react-native-reanimated"
import { triggerImpact, triggerNotification } from "@/utils/haptics"
import { Platform } from "react-native"
import { Colors, Fonts, Spacing, Radius, Tracking, TypeSize } from "@/constants/theme"
import { useAuth } from "@/contexts/AuthContext"
import { useDeals } from "@/hooks/useDeals"
import { apiService, DealDto } from "@/services/api"
import DealDetailModal from "@/components/DealDetailModal"
import { io, Socket } from "socket.io-client"
import { API_BASE_URL } from "@/services/api"

const WallColors = { heroCard: "#1C1C1C", cardBg: "#2E2B28", avatarBg: "#1C1C1C" }

const { width } = Dimensions.get("window")

type DealType = "buy" | "sell"
type MetalType = "has" | "22ayar" | "usd" | "eur"

interface Deal {
  id: string
  firm: string
  role: string
  tier: "FOUNDING" | "INNER" | "TRUSTED"
  type: DealType
  metal: MetalType
  amount: string
  price: string
  pricePremium: string
  trust: number
  limit: string
  mutual: number
  expiresIn: number
  initialExpiresIn?: number
  status: "active" | "claimed" | "expired"
  offerCount?: number
  bidderCount?: number
  bestBid?: string
  isOwn?: boolean
  winner?: string
}

const TIER_CONFIG = {
  FOUNDING: { icon: "star", color: "#FFD700", bgColor: "rgba(255,215,0,0.18)" },
  INNER: { icon: "diamond", color: "#5B9BD5", bgColor: "rgba(91,155,213,0.18)" },
  TRUSTED: { icon: "shield-checkmark", color: "#4CAF50", bgColor: "rgba(76,175,80,0.18)" },
}

const METAL_LABELS: Record<MetalType, string> = {
  has: "Has Altın",
  "22ayar": "22 Ayar",
  usd: "USD",
  eur: "EUR",
}

const SELL_THEME = {
  accent: Colors.gold,
  timerGradient: ["#A67C26", Colors.gold] as [string, string],
  badgeBg: "rgba(212,175,55,0.15)",
  ctaBg: "rgba(212,175,55,0.15)",
  ctaText: Colors.gold,
  bestBidBg: "rgba(212,175,55,0.08)",
  borderColor: Colors.gold,
} as const

const BUY_THEME = {
  accent: "#2E7D32",
  timerGradient: ["#1B5E20", "#2E7D32"] as [string, string],
  badgeBg: "rgba(46,125,50,0.15)",
  ctaBg: "rgba(46,125,50,0.15)",
  ctaText: "#2E7D32",
  bestBidBg: "rgba(46,125,50,0.08)",
  borderColor: "#2E7D32",
} as const

const INITIAL_DEALS: Deal[] = [
  {
    id: "1",
    firm: "Altınbaş Kuyumculuk",
    role: "İstanbul · Kapalıçarşı",
    tier: "FOUNDING",
    type: "sell",
    metal: "has",
    amount: "2.500 gr",
    price: "2.850 ₺/gr",
    pricePremium: "2.950 ₺/gr",
    trust: 4.9,
    limit: "10 kg",
    mutual: 18,
    expiresIn: 2712,
    initialExpiresIn: 3600,
    status: "active",
    offerCount: 3,
    bidderCount: 3,
    bestBid: "2.870 ₺/gr",
    isOwn: true,
  },
  {
    id: "2",
    firm: "Vadeli Altın Ticaret",
    role: "İstanbul · Mahmutpaşa",
    tier: "INNER",
    type: "buy",
    metal: "22ayar",
    amount: "1.200 gr",
    price: "2.620 ₺/gr",
    pricePremium: "2.700 ₺/gr",
    trust: 4.6,
    limit: "5 kg",
    mutual: 9,
    expiresIn: 5400,
    initialExpiresIn: 7200,
    status: "active",
    offerCount: 7,
    bidderCount: 7,
    bestBid: "2.580 ₺/gr",
  },
  {
    id: "3",
    firm: "Safir Döviz & Kıymetli Maden",
    role: "Ankara · Ulus",
    tier: "TRUSTED",
    type: "sell",
    metal: "usd",
    amount: "$150.000",
    price: "38.20 ₺",
    pricePremium: "38.85 ₺",
    trust: 4.4,
    limit: "$500K",
    mutual: 5,
    expiresIn: 900,
    initialExpiresIn: 3600,
    status: "active",
    offerCount: 5,
    bidderCount: 3,
    bestBid: "38.35 ₺",
  },
  {
    id: "4",
    firm: "Güven Kuyumculuk",
    role: "İstanbul · Kapalıçarşı",
    tier: "INNER",
    type: "buy",
    metal: "has",
    amount: "800 gr",
    price: "2.840 ₺/gr",
    pricePremium: "2.920 ₺/gr",
    trust: 4.7,
    limit: "3 kg",
    mutual: 12,
    expiresIn: 3600,
    initialExpiresIn: 7200,
    status: "active",
    offerCount: 2,
    bidderCount: 2,
    bestBid: "2.810 ₺/gr",
  },
  {
    id: "5",
    firm: "Safir Döviz & Kıymetli Maden",
    role: "Ankara · Ulus",
    tier: "TRUSTED",
    type: "sell",
    metal: "usd",
    amount: "$50.000",
    price: "38.10 ₺",
    pricePremium: "38.75 ₺",
    trust: 4.4,
    limit: "$500K",
    mutual: 5,
    expiresIn: 0,
    initialExpiresIn: 3600,
    status: "expired",
    offerCount: 11,
    bidderCount: 6,
    bestBid: "38.60 ₺",
    winner: "Altınbaş Kuyumculuk",
  },
]

const HERO_STATS = {
  value: "₺2.4M",
  label: "Toplam İşlem Hacmi",
  change: "+18%",
  changeLabel: "Düne Göre",
  miniStats: [
    { value: "1.284", label: "Aktif Emir" },
    { value: "186", label: "Aktif Üye" },
    { value: "48M ₺", label: "Network Limiti" },
  ],
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

function toDealDto(d: DealDto) {
  const type = d.type === 'SELL' ? 'sell' : 'buy' as DealType
  const metal = d.metal as MetalType
  const priceStr = d.type === 'SELL'
    ? `${d.minPrice?.toLocaleString() || '—'} ₺/gr`
    : `${d.maxPrice?.toLocaleString() || '—'} ₺/gr`
  const bestBidStr = d.type === 'SELL'
    ? `En iyi ${d.offerCount > 0 ? '↑' : '—'}`
    : `En uygun ${d.offerCount > 0 ? '↓' : '—'}`

  return {
    id: d.id,
    firm: d.creator?.name || '—',
    role: `${d.creator?.tier || ''} · ${d.metal}`,
    tier: (d.creator?.tier === 'FOUNDING' ? 'FOUNDING' : d.creator?.tier === 'PLATINUM' ? 'FOUNDING' : 'TRUSTED') as 'FOUNDING' | 'INNER' | 'TRUSTED',
    type,
    metal,
    amount: `${d.amount.toLocaleString()} gr`,
    price: priceStr,
    pricePremium: priceStr,
    trust: 4.5,
    limit: '—',
    mutual: 0,
    expiresIn: 0,
    status: (d.status === 'ACTIVE' ? 'active' : d.status === 'CLOSED' ? 'claimed' : 'expired') as 'active' | 'claimed' | 'expired',
    offerCount: d.offerCount,
    bidderCount: d.offerCount,
    bestBid: bestBidStr,
    isOwn: d.isOwn,
    winner: d.winner?.name,
  }
}

export default function Wall() {
  const insets = useSafeAreaInsets()
  const { deals: apiDeals, loading, error, refetch } = useDeals()
  const [deals, setDeals] = useState<ReturnType<typeof toDealDto>[]>([])
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const updateDealInList = useCallback((dealId: string, updater: (d: ReturnType<typeof toDealDto>) => ReturnType<typeof toDealDto>) => {
    setDeals(prev => prev.map(d => d.id === dealId ? updater(d) : d))
  }, [])

  useEffect(() => {
    setDeals(apiDeals.map(toDealDto))
  }, [apiDeals])

  useEffect(() => {
    triggerImpact()
    triggerNotification()
  }, [])

  useEffect(() => {
    const socket = io(`${API_BASE_URL}/deals`, {
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('deal.created', (data: { deal: any }) => {
      refetch()
    })

    socket.on('deal.offer.placed', (data: { dealId: string; offer: { userId: string; price: number } }) => {
      setDeals(prev => prev.map(d =>
        d.id === data.dealId
          ? { ...d, offerCount: (d.offerCount || 0) + 1 }
          : d
      ))
    })

    socket.on('deal.closed', (data: { dealId: string }) => {
      refetch()
    })

    socket.on('deal.cancelled', (data: { dealId: string }) => {
      setDeals(prev => prev.filter(d => d.id !== data.dealId))
    })

    return () => {
      socket.disconnect()
    }
  }, [refetch])

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
        {/* Hero header */}
        <ImageBackground
          source={require("@/assets/images/wall-hero.png")}
          style={[styles.hero, { paddingTop: insets.top + Spacing.md }]}
          imageStyle={styles.heroImg}
        >
          <LinearGradient
            colors={["rgba(20,20,20,0.50)", "rgba(20,20,20,0.88)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLogoText}>PNEX</Text>
              <Text style={styles.heroEyebrow}>Private Network</Text>
            </View>
            <Pressable style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="notifications-outline" size={20} color={Colors.goldBright} />
              <View style={styles.dot} />
            </Pressable>
          </View>

          {/* Hero card */}
          <View style={styles.heroCard}>
            <View style={styles.heroCardTop} />
            <Text style={styles.heroCardBadge}>BUGÜNKÜ PİYASA</Text>
            <Text style={styles.heroCardValue}>{HERO_STATS.value}</Text>
            <Text style={styles.heroCardLabel}>{HERO_STATS.label}</Text>
            <View style={styles.heroCardChange}>
              <Text style={styles.heroCardChangeValue}>{HERO_STATS.change}</Text>
              <Text style={styles.heroCardChangeLabel}>{HERO_STATS.changeLabel}</Text>
            </View>
            <View style={styles.heroCardDivider} />
            <View style={styles.heroCardMiniRow}>
              {HERO_STATS.miniStats.map((s, i) => (
                <React.Fragment key={s.label}>
                  <View style={styles.heroCardMiniItem}>
                    <Text style={styles.heroCardMiniValue}>{s.value}</Text>
                    <Text style={styles.heroCardMiniLabel}>{s.label}</Text>
                  </View>
                  {i < HERO_STATS.miniStats.length - 1 && <View style={styles.heroCardMiniDot} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        </ImageBackground>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Aktif Piyasa</Text>
            <Pressable hitSlop={8} style={styles.filterChip}>
              <Ionicons name="options-outline" size={14} color={Colors.ink} />
              <Text style={styles.filterText}>Filtrele</Text>
            </Pressable>
          </View>

          {deals.map((deal, i) => (
            <Animated.View
              key={deal.id}
              entering={FadeInDown.delay(i * 180).duration(600).springify().damping(16)}
            >
              <DealCard deal={deal} onPress={() => setSelectedDealId(deal.id)} />
            </Animated.View>
          ))}
        </View>
      </ScrollView>
      <DealDetailModal
        visible={!!selectedDealId}
        dealId={selectedDealId || ''}
        onClose={() => { setSelectedDealId(null); refetch() }}
      />
    </View>
  )
}

function DealCard({ deal, onPress }: { deal: Deal; onPress: () => void }) {
  const isBuy = deal.type === "buy"
  const isExpired = deal.status !== "active"
  const timerUrgent = deal.expiresIn < 300
  const theme = isBuy ? BUY_THEME : SELL_THEME

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        isExpired && styles.cardExpired,
        !isExpired && { borderLeftColor: theme.borderColor, borderLeftWidth: 3 },
      ]}>
      {/* Timer bar */}
      {!isExpired && (
        <View style={styles.cardBorderBar}>
          <View style={[styles.cardBorderFill, { width: `${Math.max(0, (deal.expiresIn / (deal.initialExpiresIn ?? deal.expiresIn)) * 100)}%` }]}>
            <LinearGradient
              colors={timerUrgent ? [Colors.danger, "#8B2D23"] : theme.timerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.cardBorderCap, { backgroundColor: timerUrgent ? Colors.danger : theme.accent }]} />
          </View>
        </View>
      )}

      {/* Header */}
      <View style={styles.cardHead}>
        <View style={[styles.cardAvatar, isBuy && styles.cardAvatarBuy]}>
          <Text style={styles.cardAvatarText}>{deal.firm.charAt(0)}</Text>
        </View>
        <View style={styles.cardHeadInfo}>
          <View style={styles.cardHeadTop}>
            <Text style={styles.cardName} numberOfLines={1}>{deal.firm}</Text>
            <View style={[styles.cardTier, { backgroundColor: TIER_CONFIG[deal.tier].bgColor }]}>
              <Ionicons name={TIER_CONFIG[deal.tier].icon as any} size={12} color={TIER_CONFIG[deal.tier].color} />
            </View>
          </View>
          <Text style={styles.cardRole}>{deal.role}</Text>
        </View>
        <View style={styles.spacer} />
        {isExpired ? (
          <View style={styles.cardTimerExpired}>
            <Text style={styles.cardTimerExpiredText}>SÜRE DOLDU</Text>
          </View>
        ) : (
          <View style={styles.cardTimerWrap}>
            <View style={[styles.cardTimer, timerUrgent && styles.cardTimerUrgent]}>
              <Ionicons name="time-outline" size={10} color={timerUrgent ? Colors.danger : "rgba(255,255,255,0.35)"} />
              <Text style={[styles.cardTimerText, timerUrgent && styles.cardTimerTextUrgent]}>
                {formatTimer(deal.expiresIn)}
              </Text>
            </View>
            <Text style={styles.cardTimerSoft}>+30sn/teklif</Text>
          </View>
        )}
      </View>

      {/* Type badge */}
      <View style={styles.cardTypeRow}>
        <View style={[styles.cardTypeBadge, { backgroundColor: theme.badgeBg }]}>
          <View style={[styles.cardTypeDot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.cardTypeText, { color: theme.accent }]}>
            {isBuy ? "ALIYOR" : "SATIYOR"}
          </Text>
        </View>
      </View>

      {/* Amount */}
      <Text style={styles.cardAmount}>{deal.amount}</Text>

      {/* Metal */}
      <Text style={styles.cardMetal}>{METAL_LABELS[deal.metal]}</Text>

      {/* Price comparison row */}
      <View style={styles.cardPriceRow}>
        <View style={styles.cardPriceBlock}>
          <Text style={styles.cardPriceLabel}>{isBuy ? "Azami" : "Başlangıç"}</Text>
          <Text style={styles.cardPriceValue}>{deal.price}</Text>
        </View>
        {deal.bestBid && !isExpired && (
          <View style={[styles.cardBestBidBlock, { backgroundColor: theme.bestBidBg }]}>
            <Text style={[styles.cardBestBidLabel, { color: theme.accent }]}>
              {isBuy ? "▼ En Düşük" : "▲ En Yüksek"}
            </Text>
            <Text style={[styles.cardBestBidValue, { color: theme.accent }]}>
              {deal.bestBid}
            </Text>
          </View>
        )}
      </View>

      {/* Bid info */}
      {!isExpired && deal.offerCount != null && (
        <View style={styles.cardBidInfo}>
          <Text style={styles.cardBidInfoText}>
            {deal.offerCount} teklif · {deal.bidderCount ?? 0} {isBuy ? "satıcı" : "alıcı"}
          </Text>
          <Text style={styles.cardBidInfoHint}>
            En {isBuy ? "düşük" : "yüksek"} teklif kazanır
          </Text>
        </View>
      )}

      {/* Own badge */}
      {deal.isOwn && !isExpired && (
        <View style={styles.cardCtaRow}>
          <View style={styles.cardCtaOwn}>
            <Ionicons name="eye-off-outline" size={14} color="rgba(255,255,255,0.3)" />
            <Text style={styles.cardCtaOwnText}>Kendi İlanın</Text>
          </View>
        </View>
      )}
      {isExpired && deal.winner && (
        <View style={styles.cardWinnerRow}>
          <Ionicons name="trophy-outline" size={14} color={Colors.gold} />
          <Text style={styles.cardWinnerText}>
            <Text style={{ color: Colors.gold }}>{deal.winner}</Text> kazandı
          </Text>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  flex: { flex: 1 },
  hero: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, overflow: "hidden" },
  heroImg: { resizeMode: "cover" },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  heroEyebrow: { color: Colors.gold, fontFamily: Fonts.sansMedium, fontSize: TypeSize.micro, letterSpacing: Tracking.label, marginTop: 2, fontWeight: "500" },
  heroLogoText: { fontFamily: Fonts.serif, fontSize: TypeSize.h1, color: Colors.goldBright, letterSpacing: Tracking.logo },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(201,162,75,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { position: "absolute", top: 10, right: 11, width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.gold },
  heroCard: {
    backgroundColor: WallColors.heroCard,
    borderWidth: 1,
    borderColor: "rgba(201,162,75,0.12)",
    borderRadius: Radius.lg,
    paddingVertical: 32,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
  },
  heroCardTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.gold,
  },
  heroCardBadge: {
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: 12,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.3)",
    marginBottom: 16,
    textAlign: "center",
  },
  heroCardValue: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 44,
    letterSpacing: 1.5,
    color: Colors.goldBright,
    marginBottom: 4,
    textAlign: "center",
  },
  heroCardLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 12,
    textAlign: "center",
  },
  heroCardChange: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  heroCardChangeValue: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 13,
    color: "#4CAF50",
    letterSpacing: 0.5,
  },
  heroCardChangeLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
  },
  heroCardDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 16,
  },
  heroCardMiniRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroCardMiniItem: { alignItems: "center", gap: 2 },
  heroCardMiniValue: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  heroCardMiniLabel: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.25)",
  },
  heroCardMiniDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  body: {
    backgroundColor: Colors.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.md },
  sectionTitle: { fontFamily: Fonts.serifBold, fontSize: TypeSize.h2, color: Colors.ink },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.hairlineStrong,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  filterText: { fontFamily: Fonts.sansMedium, fontWeight: "500", fontSize: 12, color: Colors.ink, letterSpacing: Tracking.tight },
  // Card
  card: {
    backgroundColor: WallColors.cardBg,
    borderRadius: Radius.lg,
    paddingVertical: 24,
    paddingHorizontal: 28,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(201,162,75,0.12)",
    borderLeftWidth: 0,
    overflow: "hidden",
  },
  cardExpired: {
    opacity: 0.4,
    borderColor: "rgba(255,255,255,0.06)",
    borderLeftWidth: 3,
    borderLeftColor: "rgba(255,255,255,0.06)",
  },
  // Time border bar
  cardBorderBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    overflow: "hidden",
  },
  cardBorderFill: {
    height: "100%",
    position: "relative",
  },
  cardBorderCap: {
    position: "absolute",
    right: -1.5,
    top: -1.5,
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
  // Header
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  cardHeadInfo: {
    flexShrink: 1,
    gap: 2,
  },
  cardHeadTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: WallColors.avatarBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(201,162,75,0.3)",
  },
  cardAvatarBuy: { borderColor: "rgba(46,125,50,0.3)" },
  cardAvatarText: { color: Colors.goldBright, fontFamily: Fonts.serif, fontSize: 18 },
  cardName: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 15,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  cardRole: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
  },
  cardTier: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: { flex: 1 },
  // Timer
  cardTimer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cardTimerUrgent: { borderColor: "rgba(168,57,47,0.4)", backgroundColor: "rgba(168,57,47,0.1)" },
  cardTimerWrap: { alignItems: "flex-end", gap: 2 },
  cardTimerText: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: 0.3 },
  cardTimerTextUrgent: { color: Colors.danger },
  cardTimerSoft: { fontFamily: Fonts.sans, fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: 0.2 },
  cardTimerExpired: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cardTimerExpiredText: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: 0.5 },
  // Type badge
  cardTypeRow: {
    marginTop: 4,
    marginBottom: 14,
  },
  cardTypeBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  cardTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardTypeText: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  // Hero amount
  cardAmount: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 34,
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginTop: 6,
  },
  cardMetal: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
    marginBottom: 16,
  },
  // Price
  cardPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    marginBottom: 8,
  },
  cardPriceBlock: {
    gap: 2,
  },
  cardPriceLabel: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: "rgba(255,255,255,0.25)",
    letterSpacing: 1,
  },
  cardPriceValue: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 20,
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  cardBestBidBlock: {
    alignItems: "flex-end",
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cardBestBidLabel: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  cardBestBidValue: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 20,
    letterSpacing: -0.3,
  },
  // Bid info
  cardBidInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardBidInfoText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
  },
  cardBidInfoHint: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 0.3,
  },
  // CTAs
  cardCtaRow: { flexDirection: "row", gap: 14 },
  cardCtaOutline: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    gap: 2,
  },
  cardCtaOutlineText: {
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: 12,
    color: "#FFFFFF",
  },
  cardCtaOutlineSub: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
  cardCtaFull: {
    flex: 1.3,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 1,
  },
  cardCtaFullText: {
    fontFamily: Fonts.sansSemibold,
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  cardCtaPremiumText: {
    fontFamily: Fonts.sansMedium,
    fontWeight: "500",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  cardCtaOwn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  cardCtaOwnText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 0.3,
  },
  cardWinnerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: "rgba(201,162,75,0.1)",
  },
  cardWinnerText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.3,
  },
})
