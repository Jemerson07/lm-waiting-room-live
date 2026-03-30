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
          style={styles.item}
          onPress={() => {
            if (/^https?:\/\//.test(attachment.file_path)) {
              Linking.openURL(attachment.file_path);
            }
          }}
        >
          <View style={styles.textWrap}>
            <ThemedText type="defaultSemiBold">{attachment.file_name}</ThemedText>
            <ThemedText style={styles.meta}>{attachment.file_type ?? "arquivo"}</ThemedText>
            <ThemedText style={styles.path}>{attachment.file_path}</ThemedText>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  item: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: "rgba(148, 163, 184, 0.12)",
  },
  textWrap: {
    gap: 4,
  },
  meta: {
    opacity: 0.65,
    fontSize: 12,
  },
  path: {
    opacity: 0.6,
    fontSize: 12,
  },
  empty: {
    opacity: 0.6,
  },
}
);