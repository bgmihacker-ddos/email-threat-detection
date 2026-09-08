import { useEffect, useRef, memo } from 'react';

export type SecurityProfile =
  | 'auth'
  | 'dashboard'
  | 'analyze'
  | 'investigation'
  | 'live_threat'
  | 'indicators'
  | 'admin';

export type ThreatLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical' | 'neutral';

interface SecurityEnvironmentBackgroundProps {
  profile?: SecurityProfile;
  threatLevel?: ThreatLevel;
  activeCount?: number;
  intensity?: 'subtle' | 'moderate' | 'intense';
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulseOffset: number;
  color: string;
}

interface DataStream {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
  isVertical: boolean;
}

const COLOR_MAP: Record<ThreatLevel, { primary: string; accent: string; glow: string }> = {
  safe: { primary: 'rgba(16, 185, 129, 0.6)', accent: 'rgba(5, 150, 105, 0.4)', glow: 'rgba(16, 185, 129, 0.05)' },
  low: { primary: 'rgba(6, 182, 212, 0.6)', accent: 'rgba(8, 145, 178, 0.4)', glow: 'rgba(6, 182, 212, 0.05)' },
  medium: { primary: 'rgba(245, 158, 11, 0.6)', accent: 'rgba(217, 119, 6, 0.4)', glow: 'rgba(245, 158, 11, 0.06)' },
  high: { primary: 'rgba(239, 68, 68, 0.7)', accent: 'rgba(220, 38, 38, 0.5)', glow: 'rgba(239, 68, 68, 0.08)' },
  critical: { primary: 'rgba(239, 68, 68, 0.9)', accent: 'rgba(185, 28, 28, 0.7)', glow: 'rgba(239, 68, 68, 0.12)' },
  neutral: { primary: 'rgba(6, 182, 212, 0.5)', accent: 'rgba(139, 92, 246, 0.35)', glow: 'rgba(6, 182, 212, 0.04)' }
};

