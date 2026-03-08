<template>
  <canvas id="shader-canvas"></canvas>
  <div class="grid-overlay"></div>
  <div class="axis-x"></div>
  <div class="axis-y"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

let rafId = null
let mousemoveHandler = null
let resizeHandler = null

onMounted(() => {
  const canvas = document.getElementById('shader-canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

  if (!gl) return

  const vs = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `
  const fs = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_res;
    uniform vec2 u_mouse;

    #define PI 3.14159265359

    // Simplex noise (2D)
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m * m; m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // Parametric surface plot
    float surface(vec2 uv, float t) {
      float z = 0.0;
      // Ripple wave
      float r = length(uv);
      z += sin(r * 8.0 - t * 1.8) * 0.04 / (r + 0.5);
      // Secondary wave at angle
      z += sin(uv.x * 6.0 + t) * cos(uv.y * 5.0 - t * 0.7) * 0.025;
      // Noise layer
      z += snoise(uv * 3.0 + t * 0.2) * 0.015;
      return z;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - u_res * 0.5) / min(u_res.x, u_res.y);
      vec2 mouse = (u_mouse / u_res - 0.5);
      mouse.y *= -1.0;

      float t = u_time * 0.5;

      // Mouse influence
      float mouseDist = length(uv - mouse);
      float mouseWave = sin(mouseDist * 20.0 - t * 3.0) * 0.015 * smoothstep(0.4, 0.0, mouseDist);

      float z = surface(uv, t) + mouseWave;

      // Blueprint blue core
      vec3 col = vec3(0.012, 0.012, 0.02);

      // Surface glow — blueprint
      float glow = smoothstep(-0.05, 0.05, z);
      col += vec3(0.05, 0.18, 0.55) * glow * 0.5;

      // Acid green highlights on peaks
      float peak = smoothstep(0.03, 0.06, z);
      col += vec3(0.2, 0.55, 0.04) * peak * 0.3;

      // Subtle noise texture
      float grain = snoise(gl_FragCoord.xy * 0.8) * 0.006;
      col += grain;

      // Radial vignette
      float vig = 1.0 - smoothstep(0.5, 1.2, length(uv));
      col *= vig;

      // Floating node particles
      for (int i = 0; i < 8; i++) {
        float fi = float(i);
        vec2 node = vec2(
          sin(fi * 1.73 + t * 0.3 + fi * 0.5) * 0.4,
          cos(fi * 2.39 + t * 0.2 + fi * 0.7) * 0.35
        );
        float d = length(uv - node);
        float brightness = smoothstep(0.04, 0.0, d) * 0.8;
        col += vec3(0.1, 0.35, 0.9) * brightness;
        // Connection lines between nodes (approximate)
        for (int j = 0; j < 8; j++) {
          if (j == i) continue;
          float fj = float(j);
          vec2 node2 = vec2(
            sin(fj * 1.73 + t * 0.3 + fj * 0.5) * 0.4,
            cos(fj * 2.39 + t * 0.2 + fj * 0.7) * 0.35
          );
          // Line SDF
          vec2 pa = uv - node, ba = node2 - node;
          float h2 = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
          float lineDist = length(pa - ba * h2);
          float nodeDist2 = length(node - node2);
          if (nodeDist2 < 0.45) {
            float line = smoothstep(0.008, 0.002, lineDist) * 0.15 * (1.0 - nodeDist2 / 0.45);
            col += vec3(0.05, 0.2, 0.6) * line;
          }
        }
      }

      gl_FragColor = vec4(col, 1.0);
    }
  `

  function compileShader(type, src) {
    const s = gl.createShader(type)
    gl.shaderSource(s, src); gl.compileShader(s)
    return s
  }
  const prog = gl.createProgram()
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vs))
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(prog); gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)

  const aPos = gl.getAttribLocation(prog, 'a_pos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const uTime = gl.getUniformLocation(prog, 'u_time')
  const uRes = gl.getUniformLocation(prog, 'u_res')
  const uMouse = gl.getUniformLocation(prog, 'u_mouse')

  let mx = 0, my = 0
  mousemoveHandler = e => { mx = e.clientX; my = e.clientY }
  document.addEventListener('mousemove', mousemoveHandler)

  function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  resizeHandler = resize
  window.addEventListener('resize', resizeHandler)
  resize()

  const startTime = performance.now()
  function render() {
    const t = (performance.now() - startTime) * 0.001
    gl.uniform1f(uTime, t)
    gl.uniform2f(uRes, canvas.width, canvas.height)
    gl.uniform2f(uMouse, mx, my)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    rafId = requestAnimationFrame(render)
  }
  render()
})

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (mousemoveHandler) document.removeEventListener('mousemove', mousemoveHandler)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
})
</script>
