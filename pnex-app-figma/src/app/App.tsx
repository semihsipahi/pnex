// PNEX — Private Network Exchange
// Premium redesign — real brand assets, luxury aesthetic

import { useState, useEffect, useRef, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, LayoutGrid, Users, User, Plus, Shield, ChevronRight,
  Lock, Mail, Trophy, Clock, ArrowLeft, Copy, Share2,
  LogOut, Search, Check, X as XIcon, Filter, Eye,
  Pen, Award, Smartphone,
} from "lucide-react";
import pnexLogoImg1 from "../imports/pnex-logo-1.png";
import appIconImg from "../imports/app_icon.png";

// ─── Palette ─────────────────���────────────────────────────────
const C = {
  bg: "#000000",
  bgSoft: "#0A0A0A",
  onyx: "#080808",
  onyxCard: "#0D0D0D",
  gold: "#D4AF37",
  goldBright: "#F3E5AB",
  goldDeep: "#997A15",
  goldFaint: "rgba(212,175,55,0.08)",
  paper: "#0A0A0A",
  ink: "#FFFFFF",
  inkSoft: "#A1A1AA",
  inkFaint: "#71717A",
  hairline: "rgba(255,255,255,0.05)",
  hairlineStrong: "rgba(255,255,255,0.1)",
  success: "#34D399",
  successFaint: "rgba(52,211,153,0.1)",
  danger: "#EF4444",
  dangerFaint: "rgba(239,68,68,0.1)",
};

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SYS = "system-ui, -apple-system, sans-serif";

type Screen = "splash" | "login" | "gate" | "verify" | "app";
type Tab = "duvar" | "ag" | "hesap";

interface Deal {
  id: number;
  type: "buy" | "sell";
  firm: string;
  initials: string;
  amount: string;
  metal: string;
  price: string;
  premium: string;
  timerSec: number;
  tier: "gold" | "diamond" | "platinum";
  expired?: boolean;
  winner?: string;
  own?: boolean;
}

const DEALS: Deal[] = [
  { id: 1, type: "buy",  firm: "ALTINBAŞ KUYUMCULUK", initials: "AK", amount: "2.500", metal: "Has Altın", price: "₺3.842", premium: "₺3.920", timerSec: 754,  tier: "diamond" },
  { id: 2, type: "sell", firm: "DEMİR SARRAF",         initials: "DS", amount: "500",   metal: "22 Ayar",  price: "₺3.720", premium: "₺3.800", timerSec: 261,  tier: "gold" },
  { id: 3, type: "buy",  firm: "KAPALI ÇARŞI GOLD",    initials: "KG", amount: "1.200", metal: "Has Altın", price: "₺3.858", premium: "₺3.940", timerSec: 1842, tier: "platinum" },
  { id: 4, type: "sell", firm: "BOSPHORUS EXCHANGE",    initials: "BE", amount: "750",   metal: "Has Altın", price: "₺3.831", premium: "₺3.910", timerSec: 0,    tier: "gold", expired: true, winner: "ALTINBAŞ K." },
  { id: 5, type: "buy",  firm: "GRAND BAZAAR SARRAF",   initials: "GB", amount: "3.000", metal: "22 Ayar",  price: "₺3.680", premium: "₺3.760", timerSec: 520,  tier: "diamond", own: true },
];

const MEMBERS = [
  { id: 1, name: "Ahmet Yıldız",  firm: "ALTIN SARAY",   trust: 4.9, limit: "50 kg", trades: 247, shared: 12, net: "+350gr Has",    netColor: C.success },
  { id: 2, name: "Mehmet Demir",  firm: "DEMİR KUYUM",   trust: 4.7, limit: "30 kg", trades: 183, shared: 8,  net: "-180gr Has",   netColor: C.danger },
  { id: 3, name: "Hasan Altın",   firm: "ALTINGOLD",      trust: 4.8, limit: "40 kg", trades: 312, shared: 15, net: "$0",           netColor: C.inkFaint },
  { id: 4, name: "İbrahim Sarı",  firm: "GRAND SARRAF",   trust: 4.6, limit: "25 kg", trades: 98,  shared: 6,  net: "+1.200gr Has", netColor: C.success },
];

const REQS = [
  { id: 1, firm: "ALTIN SARAY", type: "AL", amount: "500 gr",  metal: "Has Altın", time: "2dk önce" },
  { id: 2, firm: "DEMİR KUYUM", type: "SAT", amount: "250 gr", metal: "22 Ayar",  time: "15dk önce" },
];

function fmt(s: number) {
  if (s <= 0) return "00:00";
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// Web Vibration API — native haptic hissi
const haptic = (ms: number | number[] = 10) => {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch {} // eslint-disable-line
};

// ─── Shared UI ────────────────────────────────────────────────
function GoldButton({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={disabled ? undefined : () => { haptic(12); onClick(); }}
      style={{
        width: "100%", height: 56, borderRadius: 999, border: "none",
        background: disabled
          ? "rgba(255,255,255,0.05)"
          : `linear-gradient(90deg, ${C.goldDeep} 0%, ${C.gold} 45%, ${C.goldBright} 100%)`,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: disabled ? "none" : `0 6px 28px rgba(201,162,75,0.38)`,
        flexShrink: 0,
      }}
    >
      <span style={{
        fontFamily: SYS, fontSize: 13, fontWeight: 700, letterSpacing: 2.2,
        color: disabled ? "rgba(255,255,255,0.18)" : C.bg,
        textTransform: "uppercase",
      }}>{label}</span>
    </motion.button>
  );
}

function TierBadge({ tier }: { tier: "gold" | "diamond" | "platinum" }) {
  const cfg = { gold: { s: "★", c: C.gold }, diamond: { s: "◆", c: "#A8D8F0" }, platinum: { s: "◈", c: "#DCDCDC" } }[tier];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      background: `${cfg.c}14`, border: `1px solid ${cfg.c}38`,
      borderRadius: 999, padding: "2px 8px",
      fontFamily: SYS, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, color: cfg.c,
    }}>
      <span style={{ fontSize: 7 }}>{cfg.s}</span>
      {tier === "gold" ? "GOLD" : tier === "diamond" ? "DİAMOND" : "PLATİN"}
    </span>
  );
}

function StatusBar({ light = false }: { light?: boolean }) {
  const col = light ? C.inkSoft : "rgba(255,255,255,0.45)";
  return (
    <div style={{
      height: 44, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 22px", flexShrink: 0,
    }}>
      <span style={{ fontFamily: SYS, fontSize: 15, fontWeight: 600, color: col }}>9:41</span>
      <span style={{ fontFamily: SYS, fontSize: 11, color: col }}>▂▄▆ WiFi 87%</span>
    </div>
  );
}

