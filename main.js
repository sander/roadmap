'use strict';

// U T I L I T I E S

const vec3 = function(x, y, z) { return { x: x, y: y, z: z }; };
const wh = function(w, h) { return { w: w, h: h }; };
const ratio2size = function(r, w, h) {
  return (w / h < r) ? wh(w, w / r) : wh(h * r, h);
}
const plane = function(w, h) {
};

// C O N F I G

const colors = {
  background: 0x000000,
  earth: 0x622659,
  road: 0x9c4ea4,
  dream: 0x782e91,
  physical_reality: 0x583867,
  physical_reality_line: 0x111111,
  cue: 0xffffff,
};

const dims = {
  ratio: 4/3,
  road_width: 2,
  horizon: 100,
  camera: vec3(0, 1, 0),
  reality_z: -8,
  earth_y: -.1,
  road_y: -.05,
  dream_y: 0,
  bg: wh(640, 480)
};

// S T A T E

var state = {
  distance: 0
};

// S T U F F

var camera = new THREE.PerspectiveCamera(75, dims.ratio, .1, dims.horizon);
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(colors.background, 1);
(function() {
  const size = ratio2size(dims.ratio, innerWidth, innerHeight)
  renderer.setSize(size.w, size.h)
})();
document.body.appendChild(renderer.domElement);

// C O M P O N E N T S

const earth = function() {
  const geometry = new THREE.PlaneGeometry(dims.horizon, dims.horizon);
  const material = new THREE.MeshBasicMaterial({ color: colors.earth });
  const plane = new THREE.Mesh(geometry, material)
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = dims.earth_y;
  return plane;
};

const road = function() {
  const geometry = new THREE.BoxGeometry(dims.road_width, 0, dims.horizon);
  const material = new THREE.MeshBasicMaterial({
    color: colors.road,
    wireframe: true,
    wireframeLinewidth: 2
  });
  const surface = new THREE.Mesh(geometry, material);
  const helper = new THREE.EdgesHelper(surface, colors.road);
  helper.material.linewidth = 2;
  return helper;
};

const dream = function() {
  const geometry = new THREE.PlaneGeometry(3, 3);
  const material = new THREE.MeshBasicMaterial({
    color: colors.dream,
    wireframe: true
  });
  const surface = new THREE.Mesh(geometry, material);
  surface.rotation.x = -Math.PI / 2;
  surface.position.x = -dims.road_width * 2;
  surface.position.y = .5;
  surface.position.z = 4;
  return surface;
};

const cue = function() {
  const dist = 1;
  const w = .5;
  const h = .5;
  const group = new THREE.Object3D();
  const geom = new THREE.PlaneGeometry(w, h);
  const mat = new THREE.MeshBasicMaterial({
    color: colors.cue,
    wireframe: true
  });
  const surf = new THREE.Mesh(geom, mat);
  surf.position.y = 1;
  group.add(surf);
  return group;
};

const physical_reality = function() {
  const geometry = new THREE.PlaneGeometry(20, 12);
  const surface = new THREE.Mesh(geometry, state.video.material);
  surface.position.z = dims.reality_z;
  surface.position.y = 1;
  return surface;
};

const environment = function() {
  var group = new THREE.Object3D();
  return group;
};

const reality_video = function() {
  const img = document.createElement('canvas');
  img.width = dims.bg.w;
  img.height = dims.bg.h;

  const ctx = img.getContext('2d');

  const draw_lines = function() {
    const n = 100;
    const step = img.width / n;
    for (var i = 0; i < n; i++) {
      const x = i * step;
      ctx.beginPath();
      ctx.moveTo(x, -img.height);
      ctx.lineTo(x, img.height);
      ctx.stroke();
    }
  };

  const draw = function(t) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, img.width, img.height);

    const t2 = t / 1000;
    const a1 = noise.perlin2(t2, 0) / 10;
    const a2 = noise.perlin2(0, t2) / 10;

    ctx.strokeStyle = '#' + colors.physical_reality_line.toString(16);
    ctx.lineWidth = 1;

    ctx.save();
    ctx.rotate(a1);
    draw_lines();
    ctx.restore();
    ctx.save();
    ctx.rotate(Math.PI / 4 + a2);
    draw_lines();
    ctx.restore();
  };

  var tex = new THREE.Texture(img);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;

  var mat = new THREE.MeshBasicMaterial({
    map: tex,
    overdraw: true,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: .9
  });

  return {
    context: ctx,
    texture: tex,
    material: mat,
    draw: draw
  };
};

const scene = function() {
  const s = new THREE.Scene();
//  s.add(earth())
  s.add(road());
  s.add(state.environment);
  s.add(physical_reality());
  return s;
};

// F U N C T I O N S

const handle_key = function(e) {
  if (e.key == 'd') {
    var d = dream();
    d.position.z = - state.distance - 10;
    state.environment.add(d);
  } else if (e.key == 'c') {
    var c = cue();
    c.position.x = -dims.road_width * 2;
    c.position.z = -state.distance - dims.reality_z;
    state.environment.add(c);
  }
}

const render = function(t) {
  requestAnimationFrame(render);

  state.distance += .01;
  state.environment.position.z = state.distance;

  const t2 = t / 1000;
  camera.position.x = dims.camera.x + noise.perlin3(t2, 0, 0) / 10;
  camera.position.y = dims.camera.y + noise.perlin3(0, t2, 0) / 10;
  camera.position.z = dims.camera.z + noise.perlin3(0, 0, t2) / 10;

  //if (state.video.source.readyState == state.video.source.HAVE_ENOUGH_DATA) {
  state.video.draw(t);//context.drawImage(state.video.source, 0, 0)
  state.video.texture.needsUpdate = true;
  //}

  renderer.render(state.scene, camera);
};

const main = function() {
  addEventListener('keypress', handle_key);

  state.environment = environment();
  state.video = reality_video();
  state.scene = scene();

  noise.seed(0);
  render(0);
};

main();
