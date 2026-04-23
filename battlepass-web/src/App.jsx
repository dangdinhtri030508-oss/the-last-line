import React, { useState, useEffect } from 'react';

function App() {
  const [exp, setExp] = useState(() => Number(localStorage.getItem('lastline-exp')) || 0);
  const [level, setLevel] = useState(() => Number(localStorage.getItem('lastline-level')) || 0);
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('lastline-tasks');
    const lastReset = localStorage.getItem('lastline-last-reset');
    const today = new Date().toDateString();

    // KIỂM TRA NGAY KHI LOAD TRANG: Nếu ngày lưu khác ngày hiện tại -> Reset task
    if (lastReset !== today) {
      return { math: false, physics: false, flute: false, python: false, deadhang: false };
    }
    return saved ? JSON.parse(saved) : { math: false, physics: false, flute: false, python: false, deadhang: false };
  });
  const [timeLeft, setTimeLeft] = useState("");

  const maxExp = 1000;

  // --- LOGIC RESET & COUNTDOWN ---
  useEffect(() => {
    // 1. Cập nhật ngày reset cuối cùng vào localStorage lần đầu
    const today = new Date().toDateString();
    localStorage.setItem('lastline-last-reset', today);

    // 2. Chạy timer mỗi giây
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      
      // Nếu đúng thời điểm giao thừa
      if (diff <= 0) {
        const newDay = new Date().toDateString();
        setCompletedTasks({ math: false, physics: false, flute: false, python: false, deadhang: false });
        localStorage.setItem('lastline-last-reset', newDay);
      }

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('lastline-exp', exp);
    localStorage.setItem('lastline-level', level);
    localStorage.setItem('lastline-tasks', JSON.stringify(completedTasks));
  }, [exp, level, completedTasks]);

  // --- ACTIONS ---
  const gainExp = (taskKey) => {
    if (completedTasks[taskKey]) return;

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
    if(window.confirm("BẠN VỪA PHÁ VỠ KỶ LUẬT? Level và EXP sẽ về 0, nhưng nhiệm vụ hôm nay vẫn được giữ.")) {
      setExp(0);
      setLevel(0);
    }
  };

  const reward500 = level === 5 ? "Giấy dán Naruto" : "Tocotoco kem cheese";
  const reward1000 = level === 5 ? "Figure Naruto < 500k" : "Mì Ramen";

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="border-b-2 border-slate-800 pb-6 mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 uppercase italic">
            THE LAST LINE
          </h1>
          <div className="flex flex-col items-center md:items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hết ngày sau</span>
            <div className="text-3xl font-mono font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse">
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative">
          
          {/* Level Display */}
          <div className="flex justify-between items-baseline mb-8">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-slate-500 uppercase italic">Level</span>
              <span className="text-8xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {level}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-xl font-mono font-bold">
                {exp} <span className="text-sm opacity-50">/ {maxExp} EXP</span>
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-6 bg-black/60 rounded-full mb-12 overflow-hidden border-2 border-slate-800 p-1">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all duration-1000 ease-out rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)]" 
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
                { id: 'flute', label: '5 Vòng Sáo', color: 'bg-emerald-900/40 border-emerald-600 text-emerald-400' },
                { id: 'python', label: '3 Python Mod', color: 'bg-indigo-900/40 border-indigo-600 text-indigo-400' },
                { id: 'deadhang', label: 'Deadhang', color: 'bg-slate-800/60 border-slate-500 text-slate-300' }
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
                      <span>COMPLETED</span>
                    </>
                  ) : task.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rewards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-12">
            <div className={`p-6 rounded-2xl border-2 flex items-center gap-6 ${exp >= 500 ? "bg-yellow-500/10 border-yellow-400" : "bg-black/40 border-slate-800 opacity-20 grayscale"}`}>
              <div className="text-5xl">{level === 5 ? "🦊" : "🧋"}</div>
              <div>
                <p className="text-2xl font-black uppercase italic">{reward500}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Mốc 500 EXP</p>
              </div>
            </div>
            <div className={`p-6 rounded-2xl border-2 flex items-center gap-6 ${exp >= 1000 ? "bg-red-500/10 border-red-400" : "bg-black/40 border-slate-800 opacity-20 grayscale"}`}>
              <div className="text-5xl">{level === 5 ? "🗡️" : "🍜"}</div>
              <div>
                <p className="text-2xl font-black uppercase italic">{reward1000}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Mốc 1000 EXP</p>
              </div>
            </div>
          </div>

          {/* Reset Action */}
          <div className="flex justify-center border-t border-slate-800 pt-10">
            <button 
              onClick={handleFapReset}
              className="px-12 py-4 bg-red-600/20 border-2 border-red-600 text-red-500 font-black rounded-full hover:bg-red-600 hover:text-white transition-all uppercase tracking-[0.2em] shadow-lg"
            >
              FAP (RESET LEVEL & EXP)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;