// ─── Screen root helper — fills PhoneFrame absolutely ─────────
const screenStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
  overflow: "hidden",
  ...extra,
});

// ─── TITANIUM CLASP — precision connector between E and X ─────
// ─── SPLASH ────────────────────────────────────────────────────
// ─── Parıltı şeridi — logo üzerinden geçen ince beyaz ışık ───
interface StreakCfg { delay: number; dur: number; top: string; h: number; op: number; angle?: number }
const STREAKS: StreakCfg[] = [
  { delay: 1.80, dur: 1.40, top: "37%", h: 1.5, op: 0.72, angle: 6  },
  { delay: 2.20, dur: 1.80, top: "41%", h: 3.0, op: 0.55, angle: 8  },
  { delay: 2.50, dur: 1.10, top: "44%", h: 1.0, op: 0.90, angle: 5  }, // en keskin
  { delay: 2.90, dur: 1.55, top: "47%", h: 2.5, op: 0.62, angle: 10 },
  { delay: 3.40, dur: 1.30, top: "43%", h: 1.2, op: 0.80, angle: 7  }, // son flaş
];

function LightStreak({ delay, dur, top, h, op, angle = 8 }: StreakCfg) {
  return (
    <motion.div
      initial={{ x: -520 }}
      animate={{ x: 920 }}
      transition={{ delay, duration: dur, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        position: "absolute", top,
        left: 0, width: "100%", height: h,
        background: `linear-gradient(90deg,
          transparent           0%,
          rgba(255,255,255,0.00) 18%,
          rgba(255,255,255,${op * 0.45}) 36%,
          rgba(255,255,255,${op}) 50%,
          rgba(255,255,255,${op * 0.45}) 64%,
          rgba(255,255,255,0.00) 82%,
          transparent          100%)`,
        transform: `rotate(${angle}deg)`,
        transformOrigin: "center",
        filter: `blur(${h > 2 ? 0.6 : 0.2}px)`,
        boxShadow: `0 0 ${h * 4}px ${h * 2}px rgba(255,255,255,${op * 0.25})`,
        mixBlendMode: "screen" as React.CSSProperties["mixBlendMode"],
        pointerEvents: "none", zIndex: 12,
      }}
    />
  );
}

