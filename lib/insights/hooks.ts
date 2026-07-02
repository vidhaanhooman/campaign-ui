"use client"

// The data-fetching seam. Today these wrap the synchronous mock resolver and
// fake a brief loading state; to go live, replace the bodies with your real
// API calls / query hooks — the return shape (DataResult<T>) stays the same and
// no widget component changes.

import * as React from "react"
import {
  resolveAgentTable,
  resolveAttemptWise,
  resolveConversations,
  resolveDurationFunnel,
  resolveGrouped,
  resolveInboundAgentTable,
  resolveInboundSeries,
  resolveInboundSummary,
  resolveKpiSummary,
  resolveMetricSeries,
  resolveMultiScalar,
  resolveMultiSeries,
  resolveNumberWise,
  resolveOutboundSummary,
  resolvePickupByTime,
  resolveScalar,
  resolveSeries,
  type AgentRow,
  type AttemptWiseRow,
  type ConversationPoint,
  type FunnelStage,
  type GroupPoint,
  type InboundAgentRow,
  type InboundSeriesPoint,
  type InboundSummary,
  type KpiSummary,
  type MetricPoint,
  type MetricSpec,
  type MultiPoint,
  type NumberWiseRow,
  type OutboundSummary,
  type SeriesPoint,
} from "./resolver"
import type { DataResult, FilterClause, Metric, TimeRange } from "./types"

// Brief loading whenever `key` changes. setState only fires inside the timeout
// (async), and the loading flag is derived during render — so no synchronous
// setState-in-effect and no cascading renders.
function useLoadingFor(key: string): boolean {
  const [readyKey, setReadyKey] = React.useState<string | null>(null)
  React.useEffect(() => {
    const id = setTimeout(() => setReadyKey(key), 220)
    return () => clearTimeout(id)
  }, [key])
  return readyKey !== key
}

export function useScalar(
  metric: Metric,
  range: TimeRange,
  refreshKey = 0,
  where: FilterClause[] = []
): DataResult<{ value: number }> {
  const fk = JSON.stringify(where)
  const loading = useLoadingFor(`scalar|${metric.id}|${range}|${refreshKey}|${fk}`)
  const data = React.useMemo(
    () => ({ value: resolveScalar(metric, range, where) }),
    // refreshKey intentionally re-runs resolution when the user hits Refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metric, range, refreshKey, fk]
  )
  return { data, loading }
}

export function useSeries(
  range: TimeRange,
  refreshKey = 0
): DataResult<SeriesPoint[]> {
  const loading = useLoadingFor(`series|${range}|${refreshKey}`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = React.useMemo(() => resolveSeries(range), [range, refreshKey])
  return { data, loading }
}

export function useMetricSeries(
  metric: Metric | undefined,
  range: TimeRange,
  refreshKey = 0,
  where: FilterClause[] = []
): DataResult<MetricPoint[]> {
  const fk = JSON.stringify(where)
  const loading = useLoadingFor(
    `metricseries|${metric?.id ?? "none"}|${range}|${refreshKey}|${fk}`
  )
  const data = React.useMemo(
    () => (metric ? resolveMetricSeries(metric, range, where) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metric, range, refreshKey, fk]
  )
  return { data, loading }
}

export function useMultiSeries(
  specs: MetricSpec[],
  range: TimeRange,
  refreshKey = 0
): DataResult<MultiPoint[]> {
  const key = specs
    .map((s) => `${s.metric.id}:${JSON.stringify(s.where)}`)
    .join("|")
  const loading = useLoadingFor(`multiseries|${key}|${range}|${refreshKey}`)
  const data = React.useMemo(
    () => resolveMultiSeries(specs, range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, range, refreshKey]
  )
  return { data, loading }
}

export function useMultiScalar(
  specs: MetricSpec[],
  range: TimeRange,
  refreshKey = 0
): DataResult<GroupPoint[]> {
  const key = specs
    .map((s) => `${s.metric.id}:${JSON.stringify(s.where)}`)
    .join("|")
  const loading = useLoadingFor(`multiscalar|${key}|${range}|${refreshKey}`)
  const data = React.useMemo(
    () => resolveMultiScalar(specs, range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, range, refreshKey]
  )
  return { data, loading }
}

export function useGrouped(
  field: string,
  range: TimeRange,
  refreshKey = 0,
  where: FilterClause[] = []
): DataResult<GroupPoint[]> {
  const fk = JSON.stringify(where)
  const loading = useLoadingFor(`grouped|${field}|${range}|${refreshKey}|${fk}`)
  const data = React.useMemo(
    () => resolveGrouped(field, range, where),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field, range, refreshKey, fk]
  )
  return { data, loading }
}

