import { useEffect, useRef, memo } from 'react';

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

    /* ── Setup audio context from stream (only if live audio tracks exist) ── */
    const hasAudioTrack = Boolean(stream && stream.getAudioTracks && stream.getAudioTracks().some(t => t.readyState === 'live'));
    if (hasAudioTrack && isActive) {
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

    const W = canvas.width;
    const H = canvas.height;
    const CY = H / 2;
    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray    = analyser ? new Uint8Array(bufferLength) : null;
    const barW   = (W / bufferLength) * 1.8;
    const gap    = 1.5;
    const totalW = (barW + gap) * bufferLength;
    const startX = (W - totalW) / 2;

    // Pre-allocate static gradients ONCE (eliminates 7,680 gradient allocations/sec)
    const gradUp = ctx.createLinearGradient(0, 0, 0, CY);
    gradUp.addColorStop(0,   'rgba(167,139,250,0.95)');
    gradUp.addColorStop(0.5, 'rgba(99,102,241,0.85)');
    gradUp.addColorStop(1,   'rgba(99,102,241,0.5)');

    const gradDown = ctx.createLinearGradient(0, CY, 0, H);
    gradDown.addColorStop(0, 'rgba(99,102,241,0.45)');
    gradDown.addColorStop(1, 'rgba(217,70,239,0.08)');

    const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
    lineGrad.addColorStop(0,   'rgba(99,102,241,0)');
    lineGrad.addColorStop(0.3, 'rgba(99,102,241,0.25)');
    lineGrad.addColorStop(0.7, 'rgba(139,92,246,0.25)');
    lineGrad.addColorStop(1,   'rgba(99,102,241,0)');

    let frameSkip = 0;
    const draw = () => {
      if (!canvasRef.current) return;
      animRef.current = requestAnimationFrame(draw);

      if (typeof document !== 'undefined' && document.hidden) return;
      // Throttle idle wave animation to ~30fps to save GPU cycles
      if (!analyser) {
        frameSkip = (frameSkip + 1) % 2;
        if (frameSkip !== 0) return;
      }

      ctx.clearRect(0, 0, W, H);

      if (analyser && dataArray) {
        /* ── Live audio data ── */
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = gradUp;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 255;
          const barH = Math.max(2, v * CY * 0.85);
          const x = startX + i * (barW + gap);
          ctx.fillRect(x, CY - barH, barW, barH);
        }

        ctx.fillStyle = gradDown;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 255;
          const barH = Math.max(2, v * CY * 0.85);
          const x = startX + i * (barW + gap);
          ctx.fillRect(x, CY, barW, barH * 0.42);
        }
      } else {
        /* ── Idle sine wave animation ── */
        idlePhase.current += 0.06;
        const phase = idlePhase.current;
        ctx.fillStyle = 'rgba(99,102,241,0.18)';
        for (let i = 0; i < bufferLength; i++) {
          const norm   = i / bufferLength;
          const sineH  = Math.abs(Math.sin(norm * Math.PI * 3 + phase)) * CY * 0.18 + 2;
          const x      = startX + i * (barW + gap);
          ctx.fillRect(x, CY - sineH, barW, sineH);
        }

        ctx.fillStyle = 'rgba(99,102,241,0.08)';
        for (let i = 0; i < bufferLength; i++) {
          const norm   = i / bufferLength;
          const sineH  = Math.abs(Math.sin(norm * Math.PI * 3 + phase)) * CY * 0.18 + 2;
          const x      = startX + i * (barW + gap);
          ctx.fillRect(x, CY, barW, sineH * 0.4);
        }
      }

      /* Centre divider line */
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

export default memo(WaveformVisualizer);
