import type { AdminFilterDef } from './filter-definitions'

type QueryLike = {
  eq: (col: string, val: unknown) => QueryLike
  ilike: (col: string, val: string) => QueryLike
  gte: (col: string, val: string) => QueryLike
  lte: (col: string, val: string) => QueryLike
  overlaps: (col: string, val: string[]) => QueryLike
  contains: (col: string, val: Record<string, unknown>) => QueryLike
  filter: (col: string, op: string, val: string) => QueryLike
}

export function applyAdminFilters<T extends QueryLike>(
  query: T,
  filters: Record<string, string>,
  defs: AdminFilterDef[],
): T {
  const defMap = new Map(defs.map((d) => [d.key, d]))

  for (const [key, raw] of Object.entries(filters)) {
    if (!raw?.trim()) continue

    if (key === 'created_from') {
      query = query.gte('created_at', `${raw}T00:00:00.000Z`) as T
      continue
    }
    if (key === 'created_to') {
      query = query.lte('created_at', `${raw}T23:59:59.999Z`) as T
      continue
    }

    const def = defMap.get(key)
    if (!def) continue

    const col = def.column || def.key

    if (def.jsonb) {
      if (def.type === 'multiselect') {
        query = query.contains('details', { [def.key]: [raw] }) as T
      } else {
        query = query.filter(`details->>${def.key}`, 'eq', raw) as T
      }
      continue
    }

    if (def.arrayColumn || def.type === 'multiselect') {
      query = query.overlaps(col, [raw]) as T
      continue
    }

    if (def.type === 'boolean') {
      query = query.eq(col, raw === 'true') as T
      continue
    }

    if (def.type === 'select' || def.type === 'date') {
      query = query.eq(col, raw) as T
      continue
    }
  }

  return query
}
