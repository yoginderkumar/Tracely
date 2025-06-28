// Define the type for a single number dot
export interface NumberDotData {
  id: number;
  position: { x: number; y: number }; // Grid coordinates (column, row)
  isStart?: boolean; // Indicates the starting point for a sequence
}

// Define type for a path segment (connecting two dots)
export interface PathSegment {
  startDot: NumberDotData;
  endDot: NumberDotData;
  // We'll also store the pixel coordinates for drawing
  startPixel: { x: number; y: number };
  endPixel: { x: number; y: number };
}

// Define type for a completed path (array of segments)
export interface CompletedPath {
  segments: PathSegment[];
  sequenceId: number; // e.g., the number of the starting dot of the sequence
  color: string; // The color for this completed path
}

export interface RenderableNumberDotData extends NumberDotData {
  isActive?: boolean;
  isCompleted?: boolean;
}