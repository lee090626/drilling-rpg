import * as PIXI from 'pixi.js';

/**
 * [PixiJS v8] 고성능 GPU 기반 조명 필터
 * - 여러 광원 데이터를 한 번에 처리하여 부드러운 화폭 조명 구현
 */
const fragmentShader = `
    precision highp float;
    
    // PixiJS v8 기본 유니폼 및 샘플러
    varying vec2 vTextureCoord;
    uniform sampler2D uTexture;
    uniform vec4 uInputSize;

    // 조명 관련 유니폼
    uniform float uDarkness;
    uniform float uZoom;
    uniform vec2 uCameraPos;
    uniform vec2 uResolution;
    uniform vec4 uLights[16]; // [worldX, worldY, radius, intensity]
    uniform int uLightCount;

    void main() {
        // 현재 픽셀의 컬러 샘플링
        vec4 color = texture2D(uTexture, vTextureCoord);
        
        // 텍스처 좌표를 화면 픽셀 좌표로 변환
        vec2 screenCoord = vTextureCoord * uInputSize.xy;
        
        // 화면 중심으로부터의 거리와 줌을 이용해 월드 좌표 역계산
        vec2 worldCoord = (screenCoord - uResolution * 0.5) / uZoom + uCameraPos;
        
        float totalVisibility = 0.0;
        
        // 모든 광원에 대해 밝기 계산 (CPU 루프 대신 GPU 병렬 처리)
        for (int i = 0; i < 16; i++) {
            if (i >= uLightCount) break;
            
            vec4 light = uLights[i];
            float dist = distance(worldCoord, light.xy);
            
            // smoothstep을 이용한 부드러운 빛의 감쇄 효과
            float atten = 1.0 - smoothstep(0.0, light.z, dist);
            totalVisibility += atten * light.w;
        }

        // 최소 조명(어둠)과 최대 조명 사이를 보간
        float minLight = 1.0 - uDarkness;
        float finalLight = mix(minLight, 1.0, clamp(totalVisibility, 0.0, 1.0));
        
        gl_FragColor = vec4(color.rgb * finalLight, color.a);
    }
`;

export class LightingFilter extends PIXI.Filter {
    constructor() {
        super({
            glProgram: PIXI.GlProgram.from({
                vertex: PIXI.defaultFilterVert,
                fragment: fragmentShader,
            }),
            resources: {
                uLightingUniforms: {
                    uDarkness: { value: 0.8, type: 'f32' },
                    uZoom: { value: 1.0, type: 'f32' },
                    uCameraPos: { value: new Float32Array([0, 0]), type: 'vec2<f32>' },
                    uResolution: { value: new Float32Array([800, 600]), type: 'vec2<f32>' },
                    uLights: { value: new Float32Array(16 * 4), type: 'vec4<f32>', size: 16 },
                    uLightCount: { value: 0, type: 'i32' },
                }
            }
        });
    }

    /** 유니폼 업데이트 메서드 */
    updateUniforms(
        darkness: number, 
        zoom: number, 
        cameraX: number, 
        cameraY: number, 
        screenWidth: number, 
        screenHeight: number,
        lights: number[]
    ) {
        // [PixiJS v8] UniformGroup의 실제 유니폼 데이터는 .uniforms 내부에 존재함
        const u = (this.resources.uLightingUniforms as any).uniforms;
        if (!u) return;

        u.uDarkness = darkness;
        u.uZoom = zoom;
        
        // 데이터가 없는 초기 상태 방지
        if (u.uCameraPos) {
            u.uCameraPos[0] = cameraX;
            u.uCameraPos[1] = cameraY;
        }
        
        if (u.uResolution) {
            u.uResolution[0] = screenWidth;
            u.uResolution[1] = screenHeight;
        }
        
        u.uLightCount = Math.min(16, Math.floor(lights.length / 4));
        
        // 쉐이더 배열 데이터 복사
        if (u.uLights) {
            for (let i = 0; i < lights.length && i < u.uLights.length; i++) {
                u.uLights[i] = lights[i];
            }
        }
    }
}
