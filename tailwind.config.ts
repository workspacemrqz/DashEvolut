
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      colors: {
        background: "#090909",
        foreground: "#ffffff",
        card: {
          DEFAULT: "#161616",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#161616",
          foreground: "#ffffff",
        },
        primary: {
          DEFAULT: "#387DF3",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#404040",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "#2b2b2b",
        input: "#2b2b2b",
        ring: "#387DF3",
        
        // Cores específicas diretas
        "bg-primary": "#090909",
        "bg-container": "#101011",
        "bg-card": "#161616",
        "text-primary": "#ffffff",
        "text-secondary": "#ababab",
        "text-muted": "#666666",
        "border-primary": "#387DF3",
        "border-secondary": "#2b2b2b",
        "border-subtle": "#1a1a1a",
        
        // Cores de ação diretas
        "action": "#387DF3",
        "accent": "#f5f5f5",
        "muted": "#404040",
        
        // Cores de feedback diretas
        "success": "#10b981",
        "warning": "#f59e0b",
        "error": "#ef4444",
        "info": "#387DF3",
        
        // Cores de projeto diretas
        "discovery": "#9333ea",
        "development": "#387DF3",
        "delivery": "#10b981",
        "postsale": "#f59e0b",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif: ["Georgia", "serif"],
        mono: ["Consolas", "Monaco", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
