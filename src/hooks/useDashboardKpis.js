/* eslint-disable */
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { BACKEND_URL } from "../constants"; // Make sure this is set to http://localhost:8080

async function fetchDashboardKpis({ email, from, to }) {
  const params = new URLSearchParams();
  if (email) params.set("email", email);
  if (from) params.set("from", new Date(from).toISOString());
  if (to) params.set("to", new Date(to).toISOString());

  // Optional: prevent cache from interfering during dev
  params.set("_t", Date.now().toString());

  const url = `${BACKEND_URL}/api/dashboard/kpis?${params.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    },
    cache: "no-store",
  });

  // Handle "Not Modified" gracefully
  if (res.status === 304) return undefined;

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to fetch KPIs (${res.status})`);
  }

  return res.json();
}

export default function useDashboardKpis({ from = null, to = null, enabled = true } = {}) {
  const me = useSelector((s) => s.me?.me);
  const email = me?.email;

  const query = useQuery({
    queryKey: ["dashboard-kpis", { email: email || "implicit", from, to }],
    queryFn: () => fetchDashboardKpis({ email, from, to }),
    enabled: enabled && !!email, // Prevent premature call
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const kpis = query.data || {
    dataSources: 0,
    totalPipelines: 0,
    successPipelines: 0,
    accessibleWorkspaces: 0,
  };

  return { ...query, kpis };
}