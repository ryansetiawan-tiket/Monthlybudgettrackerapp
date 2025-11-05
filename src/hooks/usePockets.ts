import { useState, useCallback } from 'react';
import { getBaseUrl } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Pocket {
  id: string;
  name: string;
  type: string;
  icon?: string;
  color?: string;
  isArchived?: boolean;
  createdAt?: string;
}

interface PocketBalance {
  pocketId: string;
  originalBalance: number;
  transferInBalance: number;
  transferOutBalance: number;
  availableBalance: number;
}

export function usePockets() {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [archivedPockets, setArchivedPockets] = useState<Pocket[]>([]);
  const [balances, setBalances] = useState<Map<string, PocketBalance>>(new Map());
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isManagePocketsDialogOpen, setIsManagePocketsDialogOpen] = useState(false);
  const [defaultFromPocket, setDefaultFromPocket] = useState<string | undefined>(undefined);
  const [defaultToPocket, setDefaultToPocket] = useState<string | undefined>(undefined);
  const [defaultTargetPocket, setDefaultTargetPocket] = useState<string | undefined>(undefined);
  const [editingPocket, setEditingPocket] = useState<Pocket | null>(null);
  const [pocketsRefreshKey, setPocketsRefreshKey] = useState(0);

  const baseUrl = getBaseUrl(projectId);

  // Fetch pockets and balances (combined in one API call)
  const fetchPockets = useCallback(async (year: number, month: number) => {
    try {
      const response = await fetch(
        `${baseUrl}/pockets/${year}/${month}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pockets");
      }

      const data = await response.json();
      const allPockets = data.success ? (data.data.pockets || []) : (data.pockets || []);
      const activePockets = allPockets.filter((p: Pocket) => !p.isArchived);
      const archived = allPockets.filter((p: Pocket) => p.isArchived);
      
      setPockets(activePockets);
      setArchivedPockets(archived);
      
      // Also update balances from the same response
      const balances = data.success ? (data.data.balances || []) : (data.balances || []);
      const balanceMap = new Map<string, PocketBalance>();
      balances.forEach((balance: PocketBalance) => {
        balanceMap.set(balance.pocketId, balance);
      });
      setBalances(balanceMap);
    } catch (error) {
      console.error("Error fetching pockets:", error);
      toast.error("Gagal memuat kantong");
    }
  }, [baseUrl]);

  // Fetch pocket balances (combined with pockets fetch)
  const fetchBalances = useCallback(async (year: number, month: number) => {
    try {
      const response = await fetch(
        `${baseUrl}/pockets/${year}/${month}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch balances");
      }

      const data = await response.json();
      const balances = data.success ? (data.data.balances || []) : (data.balances || []);
      const balanceMap = new Map<string, PocketBalance>();
      
      balances.forEach((balance: PocketBalance) => {
        balanceMap.set(balance.pocketId, balance);
      });
      
      setBalances(balanceMap);
    } catch (error) {
      console.error("Error fetching balances:", error);
      toast.error("Gagal memuat saldo kantong");
    }
  }, [baseUrl]);

  // Create pocket
  const createPocket = useCallback(async (
    year: number,
    month: number,
    pocketData: { name: string; type: string; icon?: string; color?: string }
  ) => {
    try {
      const response = await fetch(
        `${baseUrl}/pockets/${year}/${month}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pocketData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create pocket");
      }

      toast.success("Kantong berhasil dibuat!");
      await fetchPockets(year, month);
      return true;
    } catch (error) {
      console.error("Error creating pocket:", error);
      toast.error("Gagal membuat kantong");
      return false;
    }
  }, [baseUrl, fetchPockets]);

  // Update pocket
  const updatePocket = useCallback(async (
    year: number,
    month: number,
    pocketId: string,
    updates: Partial<Pocket>
  ) => {
    try {
      const response = await fetch(
        `${baseUrl}/pockets/${year}/${month}/${pocketId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update pocket");
      }

      toast.success("Kantong berhasil diupdate!");
      await fetchPockets(year, month);
      return true;
    } catch (error) {
      console.error("Error updating pocket:", error);
      toast.error("Gagal mengupdate kantong");
      return false;
    }
  }, [baseUrl, fetchPockets]);

  // Delete pocket
  const deletePocket = useCallback(async (
    year: number,
    month: number,
    pocketId: string
  ) => {
    try {
      const response = await fetch(
        `${baseUrl}/pockets/${year}/${month}/${pocketId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete pocket");
      }

      toast.success("Kantong berhasil dihapus!");
      await fetchPockets(year, month);
      return true;
    } catch (error) {
      console.error("Error deleting pocket:", error);
      toast.error("Gagal menghapus kantong");
      return false;
    }
  }, [baseUrl, fetchPockets]);

  // Transfer between pockets
  const transferBetweenPockets = useCallback(async (
    year: number,
    month: number,
    transferData: {
      fromPocketId: string;
      toPocketId: string;
      amount: number;
      date: string;
      note?: string;
    }
  ) => {
    try {
      const response = await fetch(
        `${baseUrl}/transfers/${year}/${month}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transferData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to transfer");
      }

      toast.success("Transfer berhasil!");
      await fetchBalances(year, month);
      setPocketsRefreshKey(prev => prev + 1);
      return true;
    } catch (error) {
      console.error("Error transferring:", error);
      toast.error("Gagal melakukan transfer");
      return false;
    }
  }, [baseUrl, fetchBalances]);

  // Refresh pockets data
  const refreshPockets = useCallback(() => {
    setPocketsRefreshKey(prev => prev + 1);
  }, []);

  return {
    pockets,
    setPockets,
    archivedPockets,
    setArchivedPockets,
    balances,
    setBalances,
    isTransferDialogOpen,
    setIsTransferDialogOpen,
    isManagePocketsDialogOpen,
    setIsManagePocketsDialogOpen,
    defaultFromPocket,
    setDefaultFromPocket,
    defaultToPocket,
    setDefaultToPocket,
    defaultTargetPocket,
    setDefaultTargetPocket,
    editingPocket,
    setEditingPocket,
    pocketsRefreshKey,
    fetchPockets,
    fetchBalances,
    createPocket,
    updatePocket,
    deletePocket,
    transferBetweenPockets,
    refreshPockets,
  };
}
