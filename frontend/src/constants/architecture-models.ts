const MODEL_LABELS: Record<string, string> = {
  unet: 'U-Net',
  'unet++': 'U-Net++',
  attention: 'Attention U-Net',
  'trans-unet': 'Trans-UNet',
  ensemble: 'Ensemble',
}

export function formatArchitectureModelLabel(model: string): string {
  return MODEL_LABELS[model] ?? model
}

export const MOCK_ARCHITECTURE_MODEL_OPTIONS = [
  'unet',
  'unet++',
  'attention',
  'trans-unet',
  'ensemble',
] as const
