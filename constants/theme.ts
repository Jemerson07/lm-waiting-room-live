/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0052A3";
const tintColorDark = "#0066CC";

export const Colors = {
  light: {
    text: "#1a1a2e",
    background: "#f8f9fa",
    tint: tintColorLight,
    icon: "#0052A3",
    tabIconDefault: "#999",
    tabIconSelected: tintColorLight,
    cardBackground: "#ffffff",
    border: "#e0e0e0",
    // Status colors
    statusArrival: "#0052A3",
    statusWaiting: "#FFA500",
    statusInService: "#FF6B00",
    statusCompleted: "#00C853",
  },
  dark: {
    text: "#f5f5f5",
    background: "#0f0f1e",
    tint: tintColorDark,
    icon: "#64b5f6",
    tabIconDefault: "#666",
    tabIconSelected: tintColorDark,
    cardBackground: "#1a1a2e",
    border: "#333",
    // Status colors (same for dark mode)
    statusArrival: "#0066CC",
    statusWaiting: "#FFA500",
    statusInService: "#FF6B00",
    statusCompleted: "#00C853",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
