import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./Kepler.css";
import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function Kepler() {
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;

  useEffect(() => {}, []);

  const init = function (): void {
    // Set up the three.js WebGLRenderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.localClippingEnabled = true;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      200
    );

    camera.position.set(-1.5, 2.5, 3.0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", render); // use only if there is no animation loop
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.enablePan = false;

    const light = new THREE.HemisphereLight(0xffffff, 0x080808, 4.5);
    light.position.set(-1.25, 1, 1.25);
    scene.add(light);

    const group = new THREE.Group();

    for (let i = 1; i <= 30; i += 2) {
      const geometry = new THREE.SphereGeometry(i / 30, 48, 24);

      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(
          Math.random(),
          0.5,
          0.5,
          THREE.SRGBColorSpace
        ),
        side: THREE.DoubleSide,
        alphaToCoverage: true,
      });

      group.add(new THREE.Mesh(geometry, material));
    }

    scene.add(group);
  };

  const onWindowResize = function (): void {
    // Set the ratio of the camera's aspect to match the browser window size.
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  };

  const render = function (): void {
    renderer.render(scene, camera);
  };

  return <div className="kepler"></div>;
}

export default Kepler;
