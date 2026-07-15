import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   WaveformVisualizer
   Premium mirrored waveform canvas, 60fps, reacts to live mic/stream audio.
   Props:
     stream    {MediaStream|null}
     isActive  {boolean} – whether to animate (mic not muted, recording)
───────────────────────────────────────────────────────────────────────────── */
const WaveformVisualizer = ({ stream, isActive }) => {
  const canvasRef  = useRef(null);
  const animRef    = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const idlePhase  = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let analyser = null;

    /* ── Setup audio context from stream ── */
    if (stream && isActive) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const an = audioCtx.createAnalyser();
        an.fftSize = 128;
        an.smoothingTimeConstant = 0.82;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(an);
        audioCtxRef.current = audioCtx;
        analyserRef.current = an;
        analyser = an;
      } catch { /* silent */ }
    }

    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray    = analyser ? new Uint8Array(bufferLength) : null;

    const draw = () => {
      if (!canvasRef.current) return;
      animRef.current = requestAnimationFrame(draw);

      const W = canvas.width;
      const H = canvas.height;
      const CY = H / 2;

      ctx.clearRect(0, 0, W, H);

      const barW   = (W / bufferLength) * 1.8;
      const gap    = 1.5;
      const totalW = (barW + gap) * bufferLength;
      const startX = (W - totalW) / 2;

      if (analyser && dataArray) {
        /* ── Live audio data ── */
        analyser.getByteFrequencyData(dataArray);

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 255;
          const barH = Math.max(2, v * CY * 0.85);
          const x = startX + i * (barW + gap);

          /* Gradient per bar */
          const gradUp = ctx.createLinearGradient(0, CY - barH, 0, CY);
          gradUp.addColorStop(0,   'rgba(167,139,250,0.95)');  // violet-400
          gradUp.addColorStop(0.4, 'rgba(99,102,241,0.85)');   // indigo-500
          gradUp.addColorStop(1,   'rgba(99,102,241,0.5)');

          /* Glow */
          ctx.shadowBlur  = v > 0.4 ? 10 : 0;
          ctx.shadowColor = 'rgba(139,92,246,0.6)';

          ctx.fillStyle = gradUp;
          /* Top bar */
          ctx.beginPath();
          ctx.roundRect
            ? ctx.roundRect(x, CY - barH, barW, barH, [2, 2, 0, 0])
            : ctx.rect(x, CY - barH, barW, barH);
          ctx.fill();

          /* Mirror bar (bottom, smaller) */
          const gradDown = ctx.createLinearGradient(0, CY, 0, CY + barH * 0.45);
          gradDown.addColorStop(0, 'rgba(99,102,241,0.45)');
          gradDown.addColorStop(1, 'rgba(217,70,239,0.08)');
          ctx.fillStyle = gradDown;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.roundRect
            ? ctx.roundRect(x, CY, barW, barH * 0.42, [0, 0, 2, 2])
            : ctx.rect(x, CY, barW, barH * 0.42);
          ctx.fill();
        }
      } else {
        /* ── Idle sine wave animation ── */
        idlePhase.current += 0.04;
        const phase = idlePhase.current;
        for (let i = 0; i < bufferLength; i++) {
          const norm   = i / bufferLength;
          const sineH  = Math.abs(Math.sin(norm * Math.PI * 3 + phase)) * CY * 0.18 + 2;
          const x      = startX + i * (barW + gap);

          ctx.fillStyle = `rgba(99,102,241,${0.12 + norm * 0.08})`;
          ctx.beginPath();
          ctx.roundRect
            ? ctx.roundRect(x, CY - sineH, barW, sineH, [2, 2, 0, 0])
            : ctx.rect(x, CY - sineH, barW, sineH);
          ctx.fill();

          ctx.fillStyle = `rgba(99,102,241,${0.05 + norm * 0.04})`;
          ctx.beginPath();
          ctx.roundRect
            ? ctx.roundRect(x, CY, barW, sineH * 0.4, [0, 0, 2, 2])
            : ctx.rect(x, CY, barW, sineH * 0.4);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      /* Centre divider line */
      const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
      lineGrad.addColorStop(0,   'rgba(99,102,241,0)');
      lineGrad.addColorStop(0.3, 'rgba(99,102,241,0.25)');
      lineGrad.addColorStop(0.7, 'rgba(139,92,246,0.25)');
      lineGrad.addColorStop(1,   'rgba(99,102,241,0)');
      ctx.fillStyle = lineGrad;
      ctx.fillRect(0, CY - 0.5, W, 1);
    };

    draw();

    return () => {
      if (animRef.current)    cancelAnimationFrame(animRef.current);
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
        audioCtxRef.current  = null;
        analyserRef.current  = null;
      }
    };
  }, [stream, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={56}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
};

export default WaveformVisualizer;
