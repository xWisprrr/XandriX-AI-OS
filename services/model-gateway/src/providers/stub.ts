import type { ModelProvider, CompletionRequest, CompletionResponse, CompletionChunk } from './types.js';
import type { Model } from '@xandrix/types';

/**
 * Stub provider for local development and testing.
 * Returns deterministic placeholder responses without calling any external API.
 */
export class StubProvider implements ModelProvider {
  readonly name = 'stub';

  readonly supportedModels: Model[] = [
    {
      id: 'xandrix-flagship-v1',
      name: 'XandriX Flagship v1',
      tier: 'flagship',
      contextWindow: 200_000,
      supportsStreaming: true,
      supportsTools: true,
    },
    {
      id: 'xandrix-fast-v1',
      name: 'XandriX Fast v1',
      tier: 'specialist',
      contextWindow: 64_000,
      supportsStreaming: true,
      supportsTools: false,
    },
  ];

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const lastMessage = request.messages.at(-1);
    return {
      id: crypto.randomUUID(),
      modelId: request.modelId,
      content: `[StubProvider] Echo: ${lastMessage?.content ?? ''}`,
      toolCalls: [],
      inputTokens: 10,
      outputTokens: 20,
      finishReason: 'stop',
    };
  }

  async *stream(request: CompletionRequest): AsyncGenerator<CompletionChunk> {
    const content = `[StubProvider] Echo: ${request.messages.at(-1)?.content ?? ''}`;
    const words = content.split(' ');
    for (const word of words) {
      yield { id: crypto.randomUUID(), delta: word + ' ', finishReason: null };
      await new Promise((r) => setTimeout(r, 10));
    }
    yield { id: crypto.randomUUID(), delta: '', finishReason: 'stop' };
  }
}
