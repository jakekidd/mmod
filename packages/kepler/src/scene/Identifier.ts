import * as THREE from "three";
import { EARTH_RADIUS } from "../helpers/Constants";

export type VisualCone = {
  direction: THREE.Vector3;
  height: number;
  tip: THREE.Vector3;
  base: THREE.Vector3;
};

export class Identifier {
  public readonly lightCone: VisualCone;

  constructor(scene: THREE.Scene) {
    // Create a three.js cone

    // Calculate the coordinates of the cone
    const direction = new THREE.Vector3(1, 1, 1).normalize();
    const height = 6;
    const tip = direction.clone().multiplyScalar(EARTH_RADIUS);
    const base = tip.clone().add(direction.clone().multiplyScalar(height));
    this.lightCone = {
      direction,
      height,
      tip,
      base,
    };

    // Create a cone
    const coneGeometry = new THREE.ConeGeometry(0.5, 1, 32);
    const coneMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.copy(tip);

    // Calculate rotation axis and angle
    // const rotationAxis = new THREE.Vector3()
    //   .crossVectors(tip, base)
    //   .normalize();
    // const rotationAngle = Math.acos(
    //   tip.dot(base) / (tip.length() * base.length())
    // );
    // Set cone's position and rotation
    // cone.position.copy(tip);
    // cone.rotation.setFromVector3(rotationAxis.multiplyScalar(rotationAngle));
    // cone.rotateX(rotationAxis.x * rotationAngle);
    // cone.rotateY(rotationAxis.y * rotationAngle);
    // cone.rotateZ(rotationAxis.z * rotationAngle);

    // Calculate rotation axis and angle
    const rotationAxis = new THREE.Vector3()
      .crossVectors(tip, base)
      .normalize();
    const rotationAngle = Math.acos(
      tip.dot(base) / (tip.length() * base.length())
    );

    // Set cone's position and rotation
    cone.position.copy(tip);
    cone.rotateOnAxis(rotationAxis, rotationAngle);

    // Add the cone to the three.js scene.
    scene.add(cone);

    // Given parameters:
    // Radius of the sphere.
    // const radius: number = 1.0;
    // // Direction of the base of the cone (as a unit vector).
    // const direction: [number, number, number] = [1, 1, 1];
    // // Length of the cone; essentially, height.
    // const coneLength: number = 2.0;

    // // Calculate the coordinates of the tip of the cone
    // const xt: number = direction[0] * radius;
    // const yt: number = direction[1] * radius;
    // const zt: number = direction[2] * radius;

    // // Calculate the coordinates of the base of the cone
    // const xb: number = xt + direction[0] * coneLength;
    // const yb: number = yt + direction[1] * coneLength;
    // const zb: number = zt + direction[2] * coneLength;

    // // Convert Cartesian coordinates to spherical coordinates
    // const thetaTip: number = Math.atan2(yt, xt); // Angle of the tip point in the xy plane
    // const phiTip: number = Math.atan2(Math.sqrt(xt ** 2 + yt ** 2), zt); // Angle between the positive z-axis and the vector to the tip point
    // const thetaBase: number = Math.atan2(yb, xb); // Angle of the base point in the xy plane
    // const phiBase: number = Math.atan2(Math.sqrt(xb ** 2 + yb ** 2), zb); // Angle between the positive z-axis and the vector to the base point

    // // Calculate thetaStart and thetaLength
    // let thetaStart: number = Math.min(thetaTip, thetaBase);
    // let thetaLength: number = Math.abs(thetaTip - thetaBase);

    // // Ensure thetaLength is positive and in the range [0, 2*pi]
    // if (thetaLength < 0) {
    //   thetaLength += 2 * Math.PI;
    // }

    // // Convert thetaStart and thetaLength to degrees if needed
    // const thetaStartDegrees: number = (thetaStart * 180) / Math.PI;
    // const thetaLengthDegrees: number = (thetaLength * 180) / Math.PI;
  }
}
