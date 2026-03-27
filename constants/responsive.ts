/**
 * Sistema de Responsividade e Espaçamento
 * Define breakpoints, espaçamento e tamanhos para múltiplos dispositivos
 */

import { useWindowDimensions } from "react-native";

// ============================================================================
// BREAKPOINTS - Definem tamanhos de tela
// ============================================================================

export const BREAKPOINTS = {
  // Celular pequeno (iPhone SE, Galaxy A10)
  xs: 320,
  // Celular normal (iPhone 12, Galaxy S21)
  sm: 375,
  // Celular grande (iPhone 14 Pro Max, Galaxy S21 Ultra)
  md: 414,
  // Tablet pequeno (iPad Mini)
  lg: 768,
  // Tablet grande (iPad Pro 11")
  xl: 1024,
  // Desktop
  desktop: 1280,
  // TV 4K
  tv: 1920,
  // TV 8K
  tv4k: 3840,
} as const;

// ============================================================================
// DEVICE TYPES - Categorias de dispositivos
// ============================================================================

export enum DeviceType {
  MOBILE_SMALL = "mobile_small", // < 375px
  MOBILE = "mobile", // 375-480px
  MOBILE_LARGE = "mobile_large", // 480-768px
  TABLET = "tablet", // 768-1024px
  TABLET_LARGE = "tablet_large", // 1024-1280px
  DESKTOP = "desktop", // 1280-1920px
  TV = "tv", // 1920-3840px
  TV_4K = "tv_4k", // > 3840px
}

// ============================================================================
// ESPAÇAMENTO - Sistema 8px grid
// ============================================================================

export const SPACING = {
  // Micro
  xs: 4,
  // Extra small
  sm: 8,
  // Small
  md: 12,
  // Medium
  lg: 16,
  // Large
  xl: 24,
  // Extra large
  xxl: 32,
  // Huge
  xxxl: 48,
  // Massive
  massive: 64,
} as const;

// ============================================================================
// TAMANHOS DE FONTE - Responsivos
// ============================================================================

export const FONT_SIZES = {
  // Captions e labels
  caption: 12,
  // Small text
  small: 14,
  // Body text
  body: 16,
  // Subtitle
  subtitle: 18,
  // Heading 3
  h3: 20,
  // Heading 2
  h2: 24,
  // Heading 1
  h1: 32,
  // Display (TV)
  display: 48,
} as const;

// ============================================================================
// ALTURA DE COMPONENTES
// ============================================================================

export const COMPONENT_HEIGHTS = {
  // Botão pequeno
  buttonSmall: 32,
  // Botão normal
  button: 44,
  // Botão grande
  buttonLarge: 56,
  // Input
  input: 44,
  // Card
  card: 120,
  // Card grande
  cardLarge: 200,
  // Header
  header: 56,
  // Tab bar
  tabBar: 56,
} as const;

// ============================================================================
// BORDER RADIUS - Arredondamento
// ============================================================================

export const BORDER_RADIUS = {
  // Pequeno
  sm: 4,
  // Normal
  md: 8,
  // Grande
  lg: 12,
  // Extra grande
  xl: 16,
  // Redondo
  round: 24,
  // Circular
  circle: 9999,
} as const;

// ============================================================================
// SOMBRAS
// ============================================================================

