import { StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function NivusBackground() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Animação de movimento horizontal suave (parallax)
    translateX.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-50, { duration: 12000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // Animação de movimento vertical suave
    translateY.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 15000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-20, { duration: 15000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // Animação de zoom suave
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 16000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 16000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // Animação de opacidade pulsante (mais visível)
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.55, { duration: 5000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // Rotação suave
    rotation.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 20000, easing: Easing.linear }),
        withTiming(-2, { duration: 20000, easing: Easing.linear })
      ),
      -1,
      false
    );
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <>
      {/* Gradiente de fundo azul com mais transparência */}
      <LinearGradient
        colors={["#0052A3", "#003D7A", "#002952"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Imagem do VW Nivus com animação - MAIS VISÍVEL */}
      <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
        <Image
          source={require("@/assets/images/nivus-background.jpg")}
          style={styles.image}
          contentFit="cover"
        />
      </Animated.View>

      {/* Overlay mais leve para melhor visibilidade */}
      <LinearGradient
        colors={["rgba(0, 82, 163, 0.3)", "rgba(0, 61, 122, 0.4)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.overlay}
      />

      {/* Efeito de brilho adicional */}
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.05)", "transparent", "rgba(0, 0, 0, 0.1)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gloss}
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
    left: -100,
    right: -100,
    top: -50,
    bottom: -50,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_WIDTH + 200,
    height: SCREEN_HEIGHT + 100,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gloss: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
