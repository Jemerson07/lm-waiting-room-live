import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import type { MaintenanceAttachment } from "@/types/maintenance";

function isImage(attachment: MaintenanceAttachment) {
  const path = attachment.file_path.toLowerCase();
  const type = (attachment.file_type ?? "").toLowerCase();
  return type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(path);
}

function isPdf(attachment: MaintenanceAttachment) {
  const path = attachment.file_path.toLowerCase();
  const type = (attachment.file_type ?? "").toLowerCase();
  return type.includes("pdf") || path.endsWith(".pdf");
}

function canOpenUrl(path: string) {
  return /^https?:\/\//i.test(path);
}

export function AttachmentGallery({ attachments }: { attachments: MaintenanceAttachment[] }) {
  if (!attachments.length) {
    return <ThemedText style={styles.empty}>Nenhuma evidência disponível.</ThemedText>;
  }

  return (
    <View style={styles.grid}>
      {attachments.map((attachment) => {
        const image = isImage(attachment);
        const pdf = isPdf(attachment);
        return (
          <Pressable
            key={attachment.id}
            style={styles.card}
            onPress={() => {
              if (canOpenUrl(attachment.file_path)) {
                Linking.openURL(attachment.file_path);
              }
            }}
          >
            {image ? (
              <Image source={{ uri: attachment.file_path }} style={styles.previewImage} contentFit="cover" />
            ) : (
              <View style={[styles.previewFallback, pdf ? styles.previewPdf : styles.previewFile]}>
                <ThemedText style={styles.previewLabel}>{pdf ? "PDF" : "ARQ"}</ThemedText>
              </View>
            )}

            <View style={styles.content}>
              <ThemedText type="defaultSemiBold" numberOfLines={2}>{attachment.file_name}</ThemedText>
              <ThemedText style={styles.meta}>{attachment.file_type ?? "arquivo"}</ThemedText>
              <ThemedText style={styles.path} numberOfLines={2}>{attachment.file_path}</ThemedText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 12 },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  previewImage: {
    width: "100%",
    height: 180,
    backgroundColor: "rgba(15,23,42,0.06)",
  },
  previewFallback: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  previewPdf: { backgroundColor: "rgba(239,68,68,0.12)" },
  previewFile: { backgroundColor: "rgba(59,130,246,0.12)" },
  previewLabel: {
    fontSize: 24,
    fontWeight: "800",
  },
  content: {
    padding: 14,
    gap: 4,
  },
  meta: {
    fontSize: 12,
    opacity: 0.65,
  },
  path: {
    fontSize: 12,
    opacity: 0.56,
  },
  empty: {
    opacity: 0.6,
  },
}
