// src/theme/welcomeStyles.js
export const WELCOME_STYLES = {
    STYLE_1: {
        id: 1,
        name: "Carbon Fiber",
        colors: {
          background: "#131313",
          backgroundGradient: "linear-gradient(135deg, #131313 0%, #1f1f1f 100%), repeating-linear-gradient(45deg, #0a0a0a 0px, #0a0a0a 5px, #131313 5px, #131313 10px)",
          text: "#f0f0f0",
          accent: "#00c6ff",
          accentGradient: "linear-gradient(45deg, #00c6ff, #0072ff)",
          headerBg: "rgba(10, 10, 10, 0.95)",
          tabActiveBg: "rgba(0, 198, 255, 0.15)",
          tabBorder: "#00c6ff"
        },
        animations: {
          backgroundAnimation: "none",
          pingAnimation: false
        },
        fonts: {
          heading: "'Rajdhani', sans-serif",
          body: "'Roboto', sans-serif"
        }
      },
    STYLE_2: {
      id: 2,
      name: "Cosmic Blue",
      colors: {
        background: "#0A192F",
        backgroundGradient: "radial-gradient(circle at 20% 30%, rgba(100, 255, 218, 0.07) 0%, transparent 50%)",
        text: "#E6F1FF",
        accent: "#64FFDA",
        accentGradient: "linear-gradient(45deg, #64FFDA, #00B5CE)",
        headerBg: "rgba(10, 25, 47, 0.9)",
        tabActiveBg: "rgba(100, 255, 218, 0.1)",
        tabBorder: "#64FFDA"
      },
      animations: {
        backgroundAnimation: "none",
        pingAnimation: false
      },
      fonts: {
        heading: "'Montserrat', sans-serif",
        body: "'Roboto', sans-serif"
      }
    },
    STYLE_3: {
      id: 3,
      name: "Royal Gold",
      colors: {
        background: "#0A0A0A",
        backgroundGradient: "radial-gradient(circle at 30% 30%, rgba(218, 165, 32, 0.1) 0%, transparent 60%)",
        text: "#FFFFFF",
        accent: "#D4AF37",
        accentGradient: "linear-gradient(45deg, #D4AF37, #AA8C2C)",
        headerBg: "rgba(10, 10, 10, 0.9)",
        tabActiveBg: "rgba(212, 175, 55, 0.15)",
        tabBorder: "#D4AF37"
      },
      animations: {
        backgroundAnimation: "none",
        pingAnimation: false
      },
      fonts: {
        heading: "'Playfair Display', serif",
        body: "'Poppins', sans-serif"
      }
    },
    STYLE_4: {
      id: 4,
      name: "Neon Pulse",
      colors: {
        background: "#050B15",
        backgroundGradient: "radial-gradient(circle at 20% 30%, rgba(66, 211, 146, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(78, 99, 215, 0.1) 0%, transparent 50%)",
        text: "#E2E8F0",
        accent: "#42D392",
        accentGradient: "linear-gradient(45deg, #42D392, #647EC9)",
        headerBg: "rgba(5, 11, 21, 0.9)",
        tabActiveBg: "rgba(66, 211, 146, 0.15)",
        tabBorder: "#42D392"
      },
      animations: {
        backgroundAnimation: "none",
        pingAnimation: true
      },
      fonts: {
        heading: "'Space Mono', monospace",
        body: "'Inter', sans-serif"
      }
    },
    STYLE_5: {
      id: 5,
      name: "Sunset Horizon",
      colors: {
        background: "#16213E",
        backgroundGradient: "linear-gradient(135deg, #16213E 0%, #0F3460 100%)",
        text: "#F1F1F1",
        accent: "#E94560",
        accentGradient: "linear-gradient(45deg, #E94560, #ff6b8b)",
        headerBg: "rgba(22, 33, 62, 0.9)",
        tabActiveBg: "rgba(233, 69, 96, 0.2)",
        tabBorder: "#E94560"
      },
      animations: {
        backgroundAnimation: "sunsetShift 15s ease infinite alternate",
        pingAnimation: false
      },
      fonts: {
        heading: "'Poppins', sans-serif",
        body: "'Open Sans', sans-serif"
      }
    },
    STYLE_6: {
      id: 6,
      name: "Emerald Forest",
      colors: {
        background: "#111927",
        backgroundGradient: "radial-gradient(circle at 50% 50%, rgba(42, 173, 96, 0.1) 0%, transparent 70%)",
        text: "#ECFDF5",
        accent: "#10B981",
        accentGradient: "linear-gradient(45deg, #10B981, #059669)",
        headerBg: "rgba(17, 25, 39, 0.9)",
        tabActiveBg: "rgba(16, 185, 129, 0.2)",
        tabBorder: "#10B981"
      },
      animations: {
        backgroundAnimation: "none",
        pingAnimation: true
      },
      fonts: {
        heading: "'Quicksand', sans-serif",
        body: "'Nunito', sans-serif"
      }
    },
    STYLE_7: {
      id: 7,
      name: "Amethyst Glow",
      colors: {
        background: "#121212",
        backgroundGradient: "radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
        text: "#F5F3FF",
        accent: "#8B5CF6",
        accentGradient: "linear-gradient(45deg, #8B5CF6, #6D28D9)",
        headerBg: "rgba(18, 18, 18, 0.9)",
        tabActiveBg: "rgba(139, 92, 246, 0.2)",
        tabBorder: "#8B5CF6"
      },
      animations: {
        backgroundAnimation: "none",
        pingAnimation: true
      },
      fonts: {
        heading: "'Josefin Sans', sans-serif",
        body: "'Lato', sans-serif"
      }
    },
    STYLE_8: {
      id: 8,
      name: "Obsidian Volcanic",
      colors: {
        background: "#121212",
        backgroundGradient: "radial-gradient(circle at 30% 70%, rgba(240, 68, 56, 0.1) 0%, transparent 60%)",
        text: "#FAF9F6",
        accent: "#F04438",
        accentGradient: "linear-gradient(45deg, #F04438, #C01048)",
        headerBg: "rgba(18, 18, 18, 0.95)",
        tabActiveBg: "rgba(240, 68, 56, 0.2)",
        tabBorder: "#F04438"
      },
      animations: {
        backgroundAnimation: "none",
        pingAnimation: true
      },
      fonts: {
        heading: "'Anton', sans-serif",
        body: "'Roboto', sans-serif"
      }
    },
    STYLE_9: {
      id: 9,
      name: "Arctic Frost",
      colors: {
        background: "#111827",
        backgroundGradient: "linear-gradient(135deg, #111827 0%, #1E293B 100%)",
        text: "#F9FAFB",
        accent: "#38BDF8",
        accentGradient: "linear-gradient(45deg, #38BDF8, #0EA5E9)",
        headerBg: "rgba(17, 24, 39, 0.9)",
        tabActiveBg: "rgba(56, 189, 248, 0.2)",
        tabBorder: "#38BDF8"
      },
      animations: {
        backgroundAnimation: "none",
        pingAnimation: false
      },
      fonts: {
        heading: "'Raleway', sans-serif",
        body: "'Inter', sans-serif"
      }
    },
    STYLE_10: {
      id: 10,
      name: "Ethereal Nebula",
      colors: {
        background: "#0F0F1A",
        backgroundGradient: "radial-gradient(circle at 10% 30%, rgba(134, 25, 143, 0.15) 0%, transparent 60%), radial-gradient(circle at 90% 80%, rgba(49, 46, 129, 0.15) 0%, transparent 60%)",
        text: "#F5F5F5",
        accent: "#D946EF",
        accentGradient: "linear-gradient(45deg, #D946EF, #9333EA)",
        headerBg: "rgba(15, 15, 26, 0.9)",
        tabActiveBg: "rgba(217, 70, 239, 0.2)",
        tabBorder: "#D946EF"
      },
      animations: {
        backgroundAnimation: "nebulaPulse 10s ease infinite alternate",
        pingAnimation: true
      },
      fonts: {
        heading: "'Orbitron', sans-serif",
        body: "'Outfit', sans-serif"
      }
    }
  };