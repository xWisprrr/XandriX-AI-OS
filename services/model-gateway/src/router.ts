import type { ModelProvider, CompletionRequest, CompletionResponse } from './providers/types.js';
import type { Model } from '@xandrix/types';

export class ModelRouter {
  private providers = new Map<string, ModelProvider>();
  private modelIndex = new Map<string, ModelProvider>();

  registerProvider(provider: ModelProvider): void {
    this.providers.set(provider.name, provider);
    for (const model of provider.supportedModels) {
      this.modelIndex.set(model.id, provider);
    }
    console.log(
      `📡 Registered provider "${provider.name}" with models: ${provider.supportedModels.map((m) => m.id).join(', ')}`,
    );
  }

  listModels(): Model[] {
    const models: Model[] = [];
    for (const provider of this.providers.values()) {
      models.push(...provider.supportedModels);
    }
    return models;
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const provider = this.modelIndex.get(request.modelId);
    if (!provider) {
      throw new Error(`No provider registered for model "${request.modelId}"`);
    }
    return provider.complete(request);
  }

  async *stream(request: CompletionRequest) {
    const provider = this.modelIndex.get(request.modelId);
    if (!provider) {
      throw new Error(`No provider registered for model "${request.modelId}"`);
    }
    yield* provider.stream(request);
  }
}
