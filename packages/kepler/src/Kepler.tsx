import React, { useEffect } from "react";
import "./Kepler.css";
import * as THREE from "three";
import * as satellite from "satellite.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MMOD } from "./scene/MMOD";
import { EARTH_RADIUS } from "./helpers/Constants";
import { Identifier } from "./scene/Identifier";
import { Aggregator } from "./model/Aggregator";

const GUI_PARAMS = {
  showHelpers: true,
  alphaToCoverage: true,
};

// TODO: Make this a GUI variable.
// Seconds that will elapse in sim time per animation frame.
const SECONDS_PER_FRAME = 10;

function Kepler() {
  // TODO: Move to state?

  // Main components of the three.js nested web GL process.
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  // Current sim time in UTC seconds. Used in the event we want to speed things up.
  let time: number;
  // Whether or not the three.js canvas renderer and scene have been initialized.
  // Note that we do not use state here, as we just want to prevent redundant init
  // calls in useEffect.
  let initialized = false;

  const mmods: MMOD[] = [];
  // Alice is an Identifier agent observing MMODs.
  let alice: Identifier;

  useEffect(init, []);

  // useEffect(tleTest, []);
  function tleTest(): void {
    const ISS_TLE = [
      `1 25544U 98067A   19156.50900463  .00003075  00000-0  59442-4 0  9992`,
      `2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442`,
    ];
    const satrec = satellite.twoline2satrec(ISS_TLE[0], ISS_TLE[1]);
    console.log("satrec", satrec);

    // Get the position of the satellite at the given date
    const date = new Date();
    date.setHours(date.getHours() + 4);
    const positionAndVelocity = satellite.propagate(satrec, date);
    if (typeof positionAndVelocity === "boolean") {
      console.log("Is a boolean.", positionAndVelocity);
      return;
    }
    const gmst = satellite.gstime(date);
    const position = satellite.eciToGeodetic(
      positionAndVelocity.position as any,
      gmst
    );

    console.log("Positional data:");
    console.log(position);
    console.log(position.longitude); // in radians
    console.log(position.latitude); // in radians
    console.log(position.height); // in km
  }

  function init(): void {
    // Check whether initialized.
    if (initialized) {
      return;
    }
    initialized = true;

    // Set initial UTC timestamp in seconds.
    time = new Date().getUTCSeconds();

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

    camera.position.set(
      -EARTH_RADIUS - 10,
      EARTH_RADIUS + 10,
      EARTH_RADIUS + 10
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", render); // use only if there is no animation loop
    controls.minDistance = EARTH_RADIUS + 10;
    controls.maxDistance = EARTH_RADIUS + 18;
    controls.enablePan = false;

    const light = new THREE.HemisphereLight(0xffffff, 0x080808, 4.5);
    light.position.set(-4, 1, 1.25);
    scene.add(light);

    // Create an earth sphere around which our MMODs will be orbit.
    // TODO: Add a transparent slightly larger sphere to illustrate the range of LEO.
    const earthGroup = new THREE.Group();
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 48, 24);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.8, 0.5, 0.5, THREE.SRGBColorSpace),
      side: THREE.DoubleSide,
      alphaToCoverage: true,
    });
    earthGroup.add(new THREE.Mesh(earthGeometry, earthMaterial));
    // Add the earth group to the scene.
    scene.add(earthGroup);

    // Init the MMOD meshes, small object points that will be orbiting the
    // earth sphere.
    for (let i = 0; i < 500; i++) {
      const mmod = new MMOD(scene);
      mmods.push(mmod);
    }

    // Init Alice, an Identifier.
    alice = new Identifier(scene);

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

    // Start the animation process.
    animate();

    // TODO: REMOVE
    // const date = new Date();
    // date.setUTCSeconds(time);
    // const tle = mmods[0].tle(date);
    // console.log("MMOD TLE:", "\n", tle[0], "\n", tle[1]);

    // const satrec = satellite.twoline2satrec(tle[0], tle[1]);
    // console.log("MMOD SATREC:", satrec);

    // // Get the position of the satellite at the given date
    // date.setHours(date.getHours() + 4);
    // const positionAndVelocity = satellite.propagate(satrec, date);
    // if (typeof positionAndVelocity === "boolean") {
    //   console.log("Is a boolean.", positionAndVelocity);
    //   return;
    // }
    // const gmst = satellite.gstime(date);
    // const position = satellite.eciToGeodetic(
    //   positionAndVelocity.position as any,
    //   gmst
    // );

    // console.log("Positional data:");
    // console.log(position);
    // console.log(position.longitude); // in radians
    // console.log(position.latitude); // in radians
    // console.log(position.height); // in km

    const aggregator = new Aggregator();
    aggregator.example();
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

  function animate(): void {
    time += SECONDS_PER_FRAME;

    requestAnimationFrame(animate);

    for (const mmod of mmods) {
      // const MMOD_TLE = mmod.tle(new Date());
    }

    render();
  }

  return <div className="kepler"></div>;
}

export default Kepler;
