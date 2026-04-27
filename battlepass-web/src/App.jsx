import React, { useState, useEffect, useRef } from 'react';
import FireLogo from './FireLogo'; 

// Import âm thanh từ thư mục assets
import bgmFile from './assets/BGM.mp3';
import sfxFile from './assets/SFM.mp3';

function App() {
  const [exp, setExp] = useState(() => Number(localStorage.getItem('lastline-exp')) || 0);
  const [level, setLevel] = useState(() => Number(localStorage.getItem('lastline-level')) || 0);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('lastline-streak')) || 0);
  
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
  
  // Logic kiểm tra hoàn thành và tính % cho ngọn lửa
  const completedCount = Object.values(completedTasks).filter(task => task === true).length;
  const totalTasks = Object.keys(completedTasks).length;
  const taskProgress = (completedCount / totalTasks) * 100; 
  const isTodayCompleted = completedCount === totalTasks;

  // --- HỆ THỐNG ÂM THANH ---
  const bgmRef = useRef(null);

  useEffect(() => {
    bgmRef.current = new Audio(bgmFile);
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.2;

    const handleFirstInteraction = () => {
      bgmRef.current.play().catch(err => console.log("Chờ tương tác..."));
      window.removeEventListener('click', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    return () => {
      if (bgmRef.current) bgmRef.current.pause();
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  const playSfx = () => {
    const sfx = new Audio(sfxFile);
    sfx.volume = 0.5;
    sfx.play();
  };

  // --- LOGIC GAME ---
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('lastline-last-reset', today);

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

  useEffect(() => {
    if (isTodayCompleted) {
      const lastReset = localStorage.getItem('lastline-last-reset');
      const streakUpdatedDate = localStorage.getItem('lastline-streak-date');
      if (streakUpdatedDate !== lastReset) {
        setStreak(prev => prev + 1);
        localStorage.setItem('lastline-streak-date', lastReset);
      }
    }
  }, [isTodayCompleted]);

  const gainExp = (taskKey) => {
    if (completedTasks[taskKey]) return;
    playSfx();
    let newExp = exp + 20;
    let newLevel = level;
    if (newExp >= maxExp) {
      newLevel += 1;
      newExp = 0;
    }
    setExp(newExp);
    setLevel(newLevel);
    setCompletedTasks(prev => ({ ...prev, [taskKey]: true }));
  };

  const handleFapReset = () => {
    if(window.confirm("BẠN VỪA PHÁ VỠ KỶ LUẬT? Level và EXP sẽ về 0, STREAK cũng mất.")) {
      setExp(0);
      setLevel(0);
      setStreak(0);
      localStorage.removeItem('lastline-streak-date');
    }
  };

  const reward500 = level === 5 ? "Giấy dán Naruto" : "Tocotoco kem cheese";
  const reward1000 = level === 5 ? "Figure Naruto < 500k" : "Mì Ramen";

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans relative overflow-hidden crt-effect">
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
          
          {/* Level & Streak Display */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
            <div className="flex items-center gap-12">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black text-slate-500 uppercase italic">Level</span>
                <span className="text-8xl md:text-9xl font-mono font-black text-[#00f2ff] drop-shadow-[0_0_30px_rgba(0,242,255,0.4)] tracking-tighter">
                  {level.toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex flex-col items-center ml-4">
                <div className="relative flex justify-center items-center">
                  {/* Ngọn lửa sáng dần theo taskProgress */}
                  <FireLogo size={110} progress={taskProgress} isCompleted={isTodayCompleted} />
                </div>
                
                {streak > 0 && (
                  <div className="mt-4 px-5 py-1.5 bg-black/60 border border-purple-500/30 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(138,43,226,0.2)]">
                    <p className="streak-text-cyber text-sm animate-pulse whitespace-nowrap">
                      STREAK: {streak} DAYS
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-yellow-400 text-xl md:text-2xl font-mono font-black drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">
                {exp} <span className="text-sm text-orange-500/80">/ {maxExp} EXP</span>
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-7 bg-black/40 rounded-full mb-12 overflow-hidden border-2 border-slate-800 p-1 relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 transition-all duration-1000 ease-out rounded-full shadow-[0_0_25px_rgba(251,191,36,0.5)] relative overflow-hidden" 
              style={{ width: `${(exp / maxExp) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
            </div>
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
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]" 
                    : `${task.color} hover:scale-105 active:scale-95`
                  }`}
                >
                  {completedTasks[task.id] ? (
                    <>
                      <span className="text-xl">✓</span>
                      <span>DONE</span>
                    </>
                  ) : task.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rewards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-12">
            <div className={`p-6 rounded-2xl border-2 flex items-center gap-6 ${exp >= 500 ? "bg-yellow-500/10 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]" : "bg-black/40 border-slate-800 opacity-20 grayscale"}`}>
              <div className="text-5xl">{level === 5 ? "🦊" : "🧋"}</div>
              <div>
                <p className="text-2xl font-black uppercase italic tracking-tighter">{reward500}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Mốc 500 EXP</p>
              </div>
            </div>
            <div className={`p-6 rounded-2xl border-2 flex items-center gap-6 ${exp >= 1000 ? "bg-red-500/10 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-black/40 border-slate-800 opacity-20 grayscale"}`}>
              <div className="text-5xl">{level === 5 ? "🗡️" : "🍜"}</div>
              <div>
                <p className="text-2xl font-black uppercase italic tracking-tighter">{reward1000}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Mốc 1000 EXP</p>
              </div>
            </div>
          </div>

          {/* Reset Action */}
          <div className="flex justify-center border-t border-slate-800 pt-10">
            <button 
              onClick={handleFapReset}
              className="px-12 py-4 bg-red-600/20 border-2 border-red-600 text-red-500 font-black rounded-full hover:bg-red-600 hover:text-white transition-all uppercase tracking-[0.2em] shadow-lg active:scale-95"
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