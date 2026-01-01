import { useRef } from 'react';
import { useThreeScene } from './useThreeScene';

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scene, renderer, camera } = useThreeScene(containerRef);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minWidth: '100px',
        minHeight: '100px',
        position: 'relative',
      }}
    />
  );
}

