'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createInitialWorld, GameWorld } from '../../entities/world/model';
import { inputSystem } from '../../features/input/inputSystem';
import { physicsSystem } from '../../features/movement/physicsSystem';
import { miningSystem } from '../../features/mining/miningSystem';
import { interactionSystem } from '../../features/interaction/interactionSystem';
import { renderSystem } from '../../features/render/renderSystem';
import { questSystem } from '../../features/quest/questSystem';
import { effectSystem } from '../../features/effects/effectSystem';
import { fetchBaseLayout, fetchEntities, fetchQuests } from '../../shared/lib/dataLoader';
import { saveManager, SaveData } from '../../shared/lib/saveManager';

// Widgets
import Hud from '../../widgets/hud/Hud';
import Shop from '../../widgets/shop/Shop';
import Inventory from '../../widgets/inventory/Inventory';
import Crafting from '../../widgets/crafting/Crafting';
import StatusWindow from '../../widgets/status/StatusWindow';
import Settings from '../../widgets/settings/Settings';
import Elevator from '../../widgets/elevator/Elevator';
import Encyclopedia from '../../widgets/encyclopedia/Encyclopedia';

export default function GameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<GameWorld>(createInitialWorld(Math.floor(Math.random() * 1000000)));
  const [isClient, setIsClient] = useState(false);
  const [uiVersion, setUiVersion] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 1280, height: 720 });

  const updateUi = useCallback(() => {
    setUiVersion(v => v + 1);
  }, []);

  // Assets Loading
  const loadAssets = useCallback(async () => {
    const world = worldRef.current;
    
    // Images
    const playerImg = new Image(); playerImg.src = '/Player.png';
    playerImg.onload = () => world.assets.player = playerImg;

    const tilesetImg = new Image(); tilesetImg.src = '/NewTileset.png';
    tilesetImg.onload = () => world.assets.tileset = tilesetImg;

    const baseTilesetImg = new Image(); baseTilesetImg.src = '/BaseTileset.png';
    baseTilesetImg.onload = () => world.assets.baseTileset = baseTilesetImg;

    // JSON Data
    world.baseLayout = await fetchBaseLayout();
    const entities = await fetchEntities();
    world.entities = entities;
    world.availableQuests = await fetchQuests();

    // Entity Assets (Merchant, Mechanic, etc.)
    entities.forEach(entity => {
      if (entity.imagePath && !world.assets.entities[entity.imagePath]) {
        const img = new Image();
        img.src = `/${entity.imagePath}`;
        img.onload = () => {
          world.assets.entities[entity.imagePath!] = img;
        };
      }
    });

    // Resource Assets (optional if those files don't exist yet, but removing 404s)
    // const gems = ['emerald', 'ruby', 'sapphire'];
    // gems.forEach(gem => ...);
  }, []);

  useEffect(() => {
    setIsClient(true);

    // Load Save Data
    const saved = saveManager.load();
    if (saved) {
      const world = worldRef.current;
      world.player.stats = saved.stats;
      world.player.pos = saved.position;
      world.player.visualPos = { ...saved.position };
      // Note: seed and dimension might have changed in stats
      world.tileMap.deserialize(saved.tileMap, saved.stats.mapSeed, saved.stats.dimension);
    }

    loadAssets();

    // Event Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      const { ui } = worldRef.current;
      const isAnyModalOpen = ui.isShopOpen || ui.isInventoryOpen || ui.isSettingsOpen || 
                             ui.isCraftingOpen || ui.isElevatorOpen || ui.isStatusOpen || ui.isEncyclopediaOpen;

      if (e.key === 'Escape') {
        if (isAnyModalOpen) {
          ui.isShopOpen = ui.isInventoryOpen = ui.isSettingsOpen = 
          ui.isCraftingOpen = ui.isElevatorOpen = ui.isStatusOpen = ui.isEncyclopediaOpen = false;
        } else {
          ui.isSettingsOpen = true;
        }
        updateUi();
        return;
      }

      if (isAnyModalOpen) return;
      worldRef.current.keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      worldRef.current.keys[e.key.toLowerCase()] = false;
    };

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);
    
    handleResize();

    // DEBUG LOG TILE COUNTS ON START
    setTimeout(() => {
      const counts: Record<string, number> = {};
      const map = worldRef.current.tileMap;
      for (let y=0; y<100; y++) {
        for(let x=0; x<30; x++) {
          const t = map.getTile(x, y);
          if (t && t.type !== 'empty') {
            counts[t.type] = (counts[t.type] || 0) + 1;
          }
        }
      }
      console.log("CLIENT TILE COUNTS (0-100):", counts);
    }, 1000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [loadAssets, updateUi]);

  // Main Loop
  useEffect(() => {
    if (!isClient) return;

    let frameId: number;
    const loop = (now: number) => {
      const world = worldRef.current;
      const canvas = canvasRef.current;

      // ECS Systems
      try {
        const deltaTime = now - (world.timestamp.lastLoop || now);
        world.timestamp.lastLoop = now;

        inputSystem(world);
        physicsSystem(world, now);
        miningSystem(world, now);
        interactionSystem(world);
        questSystem(world);
        effectSystem(world, deltaTime);
        
        if (canvas) {
          renderSystem(world, canvas);
        }

        // Sync UI occasionally
        if (now - world.timestamp.lastUiUpdate > 100) {
          world.timestamp.lastUiUpdate = now;
          updateUi();
        }

        frameId = requestAnimationFrame(loop);
      } catch (err: any) {
        console.error('GAME LOOP CRASH:', err);
      }
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isClient, updateUi]);

  // Auto-save
  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      const world = worldRef.current;
      const saveData: SaveData = {
        version: 1,
        timestamp: Date.now(),
        stats: world.player.stats,
        position: world.player.pos,
        tileMap: world.tileMap.serialize(),
      };
      saveManager.save(saveData);
      console.log('Game Auto-saved');
    }, 60000); // Save every 60 seconds
    return () => clearInterval(interval);
  }, [isClient]);

  if (!isClient) return <div className="text-white p-20 font-mono">INITIALIZING ENGINE...</div>;

  const world = worldRef.current;
  const { ui, player } = world;

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        width={windowSize.width}
        height={windowSize.height}
        className="w-full h-full block"
      />

      <Hud stats={player.stats} onOpenEncyclopedia={() => { ui.isEncyclopediaOpen = !ui.isEncyclopediaOpen; updateUi(); }} />

      {/* Modals */}
      {ui.isShopOpen && (
        <Overlay onClose={() => { ui.isShopOpen = false; updateUi(); }}>
          <Shop 
            stats={player.stats} 
            availableQuests={world.availableQuests}
            onClose={() => { ui.isShopOpen = false; updateUi(); }}
            onAcceptQuest={(id) => {
              const q = world.availableQuests.find(qa => qa.id === id);
              if (q && !player.stats.activeQuests.find(aq => aq.id === id)) {
                player.stats.activeQuests.push({ ...q, status: 'active' });
                updateUi();
              }
            }}
            onCompleteQuest={(id) => {
              const idx = player.stats.activeQuests.findIndex(aq => aq.id === id);
              if (idx !== -1) {
                const q = player.stats.activeQuests[idx];
                if (q.requirement.current >= q.requirement.target) {
                  player.stats.completedQuestIds.push(id);
                  player.stats.activeQuests.splice(idx, 1);
                  updateUi();
                }
              }
            }}
            onUpgrade={(type, req) => {
              // Implementation of handleUpgrade legacy logic
              if (type === 'attackPower') player.stats.attackPower += 20;
              else if (type === 'maxHp') player.stats.maxHp += 50;
              updateUi();
            }}
            onCraft={(req, res) => {
              if (res.drillId && !player.stats.ownedDrillIds.includes(res.drillId)) {
                player.stats.ownedDrillIds.push(res.drillId);
              }
              updateUi();
            }}
            onSell={(resource, amount, price) => {
              const inv = player.stats.inventory as any;
              if (inv[resource] >= amount) {
                inv[resource] -= amount;
                player.stats.goldCoins += price;
                updateUi();
              }
            }}
          />
        </Overlay>
      )}

      {ui.isStatusOpen && (
        <Overlay onClose={() => { ui.isStatusOpen = false; updateUi(); }}>
          <StatusWindow stats={player.stats} onClose={() => { ui.isStatusOpen = false; updateUi(); }} />
        </Overlay>
      )}

      {ui.isInventoryOpen && (
        <Overlay onClose={() => { ui.isInventoryOpen = false; updateUi(); }}>
          <Inventory 
            stats={player.stats} 
            onClose={() => { ui.isInventoryOpen = false; updateUi(); }}
            onEquip={(id) => { player.stats.equippedDrillId = id; updateUi(); }}
          />
        </Overlay>
      )}

      {ui.isCraftingOpen && (
        <Overlay onClose={() => { ui.isCraftingOpen = false; updateUi(); }}>
          <Crafting 
            stats={player.stats} 
            onClose={() => { ui.isCraftingOpen = false; updateUi(); }}
            onCraft={(req, res) => {
              if (res.drillId && !player.stats.ownedDrillIds.includes(res.drillId)) {
                player.stats.ownedDrillIds.push(res.drillId);
              }
              updateUi();
            }}
          />
        </Overlay>
      )}

      {ui.isElevatorOpen && (
        <Overlay onClose={() => { ui.isElevatorOpen = false; updateUi(); }}>
          <Elevator 
            stats={player.stats} 
            onClose={() => { ui.isElevatorOpen = false; updateUi(); }}
            onSelectCheckpoint={(depth) => {
              player.pos.y = depth + 10; // BASE_DEPTH
              player.visualPos.y = depth + 10;
              player.stats.depth = depth;
              ui.isElevatorOpen = false;
              updateUi();
            }}
          />
        </Overlay>
      )}

      {ui.isEncyclopediaOpen && (
        <Overlay onClose={() => { ui.isEncyclopediaOpen = false; updateUi(); }}>
          <Encyclopedia stats={player.stats} onClose={() => { ui.isEncyclopediaOpen = false; updateUi(); }} />
        </Overlay>
      )}

      {ui.isSettingsOpen && (
        <Overlay onClose={() => { ui.isSettingsOpen = false; updateUi(); }}>
          <Settings 
            onClose={() => { ui.isSettingsOpen = false; updateUi(); }} 
            onReset={() => {
              saveManager.clear();
              window.location.reload();
            }}
            onExport={() => {
              const world = worldRef.current;
              const saveData: SaveData = {
                version: 1,
                timestamp: Date.now(),
                stats: world.player.stats,
                position: world.player.pos,
                tileMap: world.tileMap.serialize(),
              };
              const exported = saveManager.export(saveData);
              navigator.clipboard.writeText(exported);
              alert('세이브 코드가 클립보드에 복사되었습니다.');
            }}
            onImport={() => {
              const code = prompt('세이브 코드를 입력하세요:');
              if (code) {
                const imported = saveManager.import(code);
                if (imported) {
                  saveManager.save(imported);
                  window.location.reload();
                } else {
                  alert('유효하지 않은 세이브 코드입니다.');
                }
              }
            }}
          />
        </Overlay>
      )}

      {/* Add other widgets similarly... */}
    </div>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-7xl h-5/6 relative">
        {children}
      </div>
    </div>
  );
}
