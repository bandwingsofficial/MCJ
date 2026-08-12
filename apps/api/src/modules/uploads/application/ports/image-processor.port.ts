export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  storedName: string;
  size: number;
  width?: number | null;
  height?: number | null;
}

export interface ImageProcessor {
  optimize(input: Buffer): Promise<ProcessedImage>;
}
