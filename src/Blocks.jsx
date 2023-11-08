import { useRef, useEffect } from "react";
import * as THREE from "three";
import {
  InstancedRigidBodies,
  CuboidCollider,
  Physics,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import { useThree, useFrame } from "@react-three/fiber";
import { getDistance, getRhumbLineBearing } from "geolib";
import CANNON from "cannon";

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

function BlockStart({ position = [0, 0, 0] }) {
  const center = [-3.188822, 55.943686];
  const api = "./export.geojson";

  const cube = useRef();
  const cubeInstMesh = useRef();
  const buildingMesh = useRef();
  const { camera, scene } = useThree();
  const world = new CANNON.World();
  world.gravity.set(0, 0, -9.82);

  const GPSRelativePosition = (objPosi, centerPosi) => {
    let dis = getDistance(objPosi, centerPosi);
    let bearing = getRhumbLineBearing(objPosi, centerPosi);
    let x = centerPosi[0] + dis * Math.cos((bearing * Math.PI) / 180);
    let y = centerPosi[1] + dis * Math.sin((bearing * Math.PI) / 180);
    return [-x / 100, y / 100];
  };

  const genShape = (points, center) => {
    const shape = new THREE.Shape();

    for (let i = 0; i < points.length; i++) {
      let elp = points[i];
      elp = GPSRelativePosition(elp, center);

      if (i === 0) {
        shape.moveTo(elp[0], elp[1]);
      } else {
        shape.lineTo(elp[0], elp[1]);
      }
    }

    return shape;
  };

  const genGeometry = (shape, settings) => {
    const geometry = new THREE.ExtrudeGeometry(shape, settings);
    geometry.computeBoundingBox();

    return geometry;
  };

  function getRandomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }

  const addBuilding = (data, info, height = 1) => {
    // const MAT_BUILDING = new THREE.MeshPhongMaterial();
    const MAT_BUILDING = new THREE.MeshPhongMaterial({
      color: getRandomColor(),
    });
    const rigidBodies = [];
    height = height ? height : 1;

    for (let i = 0; i < data.length; i++) {
      const el = data[i];

      const shape = genShape(el, center);
      const geometry = genGeometry(shape, {
        curveSegments: 1,
        depth: height,
        bevelEnabled: false,
      });

      geometry.rotateX(Math.PI / 2);
      geometry.rotateZ(Math.PI);

      const mesh = new THREE.Mesh(geometry, MAT_BUILDING);
      mesh.position.setY(-3.5);
      mesh.scale.set(1, 1, 1);

      scene.add(mesh);
    }
  };

  const loadBuildings = (data) => {
    const features = data.features;
    const rigidBodies = []; // Store rigid bodies

    for (let i = 0; i < features.length; i++) {
      const fel = features[i];

      if (!fel["properties"]) continue;

      /*
      if (fel.properties["building"]) {
        const halfExtents = [1, 1, 1]; // Adjust these values as needed
        const height = fel.properties["building:levels"] || 1;

        const shape = genShape(fel.geometry.coordinates, center);
        const geometry = new THREE.ExtrudeGeometry(shape, {
          curveSegments: 1,
          depth: height,
          bevelEnabled: false,
        });

        if (geometry) {
          geometry.rotateX(Math.PI / 2);
          geometry.rotateZ(Math.PI);

          const MAT_BUILDING = new THREE.MeshPhongMaterial({
            color: getRandomColor(),
          });

          const mesh = (
            <mesh
              geometry={geometry}
              material={MAT_BUILDING}
              scale={[1, 1, 1]}
            />
          );
        }
      }
      */

      if (fel.properties["building"]) {
        addBuilding(
          fel.geometry.coordinates,
          fel.properties,
          fel.properties["building:levels"]
        );
      }
    }
  };
  const cubesCount = 10;
  const buildingCount = 10;

  const collisionEnter = () => {
    console.log("collision");
  };

  useEffect(() => {
    fetch(api)
      .then((res) => res.json())
      .then((data) => {
        loadBuildings(data);
      });

    /*
    for (let i = 0; i < cubesCount; i++) {
      const matrix = new THREE.Matrix4();
      matrix.compose(
        new THREE.Vector3(i * 2, 0, 0),
        new THREE.Quaternion(),
        new THREE.Vector3(1, 2, 1)
      );
      cubeInstMesh.current.setMatrixAt(i, matrix);
    }
    */
  }, []);

  return (
    <group position={position}>
      <mesh
        geometry={boxGeometry}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow
      />

      <InstancedRigidBodies collider="cuboid">
        <instancedMesh ref={cubeInstMesh} args={[null, null, cubesCount]}>
          <boxGeometry />
          <meshStandardMaterial color={"tomato"} />
        </instancedMesh>
      </InstancedRigidBodies>

      {/*

      <RigidBody
        ref={cube}
        position={[10.5, 2, 0]}
        gravityScale={1}
        restitution={0}
        friction={0.7}
        colliders={false}
        onCollisionEnter={collisionEnter}
      >
        <mesh castShadow>
          <boxGeometry />
          <meshStandardMaterial color="gold" />
        </mesh>
        <CuboidCollider mass={16} args={[0.5, 0.5, 0.5]} />
      </RigidBody>

      <InstancedRigidBodies colliders="ball">
        <instancedMesh ref={buildingMesh} args={[null, null, buildingCount]}>
          <meshStandardMaterial color={"gold"} />
        </instancedMesh>
      </InstancedRigidBodies>
      */}
    </group>
  );
}

export default function Blocks() {
  return (
    <>
      <BlockStart position={[5, -3, 0]} />
    </>
  );
}
