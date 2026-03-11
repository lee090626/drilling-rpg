import { Entity, Quest } from '../types/game';

export async function fetchBaseLayout(): Promise<number[][] | null> {
  try {
    const res = await fetch(`/baseLayout.json?t=${Date.now()}`);
    const data = await res.json();
    return data.tiles;
  } catch (err) {
    console.error('Failed to load base layout:', err);
    return null;
  }
}

export async function fetchEntities(): Promise<Entity[]> {
  try {
    const res = await fetch(`/entities.json?t=${Date.now()}`);
    const data = await res.json();
    return data.entities || [];
  } catch (err) {
    console.error('Failed to load entities:', err);
    return [];
  }
}

export async function fetchQuests(): Promise<Quest[]> {
  try {
    const res = await fetch(`/quests.json?t=${Date.now()}`);
    const data = await res.json();
    return data.quests || [];
  } catch (err) {
    console.error('Failed to load quests:', err);
    return [];
  }
}
