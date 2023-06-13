import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/controls/OrbitControls.js';


THREE.ShaderChunk.snoise4 = document.getElementById('noise').textContent;

let scene, renderer, camera;

let controls;

let width = window.innerWidth;
let height = window.innerHeight;

let clock = new THREE.Clock();

let time = new THREE.Uniform(0);

let cubeCount = 200;

let offset = new THREE.Uniform(0.5);

let uniforms = {
  'u_time': time,
  'u_offset': offset
}

const init = function () {

  scene = new THREE.Scene();
  // scene.background = new Color(0xB3CEFB);
  scene.background = new THREE.Color(0x000000);
  // scene.fog = new Fog(scene.background, 1, 200);
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
  camera.position.z = 20;

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;

  document.querySelector('body').appendChild(renderer.domElement);

  render();

  addEvent();

  createGeometry();

  createGrid();

  addGui();
  
  let lights = new THREE.SpotLight(0xffffff, 1, 0);
  camera.add(lights);
  scene.add(camera);
}

const addGui = function () {
  let gui = new dat.GUI();
  let param = {
    u_offset: 1
  };

  gui.add(param, 'u_offset', 0, 10).onChange(function () {
    offset.value = param.u_offset;  
  });

}

const createGrid = function () {
  let helper = new THREE.GridHelper(100, 20, 0xffffff);
  helper.rotation.x = Math.PI * 0.1;  

  scene.add(helper);
}

const createGeometry = function () {
  // let geometry = new SphereBufferGeometry(2, 32, 32 );
  let geometry = new THREE.IcosahedronBufferGeometry(1.5, 4);
  // let material = new ShaderMaterial({
  //   uniforms: uniforms,
  //   vertexShader: vs,
  //   fragmentShader: fs,
  //   wireframe: true,
  //   side: DoubleSide
  // });
  let material = new THREE.MeshPhongMaterial({ color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
  let mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  material.onBeforeCompile = function (shader) {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader.replace('#include <clipping_planes_pars_vertex>', `
    #include <clipping_planes_pars_vertex>
    #include <snoise4>

    uniform float u_time;
    uniform float u_offset;

    `)
    .replace('#include <begin_vertex>', `
    #include <begin_vertex>

    float offset = 2.0;

    float low =  snoise(vec4(position, u_time * 0.5));
    float low1 =  snoise(vec4(position * 2. + 10., u_time * 0.5));

    vec3 pos = position;
    
    offset += low * u_offset;
    
    // offset += low1;

    transformed *= offset;
    `);
  }
}

const addEvent = function () {

  window.addEventListener('resize', resizeHandler, false);
}

const render = function () {
  requestAnimationFrame(render);

  uniforms.u_time.value = clock.getElapsedTime();
  controls.update();

  renderer.render(scene, camera);
}

const resizeHandler = function () {
  width = window.innerWidth;
  height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

init();
