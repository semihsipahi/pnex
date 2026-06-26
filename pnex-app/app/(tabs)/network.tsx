import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Fonts, Spacing, Radius, Tracking, TypeSize } from "@/constants/theme"

type RequestStatus = "pending" | "approved" | "rejected"

interface NetworkMember {
  id: string
  name: string
  initial: string
  trust: number
  limit: string
  mutual: number
  position: string
  incomingRequests: number
}

interface RequestNotif {
  id: string
  from: string
  fromInitial: string
  type: "buy" | "sell"
  metal: string
  amount: string
  time: string
  status: RequestStatus
}

const MEMBERS: NetworkMember[] = [
  { id: "1", name: "Ahmet Yılmaz", initial: "A", trust: 4.9, limit: "10 kg", mutual: 23, position: "+350gr Has", incomingRequests: 0 },
  { id: "2", name: "Mehmet K.", initial: "M", trust: 4.6, limit: "5 kg", mutual: 9, position: "-180gr Has", incomingRequests: 1 },
  { id: "3", name: "Safir Döviz & Kıymetli Maden", initial: "S", trust: 4.4, limit: "$500K", mutual: 5, position: "$0", incomingRequests: 0 },
  { id: "4", name: "Vadeli Altın Ticaret", initial: "V", trust: 4.7, limit: "8 kg", mutual: 14, position: "+120gr 22Ayar", incomingRequests: 0 },
  { id: "5", name: "Güven Kuyumculuk", initial: "G", trust: 4.7, limit: "3 kg", mutual: 12, position: "-80gr Has", incomingRequests: 2 },
  { id: "6", name: "Altınbaş Kuyumculuk", initial: "A", trust: 4.8, limit: "12 kg", mutual: 20, position: "+200gr Has", incomingRequests: 0 },
]

const REQUESTS: RequestNotif[] = [
  { id: "r1", from: "Mehmet K.", fromInitial: "M", type: "sell", metal: "Has Altın", amount: "500 gr", time: "15 dk önce", status: "pending" },
  { id: "r2", from: "Güven Kuyumculuk", fromInitial: "G", type: "buy", metal: "22 Ayar", amount: "300 gr", time: "42 dk önce", status: "pending" },
]

