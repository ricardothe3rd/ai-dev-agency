import { OrthographicCamera, OrbitControls } from "@react-three/drei";

export function Camera() {
  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[15, 15, 15]}
        zoom={35}
        near={0.1}
        far={1000}
      />
      <OrbitControls
        enableRotate={true}
        enablePan={true}
        enableZoom={true}
        minZoom={15}
        maxZoom={80}
        maxPolarAngle={Math.PI / 2.5}
      />
    </>
  );
}
