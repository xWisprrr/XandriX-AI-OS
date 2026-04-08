import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStore } from '../MemoryStore.js';

describe('MemoryStore', () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  describe('upsert', () => {
    it('creates a new memory entry with id and timestamps', () => {
      const entry = store.upsert({
        workspaceId: 'ws-1',
        kind: 'project_convention',
        key: 'language',
        value: 'TypeScript strict mode',
        source: 'user',
      });
      expect(entry.id).toBeTruthy();
      expect(entry.workspaceId).toBe('ws-1');
      expect(entry.kind).toBe('project_convention');
      expect(entry.key).toBe('language');
      expect(entry.value).toBe('TypeScript strict mode');
      expect(entry.source).toBe('user');
      expect(entry.confidence).toBe(1.0);
      expect(entry.createdAt).toBeTruthy();
      expect(entry.updatedAt).toBeTruthy();
    });

    it('stores a custom confidence value', () => {
      const entry = store.upsert({
        workspaceId: 'ws-1',
        kind: 'error_pattern',
        key: 'db-timeout',
        value: 'Postgres connection timeout',
        source: 'agent',
        confidence: 0.8,
      });
      expect(entry.confidence).toBe(0.8);
    });

    it('updates value when same workspaceId/kind/key already exists', () => {
      const params = {
        workspaceId: 'ws-1',
        kind: 'user_preference' as const,
        key: 'theme',
        value: 'dark',
        source: 'user' as const,
      };
      const first = store.upsert(params);
      const second = store.upsert({ ...params, value: 'light' });
      expect(second.id).toBe(first.id);
      expect(second.value).toBe('light');
    });

    it('does not merge entries from different workspaces', () => {
      const base = { kind: 'project_convention' as const, key: 'k', value: 'v', source: 'user' as const };
      const a = store.upsert({ ...base, workspaceId: 'ws-a' });
      const b = store.upsert({ ...base, workspaceId: 'ws-b' });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('get', () => {
    it('retrieves an entry by id', () => {
      const entry = store.upsert({
        workspaceId: 'ws-1',
        kind: 'approved_tool',
        key: 'bash',
        value: 'allowed',
        source: 'system',
      });
      expect(store.get(entry.id)).toEqual(entry);
    });

    it('returns undefined for an unknown id', () => {
      expect(store.get('non-existent-id')).toBeUndefined();
    });
  });

  describe('list', () => {
    it('lists all entries for a workspace', () => {
      store.upsert({ workspaceId: 'ws-1', kind: 'user_preference', key: 'k1', value: 'v1', source: 'user' });
      store.upsert({ workspaceId: 'ws-1', kind: 'architecture_note', key: 'k2', value: 'v2', source: 'agent' });
      store.upsert({ workspaceId: 'ws-2', kind: 'user_preference', key: 'k1', value: 'v1', source: 'user' });
      expect(store.list('ws-1')).toHaveLength(2);
    });

    it('returns empty array for workspace with no entries', () => {
      expect(store.list('ws-unknown')).toHaveLength(0);
    });

    it('filters by kind when provided', () => {
      store.upsert({ workspaceId: 'ws-1', kind: 'user_preference', key: 'k1', value: 'v1', source: 'user' });
      store.upsert({ workspaceId: 'ws-1', kind: 'architecture_note', key: 'k2', value: 'v2', source: 'agent' });
      const prefs = store.list('ws-1', 'user_preference');
      expect(prefs).toHaveLength(1);
      expect(prefs[0]!.kind).toBe('user_preference');
    });
  });

  describe('delete', () => {
    it('deletes an existing entry and returns true', () => {
      const entry = store.upsert({
        workspaceId: 'ws-1',
        kind: 'approved_tool',
        key: 'tool',
        value: 'allowed',
        source: 'system',
      });
      expect(store.delete(entry.id)).toBe(true);
      expect(store.get(entry.id)).toBeUndefined();
    });

    it('returns false for an unknown id', () => {
      expect(store.delete('does-not-exist')).toBe(false);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      store.upsert({
        workspaceId: 'ws-1',
        kind: 'architecture_note',
        key: 'backend-stack',
        value: 'Express with Postgres and Redis',
        source: 'agent',
      });
      store.upsert({
        workspaceId: 'ws-1',
        kind: 'architecture_note',
        key: 'frontend-stack',
        value: 'Next.js with React and TailwindCSS',
        source: 'agent',
      });
      store.upsert({
        workspaceId: 'ws-2',
        kind: 'architecture_note',
        key: 'backend-stack',
        value: 'Express',
        source: 'agent',
      });
    });

    it('finds entries matching query in value', () => {
      const results = store.search('ws-1', 'Express');
      expect(results).toHaveLength(1);
      expect(results[0]!.key).toBe('backend-stack');
    });

    it('finds entries matching query in key', () => {
      const results = store.search('ws-1', 'frontend');
      expect(results).toHaveLength(1);
      expect(results[0]!.key).toBe('frontend-stack');
    });

    it('is case-insensitive', () => {
      expect(store.search('ws-1', 'express')).toHaveLength(1);
      expect(store.search('ws-1', 'NEXT.JS')).toHaveLength(1);
    });

    it('does not cross workspace boundaries', () => {
      expect(store.search('ws-2', 'React')).toHaveLength(0);
      expect(store.search('ws-2', 'Express')).toHaveLength(1);
    });

    it('returns empty array when no entries match', () => {
      expect(store.search('ws-1', 'Kubernetes')).toHaveLength(0);
    });
  });
});
