import { StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

export function NivusBackground() {
  const { width, height } = useWindowDimensions();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1.04);
  const opacity = useSharedValue(0.88);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(18, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-18, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        withTiming(12, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 16000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.02, { duration: 16000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.94, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.82, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [opacity, scale, translateX, translateY]);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <>
      <LinearGradient
        colors={["#041A2D", "#063A67", "#02111E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.imageLayer, animatedImageStyle]}>
        <Image
          source={require("@/assets/images/nivus-background.jpg")}
          style={{ width: width * 1.14, height: height * 1.14 }}
          contentFit="cover"
          contentPosition="center"
          transition={250}
        />
      </Animated.View>

      <LinearGradient
        colors={["rgba(2, 10, 18, 0.18)", "rgba(3, 21, 37, 0.38)", "rgba(1, 7, 14, 0.72)"]}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.75, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={["rgba(255,255,255,0.10)", "transparent", "rgba(0,0,0,0.30)"]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.atmosphere}
      />
    </>
  );
}

const styles = StyleSheet.create({
  imageLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  atmosphere: {
    ...StyleSheet.absoluteFillObject,
  },
});
