import { StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function NivusBackground() {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    // Animação de movimento horizontal suave (parallax)
    translateX.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 8000 }),
        withTiming(-30, { duration: 8000 })
      ),
      -1,
      false
    );

    // Animação de zoom suave
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 10000 }),
        withTiming(1, { duration: 10000 })
      ),
      -1,
      false
    );

    // Animação de opacidade pulsante
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 4000 }),
        withTiming(0.25, { duration: 4000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
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

      {/* Imagem do VW Nivus com animação */}
      <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
        <Image
          source={require("@/assets/images/nivus-background.jpg")}
          style={styles.image}
          contentFit="cover"
        />
      </Animated.View>

      {/* Overlay para garantir legibilidade do texto */}
      <LinearGradient
        colors={["rgba(0, 102, 204, 0.7)", "rgba(0, 51, 102, 0.8)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.overlay}
      />
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
  imageContainer: {
    position: "absolute",
    left: -50,
    right: -50,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_WIDTH + 100,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
