import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";

export function QuickLinkCard({
  href,
  title,
  description,
  emoji,
}: {
  href: string;
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <Link href={href as never} asChild>
      <Pressable style={styles.card}>
        <View style={styles.emojiWrap}>
          <ThemedText style={styles.emoji}>{emoji}</ThemedText>
        </View>
        <View style={styles.textWrap}>
          <ThemedText type="defaultSemiBold">{title}</ThemedText>
          <ThemedText style={styles.description}>{description}</ThemedText>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 14,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(15, 23, 42, 0.06)",
    alignItems: "center",
  },
  emojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 24,
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  description: {
    opacity: 0.7,
    lineHeight: 20,
  },
}
);