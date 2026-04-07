import { useEffect } from "react";
import { Easing } from "react-native-reanimated";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface LiveMotionBlockProps {
  children: React.ReactNode;
  delay?: number;
  intensity?: "soft" | "medium";
}

export function LiveMotionBlock({
  children,
  delay = 0,
  intensity = "soft",
}: LiveMotionBlockProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(18);
  const floatOffset = useSharedValue(0);

  const floatAmount = intensity === "medium" ? 4 : 2;

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 550 }));
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 550, easing: Easing.out(Easing.cubic) }),
    );

    floatOffset.value = withDelay(
      delay + 500,
      withRepeat(
        withSequence(
          withTiming(-floatAmount, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, floatAmount, floatOffset, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value + floatOffset.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
