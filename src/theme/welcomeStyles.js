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
    },
    
  STYLE_11: {
    id: 11,
    name: "Soccer World",
    colors: {
      background: "#0B4D2C",
      backgroundGradient: "linear-gradient(135deg, #0B4D2C 0%, #1E8449 50%, #0B4D2C 100%), repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(255,255,255,0.03) 35px, rgba(255,255,255,0.03) 37px)",
      text: "#FFFFFF",
      accent: "#00FF41",
      accentGradient: "linear-gradient(45deg, #00FF41, #32CD32)",
      headerBg: "rgba(11, 77, 44, 0.95)",
      tabActiveBg: "rgba(0, 255, 65, 0.2)",
      tabBorder: "#00FF41",
      surface: "rgba(30, 132, 73, 0.3)"
    },
    decorations: {
      fieldLines: true,
      soccerBall: true,
      goalPosts: true
    },
    animations: {
      backgroundAnimation: "fieldShift 20s ease infinite alternate",
      pingAnimation: true,
      ballBounce: true
    },
    fonts: {
      heading: "'Exo 2', sans-serif",
      body: "'Roboto', sans-serif"
    }
  },

  STYLE_12: {
    id: 12,
    name: "Ethiopian Pride",
    colors: {
      background: "#1A472A",
      backgroundGradient: "linear-gradient(0deg, #1A472A 0%, #FFD700 33%, #DC143C 66%, #1A472A 100%)",
      text: "#FFFFFF",
      accent: "#FFD700",
      accentGradient: "linear-gradient(45deg, #FFD700, #FFA500)",
      headerBg: "rgba(26, 71, 42, 0.95)",
      tabActiveBg: "rgba(255, 215, 0, 0.2)",
      tabBorder: "#FFD700",
      surface: "rgba(220, 20, 60, 0.1)"
    },
    decorations: {
      tricolor: true,
      copticCross: true,
      coffeePattern: true
    },
    animations: {
      backgroundAnimation: "ethiopianWave 15s ease infinite",
      pingAnimation: true
    },
    fonts: {
      heading: "'Amharic', 'Noto Sans Ethiopic', serif",
      body: "'Roboto', sans-serif"
    }
  },

  STYLE_13: {
    id: 13,
    name: "Eritrean Heritage",
    colors: {
      background: "#1B5E20",
      backgroundGradient: "linear-gradient(45deg, #1B5E20 0%, #FFC107 25%, #F44336 50%, #2196F3 75%, #1B5E20 100%)",
      text: "#FFFFFF",
      accent: "#FFC107",
      accentGradient: "linear-gradient(45deg, #FFC107, #FF9800)",
      headerBg: "rgba(27, 94, 32, 0.95)",
      tabActiveBg: "rgba(255, 193, 7, 0.2)",
      tabBorder: "#FFC107",
      surface: "rgba(244, 67, 54, 0.1)"
    },
    decorations: {
      camelSilhouette: true,
      redSeaWaves: true,
      traditionalPatterns: true
    },
    animations: {
      backgroundAnimation: "desertWind 18s ease infinite",
      pingAnimation: true
    },
    fonts: {
      heading: "'Tigrinya', 'Noto Sans', serif",
      body: "'Open Sans', sans-serif"
    }
  },

  STYLE_14: {
    id: 14,
    name: "Mexican Fiesta",
    colors: {
      background: "#2E7D32",
      backgroundGradient: "radial-gradient(circle at 30% 30%, rgba(244, 67, 54, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255, 193, 7, 0.3) 0%, transparent 50%)",
      text: "#FFFFFF",
      accent: "#FF5722",
      accentGradient: "linear-gradient(45deg, #FF5722, #FFC107)",
      headerBg: "rgba(46, 125, 50, 0.95)",
      tabActiveBg: "rgba(255, 87, 34, 0.25)",
      tabBorder: "#FF5722",
      surface: "rgba(255, 193, 7, 0.15)"
    },
    decorations: {
      papel: true,
      cactus: true,
      aztecPatterns: true,
      marigolds: true
    },
    animations: {
      backgroundAnimation: "fiestaColors 12s ease infinite",
      pingAnimation: true,
      papelFlutter: true
    },
    fonts: {
      heading: "'Fredoka One', cursive",
      body: "'Nunito', sans-serif"
    }
  },

  STYLE_15: {
    id: 15,
    name: "American Classic",
    colors: {
      background: "#1A237E",
      backgroundGradient: "linear-gradient(135deg, #1A237E 0%, #FFFFFF 50%, #D32F2F 100%)",
      text: "#FFFFFF",
      accent: "#1976D2",
      accentGradient: "linear-gradient(45deg, #1976D2, #D32F2F)",
      headerBg: "rgba(26, 35, 126, 0.95)",
      tabActiveBg: "rgba(25, 118, 210, 0.25)",
      tabBorder: "#1976D2",
      surface: "rgba(211, 47, 47, 0.1)"
    },
    decorations: {
      stars: true,
      stripes: true,
      eagle: true,
      liberty: true
    },
    animations: {
      backgroundAnimation: "flagWave 14s ease infinite",
      pingAnimation: true,
      starsShimmer: true
    },
    fonts: {
      heading: "'Bebas Neue', cursive",
      body: "'Roboto', sans-serif"
    }
  },

  STYLE_16: {
    id: 16,
    name: "Gourmet Kitchen",
    colors: {
      background: "#3E2723",
      backgroundGradient: "radial-gradient(circle at 40% 60%, rgba(255, 152, 0, 0.2) 0%, transparent 50%), linear-gradient(135deg, #3E2723 0%, #5D4037 100%)",
      text: "#FFF8E1",
      accent: "#FF8F00",
      accentGradient: "linear-gradient(45deg, #FF8F00, #FFB300)",
      headerBg: "rgba(62, 39, 35, 0.95)",
      tabActiveBg: "rgba(255, 143, 0, 0.2)",
      tabBorder: "#FF8F00",
      surface: "rgba(93, 64, 55, 0.3)"
    },
    decorations: {
      chefHat: true,
      utensils: true,
      steamWaves: true,
      herbs: true
    },
    animations: {
      backgroundAnimation: "steamRise 10s ease infinite",
      pingAnimation: true,
      sizzle: true
    },
    fonts: {
      heading: "'Pacifico', cursive",
      body: "'Lato', sans-serif"
    }
  },

  STYLE_17: {
    id: 17,
    name: "Code Matrix",
    colors: {
      background: "#0D1B2A",
      backgroundGradient: "linear-gradient(135deg, #0D1B2A 0%, #1B263B 50%, #0D1B2A 100%)",
      text: "#00FF41",
      accent: "#39FF14",
      accentGradient: "linear-gradient(45deg, #39FF14, #00FF41)",
      headerBg: "rgba(13, 27, 42, 0.98)",
      tabActiveBg: "rgba(57, 255, 20, 0.15)",
      tabBorder: "#39FF14",
      surface: "rgba(27, 38, 59, 0.5)"
    },
    decorations: {
      binaryRain: true,
      terminalLines: true,
      circuitBoard: true,
      glitchEffect: true
    },
    animations: {
      backgroundAnimation: "matrixScroll 8s linear infinite",
      pingAnimation: true,
      codeFlicker: true
    },
    fonts: {
      heading: "'Fira Code', monospace",
      body: "'Source Code Pro', monospace"
    }
  },

  STYLE_18: {
    id: 18,
    name: "Royal Elegance",
    colors: {
      background: "#1A1A2E",
      backgroundGradient: "radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 70%), linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
      text: "#F8F8FF",
      accent: "#9370DB",
      accentGradient: "linear-gradient(45deg, #9370DB, #BA55D3)",
      headerBg: "rgba(26, 26, 46, 0.95)",
      tabActiveBg: "rgba(147, 112, 219, 0.2)",
      tabBorder: "#9370DB",
      surface: "rgba(138, 43, 226, 0.1)"
    },
    decorations: {
      crown: true,
      ornaments: true,
      velvetTexture: true,
      pearls: true
    },
    animations: {
      backgroundAnimation: "royalShimmer 16s ease infinite",
      pingAnimation: true,
      jewelGlint: true
    },
    fonts: {
      heading: "'Cinzel', serif",
      body: "'Crimson Text', serif"
    }
  },

  STYLE_19: {
    id: 19,
    name: "Music Studio",
    colors: {
      background: "#212121",
      backgroundGradient: "linear-gradient(45deg, #212121 0%, #424242 25%, #212121 50%, #424242 75%, #212121 100%)",
      text: "#FFFFFF",
      accent: "#E91E63",
      accentGradient: "linear-gradient(45deg, #E91E63, #FF4081)",
      headerBg: "rgba(33, 33, 33, 0.95)",
      tabActiveBg: "rgba(233, 30, 99, 0.2)",
      tabBorder: "#E91E63",
      surface: "rgba(66, 66, 66, 0.3)"
    },
    decorations: {
      musicNotes: true,
      equalizer: true,
      vinyl: true,
      speakers: true
    },
    animations: {
      backgroundAnimation: "bassThump 4s ease infinite",
      pingAnimation: true,
      noteFloat: true
    },
    fonts: {
      heading: "'Righteous', cursive",
      body: "'Roboto', sans-serif"
    }
  },

  STYLE_20: {
    id: 20,
    name: "Hollywood Cinema",
    colors: {
      background: "#0F0F0F",
      backgroundGradient: "radial-gradient(circle at 20% 80%, rgba(218, 165, 32, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 0, 0, 0.1) 0%, transparent 50%)",
      text: "#FFFFFF",
      accent: "#DAA520",
      accentGradient: "linear-gradient(45deg, #DAA520, #FFD700)",
      headerBg: "rgba(15, 15, 15, 0.95)",
      tabActiveBg: "rgba(218, 165, 32, 0.25)",
      tabBorder: "#DAA520",
      surface: "rgba(255, 0, 0, 0.05)"
    },
    decorations: {
      filmStrip: true,
      spotlight: true,
      curtains: true,
      stars: true
    },
    animations: {
      backgroundAnimation: "spotlightSweep 20s ease infinite",
      pingAnimation: true,
      filmRoll: true
    },
    fonts: {
      heading: "'Abril Fatface', cursive",
      body: "'Lora', serif"
    }
  },

  STYLE_21: {
    id: 21,
    name: "Sahara Desert",
    colors: {
      background: "#8D4004",
      backgroundGradient: "linear-gradient(135deg, #8D4004 0%, #DAA520 30%, #CD853F 60%, #8D4004 100%)",
      text: "#FFF8DC",
      accent: "#FF8C00",
      accentGradient: "linear-gradient(45deg, #FF8C00, #DAA520)",
      headerBg: "rgba(141, 64, 4, 0.95)",
      tabActiveBg: "rgba(255, 140, 0, 0.2)",
      tabBorder: "#FF8C00",
      surface: "rgba(218, 165, 32, 0.15)"
    },
    decorations: {
      dunes: true,
      camel: true,
      oasis: true,
      mirages: true
    },
    animations: {
      backgroundAnimation: "sandStorm 25s ease infinite",
      pingAnimation: true,
      heatShimmer: true
    },
    fonts: {
      heading: "'Aref Ruqaa', serif",
      body: "'Cairo', sans-serif"
    }
  },

  STYLE_22: {
    id: 22,
    name: "East African Safari",
    colors: {
      background: "#2E4057",
      backgroundGradient: "linear-gradient(135deg, #2E4057 0%, #8B4513 30%, #DAA520 60%, #2E4057 100%)",
      text: "#F5DEB3",
      accent: "#CD853F",
      accentGradient: "linear-gradient(45deg, #CD853F, #DEB887)",
      headerBg: "rgba(46, 64, 87, 0.95)",
      tabActiveBg: "rgba(205, 133, 63, 0.2)",
      tabBorder: "#CD853F",
      surface: "rgba(139, 69, 19, 0.2)"
    },
    decorations: {
      baobab: true,
      animals: true,
      acacia: true,
      sunset: true
    },
    animations: {
      backgroundAnimation: "savannaBreeze 18s ease infinite",
      pingAnimation: true,
      animalMigration: true
    },
    fonts: {
      heading: "'Ubuntu', sans-serif",
      body: "'Lato', sans-serif"
    }
  },

  STYLE_23: {
    id: 23,
    name: "Sports Arena",
    colors: {
      background: "#1A237E",
      backgroundGradient: "linear-gradient(135deg, #1A237E 0%, #303F9F 50%, #1A237E 100%), repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 12px)",
      text: "#FFFFFF",
      accent: "#3F51B5",
      accentGradient: "linear-gradient(45deg, #3F51B5, #2196F3)",
      headerBg: "rgba(26, 35, 126, 0.95)",
      tabActiveBg: "rgba(63, 81, 181, 0.3)",
      tabBorder: "#3F51B5",
      surface: "rgba(48, 63, 159, 0.2)"
    },
    decorations: {
      stadium: true,
      scoreboard: true,
      fieldLines: true,
      crowd: true
    },
    animations: {
      backgroundAnimation: "crowdWave 12s ease infinite",
      pingAnimation: true,
      stadiumLights: true
    },
    fonts: {
      heading: "'Orbitron', sans-serif",
      body: "'Rajdhani', sans-serif"
    }
  },

  STYLE_24: {
    id: 24,
    name: "Gaming Neon",
    colors: {
      background: "#0A0A0A",
      backgroundGradient: "radial-gradient(circle at 30% 30%, rgba(255, 0, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(0, 255, 255, 0.15) 0%, transparent 50%)",
      text: "#FFFFFF",
      accent: "#FF00FF",
      accentGradient: "linear-gradient(45deg, #FF00FF, #00FFFF)",
      headerBg: "rgba(10, 10, 10, 0.95)",
      tabActiveBg: "rgba(255, 0, 255, 0.2)",
      tabBorder: "#FF00FF",
      surface: "rgba(0, 255, 255, 0.1)"
    },
    decorations: {
      pixelGrid: true,
      neonGlow: true,
      gameController: true,
      powerUps: true
    },
    animations: {
      backgroundAnimation: "neonPulse 6s ease infinite",
      pingAnimation: true,
      pixelShift: true
    },
    fonts: {
      heading: "'Press Start 2P', cursive",
      body: "'Orbitron', sans-serif"
    }
  },

  STYLE_25: {
    id: 25,
    name: "Tropical Paradise",
    colors: {
      background: "#006064",
      backgroundGradient: "linear-gradient(135deg, #006064 0%, #00ACC1 30%, #4DD0E1 60%, #006064 100%)",
      text: "#FFFFFF",
      accent: "#00BCD4",
      accentGradient: "linear-gradient(45deg, #00BCD4, #4DD0E1)",
      headerBg: "rgba(0, 96, 100, 0.95)",
      tabActiveBg: "rgba(0, 188, 212, 0.25)",
      tabBorder: "#00BCD4",
      surface: "rgba(0, 172, 193, 0.2)"
    },
    decorations: {
      palmTrees: true,
      waves: true,
      seashells: true,
      sunrays: true
    },
    animations: {
      backgroundAnimation: "oceanWaves 15s ease infinite",
      pingAnimation: true,
      palmSway: true
    },
    fonts: {
      heading: "'Dancing Script', cursive",
      body: "'Quicksand', sans-serif"
    }
  },

  STYLE_26: {
    id: 26,
    name: "Cyberpunk 2077",
    colors: {
      background: "#0F0F23",
      backgroundGradient: "linear-gradient(135deg, #0F0F23 0%, #1a1a2e 50%, #16213e 100%), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,0,0.03) 2px, rgba(255,255,0,0.03) 4px)",
      text: "#00FFFF",
      accent: "#FFFF00",
      accentGradient: "linear-gradient(45deg, #FFFF00, #FF00FF)",
      headerBg: "rgba(15, 15, 35, 0.98)",
      tabActiveBg: "rgba(255, 255, 0, 0.2)",
      tabBorder: "#FFFF00",
      surface: "rgba(26, 26, 46, 0.5)"
    },
    decorations: {
      hologram: true,
      dataStreams: true,
      cityscape: true,
      neonSigns: true
    },
    animations: {
      backgroundAnimation: "cyberpunkGlitch 8s ease infinite",
      pingAnimation: true,
      dataFlow: true
    },
    fonts: {
      heading: "'Orbitron', sans-serif",
      body: "'Rajdhani', sans-serif"
    }
  },

  STYLE_27: {
    id: 27,
    name: "Japanese Zen",
    colors: {
      background: "#2C3E50",
      backgroundGradient: "linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #2C3E50 100%)",
      text: "#ECF0F1",
      accent: "#E74C3C",
      accentGradient: "linear-gradient(45deg, #E74C3C, #C0392B)",
      headerBg: "rgba(44, 62, 80, 0.95)",
      tabActiveBg: "rgba(231, 76, 60, 0.15)",
      tabBorder: "#E74C3C",
      surface: "rgba(52, 73, 94, 0.3)"
    },
    decorations: {
      sakura: true,
      bamboo: true,
      mountain: true,
      torii: true
    },
    animations: {
      backgroundAnimation: "zenFlow 20s ease infinite",
      pingAnimation: true,
      petalFall: true
    },
    fonts: {
      heading: "'Noto Sans JP', sans-serif",
      body: "'Roboto', sans-serif"
    }
  },

  STYLE_28: {
    id: 28,
    name: "Retro Synthwave",
    colors: {
      background: "#2D1B69",
      backgroundGradient: "linear-gradient(135deg, #2D1B69 0%, #FF006E 30%, #8338EC 60%, #2D1B69 100%)",
      text: "#FFFFFF",
      accent: "#FF006E",
      accentGradient: "linear-gradient(45deg, #FF006E, #8338EC)",
      headerBg: "rgba(45, 27, 105, 0.95)",
      tabActiveBg: "rgba(255, 0, 110, 0.25)",
      tabBorder: "#FF006E",
      surface: "rgba(131, 56, 236, 0.15)"
    },
    decorations: {
      retroGrid: true,
      synthSun: true,
      mountains: true,
      lasers: true
    },
    animations: {
      backgroundAnimation: "synthWave 14s ease infinite",
      pingAnimation: true,
      retroGlow: true
    },
    fonts: {
      heading: "'Orbitron', sans-serif",
      body: "'Exo 2', sans-serif"
    }
  },

  STYLE_29: {
    id: 29,
    name: "Winter Wonderland",
    colors: {
      background: "#1E3A8A",
      backgroundGradient: "linear-gradient(135deg, #1E3A8A 0%, #FFFFFF 40%, #93C5FD 70%, #1E3A8A 100%)",
      text: "#1F2937",
      accent: "#3B82F6",
      accentGradient: "linear-gradient(45deg, #3B82F6, #93C5FD)",
      headerBg: "rgba(30, 58, 138, 0.95)",
      tabActiveBg: "rgba(59, 130, 246, 0.2)",
      tabBorder: "#3B82F6",
      surface: "rgba(147, 197, 253, 0.2)"
    },
    decorations: {
      snowflakes: true,
      icicles: true,
      aurora: true,
      frost: true
    },
    animations: {
      backgroundAnimation: "snowfall 12s linear infinite",
      pingAnimation: true,
      auroraShimmer: true
    },
    fonts: {
      heading: "'Fredoka One', cursive",
      body: "'Nunito', sans-serif"
    }
  },

  STYLE_30: {
    id: 30,
    name: "Space Explorer",
    colors: {
      background: "#000000",
      backgroundGradient: "radial-gradient(circle at 20% 20%, rgba(138, 43, 226, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(30, 144, 255, 0.3) 0%, transparent 50%)",
      text: "#FFFFFF",
      accent: "#1E90FF",
      accentGradient: "linear-gradient(45deg, #1E90FF, #8A2BE2)",
      headerBg: "rgba(0, 0, 0, 0.95)",
      tabActiveBg: "rgba(30, 144, 255, 0.2)",
      tabBorder: "#1E90FF",
      surface: "rgba(138, 43, 226, 0.1)"
    },
    decorations: {
      stars: true,
      planets: true,
      nebula: true,
      spaceship: true
    },
    animations: {
      backgroundAnimation: "galaxyRotate 30s linear infinite",
      pingAnimation: true,
      starTwinkle: true
    },
    fonts: {
      heading: "'Orbitron', sans-serif",
      body: "'Exo 2', sans-serif"
    }
  }
};