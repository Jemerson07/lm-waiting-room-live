import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { searchVehicleModels } from "@/lib/vehicle-models";
import { formatLicensePlate, validateLicensePlate } from "@/types/attendance";

interface AdminCreateAttendanceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  backgroundColor: string;
  cardBackground: string;
  borderColor: string;
  tintColor: string;
  submitting: boolean;
  licensePlate: string;
  setLicensePlate: (value: string) => void;
  vehicleModel: string;
  setVehicleModel: (value: string) => void;
  serviceType: "tire" | "corrective" | "preventive";
  setServiceType: (value: "tire" | "corrective" | "preventive") => void;
  customerName: string;
  setCustomerName: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
}

export function AdminCreateAttendanceModal({
  visible,
  onClose,
  onSubmit,
  backgroundColor,
  cardBackground,
  borderColor,
  tintColor,
  submitting,
  licensePlate,
  setLicensePlate,
  vehicleModel,
  setVehicleModel,
  serviceType,
  setServiceType,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  description,
  setDescription,
}: AdminCreateAttendanceModalProps) {
  const insets = useSafeAreaInsets();
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);

  const vehicleModelSuggestions = useMemo(
    () => (vehicleModel.trim() ? searchVehicleModels(vehicleModel) : []),
    [vehicleModel],
  );

  const normalizedPlate = licensePlate.trim().toUpperCase();
  const hasPlateValue = normalizedPlate.length > 0;
  const isPlateValid = hasPlateValue && validateLicensePlate(normalizedPlate);
  const platePreview = hasPlateValue ? formatLicensePlate(normalizedPlate) : "ABC-1234";
  const descriptionLength = description.trim().length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor,
              paddingBottom: Math.max(insets.bottom, 20) + 20,
            },
          ]}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroTextBlock}>
              <ThemedText type="subtitle">Novo Atendimento</ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                Cadastre o veículo com mais clareza, dados organizados e visual mais profissional para operação diária.
              </ThemedText>
            </View>

            <Pressable onPress={onClose} style={styles.heroCloseButton}>
              <ThemedText style={styles.closeButton}>✕</ThemedText>
            </Pressable>
          </View>

          <View style={styles.heroChips}>
            <View style={[styles.heroChip, { backgroundColor: "rgba(0, 82, 163, 0.08)" }]}>
              <ThemedText style={styles.heroChipText}>2 campos obrigatórios</ThemedText>
            </View>
            <View style={[styles.heroChip, { backgroundColor: "rgba(0, 200, 83, 0.08)" }]}>
              <ThemedText style={styles.heroChipText}>Cadastro guiado</ThemedText>
            </View>
            <View style={[styles.heroChip, { backgroundColor: "rgba(255, 165, 0, 0.10)" }]}>
              <ThemedText style={styles.heroChipText}>Sugestão de modelo</ThemedText>
            </View>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={[styles.sectionCard, { backgroundColor: cardBackground, borderColor }]}> 
              <ThemedText style={styles.sectionTitle}>Dados do veículo</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>Esses dados aparecem primeiro no painel e na tela Live.</ThemedText>

              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <ThemedText style={styles.label}>Placa do veículo *</ThemedText>
                  <ThemedText style={[styles.supportText, isPlateValid && styles.supportTextSuccess]}>
                    {isPlateValid ? "Formato válido" : hasPlateValue ? "Confira o formato" : "Use ABC-1234 ou ABC1D34"}
                  </ThemedText>
                </View>
                <TextInput
                  style={[styles.input, styles.plateInput, { backgroundColor, borderColor }]}
                  value={licensePlate}
                  onChangeText={(value) => setLicensePlate(value.toUpperCase())}
                  placeholder="ABC-1234 ou ABC1D34"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                  maxLength={8}
                />
                <View style={styles.previewRow}>
                  <ThemedText style={styles.previewLabel}>Visualização:</ThemedText>
                  <View style={[styles.platePreview, { borderColor, backgroundColor }]}> 
                    <ThemedText style={styles.platePreviewText}>{platePreview}</ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Modelo do veículo *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor, borderColor }]}
                  value={vehicleModel}
                  onChangeText={(text) => {
                    setVehicleModel(text);
                    setShowModelSuggestions(Boolean(text.trim()));
                  }}
                  onFocus={() => setShowModelSuggestions(Boolean(vehicleModel.trim()))}
                  placeholder="Ex: VW Nivus Highline"
                  placeholderTextColor="#999"
                />
                <ThemedText style={styles.supportText}>Digite parte do modelo para receber sugestões rápidas.</ThemedText>
                {showModelSuggestions && vehicleModelSuggestions.length > 0 ? (
                  <View style={[styles.suggestionsContainer, { backgroundColor, borderColor }]}> 
                    <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                      {vehicleModelSuggestions.map((model, index) => (
                        <Pressable
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setVehicleModel(model);
                            setShowModelSuggestions(false);
                          }}
                        >
                          <ThemedText style={styles.suggestionText}>{model}</ThemedText>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: cardBackground, borderColor }]}> 
              <ThemedText style={styles.sectionTitle}>Tipo de serviço</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>Selecione o tipo principal para melhorar a triagem e os relatórios.</ThemedText>

              <View style={styles.serviceTypeGrid}>
                <Pressable
                  style={[
                    styles.serviceCard,
                    { backgroundColor, borderColor },
                    serviceType === "tire" && { backgroundColor: tintColor, borderColor: tintColor },
                  ]}
                  onPress={() => setServiceType("tire")}
                >
                  <ThemedText style={[styles.serviceCardTitle, serviceType === "tire" && styles.serviceCardTitleActive]}>🔧 Pneu</ThemedText>
                  <ThemedText style={[styles.serviceCardText, serviceType === "tire" && styles.serviceCardTextActive]}>Troca, reparo ou análise ligada ao conjunto de pneus.</ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.serviceCard,
                    { backgroundColor, borderColor },
                    serviceType === "corrective" && { backgroundColor: tintColor, borderColor: tintColor },
                  ]}
                  onPress={() => setServiceType("corrective")}
                >
                  <ThemedText style={[styles.serviceCardTitle, serviceType === "corrective" && styles.serviceCardTitleActive]}>⚠️ Corretiva</ThemedText>
                  <ThemedText style={[styles.serviceCardText, serviceType === "corrective" && styles.serviceCardTextActive]}>Falha detectada, defeito ou necessidade de correção imediata.</ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.serviceCard,
                    { backgroundColor, borderColor },
                    serviceType === "preventive" && { backgroundColor: tintColor, borderColor: tintColor },
                  ]}
                  onPress={() => setServiceType("preventive")}
                >
                  <ThemedText style={[styles.serviceCardTitle, serviceType === "preventive" && styles.serviceCardTitleActive]}>✓ Preventiva</ThemedText>
                  <ThemedText style={[styles.serviceCardText, serviceType === "preventive" && styles.serviceCardTextActive]}>Revisão programada, inspeção ou manutenção de rotina.</ThemedText>
                </Pressable>
              </View>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: cardBackground, borderColor }]}> 
              <ThemedText style={styles.sectionTitle}>Contato do cliente</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>Opcional, mas útil para comunicação futura e histórico.</ThemedText>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Nome do cliente</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor, borderColor }]}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Opcional"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Telefone do cliente (WhatsApp)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor, borderColor }]}
                  value={customerPhone}
                  onChangeText={(value) => setCustomerPhone(value.replace(/[^\d]/g, ""))}
                  placeholder="Somente números"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
                <ThemedText style={styles.supportText}>Digite de 10 a 15 números ou deixe em branco.</ThemedText>
              </View>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: cardBackground, borderColor }]}> 
              <View style={styles.labelRow}>
                <ThemedText style={styles.sectionTitle}>Observações</ThemedText>
                <ThemedText style={styles.supportText}>{descriptionLength}/180</ThemedText>
              </View>
              <ThemedText style={styles.sectionSubtitle}>Use este campo para resumir o problema ou contexto do atendimento.</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor, borderColor }]}
                value={description}
                onChangeText={(value) => setDescription(value.slice(0, 180))}
                placeholder="Ex: veículo chegou com ruído, revisão agendada, cliente aguardando retorno"
                placeholderTextColor="#999"
                multiline
                numberOfLines={5}
              />
            </View>

            <Pressable
              style={[
                styles.submitButton,
                { backgroundColor: tintColor },
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={onSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Criar Atendimento</ThemedText>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "93%",
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 12,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroSubtitle: {
    fontSize: 13,
    opacity: 0.72,
    lineHeight: 20,
    marginTop: 6,
  },
  heroCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    fontSize: 24,
    opacity: 0.6,
  },
  heroChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  heroChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  heroChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#24415B",
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  modalScrollContent: {
    paddingBottom: 12,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 18,
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  supportText: {
    fontSize: 12,
    opacity: 0.65,
  },
  supportTextSuccess: {
    color: "#1C7C54",
    opacity: 1,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  plateInput: {
    letterSpacing: 1.2,
    fontWeight: "700",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  previewLabel: {
    fontSize: 12,
    opacity: 0.65,
  },
  platePreview: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  platePreviewText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderRadius: 12,
    maxHeight: 190,
    marginTop: 10,
    overflow: "hidden",
  },
  suggestionsList: {
    maxHeight: 190,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  suggestionText: {
    fontSize: 14,
  },
  serviceTypeGrid: {
    gap: 10,
  },
  serviceCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  serviceCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  serviceCardText: {
    fontSize: 12,
    opacity: 0.72,
    lineHeight: 18,
  },
  serviceCardTitleActive: {
    color: "#FFFFFF",
  },
  serviceCardTextActive: {
    color: "#FFFFFF",
    opacity: 0.9,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
