import { Linking, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import type { MaintenanceAttachment } from "@/types/maintenance";

export function AttachmentList({ attachments }: { attachments: MaintenanceAttachment[] }) {
  if (!attachments.length) {
    return <ThemedText style={styles.empty}>Nenhum anexo disponível.</ThemedText>;
  }

  return (
    <View style={styles.list}>
      {attachments.map((attachment) => (
        <Pressable
          key={attachment.id}
          style={styles.card}
          onPress={() => {
            if (/^https?:\/\//.test(attachment.file_path)) {
              Linking.openURL(attachment.file_path);
            }
          }}
        >
          <ThemedText type="defaultSemiBold">{attachment.file_name}</ThemedText>
          <ThemedText style={styles.meta}>{attachment.file_type ?? "arquivo"}</ThemedText>
          <ThemedText style={styles.path}>{attachment.file_path}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  card: { borderRadius: 16, padding: 14, backgroundColor: "rgba(148,163,184,0.12)", gap: 4 },
  meta: { fontSize: 12, opacity: 0.65 },
  path: { fontSize: 12, opacity: 0.6 },
  empty: { opacity: 0.6 },
});
