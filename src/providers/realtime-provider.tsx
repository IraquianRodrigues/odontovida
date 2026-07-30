"use client";

import {
  useRealtimeSubscriptions,
  type RealtimeTableConfig,
} from "@/hooks/use-realtime";

const REALTIME_TABLES: readonly RealtimeTableConfig[] = [
  {
    table: "appointments",
    queryKeys: [
      ["appointments"],
      ["appointment"],
      ["appointments-history"],
      ["dashboard-stats"],
      ["financial-metrics"],
      ["financial-transactions"],
    ],
  },
  {
    table: "transactions",
    queryKeys: [["financial-transactions"], ["financial-metrics"]],
  },
  {
    table: "clientes",
    queryKeys: [["clientes"], ["cliente"]],
  },
  {
    table: "services",
    queryKeys: [
      ["services"],
      ["service"],
      ["available-services"],
      ["duration"],
      ["professional-services"],
      ["appointments"],
      ["appointment"],
    ],
  },
  {
    table: "professionals",
    queryKeys: [
      ["professionals"],
      ["professional"],
      ["available-professionals"],
      ["professional-services"],
      ["professional-schedules"],
      ["appointments"],
      ["appointment"],
      ["financial-transactions"],
    ],
  },
  {
    table: "availability_rules",
    queryKeys: [["business-hours"], ["professional-schedules"]],
  },
  {
    table: "blocked_dates",
    queryKeys: [["business-hours"], ["professional-schedules"]],
  },
];

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtimeSubscriptions({ tables: REALTIME_TABLES });

  return children;
}
