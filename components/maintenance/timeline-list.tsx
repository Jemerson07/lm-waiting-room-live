import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import type { MaintenanceTimelineEvent } from "@/types/maintenance";
import { StatusBadge } from "@/components/maintenance/status-badge";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

export function TimelineList({ events }: { events: MaintenanceTimelineEvent[] }) {
  if (!events.length) {
    return <ThemedText style={styles.empty}>Nenhum evento registrado ainda.</ThemedText>;
  }

  return (
    <View style={styles.list}>
      {events.map((event) => (
        <View key={event.id} style={styles.card}>
          <View style={styles.topRow}>
            {event.new_status ? <StatusBadge status={event.new_status} /> : <View />}
            <ThemedText style={styles.date}>{formatDate(event.created_at)}</ThemedText>
          </View>
          <ThemedText type="defaultSemiBold" style={styles.title}>{event.event_type}</ThemedText>
          {event.note ? <ThemedText style={styles.note}>{event.note}</ThemedText> : null}
          {event.old_status && event.new_status ? (
            <ThemedText style={styles.transition}>De {event.old_status} para {event.new_status}</ThemedText>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: { borderRadius: 18, padding: 16, backgroundColor: "rgba(148,163,184,0.12)", gap: 8 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  date: { fontSize: 12, opacity: 0.7, flexShrink: 1, textAlign: "right" },
  title: { textTransform: "capitalize" },
  note: { opacity: 0.82, lineHeight: 20 },
  transition: { fontSize: 12, opacity: 0.62 },
  empty: { opacity: 0.6 },
});
