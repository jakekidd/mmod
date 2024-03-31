import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./Kepler.css";
import * as THREE from "three";

const {
  EventDispatcher,
  MOUSE,
  Quaternion,
  Spherical,
  TOUCH,
  Vector2,
  Vector3,
  Plane,
  Ray,
  MathUtils,
} = THREE;

const _changeEvent = { type: "change" };
const _startEvent = { type: "start" };
const _endEvent = { type: "end" };
const _ray = new Ray();
const _plane = new Plane();
const TILT_LIMIT = Math.cos(70 * MathUtils.DEG2RAD);

function Kepler() {
  useEffect(() => {}, []);

  return (
    <div className="kepler">
      <header className="App-header"></header>
    </div>
  );
}

export default Kepler;
