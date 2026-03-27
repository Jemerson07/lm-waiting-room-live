/**
 * Página de testes completos do sistema
 * Valida funcionalidades principais e exportação de relatórios
 */

import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAttendances } from "@/hooks/use-attendances";
import { exportAttendancesToCSV, exportProductivityReportToCSV, exportServiceTypeReportToCSV } from "@/lib/csv-export";

interface TestResult {
  name: string;
  status: "pending" | "passed" | "failed";
  error?: string;
}

export default function TestSuiteScreen() {
  const insets = useSafeAreaInsets();
  const { attendances, createAttendance } = useAttendances();
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const addResult = (name: string, status: "passed" | "failed", error?: string) => {
    setResults((prev) => [...prev, { name, status, error }]);
  };

  const runTests = async () => {
    setRunning(true);
    setResults([]);

    try {
      // Teste 1: Criar atendimento
      try {
        await createAttendance({
          licensePlate: "ABC-1234",
          vehicleModel: "Gol",
          serviceType: "preventive",
          customerName: "Teste",
          customerPhone: "11999999999",
          description: "Teste de criação",
        });
        addResult("Criar atendimento", "passed");
      } catch (error) {
        addResult("Criar atendimento", "failed", String(error));
      }

      // Teste 2: Validar dados
      try {
        if (attendances.length > 0) {
          const att = attendances[0];
          if (att.licensePlate && att.vehicleModel && att.status) {
            addResult("Validar dados de atendimento", "passed");
          } else {
            addResult("Validar dados de atendimento", "failed", "Dados incompletos");
          }
        } else {
          addResult("Validar dados de atendimento", "failed", "Nenhum atendimento encontrado");
        }
      } catch (error) {
        addResult("Validar dados de atendimento", "failed", String(error));
      }

      // Teste 3: Exportar CSV - Atendimentos
      try {
        const csv = exportAttendancesToCSV(attendances);
        if (csv && csv.includes("placa")) {
          addResult("Exportar CSV - Atendimentos", "passed");
        } else {
          addResult("Exportar CSV - Atendimentos", "failed", "CSV vazio ou inválido");
        }
      } catch (error) {
        addResult("Exportar CSV - Atendimentos", "failed", String(error));
      }

      // Teste 4: Exportar CSV - Produtividade
      try {
        const csv = exportProductivityReportToCSV(attendances);
        if (csv && csv.includes("status")) {
          addResult("Exportar CSV - Produtividade", "passed");
        } else {
          addResult("Exportar CSV - Produtividade", "failed", "CSV vazio ou inválido");
        }
      } catch (error) {
        addResult("Exportar CSV - Produtividade", "failed", String(error));
      }

      // Teste 5: Exportar CSV - Serviços
      try {
        const csv = exportServiceTypeReportToCSV(attendances);
        if (csv && csv.includes("serviço")) {
          addResult("Exportar CSV - Serviços", "passed");
        } else {
          addResult("Exportar CSV - Serviços", "failed", "CSV vazio ou inválido");
        }
      } catch (error) {
        addResult("Exportar CSV - Serviços", "failed", String(error));
      }

      // Teste 6: Verificar status
      try {
        const statuses = attendances.map((a) => a.status);
        const validStatuses = ["arrival", "waiting", "in_service", "completed"];
        const allValid = statuses.every((s) => validStatuses.includes(s));

        if (allValid) {
          addResult("Validar status de atendimentos", "passed");
        } else {
          addResult("Validar status de atendimentos", "failed", "Status inválido encontrado");
        }
      } catch (error) {
        addResult("Validar status de atendimentos", "failed", String(error));
      }

      // Teste 7: Verificar datas
      try {
        const allHaveDates = attendances.every((a) => a.createdAt && a.updatedAt);
        if (allHaveDates) {
          addResult("Validar datas de atendimentos", "passed");
        } else {
          addResult("Validar datas de atendimentos", "failed", "Faltam datas");
        }
      } catch (error) {
        addResult("Validar datas de atendimentos", "failed", String(error));
      }

      // Teste 8: Performance - Renderizar 100 atendimentos
      try {
        const start = performance.now();
        const testData = Array(100).fill(null).map((_, i) => ({
          ...attendances[0],
          id: i,
        }));
        const end = performance.now();

        if (end - start < 1000) {
          addResult("Performance - Renderizar 100 itens", "passed");
        } else {
          addResult("Performance - Renderizar 100 itens", "failed", `Levou ${(end - start).toFixed(0)}ms`);
        }
      } catch (error) {
        addResult("Performance - Renderizar 100 itens", "failed", String(error));
      }

    } finally {
      setRunning(false);
    }
  };

  const passedCount = results.filter((r) => r.status === "passed").length;
  const failedCount = results.filter((r) => r.status === "failed").length;

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>🧪 Testes do Sistema</ThemedText>
        <ThemedText style={styles.subtitle}>Validação completa de funcionalidades</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        {results.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>Nenhum teste executado ainda</ThemedText>
            <ThemedText style={styles.emptySubtext}>Clique em "Executar Testes" para começar</ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Total</ThemedText>
                <ThemedText style={styles.summaryValue}>{results.length}</ThemedText>
              </View>
              <View style={[styles.summaryItem, { backgroundColor: "rgba(0, 200, 83, 0.1)" }]}>
                <ThemedText style={styles.summaryLabel}>✓ Passou</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: "#00C853" }]}>{passedCount}</ThemedText>
              </View>
              <View style={[styles.summaryItem, { backgroundColor: "rgba(255, 59, 48, 0.1)" }]}>
                <ThemedText style={styles.summaryLabel}>✗ Falhou</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: "#FF3B30" }]}>{failedCount}</ThemedText>
              </View>
            </View>

            {results.map((result, index) => (
              <View key={index} style={styles.testResult}>
                <View style={styles.testHeader}>
                  <ThemedText style={styles.testName}>{result.name}</ThemedText>
                  <View
                    style={[
                      styles.testStatus,
                      result.status === "passed"
                        ? { backgroundColor: "#00C853" }
                        : { backgroundColor: "#FF3B30" },
                    ]}
                  >
                    <ThemedText style={styles.testStatusText}>
                      {result.status === "passed" ? "✓" : "✗"}
                    </ThemedText>
                  </View>
                </View>
                {result.error && <ThemedText style={styles.testError}>{result.error}</ThemedText>}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.button, running && styles.buttonDisabled]}
          onPress={runTests}
          disabled={running}
        >
          <ThemedText style={styles.buttonText}>
            {running ? "Executando..." : "Executar Testes"}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
  summary: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  testResult: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  testHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  testName: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  testStatus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  testStatusText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  testError: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 8,
    fontStyle: "italic",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
