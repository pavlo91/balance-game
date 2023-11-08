import React, { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getDistance, getRhumbLineBearing } from "geolib";
import CANNON from "cannon";

export default function City() {
  const center = [-3.188822, 55.943686];
  const api = "./export.geojson";
  //const api = "https://gistcdn.githack.com/isjeffcom/a611e99aa888534f67cc2f6273a8d594/raw/9dbb086197c344c860217826c59d8a70d33dcb54/gistfile1.txt";
  const { camera, scene } = useThree();

  const world = new CANNON.World();
  world.gravity.set(0, 0, -9.82);

  useEffect(() => {
    fetch(api)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        loadBuildings(data);
      });

    return () => {
      // Clean up resources here
    };
  }, []);

  const loadBuildings = (data) => {
    const features = data.features;

    for (let i = 0; i < features.length; i++) {
      const fel = features[i];
      if (!fel["properties"]) return;

      if (fel.properties["building"]) {
        addBuilding(
          fel.geometry.coordinates,
          fel.properties,
          fel.properties["building:levels"]
        );
      }
    }
  };

  function getRandomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }

  const addBuilding = (data, info, height = 1) => {
    // const MAT_BUILDING = new THREE.MeshPhongMaterial();
    const MAT_BUILDING = new THREE.MeshPhongMaterial({
      color: getRandomColor(),
    });

    height = height ? height : 1;

    /**
     * Textures
     */
    const loadingManager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(loadingManager);

    const colorTexture = textureLoader.load("/dark_brick_wall_diff_1k.jpg");
    colorTexture.wrapS = THREE.MirroredRepeatWrapping;
    colorTexture.wrapT = THREE.MirroredRepeatWrapping;
    // colorTexture.repeat.x = 2
    // colorTexture.repeat.y = 3
    // colorTexture.offset.x = 0.5
    // colorTexture.offset.y = 0.5
    // colorTexture.rotation = Math.PI * 0.25
    // colorTexture.center.x = 0.5
    // colorTexture.center.y = 0.5
    colorTexture.generateMipmaps = false;
    colorTexture.minFilter = THREE.NearestFilter;
    colorTexture.magFilter = THREE.NearestFilter;

    const diffTexture = textureLoader.load("./dark_brick_wall_diff_1k.jpg");
    const dispTexture = textureLoader.load("./dark_brick_wall_disp_1k.png");
    const norglTexture = textureLoader.load("./dark_brick_wall_nor_gl_1k.exr");
    const roughTexture = textureLoader.load("./dark_brick_wall_rough_1k.exr");

    const material = new THREE.MeshBasicMaterial({ map: colorTexture });

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
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.setY(-3.5);
      mesh.scale.set(10, 10, 10);
      scene.add(mesh);

      // Cannon.js body
      const cannonshape = new CANNON.Box(
        new CANNON.Vec3(10 * 0.5, height * 0.5, height * 0.5)
      );

      const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 0, 0),
        shape: cannonshape,
        material: MAT_BUILDING,
      });
      body.position.copy(new CANNON.Vec3(0, 0, 0));
      world.addBody(body);
    }
  };

  const genShape = (points, center) => {
    //const shape = new CANNON.Box();
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

  const GPSRelativePosition = (objPosi, centerPosi) => {
    let dis = getDistance(objPosi, centerPosi);
    let bearing = getRhumbLineBearing(objPosi, centerPosi);
    let x = centerPosi[0] + dis * Math.cos(bearing * (Math.PI / 180));
    let y = centerPosi[1] + dis * Math.sin(bearing * (Math.PI / 180));
    return [-x / 100, y / 100];
  };

  return <></>;
}
