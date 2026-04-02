import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { subscribeAccessFeedback, type AccessFeedback } from "@/lib/access-feedback";
import { ThemedText } from "@/components/themed-text";

export function GlobalAccessFeedbackBanner() {
  const [feedback, setFeedback] = useState<AccessFeedback | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeAccessFeedback((nextFeedback) => {
      setFeedback(nextFeedback);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 4200);
    return () => clearTimeout(timeout);
  }, [feedback]);

  if (!feedback) return null;

  const isUnauthorized = feedback.kind === "unauthorized";

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View
        style={[
          styles.banner,
          {
            backgroundColor: isUnauthorized ? "rgba(179, 38, 30, 0.95)" : "rgba(161, 98, 7, 0.95)",
          },
        ]}
      >
        <View style={styles.textBlock}>
          <ThemedText style={styles.title}>{feedback.title}</ThemedText>
          <ThemedText style={styles.message}>{feedback.message}</ThemedText>
        </View>
        <Pressable onPress={() => setFeedback(null)} style={styles.closeButton}>
          <ThemedText style={styles.closeText}>✕</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
    paddingHorizontal: 16,
  },
  banner: {
    width: "100%",
    maxWidth: 780,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 7,
  },
  textBlock: { flex: 1 },
  title: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  message: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    lineHeight: 20,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  closeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
