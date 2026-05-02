import React, { useState, useEffect, useRef } from 'react';
import FireLogo from './FireLogo'; 

// Import âm thanh
import bgmFile from './assets/BGM.mp3';
import sfxFile from './assets/SFM.mp3';

function App() {
  const [exp, setExp] = useState(() => Number(localStorage.getItem('lastline-exp')) || 0);
  const [level, setLevel] = useState(() => Number(localStorage.getItem('lastline-level')) || 0);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('lastline-streak')) || 0);
  const [personalBest, setPersonalBest] = useState(() => Number(localStorage.getItem('lastline-pb')) || 0);
  
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('lastline-tasks');
    const lastReset = localStorage.getItem('lastline-last-reset');
    const today = new Date().toDateString();

    if (lastReset !== today) {
      const wasCompleted = saved ? Object.values(JSON.parse(saved)).every(t => t === true) : false;
      if (!wasCompleted) {
        setStreak(0);
        localStorage.setItem('lastline-streak', 0);
      }
      return { math: false, physics: false, flute: false, python: false, deadhang: false };
    }
    return saved ? JSON.parse(saved) : { math: false, physics: false, flute: false, python: false, deadhang: false };
  });

  const [timeLeft, setTimeLeft] = useState("");
  const maxExp = 1000;
  
  // Logic Piston State
  const [isDragging, setIsDragging] = useState(false);
  const [tempStreak, setTempStreak] = useState(0);
  const [isOverdrive, setIsOverdrive] = useState(false);
  const pistonRef = useRef(null);
  const chargingInterval = useRef(null);
  const canvasRef = useRef(null);

  // --- HỆ THỐNG ÂM THANH ---
  const bgmRef = useRef(null);
  const sfxRef = useRef(null);

  useEffect(() => {
    bgmRef.current = new Audio(bgmFile);
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.2;
    sfxRef.current = new Audio(sfxFile);

    const handleFirstInteraction = () => {
      bgmRef.current.play().catch(() => {});
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, []);

  // --- HỆ THỐNG HẠT (PARTICLES) ---
  const createExplosion = (count, color, isSuper) => {
    const canvas = document.getElementById('piston-particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * (isSuper ? 20 : 10),
        vy: (Math.random() - 0.5) * (isSuper ? 20 : 10),
        size: Math.random() * (isSuper ? 5 : 3),
        alpha: 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        ctx.fillStyle = color.replace('1)', `${p.alpha})`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.alpha <= 0) particles.splice(i, 1);
      });
      if (particles.length > 0) requestAnimationFrame(animate);
    };
    animate();
  };

  // --- LOGIC PISTON ---
  const handleStart = () => setIsDragging(true);

  const handleMove = (e) => {
    if (!isDragging) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = pistonRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height));
    
    const val = Math.floor(pos * personalBest);
    setTempStreak(val);

    if (val >= personalBest && personalBest > 0) {
      if (!isOverdrive) {
        setIsOverdrive(true);
        startCharging();
      }
    } else {
      setIsOverdrive(false);
      clearInterval(chargingInterval.current);
    }
  };

  const startCharging = () => {
    clearInterval(chargingInterval.current);
    chargingInterval.current = setInterval(() => {
      setTempStreak(prev => {
        const next = prev + 1;
        if (next > 100) { // Giới hạn max 100 ngày
            clearInterval(chargingInterval.current);
            return 100;
        }
        // Haptic feedback & Sound Pitch (giả lập)
        if (window.navigator.vibrate) window.navigator.vibrate(10);
        return next;
      });
    }, 100);
  };

  const handleRelease = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsOverdrive(false);
    clearInterval(chargingInterval.current);

    const n = tempStreak;
    const x = personalBest;

    if (n > x) {
      // PHÁ KỶ LỤC: SUPERNOVA
      setPersonalBest(n);
      localStorage.setItem('lastline-pb', n);
      setStreak(n);
      createExplosion(200, 'rgba(0, 242, 255, 1)', true);
      document.body.classList.add('flash-white', 'shockwave-active');
      setTimeout(() => document.body.classList.remove('flash-white', 'shockwave-active'), 600);
    } else if (n === x && x > 0) {
      // BẰNG KỶ LỤC
      createExplosion(50, 'rgba(255, 204, 0, 1)', false);
    } else {
      // DƯỚI KỶ LỤC
      createExplosion(10, 'rgba(100, 100, 100, 1)', false);
    }
    setTempStreak(0);
  };

  // --- CÁC LOGIC CŨ ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      if (diff <= 0) window.location.reload();
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('lastline-exp', exp);
    localStorage.setItem('lastline-level', level);
    localStorage.setItem('lastline-tasks', JSON.stringify(completedTasks));
    localStorage.setItem('lastline-streak', streak);
  }, [exp, level, completedTasks, streak]);

  const gainExp = (taskKey) => {
    if (completedTasks[taskKey]) return;
    sfxRef.current.play();
    let newExp = exp + 20;
    let newLevel = level;
    if (newExp >= maxExp) { newLevel += 1; newExp = 0; }
    setExp(newExp);
    setLevel(newLevel);
    setCompletedTasks(prev => ({ ...prev, [taskKey]: true }));
  };

  const handleFapReset = () => {
    if(window.confirm("BẠN VỪA PHÁ VỠ KỶ LUẬT? Level, EXP và STREAK sẽ về 0.")) {
      setExp(0); setLevel(0); setStreak(0); setPersonalBest(0);
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div 
      className={`min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans relative overflow-hidden crt-effect ${isOverdrive ? 'shake-intense' : ''}`}
      onMouseMove={handleMove}
      onMouseUp={handleRelease}
      onTouchMove={handleMove}
      onTouchEnd={handleRelease}
    >
      <div className="scanlines"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="border-b-2 border-slate-800 pb-6 mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 uppercase italic tracking-tighter pr-4">
            THE LAST LINE
          </h1>
          <div className="flex flex-col items-center md:items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hết ngày sau</span>
            <div className="text-3xl font-mono font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative">
          
          <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
            <div className="flex items-center gap-12">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black text-slate-500 uppercase italic">Level</span>
                <span className="text-8xl md:text-9xl font-mono font-black text-[#00f2ff] drop-shadow-[0_0_30px_rgba(0,242,255,0.4)] tracking-tighter">
                  {level.toString().padStart(2, '0')}
                </span>
              </div>

              {/* PISTON INPUT SYSTEM */}
              <div className="flex flex-col items-center gap-4">
                <div 
                    ref={pistonRef}
                    onMouseDown={handleStart}
                    onTouchStart={handleStart}
                    className={`piston-container ${isOverdrive ? 'piston-overdrive' : ''}`}
                >
                    <div 
                        className="cylinder-fill" 
                        style={{ height: `${isDragging ? (tempStreak / (isOverdrive ? 100 : personalBest || 1)) * 100 : 0}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black font-mono">
                            {isDragging ? tempStreak : streak}
                        </span>
                    </div>
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Kéo để báo Streak</span>
              </div>

              <div className="flex flex-col items-center">
                <FireLogo size={110} progress={(Object.values(completedTasks).filter(t => t).length / 5) * 100} isCompleted={Object.values(completedTasks).every(t => t)} />
                <div className="mt-4 px-5 py-1.5 bg-black/60 border border-purple-500/30 rounded-xl backdrop-blur-md">
                   <p className="streak-text-cyber text-sm">PB: {personalBest} DAYS</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-yellow-400 text-xl md:text-2xl font-mono font-black">
                {exp} <span className="text-sm text-orange-500/80">/ {maxExp} EXP</span>
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-7 bg-black/40 rounded-full mb-12 overflow-hidden border-2 border-slate-800 p-1 relative">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 transition-all duration-1000 ease-out rounded-full" 
              style={{ width: `${(exp / maxExp) * 100}%` }}
            ></div>
          </div>

          {/* Task Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] mb-6 text-center">Nhiệm vụ hàng ngày (+20 EXP/Quest)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { id: 'math', label: '1 Đề Toán', color: 'bg-rose-900/40 border-rose-600 text-rose-400' },
                { id: 'physics', label: '1 Đề Lý', color: 'bg-blue-900/40 border-blue-600 text-blue-400' },
                { id: 'flute', label: '5 Set Sáo', color: 'bg-emerald-900/40 border-emerald-600 text-emerald-400' },
                { id: 'python', label: '1 Python Mod', color: 'bg-indigo-900/40 border-indigo-600 text-indigo-400' },
                { id: 'deadhang', label: '3 Rep Deadhang', color: 'bg-slate-800/60 border-slate-500 text-slate-300' }
              ].map(task => (
                <button 
                  key={task.id}
                  onClick={() => gainExp(task.id)}
                  disabled={completedTasks[task.id]}
                  className={`p-5 border-2 rounded-2xl font-black text-[11px] transition-all uppercase flex flex-col items-center justify-center gap-2 ${
                    completedTasks[task.id] 
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-400" 
                    : `${task.color} hover:scale-105 active:scale-95`
                  }`}
                >
                  {completedTasks[task.id] ? "✓ DONE" : task.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rewards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-12">
            <div className={`p-6 rounded-2xl border-2 flex items-center gap-6 ${exp >= 500 ? "bg-yellow-500/10 border-yellow-400 shadow-lg" : "bg-black/40 border-slate-800 opacity-20 grayscale"}`}>
              <div className="text-5xl">{level >= 5 ? "🦊" : "🧋"}</div>
              <div>
                <p className="text-2xl font-black uppercase italic tracking-tighter">{level >= 5 ? "Giấy dán Naruto" : "Tocotoco kem cheese"}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Mốc 500 EXP</p>
              </div>
            </div>
            <div className={`p-6 rounded-2xl border-2 flex items-center gap-6 ${exp >= 1000 ? "bg-red-500/10 border-red-400 shadow-lg" : "bg-black/40 border-slate-800 opacity-20 grayscale"}`}>
              <div className="text-5xl">{level >= 5 ? "🗡️" : "🍜"}</div>
              <div>
                <p className="text-2xl font-black uppercase italic tracking-tighter">{level >= 5 ? "Figure Naruto < 500k" : "Mì Ramen"}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Mốc 1000 EXP</p>
              </div>
            </div>
          </div>

          {/* Reset */}
          <div className="flex justify-center border-t border-slate-800 pt-10">
            <button 
              onClick={handleFapReset}
              className="px-12 py-4 bg-red-600/20 border-2 border-red-600 text-red-500 font-black rounded-full hover:bg-red-600 hover:text-white transition-all uppercase tracking-[0.2em]"
            >
              FAP (RESET ALL)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;