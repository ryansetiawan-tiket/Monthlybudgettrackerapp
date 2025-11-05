import { useEffect, useRef } from 'react';
import { supabase } from './client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionOptions {
  table: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  enabled?: boolean;
}

/**
 * Custom hook for subscribing to Supabase Realtime changes
 * 
 * This hook subscribes to PostgreSQL changes on the specified table
 * and calls the appropriate callbacks when data changes.
 * 
 * @example
 * useRealtimeSubscription({
 *   table: 'kv_store_3adbeaf1',
 *   filter: `key=like.budget_2024-11%`,
 *   onUpdate: (payload) => {
 *     console.log('Data updated:', payload);
 *     refreshData();
 *   },
 *   enabled: true
 * });
 */
export function useRealtimeSubscription({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true
}: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Create a unique channel name
    const channelName = `realtime:${table}${filter ? `:${filter}` : ''}:${Date.now()}`;
    
    // Subscribe to changes
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          console.log('Realtime event received:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload);
              break;
            case 'UPDATE':
              onUpdate?.(payload);
              break;
            case 'DELETE':
              onDelete?.(payload);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        console.log('Unsubscribing from realtime channel:', channelName);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, filter, enabled]);

  return channelRef;
}
