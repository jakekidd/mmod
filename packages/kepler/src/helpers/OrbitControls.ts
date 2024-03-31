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

class OrbitControls extends EventDispatcher {
  public object: {};
  public domElement: Element;

  /**
   * Orbit controls are used to purvey a target object in rendered space.
   * See: https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js
   * @param object
   */
  constructor(object: any, domElement: Element) {
    super();
    this.object = object;
    this.domElement = domElement;
  }
}
