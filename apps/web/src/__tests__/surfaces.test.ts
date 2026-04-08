import { describe, it, expect } from 'vitest';

// Platform surface definitions — mirrors the values rendered in apps/web/src/app/page.tsx
const PLATFORM_SURFACES = [
  { name: 'XandriX Chat', status: '🚧 Building', desc: 'Web AI assistant' },
  { name: 'Terminal Agent', status: '🚧 Building', desc: 'CLI autonomy layer' },
  { name: 'XandriX Studio', status: '📋 Planned', desc: 'Browser IDE' },
  { name: 'XandriX Code', status: '📋 Planned', desc: 'Editor extensions' },
  { name: 'Orchestrator', status: '🚧 Building', desc: 'Task coordination' },
  { name: 'SecureOps', status: '📋 Planned', desc: 'Defensive security' },
] as const;

describe('XandriX platform surfaces', () => {
  it('defines 6 platform surfaces', () => {
    expect(PLATFORM_SURFACES).toHaveLength(6);
  });

  it('includes XandriX Chat as a building surface', () => {
    const surface = PLATFORM_SURFACES.find((s) => s.name === 'XandriX Chat');
    expect(surface).toBeDefined();
    expect(surface?.status).toContain('Building');
  });

  it('includes Orchestrator as a building surface', () => {
    const surface = PLATFORM_SURFACES.find((s) => s.name === 'Orchestrator');
    expect(surface).toBeDefined();
    expect(surface?.desc).toBe('Task coordination');
  });

  it('includes SecureOps as a planned surface', () => {
    const surface = PLATFORM_SURFACES.find((s) => s.name === 'SecureOps');
    expect(surface).toBeDefined();
    expect(surface?.status).toContain('Planned');
  });

  it('all surfaces have a name, status, and description', () => {
    for (const surface of PLATFORM_SURFACES) {
      expect(surface.name.length).toBeGreaterThan(0);
      expect(surface.status.length).toBeGreaterThan(0);
      expect(surface.desc.length).toBeGreaterThan(0);
    }
  });

  it('surface names are unique', () => {
    const names = PLATFORM_SURFACES.map((s) => s.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});
