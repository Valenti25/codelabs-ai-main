// "use client";

// import { liquidFragSource } from "./liquid-frag";
// import { useEffect, useRef, useState } from "react";
// import { toast } from "sonner";

// const vertexShaderSource = `#version 300 es
// precision mediump float;

// in vec2 a_position;
// out vec2 vUv;

// void main() {
//     vUv = .5 * (a_position + 1.);
//     gl_Position = vec4(a_position, 0.0, 1.0);
// }` as const;

// export type ShaderParams = {
//   patternScale: number;
//   refraction: number;
//   edge: number;
//   patternBlur: number;
//   liquid: number;
//   speed: number;
// };

// export function Canvas({
//   imageData,
//   params,
// }: {
//   imageData: ImageData;
//   params: ShaderParams;
// }) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [gl, setGl] = useState<WebGL2RenderingContext | null>(null);
//   const [uniforms, setUniforms] = useState<Record<
//     string,
//     WebGLUniformLocation
//   > | null>(null);
//   const textureRef = useRef<WebGLTexture | null>(null);
//   const programRef = useRef<WebGLProgram | null>(null);

//   // Animation timing references
//   const totalAnimationTime = useRef(0);
//   const lastRenderTime = useRef(0);
//   const animationIdRef = useRef<number | null>(null);

