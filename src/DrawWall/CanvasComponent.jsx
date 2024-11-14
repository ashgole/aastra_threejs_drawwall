import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import React from "react";
import { useAtom } from 'jotai'
import { is2DAtom, newLineAtom } from "./utils/jotai";

const RayComponent = ({ start, end }) => {
  const lineRef = useRef();

  // Update the line geometry as the end point moves
  useFrame(() => {
    if (lineRef.current && start && end) {
      lineRef.current.geometry.setFromPoints([
        new THREE.Vector3(start.x, 0, start.z),
        new THREE.Vector3(end.x, 0, end.z),
      ]);
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="red" />
    </line>
  );
};

const Wall = () => {
  const [is2D] = useAtom(is2DAtom);
  const height = 1;
  const depth = 0.1;
  const [newLine, setNewLine] = useAtom(newLineAtom);

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
        newLine && (newWall.visibility = false)
        setGeometryArr([...geometryArr, newWall]);
        setNewLine(false)
      }

      return updatedPoints;
    });

  };


  /*-------------line-------------*/
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);

  const startRay = (e) => {
    const { x, z } = e.intersections[0].point;
    setStartPoint({ x, z });
    setEndPoint({ x, z }); // Initialize endPoint at the start for the line
  };

  const movingRay = (e) => {
    if (startPoint) { // Update only if start point is set
      const { x, z } = e.intersections[0].point;
      setEndPoint({ x, z });
    }
  };

  const stopRay = () => {
    setStartPoint(null); // Clear the start point to stop the line movement
  };
  return (
    <>
      {geometryArr.map((geometry, index) => {
        const { prevX, prevZ } = geometry.position
        return <mesh
          visible={geometry.visibility}
          position={[prevX, 0, prevZ]}
          rotation-y={geometry.angle}
          key={index}
          geometry={geometry}
        >
          <meshStandardMaterial attach="material" color="gray" />
        </mesh>
      })}

      <mesh
        onPointerMove={movingRay}
        onPointerDown={stopRay}
        onPointerUp={(e) => {
          is2D && getPosition(e)
          is2D && startRay(e)
        }}
        rotation-x={-Math.PI * 0.5}>
        <planeGeometry args={[10, 10, 10, 10]} />
        <meshStandardMaterial color='yellow'
          wireframe={true} />
      </mesh>
      {startPoint && endPoint && <RayComponent start={startPoint} end={endPoint} />}
    </>
  );
};


const CanvasComponent = () => {
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

export default CanvasComponent;
