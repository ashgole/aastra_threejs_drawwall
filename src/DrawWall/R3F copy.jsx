import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Html, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import React from "react";
import { useAtom } from 'jotai'
import { is2DAtom } from "./utils/jotai";
import { useControls } from "leva";

const Wall = () => {
  const [is2D] = useAtom(is2DAtom);
  const height = 1;
  const depth = 0.1;

  const [geometryArr, setGeometryArr] = useState([]);
  const [edgePonits, setEdgePoints] = useState({
    prevX: 0,
    prevZ: 0,
    newX: 0,
    newZ: 0,
  })

  //wall
  const extrudeSettings = {
    depth: depth,
    bevelEnabled: false,
  };

  const drawWall = (distance2) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(distance2, 0); // Bottom edge
    shape.lineTo(distance2, height); // Right edge
    shape.lineTo(0, height); // Top edge
    shape.lineTo(0, 0); // Close the shape

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };
  /*-------------rotation-------------*/
  const calculateRotation = (prevX, prevZ, newX, newZ) => {
    let angle = Math.atan2(newZ - prevZ, newX - prevX); // Calculate the angle in radians
    if (angle < 0) {
      angle += 2 * Math.PI; // Normalize the angle to be in the range [0, 2*PI]
    }
    return -angle;
  };
  /*-------------distance-------------*/
  const calculateDistance = (prevX, prevZ, newX, newZ) => {
    const distance = Math.sqrt((newX - prevX) ** 2 + (newZ - prevZ) ** 2);
    return distance;
  };


  const getPosition = (e) => {
    const { x, z } = e.intersections[0].point; // Only consider X coordinate
    setEdgePoints((prevPoints) => {
      const updatedPoints = {
        prevX: prevPoints.newX,  // Set previous to the last new
        prevZ: prevPoints.newZ,
        newX: x,                 // Set new points to the current
        newZ: z,
      };
      if (!updatedPoints.prevX == 0) {
        const angle = calculateRotation(updatedPoints.prevX, updatedPoints.prevZ, updatedPoints.newX, updatedPoints.newZ);
        let distance = calculateDistance(updatedPoints.prevX, updatedPoints.prevZ, updatedPoints.newX, updatedPoints.newZ);
        // Calculate the new rotation
        const newWall = drawWall(distance);
        newWall.angle = angle
        newWall.position = updatedPoints
        setGeometryArr([...geometryArr, newWall]);
      }

      return updatedPoints;
    });

  };

  /*-------------ray-------------*/
  const movingray=(e)=>{
    console.log('ok ',e )
  }
  const startRay=(e)=>{
    console.log('ok ',e )
  }
  return (
    <>
      {geometryArr.map((geometry, index) => {
        const { prevX, prevZ } = geometry.position
        return <mesh
          position={[prevX, 0, prevZ]}
          rotation-y={geometry.angle}
          key={index}
          geometry={geometry}
        >
          <meshStandardMaterial attach="material" color="gray" />
        </mesh>
      })}

      <mesh
        onPointerMove={movingray}
        onPointerDown={startRay}
        onPointerUp={is2D && getPosition}
        rotation-x={-Math.PI * 0.5}>
        <planeGeometry args={[10, 10, 10, 10]} />
        <meshStandardMaterial color='yellow'
          wireframe={true} />
      </mesh>
    </>
  );
};


const DrawWall = () => {
  const [is2D] = useAtom(is2DAtom);

  return (
    <div className="h-screen w-full">
      <Canvas
        className="h-full w-full"

      >
        <Suspense fallback={<Html>Loading...</Html>}>
          <PerspectiveCamera
            makeDefault
            position={is2D ? [0, 15, 0] : [0, 10, 10]}
            fov={45}
          />
          <OrbitControls
            enableZoom={!is2D}
            enablePan={!is2D}
            enableRotate={!is2D}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={0}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 0, 5]} />
          <Wall />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default DrawWall;