// ─── SPLASH ────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [vault, setVault] = useState(false); // kasadan açılma efekti

  useEffect(() => {
    haptic([10, 30, 15]);
    // Parıltılar bitince kasayı aç
    const tVault = setTimeout(() => {
      setVault(true);
      haptic([12, 60, 20]);
    }, 4200);
    const tDone = setTimeout(onDone, 5600);
    return () => { clearTimeout(tVault); clearTimeout(tDone); };
  }, [onDone]);

  // Kasadan açılma easing — kapı menteşesi gibi
  const vaultEase = [0.76, 0, 0.24, 1] as number[];

  // Her yarı için görsel slice
  const sliceImg = (half: "top" | "bottom"): React.CSSProperties => ({
    position: "absolute",
    [half === "top" ? "top" : "bottom"]: 0,
    left: 0, width: "100%", height: "200%",
    objectFit: "cover",
    objectPosition: "center center",
    display: "block",
  });

  return (
    <motion.div
      key="splash"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.01 }} // anlık — kasadan çıktıktan sonra
      style={screenStyle({ background: "#000" })}
    >
      {/* ── Karanlıktan yavaş açılma — siyah örtü yavaşça çekilir ── */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2.8, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: 0,
          background: "#000",
          pointerEvents: "none", zIndex: 25,
        }}
      />

      {/* ── ÜST YARI — kasadan açılınca yukarı çıkar ── */}
      <motion.div
        animate={{ y: vault ? "-100%" : "0%" }}
        transition={{ duration: 1.40, ease: vaultEase }}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "50%",
          overflow: "hidden",
        }}
      >
        <img src={pnexLogoImg1} alt="PNEX" style={sliceImg("top")} />
      </motion.div>

      {/* ── ALT YARI — kasadan açılınca aşağı iner ── */}
      <motion.div
        animate={{ y: vault ? "100%" : "0%" }}
        transition={{ duration: 1.40, ease: vaultEase }}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
          overflow: "hidden",
        }}
      >
        <img src={pnexLogoImg1} alt="" style={sliceImg("bottom")} />
      </motion.div>

      {/* ── PARİLTI ŞERİTLERİ — tam ekran, logo üzerinde ── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 10 }}>
        {STREAKS.map((s, i) => <LightStreak key={i} {...s} />)}
      </div>

      {/* ── KASA AÇILMA IŞIK ÇIZGISI — ortada belirir ── */}
      <motion.div
        animate={{
          opacity: vault ? [0, 1, 0.7, 0] : 0,
          scaleX: vault ? [0, 1, 1, 1] : 0,
        }}
        transition={{ duration: 1.10, times: [0, 0.06, 0.65, 1] }}
        style={{
          position: "absolute", top: "50%", left: 0, right: 0,
          height: 1.5, transformOrigin: "center",
          transform: "translateY(-50%)",
          background: "linear-gradient(90deg, transparent 0%, rgba(201,162,75,0.55) 15%, rgba(255,255,255,0.95) 50%, rgba(201,162,75,0.55) 85%, transparent 100%)",
          boxShadow: "0 0 18px 6px rgba(201,162,75,0.30), 0 0 4px 1px rgba(255,255,255,0.7)",
          zIndex: 20, pointerEvents: "none",
        }}
      />

      {/* ── ENCRYPTED tagline ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: vault ? 0 : 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        style={{
          position: "absolute", bottom: "9%", left: 0, right: 0,
          textAlign: "center", pointerEvents: "none", zIndex: 5,
          fontFamily: SYS, fontSize: 10, fontWeight: 500,
          letterSpacing: "0.38em", color: "rgba(255,255,255,0.28)",
        }}
      >
        INVITATION ONLY
      </motion.div>
    </motion.div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────
function LoginScreen({ onDirect, onGate }: { onDirect: () => void; onGate: (p: string) => void }) {
  const [phone, setPhone] = useState("");
  const [focused, setFocused] = useState(false);
  useEffect(() => { haptic([8, 40, 12]); }, []);

  const handleSubmit = () => {
    if (phone === "5555555555") {
      haptic([10, 40, 20]);
      onDirect();
    } else {
      haptic([10, 30, 10]);
      onGate(phone);
    }
  };

  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, scale: 0.94, y: 28 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={screenStyle({ background: C.bg })}
    >
      {/* Tam ekran arka plan görseli */}
      <img
        src={pnexLogoImg1}
        alt="PNEX"
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          display: "block",
        }}
      />

      {/* Form alanı için alt gradient karartma */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0, height: "55%",
        background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.92) 40%, #000000 70%)",
        pointerEvents: "none",
      }} />

      {/* Form overlay */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        padding: "0 28px 54px",
        zIndex: 2,
        display: "flex", flexDirection: "column",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <div style={{
            fontFamily: SYS, fontSize: 10, fontWeight: 600, letterSpacing: 2.5,
            color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 12,
          }}>
            Telefon Numarası
          </div>

          <div style={{
            height: 60, background: "rgba(255,255,255,0.03)",
            borderBottom: `1px solid ${focused ? C.gold : "rgba(255,255,255,0.15)"}`,
            display: "flex", alignItems: "center",
            position: "relative",
            transition: "border-color 0.4s",
            marginBottom: 28,
          }}>
            <span style={{
              padding: "0 16px 0 8px",
              fontFamily: SYS, fontSize: 18, fontWeight: 400,
              letterSpacing: 2, color: C.gold, flexShrink: 0,
            }}>+90</span>
            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
            <input
              autoFocus
              type="tel"
              maxLength={10}
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="5XX XXX XX XX"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontFamily: SYS, fontSize: 20, fontWeight: 300,
                letterSpacing: 3, color: "white", padding: "0 16px",
              }}
            />
          </div>

          <GoldButton label="İlerle" onClick={handleSubmit} disabled={phone.length < 10} />

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, marginTop: 24,
          }}>
            <Lock size={12} color="rgba(255,255,255,0.3)" />
            <span style={{ fontFamily: SYS, fontSize: 9, fontWeight: 500, letterSpacing: 2, color: "rgba(255,255,255,0.3)" }}>
              UÇTAN UCA ŞİFRELİ · DAVETİYE İLE
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── GATE — Premium davetiye kodu ekranı ─────────────────────
function GateScreen({ onNext, onBack }: { onNext: (c: string) => void; onBack: () => void }) {
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const cellSize = { w: 48, h: 62 };
  const ready = code.length === 6;

  return (
    <motion.div
      key="gate"
      initial={{ opacity: 0, scale: 0.96, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -16 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      style={screenStyle({ display: "flex", flexDirection: "column" })}
    >
      {/* Saf siyah zemin */}
      <div style={{ position: "absolute", inset: 0, background: "#000" }} />

      {/* ── Logo hero — ekranın üst %44'ünü kaplar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "44%",
          overflow: "hidden", zIndex: 1,
        }}
      >
        <img
          src={pnexLogoImg1}
          alt="PNEX"
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: "center 38%",
            display: "block",
          }}
        />
        {/* Aşağıya doğru siyaha geçiş */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "88%",
          background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 40%, #000 100%)",
          pointerEvents: "none",
        }} />
      </motion.div>

      {/* ── Geri butonu — logo üzerinde ── */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onBack}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{
          position: "absolute", top: 56, left: 24, zIndex: 10,
          width: 38, height: 38, borderRadius: 19,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.35)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <ArrowLeft size={16} color="rgba(255,255,255,0.6)" />
      </motion.button>

      {/* ── Alt içerik bölümü ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "0 28px 44px",
        display: "flex", flexDirection: "column", alignItems: "center",
        zIndex: 2,
      }}>

        {/* Rozet */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.65 }}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            border: "1px solid rgba(201,162,75,0.28)",
            borderRadius: 999, padding: "6px 14px",
            background: "rgba(201,162,75,0.07)",
            marginBottom: 18,
          }}
        >
          <Shield size={10} color={C.gold} />
          <span style={{ fontFamily: SYS, fontSize: 9, fontWeight: 700, letterSpacing: 2.5, color: C.gold, textTransform: "uppercase" }}>
            Sadece Üyeler · Davetiye İle
          </span>
        </motion.div>

        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.65 }}
          style={{ textAlign: "center", marginBottom: 8 }}
        >
          <div style={{ fontFamily: SYS, fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.01em" }}>
            Davetiye Kodunuz
          </div>
          <div style={{ fontFamily: SYS, fontSize: 12, color: "rgba(255,255,255,0.30)", marginTop: 6, lineHeight: 1.65 }}>
            Size özel 6 haneli davetiye kodunu girin.
          </div>
        </motion.div>

        {/* İnce altın separator */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.7, ease: "easeOut" }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", marginBottom: 24,
          }}
        >
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(201,162,75,0.15))" }} />
          <div style={{ width: 4, height: 4, borderRadius: 2, background: "rgba(201,162,75,0.38)" }} />
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(201,162,75,0.15))" }} />
        </motion.div>

        {/* 6 hücreli kod girişi */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.65 }}
          style={{ position: "relative", width: "100%", marginBottom: 24 }}
          onClick={() => inputRef.current?.focus()}
        >
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {Array(6).fill(0).map((_, i) => {
              const filled = i < code.length;
              const active = i === code.length;
              return (
                <div key={i} style={{
                  width: cellSize.w, height: cellSize.h,
                  background: filled ? "rgba(201,162,75,0.08)" : active ? "rgba(201,162,75,0.04)" : "rgba(255,255,255,0.025)",
                  border: `1px solid ${filled ? "rgba(201,162,75,0.55)" : active ? "rgba(201,162,75,0.45)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                  transition: "all 0.22s",
                  boxShadow: active ? "0 0 0 1px rgba(201,162,75,0.14), 0 4px 14px rgba(201,162,75,0.10)" : "none",
                }}>
                  {(active || filled) && (
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 1,
                      background: `linear-gradient(90deg, transparent, ${filled ? "rgba(201,162,75,0.55)" : C.gold}, transparent)`,
                    }} />
                  )}
                  {filled ? (
                    <motion.span
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
                      style={{ fontFamily: SYS, fontSize: 20, fontWeight: 700, color: C.goldBright }}
                    >{code[i]}</motion.span>
                  ) : active ? (
                    <motion.div
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 1.1 }}
                      style={{ width: 1.5, height: 20, background: C.gold, borderRadius: 1 }}
                    />
                  ) : (
                    <div style={{ width: 5, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.05)" }} />
                  )}
                </div>
              );
            })}
          </div>
          <input
            ref={inputRef}
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
            style={{ position: "absolute", opacity: 0, top: 0, left: 0, width: "100%", height: "100%", cursor: "text" }}
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          style={{ width: "100%", marginBottom: 20 }}
        >
          <GoldButton label="Erişim Talebi" onClick={() => onNext(code)} disabled={!ready} />
        </motion.div>

        {/* Alt link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.7 }}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <span style={{ fontFamily: SYS, fontSize: 11, color: "rgba(255,255,255,0.18)" }}>Davetiyeniz yok mu?</span>
          <span style={{ fontFamily: SYS, fontSize: 11, color: "rgba(201,162,75,0.55)", cursor: "pointer" }}>
            Bekleme listesine katıl →
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── VERIFY (OTP) ─────────────────────────────────────────────
function VerifyScreen({ onNext, onBack, phone }: { onNext: () => void; onBack: () => void; phone: string }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(42);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const put = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const n = [...otp]; n[i] = d; setOtp(n);
    if (d && i < 3) refs.current[i + 1]?.focus();
  };

  const del = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <motion.div
      key="verify"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.38, ease: [0.32, 0, 0.67, 0] }}
      style={screenStyle({
        background: C.bg,
        display: "flex", flexDirection: "column",
      })}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 240, background: "linear-gradient(to bottom, rgba(201,162,75,0.14) 0%, transparent 100%)", pointerEvents: "none" }} />

      <StatusBar />

      <div style={{ padding: "0 22px 12px" }}>
        <motion.button whileTap={{ scale: 0.88 }} onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={17} color="rgba(255,255,255,0.6)" />
        </motion.button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", gap: 28 }}>
        {/* Icon */}
        <div style={{ width: 68, height: 68, borderRadius: 34, border: `1px solid ${C.gold}40`, background: C.goldFaint, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Smartphone size={26} color={C.gold} />
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: "white" }}>Kimliğini Doğrula</div>
          <div style={{ fontFamily: SYS, fontSize: 13, color: "rgba(255,255,255,0.36)", marginTop: 8, lineHeight: 1.7 }}>
            +90 {phone.slice(0, 3)} *** ** {phone.slice(-2)} numarasına<br />4 haneli doğrulama kodu gönderildi.
          </div>
        </div>

        {/* OTP boxes */}
        <div style={{ display: "flex", gap: 14 }}>
          {otp.map((d, i) => (
            <div key={i} style={{ width: 64, height: 72, background: d ? `${C.gold}10` : "rgba(255,255,255,0.03)", border: `1px solid ${d ? `${C.gold}55` : "rgba(255,255,255,0.09)"}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <input ref={el => { refs.current[i] = el; }} type="tel" maxLength={1} value={d} onChange={e => put(i, e.target.value)} onKeyDown={e => del(i, e)}
                style={{ position: "absolute", opacity: 0, inset: 0, cursor: "text" }} />
              {d
                ? <span style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: C.goldBright }}>{d}</span>
                : <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 1.5, height: 28, background: `${C.gold}55`, borderRadius: 1 }} />}
            </div>
          ))}
        </div>

        <div style={{ fontFamily: SYS, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
          {timer > 0
            ? <span>Kod geçerlilik süresi: <span style={{ color: C.gold, fontWeight: 700 }}>{timer}sn</span></span>
            : <span style={{ color: C.goldBright, cursor: "pointer", textDecoration: "underline" }} onClick={() => setTimer(42)}>Kodu yeniden gönder</span>}
        </div>

        <GoldButton label="Onayla ve Gir" onClick={onNext} disabled={!otp.every(d => d)} />
      </div>
    </motion.div>
  );
}

