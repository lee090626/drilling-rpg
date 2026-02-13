'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TileMap, TILE_SIZE, MAP_WIDTH } from '../lib/TileMap';
import { PlayerStats, Position, Entity, Quest } from '../types/game';
import { DRILLS } from '../lib/DrillData';
import Shop from './Shop';
import Crafting from './Crafting';
import Inventory from './Inventory';
import Settings from './Settings';
import StatusWindow from './StatusWindow';

const GAME_LOOP_MS = 100;
const MINING_DELAY_MS = 0; // Removed bottleneck, using drill stats instead
const MOVEMENT_DELAY_MS = 100;
const BASE_DEPTH = 10;

export default function GameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);
  const tilesetRef = useRef<HTMLImageElement | null>(null);
  const baseTilesetRef = useRef<HTMLImageElement | null>(null);
  const [tilesetLoaded, setTilesetLoaded] = useState(false);
  const baseLayoutRef = useRef<number[][] | null>(null);
  const [baseTilesetLoaded, setBaseTilesetLoaded] = useState(false);
  const entitiesRef = useRef<Entity[]>([]);
  const entityImagesRef = useRef<{ [path: string]: HTMLImageElement }>({});
  const playerImgRef = useRef<HTMLImageElement | null>(null);
  const availableQuestsRef = useRef<Quest[]>([]);

  // High-frequency state stored in refs to avoid React re-renders
  const tileMapRef = useRef(new TileMap());
  const playerPosRef = useRef<Position>({
    x: Math.floor(MAP_WIDTH / 2) - 1,
    y: 8,
  });

  // Visual position for smooth interpolation (Lerp)
  const visualPosRef = useRef<Position>({ x: Math.floor(MAP_WIDTH / 2), y: 8 });
  const statsRef = useRef<PlayerStats>({
    fuel: 100,
    maxFuel: 100,
    depth: 0,
    equippedDrillId: 'rusty_drill',
    ownedDrillIds: ['rusty_drill'],
    maxDepthReached: 0,
    artifacts: [],
    hp: 100,
    maxHp: 100,
    attackPower: 10,
    inventory: {
      dirt: 0,
      stone: 0,
      coal: 0,
      iron: 0,
      gold: 0,
      diamond: 0,
      emerald: 0,
      ruby: 0,
      sapphire: 0,
      uranium: 0,
      obsidian: 0,
    },
    activeQuests: [],
    completedQuestIds: [],
  });
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Drill animation state
  const isDrillingRef = useRef(false);

  // React state for UI components only
  const [uiStats, setUiStats] = useState<PlayerStats>(statsRef.current);

  // Last update times for frequency control
  const lastMoveTime = useRef(0);
  const lastUiUpdateTime = useRef(0);

  // NPC 및 모달 상태 (React State + Ref Sync to avoid stale closures)
  const [showInteractionPrompt, _setShowInteractionPrompt] = useState(false);
  const showInteractionPromptRef = useRef(false);
  const setShowInteractionPrompt = (val: boolean) => {
    showInteractionPromptRef.current = val;
    _setShowInteractionPrompt(val);
  };

  const [isShopOpen, _setIsShopOpen] = useState(false);
  const isShopOpenRef = useRef(false);
  const setIsShopOpen = (val: boolean) => {
    isShopOpenRef.current = val;
    _setIsShopOpen(val);
  };

  const [isInventoryOpen, _setIsInventoryOpen] = useState(false);
  const isInventoryOpenRef = useRef(false);
  const setIsInventoryOpen = (val: boolean) => {
    isInventoryOpenRef.current = val;
    _setIsInventoryOpen(val);
  };

  const [isSettingsOpen, _setIsSettingsOpen] = useState(false);
  const isSettingsOpenRef = useRef(false);
  const setIsSettingsOpen = (val: boolean) => {
    isSettingsOpenRef.current = val;
    _setIsSettingsOpen(val);
  };

  const [isCraftingOpen, _setIsCraftingOpen] = useState(false);
  const isCraftingOpenRef = useRef(false);
  const setIsCraftingOpen = (val: boolean) => {
    isCraftingOpenRef.current = val;
    _setIsCraftingOpen(val);
  };

  const [isElevatorOpen, _setIsElevatorOpen] = useState(false);
  const isElevatorOpenRef = useRef(false);
  const setIsElevatorOpen = (val: boolean) => {
    isElevatorOpenRef.current = val;
    _setIsElevatorOpen(val);
  };

  const [isStatusOpen, _setIsStatusOpen] = useState(false);
  const isStatusOpenRef = useRef(false);
  const setIsStatusOpen = (val: boolean) => {
    isStatusOpenRef.current = val;
    _setIsStatusOpen(val);
  };

  const [activeInteractionType, setActiveInteractionType] = useState<
    string | null
  >(null);
  const activeInteractionTypeRef = useRef<string | null>(null);

  // Visual Effects State
  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number; // 1.0 to 0.0
    color: string;
    size: number;
  }
  interface FloatingText {
    x: number;
    y: number;
    text: string;
    color: string;
    startY: number;
    life: number; // 1.0 to 0.0
  }
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const screenShakeRef = useRef(0);

  const saveGame = useCallback(() => {
    const saveData = {
      stats: statsRef.current,
      position: playerPosRef.current,
      tileMap: tileMapRef.current.serialize(), // Save Map
      lastSaved: Date.now(),
    };
    localStorage.setItem('drilling-game-save', JSON.stringify(saveData));
    console.log('Game Saved to LocalStorage');
  }, []);

  const loadGame = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('drilling-game-save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.stats) {
          // Migration: if missing drill info, set default
          const equippedDrillId = data.stats.equippedDrillId || 'rusty_drill';
          const ownedDrillIds = data.stats.ownedDrillIds || ['rusty_drill'];

          // Fix: Merge inventory to ensure new minerals are initialized
          const mergedInventory = {
            ...statsRef.current.inventory,
            ...(data.stats.inventory || {}),
          };

          statsRef.current = {
            ...statsRef.current,
            ...data.stats,
            inventory: mergedInventory,
            equippedDrillId,
            ownedDrillIds,
            maxDepthReached:
              data.stats.maxDepthReached || data.stats.depth || 0,
            artifacts: data.stats.artifacts || [],
            hp: data.stats.hp ?? 100,
            maxHp: data.stats.maxHp ?? 100,
            attackPower: data.stats.attackPower ?? 10,
          };
          setUiStats({ ...statsRef.current });
        }
        if (data.position) {
          playerPosRef.current = data.position;
          visualPosRef.current = { ...data.position };
        }
        if (data.tileMap) {
          tileMapRef.current.deserialize(data.tileMap);
          console.log('TileMap Loaded from LocalStorage');
        }
        console.log('Game Loaded from LocalStorage');
        return true;
      } catch (e) {
        console.error('Failed to parse save data', e);
      }
    }
    return false;
  }, []);

  useEffect(() => {
    setIsClient(true);

    // Function to load base layout
    const loadBaseLayout = () => {
      fetch(`/baseLayout.json?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          baseLayoutRef.current = data.tiles;
        })
        .catch((err) => console.error('Failed to load base layout:', err));
    };

    const loadEntities = () => {
      fetch(`/entities.json?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          console.log('Entities Loaded:', data.entities.length);
          entitiesRef.current = data.entities;

          // Pre-load custom entity images
          data.entities.forEach((entity: Entity) => {
            if (
              entity.imagePath &&
              !entityImagesRef.current[entity.imagePath]
            ) {
              const img = new Image();
              img.src = entity.imagePath;
              img.onload = () => {
                entityImagesRef.current[entity.imagePath!] = img;
              };
            }
          });
        })
        .catch((err) => console.error('Failed to load entities:', err));
    };

    const acceptQuest = (questId: string) => {
      const q = availableQuestsRef.current.find((q) => q.id === questId);
      if (q && !statsRef.current.activeQuests.find((aq) => aq.id === questId)) {
        const newQuest = { ...q, status: 'active' as const };
        statsRef.current.activeQuests.push(newQuest);
        setUiStats({ ...statsRef.current });
        console.log(`Quest Accepted: ${q.title}`);
      }
    };

    const completeQuest = (questId: string) => {
      const qIndex = statsRef.current.activeQuests.findIndex(
        (q) => q.id === questId,
      );
      if (qIndex !== -1) {
        const q = statsRef.current.activeQuests[qIndex];
        if (q.requirement.current >= q.requirement.target) {
          statsRef.current.completedQuestIds.push(questId);
          statsRef.current.activeQuests.splice(qIndex, 1);
          setUiStats({ ...statsRef.current });
          console.log(`Quest Completed: ${q.title}`);
        }
      }
    };

    const loadQuests = () => {
      fetch(`/quests.json?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          availableQuestsRef.current = data.quests;
        })
        .catch((err) => console.error('Failed to load quests:', err));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isAnyModalOpen =
        isShopOpenRef.current ||
        isInventoryOpenRef.current ||
        isSettingsOpenRef.current ||
        isElevatorOpenRef.current;

      if (e.key === 'Escape') {
        if (isAnyModalOpen) {
          setIsShopOpen(false);
          setIsInventoryOpen(false);
          setIsSettingsOpen(false);
          setIsCraftingOpen(false);
        } else {
          setIsSettingsOpen(true);
        }
        return;
      }

      if (e.key.toLowerCase() === 'i') {
        if (!isShopOpenRef.current && !isSettingsOpenRef.current) {
          setIsInventoryOpen(!isInventoryOpenRef.current);
          if (isStatusOpenRef.current) setIsStatusOpen(false);
        }
        return;
      }

      if (e.key.toLowerCase() === 'c') {
        if (!isShopOpenRef.current && !isSettingsOpenRef.current) {
          setIsStatusOpen(!isStatusOpenRef.current);
          if (isInventoryOpenRef.current) setIsInventoryOpen(false);
        }
        return;
      }

      if (e.key.toLowerCase() === 'l') {
        if (
          !isShopOpenRef.current &&
          !isSettingsOpenRef.current &&
          statsRef.current.maxDepthReached >= 100
        ) {
          setIsElevatorOpen(!isElevatorOpenRef.current);
        }
        return;
      }

      if (e.key === ' ' || e.key === 'e' || e.key === 'E') {
        if (showInteractionPromptRef.current && !isAnyModalOpen) {
          if (activeInteractionTypeRef.current === 'shop') {
            setIsShopOpen(true);
          } else if (activeInteractionTypeRef.current === 'crafting') {
            setIsCraftingOpen(true);
          }
          keysRef.current = {}; // 모달 열릴 때 이동 멈춤
          return;
        }
      }

      if (isAnyModalOpen) return;

      keysRef.current[e.key.toLowerCase()] = true;
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)
      ) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    // Safety: Reset keys when window loses focus to prevent stuck movement
    const handleBlur = () => {
      keysRef.current = {};
      isDrillingRef.current = false;
    };

    // Load player image
    const playerImg = new Image();
    playerImg.src = '/Player.png';
    playerImg.onload = () => {
      playerImgRef.current = playerImg;
    };

    // Load tileset
    const img = new Image();
    img.src = '/NewTileset.png'; // Updated tileset
    img.onload = () => {
      console.log('Tileset Loaded:', img.width, img.height);
      tilesetRef.current = img;
      setTilesetLoaded(true);
    };

    // Load Base Tileset
    const baseImg = new Image();
    baseImg.src = '/BaseTileset.png';
    baseImg.onload = () => {
      console.log('Base Tileset Loaded:', baseImg.width, baseImg.height);
      baseTilesetRef.current = baseImg;
      setBaseTilesetLoaded(true);
    };

    // Load JSONs initially
    loadBaseLayout();
    loadEntities();

    // Auto-reload JSONs every 2 seconds
    // Initial Load
    const gameLoaded = loadGame();
    if (!gameLoaded) {
      loadBaseLayout();
      loadEntities();
      loadQuests();
    } else {
      // Even if loaded, refresh some external data
      loadEntities();
      loadQuests();
    }

    const jsonReloadInterval = setInterval(() => {
      // Re-load layout only if not already loaded once or optionally keep it sync
      // loadBaseLayout();
      loadEntities();
      loadQuests();
    }, 5000);

    // Auto-save interval
    const autoSaveInterval = setInterval(() => {
      saveGame();
    }, 10000); // 10 seconds

    // Regeneration interval (5 seconds)
    const regenInterval = setInterval(() => {
      const isAnyModalOpen =
        isShopOpenRef.current ||
        isInventoryOpenRef.current ||
        isSettingsOpenRef.current ||
        isCraftingOpenRef.current;

      // Only regenerate if playing
      if (!isAnyModalOpen && tileMapRef.current && playerPosRef.current) {
        tileMapRef.current.regenerateResources(
          playerPosRef.current.x,
          playerPosRef.current.y,
        );
      }
    }, 5000);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      clearInterval(jsonReloadInterval);
      clearInterval(autoSaveInterval);
      clearInterval(regenInterval);
    };
  }, []);

  const updateLogic = useCallback(
    (now: number) => {
      const now_ms = Date.now(); // Renamed 'now' to 'now_ms' to avoid conflict with function parameter 'now'

      const createParticles = (cx: number, cy: number, color: string) => {
        for (let i = 0; i < 8; i++) {
          particlesRef.current.push({
            x: cx + TILE_SIZE / 2,
            y: cy + TILE_SIZE / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color: color,
            size: Math.random() * 4 + 2,
          });
        }
      };

      const createFloatingText = (
        cx: number,
        cy: number,
        text: string,
        color: string,
      ) => {
        floatingTextsRef.current.push({
          x: cx + TILE_SIZE / 2,
          y: cy,
          text: text,
          color: color,
          startY: cy,
          life: 1.0,
        });
      };

      // Calculate delay based on action (mining vs moving)
      // We don't know the action yet, but we can check if we are ready for a potential action
      // If not drilling, use standard move delay. If drilling, allowed to run faster.
      const timeSinceLastMove = now_ms - lastMoveTime.current;

      const isAnyModalOpen =
        isShopOpenRef.current ||
        isInventoryOpenRef.current ||
        isSettingsOpenRef.current ||
        isCraftingOpenRef.current ||
        isElevatorOpenRef.current ||
        isStatusOpenRef.current;

      if (isAnyModalOpen) return;

      let dx = 0;
      let dy = 0;
      const keys = keysRef.current;

      // Prioritize vertical movement
      if (keys['arrowdown'] || keys['s']) {
        dy = 1;
      } else if (keys['arrowup'] || keys['w']) {
        dy = -1;
      }

      // Only check horizontal if not moving vertically
      if (dy === 0) {
        if (keys['arrowleft'] || keys['a']) dx = -1;
        else if (keys['arrowright'] || keys['d']) dx = 1;
      }

      if (dx !== 0 || dy !== 0) {
        const currentPos = playerPosRef.current;
        const newX = currentPos.x + dx;
        const newY = currentPos.y + dy;

        // Base Camp Decoration Collision Check
        if (newY < BASE_DEPTH && baseLayoutRef.current) {
          const baseTileIdx = baseLayoutRef.current[newY]?.[newX];
          const SOLID_TILES_BASE = [7, 10, 11, 12, 13, 17]; // Rock, Tree, Large Rock, Sign, Fence
          if (SOLID_TILES_BASE.includes(baseTileIdx)) {
            return; // Block movement
          }
        }

        const targetTile = tileMapRef.current.getTile(newX, newY);

        if (targetTile && targetTile.type !== 'wall') {
          const currentDrill =
            DRILLS[statsRef.current.equippedDrillId] || DRILLS['rusty_drill'];
          const isMiningTile = targetTile.type !== 'empty';
          const drillDelay = isMiningTile
            ? currentDrill.cooldownMs
            : MOVEMENT_DELAY_MS;

          // Catch-up protection: If lastMoveTime is too far behind, reset it to prevent a huge burst of hits.
          // We allow at most 1 hit of buffer.
          if (now_ms - lastMoveTime.current > drillDelay * 2) {
            lastMoveTime.current = now_ms - drillDelay;
          }

          let hitsInThisFrame = 0;
          const MAX_HITS_PER_FRAME = 10;

          // Using a while loop to allow multiple mining hits per frame for sub-frame cooldowns
          while (hitsInThisFrame < MAX_HITS_PER_FRAME) {
            const timeSinceLastMove = now_ms - lastMoveTime.current;
            const isMining = targetTile.type !== 'empty';
            const requiredDelay = isMining
              ? currentDrill.cooldownMs
              : MOVEMENT_DELAY_MS;

            if (timeSinceLastMove < requiredDelay) break;
            hitsInThisFrame++;

            if (targetTile.type === 'empty') {
              playerPosRef.current = { x: newX, y: newY };
              const newDepth = Math.max(0, newY - BASE_DEPTH);
              statsRef.current.depth = newDepth;
              if (newDepth > statsRef.current.maxDepthReached) {
                statsRef.current.maxDepthReached = newDepth;
              }
              isDrillingRef.current = false;
              lastMoveTime.current += requiredDelay;
              // Limit to one move per frame even if delay is low to avoid flying
              break;
            } else {
              // Mining
              if (statsRef.current.fuel > 0) {
                isDrillingRef.current = true;
                const targetType = targetTile.type;
                const targetValue = targetTile.value;

                // --- Combat Interaction ---
                if (
                  targetType === 'monster_nest' ||
                  targetType === 'boss_core'
                ) {
                  const damageTaken = targetType === 'boss_core' ? 2 : 0.5;
                  statsRef.current.hp = Math.max(
                    0,
                    statsRef.current.hp - damageTaken,
                  );
                  screenShakeRef.current = 10;

                  if (Math.random() < 0.1) {
                    createFloatingText(
                      playerPosRef.current.x * TILE_SIZE,
                      playerPosRef.current.y * TILE_SIZE - 20,
                      'OUCH!',
                      '#ef4444',
                    );
                  }

                  if (statsRef.current.hp <= 0) {
                    createFloatingText(
                      playerPosRef.current.x * TILE_SIZE,
                      playerPosRef.current.y * TILE_SIZE - 40,
                      'CRITICAL DAMAGE! RETURNING...',
                      '#ef4444',
                    );
                    setTimeout(() => {
                      playerPosRef.current = {
                        x: Math.floor(MAP_WIDTH / 2),
                        y: 8,
                      };
                      visualPosRef.current = { ...playerPosRef.current };
                      statsRef.current.hp = statsRef.current.maxHp;
                      statsRef.current.fuel = statsRef.current.maxFuel;
                      statsRef.current.depth = 0;
                      setUiStats({ ...statsRef.current });
                    }, 1000);
                    isDrillingRef.current = false;
                    return;
                  }
                }

                const targetColor = getTileColor(targetType as string);
                const destroyed = tileMapRef.current.damageTile(
                  newX,
                  newY,
                  currentDrill.basePower,
                );

                if (destroyed) {
                  createParticles(
                    newX * TILE_SIZE,
                    newY * TILE_SIZE,
                    targetColor,
                  );
                  screenShakeRef.current = 5;
                  const stats = statsRef.current;
                  if (targetValue >= 0) {
                    const type = targetType as keyof typeof stats.inventory;
                    if (stats.inventory[type] !== undefined) {
                      stats.inventory[type]++;
                      createFloatingText(
                        newX * TILE_SIZE,
                        newY * TILE_SIZE,
                        `+1 ${type.toUpperCase()}`,
                        '#fbbf24',
                      );
                    }
                  }

                  if (targetType === 'boss_core') {
                    const artifactName = 'Ancient Core';
                    if (!stats.artifacts.includes(artifactName)) {
                      stats.artifacts.push(artifactName);
                      stats.attackPower += 20;
                      stats.maxHp += 50;
                      stats.hp = stats.maxHp;
                      createFloatingText(
                        newX * TILE_SIZE,
                        newY * TILE_SIZE - 40,
                        'ARTIFACT ACQUIRED: ANCIENT CORE!',
                        '#a855f7',
                      );
                      createFloatingText(
                        newX * TILE_SIZE,
                        newY * TILE_SIZE - 20,
                        'ATK +20, MAX HP +50',
                        '#a855f7',
                      );
                    }
                  }

                  // Quest Tracking
                  statsRef.current.activeQuests.forEach((q) => {
                    if (
                      q.status === 'active' &&
                      q.requirement.type === targetType
                    ) {
                      const currentCount =
                        statsRef.current.inventory[
                          targetType as keyof typeof statsRef.current.inventory
                        ] || 0;
                      q.requirement.current = currentCount;

                      if (q.requirement.current >= q.requirement.target) {
                        console.log(
                          `Quest Complete Target Reached: ${q.title}`,
                        );
                        createFloatingText(
                          newX * TILE_SIZE,
                          newY * TILE_SIZE - 20,
                          'QUEST COMPLETE!',
                          '#4ade80',
                        );
                      }
                      setUiStats({ ...statsRef.current });
                    }
                  });

                  stats.fuel = Math.max(
                    0,
                    stats.fuel - currentDrill.fuelConsumption,
                  );
                  const newDepth = Math.max(0, newY - BASE_DEPTH);
                  stats.depth = newDepth;
                  if (newDepth > stats.maxDepthReached) {
                    stats.maxDepthReached = newDepth;
                  }
                  playerPosRef.current = { x: newX, y: newY };
                  isDrillingRef.current = false;
                  lastMoveTime.current += requiredDelay;
                  break; // Stop after destroying a tile to move into it next tick
                } else {
                  // Partial damage hit
                  lastMoveTime.current += requiredDelay;
                  // If cooldown is very small, we continue the while loop to hit again in the same frame
                  // Safety: if requiredDelay is too small, prevent infinite loop
                  if (requiredDelay < 1) {
                    // Maximum 100 hits per frame to be safe
                    // But we don't have a counter. Let's just break if it repeats too much or trust the logic.
                  }
                }
              } else {
                // No Fuel
                createFloatingText(
                  playerPosRef.current.x * TILE_SIZE,
                  playerPosRef.current.y * TILE_SIZE - 40,
                  'NO FUEL! RETURNING...',
                  '#ef4444',
                );
                setTimeout(() => {
                  playerPosRef.current = {
                    x: Math.floor(MAP_WIDTH / 2),
                    y: BASE_DEPTH - 2,
                  };
                  statsRef.current.depth = 0;
                }, 1000);
                isDrillingRef.current = false;
                lastMoveTime.current = now_ms + 1000;
                break;
              }
            }
          }
        } else {
          isDrillingRef.current = false;
        }
      } else {
        isDrillingRef.current = false;
      }

      // Base Logic: Refuel if at surface/base
      if (playerPosRef.current.y < BASE_DEPTH) {
        if (statsRef.current.fuel < statsRef.current.maxFuel) {
          statsRef.current.fuel = Math.min(
            statsRef.current.maxFuel,
            statsRef.current.fuel + 0.5,
          );
        }
      }

      // Sync to UI state at lower frequency (e.g., 10Hz)
      if (now_ms - lastUiUpdateTime.current > 100) {
        setUiStats({ ...statsRef.current });

        // Entity Proximity Check (Interactions)
        const px = playerPosRef.current.x;
        const py = playerPosRef.current.y;
        let foundInteraction = false;

        for (const entity of entitiesRef.current) {
          const entW = entity.width || 1;
          const entH = entity.height || 1;
          // New: Bottom-Center Anchor based center calculation
          const centerX = entity.x;
          const centerY = entity.y - entH / 2;

          const dist = Math.sqrt(
            Math.pow(centerX - px, 2) + Math.pow(centerY - py, 2),
          );

          if (dist < 2.5) {
            foundInteraction = true;
            activeInteractionTypeRef.current = entity.interactionType;
            setActiveInteractionType(entity.interactionType);
            break;
          }
        }

        if (showInteractionPromptRef.current !== foundInteraction) {
          setShowInteractionPrompt(foundInteraction);
        }

        lastUiUpdateTime.current = now_ms;
      }
    },
    [], // Ref를 사용하므로 의존성 불필요
  );

  // NPC Proximity Check가 updateLogic으로 통합되었으므로 기존 useEffect 제거

  // Rendering
  useEffect(() => {
    if (!isClient) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = (now: number) => {
      // Update logic first
      updateLogic(now);

      const isAnyModalOpen =
        isShopOpenRef.current ||
        isInventoryOpenRef.current ||
        isSettingsOpenRef.current ||
        isCraftingOpenRef.current ||
        isStatusOpenRef.current;

      // Using a simple Lerp factor (0.2 per frame at 60fps)
      const targetPos = playerPosRef.current;
      const visualPos = visualPosRef.current;
      const lerpFactor = 0.2;

      visualPos.x += (targetPos.x - visualPos.x) * lerpFactor;
      visualPos.y += (targetPos.y - visualPos.y) * lerpFactor;

      // Screen Shake Logic
      if (screenShakeRef.current > 0) {
        visualPos.x += (Math.random() - 0.5) * 0.1 * screenShakeRef.current;
        visualPos.y += (Math.random() - 0.5) * 0.1 * screenShakeRef.current;
        screenShakeRef.current = Math.max(0, screenShakeRef.current - 0.5);
      }

      // Rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const tileMap = tileMapRef.current;

      const cameraY = Math.round(visualPos.y * TILE_SIZE - canvas.height / 2);
      // Horizontal Camera (Optional, keeping centered for now or based on X)
      // For now, let's keep X centered or fixed. The game seems to be vertical scrolling mostly?
      // existing code uses `translate(0, -cameraY)`.

      const cameraX = Math.max(0, visualPos.x * TILE_SIZE - canvas.width / 2); // Simple horizontal follow if map is wide
      // But MAP_WIDTH is 30 -> 1200px. Canvas width?
      // Existing code doesn't translate X. Let's stick to Y for now unless we want X scroll.
      // The current canvas width is MAP_WIDTH * TILE_SIZE (1200).
      // So no X translation needed if canvas covers full width.

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(0, -cameraY);

      const startY = Math.max(0, Math.floor(cameraY / TILE_SIZE) - 5);
      const endY = startY + Math.ceil(canvas.height / TILE_SIZE) + 10;

      // --- Draw Global Backgrounds to fill any potential gaps ---
      // Sky background
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, Math.max(0, BASE_DEPTH * TILE_SIZE));

      // Underground background (dirt color)
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(
        0,
        BASE_DEPTH * TILE_SIZE,
        canvas.width,
        (endY - BASE_DEPTH) * TILE_SIZE,
      );

      // --- Draw Base Area (Background & Structures) ---
      if (baseTilesetRef.current) {
        for (let y = 0; y < BASE_DEPTH; y++) {
          for (let x = 0; x < MAP_WIDTH; x++) {
            // Basic Frustum Culling (Vertical)
            if (y * TILE_SIZE - cameraY > canvas.height) continue;

            // Get tile index from JSON layout
            let tileIdx = -1;
            if (
              baseLayoutRef.current &&
              baseLayoutRef.current[y] &&
              baseLayoutRef.current[y][x] !== undefined
            ) {
              tileIdx = baseLayoutRef.current[y][x];
            }

            const drawX = x * TILE_SIZE;
            const drawY = y * TILE_SIZE; // Removed -cameraY because translate(0, -cameraY) is active

            // Background - sky blue for field
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

            if (tileIdx >= 0) {
              const cols = 5;
              const TILE_SOURCE_SIZE = 128;
              const sx = (tileIdx % cols) * TILE_SOURCE_SIZE;
              const sy = Math.floor(tileIdx / cols) * TILE_SOURCE_SIZE;

              let crownOffsetX = 0;
              if (tileIdx === 11) crownOffsetX = 12; // Patch for asymmetric atlas top

              ctx.drawImage(
                baseTilesetRef.current,
                sx,
                sy,
                TILE_SOURCE_SIZE,
                TILE_SOURCE_SIZE,
                drawX + crownOffsetX,
                drawY,
                TILE_SIZE + 1, // Add +1 to overlap
                TILE_SIZE + 1, // Add +1 to overlap
              );
            }
          }
        }
        ctx.fillText(
          '🌿 BASE CAMP - AUTO REFUEL',
          20,
          BASE_DEPTH * TILE_SIZE - 20, // Positioned at row 9.5
        );
      }

      // --- Draw Entities (NPCs, Objects) ---
      if (baseTilesetRef.current) {
        for (const entity of entitiesRef.current) {
          const entW = (entity.width || 1) * TILE_SIZE;
          const entH = (entity.height || 1) * TILE_SIZE;

          // New: Bottom-Center Anchor rendering logic
          const drawX = (entity.x - (entity.width || 1) / 2) * TILE_SIZE;
          const drawY = (entity.y - (entity.height || 1)) * TILE_SIZE;

          if (entity.imagePath && entityImagesRef.current[entity.imagePath]) {
            // Draw custom image
            const img = entityImagesRef.current[entity.imagePath];
            ctx.drawImage(
              img,
              0,
              0,
              img.width,
              img.height,
              drawX,
              drawY,
              entW,
              entH,
            );
          } else if (
            entity.spriteIndex !== undefined &&
            baseTilesetRef.current
          ) {
            // Draw from tileset
            const cols = 5;
            const TILE_SOURCE_SIZE = 128;
            const sx = (entity.spriteIndex % cols) * TILE_SOURCE_SIZE;
            const sy = Math.floor(entity.spriteIndex / cols) * TILE_SOURCE_SIZE;

            ctx.drawImage(
              baseTilesetRef.current,
              sx,
              sy,
              TILE_SOURCE_SIZE,
              TILE_SOURCE_SIZE,
              drawX,
              drawY,
              entW,
              entH,
            );
          }
        }
      } else if (startY < BASE_DEPTH) {
        // Fallback
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, BASE_DEPTH * TILE_SIZE - cameraY);

        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(
          '🏠 BASE AREA - AUTO REFUEL',
          20,
          BASE_DEPTH * TILE_SIZE - 20, // Removed -cameraY
        );
      }

      for (let y = startY; y < endY; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
          const tile = tileMap.grid[y]?.[x];
          if (!tile || tile.type === 'empty') continue;

          // Check ref directly to avoid closure staleness
          if (tilesetRef.current) {
            // Tile Variation Logic based on position seed
            // We'll use a simple pseudo-random hash
            const seed = (x * 1234 + y * 5678) % 1000;
            let tileIdx = getTileIndex(tile.type);

            // Add Variations for Dirt and Stone
            if (tile.type === 'dirt') {
              // 3 dirt variations at index 0, 1, 2
              tileIdx = Math.floor(seed % 3);
            } else if (tile.type === 'stone') {
              // 2 stone variations at index 3, 4
              tileIdx = 3 + Math.floor(seed % 2);
            }
            // Ores are single tiles for now: Coal(5), Iron(6), Gold(7), Diamond(8), Bedrock(9)

            const cols = 5; // NewTileset layout
            // Confirmed size from console log: 640x640
            const TOTAL_WIDTH = 640;
            const TILE_SOURCE_SIZE = TOTAL_WIDTH / cols; // 128

            // Rows:
            // 0: Dirt variants (0,1,2), Stone variants (3,4)
            // 1: Coal(5), Iron(6), Gold(7), Diamond(8), Bedrock(9)

            const sx = (tileIdx % cols) * TILE_SOURCE_SIZE;
            const sy = Math.floor(tileIdx / cols) * TILE_SOURCE_SIZE;

            if (tileIdx >= 0) {
              ctx.drawImage(
                tilesetRef.current,
                sx,
                sy,
                TILE_SOURCE_SIZE,
                TILE_SOURCE_SIZE,
                x * TILE_SIZE,
                y * TILE_SIZE,
                TILE_SIZE + 1, // Add +1 to overlap
                TILE_SIZE + 1, // Add +1 to overlap
              );
            } else {
              // Fallback (redundant if all mapped, but safe)
              ctx.fillStyle = getTileColor(tile.type);
              ctx.fillRect(
                x * TILE_SIZE,
                y * TILE_SIZE,
                TILE_SIZE + 1,
                TILE_SIZE + 1,
              );
            }
          } else {
            ctx.fillStyle = getTileColor(tile.type);
            ctx.fillRect(
              x * TILE_SIZE,
              y * TILE_SIZE,
              TILE_SIZE + 1,
              TILE_SIZE + 1,
            ); // Add +1 to overlap
          }

          if (tile.health < tile.maxHealth && tile.health > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            const damagePercent = 1 - tile.health / tile.maxHealth;
            ctx.fillRect(
              x * TILE_SIZE,
              y * TILE_SIZE,
              TILE_SIZE - 1,
              (TILE_SIZE - 1) * damagePercent,
            );
          }
        }
      }

      // --- Draw Player ---
      let px = Math.round(visualPos.x * TILE_SIZE);
      let py = Math.round(visualPos.y * TILE_SIZE);

      // Vibration and Glow effect while drilling
      if (isDrillingRef.current) {
        px += (Math.random() - 0.5) * 4;
        py += (Math.random() - 0.5) * 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff3d00';
      } else {
        ctx.shadowBlur = 0;
      }

      if (playerImgRef.current) {
        // Pixel Art Character
        ctx.drawImage(playerImgRef.current, px, py, TILE_SIZE, TILE_SIZE);
      } else {
        // Fallback red rectangle
        ctx.fillStyle = '#ff3d00';
        ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      }
      ctx.shadowBlur = 0;

      // Lighting and Vignette Effect
      // Create a radial gradient at player position
      const gradient = ctx.createRadialGradient(
        px + TILE_SIZE / 2,
        py + TILE_SIZE / 2,
        50, // Inner radius (bright)
        px + TILE_SIZE / 2,
        py + TILE_SIZE / 2,
        400, // Outer radius (dark)
      );

      // Determine ambient darkness based on depth
      const depth = Math.max(0, visualPos.y - BASE_DEPTH);
      const darkness = Math.min(0.95, 0.3 + depth * 0.005); // Gets darker as you go deeper, cap at 0.95

      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Transparent at center
      gradient.addColorStop(0.3, `rgba(0, 0, 0, ${darkness * 0.5})`);
      gradient.addColorStop(1, `rgba(0, 0, 0, ${darkness})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, cameraY, canvas.width, canvas.height); // Cover visible area relative to camera

      // --- Draw Particles ---
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life -= 0.05;
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // Gravity

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1.0;
      }

      // --- Draw Floating Texts ---
      ctx.textAlign = 'center';
      ctx.font = 'bold 20px monospace';
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.life -= 0.015; // Slow fade
        if (ft.life <= 0) {
          floatingTextsRef.current.splice(i, 1);
          continue;
        }
        ft.y -= 1.0; // Float up

        ctx.globalAlpha = ft.life;
        // Stroke
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black';
        ctx.strokeText(ft.text, ft.x, ft.y);
        // Fill
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;
      }
      ctx.textAlign = 'left'; // Reset alignment

      // --- In-Game HUD ---
      ctx.save();
      ctx.resetTransform(); // HUD is fixed to screen

      const hudX = 20;
      const hudY = 20;

      // Fuel Bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, 200, 24, 12);
      ctx.fill();

      const currentFuel = statsRef.current.fuel;
      const maxFuel = statsRef.current.maxFuel;
      const fuelW = (currentFuel / maxFuel) * 196;
      const fuelColor = currentFuel < 20 ? '#ef4444' : '#f97316';
      ctx.fillStyle = fuelColor;
      ctx.beginPath();
      ctx.roundRect(hudX + 2, hudY + 2, Math.max(0, fuelW), 20, 10);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`FUEL: ${Math.floor(currentFuel)}%`, hudX + 10, hudY + 16);

      // HP Bar

      const currentHp = statsRef.current.hp;
      const maxHp = statsRef.current.maxHp;
      const hpW = (currentHp / maxHp) * 196;

      // Attack Power & Artifacts

      ctx.fillStyle = '#a855f7'; // Purple-500
      ctx.font = 'bold 12px monospace';
      const atk = statsRef.current.attackPower;
      const artifactCount = statsRef.current.artifacts.length;

      // Cargo (Formerly Money)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.roundRect(hudX, hudY + 35, 120, 30, 8);
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        `DEPTH: ${Math.max(0, Math.floor(playerPosRef.current.y - BASE_DEPTH))}m`,
        hudX + 10,
        hudY + 56,
      );

      // Interaction Prompt
      if (
        showInteractionPrompt &&
        !isShopOpen &&
        !isInventoryOpen &&
        !isSettingsOpen
      ) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'black';
        ctx.fillText(
          'PRESS [SPACE] TO TALK TO MERCHANT',
          canvas.width / 2,
          canvas.height - 40,
        );
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
      }
      ctx.restore();

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isClient, updateLogic]);

  const handleUpgrade = (type: string, requirements: any) => {
    const stats = statsRef.current;

    // Check requirements (money and minerals)
    if (stats.inventory.dirt < (requirements.dirt || 0)) return;
    if (stats.inventory.stone < (requirements.stone || 0)) return;
    if (stats.inventory.coal < (requirements.coal || 0)) return;
    if (stats.inventory.iron < (requirements.iron || 0)) return;
    if (stats.inventory.gold < (requirements.gold || 0)) return;
    if (stats.inventory.diamond < (requirements.diamond || 0)) return;

    // Deduct requirements
    if (requirements.dirt) stats.inventory.dirt -= requirements.dirt;
    if (requirements.stone) stats.inventory.stone -= requirements.stone;
    if (requirements.coal) stats.inventory.coal -= requirements.coal;
    if (requirements.iron) stats.inventory.iron -= requirements.iron;
    if (requirements.gold) stats.inventory.gold -= requirements.gold;
    if (requirements.diamond) stats.inventory.diamond -= requirements.diamond;

    // Apply upgrade effect
    if (type === 'maxFuel') {
      stats.maxFuel += 50;
      stats.fuel = stats.maxFuel;
    } else if (type === 'drillPower') {
      // stats.drillPower += 5; // Deprecated
      console.warn('Drill Power upgrade is deprecated');
    }

    setUiStats({ ...stats });
    console.log(`System Upgraded: ${type}`);
  };

  const handleCraft = (requirements: any, result: any) => {
    const stats = statsRef.current;

    // Check requirements
    if (stats.inventory.stone < (requirements.stone || 0)) return;
    if (stats.inventory.coal < (requirements.coal || 0)) return;
    if (stats.inventory.iron < (requirements.iron || 0)) return;
    if (stats.inventory.gold < (requirements.gold || 0)) return;
    if (stats.inventory.diamond < (requirements.diamond || 0)) return;

    // Deduct requirements
    if (requirements.stone) stats.inventory.stone -= requirements.stone;
    if (requirements.coal) stats.inventory.coal -= requirements.coal;
    if (requirements.iron) stats.inventory.iron -= requirements.iron;
    if (requirements.gold) stats.inventory.gold -= requirements.gold;
    if (requirements.diamond) stats.inventory.diamond -= requirements.diamond;

    // Apply result
    if (result.drillId) {
      if (!stats.ownedDrillIds.includes(result.drillId)) {
        stats.ownedDrillIds.push(result.drillId);
        // Auto-equip if better? No, let user equip.
      }
    }

    setUiStats({ ...stats });
    console.log(`Equipped Crafted Gear: ${result.drillName}`);
  };

  const handleEquip = (drillId: string) => {
    const stats = statsRef.current;
    if (stats.ownedDrillIds.includes(drillId)) {
      stats.equippedDrillId = drillId;
      setUiStats({ ...stats });
      console.log(`Equipped Drill: ${drillId}`);
    }
  };

  if (!isClient)
    return (
      <div className="text-white text-2xl font-mono p-20">LOADING DRILL...</div>
    );

  return (
    <div className="flex flex-col items-center justify-center bg-gray-950">
      <div className="relative group">
        <canvas
          ref={canvasRef}
          width={MAP_WIDTH * TILE_SIZE}
          height={800}
          className="border-8 border-gray-900 rounded-3xl bg-black shadow-2xl cursor-none"
        />

        {/* Shop Modal Overlay */}
        {isShopOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-backdrop rounded-2xl">
            <div className="bg-gray-950 w-full max-w-5xl rounded-3xl border border-white/10 relative flex flex-col max-h-[90%] animate-modal overflow-hidden">
              <button
                onClick={() => setIsShopOpen(false)}
                className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-gray-400 hover:text-white hover:bg-black/60 transition-all border border-white/5 active:scale-90"
              >
                ✕
              </button>

              <div className="p-8 overflow-y-auto mt-2">
                <Shop
                  stats={uiStats}
                  onUpgrade={handleUpgrade}
                  onCraft={handleCraft}
                  availableQuests={availableQuestsRef.current}
                  onAcceptQuest={(id) => {
                    const q = availableQuestsRef.current.find(
                      (qa) => qa.id === id,
                    );
                    if (
                      q &&
                      !statsRef.current.activeQuests.find((aq) => aq.id === id)
                    ) {
                      const newQuest = { ...q, status: 'active' as const };
                      statsRef.current.activeQuests.push(newQuest);
                      setUiStats({ ...statsRef.current });
                    }
                  }}
                  onCompleteQuest={(id) => {
                    const qIndex = statsRef.current.activeQuests.findIndex(
                      (aq) => aq.id === id,
                    );
                    if (qIndex !== -1) {
                      const q = statsRef.current.activeQuests[qIndex];
                      if (q.requirement.current >= q.requirement.target) {
                        if (q.reward.fuel)
                          statsRef.current.fuel = Math.min(
                            statsRef.current.maxFuel,
                            statsRef.current.fuel + q.reward.fuel,
                          );
                        statsRef.current.completedQuestIds.push(id);
                        statsRef.current.activeQuests.splice(qIndex, 1);
                        setUiStats({ ...statsRef.current });
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Status Window Modal Overlay */}
        {isStatusOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-backdrop rounded-2xl">
            <div className="bg-gray-950/90 backdrop-blur-3xl w-full max-w-4xl rounded-[40px] border border-white/10 relative flex flex-col h-[85%] animate-modal overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.15)]">
              {/* Close Button */}
              <button
                onClick={() => setIsStatusOpen(false)}
                className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all z-20 active:scale-95 group"
              >
                <span className="text-xl group-hover:rotate-90 transition-transform duration-300">
                  ✕
                </span>
              </button>

              <div className="p-12 h-full overflow-y-auto custom-scrollbar relative">
                <StatusWindow
                  stats={uiStats}
                  onClose={() => setIsStatusOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Inventory Modal Overlay */}

        {isInventoryOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-backdrop rounded-2xl">
            <div className="bg-gray-950 w-full max-w-6xl rounded-3xl border border-white/10 relative flex flex-col max-h-[85%] animate-modal overflow-hidden">
              <div className="p-8 bg-white/5 border-b border-white/10 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-black text-blue-500 uppercase tracking-[0.3em] mb-1">
                    Resource Hub
                  </span>
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    🎒 INVENTORY
                  </h2>
                </div>
                <button
                  onClick={() => setIsInventoryOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-gray-400 hover:text-white hover:bg-black/60 transition-all border border-white/5 active:scale-90"
                >
                  ✕
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                <Inventory
                  stats={uiStats}
                  onClose={() => setIsInventoryOpen(false)}
                  onEquip={handleEquip}
                />
              </div>
            </div>
          </div>
        )}

        {/* Crafting Modal Overlay */}
        {isCraftingOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-12 animate-backdrop rounded-2xl overflow-hidden">
            <div className="bg-gray-950 w-full max-w-7xl rounded-[3rem] border border-white/10 relative flex flex-col h-[90vh] max-h-[850px] animate-modal overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.1)]">
              <div className="p-8 md:p-10 bg-white/5 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-black text-blue-500 uppercase tracking-[0.4em] mb-2">
                    Assembly Core
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tighter flex items-center gap-3 italic">
                    <span className="not-italic text-3xl">⚙️</span> CRAFTING
                  </h2>
                </div>
                <button
                  onClick={() => setIsCraftingOpen(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 text-gray-400 hover:text-white hover:bg-black/60 transition-all border border-white/10 active:scale-90"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 md:p-10 overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="flex-1 min-h-0">
                  <Crafting stats={uiStats} onCraft={handleCraft} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal Overlay */}
        {isSettingsOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-backdrop rounded-2xl">
            <div className="bg-gray-950 w-full max-w-6xl rounded-3xl border border-white/10 relative flex flex-col max-h-[90%] animate-modal overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.1)]">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-gray-400 hover:text-white hover:bg-black/60 transition-all border border-white/5 active:scale-90"
              >
                ✕
              </button>
              <div className="p-10 overflow-y-auto mt-4 scrollbar-hide">
                <Settings
                  onReset={() => {
                    localStorage.removeItem('drilling-game-save');
                    window.location.reload();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Elevator Modal Overlay */}
        {isElevatorOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-backdrop rounded-2xl">
            <div className="bg-gray-950 w-full max-w-md rounded-3xl border border-white/10 relative flex flex-col max-h-[80%] animate-modal overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
                  <span>🛗</span> ELEVATOR
                </h2>
                <button
                  onClick={() => setIsElevatorOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-gray-400 hover:text-white hover:bg-black/60 transition-all active:scale-90"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar">
                <button
                  onClick={() => {
                    playerPosRef.current = {
                      x: Math.floor(MAP_WIDTH / 2) - 1,
                      y: 8,
                    };
                    visualPosRef.current = { ...playerPosRef.current };
                    statsRef.current.depth = 0;
                    setIsElevatorOpen(false);
                  }}
                  className="w-full p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 transition-all font-bold flex justify-between items-center group"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-blue-500 text-[10px] uppercase tracking-widest mb-1 group-hover:text-blue-400">
                      Surface
                    </span>
                    <span className="text-lg">BASE CAMP</span>
                  </div>
                  <span className="bg-blue-500/20 px-3 py-1 rounded-full text-sm">
                    0m
                  </span>
                </button>

                {Array.from(
                  { length: Math.floor(uiStats.maxDepthReached / 100) },
                  (_, i) => (i + 1) * 100,
                ).map((depth) => (
                  <button
                    key={depth}
                    onClick={() => {
                      playerPosRef.current = {
                        x: Math.floor(MAP_WIDTH / 2) - 1,
                        y: depth + BASE_DEPTH,
                      };
                      visualPosRef.current = { ...playerPosRef.current };
                      statsRef.current.depth = depth;
                      setIsElevatorOpen(false);
                    }}
                    className="w-full p-4 rounded-xl bg-gray-900 border border-white/5 text-gray-300 hover:bg-gray-800 hover:border-white/10 transition-all font-bold flex justify-between items-center group"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 group-hover:text-gray-400 italic">
                        Checkpoint
                      </span>
                      <span className="text-lg">OUTPOST</span>
                    </div>
                    <span className="bg-white/5 px-3 py-1 rounded-full text-sm text-gray-400">
                      {depth}m
                    </span>
                  </button>
                ))}
              </div>
              <div className="p-4 bg-black/40 text-center border-t border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium">
                  Select target depth
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-4 right-6 bg-black/60 px-3 py-1 rounded-full text-[10px] text-gray-400 font-mono tracking-tighter border border-white/5 shadow-lg">
          STABLE 60 FPS
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700 text-gray-300">
      {children}
    </span>
  );
}

function getTileIndex(type: string): number {
  switch (type) {
    case 'dirt':
      return 0; // Variations 0, 1, 2 handled in render loop
    case 'stone':
      return 3; // Variations 3, 4 handled in render loop
    case 'coal':
      return 5;
    case 'iron':
      return 6;
    case 'gold':
      return 7;
    case 'diamond':
      return 8;
    case 'wall':
      return 9;
    case 'emerald':
      return 20;
    case 'ruby':
      return 21;
    case 'sapphire':
      return 22;
    case 'uranium':
      return 23;
    case 'obsidian':
      return 24;
    case 'lava':
      return 25;
    case 'dungeon_bricks':
      return 30;
    case 'monster_nest':
      return 31;
    case 'boss_core':
      return 32;
    default:
      return 0;
  }
}

function getTileColor(type: string): string {
  switch (type) {
    case 'dirt':
      return '#4e342e';
    case 'stone':
      return '#455a64';
    case 'coal':
      return '#212121';
    case 'iron':
      return '#78909c';
    case 'gold':
      return '#fbc02d';
    case 'diamond':
      return '#00bcd4';
    case 'emerald':
      return '#10b981';
    case 'ruby':
      return '#ef4444';
    case 'sapphire':
      return '#3b82f6';
    case 'uranium':
      return '#84cc16';
    case 'obsidian':
      return '#581c87';
    case 'lava':
      return '#f97316';
    case 'dungeon_bricks':
      return '#374151';
    case 'monster_nest':
      return '#b91c1c';
    case 'boss_core':
      return '#7c3aed';
    case 'wall':
      return '#1a1a1b';
    default:
      return '#000000';
  }
}
