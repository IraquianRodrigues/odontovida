"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

export interface RealtimeTableConfig {
  table: string;
  queryKeys: readonly QueryKey[];
}

interface UseRealtimeOptions {
  tables: readonly RealtimeTableConfig[];
  schema?: string;
  enabled?: boolean;
}

/**
 * Mantém o cache do React Query sincronizado com alterações feitas diretamente
 * no Supabase ou por outros clientes da aplicação.
 */
export function useRealtimeSubscriptions({
  tables,
  schema = "public",
  enabled = true,
}: UseRealtimeOptions) {
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);
  const tablesRef = useRef(tables);
  tablesRef.current = tables;

  useEffect(() => {
    if (!enabled || tablesRef.current.length === 0) return;

    const invalidateTableQueries = (config: RealtimeTableConfig) => {
      void Promise.all(
        config.queryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey })
        )
      );
    };

    const invalidateAllQueries = () => {
      for (const config of tablesRef.current) {
        invalidateTableQueries(config);
      }
    };

    let hasConnected = false;
    let channel: RealtimeChannel = supabase.channel(
      `odontovida-realtime-${schema}-${Date.now()}`
    );

    for (const config of tablesRef.current) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema, table: config.table },
        (payload) => {
          logger.debug(
            `[Realtime] ${payload.eventType} recebido em ${config.table}`
          );
          invalidateTableQueries(config);
        }
      );
    }

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        logger.info("[Realtime] Dashboard conectado ao Supabase");

        // Ao reconectar, atualiza tudo para recuperar eventos que possam ter
        // ocorrido enquanto a conexão estava indisponível.
        if (hasConnected) invalidateAllQueries();
        hasConnected = true;
        return;
      }

      if (
        status === "CHANNEL_ERROR" ||
        status === "TIMED_OUT" ||
        status === "CLOSED"
      ) {
        logger.warn(`[Realtime] Canal do dashboard: ${status}`);
      }
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient, schema, supabase]);
}
