import {
  InstancedRigidBodies,
  CuboidCollider,
  RigidBody,
  Physics,
} from "@react-three/rapier";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import useGame from "./stores/useGame.jsx";
import Lights from "./Lights.jsx";
import { Level } from "./Level.jsx";
import Player from "./Player.jsx";
import City from "./City.jsx";

export default function Experience() {
  const blocksCount = useGame((state) => state.blocksCount);
  const blocksSeed = useGame((state) => state.blocksSeed);
  const ground = useRef();

  return (
    <>
      {/*<color args={["#bdedfc"]} attach="background" />*/}
      <Physics debug={false}>
        <Lights />
        <City />
        {/*<Level count={blocksCount} seed={blocksSeed} />*/}
        <Player />
        {/** Ground */}
        <RigidBody type="fixed" friction={0.7}>
          <mesh ref={ground} receiveShadow position-y={-1.25}>
            <boxGeometry args={[200, 0.5, 200]} />
            <meshStandardMaterial color="darkgreen" />
          </mesh>
        </RigidBody>
      </Physics>
    </>
  );
}
