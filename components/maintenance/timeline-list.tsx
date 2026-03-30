import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { StatusBadge } from "@/components/maintenance/status-badge";
import type { MaintenanceTimelineEvent } from "@/types/maintenance";

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
        <View key={event.id} style={styles.item}>
          <View style={styles.header}>
            {event.new_status ? <StatusBadge status={event.new_status} /> : null}
            <ThemedText style={styles.date}>{formatDate(event.created_at)}</ThemedText>
          </View>
          <ThemedText style={styles.eventType}>{event.event_type}</ThemedText>
          {event.note ? <ThemedText style={styles.note}>{event.note}</ThemedText> : null}
          {event.old_status && event.new_status ? (
            <ThemedText style={styles.change}>De {event.old_status} para {event.new_status}</ThemedText>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  item: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "rgba(148, 163, 184, 0.12)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
    flexShrink: 1,
    textAlign: "right",
  },
  eventType: {
    fontSize: 15,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  note: {
    marginTop: 8,
    opacity: 0.8,
  },
  change: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.65,
  },
  empty: {
    opacity: 0.6,
  },
});
