import * as PIXI from 'pixi.js';
import { GameEngineInstance } from './GameEngineInstance';
import { WorkerMessageRouter } from './WorkerMessageRouter';

// PixiJS v8 Web Worker adapter setup
PIXI.DOMAdapter.set(PIXI.WebWorkerAdapter);

// 인스턴스 생성 및 라우터 주입
const engine = new GameEngineInstance();
const router = new WorkerMessageRouter(engine);

self.addEventListener('message', (e: MessageEvent) => {
  router.handleMessage(e);
});
