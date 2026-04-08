import { describe, it, expect, beforeEach } from 'vitest';
import { StubProvider } from '../providers/stub.js';
import { ModelRouter } from '../router.js';

describe('StubProvider', () => {
  const provider = new StubProvider();

  it('has name "stub"', () => {
    expect(provider.name).toBe('stub');
  });

  it('exposes at least one supported model', () => {
    expect(provider.supportedModels.length).toBeGreaterThan(0);
  });

  it('flagship model supports streaming and tools', () => {
    const flagship = provider.supportedModels.find((m) => m.id === 'xandrix-flagship-v1');
    expect(flagship).toBeDefined();
    expect(flagship?.supportsStreaming).toBe(true);
    expect(flagship?.supportsTools).toBe(true);
    expect(flagship?.tier).toBe('flagship');
  });

  describe('complete', () => {
    it('returns a completion response echoing the last message', async () => {
      const response = await provider.complete({
        modelId: 'xandrix-flagship-v1',
        messages: [{ role: 'user', content: 'Hello world' }],
      });
      expect(response.content).toContain('Hello world');
      expect(response.modelId).toBe('xandrix-flagship-v1');
      expect(response.finishReason).toBe('stop');
      expect(response.id).toBeTruthy();
      expect(response.inputTokens).toBeGreaterThan(0);
      expect(response.outputTokens).toBeGreaterThan(0);
    });

    it('returns empty toolCalls array', async () => {
      const response = await provider.complete({
        modelId: 'xandrix-flagship-v1',
        messages: [{ role: 'user', content: 'Test' }],
      });
      expect(response.toolCalls).toEqual([]);
    });
  });

  describe('stream', () => {
    it('yields multiple chunks ending with finishReason=stop', async () => {
      const chunks = [];
      for await (const chunk of provider.stream({
        modelId: 'xandrix-flagship-v1',
        messages: [{ role: 'user', content: 'Stream test' }],
      })) {
        chunks.push(chunk);
      }
      expect(chunks.length).toBeGreaterThan(0);
      const lastChunk = chunks[chunks.length - 1]!;
      expect(lastChunk.finishReason).toBe('stop');
    });

    it('intermediate chunks have null finishReason', async () => {
      const chunks = [];
      for await (const chunk of provider.stream({
        modelId: 'xandrix-flagship-v1',
        messages: [{ role: 'user', content: 'Hi' }],
      })) {
        chunks.push(chunk);
      }
      const intermediate = chunks.slice(0, -1);
      for (const chunk of intermediate) {
        expect(chunk.finishReason).toBeNull();
      }
    });

    it('each chunk has a unique id', async () => {
      const ids = new Set<string>();
      for await (const chunk of provider.stream({
        modelId: 'xandrix-fast-v1',
        messages: [{ role: 'user', content: 'Test' }],
      })) {
        ids.add(chunk.id);
      }
      expect(ids.size).toBeGreaterThan(0);
    });
  });
});

describe('ModelRouter', () => {
  let router: ModelRouter;

  beforeEach(() => {
    router = new ModelRouter();
    router.registerProvider(new StubProvider());
  });

  describe('listModels', () => {
    it('returns all models from registered providers', () => {
      const models = router.listModels();
      expect(models.length).toBeGreaterThan(0);
      expect(models.every((m) => typeof m.id === 'string')).toBe(true);
    });

    it('returns empty array when no providers are registered', () => {
      const emptyRouter = new ModelRouter();
      expect(emptyRouter.listModels()).toEqual([]);
    });
  });

  describe('complete', () => {
    it('routes a completion request to the correct provider', async () => {
      const response = await router.complete({
        modelId: 'xandrix-flagship-v1',
        messages: [{ role: 'user', content: 'Route test' }],
      });
      expect(response.content).toBeTruthy();
      expect(response.modelId).toBe('xandrix-flagship-v1');
    });

    it('throws when the model is not registered', async () => {
      await expect(
        router.complete({ modelId: 'unknown-model-xyz', messages: [{ role: 'user', content: 'hi' }] }),
      ).rejects.toThrow('No provider registered for model "unknown-model-xyz"');
    });
  });

  describe('stream', () => {
    it('streams chunks via the correct provider', async () => {
      const chunks = [];
      for await (const chunk of router.stream({
        modelId: 'xandrix-flagship-v1',
        messages: [{ role: 'user', content: 'Stream via router' }],
      })) {
        chunks.push(chunk);
      }
      expect(chunks.length).toBeGreaterThan(0);
    });

    it('throws when the model is not registered', async () => {
      const gen = router.stream({
        modelId: 'no-such-model',
        messages: [{ role: 'user', content: 'test' }],
      });
      await expect(gen.next()).rejects.toThrow();
    });
  });
});
