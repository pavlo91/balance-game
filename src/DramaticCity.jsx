import { Canvas, extend } from "@react-three/fiber";
import {
  Effects,
  OrbitControls,
  OrthographicCamera,
  BakeShadows,
  KeyboardControls,
} from "@react-three/drei";
import { useRef } from "react";
import { RigidBody, Physics } from "@react-three/rapier";
import { UnrealBloomPass } from "three-stdlib";
import { Tower } from "./Tower";
import Blocks from "./Blocks";
import { Level } from "./Level";
import Player from "./Player";
import Interface from "./Interface.jsx";

extend({ UnrealBloomPass });

export default function App() {
  const ground = useRef();

  return (
    <KeyboardControls
      map={[
        { name: "forward", keys: ["ArrowUp", "KeyW"] },
        { name: "backward", keys: ["ArrowDown", "KeyS"] },
        { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
        { name: "rightward", keys: ["ArrowRight", "KeyD"] },
        { name: "jump", keys: ["Space"] },
      ]}
    >
      <Canvas shadows gl={{ antialias: false }}>
        <color attach="background" args={["#202030"]} />
        <fog attach="fog" args={["#202030", 10, 140]} />
        <hemisphereLight intensity={0.2} color="#eaeaea" groundColor="blue" />
        <directionalLight
          castShadow
          intensity={0.6}
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0001}
          position={[10, 10, -10]}
        />
        <Tower position={[0, -3.25, 0]} />
        <Physics>
          <RigidBody type="fixed" friction={0.7}>
            <Blocks />
            <Player />

            <mesh
              ref={ground}
              receiveShadow
              position-y={-3.5}
              material-color="#778"
            >
              <boxGeometry args={[200, 0.5, 200]} />
              <meshStandardMaterial color="#777686" />
            </mesh>
          </RigidBody>
          <Level />
        </Physics>
        <Effects disableGamma>
          <unrealBloomPass threshold={1} strength={1.0} radius={0.5} />
        </Effects>
        <BakeShadows />
        {/*
      <OrthographicCamera
        makeDefault
        far={100}
        near={0.1}
        position={[-10, 2, -10]}
        zoom={5}
      />
      */}
        <OrbitControls enableZoom={true} />
      </Canvas>
    </KeyboardControls>
  );
}