export function useAgentTable(
  range: TimeRange,
  refreshKey = 0
): DataResult<AgentRow[]> {
  const loading = useLoadingFor(`agents|${range}|${refreshKey}`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = React.useMemo(() => resolveAgentTable(range), [range, refreshKey])
  return { data, loading }
}

export function useDurationFunnel(
  range: TimeRange,
  refreshKey = 0
): DataResult<FunnelStage[]> {
  const loading = useLoadingFor(`funnel|${range}|${refreshKey}`)
  const data = React.useMemo(
    () => resolveDurationFunnel(range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, refreshKey]
  )
  return { data, loading }
}

export function useConversations(
  range: TimeRange,
  refreshKey = 0
): DataResult<ConversationPoint[]> {
  const loading = useLoadingFor(`conversations|${range}|${refreshKey}`)
  const data = React.useMemo(
    () => resolveConversations(range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, refreshKey]
  )
  return { data, loading }
}

export function useKpiSummary(
  range: TimeRange,
  refreshKey = 0
): DataResult<KpiSummary> {
  const loading = useLoadingFor(`kpi|${range}|${refreshKey}`)
  const data = React.useMemo(
    () => resolveKpiSummary(range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, refreshKey]
  )
  return { data, loading }
}

export function useInboundSummary(
  range: TimeRange,
  refreshKey = 0
): DataResult<InboundSummary> {
  const loading = useLoadingFor(`inbound|${range}|${refreshKey}`)
  const data = React.useMemo(
    () => resolveInboundSummary(range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, refreshKey]
  )
  return { data, loading }
}

export function useOutboundSummary(
  range: TimeRange,
  refreshKey = 0
): DataResult<OutboundSummary> {
  const loading = useLoadingFor(`outbound|${range}|${refreshKey}`)
  const data = React.useMemo(
    () => resolveOutboundSummary(range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, refreshKey]
  )
  return { data, loading }
}

export function useInboundSeries(
  range: TimeRange,
  refreshKey = 0
): DataResult<InboundSeriesPoint[]> {
  const loading = useLoadingFor(`inboundseries|${range}|${refreshKey}`)
  const data = React.useMemo(
    () => resolveInboundSeries(range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, refreshKey]
  )
  return { data, loading }
}

export function useInboundAgentTable(
  range: TimeRange,
  refreshKey = 0
): DataResult<InboundAgentRow[]> {
  const loading = useLoadingFor(`inboundagents|${range}|${refreshKey}`)
  const data = React.useMemo(
    () => resolveInboundAgentTable(range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, refreshKey]
  )
  return { data, loading }
}

export function useNumberWise(
  range: TimeRange,
  refreshKey = 0
): DataResult<NumberWiseRow[]> {
  const loading = useLoadingFor(`numberwise|${range}|${refreshKey}`)
  const data = React.useMemo(
    () => resolveNumberWise(range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, refreshKey]
  )
  return { data, loading }
}

export function useAttemptWise(
  range: TimeRange,
  refreshKey = 0
): DataResult<AttemptWiseRow[]> {
  const loading = useLoadingFor(`attemptwise|${range}|${refreshKey}`)
  const data = React.useMemo(
    () => resolveAttemptWise(range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, refreshKey]
  )
  return { data, loading }
}

export function usePickupByTime(
  range: TimeRange,
  refreshKey = 0
): DataResult<MetricPoint[]> {
  const loading = useLoadingFor(`pickupbytime|${range}|${refreshKey}`)
  const data = React.useMemo(
    () => resolvePickupByTime(range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, refreshKey]
  )
  return { data, loading }
}
