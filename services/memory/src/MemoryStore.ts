import type { MemoryEntry, MemoryKind } from '@xandrix/types';

/**
 * In-memory store for workspace memory entries.
 * In production this is backed by the database with vector search support.
 */
export class MemoryStore {
  private entries = new Map<string, MemoryEntry>();

  upsert(params: {
    workspaceId: string;
    kind: MemoryKind;
    key: string;
    value: string;
    source: MemoryEntry['source'];
    confidence?: number;
  }): MemoryEntry {
    // Deduplicate by workspaceId + kind + key
    const dedupKey = `${params.workspaceId}:${params.kind}:${params.key}`;
    const existing = Array.from(this.entries.values()).find(
      (e) => e.workspaceId === params.workspaceId && e.kind === params.kind && e.key === params.key,
    );
    const now = new Date().toISOString();
    if (existing) {
      existing.value = params.value;
      existing.confidence = params.confidence ?? existing.confidence;
      existing.updatedAt = now;
      return existing;
    }
    const entry: MemoryEntry = {
      id: crypto.randomUUID(),
      workspaceId: params.workspaceId,
      kind: params.kind,
      key: params.key,
      value: params.value,
      source: params.source,
      confidence: params.confidence ?? 1.0,
      createdAt: now,
      updatedAt: now,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  list(workspaceId: string, kind?: MemoryKind): MemoryEntry[] {
    const all = Array.from(this.entries.values()).filter(
      (e) => e.workspaceId === workspaceId,
    );
    return kind ? all.filter((e) => e.kind === kind) : all;
  }

  get(id: string): MemoryEntry | undefined {
    return this.entries.get(id);
  }

  delete(id: string): boolean {
    return this.entries.delete(id);
  }

  /**
   * Simple keyword search across memory values.
   * In production this uses semantic vector search.
   */
  search(workspaceId: string, query: string): MemoryEntry[] {
    const lower = query.toLowerCase();
    return Array.from(this.entries.values()).filter(
      (e) => e.workspaceId === workspaceId &&
        (e.key.toLowerCase().includes(lower) || e.value.toLowerCase().includes(lower)),
    );
  }
}
