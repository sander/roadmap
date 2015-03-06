'use strict';

// U T I L I T I E S

const vec3 = function(x, y, z) { return { x: x, y: y, z: z }; };
const wh = function(w, h) { return { w: w, h: h }; };
const ratio2size = function(r, w, h) {
  return (w / h < r) ? wh(w, w / r) : wh(h * r, h);
}
const time2pos = function(time) { return time; };
const do_position = function(obj, time, x, y, z0) {
  obj.position.x = x;
  obj.position.y = y;
  obj.position.z = dims.reality_z + dims.camera.z + z0 - state.distance - time2pos(time);
}

// C O N F I G

const colors = {
  background: 0x000000,
  earth: 0xffffff,
  road: 0xffffff,
  dream: 0xffffff,
  physical_reality: 0xffffff,
  physical_reality_line: 0x333333,
  cue: 0xffffff,
  main: 0xffffff
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
  bg: wh(640, 480),
  dream: wh(3, 3),
  reality_opacity: 1
};

const map = {
  dreams: []
};

const slides = [
  'seneca'
];

// S T A T E

var state = {
  distance: 0,
  slide: 0
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

const box = function(w, h, d, line, solid) {
  solid = !!solid;
  var group = new THREE.Object3D();
  var geometry = new THREE.BoxGeometry(w, h, d);
  var material = new THREE.MeshBasicMaterial({
    color: colors.main,
//    wireframe: true,
//    wireframeLinewidth: line
  });
  var surface = new THREE.Mesh(geometry, material);
  if (solid) {
    group.add(surface);
  } else {
    var helper = new THREE.EdgesHelper(surface, colors.road);
    helper.material.linewidth = line;
    group.add(helper);
  }
  return group;
};

const plane = function(w, d, line) {
  return box(w, 0, d, line);
};

const earth = function() {
  const geometry = new THREE.PlaneGeometry(dims.horizon, dims.horizon);
  const material = new THREE.MeshBasicMaterial({ color: colors.earth });
  const plane = new THREE.Mesh(geometry, material)
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = dims.earth_y;
  return plane;
};

const road = function() {
  return plane(dims.road_width, dims.horizon, 2);
};

const dream = function() {
  return plane(dims.dream.w, dims.dream.h, 4);
};

const meeting = function(w, label) {
//  var group = new THREE.Object3D();
  const width = w * dims.road_width;
  const height = .4;
  const depth = 1;
  const cwidth = 200;
  var b = box(width, height, depth, .5, true);
  var l = canvas_texture(cwidth, cwidth / width * height, 1);
  var ctx = l.context;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, l.width, l.height);
  ctx.fillRect(-500, -500, 1000, 1000);
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = '#000000';
  ctx.font = '16px sans-serif';
  ctx.fillText(label, 10, 26);
  const geom = new THREE.PlaneBufferGeometry(width, height);
  const surf = new THREE.Mesh(geom, l.material);
  l.texture.needsUpdate = true;
  surf.position.z = depth / 2;
  b.add(surf);
  return b;
};

const cue = function(size, stick) {
  const dist = 1;
  const group = new THREE.Object3D();
  //const geom = new THREE.PlaneBufferGeometry(w, h);
  const geom = new THREE.CircleGeometry(size / 2, 16);
  const mat = new THREE.MeshBasicMaterial({
    color: colors.cue,
    //wireframe: true
  });
  const surf = new THREE.Mesh(geom, mat);
  surf.position.y = stick;
  surf.rotation.y = Math.PI / 2;
  group.add(surf);
  const linemat = new THREE.LineDashedMaterial({
    color: 0xffffff,
    linewidth: 1,
    dashSize: .1,
    gapSize: 10
  });
  var linegeom = new THREE.Geometry();
  linegeom.vertices.push(new THREE.Vector3(0, stick, 0));
  linegeom.vertices.push(new THREE.Vector3(0, 0, 0));
  linegeom.lineDistancesNeedUpdate = true;//computeLineDistances();
  var line = new THREE.Line(linegeom, linemat);
  group.add(line);
  return group;
};

const physical_reality = function() {
  const geometry = new THREE.PlaneBufferGeometry(18, 13);
  const surface = new THREE.Mesh(geometry, state.video.material);
  surface.position.z = dims.reality_z;
  surface.position.y = 1;
  return surface;
};

const environment = function() {
  var group = new THREE.Object3D();
  return group;
};

const canvas_texture = function(w, h, opacity) {
  const img = document.createElement('canvas');
  img.width = w;
  img.height = h;

  var ctx = img.getContext('2d');

  var tex = new THREE.Texture(img);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;

  var mat = new THREE.MeshBasicMaterial({
    map: tex,
    overdraw: true,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: opacity
  });

  return {
    material: mat,
    texture: tex,
    context: ctx,
    width: w,
    height: h
  };
};

const reality_video = function() {
  var can = canvas_texture(dims.bg.w, dims.bg.h, dims.reality_opacity);
  var ctx = can.context;

  const draw_lines = function() {
    const n = 100;
    const step = can.width / n;
    for (var i = 0; i < n; i++) {
      const x = i * step;
      ctx.beginPath();
      ctx.moveTo(x, -can.height);
      ctx.lineTo(x, can.height);
      ctx.stroke();
    }
  };

  const draw = function(t) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, can.width, can.height);

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

  return {
    context: ctx,
    texture: can.texture,
    material: can.material,
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
    d.position.z = dims.reality_z + dims.camera.z - dims.dream.h * .75 - state.distance;
    state.environment.add(d);
  } else if (e.key == 'c') {
    var c = cue();
    c.position.x = -dims.road_width * 2;
    c.position.z = -state.distance - dims.reality_z;
    state.environment.add(c);
  } else if (!isNaN(parseInt(e.key))) {
    state.slide = parseInt(e.key);
  }
};

const render_reality = (function() {
  var slide_content = slides.map(function(s) {
    var img = document.createElement('img');
    img.src = 'images/slide_' + s + '.jpg';
    return img;
  });
  return function(t) {
    if (state.slide == 0) {
      state.video.draw(t);
      state.video.texture.needsUpdate = true;
    } else if (state.slide <= slides.length) {
      state.video.context.drawImage(slide_content[state.slide - 1], 0, 0);
      state.video.texture.needsUpdate = true;
    }
  };
})();

const render = function(t) {
  requestAnimationFrame(render);

  //state.distance += .01;
  state.environment.position.z = state.distance;

  const t2 = t / 1000;
  camera.position.x = dims.camera.x + noise.perlin3(t2, 0, 0) / 10;
  camera.position.y = dims.camera.y + noise.perlin3(0, t2, 0) / 10;
  camera.position.z = dims.camera.z + noise.perlin3(0, 0, t2) / 10;

  //if (state.video.source.readyState == state.video.source.HAVE_ENOUGH_DATA) {
  //state.video.draw(t);//context.drawImage(state.video.source, 0, 0)
  //state.video.texture.needsUpdate = true;
  //}
  render_reality(t);

  renderer.render(state.scene, camera);
};

const main = function() {
  addEventListener('keypress', handle_key);

  state.environment = environment();
  state.video = reality_video();
  state.scene = scene();

  // Test content
  var m = meeting(1, "9:00 MEETING");
  do_position(m, -1, 0, 0, 0);
  state.environment.add(m);

  var d = dream();
  do_position(d, -3, -dims.road_width * 1.5, 0, 0);
  state.environment.add(d);

  var c = cue(.75, 1.25);
  d.add(c);

  noise.seed(0);
  render(0);
};

main();