// ─── DEAL CARD (premium redesign) ────────────────────────────
function DealCard({ deal, timerSec }: { deal: Deal; timerSec: number }) {
  const isBuy = deal.type === "buy";
  const accent = isBuy ? C.success : C.gold;
  const urgent = !deal.expired && timerSec > 0 && timerSec < 300;
  const timerCol = urgent ? C.danger : "rgba(255,255,255,0.45)";
  const pct = deal.timerSec > 0 ? Math.min(100, (timerSec / deal.timerSec) * 100) : 0;

  return (
    <motion.div
      whileTap={deal.expired || deal.own ? {} : { scale: 0.988 }}
      style={{
        background: C.onyxCard,
        borderRadius: 20, marginBottom: 10,
        border: "1px solid rgba(255,255,255,0.055)",
        opacity: deal.expired ? 0.45 : 1,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      {!deal.expired && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: urgent
            ? `linear-gradient(90deg, ${C.danger} ${pct}%, rgba(168,57,47,0.15) ${pct}%)`
            : `linear-gradient(90deg, ${accent} ${pct}%, rgba(255,255,255,0.06) ${pct}%)`,
          transition: "all 1s linear",
        }} />
      )}

      <div style={{ padding: "16px 18px 18px" }}>
        {/* Row 1: firm + tier + timer */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
          {/* Avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: 15, flexShrink: 0,
            background: isBuy ? C.successFaint : C.goldFaint,
            border: `1px solid ${isBuy ? C.success : C.gold}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: SYS, fontSize: 9, fontWeight: 800,
            color: isBuy ? C.success : C.gold, letterSpacing: 0.5,
          }}>{deal.initials}</div>

          <span style={{ fontFamily: SYS, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.82)", flex: 1, letterSpacing: 0.2 }}>
            {deal.firm}
          </span>

          <TierBadge tier={deal.tier} />

          {!deal.expired && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <Clock size={10} color={timerCol} />
              <span style={{ fontFamily: SYS, fontSize: 12, fontWeight: 700, color: urgent ? C.danger : "rgba(255,255,255,0.45)", letterSpacing: 0.5 }}>
                {fmt(timerSec)}
              </span>
            </div>
          )}
        </div>

        {/* Row 2: type label */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: isBuy ? C.successFaint : `rgba(201,162,75,0.1)`,
            border: `1px solid ${isBuy ? C.success : C.gold}28`,
            borderRadius: 6, padding: "3px 10px",
          }}>
            <div style={{ width: 5, height: 5, borderRadius: 3, background: isBuy ? C.success : C.gold }} />
            <span style={{ fontFamily: SYS, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: isBuy ? C.success : C.gold }}>
              {isBuy ? "ALIYOR" : "SATIYOR"}
            </span>
          </div>
          <span style={{ fontFamily: SYS, fontSize: 11, color: "rgba(255,255,255,0.28)" }}>{deal.metal}</span>
        </div>

        {/* Row 3: amount + price */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 700, color: "white", lineHeight: 1, letterSpacing: "-0.5px" }}>
                {deal.amount}
              </span>
              <span style={{ fontFamily: SYS, fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>gr</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: C.goldBright, lineHeight: 1 }}>
              {deal.price}<span style={{ fontFamily: SYS, fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.28)", letterSpacing: 0 }}>/gr</span>
            </div>
            <div style={{ fontFamily: SYS, fontSize: 11, color: `${C.gold}55`, marginTop: 3 }}>
              hemen al {deal.premium}/gr
            </div>
          </div>
        </div>

        {/* Row 4: CTAs */}
        {deal.expired ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: SYS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.3)" }}>SÜRE DOLDU</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <Trophy size={12} color={C.gold} />
            <span style={{ fontFamily: SYS, fontSize: 12, fontWeight: 600, color: C.gold }}>{deal.winner}</span>
          </div>
        ) : deal.own ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: C.goldFaint, borderRadius: 10 }}>
            <Eye size={13} color={C.gold} />
            <span style={{ fontFamily: SYS, fontSize: 12, fontWeight: 600, color: C.gold, letterSpacing: 0.5 }}>Kendi İlanın</span>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button whileTap={{ scale: 0.95 }} style={{
              flex: 1, height: 42, borderRadius: 10, cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)",
              fontFamily: SYS, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)",
            }}>Teklif Ver</motion.button>

            <motion.button whileTap={{ scale: 0.95 }} style={{
              flex: 1.4, height: 42, borderRadius: 10, cursor: "pointer",
              background: isBuy ? C.successFaint : C.goldFaint,
              border: `1px solid ${isBuy ? C.success : C.gold}35`,
              fontFamily: SYS, fontSize: 13, fontWeight: 700,
              color: isBuy ? C.success : C.goldBright, letterSpacing: 0.3,
            }}>Hemen Al</motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── DUVAR TAB ────────────────────────────────────────────────
