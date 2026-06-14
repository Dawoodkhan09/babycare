import { useState, useEffect } from "react";
import { FaTimes, FaDownload, FaMobileAlt, FaShareSquare } from "react-icons/fa";
import { useIsPWA } from "../hooks/useMediaQuery";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

const DISMISS_KEY = "babycare-install-dismissed-at";
const REPROMPT_DAYS = 0; // re-prompt after 7 days

/**
 * InstallPrompt — Shows a banner prompting the user to install the PWA.
 *
 * Behavior:
 *   - Hidden if already running as PWA.
 *   - On Android/Chrome: shows native install banner trigger.
 *   - On iOS: shows manual instructions (Add to Home Screen).
 *   - Dismissible — stores dismissal timestamp in localStorage.
 *   - Re-prompts after 7 days.
 */
export default function InstallPrompt() {
  const isPWA = useIsPWA();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream;

  // Check if user previously dismissed
  const wasRecentlyDismissed = () => {
    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (!dismissedAt) return false;
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      return elapsed < REPROMPT_DAYS * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (isPWA) return; // Already installed
    if (wasRecentlyDismissed()) return;

    // Android/Chrome: capture install prompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // iOS: show manual instructions after slight delay
    if (isIOS && !isPWA) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [isPWA, isIOS]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.log("[PWA] User choice:", choice.outcome);
      setDeferredPrompt(null);
      setShowBanner(false);
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSInstructions(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
  };

  if (isPWA || !showBanner) return null;

  return (
    <>
      <style>{`
        @keyframes pwa-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pwa-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .pwa-install-banner {
          animation: pwa-slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pwa-install-btn { transition: all 0.2s ease; }
        .pwa-install-btn:hover {
          background: #0f4f2e !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(26,110,63,0.4) !important;
        }
        .pwa-dismiss-btn { transition: all 0.2s ease; }
        .pwa-dismiss-btn:hover {
          background: #f4f9f6 !important;
          color: #0a1f15 !important;
        }
        .pwa-ios-overlay {
          animation: pwa-fade-in 0.25s ease;
        }
      `}</style>

      {/* MAIN BANNER */}
      <div style={s.banner} className="pwa-install-banner">
        <div style={s.bannerInner}>
          <div style={s.bannerLeft}>
            <div style={s.bannerIcon}>
              <FaMobileAlt size={18} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={s.bannerTitle}>Install BabyCare App</div>
              <div style={s.bannerSub}>
                Faster access, works offline, native experience
              </div>
            </div>
          </div>
          <div style={s.bannerActions}>
            <button
              onClick={handleDismiss}
              style={s.dismissBtn}
              className="pwa-dismiss-btn"
              aria-label="Dismiss"
            >
              <FaTimes size={11} />
            </button>
            <button
              onClick={handleInstall}
              style={s.installBtn}
              className="pwa-install-btn"
            >
              <FaDownload size={11} />
              Install
            </button>
          </div>
        </div>
      </div>

      {/* iOS INSTRUCTIONS MODAL */}
      {showIOSInstructions && (
        <div
          style={s.iosOverlay}
          className="pwa-ios-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}
        >
          <div style={s.iosCard}>
            <button
              onClick={handleDismiss}
              style={s.iosClose}
              className="pwa-dismiss-btn"
            >
              <FaTimes size={13} />
            </button>

            <div style={s.iosHeader}>
              <div style={s.iosIcon}>
                <FaMobileAlt size={28} color={MINT_DARK} />
              </div>
              <h2 style={s.iosTitle}>Install on iPhone/iPad</h2>
              <p style={s.iosSub}>BabyCare ko home screen pe install karein</p>
            </div>

            <div style={s.iosSteps}>
              <div style={s.iosStep}>
                <div style={s.iosStepNum}>1</div>
                <div style={s.iosStepText}>
                  Niche Safari ke <strong>Share button</strong> par tap karein
                  <span style={s.iosStepIcon}>
                    <FaShareSquare size={11} color={MINT_DARK} />
                  </span>
                </div>
              </div>
              <div style={s.iosStep}>
                <div style={s.iosStepNum}>2</div>
                <div style={s.iosStepText}>
                  Scroll karke <strong>"Add to Home Screen"</strong> select karein
                </div>
              </div>
              <div style={s.iosStep}>
                <div style={s.iosStepNum}>3</div>
                <div style={s.iosStepText}>
                  Top right pe <strong>"Add"</strong> tap karein. App home screen pe install ho jayegi!
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              style={s.iosDoneBtn}
              className="pwa-install-btn"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  banner: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "#fff",
    borderTop: `1px solid ${BORDER}`,
    boxShadow: "0 -8px 28px rgba(15,32,24,0.12)",
    zIndex: 9999,
    padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
    fontFamily: "'Inter','Nunito',sans-serif",
  },
  bannerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  bannerLeft: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(26,110,63,0.3)",
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: TEXT_DARK,
    letterSpacing: "-0.2px",
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 600,
  },
  bannerActions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  dismissBtn: {
    width: 36,
    height: 36,
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    color: TEXT_MUTED,
    borderRadius: 9,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
  },
  installBtn: {
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 4px 12px rgba(26,110,63,0.3)",
  },

  // iOS instructions
  iosOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,32,24,0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    padding: 20,
    fontFamily: "'Inter','Nunito',sans-serif",
  },
  iosCard: {
    background: "#fff",
    borderRadius: 18,
    maxWidth: 420,
    width: "100%",
    padding: "32px 28px",
    position: "relative",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },
  iosClose: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    background: "#fff",
    border: `1px solid ${BORDER}`,
    color: TEXT_MUTED,
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
  },
  iosHeader: {
    textAlign: "center",
    marginBottom: 22,
  },
  iosIcon: {
    width: 64,
    height: 64,
    background: MINT_LIGHT,
    borderRadius: 16,
    margin: "0 auto 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iosTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 6px",
    letterSpacing: "-0.3px",
  },
  iosSub: {
    fontSize: 13,
    color: TEXT_MUTED,
    margin: 0,
    fontWeight: 600,
  },
  iosSteps: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 22,
  },
  iosStep: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    background: "#fafffe",
    border: `1px solid ${BORDER}`,
    borderRadius: 11,
  },
  iosStepNum: {
    width: 28,
    height: 28,
    background: MINT_DARK,
    color: "#fff",
    borderRadius: "50%",
    fontSize: 13,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iosStepText: {
    fontSize: 13,
    color: TEXT_BODY,
    fontWeight: 600,
    lineHeight: 1.5,
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  iosStepIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    background: MINT_LIGHT,
    borderRadius: 5,
  },
  iosDoneBtn: {
    width: "100%",
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 11,
    padding: "13px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 14px rgba(26,110,63,0.3)",
  },
};
