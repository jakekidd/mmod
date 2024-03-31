import React, { useEffect } from "react";
import "./Kepler.css";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MMOD } from "./helpers/MMOD";
import { EARTH_RADIUS } from "./helpers/Constants";

const GUI_PARAMS = {
  showHelpers: true,
  alphaToCoverage: true,
};

function Kepler() {
  // TODO: Move to state?

  // Main components of the three.js nested web GL process.
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  // Whether or not the three.js canvas renderer and scene have been initialized.
  // Note that we do not use state here, as we just want to prevent redundant init
  // calls in useEffect.
  let initialized = false;
  const mmods: MMOD[] = [];

  useEffect(init, []);

  function init(): void {
    // Check whether initialized.
    if (initialized) {
      return;
    }
    initialized = true;

    // Init the three.js WebGLRenderer, which will draw the scene on the canvas.
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.localClippingEnabled = true;
    document.body.appendChild(renderer.domElement);

    // Init scene, which holds objects for rendering.
    scene = new THREE.Scene();

    // Init camera
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

    // Create an earth sphere around which our MMODs will be orbit.
    // TODO: Add a transparent slightly larger sphere to illustrate the range of LEO.
    const earthGroup = new THREE.Group();
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 48, 24);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(
        Math.random(),
        0.5,
        0.5,
        THREE.SRGBColorSpace
      ),
      side: THREE.DoubleSide,
      alphaToCoverage: true,
    });
    earthGroup.add(new THREE.Mesh(earthGeometry, earthMaterial));
    // Add the earth group to the scene.
    scene.add(earthGroup);

    // Init the MMOD meshes, small object points that will be orbiting the
    // earth sphere.
    for (let i = 0; i < 500; i++) {
      const mmod = new MMOD();
      scene.add(mmod.mesh);
      mmods.push(mmod);
    }

    // Init and set up the mini GUI
    const gui = new GUI();
    gui.add(GUI_PARAMS, "alphaToCoverage").onChange(function (value) {
      earthGroup.children.forEach((c: any) => {
        c.material.alphaToCoverage = Boolean(value);
        c.material.needsUpdate = true;
      });

      render();
    });

    // Add a window event listener that will fire when the browser window is resized.
    window.addEventListener("resize", onWindowResize);
  }

  function onWindowResize(): void {
    // Set the ratio of the camera's aspect to match the browser window size.
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  }

  function render(): void {
    renderer.render(scene, camera);
  }

  return <div className="kepler"></div>;
}

export default Kepler;
