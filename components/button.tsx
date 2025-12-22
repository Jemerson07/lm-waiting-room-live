import { Pressable, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { ThemedText } from "./themed-text";

export type ButtonVariant = "primary" | "secondary" | "danger" | "outline";
export type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return "#CCCCCC";
    switch (variant) {
      case "primary":
        return "#0052A3";
      case "secondary":
        return "#F0F0F0";
      case "danger":
        return "#FF3B30";
      case "outline":
        return "transparent";
      default:
        return "#0052A3";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary":
      case "danger":
        return "#FFFFFF";
      case "secondary":
        return "#1a1a2e";
      case "outline":
        return "#0052A3";
      default:
        return "#FFFFFF";
    }
  };

  const getPadding = () => {
    switch (size) {
      case "small":
        return { paddingHorizontal: 12, paddingVertical: 6 };
      case "medium":
        return { paddingHorizontal: 16, paddingVertical: 10 };
      case "large":
        return { paddingHorizontal: 24, paddingVertical: 14 };
      default:
        return { paddingHorizontal: 16, paddingVertical: 10 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "small":
        return 12;
      case "medium":
        return 14;
      case "large":
        return 16;
      default:
        return 14;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: variant === "outline" ? "#0052A3" : undefined,
          opacity: pressed && !disabled ? 0.8 : 1,
          ...getPadding(),
        },
        style,
      ]}
    >
      <ThemedText
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: getFontSize(),
          },
          textStyle,
        ]}
      >
        {icon ? `${icon} ` : ""}{label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 44,
  },
  text: {
    fontWeight: "600",
  },
});
