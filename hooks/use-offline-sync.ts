/**
 * Hook para sincronização offline
 * Mantém dados locais sincronizados com o servidor
 * Armazena até 2 semanas de atendimentos
 */

import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "lm_attendances_offline";
const SYNC_INTERVAL = 30000; // 30 segundos
const DATA_RETENTION_DAYS = 14;

interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingChanges: number;
}

export function useOfflineSync() {
  const [syncState, setSyncState] = useState<OfflineSyncState>({
    isOnline: true,
    isSyncing: false,
    lastSync: null,
    pendingChanges: 0,
  });

  // Verificar conectividade
  useEffect(() => {
    const checkOnlineStatus = () => {
      const isOnline = navigator.onLine;
      setSyncState((prev) => ({ ...prev, isOnline }));
    };

    window.addEventListener("online", checkOnlineStatus);
    window.addEventListener("offline", checkOnlineStatus);

    return () => {
      window.removeEventListener("online", checkOnlineStatus);
      window.removeEventListener("offline", checkOnlineStatus);
    };
  }, []);

  // Salvar dados localmente
  const saveOfflineData = useCallback(async (data: any) => {
    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = existingData ? JSON.parse(existingData) : [];

      // Adicionar novo dado
      const updated = [
        ...parsed,
        {
          ...data,
          savedAt: new Date().toISOString(),
          synced: false,
        },
      ];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSyncState((prev) => ({
        ...prev,
        pendingChanges: prev.pendingChanges + 1,
      }));
    } catch (error) {
      console.error("Erro ao salvar dados offline:", error);
    }
  }, []);

  // Limpar dados com mais de 2 semanas
  const cleanOldData = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return;

      const parsed = JSON.parse(data);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - DATA_RETENTION_DAYS);

      const filtered = parsed.filter((item: any) => {
        const itemDate = new Date(item.createdAt || item.savedAt);
        return itemDate > twoWeeksAgo;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Erro ao limpar dados antigos:", error);
    }
  }, []);

  // Sincronizar com servidor
  const syncWithServer = useCallback(async () => {
    if (!syncState.isOnline || syncState.isSyncing) return;

    setSyncState((prev) => ({ ...prev, isSyncing: true }));

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) {
        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          lastSync: new Date(),
        }));
        return;
      }

      const parsed = JSON.parse(data);
      const unsyncedData = parsed.filter((item: any) => !item.synced);

      if (unsyncedData.length === 0) {
        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          lastSync: new Date(),
        }));
        return;
      }

      // Enviar dados para servidor
      const response = await fetch("/api/attendances/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: unsyncedData }),
      });

      if (response.ok) {
        // Marcar como sincronizado
        const synced = parsed.map((item: any) => ({
          ...item,
          synced: true,
        }));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(synced));

        setSyncState((prev) => ({
          ...prev,
          pendingChanges: 0,
          lastSync: new Date(),
        }));
      }
    } catch (error) {
      console.error("Erro ao sincronizar com servidor:", error);
    } finally {
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [syncState.isOnline, syncState.isSyncing]);

  // Sincronizar periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      syncWithServer();
      cleanOldData();
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [syncWithServer, cleanOldData]);

  return {
    ...syncState,
    saveOfflineData,
    syncWithServer,
    cleanOldData,
  };
}