function DuvarTab() {
  const [timers, setTimers] = useState(() => Object.fromEntries(DEALS.map(d => [d.id, d.timerSec])));
  useEffect(() => {
    const iv = setInterval(() => setTimers(p => { const n = { ...p }; Object.keys(n).forEach(k => { if (n[+k] > 0) n[+k]--; }); return n; }), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Dark header */}
      <div style={{ background: `linear-gradient(180deg, ${C.onyx} 0%, ${C.bgSoft} 100%)`, flexShrink: 0 }}>
        <StatusBar />
        <div style={{ padding: "0 20px 18px" }}>
          {/* Brand row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <img src={pnexLogoImg1} alt="PNEX" style={{ height: 20, width: "auto", objectFit: "contain", marginBottom: 4 }} />
              <div style={{ fontFamily: SYS, fontSize: 8, letterSpacing: 3, color: `${C.gold}88`, marginTop: 2 }}>PRIVATE NETWORK</div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} style={{
              width: 40, height: 40, borderRadius: 20,
              border: `1px solid ${C.gold}38`, background: C.goldFaint,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            }}>
              <Bell size={17} color={C.gold} />
              <div style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: 4, background: C.danger, border: `1.5px solid ${C.bgSoft}` }} />
            </motion.button>
          </div>

          {/* Stats card */}
          <div style={{
            background: C.bg, borderRadius: 18, padding: "16px 18px",
            border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.goldDeep}, ${C.goldBright} 60%, transparent)` }} />
            <div style={{ fontFamily: SYS, fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>BUGÜNKÜ PİYASA</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 12 }}>
              <span style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 700, color: C.goldBright, lineHeight: 1 }}>₺2.4M</span>
              <div style={{ paddingBottom: 4 }}>
                <span style={{ fontFamily: SYS, fontSize: 12, fontWeight: 700, color: "#5CB85C" }}>+18%</span>
                <span style={{ fontFamily: SYS, fontSize: 11, color: "rgba(255,255,255,0.28)", marginLeft: 6 }}>dünden fazla</span>
              </div>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 0 }}>
              {[["24", "AKTİF EMİR"], ["18", "AKTİF ÜYE"], ["50 kg", "AĞ LİMİTİ"]].map(([v, l], i) => (
                <div key={i} style={{ flex: 1, borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none", paddingRight: i < 2 ? 12 : 0, paddingLeft: i > 0 ? 12 : 0 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{v}</div>
                  <div style={{ fontFamily: SYS, fontSize: 8, letterSpacing: 1.5, color: "rgba(255,255,255,0.22)", marginTop: 1 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable feed */}
      <div style={{
        flex: 1, overflowY: "auto", background: C.paper,
        borderRadius: "20px 20px 0 0", marginTop: -6,
        padding: "18px 14px 96px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 700, color: C.ink }}>Aktif Piyasa</div>
          <motion.div whileTap={{ scale: 0.93 }} style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.hairlineStrong}`, borderRadius: 999, padding: "6px 12px", cursor: "pointer" }}>
            <Filter size={12} color={C.inkSoft} />
            <span style={{ fontFamily: SYS, fontSize: 11, color: C.inkSoft }}>Filtrele</span>
          </motion.div>
        </div>
        {DEALS.map(d => <DealCard key={d.id} deal={d} timerSec={timers[d.id] ?? 0} />)}
      </div>
    </div>
  );
}

