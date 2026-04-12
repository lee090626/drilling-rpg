import Link from 'next/link';

export const dynamic = 'force-static';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-700/30 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-700/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-600">
              Drilling RPG
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 font-light max-w-2xl leading-relaxed">
            A web-based top-down mining action RPG where you explore the endless abyss. Mine minerals, grow your character, and defeat boss monsters lurking in the dark.
          </p>

          <div className="pt-8 flex flex-col items-center gap-4">
            <Link 
              href="/play" 
              className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white transition-all duration-200 bg-cyan-500 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 hover:bg-cyan-400 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]"
            >
              <div className="absolute -inset-2 transition-all duration-200 rounded-xl opacity-20 blur-xl group-hover:opacity-40 group-hover:duration-200 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
              Play for Free Now
              <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </Link>
            <p className="text-zinc-500 text-sm mt-2">Plays right in your browser. No installation required.</p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 animate-bounce text-zinc-500">
          <p className="text-sm mb-2 opacity-60 uppercase tracking-widest font-semibold text-center">Scroll Down</p>
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Content Section for SEO & AdSense */}
      <article className="relative z-10 max-w-5xl mx-auto px-6 py-24 space-y-28">
        
        {/* Section 1: Story */}
        <section className="bg-white/5 border border-white/10 p-10 md:p-16 rounded-3xl backdrop-blur-sm shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white bg-clip-text">Exploration of the Deep Dark Underground</h2>
          <div className="space-y-4 text-zinc-300 text-lg leading-relaxed">
            <p>
              Drilling RPG is a survival mining action game set in an underground world of unknown depths. 
              Starting with just a small pickaxe and a rusty drill, you will dig up valuable minerals such as diamonds, 
              emeralds, and uranium to accumulate wealth and honor. But the underground world is not just full of beautiful minerals. 
              In the abyss where light cannot reach, ancient monsters and terrifying bosses are hunting for miners.
            </p>
            <p>
              Discover dungeons and caves that have been asleep for ages, and travel through mysterious Dimension portals 
              to uncover lost technologies and magic. The deeper you dig into the underground world, the greater the danger, 
              but immense rewards await you. Become the ultimate miner and warrior in this mesmerizing RPG universe.
            </p>
          </div>
        </section>

        {/* AdSense Placeholder Area */}
        <div className="w-full min-h-[150px] bg-zinc-900 border border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 my-10 p-4">
          <p className="text-sm uppercase tracking-widest font-semibold mb-2">Google AdSense Area</p>
          <p className="text-xs text-center max-w-sm opacity-60">This game covers server and domain costs through advertising revenue to provide continuous free updates.</p>
        </div>

        {/* Section 2: Features */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Core Game Systems</h2>
            <p className="text-zinc-400 text-lg">Discover the systems that will help you survive and grow stronger underground.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-linear-to-br from-zinc-900 to-black border border-white/5 p-8 rounded-3xl hover:border-cyan-500/30 transition-colors group">
              <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/40 group-hover:scale-110 transition-transform">
                <span className="text-2xl">⛏️</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-zinc-100">Progression &amp; Crafting System</h3>
              <p className="text-zinc-400 leading-relaxed">
                Smelt various minerals like iron, gold, and diamonds gathered underground in the Refinery to create higher-tier materials.
                Use these valuable metals in the Laboratory system to permanently upgrade all your stats, from basic attack power and HP
                to your drill's mining speed. Transform a rusty drill into a powerful special weapon using resources.
              </p>
            </div>

            <div className="bg-linear-to-br from-zinc-900 to-black border border-white/5 p-8 rounded-3xl hover:border-indigo-500/30 transition-colors group">
              <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/40 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-zinc-100">Pet Drones &amp; Automation</h3>
              <p className="text-zinc-400 leading-relaxed">
                Loyal AI 'Pet Drones' are available to assist you at all times. Choose a drone that fits your playstyle, 
                from a basic combat drone that automatically attacks nearby minerals, to a special support drone with a 
                Magnet effect that pulls remote items toward you. Maximize your farming efficiency.
              </p>
            </div>

            <div className="bg-linear-to-br from-zinc-900 to-black border border-white/5 p-8 rounded-3xl hover:border-blue-500/30 transition-colors group">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/40 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔮</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-zinc-100">Skill Rune Enchantment</h3>
              <p className="text-zinc-400 leading-relaxed">
                Your equipped drill can hold mystical magic beyond its physical specs. Insert magic stones into the 
                empty sockets of your equipment through the in-game Skill Rune system. Research hundreds of combinations, 
                such as the 'Fire Rune' that causes an explosion upon killing a monster, or the 'Dash Rune' that boosts your speed, 
                to complete your own unique combat style.
              </p>
            </div>

            <div className="bg-linear-to-br from-zinc-900 to-black border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-colors group">
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/40 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🐉</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-zinc-100">Giant Dimensional Bosses</h3>
              <p className="text-zinc-400 leading-relaxed">
                Terrifying ancient bosses govern dimensions deep within the underground world. They possess overwhelming size 
                and destructive special patterns unmatched by regular monsters, requiring evasive maneuvers and precise strikes. 
                Defeating them opens a portal to the next Dimension, revealing completely new minerals and fantastic ancient artifacts.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: 광물 도감 (SEO Content Booster) */}
        <section className="bg-zinc-900/50 border border-white/5 rounded-3xl p-10 md:p-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Mineral Glossary</h2>
            <p className="text-zinc-400 text-lg">Key resources found deep underground.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Coal', icon: '🌑', desc: 'A common fuel found near the surface. Used as basic fuel for the refinery.', depth: '0m ~ 100m' },
              { name: 'Iron Ore', icon: '⛓️', desc: 'An essential metal for early equipment upgrades. Hidden inside heavy rock crevices.', depth: '150m ~ 400m' },
              { name: 'Gold', icon: '💰', desc: 'A highly valuable material needed for strong drills and base research. Easily recognizable by its shining glow.', depth: '400m ~ 800m' },
              { name: 'Diamond', icon: '💎', desc: 'The hardest mineral in the world. Found in unbreakable bedrock layers.', depth: '800m ~ 1200m' },
              { name: 'Ruby', icon: '🏮', desc: 'A red gem containing the heat of magma. Increases the thermal efficiency of high-level weapons.', depth: '1000m+' },
              { name: 'Emerald', icon: '🌲', desc: 'A transparent green gem used in precision optical equipment.', depth: '650m+' }
            ].map((min, idx) => (
              <div key={idx} className="bg-black/50 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center group hover:bg-zinc-900 transition-colors">
                <div className="w-16 h-16 mb-4 flex items-center justify-center text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform">
                  {min.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{min.name}</h4>
                <div className="text-xs font-mono text-cyan-400 mb-3 bg-cyan-950/50 px-2 py-1 rounded">Depth: {min.depth}</div>
                <p className="text-sm text-zinc-400 leading-relaxed">{min.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: FAQ */}
        <section className="border border-white/10 p-10 md:p-16 rounded-3xl bg-zinc-950">
          <h2 className="text-3xl font-bold mb-10 text-center text-white">Frequently Asked Questions (FAQ)</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-white/5 p-6 rounded-2xl">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-cyan-500">Q.</span> Do I lose my collected items when I die?
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                No! Drilling RPG respects the player's effort and achievements. We completely removed the death penalty 
                of losing minerals because it's harmful to mental health! Even if you are killed by a monster, you will 
                respawn at the surface base camp with all your precious minerals and gold safely preserved in your inventory.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-cyan-500">Q.</span> How do I save the game?
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                The game automatically saves your state every 10 seconds using your browser's local storage. 
                You can play safely, and if you want to play on another device later, you can transfer data by using 
                the 'Export/Import Save Code' feature in the settings.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-cyan-500">Q.</span> How do I attack enemy monsters?
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                Click the target icon at the bottom right of the screen or continuously push the arrow keys (WASD) 
                towards the monster to enter auto-attack mode. It works similarly to breaking normal rocks, but the 
                damage varies depending on the monster's armor and your attack power.
              </p>
            </div>
          </div>
        </section>

      </article>

      {/* Footer / Final CTA */}
      <footer className="border-t border-white/10 mt-20 bg-black pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Are you ready?</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Your first pickaxe strike awakens the secrets of the giant abyss. Dive into the underground world right now.
          </p>
          <Link 
            href="/play" 
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-black bg-white rounded-xl hover:bg-zinc-200 transition-colors shadow-2xl shadow-white/10"
          >
            Start Adventure
          </Link>

          <div className="mt-20 text-zinc-600 text-sm">
            <p>© {new Date().getFullYear()} Drilling RPG. All rights reserved.</p>
            <p className="mt-2">This website and game were designed as a cozy, free-to-play top-down RPG for players everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