export const SecurityEnvironmentBackground = memo(function SecurityEnvironmentBackground({
  profile = 'dashboard',
  threatLevel = 'neutral',
  activeCount = 0,
  intensity = 'subtle',
  className = ''
}: SecurityEnvironmentBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let isVisible = !document.hidden;
    let width = 0;
    let height = 0;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && !prefersReducedMotion) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Color selections
    const themeColors = COLOR_MAP[threatLevel] || COLOR_MAP.neutral;
    const baseParticleColor = profile === 'admin' ? 'rgba(239, 68, 68, ' : 'rgba(6, 182, 212, ';
    const secondaryParticleColor = 'rgba(139, 92, 246, ';

    // Particle setup
    const particleCount = prefersReducedMotion ? 12 : Math.min(28, Math.max(10, Math.floor(width / 70) + Math.min(activeCount, 10)));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const isAlt = i % 3 === 0;
      const baseAlpha = (Math.random() * 0.25 + 0.1) * (intensity === 'intense' ? 1.5 : intensity === 'moderate' ? 1.2 : 0.85);
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : 0.25),
        vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : 0.25),
        size: Math.random() * 1.6 + 1.0,
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseOffset: Math.random() * Math.PI * 2,
        color: isAlt ? secondaryParticleColor : baseParticleColor
      });
    }

    // Data streams setup
    const streamCount = prefersReducedMotion ? 0 : profile === 'analyze' || profile === 'dashboard' ? 4 : 2;
    const streams: DataStream[] = [];

    for (let i = 0; i < streamCount; i++) {
      const isVertical = i % 2 === 0;
      streams.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 80 + 40,
        speed: (Math.random() * 0.8 + 0.4) * (isVertical ? 1 : 1),
        alpha: Math.random() * 0.15 + 0.05,
        isVertical
      });
    }

    let scanSweepY = 0;
    const scanSweepSpeed = 0.35;
    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isVisible) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle grid
      const gridSize = profile === 'analyze' ? 32 : 48;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(21, 29, 40, 0.45)';

      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 2. Draw atmospheric radial gradients
      if (profile === 'auth') {
        const rad1 = ctx.createRadialGradient(width * 0.25, height * 0.4, 10, width * 0.25, height * 0.4, Math.max(width, height) * 0.55);
        rad1.addColorStop(0, 'rgba(6, 182, 212, 0.045)');
        rad1.addColorStop(1, 'transparent');
        ctx.fillStyle = rad1;
        ctx.fillRect(0, 0, width, height);

        const rad2 = ctx.createRadialGradient(width * 0.8, height * 0.6, 10, width * 0.8, height * 0.6, Math.max(width, height) * 0.45);
        rad2.addColorStop(0, 'rgba(139, 92, 246, 0.03)');
        rad2.addColorStop(1, 'transparent');
        ctx.fillStyle = rad2;
        ctx.fillRect(0, 0, width, height);
      } else if (profile === 'admin') {
        const radAdmin = ctx.createRadialGradient(width * 0.5, 0, 10, width * 0.5, 0, height * 0.6);
        radAdmin.addColorStop(0, 'rgba(239, 68, 68, 0.04)');
        radAdmin.addColorStop(1, 'transparent');
        ctx.fillStyle = radAdmin;
        ctx.fillRect(0, 0, width, height);
      } else {
        const radGeneral = ctx.createRadialGradient(width * 0.1, 0, 5, width * 0.1, 0, height * 0.7);
        radGeneral.addColorStop(0, themeColors.glow);
        radGeneral.addColorStop(1, 'transparent');
        ctx.fillStyle = radGeneral;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. Draw Scan Sweep (for analysis, auth, or map)
      if (!prefersReducedMotion && (profile === 'analyze' || profile === 'auth' || profile === 'live_threat')) {
        scanSweepY += scanSweepSpeed * 60 * dt;
        if (scanSweepY > height) scanSweepY = 0;

        const scanGrad = ctx.createLinearGradient(0, scanSweepY - 30, 0, scanSweepY);
        scanGrad.addColorStop(0, 'transparent');
        scanGrad.addColorStop(1, 'rgba(6, 182, 212, 0.05)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanSweepY - 30, width, 30);

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, scanSweepY);
        ctx.lineTo(width, scanSweepY);
        ctx.stroke();
      }

      // 4. Draw Data Streams
      if (!prefersReducedMotion) {
        for (const stream of streams) {
          ctx.strokeStyle = profile === 'admin' ? `rgba(239, 68, 68, ${stream.alpha})` : `rgba(6, 182, 212, ${stream.alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (stream.isVertical) {
            stream.y += stream.speed * 60 * dt;
            if (stream.y > height + stream.length) {
              stream.y = -stream.length;
              stream.x = Math.random() * width;
            }
            ctx.moveTo(stream.x, stream.y);
            ctx.lineTo(stream.x, stream.y + stream.length);
          } else {
            stream.x += stream.speed * 60 * dt;
            if (stream.x > width + stream.length) {
              stream.x = -stream.length;
              stream.y = Math.random() * height;
            }
            ctx.moveTo(stream.x, stream.y);
            ctx.lineTo(stream.x + stream.length, stream.y);
          }
          ctx.stroke();
        }
      }

      // 5. Update & draw Particles + Node Constellation
      const maxDist = 110;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p) continue;

        if (!prefersReducedMotion) {
          p.x += p.vx * 60 * dt;
          p.y += p.vy * 60 * dt;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          p.alpha = p.baseAlpha + Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.08;
        }

        ctx.fillStyle = `${p.color}${Math.max(0.04, p.alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (!p2) continue;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.12 * (intensity === 'intense' ? 1.5 : 1);
            ctx.strokeStyle = `rgba(6, 182, 212, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (prefersReducedMotion) {
      render(0);
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [profile, threatLevel, activeCount, intensity]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
});
