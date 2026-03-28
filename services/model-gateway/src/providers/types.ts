import type { Model } from '@xandrix/types';

export interface CompletionRequest {
  modelId: string;
  messages: Array<{ role: string; content: string }>;
  tools?: Array<{ name: string; description: string; parameters: Record<string, unknown> }>;
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface CompletionChunk {
  id: string;
  delta: string;
  finishReason: string | null;
}

export interface CompletionResponse {
  id: string;
  modelId: string;
  content: string;
  toolCalls: Array<{ id: string; name: string; arguments: unknown }>;
  inputTokens: number;
  outputTokens: number;
  finishReason: 'stop' | 'tool_calls' | 'length' | 'error';
}

export interface ModelProvider {
  name: string;
  supportedModels: Model[];
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  stream(request: CompletionRequest): AsyncGenerator<CompletionChunk>;
}