//   // Initialize the WebGL context and shader program
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const glContext = canvas.getContext("webgl2", {
//       antialias: true,
//       alpha: true,
//       premultipliedAlpha: false,
//     });

//     if (!glContext) {
//       toast.error(
//         "Failed to initialize shader. Does your browser support WebGL2?"
//       );
//       return;
//     }

//     function createShader(sourceCode: string, type: number) {
//       const shader = glContext!.createShader(type);
//       if (!shader) {
//         toast.error("Failed to create shader object.");
//         return null;
//       }
//       glContext!.shaderSource(shader, sourceCode);
//       glContext!.compileShader(shader);
//       if (!glContext!.getShaderParameter(shader, glContext!.COMPILE_STATUS)) {
//         const log = glContext!.getShaderInfoLog(shader);
//         console.error("Shader compilation error:", log);
//         toast.error(`Shader compilation failed: ${log}`);
//         glContext!.deleteShader(shader);
//         return null;
//       }
//       return shader;
//     }

//     const vertexShader = createShader(vertexShaderSource, glContext.VERTEX_SHADER);
//     const fragmentShader = createShader(liquidFragSource, glContext.FRAGMENT_SHADER);
//     const program = glContext.createProgram();

//     if (!program || !vertexShader || !fragmentShader) {
//       toast.error("Failed to create program or shaders");
//       return;
//     }

//     glContext.attachShader(program, vertexShader);
//     glContext.attachShader(program, fragmentShader);
//     glContext.linkProgram(program);

//     if (!glContext.getProgramParameter(program, glContext.LINK_STATUS)) {
//       const log = glContext.getProgramInfoLog(program);
//       console.error("Program linking error:", log);
//       toast.error(`Program linking failed: ${log}`);
//       return;
//     }

//     glContext.useProgram(program);
//     programRef.current = program;

//     // Get all uniform locations
//     const uniformLocations: Record<string, WebGLUniformLocation> = {};
//     const uniformCount = glContext.getProgramParameter(
//       program,
//       glContext.ACTIVE_UNIFORMS
//     );
    
//     for (let i = 0; i < uniformCount; i++) {
//       const uniformInfo = glContext.getActiveUniform(program, i);
//       if (uniformInfo) {
//         const location = glContext.getUniformLocation(program, uniformInfo.name);
//         if (location) {
//           uniformLocations[uniformInfo.name] = location;
//         }
//       }
//     }
    
//     console.log("Available uniforms:", Object.keys(uniformLocations));
//     setUniforms(uniformLocations);

//     // Set up vertex buffer
//     const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
//     const vertexBuffer = glContext.createBuffer();
//     glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
//     glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);
    
//     const positionLocation = glContext.getAttribLocation(program, "a_position");
//     glContext.enableVertexAttribArray(positionLocation);
//     glContext.vertexAttribPointer(positionLocation, 2, glContext.FLOAT, false, 0, 0);

//     // Enable blending for transparency
//     glContext.enable(glContext.BLEND);
//     glContext.blendFunc(glContext.SRC_ALPHA, glContext.ONE_MINUS_SRC_ALPHA);

//     setGl(glContext);
//   }, []);

//   // Update uniforms when params change
//   useEffect(() => {
//     if (!gl || !uniforms || !programRef.current) return;
    
//     gl.useProgram(programRef.current);
    
//     // Set all shader parameters
//     if (uniforms.u_edge) gl.uniform1f(uniforms.u_edge, params.edge);
//     if (uniforms.u_patternBlur) gl.uniform1f(uniforms.u_patternBlur, params.patternBlur);
//     if (uniforms.u_patternScale) gl.uniform1f(uniforms.u_patternScale, params.patternScale);
//     if (uniforms.u_refraction) gl.uniform1f(uniforms.u_refraction, params.refraction);
//     if (uniforms.u_liquid) gl.uniform1f(uniforms.u_liquid, params.liquid);
    
//     console.log("Updated shader params:", params);
//   }, [gl, uniforms, params]);

//   // Handle canvas resizing - แก้ไขให้สมบูรณ์แบบ
//   useEffect(() => {
//     const canvasEl = canvasRef.current;
//     if (!canvasEl || !gl || !uniforms || !programRef.current) return;

//     function resizeCanvas() {
//       const container = canvasEl.parentElement;
//       if (!container) return;
      
//       // ใช้ขนาดจริงของ container
//       const containerWidth = container.clientWidth;
//       const containerHeight = container.clientHeight;
      
//       // ใช้ devicePixelRatio เพื่อความคมชัด
//       const pixelRatio = Math.min(window.devicePixelRatio, 2);
      
//       // ตั้งค่า internal resolution ของ canvas
//       canvasEl.width = containerWidth * pixelRatio;
//       canvasEl.height = containerHeight * pixelRatio;
      
//       // ตั้งค่า CSS ให้ตรงกับ container
//       canvasEl.style.width = `${containerWidth}px`;
//       canvasEl.style.height = `${containerHeight}px`;
      
//       // อัปเดต WebGL viewport
//       gl!.viewport(0, 0, canvasEl.width, canvasEl.height);
//       gl!.useProgram(programRef.current);
      
//       // คำนวณอัตราส่วนที่ถูกต้อง
//       const containerRatio = containerWidth / containerHeight;
//       const imageRatio = imageData.width / imageData.height;
      
//       // ส่งข้อมูลไปยัง shader
//       if (uniforms.u_ratio) gl!.uniform1f(uniforms.u_ratio, containerRatio);
//       if (uniforms.u_img_ratio) gl!.uniform1f(uniforms.u_img_ratio, imageRatio);
//     }

//     resizeCanvas();
//     window.addEventListener("resize", resizeCanvas);
//     return () => window.removeEventListener("resize", resizeCanvas);
//   }, [gl, uniforms, imageData]);

//   // Upload image data to texture
//   useEffect(() => {
//     if (!gl || !uniforms || !imageData || !programRef.current) return;

//     gl.useProgram(programRef.current);

//     // Delete the old texture if it exists
//     if (textureRef.current) {
//       gl.deleteTexture(textureRef.current);
//     }

//     const newTexture = gl.createTexture();
//     if (!newTexture) {
//       toast.error("Failed to create texture");
//       return;
//     }

//     gl.activeTexture(gl.TEXTURE0);
//     gl.bindTexture(gl.TEXTURE_2D, newTexture);
//     textureRef.current = newTexture;

//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

//     gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

//     try {
//       gl.texImage2D(
//         gl.TEXTURE_2D,
//         0,
//         gl.RGBA,
//         imageData.width,
//         imageData.height,
//         0,
//         gl.RGBA,
//         gl.UNSIGNED_BYTE,
//         imageData.data
//       );
      
//       if (uniforms.u_image_texture) {
//         gl.uniform1i(uniforms.u_image_texture, 0);
//       }
      
//       console.log("Texture uploaded successfully:", {
//         width: imageData.width,
//         height: imageData.height
//       });
//     } catch (e) {
//       console.error("Error uploading texture:", e);
//       toast.error("Failed to upload image texture");
//     }

//     return () => {
//       if (textureRef.current) {
//         gl.deleteTexture(textureRef.current);
//         textureRef.current = null;
//       }
//     };
//   }, [gl, uniforms, imageData]);

//   // Animation render loop
//   useEffect(() => {
//     if (!gl || !uniforms || !programRef.current) return;
    
//     console.log("Starting animation loop");
//     let isAnimating = true;

//     function render(currentTime: number) {
//       if (!isAnimating || !gl || !uniforms || !programRef.current) return;

//       const deltaTime = lastRenderTime.current 
//         ? (currentTime - lastRenderTime.current) / 1000 
//         : 0;
      
//       lastRenderTime.current = currentTime;
//       totalAnimationTime.current += deltaTime * params.speed;

//       // Use the program and update time uniform
//       gl.useProgram(programRef.current);
      
//       if (uniforms.u_time) {
//         gl.uniform1f(uniforms.u_time, totalAnimationTime.current * 1000);
//       }

//       // Clear and draw
//       gl.clearColor(0, 0, 0, 0);
//       gl.clear(gl.COLOR_BUFFER_BIT);
//       gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

//       // Check for WebGL errors
//       const error = gl.getError();
//       if (error !== gl.NO_ERROR) {
//         console.error("WebGL error:", error);
//       }

//       animationIdRef.current = requestAnimationFrame(render);
//     }

//     // Start the animation
//     animationIdRef.current = requestAnimationFrame(render);

//     return () => {
//       isAnimating = false;
//       if (animationIdRef.current) {
//         cancelAnimationFrame(animationIdRef.current);
//         animationIdRef.current = null;
//       }
//     };
//   }, [gl, uniforms, params.speed]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (animationIdRef.current) {
//         cancelAnimationFrame(animationIdRef.current);
//       }
//       if (textureRef.current && gl) {
//         gl.deleteTexture(textureRef.current);
//       }
//       if (programRef.current && gl) {
//         gl.deleteProgram(programRef.current);
//       }
//     };
//   }, [gl]);

//   return (
//     <canvas 
//       ref={canvasRef} 
//       className="block h-full w-full"
//       style={{ 
//         imageRendering: 'pixelated',
//         willChange: 'transform'
//       }}
//     />
//   );
// }