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

  const handleSpin = async () => {
    if (isSpinning || prizes.length === 0) return;

    setIsSpinning(true);
    setSelectedPrize(null);

    let winningIndex = 0;
    let winningPrize: PrizeItem = prizes[0];

    try {
      const res = await fetch('/api/spin-wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prizes }),
      });

      if (res.ok) {
        const data = await res.json();
        winningIndex = data.winningIndex;
        winningPrize = data.winningPrize;
      } else {
        winningIndex = Math.floor(Math.random() * prizes.length);
        winningPrize = prizes[winningIndex];
      }
    } catch (err) {
      console.warn('Falha ao comunicar com o servidor para sorteio da roleta, usando fallback local:', err);
      winningIndex = Math.floor(Math.random() * prizes.length);
      winningPrize = prizes[winningIndex];
    }

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
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 my-4 flex items-center justify-center">
          {/* Outer Ring Glow */}
          <div className="absolute inset-0 rounded-full border border-sky-400/20 shadow-[0_0_40px_rgba(43,173,255,0.15)] pointer-events-none z-10" />

          {/* Top Pointer Needle */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-[#2BADFF] flex items-center justify-center shadow-md">
              <div className="w-2.5 h-2.5 rounded-full bg-[#020617]" />
            </div>
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-white -mt-2" />
          </div>

          {/* THE SPINNING SVG WHEEL */}
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full overflow-hidden shadow-2xl relative border border-slate-700/50"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.2, 1)'
                : 'none',
            }}
          >
            <svg viewBox="0 0 300 300" className="w-full h-full">
              <defs>
                <linearGradient id="sliceWin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2BADFF" />
                  <stop offset="100%" stopColor="#0066CC" />
                </linearGradient>
                <linearGradient id="sliceLoss1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0F172A" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
                <linearGradient id="sliceLoss2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0B1222" />
                  <stop offset="100%" stopColor="#131C30" />
                </linearGradient>
              </defs>

              {prizes.map((prize, idx) => {
                const startAngle = idx * sliceAngle;
                const endAngle = (idx + 1) * sliceAngle;

                const isWinSlice = prize.isWinning !== false;
                const sliceFill = isWinSlice
                  ? 'url(#sliceWin)'
                  : idx % 2 === 0
                  ? 'url(#sliceLoss1)'
                  : 'url(#sliceLoss2)';

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
                const textX = 150 + 108 * Math.cos(midRad);
                const textY = 150 + 108 * Math.sin(midRad);

                // Rotate text along radial line for legibility
                let textRotation = midAngle;
                if (midAngle > 90 && midAngle < 270) {
                  textRotation += 180;
                }

                const numberLabel = `#${idx + 1}`;

                return (
                  <g key={prize.id}>
                    {/* Slice */}
                    <path
                      d={pathData}
                      fill={sliceFill}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                    />
                    {/* Number Label */}
                    <text
                      x={textX}
                      y={textY}
                      fill={isWinSlice ? '#FFFFFF' : '#94A3B8'}
                      fontSize={prizes.length > 12 ? '11' : '14'}
                      fontWeight={isWinSlice ? '800' : '600'}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                      className="select-none font-sans"
                    >
                      {numberLabel}
                    </text>
                  </g>
                );
              })}

              {/* Center Hub Logo Button */}
              <circle cx="150" cy="150" r="30" fill="#020617" stroke="#2BADFF" strokeWidth="2" />
              <text
                x="150"
                y="151.5"
                fill="#2BADFF"
                fontSize="10"
                fontWeight="800"
                textAnchor="middle"
                dominantBaseline="middle"
                className="tracking-wider select-none font-sans"
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

      {/* Cubo Itaú Logo Below Container */}
      <div className="mt-8 flex flex-col items-center justify-center">
        <CuboLogo size="lg" />
      </div>
    </div>
  );
};
