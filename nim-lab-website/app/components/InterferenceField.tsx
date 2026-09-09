'use client';

import { useEffect, useRef } from 'react';

/**
 * The hero backdrop: thin-film interference, computed rather than faked.
 *
 * For a film of thickness d and refractive index n, light of wavelength λ
 * reflecting off the two surfaces interferes with phase 4πnd/λ. Evaluating that
 * at three representative wavelengths (red ~610nm, green ~550nm, blue ~465nm)
 * gives the real iridescent colours you see on a soap film or an oxide layer —
 * which is exactly what this lab spends its time depositing and measuring.
 *
 * Rendered at a deliberately low resolution and scaled up: it costs almost
 * nothing per frame, and the smoothing gives it a soft, filmic quality.
 */

const GRID_W = 180;
const WAVELENGTHS = { r: 610, g: 550, b: 465 };
const FILM_INDEX = 1.42;

export default function InterferenceField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let gridH = 100;
    let image: ImageData | null = null;
    let frame = 0;
    let running = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const aspect = rect.height / Math.max(rect.width, 1);
      gridH = Math.max(40, Math.round(GRID_W * aspect));
      canvas.width = GRID_W;
      canvas.height = gridH;
      image = ctx.createImageData(GRID_W, gridH);
    };

    const draw = (t: number) => {
      if (!image) return;
      const data = image.data;

      for (let y = 0; y < gridH; y++) {
        const v = y / gridH;
        for (let x = 0; x < GRID_W; x++) {
          const u = x / GRID_W;

          // A slowly evolving film thickness, in nanometres. Three
          // superposed waves at incommensurate frequencies keep the pattern
          // from visibly repeating.
          const d =
            430 +
            190 * Math.sin(u * 5.1 + t * 0.21) +
            150 * Math.sin(v * 3.7 - t * 0.17) +
            110 * Math.sin((u + v) * 4.3 + t * 0.13) +
            70 * Math.sin((u - v) * 7.9 - t * 0.09);

          const phase = 4 * Math.PI * FILM_INDEX * d;

          // Intensity per channel, in [0,1].
          const ir = 0.5 + 0.5 * Math.cos(phase / WAVELENGTHS.r);
          const ig = 0.5 + 0.5 * Math.cos(phase / WAVELENGTHS.g);
          const ib = 0.5 + 0.5 * Math.cos(phase / WAVELENGTHS.b);

          // Fade towards the edges and the bottom so text stays readable and
          // the panel joins the page rather than sitting on top of it.
          const edge =
            Math.sin(Math.PI * Math.min(1, Math.max(0, u))) ** 0.6 *
            Math.sin(Math.PI * Math.min(1, Math.max(0, v))) ** 0.9;
          const gain = 0.5 * edge;

          const i = (y * GRID_W + x) * 4;
          // Composited over the ink background rather than replacing it.
          data[i] = 7 + ir * 210 * gain;
          data[i + 1] = 11 + ig * 205 * gain;
          data[i + 2] = 22 + ib * 235 * gain;
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(image, 0, 0);
    };

    resize();
    draw(0);

    // A single loop, tracked by handle so it can never be started twice.
    let rafHandle = 0;

    const loop = () => {
      if (!running) {
        rafHandle = 0;
        return;
      }
      frame += 1;
      // ~30fps is plenty for motion this slow, and halves the work.
      if (frame % 2 === 0) draw(performance.now() / 1000);
      rafHandle = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduceMotion || rafHandle !== 0) return;
      running = true;
      rafHandle = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      if (rafHandle) cancelAnimationFrame(rafHandle);
      rafHandle = 0;
    };

    start();

    // Stop burning frames when the tab is in the background.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') start();
      else stop();
    };

    const observer = new ResizeObserver(() => {
      resize();
      draw(performance.now() / 1000);
    });
    observer.observe(canvas);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover opacity-70"
    />
  );
}