// ─── AĞ TAB ───────────────────────────────────────────────────
function AgTab() {
  const [showReqs, setShowReqs] = useState(true);
  const [rState, setRState] = useState<Record<number, "pending" | "ok" | "no">>({ 1: "pending", 2: "pending" });
  const [selected, setSelected] = useState<typeof MEMBERS[0] | null>(null);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ background: `linear-gradient(180deg, ${C.onyx} 0%, ${C.bgSoft} 100%)`, flexShrink: 0 }}>
        <StatusBar />
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <img src={pnexLogoImg1} alt="PNEX" style={{ height: 18, width: "auto", objectFit: "contain" }} />
            <span style={{ fontFamily: SYS, fontSize: 15, color: "rgba(255,255,255,0.38)" }}>Ağ</span>
          </div>
          <div style={{ height: 42, background: "rgba(255,255,255,0.05)", borderRadius: 999, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Search size={14} color="rgba(255,255,255,0.3)" />
            <span style={{ fontFamily: SYS, fontSize: 14, color: "rgba(255,255,255,0.25)" }}>Firma ara...</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: C.paper, borderRadius: "20px 20px 0 0", marginTop: -6, padding: "14px 14px 96px" }}>
        {/* Incoming requests */}
        <div style={{ background: C.onyxCard, borderRadius: 16, marginBottom: 10, border: `1px solid ${C.hairline}`, overflow: "hidden" }}>
          <motion.div whileTap={{ opacity: 0.7 }} onClick={() => setShowReqs(v => !v)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", cursor: "pointer" }}>
            <Mail size={15} color={C.inkSoft} />
            <span style={{ fontFamily: SYS, fontSize: 14, fontWeight: 700, color: C.ink, flex: 1 }}>Gelen Talepler</span>
            <div style={{ background: C.gold, borderRadius: 999, padding: "2px 8px", fontFamily: SYS, fontSize: 10, fontWeight: 800, color: "#000" }}>2</div>
            <span style={{ color: C.inkFaint, fontSize: 11, transition: "transform 0.2s", display: "inline-block", transform: showReqs ? "rotate(180deg)" : "none" }}>▼</span>
          </motion.div>
          {showReqs && REQS.map(r => (
            <div key={r.id} style={{ borderTop: `1px solid ${C.hairline}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: C.goldFaint, border: `1px solid ${C.gold}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SYS, fontSize: 10, fontWeight: 800, color: C.gold }}>{r.firm.slice(0, 2)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SYS, fontSize: 13, fontWeight: 700, color: C.ink }}>{r.firm}</div>
                <div style={{ fontFamily: SYS, fontSize: 11, color: C.inkFaint }}>
                  <span style={{ color: r.type === "AL" ? C.success : C.danger, fontWeight: 700 }}>{r.type}</span> · {r.amount} {r.metal} · {r.time}
                </div>
              </div>
              {rState[r.id] === "pending" ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <motion.button whileTap={{ scale: 0.88 }} onClick={() => setRState(p => ({ ...p, [r.id]: "no" }))} style={{ width: 32, height: 32, borderRadius: 16, border: `1px solid ${C.danger}44`, background: C.dangerFaint, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><XIcon size={13} color={C.danger} /></motion.button>
                  <motion.button whileTap={{ scale: 0.88 }} onClick={() => setRState(p => ({ ...p, [r.id]: "ok" }))} style={{ width: 32, height: 32, borderRadius: 16, border: `1px solid ${C.success}44`, background: C.successFaint, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={13} color={C.success} /></motion.button>
                </div>
              ) : (
                <span style={{ fontFamily: SYS, fontSize: 11, fontWeight: 700, color: rState[r.id] === "ok" ? C.success : C.danger }}>
                  {rState[r.id] === "ok" ? "✓ Onaylandı" : "✕ Reddedildi"}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Invite card */}
        <div style={{ background: `linear-gradient(135deg, rgba(201,162,75,0.09), rgba(201,162,75,0.05))`, border: `1px solid ${C.gold}28`, borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: C.goldFaint, border: `1px solid ${C.gold}40`, display: "flex", alignItems: "center", justifyContent: "center" }}><Mail size={15} color={C.gold} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SYS, fontSize: 13, fontWeight: 700, color: C.ink }}>Davet Et</div>
            <div style={{ fontFamily: SYS, fontSize: 11, color: C.inkFaint }}>Kodun: PNEX-ABCD-12 · 2 hakkın kaldı</div>
          </div>
          <motion.div whileTap={{ scale: 0.88 }} style={{ width: 30, height: 30, borderRadius: 15, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Plus size={15} color="#000" /></motion.div>
        </div>

        <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Network Üyeleri</div>

        {MEMBERS.map(m => (
          <div key={m.id} style={{ background: C.onyxCard, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.hairline}`, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: C.goldFaint, border: `1px solid ${C.gold}40`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: C.gold }}>
                {m.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SYS, fontSize: 14, fontWeight: 700, color: C.ink }}>{m.name}</div>
                <div style={{ fontFamily: SYS, fontSize: 11, color: C.inkFaint }}>★ {m.trust} · {m.limit} · {m.shared} ortak</div>
              </div>
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => setSelected(m)} style={{ border: `1px solid ${C.gold}50`, borderRadius: 999, padding: "5px 14px", background: "transparent", cursor: "pointer", fontFamily: SYS, fontSize: 12, fontWeight: 700, color: C.gold }}>Talep</motion.button>
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.hairline}`, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: SYS, fontSize: 10, color: C.inkFaint, letterSpacing: 0.5 }}>NET POZİSYON</span>
              <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: m.netColor }}>{m.net}</span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected && <TradeModal member={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── HESAP TAB ────────────────────────────────────────────────
function HesapTab({ onLogout }: { onLogout: () => void }) {
  const [showInvite, setShowInvite] = useState(false);
  const menu = [
    { I: Pen, label: "Profili Düzenle" },
    { I: Shield, label: "Gizlilik & Güvenlik" },
    { I: Mail, label: "Davetiyelerim", badge: "2", action: () => setShowInvite(true) },
    { I: Award, label: "Üyelik Kademesi" },
    { I: Bell, label: "Bildirimler" },
    { I: Users, label: "Danışman Desteği" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ background: `linear-gradient(180deg, ${C.onyx} 0%, ${C.bgSoft} 100%)`, flexShrink: 0 }}>
        <StatusBar />
        <div style={{ padding: "0 20px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 68, height: 68, borderRadius: 34, background: `linear-gradient(135deg, ${C.goldDeep}, ${C.goldBright})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: C.bg }}>MK</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: "white" }}>Mustafa Kaya</div>
            <div style={{ fontFamily: SYS, fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 3 }}>@mustafakaya · #PNX-0042</div>
          </div>
          <TierBadge tier="diamond" />
          <div style={{ display: "flex", marginTop: 6, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
            {[["48", "Bağlantı"], ["183", "İşlem"], ["4.9", "Güven"]].map(([v, l], i) => (
              <div key={i} style={{ padding: "10px 18px", textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: "white" }}>{v}</div>
                <div style={{ fontFamily: SYS, fontSize: 9, letterSpacing: 1.5, color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: C.paper, borderRadius: "20px 20px 0 0", marginTop: -6, padding: "14px 14px 96px" }}>
        <div style={{ background: C.onyxCard, borderRadius: 16, border: `1px solid ${C.hairline}`, overflow: "hidden", marginBottom: 14 }}>
          {menu.map((item, i) => (
            <motion.div key={i} whileTap={{ backgroundColor: "rgba(255,255,255,0.03)" }} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: i < menu.length - 1 ? `1px solid ${C.hairline}` : "none", cursor: item.action ? "pointer" : "default" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: C.goldFaint, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <item.I size={15} color={C.gold} />
              </div>
              <span style={{ fontFamily: SYS, fontSize: 14, color: C.ink, flex: 1, fontWeight: 500 }}>{item.label}</span>
              {item.badge && <div style={{ background: C.gold, borderRadius: 999, padding: "2px 8px", fontFamily: SYS, fontSize: 10, fontWeight: 800, color: "#000" }}>{item.badge}</div>}
              <ChevronRight size={15} color={C.inkFaint} />
            </motion.div>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onLogout} style={{ width: "100%", height: 50, borderRadius: 14, border: `1px solid ${C.danger}30`, background: C.dangerFaint, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <LogOut size={15} color={C.danger} />
          <span style={{ fontFamily: SYS, fontSize: 14, fontWeight: 700, color: C.danger }}>Çıkış Yap</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────
function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.76)", zIndex: 60, display: "flex", alignItems: "flex-end" }}
      onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxHeight: "88%", overflowY: "auto" }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

function TradeModal({ member, onClose }: { member: typeof MEMBERS[0]; onClose: () => void }) {
  const [type, setType] = useState<"AL" | "SAT">("AL");
  const [metal, setMetal] = useState("Has");
  return (
    <Sheet onClose={onClose}>
      <div style={{ background: C.onyx, borderRadius: "24px 24px 0 0", padding: "20px 20px 40px" }}>
        <div style={{ width: 34, height: 3.5, background: "rgba(255,255,255,0.14)", borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: "white", marginBottom: 2 }}>Talep Gönder</div>
        <div style={{ fontFamily: SYS, fontSize: 12, color: "rgba(255,255,255,0.38)", marginBottom: 22, letterSpacing: 0.5 }}>{member.firm}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["AL", "SAT"] as const).map(t => (
            <motion.button whileTap={{ scale: 0.95 }} key={t} onClick={() => setType(t)} style={{ flex: 1, height: 44, borderRadius: 12, background: type === t ? (t === "AL" ? C.successFaint : C.dangerFaint) : "rgba(255,255,255,0.04)", border: `1px solid ${type === t ? (t === "AL" ? C.success : C.danger) + "55" : "rgba(255,255,255,0.08)"}`, cursor: "pointer", fontFamily: SYS, fontSize: 14, fontWeight: 800, color: type === t ? (t === "AL" ? C.success : C.danger) : "rgba(255,255,255,0.32)" }}>{t}</motion.button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" as const }}>
          {["Has", "22 Ayar", "USD", "EUR"].map(m => (
            <motion.button whileTap={{ scale: 0.93 }} key={m} onClick={() => setMetal(m)} style={{ padding: "8px 16px", borderRadius: 999, background: metal === m ? C.goldFaint : "rgba(255,255,255,0.04)", border: `1px solid ${metal === m ? C.gold : "rgba(255,255,255,0.09)"}`, cursor: "pointer", fontFamily: SYS, fontSize: 13, fontWeight: 600, color: metal === m ? C.goldBright : "rgba(255,255,255,0.36)" }}>{m}</motion.button>
          ))}
        </div>
        <div style={{ height: 52, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, display: "flex", alignItems: "center", padding: "0 16px", marginBottom: 22 }}>
          <input type="number" placeholder="Miktar (gr)" style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: SYS, fontSize: 16, fontWeight: 400, color: "white" }} />
          <span style={{ fontFamily: SYS, fontSize: 12, color: `${C.gold}66` }}>gr</span>
        </div>
        <GoldButton label="Gönder" onClick={onClose} />
      </div>
    </Sheet>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  return (
    <Sheet onClose={onClose}>
      <div style={{ background: C.bgSoft, borderRadius: "24px 24px 0 0", padding: "20px 20px 48px" }}>
        <div style={{ width: 34, height: 3.5, background: C.hairlineStrong, borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Davetiyelerim</div>
        <div style={{ fontFamily: SYS, fontSize: 12, color: C.inkFaint, marginBottom: 22 }}>2 / 5 kullanıldı</div>
        <div style={{ background: C.goldFaint, border: `1px solid ${C.gold}40`, borderRadius: 14, padding: "14px 18px", marginBottom: 22 }}>
          <div style={{ fontFamily: SYS, fontSize: 9, fontWeight: 700, letterSpacing: 2.5, color: C.inkFaint, marginBottom: 6, textTransform: "uppercase" as const }}>Davetiye Kodun</div>
          <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: C.gold, letterSpacing: "0.08em" }}>PNEX-ABCD-12</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[{ I: Copy, l: "Kopyala" }, { I: Share2, l: "Paylaş" }].map((b, i) => (
            <motion.button whileTap={{ scale: 0.95 }} key={i} style={{ flex: 1, height: 48, borderRadius: 12, border: `1px solid ${C.hairlineStrong}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <b.I size={14} color={C.inkSoft} /><span style={{ fontFamily: SYS, fontSize: 13, color: C.inkSoft }}>{b.l}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

function NewDealModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"AL" | "SAT">("AL");
  const [metal, setMetal] = useState("Has");
  const [exp, setExp] = useState("30dk");
  return (
    <Sheet onClose={onClose}>
      <div style={{ background: C.bgSoft, borderRadius: "26px 26px 0 0", padding: "20px 20px 44px" }}>
        <div style={{ width: 34, height: 3.5, background: "rgba(255,255,255,0.14)", borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: "white" }}>İlan Oluştur</div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose} style={{ width: 30, height: 30, borderRadius: 15, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><XIcon size={13} color="rgba(255,255,255,0.5)" /></motion.button>
        </div>

        {[
          { lbl: "İŞLEM TÜRÜ", el: <div style={{ display: "flex", gap: 8 }}>{(["AL", "SAT"] as const).map(t => <motion.button whileTap={{ scale: 0.95 }} key={t} onClick={() => setType(t)} style={{ flex: 1, height: 46, borderRadius: 12, background: type === t ? (t === "AL" ? C.successFaint : C.dangerFaint) : "rgba(255,255,255,0.04)", border: `1px solid ${type === t ? (t === "AL" ? C.success : C.danger) + "55" : "rgba(255,255,255,0.08)"}`, cursor: "pointer", fontFamily: SYS, fontSize: 15, fontWeight: 800, color: type === t ? (t === "AL" ? C.success : C.danger) : "rgba(255,255,255,0.3)" }}>{t}</motion.button>)}</div> },
          { lbl: "METAL / DÖVİZ", el: <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>{["Has", "22 Ayar", "USD", "EUR"].map(m => <motion.button whileTap={{ scale: 0.93 }} key={m} onClick={() => setMetal(m)} style={{ padding: "8px 16px", borderRadius: 999, background: metal === m ? C.goldFaint : "rgba(255,255,255,0.04)", border: `1px solid ${metal === m ? C.gold : "rgba(255,255,255,0.08)"}`, cursor: "pointer", fontFamily: SYS, fontSize: 13, fontWeight: 600, color: metal === m ? C.goldBright : "rgba(255,255,255,0.35)" }}>{m}</motion.button>)}</div> },
          { lbl: "MİKTAR", el: <div style={{ height: 52, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, display: "flex", alignItems: "center", padding: "0 16px" }}><input type="number" placeholder="Miktar girin" style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: SYS, fontSize: 16, color: "white" }} /><span style={{ fontFamily: SYS, fontSize: 12, color: `${C.gold}66` }}>gr</span></div> },
          { lbl: "FİYAT", el: <div style={{ height: 52, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, display: "flex", alignItems: "center", padding: "0 16px" }}><input type="number" placeholder="Fiyat girin" style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: SYS, fontSize: 16, color: "white" }} /><span style={{ fontFamily: SYS, fontSize: 12, color: `${C.gold}66` }}>₺/gr</span></div> },
          { lbl: "SÜRE", el: <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>{["15dk", "30dk", "1sa", "2sa", "4sa"].map(e => <motion.button whileTap={{ scale: 0.93 }} key={e} onClick={() => setExp(e)} style={{ padding: "8px 16px", borderRadius: 999, background: exp === e ? C.goldFaint : "rgba(255,255,255,0.04)", border: `1px solid ${exp === e ? C.gold : "rgba(255,255,255,0.08)"}`, cursor: "pointer", fontFamily: SYS, fontSize: 13, fontWeight: 600, color: exp === e ? C.goldBright : "rgba(255,255,255,0.35)" }}>{e}</motion.button>)}</div> },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: SYS, fontSize: 9, fontWeight: 700, letterSpacing: 2.5, color: "rgba(255,255,255,0.25)", marginBottom: 10, textTransform: "uppercase" as const }}>{s.lbl}</div>
            {s.el}
          </div>
        ))}

        <GoldButton label="İlanı Yayınla" onClick={onClose} />
      </div>
    </Sheet>
  );
}

// ─── TAB BAR (refined) ────────────────────────────────────────
function TabItem({ Icon, label, active, onPress }: { Icon: React.ComponentType<any>; label: string; active: boolean; onPress: () => void }) {
  return (
    <motion.div whileTap={{ scale: 0.84 }} onClick={onPress}
      style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", paddingTop: 2 }}>
      <Icon size={21} color={active ? C.gold : "rgba(255,255,255,0.3)"} strokeWidth={active ? 1.8 : 1.5} />
      <span style={{ fontFamily: SYS, fontSize: 10, fontWeight: active ? 700 : 500, color: active ? C.gold : "rgba(255,255,255,0.3)", letterSpacing: 0.3 }}>{label}</span>
      {active && <div style={{ width: 3.5, height: 3.5, borderRadius: 2, background: C.gold, marginTop: 1 }} />}
    </motion.div>
  );
}

function TabBar({ tab, onTab, onNew }: { tab: Tab; onTab: (t: Tab) => void; onNew: () => void }) {
  return (
    <div style={{
      height: 80, background: C.bgSoft, flexShrink: 0,
      display: "flex", alignItems: "center", padding: "0 6px 8px",
      borderTop: "1px solid rgba(255,255,255,0.055)",
    }}>
      <TabItem Icon={LayoutGrid} label="Duvar" active={tab === "duvar"} onPress={() => onTab("duvar")} />
      <TabItem Icon={Users} label="Ağ" active={tab === "ag"} onPress={() => onTab("ag")} />

      {/* Center + */}
      <div style={{ width: 72, display: "flex", justifyContent: "center", flexShrink: 0, alignItems: "flex-start", paddingTop: 0 }}>
        <motion.button
          whileTap={{ scale: 0.84 }}
          onClick={onNew}
          style={{
            width: 54, height: 54, borderRadius: 27, border: "none",
            background: `linear-gradient(135deg, ${C.goldDeep} 0%, ${C.gold} 50%, ${C.goldBright} 100%)`,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 20px rgba(201,162,75,0.5), 0 0 0 1px rgba(201,162,75,0.2)`,
            marginTop: -14,
          }}
        >
          <Plus size={22} color={C.bg} strokeWidth={2.5} />
        </motion.button>
      </div>

      <TabItem Icon={User} label="Hesap" active={tab === "hesap"} onPress={() => onTab("hesap")} />
      <div style={{ flex: 1 }} />
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
function MainApp({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("duvar");
  const [showNew, setShowNew] = useState(false);

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <AnimatePresence mode="wait">
        {tab === "duvar" && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            <DuvarTab />
          </motion.div>
        )}
        {tab === "ag" && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            <AgTab />
          </motion.div>
        )}
        {tab === "hesap" && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            <HesapTab onLogout={onLogout} />
          </motion.div>
        )}
      </AnimatePresence>

      <TabBar tab={tab} onTab={setTab} onNew={() => setShowNew(true)} />

      <AnimatePresence>
        {showNew && <NewDealModal onClose={() => setShowNew(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [phone, setPhone] = useState("");

  // Mobil tarayıcılarda kaydırmayı ve boşlukları engellemek için global body stilini ayarlıyoruz.
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = C.bg;
    document.body.style.width = "100vw";
    document.body.style.height = "100vh";
    
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.height = "100vh";
    document.documentElement.style.width = "100vw";
    document.documentElement.style.overflow = "hidden";
  }, []);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      width: "100vw", height: "100vh",
      background: C.bg,
      display: "flex", justifyContent: "center",
      overflow: "hidden", zIndex: 9999
    }}>
      <div style={{ width: "100%", maxWidth: "100%", height: "100%", position: "relative", background: C.bg, overflow: "hidden" }}>
        <AnimatePresence>
          {screen === "splash" && <SplashScreen key="s" onDone={() => setScreen("login")} />}
          {screen === "login" && <LoginScreen
            key="l"
            onDirect={() => { setPhone("5555555555"); setScreen("app"); }}
            onGate={p => { setPhone(p); setScreen("gate"); }}
          />}
          {screen === "gate" && <GateScreen key="g" onNext={() => setScreen("verify")} onBack={() => setScreen("login")} />}
          {screen === "verify" && <VerifyScreen key="v" onNext={() => setScreen("app")} onBack={() => setScreen("gate")} phone={phone || "5551234567"} />}
          {screen === "app" && (
            <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
              <MainApp onLogout={() => setScreen("login")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
