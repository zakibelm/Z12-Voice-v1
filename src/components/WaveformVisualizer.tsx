import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { Activity, Radio, Volume2 } from 'lucide-react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  isRecording?: boolean;
  accentColor?: string;
  height?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isPlaying,
  isRecording = false,
  height = 110,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [leftMeter, setLeftMeter] = useState(0);
  const [rightMeter, setRightMeter] = useState(0);

  useEffect(() => {
    let animId: number | null = null;

    const unsubscribe = audioEngine.subscribeVisualizer((freqData, timeData) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      // Background grid lines (studio look)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let y = 15; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Calculate peak levels
      let sum = 0;
      for (let i = 0; i < freqData.length; i++) {
        sum += freqData[i];
      }
      const avg = sum / freqData.length;
      const normalizedLevel = Math.min(100, Math.round((avg / 255) * 140));

      if (isPlaying || isRecording) {
        setLeftMeter(Math.min(100, normalizedLevel + Math.floor(Math.random() * 8)));
        setRightMeter(Math.min(100, normalizedLevel + Math.floor(Math.random() * 12)));
      } else {
        setLeftMeter(prev => Math.max(0, prev - 4));
        setRightMeter(prev => Math.max(0, prev - 4));
      }

      // 1. Draw Spectrum Equalizer Bars in Background
      const barCount = 48;
      const barWidth = Math.floor(width / barCount) - 2;

      for (let i = 0; i < barCount; i++) {
        const dataIdx = Math.floor((i / barCount) * freqData.length);
        let val = freqData[dataIdx];
        if (!isPlaying && !isRecording) {
          // Subtle idle breathing wave
          val = 14 + Math.sin(Date.now() / 400 + i * 0.2) * 8;
        }

        const barHeight = (val / 255) * (h * 0.85);
        const x = i * (barWidth + 2);
        const y = h - barHeight;

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, y, 0, h);
        if (isRecording) {
          grad.addColorStop(0, '#f43f5e');
          grad.addColorStop(1, '#881337');
        } else {
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.5, '#10b981');
          grad.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      // 2. Draw Smooth Oscilloscope Waveform on top
      ctx.lineWidth = 2.5;
      const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
      waveGrad.addColorStop(0, '#38bdf8');
      waveGrad.addColorStop(0.5, '#34d399');
      waveGrad.addColorStop(1, '#a855f7');
      ctx.strokeStyle = waveGrad;
      ctx.beginPath();

      const sliceWidth = width / timeData.length;
      let x = 0;

      for (let i = 0; i < timeData.length; i++) {
        let v = timeData[i] / 128.0;
        if (!isPlaying && !isRecording) {
          v = 1.0 + Math.sin(Date.now() / 300 + i * 0.1) * 0.04;
        }
        const y = (v * h) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, h / 2);
      ctx.stroke();

      // Center reference zero-line
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(width, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    return () => {
      unsubscribe();
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, isRecording]);

  return (
    <div className="relative w-full rounded-xl bg-slate-950/80 border border-slate-800/80 p-3 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Top Bar Indicators */}
      <div className="flex items-center justify-between mb-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              REC LIVE
            </span>
          ) : isPlaying ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              <Radio className="w-3.5 h-3.5 animate-spin" />
              VOICE ACTIVE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              STUDIO STANDBY
            </span>
          )}
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-cyan-400 font-medium">48.0 kHz • 24-bit Float</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-emerald-400">DSP: Low Latency 4.2ms</span>
        </div>

        {/* Stereo Peak dB Meters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500">L</span>
            <div className="w-16 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-75 ${
                  leftMeter > 85 ? 'bg-rose-500' : leftMeter > 65 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${leftMeter}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500">R</span>
            <div className="w-16 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-75 ${
                  rightMeter > 85 ? 'bg-rose-500' : rightMeter > 65 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${rightMeter}%` }}
              />
            </div>
          </div>
          <Volume2 className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      {/* Main Canvas Waveform */}
      <canvas
        ref={canvasRef}
        width={900}
        height={height}
        className="w-full h-[100px] rounded-lg bg-slate-950 block"
      />
    </div>
  );
};
