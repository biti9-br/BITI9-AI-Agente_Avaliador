import React, { useState, useRef } from 'react';
import { PrizeItem } from '../types';
import { Robbi9Mascot } from './Robbi9Mascot';
import { CuboLogo } from './CuboLogo';
import { Sparkles, RotateCw } from 'lucide-react';

interface PrizeWheelStepProps {
  prizes: PrizeItem[];
  onSpinComplete: (winningPrize: PrizeItem) => void;
}

export const PrizeWheelStep: React.FC<PrizeWheelStepProps> = ({ prizes, onSpinComplete }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<PrizeItem | null>(null);

  const wheelRef = useRef<HTMLDivElement>(null);

  const handleSpin = () => {
    if (isSpinning || prizes.length === 0) return;

    setIsSpinning(true);
    setSelectedPrize(null);

    // Pick a random prize slice
    const winningIndex = Math.floor(Math.random() * prizes.length);
    const winningPrize = prizes[winningIndex];

    const sliceAngle = 360 / prizes.length;
    // Calculate final rotation degrees so pointer (at 0 deg / 12 o'clock) lands on winning slice
    const targetSliceCenter = winningIndex * sliceAngle + sliceAngle / 2;
    // Extra full spins (6 full spins for excitement)
    const extraSpins = 360 * 6;
    // Reverse offset because wheel spins clockwise
    const finalDegree = rotation + extraSpins + (360 - targetSliceCenter);

    setRotation(finalDegree);

    // Wait for wheel animation duration (4.5 seconds)
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPrize(winningPrize);

      // Delay briefly before triggering parent onSpinComplete
      setTimeout(() => {
        onSpinComplete(winningPrize);
      }, 1500);
    }, 4500);
  };

  const sliceAngle = 360 / Math.max(1, prizes.length);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Robbi9 Mascot encouraging spin */}
      <div className="mb-4">
        <Robbi9Mascot
          size="md"
          expression={isSpinning ? 'excited' : 'happy'}
          message={
            isSpinning
              ? 'Girando a roleta... Torcendo por você!'
              : selectedPrize
              ? `Uau! Você tirou: ${selectedPrize.label}! 🎉`
              : 'Gire a roleta para descobrir seu prêmio exclusivo!'
          }
        />
      </div>

      {/* Main Wheel Card */}
      <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-sky-400/10 text-sky-300 border border-sky-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            Sorteio Biti9
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Roleta de prêmios</h1>
          <p className="text-xs sm:text-sm text-sky-200 mt-1">
            Clique no botão abaixo para girar a roleta da sorte!
          </p>
        </div>

        {/* WHEEL CONTAINER WITH POINTER */}
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 my-2 flex items-center justify-center">
          {/* Outer Ring Glow */}
          <div className="absolute inset-0 rounded-full border-4 border-sky-400/40 shadow-[0_0_30px_rgba(56,189,248,0.3)] pointer-events-none z-10" />

          {/* Top Pointer Needle */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            <div className="w-9 h-9 rounded-full bg-sky-300 border-2 border-white flex items-center justify-center shadow-lg">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-950" />
            </div>
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[20px] border-t-sky-300 -mt-2.5" />
          </div>

          {/* THE SPINNING SVG WHEEL */}
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full overflow-hidden shadow-2xl relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.2, 1)'
                : 'none',
            }}
          >
            <svg viewBox="0 0 300 300" className="w-full h-full">
              <defs>
                <linearGradient id="sliceGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284C7" />
                  <stop offset="100%" stopColor="#0369A1" />
                </linearGradient>
                <linearGradient id="sliceGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0F172A" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
                <linearGradient id="sliceGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0369A1" />
                  <stop offset="100%" stopColor="#0C4A6E" />
                </linearGradient>
              </defs>

              {prizes.map((prize, idx) => {
                const startAngle = idx * sliceAngle;
                const endAngle = (idx + 1) * sliceAngle;

                // Alternate slice fills
                const fills = ['url(#sliceGrad1)', 'url(#sliceGrad2)', 'url(#sliceGrad3)'];
                const sliceFill = fills[idx % fills.length];

                // Convert polar to cartesian
                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;

                const x1 = 150 + 150 * Math.cos(startRad);
                const y1 = 150 + 150 * Math.sin(startRad);
                const x2 = 150 + 150 * Math.cos(endRad);
                const y2 = 150 + 150 * Math.sin(endRad);

                const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                const pathData = `M 150 150 L ${x1} ${y1} A 150 150 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                // Text radial placement
                const midAngle = startAngle + sliceAngle / 2;
                const midRad = ((midAngle - 90) * Math.PI) / 180;

                // Radius distance from center
                const textX = 150 + 100 * Math.cos(midRad);
                const textY = 150 + 100 * Math.sin(midRad);

                // Rotate text along radial line for legibility
                let textRotation = midAngle;
                if (midAngle > 90 && midAngle < 270) {
                  textRotation += 180; // keep text right side up
                }

                const numberLabel = `#${idx + 1}`;

                return (
                  <g key={prize.id}>
                    {/* Slice */}
                    <path
                      d={pathData}
                      fill={sliceFill}
                      stroke="#0F172A"
                      strokeWidth="2"
                    />
                    {/* Big Bold Number (#1, #2, ... #10) */}
                    <text
                      x={textX}
                      y={textY}
                      fill="#FFFFFF"
                      fontSize="18"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                      className="select-none font-sans drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] tracking-wider"
                    >
                      {numberLabel}
                    </text>
                  </g>
                );
              })}

              {/* Center Hub Logo Button */}
              <circle cx="150" cy="150" r="34" fill="#090D16" stroke="#38BDF8" strokeWidth="3" />
              <circle cx="150" cy="150" r="26" fill="#0F172A" />
              <text
                x="150"
                y="152"
                fill="#38BDF8"
                fontSize="11"
                fontWeight="900"
                textAnchor="middle"
                dominantBaseline="middle"
                className="tracking-wider"
              >
                BITI9
              </text>
            </svg>
          </div>
        </div>

        {/* Spin Button */}
        <div className="w-full mt-6">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSpinning
                ? 'bg-slate-800 text-sky-200/50 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-sky-300 to-cyan-300 hover:from-sky-200 hover:to-cyan-200 text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.4)]'
            }`}
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Girando a roleta...' : 'Girar roleta agora'}</span>
          </button>
        </div>
      </div>

      {/* Clean & Legible List of Prizes */}
      <div className="w-full mt-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-300" />
          <span>Prêmios disponíveis nesta rodada:</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {prizes.map((p, index) => (
            <div
              key={p.id}
              className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex flex-col justify-between"
            >
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-800/50 shrink-0">
                  #{index + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{p.label}</h4>
                  <p className="text-[11px] text-sky-200/80 leading-snug mt-1">{p.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cubo Itaú Logo Below Container */}
      <div className="mt-8 flex flex-col items-center justify-center">
        <CuboLogo size="lg" />
      </div>
    </div>
  );
};
