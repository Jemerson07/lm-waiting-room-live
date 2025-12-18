import { StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useEffect } from "react";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function AnimatedBackground() {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Animação de movimento vertical suave
    translateY.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 4000 }),
        withTiming(-20, { duration: 4000 })
      ),
      -1,
      false
    );

    // Animação de opacidade pulsante
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 3000 }),
        withTiming(0.3, { duration: 3000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <>
      {/* Gradiente de fundo azul */}
      <LinearGradient
        colors={["#0066CC", "#004C99", "#003366"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Elementos decorativos animados */}
      <Animated.View style={[styles.circle1, animatedStyle]} />
      <Animated.View style={[styles.circle2, animatedStyle]} />
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  circle1: {
    position: "absolute",
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    borderRadius: SCREEN_WIDTH * 0.75,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    top: -SCREEN_WIDTH * 0.5,
    left: -SCREEN_WIDTH * 0.25,
  },
  circle2: {
    position: "absolute",
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: SCREEN_WIDTH * 0.6,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    bottom: -SCREEN_WIDTH * 0.4,
    right: -SCREEN_WIDTH * 0.2,
  },
});
