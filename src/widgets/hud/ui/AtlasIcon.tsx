import { atlasMap, AtlasIconName } from '@/shared/config/atlasMap';

interface Props {
  name: AtlasIconName;
  alt?: string;
  size?: number; // pixel size
  className?: string;
}

/**
 * 게임의 여러 WebP 아틀라스 시트에서 특정 이미지를 추출하여 렌더링하는 범용 아이콘 컴포넌트입니다.
 */
export const AtlasIcon: React.FC<Props> = ({ name, alt = '', size = 32, className = '' }) => {
  const meta = atlasMap[name];
  if (!meta) return <div style={{ width: size, height: size, backgroundColor: '#333' }} />;

  const { atlasIndex, x, y, width, height, atlasWidth, atlasHeight } = meta;
  
  // 컨테이너 크기(size)에 맞게 아틀라스를 축소/확대하는 비율 계산
  const scale = size / Math.max(width, height);
  
  // 배경 크기 계산 (스케일 반영)
  const bgSizeW = atlasWidth * scale;
  const bgSizeH = atlasHeight * scale;
  
  // 부모 컨테이너: 외부 블리딩을 막기 위한 overflow: hidden
  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    overflow: 'hidden',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // 실제 스프라이트: 딱 맞는 크기로 설정하여 인접 이미지 노출 차단
  const spriteStyle: React.CSSProperties = {
    width: width * scale,
    height: height * scale,
    backgroundImage: `url(/assets/game-atlas-${atlasIndex}.webp)`,
    backgroundPosition: `-${x * scale}px -${y * scale}px`,
    backgroundSize: `${bgSizeW}px ${bgSizeH}px`,
    backgroundRepeat: 'no-repeat',
    flexShrink: 0,
  };

  return (
    <div style={containerStyle} aria-label={alt} className={className}>
      <div style={spriteStyle} />
    </div>
  );
};

export default AtlasIcon;
