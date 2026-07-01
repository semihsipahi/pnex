import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import Animated, { FadeInDown } from "react-native-reanimated"
import { Colors, Fonts, Spacing, Radius } from "@/constants/theme"
import { GoldButton } from "@/components/GoldButton"
import { apiService, DealDto, DealDetailDto } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

interface Props {
  visible: boolean
  dealId: string
  onClose: () => void
}

export default function DealDetailModal({ visible, dealId, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const { token } = useAuth()
  const [deal, setDeal] = useState<DealDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [offerPrice, setOfferPrice] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const isOwn = deal?.isOwn
  const isBuy = deal?.type === "BUY"
  const isActive = deal?.status === "ACTIVE"

  useEffect(() => {
    if (!visible || !dealId || !token) return
    setLoading(true)
    setOfferPrice("")
    apiService.deals.getById(dealId, token)
      .then(setDeal)
      .catch(() => Alert.alert("Hata", "İlan bilgileri alınamadı"))
      .finally(() => setLoading(false))
  }, [visible, dealId, token])

  const handlePlaceOffer = async () => {
    if (!deal || !token) return
    const price = parseFloat(offerPrice)
    if (!price || price <= 0) {
      Alert.alert("Geçersiz Fiyat", "Lütfen geçerli bir fiyat girin")
      return
    }
    setSubmitting(true)
    try {
      await apiService.deals.placeOffer(deal.id, price, token)
      Alert.alert("Başarılı", "Teklifiniz iletildi")
      onClose()
    } catch (err: any) {
      Alert.alert("Hata", err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcceptOffer = async (offerId: string) => {
    if (!deal || !token) return
    setSubmitting(true)
    try {
      await apiService.deals.acceptOffer(deal.id, offerId, token)
      Alert.alert("Başarılı", "Teklif kabul edildi. İlan kapatıldı.")
      onClose()
    } catch (err: any) {
      Alert.alert("Hata", err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + Spacing.md }]}>
          {/* Handle */}
          <Animated.View entering={FadeInDown.duration(400)}>
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>
          </Animated.View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.gold} size="large" />
            </View>
          ) : !deal ? (
            <Text style={styles.errorText}>İlan bulunamadı</Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={[styles.typeBadge, { backgroundColor: isBuy ? "rgba(46,125,50,0.15)" : "rgba(212,175,55,0.15)" }]}>
                  <View style={[styles.typeDot, { backgroundColor: isBuy ? "#2E7D32" : Colors.gold }]} />
                  <Text style={[styles.typeText, { color: isBuy ? "#2E7D32" : Colors.gold }]}>
                    {isBuy ? "ALIYOR" : "SATIYOR"}
                  </Text>
                </View>
                {isOwn && <Text style={styles.ownBadge}>İLANIN</Text>}
              </View>

              {/* Amount */}
              <Text style={styles.amount}>{deal.amount.toLocaleString()} gr</Text>
              <Text style={styles.metal}>{deal.metal.toUpperCase()}</Text>

              {/* Price info */}
              <View style={styles.priceRow}>
                <View style={styles.priceBlock}>
                  <Text style={styles.priceLabel}>
                    {isBuy ? "Maksimum Fiyat" : "Minimum Fiyat"}
                  </Text>
                  <Text style={styles.priceValue}>
                    {isBuy
                      ? (deal.maxPrice?.toLocaleString() || "—")
                      : (deal.minPrice?.toLocaleString() || "—")} ₺
                  </Text>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.priceLabel}>Teklif Sayısı</Text>
                  <Text style={styles.priceValue}>{deal.offerCount}</Text>
                </View>
              </View>

              {/* Creator */}
              {deal.creator && (
                <View style={styles.creatorRow}>
                  <View style={styles.creatorAvatar}>
                    <Text style={styles.creatorAvatarText}>{deal.creator.name.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.creatorName}>{deal.creator.name}</Text>
                    <Text style={styles.creatorHandle}>@{deal.creator.handle} · {deal.creator.tier}</Text>
                  </View>
                </View>
              )}

              {/* Divider */}
              <View style={styles.divider} />

              {/* Offer input (for non-owners) */}
              {isActive && !isOwn && (
                <View style={styles.offerSection}>
                  <Text style={styles.offerSectionTitle}>Teklif Ver</Text>
                  <View style={styles.offerInputRow}>
                    <TextInput
                      value={offerPrice}
                      onChangeText={setOfferPrice}
                      placeholder="Fiyat (₺)"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType="decimal-pad"
                      style={styles.offerInput}
                      selectionColor={Colors.gold}
                    />
                    <Text style={styles.offerInputSuffix}>₺/gr</Text>
                  </View>
                  <GoldButton
                    label="Teklif Ver"
                    onPress={handlePlaceOffer}
                    loading={submitting}
                    disabled={!offerPrice}
                  />
                </View>
              )}

              {/* Offers list (for owners) */}
              {isOwn && isActive && (
                <View style={styles.offersSection}>
                  <Text style={styles.offerSectionTitle}>Gelen Teklifler</Text>
                  {deal.offers && deal.offers.length > 0 ? (
                    deal.offers
                      .filter(o => o.status === "PENDING")
                      .sort((a, b) => isBuy ? a.price - b.price : b.price - a.price)
                      .map((o, i) => {
                        const u = o.userId
                        const name = typeof u === "object" ? u.name : "?"
                        return (
                          <View key={o.id} style={styles.offerRow}>
                            <View style={styles.offerUser}>
                              <Text style={styles.offerUserName}>{name}</Text>
                              <Text style={styles.offerPrice}>{o.price.toLocaleString()} ₺</Text>
                            </View>
                            <Pressable
                              style={styles.acceptBtn}
                              onPress={() => handleAcceptOffer(o.id)}
                              disabled={submitting}
                            >
                              <Text style={styles.acceptBtnText}>Kabul Et</Text>
                            </Pressable>
                          </View>
                        )
                      })
                  ) : (
                    <Text style={styles.noOffers}>Henüz teklif yok</Text>
                  )}
                </View>
              )}

              {/* Closed deal info */}
              {!isActive && deal.winner && (
                <View style={styles.winnerRow}>
                  <Ionicons name="trophy-outline" size={20} color={Colors.gold} />
                  <Text style={styles.winnerText}>
                    Kazanan: <Text style={{ color: Colors.gold }}>{deal.winner.name}</Text>
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#1C1C1C",
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    maxHeight: "85%",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    overflow: "hidden",
    elevation: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    borderTopWidth: 0,
  },
  handleRow: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  loadingWrap: {
    paddingVertical: 80,
    alignItems: "center",
  },
  errorText: {
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    paddingVertical: 40,
    fontFamily: Fonts.sans,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 13,
    letterSpacing: 1.5,
  },
  ownBadge: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1.5,
  },
  amount: {
    fontFamily: Fonts.serifBold,
    fontSize: 36,
    color: "rgba(255,255,255,0.92)",
    letterSpacing: -0.5,
  },
  metal: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 3,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  priceRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  priceBlock: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  priceLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.3)",
    marginBottom: 6,
  },
  priceValue: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 18,
    color: Colors.goldBright,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(212,175,55,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  creatorAvatarText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 16,
    color: Colors.gold,
  },
  creatorName: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
  },
  creatorHandle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: Spacing.md,
  },
  offerSection: {
    marginBottom: Spacing.md,
  },
  offerSectionTitle: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 14,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.7)",
    marginBottom: Spacing.md,
    textTransform: "uppercase",
  },
  offerInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  offerInput: {
    flex: 1,
    color: Colors.white,
    fontFamily: Fonts.sans,
    fontSize: 18,
  },
  offerInputSuffix: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: "rgba(255,255,255,0.3)",
    marginLeft: 8,
  },
  offersSection: {
    marginBottom: Spacing.md,
  },
  offerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: 8,
  },
  offerUser: {
    flex: 1,
  },
  offerUserName: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  offerPrice: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.goldBright,
    marginTop: 4,
  },
  acceptBtn: {
    backgroundColor: "rgba(46,125,50,0.2)",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  acceptBtnText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 12,
    color: "#2E7D32",
    letterSpacing: 1.5,
  },
  noOffers: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
    paddingVertical: 20,
  },
  winnerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: Spacing.lg,
  },
  winnerText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
  },
})
