import React, { useState } from 'react';

interface GuideWindowProps {
  onClose: () => void;
}

const TABS = [
  { id: 'basics', label: '🕹️ BASICS', icon: '⌨️' },
  { id: 'systems', label: '⚙️ SYSTEMS', icon: '🛠️' },
  { id: 'minerals', label: '💎 MINERALS', icon: '⛏️' },
  { id: 'runes', label: '🔮 RUNES', icon: '✨' },
];

const GuideWindow: React.FC<GuideWindowProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('basics');

  const renderContent = () => {
    switch (activeTab) {
      case 'basics':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <h4 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400 text-xl">🕹️</span>
                Movement & Control
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50 flex items-center gap-6 group hover:bg-zinc-900/50 transition-all">
                  <div className="w-16 h-16 bg-zinc-900 rounded-xl flex items-center justify-center text-2xl border border-zinc-800 shadow-inner group-hover:scale-110 transition-transform">
                    ⌨️
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm font-bold mb-1 tracking-widest">
                      WALK / DRILL
                    </p>
                    <p className="text-white text-lg font-black uppercase">WASD / ARROW KEYS</p>
                  </div>
                </div>
                <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50 flex items-center gap-6 group hover:bg-zinc-900/50 transition-all">
                  <div className="w-16 h-16 bg-zinc-900 rounded-xl flex items-center justify-center text-2xl border border-zinc-800 shadow-inner group-hover:scale-110 transition-transform">
                    🖱️
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm font-bold mb-1 tracking-widest">MINING</p>
                    <p className="text-white text-lg font-black uppercase">SPACE OR AUTO-MINE</p>
                  </div>
                </div>
                <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50 flex items-center gap-6 group hover:bg-zinc-900/50 transition-all col-span-full">
                  <div className="w-16 h-16 bg-zinc-900 rounded-xl flex items-center justify-center text-2xl border border-zinc-800 shadow-inner group-hover:scale-110 transition-transform">
                    ✨
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm font-bold mb-1 tracking-widest">INTERACT</p>
                    <p className="text-white text-lg font-black uppercase">
                      HOVER NEAR OBJECT & PRESS SPACE
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl">
              <p className="text-blue-400 text-sm font-black mb-3 tracking-tighter uppercase italic">
                💡 Core Objective
              </p>
              <p className="text-zinc-300 leading-relaxed text-lg">
                Dig deep into the planet <span className="text-white font-bold italic">TERRA</span>,
                collect rare minerals, and survive the dangers of the deep. The deeper you go, the
                more valuable the rewards—but the harder the soil becomes.
              </p>
            </section>
          </div>
        );
      case 'systems':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <h4 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <span className="p-2 bg-amber-500/20 rounded-lg text-amber-400 text-xl">⚙️</span>
                Gameplay Mechanics
              </h4>
              <div className="space-y-4">
                <div className="flex gap-6 items-start bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50 hover:border-amber-500/30 transition-all">
                  <div className="text-4xl">🏭</div>
                  <div className="flex-1">
                    <h5 className="text-white font-black text-xl mb-2">REFINERY (THE FORGE)</h5>
                    <p className="text-zinc-400 text-base leading-relaxed font-medium">
                      Ores collected from the mines must be smelted into{' '}
                      <span className="text-amber-400 font-bold">Ingots</span> at the Refinery.
                      High-tier equipment upgrades often require these refined materials.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50 hover:border-blue-500/30 transition-all">
                  <div className="text-4xl">🛠️</div>
                  <div className="flex-1">
                    <h5 className="text-white font-black text-xl mb-2">BLACKSMITH (UPGRADES)</h5>
                    <p className="text-zinc-400 text-base leading-relaxed font-medium">
                      Exchange your gold and materials to improve your drill's{' '}
                      <span className="text-cyan-400 font-bold">Power</span> and{' '}
                      <span className="text-cyan-400 font-bold">Speed</span>. Better gear allows for
                      faster deeper exploration.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50 hover:border-emerald-500/30 transition-all">
                  <div className="text-4xl">🤖</div>
                  <div className="flex-1">
                    <h5 className="text-white font-black text-xl mb-2">DRONES (COMPANIONS)</h5>
                    <p className="text-zinc-400 text-base leading-relaxed font-medium">
                      Equip drones at the Lab to assist you in mining. They follow you and
                      automatically break nearby tiles, providing constant support.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
      case 'minerals':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <h4 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <span className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 text-xl">
                  ⛏️
                </span>
                Geology of Planet Terra
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'COAL', depth: '20m+', color: 'text-zinc-400' },
                  { name: 'IRON', depth: '100m+', color: 'text-zinc-500' },
                  { name: 'GOLD', depth: '300m+', color: 'text-amber-400' },
                  { name: 'DIAMOND', depth: '450m+', color: 'text-cyan-400' },
                  { name: 'EMERALD', depth: '650m+', color: 'text-emerald-400' },
                  { name: 'RUBY', depth: '850m+', color: 'text-rose-400' },
                  { name: 'SAPPHIRE', depth: '1050m+', color: 'text-blue-400' },
                  { name: 'URANIUM', depth: '1200m+', color: 'text-lime-400' },
                ].map((min) => (
                  <div
                    key={min.name}
                    className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 group hover:border-zinc-700 transition-all"
                  >
                    <div className="text-[10px] font-black text-zinc-600 mb-1 tracking-widest">
                      MINERAL
                    </div>
                    <div className={`text-xl font-black ${min.color} mb-1`}>{min.name}</div>
                    <div className="text-[10px] font-bold text-zinc-500 tracking-tighter uppercase italic">
                      Found at {min.depth}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl">
              <p className="text-emerald-400 text-sm font-black mb-3 tracking-tighter uppercase italic">
                💡 Explorer's Tip
              </p>
              <p className="text-zinc-300 leading-relaxed text-lg italic">
                Notice the soil color changing as you go deeper. Harder rocks like{' '}
                <span className="text-red-400 font-bold">Obsidian</span> can only be found near the
                core!
              </p>
            </div>
          </div>
        );
      case 'runes':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <h4 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <span className="p-2 bg-purple-500/20 rounded-lg text-purple-400 text-xl">🔮</span>
                Skill Module System
              </h4>
              <div className="bg-zinc-950 p-8 rounded-4xl border border-zinc-900 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <div className="text-9xl">✨</div>
                </div>
                <div className="relative z-10">
                  <h5 className="text-2xl font-black text-white mb-4">Enhance Your Drill</h5>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-8 font-medium">
                    As your Mastery Level increases, you will unlock{' '}
                    <span className="text-purple-400 font-bold italic underline decoration-purple-400/30">
                      Rune Slots
                    </span>{' '}
                    on your drill.
                  </p>

                  <ul className="space-y-4">
                    {[
                      {
                        icon: '⚔️',
                        title: 'ATTACK MODULE',
                        desc: 'Boosts raw mining damage output',
                      },
                      { icon: '⚡', title: 'SPEED MODULE', desc: 'Increases the rate of rotation' },
                      {
                        icon: '🍀',
                        title: 'LUCK MODULE',
                        desc: 'Improves chances of rare mineral drops',
                      },
                      {
                        icon: '🔥',
                        title: 'CRIT MODULE',
                        desc: 'Adds critical hit damage to drilling',
                      },
                    ].map((mod) => (
                      <li key={mod.title} className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-xl border border-zinc-800 shadow-inner">
                          {mod.icon}
                        </div>
                        <div>
                          <p className="text-white font-black text-sm tracking-tight">
                            {mod.title}
                          </p>
                          <p className="text-zinc-500 text-xs font-medium">{mod.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-2xl pointer-events-auto animate-in fade-in duration-500">
      <div className="bg-[#1a1a1b] w-full max-w-6xl h-full max-h-[85vh] rounded-3xl md:rounded-[40px] border-2 border-zinc-800 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row relative">
        {/* LEFT NAV (SIDEBAR) */}
        <div className="w-full md:w-[280px] bg-zinc-950/50 border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col gap-2 shrink-0">
          <div className="mb-10 px-4">
            <h2 className="text-sm font-black text-zinc-600 tracking-widest uppercase mb-1">
              Navigation
            </h2>
            <h3 className="text-3xl font-black text-white tracking-tighter italic">GUIDE BOOK</h3>
          </div>

          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible custom-scrollbar pb-2 md:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-6 py-5 rounded-2xl transition-all font-black text-sm tracking-widest whitespace-nowrap md:whitespace-normal group ${
                  activeTab === tab.id
                    ? 'bg-zinc-100 text-zinc-950 shadow-xl scale-[1.02]'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span
                  className={`text-xl transition-transform ${activeTab === tab.id ? 'scale-125' : 'group-hover:scale-110'}`}
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-auto hidden md:block px-6 py-8 bg-zinc-950 rounded-3xl border border-zinc-900/50 shadow-inner">
            <p className="text-[10px] font-black text-zinc-600 mb-2 tracking-widest uppercase italic">
              Current Version
            </p>
            <p className="text-white font-mono text-xs opacity-50">ALPHA 0.8.2.4</p>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-8 md:p-14 lg:p-20 custom-scrollbar">
            {renderContent()}
          </div>

          <div className="p-8 md:p-10 bg-zinc-950/30 border-t border-zinc-800/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-600 font-bold text-[10px] tracking-widest uppercase">
                System Operational
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-10 py-5 bg-zinc-100 text-zinc-950 hover:bg-white text-base font-black tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all focus:outline-none"
            >
              CLOSE [ESC]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideWindow;
