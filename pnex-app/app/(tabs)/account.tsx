import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Alert } from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { Colors, Fonts, Spacing, Radius, Tracking, TypeSize } from "@/constants/theme"
import { Divider } from "@/components/Divider"
import { useAuth } from "@/contexts/AuthContext"

const ROWS: { icon: keyof typeof Ionicons.glyphMap; label: string; hint?: string }[] = [
  { icon: "person-circle-outline", label: "Profili Düzenle" },
  { icon: "key-outline", label: "Gizlilik & Güvenlik", hint: "Şifreli" },
  { icon: "mail-open-outline", label: "Davetiyelerim", hint: "2 kaldı" },
  { icon: "ribbon-outline", label: "Üyelik Kademesi", hint: "Kurucu" },
  { icon: "notifications-outline", label: "Bildirimler" },
  { icon: "help-buoy-outline", label: "Danışman Desteği" },
]

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Account() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [showInvites, setShowInvites] = useState(false)
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
        {/* Dark profile header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
          <LinearGradient
            colors={[Colors.onyx, Colors.obsidian]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user ? getInitials(user.name) : '?'}</Text>
            </View>
            <View style={styles.flex}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{user?.name || '—'}</Text>
                <Ionicons name="checkmark-circle" size={18} color={Colors.goldBright} />
              </View>
              <Text style={styles.handle}>@{user?.handle || '—'} · Üye No. {String(user?.memberNo || '—').padStart(4, '0')}</Text>
              <View style={styles.tierBadge}>
                <Ionicons name="diamond" size={10} color={Colors.obsidian} />
                <Text style={styles.tierText}>{(user?.tier || 'MEMBER').replace('_', ' ')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>180</Text>
              <Text style={styles.statLabel}>Bağlantılar</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>09</Text>
              <Text style={styles.statLabel}>İşlemler</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Güven Puanı</Text>
            </View>
          </View>
        </View>

        {/* Light settings body */}
        <View style={styles.body}>
          <View style={styles.dividerWrap}>
            <Divider label="Hesap" />
          </View>

          <View style={styles.menu}>
            {ROWS.map((r, i) => (
              <Pressable
                key={r.label}
                style={[styles.row, i < ROWS.length - 1 && styles.rowBorder]}
                onPress={r.label === "Davetiyelerim" ? () => setShowInvites(true) : undefined}
              >
                <View style={styles.rowIcon}>
                  <Ionicons name={r.icon} size={19} color={Colors.ink} />
                </View>
                <Text style={styles.rowLabel}>{r.label}</Text>
                {r.hint ? <Text style={styles.rowHint}>{r.hint}</Text> : null}
                <Ionicons name="chevron-forward" size={17} color={Colors.inkFaint} />
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.signOut} onPress={async () => {
            await logout()
            router.replace("/(auth)/login")
          }}>
            <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
            <Text style={styles.signOutText}>Çıkış Yap</Text>
          </Pressable>

          <Text style={styles.version}>PNEX · Özel Ağ Borsası · v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Invite modal */}
      <Modal visible={showInvites} transparent animationType="slide" onRequestClose={() => setShowInvites(false)}>
        <View style={styles.inviteOverlay}>
          <View style={styles.inviteSheet}>
            <View style={styles.inviteHandle} />
            <View style={styles.inviteHead}>
              <Text style={styles.inviteTitle}>Davetiyelerim</Text>
              <Pressable onPress={() => setShowInvites(false)}>
                <Ionicons name="close" size={22} color={Colors.ink} />
              </Pressable>
            </View>

            <View style={styles.inviteCard}>
              <View style={styles.inviteCardRow}>
                <Text style={styles.inviteCardLabel}>Kalan Davet Hakkı</Text>
                <Text style={styles.inviteCardValue}>2</Text>
              </View>
              <View style={styles.inviteDivider} />
              <View style={styles.inviteCardRow}>
                <Text style={styles.inviteCardLabel}>Toplam Kota</Text>
                <Text style={styles.inviteCardValue}>5</Text>
              </View>
            </View>

            <Text style={styles.inviteCodeLabel}>Davet Kodun</Text>
            <View style={styles.inviteCodeRow}>
              <View style={styles.inviteCodeBox}>
                <Text style={styles.inviteCodeText}>PNEX-ABCD-12</Text>
              </View>
              <Pressable style={styles.inviteCopyBtn}>
                <Ionicons name="copy-outline" size={18} color={Colors.ink} />
              </Pressable>
            </View>

            <Text style={styles.inviteHint}>
              Davet kodunu güvendiğin bir işletme ile paylaş. Kod kullanıldıkça kotan düşer.
            </Text>

            <Pressable style={styles.inviteShareBtn}>
              <Ionicons name="share-outline" size={18} color={Colors.paper} />
              <Text style={styles.inviteShareText}>Kodu Paylaş</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  profileRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: Colors.white, fontFamily: Fonts.serifBold, fontSize: 22 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontFamily: Fonts.serifBold, fontSize: 22, color: Colors.white },
  handle: { fontFamily: Fonts.sans, fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },
  tierText: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: 9, letterSpacing: 1, color: Colors.goldBright },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(201,162,75,0.2)",
    paddingVertical: Spacing.md,
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontFamily: Fonts.serifBold, fontSize: 20, color: Colors.white },
  statLabel: { fontFamily: Fonts.sans, fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: "rgba(201,162,75,0.2)" },
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  dividerWrap: { marginVertical: Spacing.md },
  menu: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.hairline,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: 15 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.hairline },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Colors.paperAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontFamily: Fonts.sansMedium, fontWeight: "500", fontSize: 15, color: Colors.ink },
  rowHint: { fontFamily: Fonts.sansMedium, fontWeight: "500", fontSize: 12, color: Colors.goldDeep, marginRight: 6 },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(168,57,47,0.3)",
  },
  signOutText: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: 14, color: Colors.danger },
  version: {
    textAlign: "center",
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.inkFaint,
    marginTop: Spacing.lg,
    letterSpacing: 0.5,
  },
  // Invite modal
  inviteOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  inviteSheet: {
    backgroundColor: Colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl + 20,
    paddingTop: Spacing.sm,
  },
  inviteHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.hairlineStrong,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  inviteHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  inviteTitle: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.h3, color: Colors.ink },
  inviteCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  inviteCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inviteCardLabel: { fontFamily: Fonts.sans, fontSize: TypeSize.body, color: Colors.inkSoft },
  inviteCardValue: { fontFamily: Fonts.serifBold, fontSize: TypeSize.h2, color: Colors.goldDeep },
  inviteDivider: { height: 1, backgroundColor: Colors.hairline, marginVertical: Spacing.md },
  inviteCodeLabel: { fontFamily: Fonts.sansMedium, fontWeight: "500", fontSize: TypeSize.caption, color: Colors.inkSoft, marginBottom: Spacing.xs },
  inviteCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: Spacing.md,
  },
  inviteCodeBox: {
    flex: 1,
    backgroundColor: Colors.paperAlt,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.hairlineStrong,
    padding: Spacing.md,
  },
  inviteCodeText: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.body, color: Colors.ink, letterSpacing: 1.5 },
  inviteCopyBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.paperAlt,
    borderWidth: 1,
    borderColor: Colors.hairlineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteHint: {
    fontFamily: Fonts.sans,
    fontSize: TypeSize.small,
    color: Colors.inkFaint,
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  inviteShareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.goldDeep,
    borderRadius: Radius.pill,
    paddingVertical: 14,
  },
  inviteShareText: { fontFamily: Fonts.sansSemibold, fontWeight: "600", fontSize: TypeSize.body, color: Colors.paper },
})
