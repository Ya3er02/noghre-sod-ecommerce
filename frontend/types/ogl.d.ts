declare module 'ogl' {
  export interface OGLRenderingContext extends WebGLRenderingContext {
    canvas: HTMLCanvasElement;
    clearColor(r: number, g: number, b: number, a: number): void;
  }

  export interface RendererOptions {
    antialias?: boolean;
    alpha?: boolean;
    premultipliedAlpha?: boolean;
    preserveDrawingBuffer?: boolean;
    powerPreference?: 'default' | 'high-performance' | 'low-power';
    depth?: boolean;
    stencil?: boolean;
  }

  export class Renderer {
    gl: OGLRenderingContext;
    constructor(options?: RendererOptions);
    setSize(width: number, height: number): void;
    render(options: { scene: Mesh }): void;
  }

  export class Triangle {
    constructor(gl: OGLRenderingContext);
  }

  export interface ProgramOptions {
    vertex: string;
    fragment: string;
    uniforms?: Record<string, { value: number | Float32Array }>;
  }

  export class Program {
    uniforms: Record<string, { value: number | Float32Array }>;
    constructor(gl: OGLRenderingContext, options: ProgramOptions);
  }

  export interface MeshOptions {
    geometry: Triangle;
    program: Program;
  }

  export class Mesh {
    constructor(gl: OGLRenderingContext, options: MeshOptions);
  }
}
