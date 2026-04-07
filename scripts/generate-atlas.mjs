import fs from 'fs/promises';
import path from 'path';
import texturePacker from 'free-tex-packer-core';
import { glob } from 'glob';
import sharp from 'sharp';

/**
 * 아틀라스(Atlas) 생성에 포함할 에셋들의 경로 목록입니다.
 * 각 카테고리별 PNG 파일들을 재귀적으로 찾아 포함합니다.
 */
const ASSET_SOURCES = [
  'src/shared/assets/tiles/**/*.png',
  'src/shared/assets/drills/**/*.png',
  'src/shared/assets/minerals/**/*.png',
  'src/shared/assets/rune/**/*.png',
  'src/shared/assets/world/**/*.png'
];

/** 결과물이 저장될 디렉토리 및 파일명의 기본 베이스입니다. */
const OUTPUT_DIR = 'public/assets';
const ATLAS_NAME = 'game-atlas';

/**
 * 게임 에셋들을 하나의 아틀라스 이미지와 JSON 설정 파일로 묶어주는 메인 함수입니다.
 * PixiJS와 같은 게임 엔진에서 효율적으로 텍스처를 로드할 수 있도록 도와줍니다.
 */
async function generateAtlas() {
  console.log('🚀 아틀라스 생성을 시작합니다...');
  
  // 1. 안전 확인 및 카운트다운
  // 기존 파일을 덮어쓰기 때문에 사용자가 작업을 취소할 수 있도록 유도합니다.
  console.log('⚠️ [경고] public/assets 폴더의 기존 파일들이 덮어씌워집니다!');
  console.log('중요한 변경 사항이 있다면 Ctrl+C로 지금 취소하세요.');
  for (let i = 3; i > 0; i--) {
    process.stdout.write(`${i}... `);
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\n🏗️ 에셋 패킹 중...');

  try {
    // 2. 패킹할 파일들의 목록을 수집합니다.
    let filesToPack = [];
    for (const pattern of ASSET_SOURCES) {
      const paths = await glob(pattern);
      for (const p of paths) {
        const content = await fs.readFile(p);
        /**
         * 파일의 전체 경로 대신 파일명(basename)만 키값으로 사용합니다.
         * 이렇게 하면 게임 코드 내에서 'Player.png'와 같이 파일명만으로 접근이 가능해집니다.
         */
        const name = path.basename(p); 
        filesToPack.push({ path: name, contents: content });
      }
    }

    if (filesToPack.length === 0) {
      console.error('❌ 패킹할 에셋 파일을 찾지 못했습니다!');
      return;
    }

    // 3. 텍스처 패커 옵션 설정
    const options = {
      textureName: ATLAS_NAME,
      exporter: 'Pixi',      // PixiJS 엔진에서 바로 사용할 수 있는 포맷으로 내보냅니다.
      width: 2048,          // 생성될 최대 이미지 가로 크기
      height: 2048,         // 생성될 최대 이미지 세로 크기
      fixedSize: false,     // 에셋 양에 맞춰 이미지 크기를 유동적으로 조절합니다.
      padding: 2,           // 스프라이트 간의 간격 (이미지 뭉침 방지)
      extrude: 1,           // 텍스처 블리딩(픽셀 경계선 노이즈) 방지 옵션
      allowRotation: false, // 스프라이트 회전을 금지합니다 (간결한 렌더링 유지).
      allowTrim: true,      // 이미지 주변의 투명한 여백을 제거하여 용량을 줄입니다.
      detectIdentical: true,// 중복되는 이미지는 하나로 통합하여 용량을 효율화합니다.
      packer: 'OptimalPacker'// 최적의 배치를 찾는 알고리즘을 사용합니다.
    };

    // 4. 실제로 패킹 작업을 실행합니다.
    texturePacker(filesToPack, options, async (packedFiles, error) => {
      if (error) {
        console.error('❌ 패킹 작업 실패:', error);
        return;
      }

      // 결과 디렉토리가 없다면 생성합니다.
      await fs.mkdir(OUTPUT_DIR, { recursive: true });

      let totalSize = 0;
      const webpFiles = [];

      for (const file of packedFiles) {
        let finalBuffer = file.buffer;
        let finalName = file.name;

        // PNG 파일을 용량 효율이 좋은 WebP 포맷으로 변환합니다. (JSON 정보는 유지)
        if (file.name.endsWith('.png')) {
          finalName = file.name.replace('.png', '.webp');
          finalBuffer = await sharp(file.buffer)
            .webp({ quality: 90, effort: 6, lossless: false })
            .toBuffer();
        }

        const outputPath = path.join(OUTPUT_DIR, finalName);
        await fs.writeFile(outputPath, finalBuffer);
        totalSize += finalBuffer.length;
        console.log(`✅ 저장됨: ${finalName} (${(finalBuffer.length / 1024).toFixed(1)} KB)`);
        
        // 생성된 JSON 파일 목록을 수집하여 매니페스트를 만듭니다.
        if (finalName.endsWith('.json')) webpFiles.push(finalName);
      }

      /**
       * 모든 아틀라스 JSON 파일 목록을 manifest.json에 저장합니다.
       * 게임 클라이언트가 이 파일을 먼저 읽어 모든 아틀라스를 한 번에 로드할 수 있게 함입니다.
       */
      const manifest = {
        atlasFiles: webpFiles
      };
      await fs.writeFile(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
      console.log('✅ 저장됨: manifest.json');

      console.log('---');
      console.log(`🎉 아틀라스 생성이 완료되었습니다!`);
      console.log(`${filesToPack.length}개의 스프라이트를 ${packedFiles.length}개의 파일로 묶었습니다.`);
      console.log(`전체 아틀라스 용량: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    });

  } catch (err) {
    console.error('❌ 아틀라스 생성 중 오류 발생:', err);
  }
}

// 스크립트 실행
generateAtlas();