export const SHADOWS = {
  // Sem sombra
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Sombra leve
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Sombra normal
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  // Sombra grande
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// ============================================================================
// HOOK - Detectar tipo de dispositivo
// ============================================================================

export function useDeviceType(): DeviceType {
  const { width } = useWindowDimensions();

  if (width < 375) return DeviceType.MOBILE_SMALL;
  if (width < 480) return DeviceType.MOBILE;
  if (width < 768) return DeviceType.MOBILE_LARGE;
  if (width < 1024) return DeviceType.TABLET;
  if (width < 1280) return DeviceType.TABLET_LARGE;
  if (width < 1920) return DeviceType.DESKTOP;
  if (width < 3840) return DeviceType.TV;
  return DeviceType.TV_4K;
}

// ============================================================================
// HOOK - Obter espaçamento responsivo
// ============================================================================

export function useResponsiveSpacing() {
  const deviceType = useDeviceType();

  const getSpacing = (baseSpacing: number): number => {
    switch (deviceType) {
      case DeviceType.MOBILE_SMALL:
        return Math.round(baseSpacing * 0.75);
      case DeviceType.MOBILE:
      case DeviceType.MOBILE_LARGE:
        return baseSpacing;
      case DeviceType.TABLET:
      case DeviceType.TABLET_LARGE:
        return Math.round(baseSpacing * 1.25);
      case DeviceType.DESKTOP:
        return Math.round(baseSpacing * 1.5);
      case DeviceType.TV:
        return Math.round(baseSpacing * 2);
      case DeviceType.TV_4K:
        return Math.round(baseSpacing * 3);
      default:
        return baseSpacing;
    }
  };

  return {
    xs: getSpacing(SPACING.xs),
    sm: getSpacing(SPACING.sm),
    md: getSpacing(SPACING.md),
    lg: getSpacing(SPACING.lg),
    xl: getSpacing(SPACING.xl),
    xxl: getSpacing(SPACING.xxl),
    xxxl: getSpacing(SPACING.xxxl),
    massive: getSpacing(SPACING.massive),
  };
}

// ============================================================================
// HOOK - Obter tamanho de fonte responsivo
// ============================================================================

export function useResponsiveFontSize() {
  const deviceType = useDeviceType();

  const getFontSize = (baseFontSize: number): number => {
    switch (deviceType) {
      case DeviceType.MOBILE_SMALL:
        return Math.round(baseFontSize * 0.85);
      case DeviceType.MOBILE:
      case DeviceType.MOBILE_LARGE:
        return baseFontSize;
      case DeviceType.TABLET:
      case DeviceType.TABLET_LARGE:
        return Math.round(baseFontSize * 1.1);
      case DeviceType.DESKTOP:
        return Math.round(baseFontSize * 1.2);
      case DeviceType.TV:
        return Math.round(baseFontSize * 1.8);
      case DeviceType.TV_4K:
        return Math.round(baseFontSize * 2.5);
      default:
        return baseFontSize;
    }
  };

  return {
    caption: getFontSize(FONT_SIZES.caption),
    small: getFontSize(FONT_SIZES.small),
    body: getFontSize(FONT_SIZES.body),
    subtitle: getFontSize(FONT_SIZES.subtitle),
    h3: getFontSize(FONT_SIZES.h3),
    h2: getFontSize(FONT_SIZES.h2),
    h1: getFontSize(FONT_SIZES.h1),
    display: getFontSize(FONT_SIZES.display),
  };
}

// ============================================================================
// HOOK - Obter dimensões responsivas
// ============================================================================

export function useResponsiveDimensions() {
  const { width, height } = useWindowDimensions();
  const deviceType = useDeviceType();
  const spacing = useResponsiveSpacing();

  return {
    width,
    height,
    deviceType,
    isPortrait: height > width,
    isLandscape: width > height,
    isMobile: deviceType.includes("mobile"),
    isTablet: deviceType.includes("tablet"),
    isDesktop: deviceType === DeviceType.DESKTOP,
    isTV: deviceType.includes("tv"),
    spacing,
    contentWidth: Math.min(width - spacing.lg * 2, 1200),
  };
}

// ============================================================================
// MEDIA QUERY HELPERS - Para web
// ============================================================================

export const MEDIA_QUERIES = {
  mobile: "@media (max-width: 480px)",
  mobileLarge: "@media (max-width: 768px)",
  tablet: "@media (min-width: 768px) and (max-width: 1024px)",
  desktop: "@media (min-width: 1024px) and (max-width: 1920px)",
  tv: "@media (min-width: 1920px)",
  tv4k: "@media (min-width: 3840px)",
} as const;

// ============================================================================
// UTILITY - Obter espaçamento baseado em dispositivo
// ============================================================================

export function getResponsiveValue<T>(
  mobileSmall: T,
  mobile: T,
  tablet: T,
  desktop: T,
  tv: T
): (deviceType: DeviceType) => T {
  return (deviceType: DeviceType) => {
    switch (deviceType) {
      case DeviceType.MOBILE_SMALL:
        return mobileSmall;
      case DeviceType.MOBILE:
      case DeviceType.MOBILE_LARGE:
        return mobile;
      case DeviceType.TABLET:
      case DeviceType.TABLET_LARGE:
        return tablet;
      case DeviceType.DESKTOP:
        return desktop;
      case DeviceType.TV:
      case DeviceType.TV_4K:
        return tv;
      default:
        return mobile;
    }
  };
}
