import fs from "fs";

const content = fs.readFileSync("../src/app/App.tsx", "utf-8");

// Remove TitaniumClasp
let updated = content.replace(/\/\/ ─── TITANIUM CLASP[\s\S]*?(?=\/\/ ─── SPLASH)/, "");

// Replace SplashScreen
const splashRegex = /function SplashScreen[\s\S]*?(?=\/\/ ─── LOGIN)/;
const newSplash = `function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    haptic([10, 30, 15]);
    const t = setTimeout(onDone, 3800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      style={screenStyle({
        background: C.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      })}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "65%", display: "flex", justifyContent: "center" }}
      >
        <img
          src={pnexLogoImg1}
          alt="PNEX"
          style={{ width: "100%", height: "auto", objectFit: "contain" }}
        />
      </motion.div>
      
      {/* Subtle cinematic light */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ delay: 1, duration: 2, ease: "easeOut" }}
        style={{
          position: "absolute", bottom: "12%",
          fontFamily: SYS, fontSize: 10, letterSpacing: 4,
          color: "rgba(255,255,255,0.4)", textTransform: "uppercase"
        }}
      >
        Private Network Exchange
      </motion.div>
    </motion.div>
  );
}

`;
updated = updated.replace(splashRegex, newSplash);

fs.writeFileSync("../src/app/App.tsx", updated);
console.log("Updated Splash Screen");