export default function Network() {
  const insets = useSafeAreaInsets()
  const [requestsOpen, setRequestsOpen] = useState(true)
  const [notifications, setNotifications] = useState(REQUESTS)
  const [talepTarget, setTalepTarget] = useState<NetworkMember | null>(null)
  const [talepType, setTalepType] = useState<"buy" | "sell">("buy")
  const [talepMetal, setTalepMetal] = useState("Has Altın")
  const [talepAmount, setTalepAmount] = useState("")

  const handleResponse = (id: string, action: "approved" | "rejected") => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: action } : n)))
  }

  const pendingCount = notifications.filter((n) => n.status === "pending").length

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <LinearGradient
            colors={[Colors.onyx, Colors.obsidian]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.headerRow}>
            <Text style={styles.headerLogo}>PNEX</Text>
            <Text style={styles.headerSub}>Ağ</Text>
          </View>

          {/* Search placeholder */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.3)" />
            <Text style={styles.searchPlaceholder}>Firma ara...</Text>
          </View>
        </View>

        {/* Pending requests */}
        <View style={styles.body}>
          <Pressable style={styles.sectionHead} onPress={() => setRequestsOpen((o) => !o)}>
            <View style={styles.sectionHeadLeft}>
              <Ionicons name="mail-open-outline" size={18} color={Colors.ink} />
              <Text style={styles.sectionTitle}>Gelen Talepler</Text>
              {pendingCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingCount}</Text>
                </View>
              )}
            </View>
            <Ionicons
              name={requestsOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.inkFaint}
            />
          </Pressable>

          {requestsOpen && (
            <View style={styles.requestsWrap}>
              {notifications.length === 0 ? (
                <Text style={styles.emptyText}>Bekleyen talep yok</Text>
              ) : (
                notifications.map((req) => (
                  <View key={req.id} style={styles.requestCard}>
                    <View style={styles.requestLeft}>
                      <View style={styles.requestAvatar}>
                        <Text style={styles.requestAvatarText}>{req.fromInitial}</Text>
                      </View>
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestFirm}>{req.from}</Text>
                        <Text style={styles.requestDetail}>
                          {req.type === "sell" ? "SAT" : "AL"} {req.amount} {req.metal}
                        </Text>
                        <Text style={styles.requestTime}>{req.time}</Text>
                      </View>
                    </View>
                    {req.status === "pending" ? (
                      <View style={styles.requestActions}>
                        <Pressable
                          style={styles.requestReject}
                          onPress={() => handleResponse(req.id, "rejected")}
                        >
                          <Text style={styles.requestRejectText}>Reddet</Text>
                        </Pressable>
                        <Pressable
                          style={styles.requestApprove}
                          onPress={() => handleResponse(req.id, "approved")}
                        >
                          <Text style={styles.requestApproveText}>Onayla</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Text style={[styles.requestStatus, req.status === "approved" && styles.requestStatusApproved]}>
                        {req.status === "approved" ? "✓ Onaylandı" : "✕ Reddedildi"}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          )}

          {/* Invite card */}
          <View style={styles.inviteCard}>
            <View style={styles.inviteCardLeft}>
              <Ionicons name="mail-open-outline" size={18} color={Colors.goldDeep} />
              <View>
                <Text style={styles.inviteCardTitle}>Davet Et</Text>
                <Text style={styles.inviteCardSub}>Kodun: PNEX-ABCD-12 · 2 hakkın kaldı</Text>
              </View>
            </View>
            <Pressable style={styles.inviteCardBtn}>
              <Ionicons name="add" size={16} color={Colors.ink} />
            </Pressable>
          </View>

          {/* Members */}
          <Text style={styles.membersTitle}>Network Üyeleri</Text>

          {MEMBERS.map((m) => (
            <View key={m.id} style={styles.memberCard}>
              <View style={styles.memberTop}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{m.initial}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <View style={styles.memberMetaRow}>
                    <Text style={styles.memberStar}>★</Text>
                    <Text style={styles.memberMeta}>{m.trust}</Text>
                    <Text style={styles.memberMetaDot}>·</Text>
                    <Text style={styles.memberMeta}>Limit: {m.limit}</Text>
                    <Text style={styles.memberMetaDot}>·</Text>
                    <Text style={styles.memberMeta}>{m.mutual} ortak</Text>
                  </View>
                  <Text style={styles.memberPosition}>{m.position}</Text>
                </View>
                <Pressable style={styles.talepBtn} onPress={() => setTalepTarget(m)}>
                  <Text style={styles.talepBtnText}>Talep</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Talep Gönder Modal */}
      <Modal visible={!!talepTarget} transparent animationType="slide" onRequestClose={() => setTalepTarget(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Talep Gönder</Text>
              <Pressable onPress={() => setTalepTarget(null)}>
                <Ionicons name="close" size={22} color={Colors.ink} />
              </Pressable>
            </View>

            {talepTarget && (
              <View style={styles.modalTarget}>
                <View style={styles.modalTargetAvatar}>
                  <Text style={styles.modalTargetAvatarText}>{talepTarget.initial}</Text>
                </View>
                <Text style={styles.modalTargetName}>{talepTarget.name}</Text>
              </View>
            )}

            {/* Type toggle */}
            <View style={styles.talepTypeRow}>
              <Pressable
                style={[styles.talepTypeChip, talepType === "buy" && styles.talepTypeChipActive]}
                onPress={() => setTalepType("buy")}
              >
                <Text style={[styles.talepTypeText, talepType === "buy" && styles.talepTypeTextActive]}>Al</Text>
              </Pressable>
              <Pressable
                style={[styles.talepTypeChip, talepType === "sell" && styles.talepTypeChipActive]}
                onPress={() => setTalepType("sell")}
              >
                <Text style={[styles.talepTypeText, talepType === "sell" && styles.talepTypeTextActive]}>Sat</Text>
              </Pressable>
            </View>

            {/* Metal */}
            <Text style={styles.talepLabel}>Kıymetli Maden / Döviz</Text>
            <View style={styles.talepMetalRow}>
              {["Has Altın", "22 Ayar", "USD", "EUR"].map((m) => (
                <Pressable
                  key={m}
                  style={[styles.talepMetalChip, talepMetal === m && styles.talepMetalChipActive]}
                  onPress={() => setTalepMetal(m)}
                >
                  <Text style={[styles.talepMetalText, talepMetal === m && styles.talepMetalTextActive]}>{m}</Text>
                </Pressable>
              ))}
            </View>

            {/* Amount */}
            <Text style={styles.talepLabel}>Miktar</Text>
            <TextInput
              style={styles.talepInput}
              value={talepAmount}
              onChangeText={setTalepAmount}
              placeholder="Örn: 500 gr"
              placeholderTextColor={Colors.inkFaint}
              keyboardType="default"
            />

            {/* Submit */}
            <Pressable style={styles.talepSubmit}>
              <Text style={styles.talepSubmitText}>Talep Gönder</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  // Header
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.xxl,
    overflow: "hidden",
  },
  headerRow: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  headerLogo: { fontFamily: Fonts.serif, fontSize: TypeSize.h1, color: Colors.goldBright, letterSpacing: Tracking.logo },
  headerSub: { fontFamily: Fonts.sansMedium, fontWeight: "500", fontSize: TypeSize.body, color: "rgba(255,255,255,0.4)", letterSpacing: Tracking.label, marginTop: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginTop: Spacing.lg,
  },
  searchPlaceholder: { fontFamily: Fonts.sans, fontSize: TypeSize.body, color: "rgba(255,255,255,0.25)" },
  // Body
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  sectionHeadLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.body, color: Colors.ink },
  badge: {
    backgroundColor: Colors.gold,
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.small, color: Colors.obsidian },
  // Requests
  requestsWrap: { gap: Spacing.sm, marginBottom: Spacing.lg },
  emptyText: { fontFamily: Fonts.sans, fontSize: TypeSize.caption, color: Colors.inkFaint, textAlign: "center", marginVertical: Spacing.md },
  requestCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.md,
  },
  requestLeft: { flexDirection: "row", gap: Spacing.sm },
  requestAvatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: Colors.paperAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  requestAvatarText: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.body, color: Colors.ink },
  requestInfo: { flex: 1, gap: 1 },
  requestFirm: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.caption, color: Colors.ink },
  requestDetail: { fontFamily: Fonts.sans, fontSize: TypeSize.caption, color: Colors.inkSoft },
  requestTime: { fontFamily: Fonts.sans, fontSize: TypeSize.small, color: Colors.inkFaint, marginTop: 2 },
  requestActions: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.sm },
  requestReject: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.hairlineStrong,
  },
  requestRejectText: { fontFamily: Fonts.sansMedium, fontWeight: "500", fontSize: TypeSize.caption, color: Colors.inkSoft },
  requestApprove: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: Colors.goldFaint,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  requestApproveText: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.caption, color: Colors.ink },
  requestStatus: { fontFamily: Fonts.sansMedium, fontWeight: "500", fontSize: TypeSize.caption, color: Colors.inkFaint, textAlign: "center", marginTop: Spacing.sm },
  requestStatusApproved: { color: Colors.success },
  // Members
  membersTitle: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.body, color: Colors.ink, marginBottom: Spacing.sm },
  memberCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  memberTop: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: Colors.paperAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.body, color: Colors.ink },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.body, color: Colors.ink },
  memberMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  memberStar: { fontSize: TypeSize.caption, color: Colors.gold },
  memberMeta: { fontFamily: Fonts.sans, fontSize: TypeSize.small, color: Colors.inkSoft },
  memberMetaDot: { fontFamily: Fonts.sans, fontSize: TypeSize.small, color: Colors.inkFaint },
  memberPosition: { fontFamily: Fonts.sansMedium, fontWeight: "500", fontSize: TypeSize.small, color: Colors.inkFaint, marginTop: 1 },
  talepBtn: {
    backgroundColor: Colors.goldFaint,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  talepBtnText: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.caption, color: Colors.ink, letterSpacing: Tracking.tight },
  // Invite card
  inviteCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.goldFaint,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.gold,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  inviteCardLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  inviteCardTitle: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.body, color: Colors.ink },
  inviteCardSub: { fontFamily: Fonts.sans, fontSize: TypeSize.caption, color: Colors.inkSoft, marginTop: 1 },
  inviteCardBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  // Talep Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    backgroundColor: Colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl + 20,
    paddingTop: Spacing.sm,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.hairlineStrong,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  modalTitle: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.h3, color: Colors.ink },
  modalTarget: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.paperAlt,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modalTargetAvatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: Colors.goldFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTargetAvatarText: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.body, color: Colors.ink },
  modalTargetName: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.body, color: Colors.ink },
  talepTypeRow: { flexDirection: "row", gap: 10, marginBottom: Spacing.lg },
  talepTypeChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.hairlineStrong,
  },
  talepTypeChipActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  talepTypeText: { fontFamily: Fonts.sansMedium, fontWeight: "500", fontSize: TypeSize.body, color: Colors.inkSoft },
  talepTypeTextActive: { color: Colors.paper },
  talepLabel: { fontFamily: Fonts.sansMedium, fontWeight: "500", fontSize: TypeSize.caption, color: Colors.inkSoft, marginBottom: Spacing.xs },
  talepMetalRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: Spacing.lg },
  talepMetalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.hairlineStrong,
  },
  talepMetalChipActive: { backgroundColor: Colors.goldFaint, borderColor: Colors.gold },
  talepMetalText: { fontFamily: Fonts.sansMedium, fontWeight: "500", fontSize: TypeSize.caption, color: Colors.inkSoft },
  talepMetalTextActive: { color: Colors.ink },
  talepInput: {
    borderWidth: 1,
    borderColor: Colors.hairlineStrong,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: Fonts.sans,
    fontSize: TypeSize.body,
    color: Colors.ink,
    marginBottom: Spacing.lg,
  },
  talepSubmit: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.pill,
    paddingVertical: 14,
    alignItems: "center",
  },
  talepSubmitText: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.body, color: Colors.paper, letterSpacing: 0.5 },
})
