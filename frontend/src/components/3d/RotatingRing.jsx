import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, MeshDistortMaterial } from '@react-three/drei';

const RotatingRing = ({ position = [0, 0, 0], color = '#8b5cf6', speed = 1 }) => {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * speed * 0.4;
    meshRef.current.rotation.y = t * speed * 0.6;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.7 * speed) * 0.2;
  });

  return (
    <Torus ref={meshRef} args={[1.5, 0.08, 16, 100]} position={position}>
      <MeshDistortMaterial
        color={color}
        distort={0.1}
        speed={1}
        roughness={0}
        metalness={1}
        transparent
        opacity={0.7}
      />
    </Torus>
  );
};

export default RotatingRing;
