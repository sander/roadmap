'use strict'

const vec3 = function(x, y, z) { return { x: x, y: y, z: z }}

const colors = {
  background: 0x862984,
  earth: 0x622659,
  road: 0x9c4ea4,
  dream: 0x782e91,
  physical_reality: 0x583867
}

const dims = {
  road_width: 2,
  horizon: 100,
  camera: vec3(0, 1, 5),
  reality_z: 2
}

var state = {
  distance: 0
}

var camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, .1, dims.horizon)
const renderer = new THREE.WebGLRenderer()
renderer.setClearColor(colors.background, 1)
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
const cube = new THREE.Mesh(geometry, material)

const earth = function() {
  const geometry = new THREE.PlaneGeometry(dims.horizon, dims.horizon)
  const material = new THREE.MeshBasicMaterial({ color: colors.earth })
  const plane = new THREE.Mesh(geometry, material)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = .49
  return plane
}

const road = function() {
  const geometry = new THREE.BoxGeometry(dims.road_width, 1, dims.horizon)
  const material = new THREE.MeshBasicMaterial({ color: colors.road })
  const surface = new THREE.Mesh(geometry, material)
  return surface
}

const dream = function() {
  const geometry = new THREE.PlaneGeometry(3, 3)
  const material = new THREE.MeshBasicMaterial({ color: colors.dream })
  const surface = new THREE.Mesh(geometry, material)
  surface.rotation.x = -Math.PI / 2
  surface.position.x = -dims.road_width * 2
  surface.position.y = .5
  surface.position.z = 4
  return surface
}

const physical_reality = function() {
  const geometry = new THREE.PlaneGeometry(3, 2)
  const material = new THREE.MeshBasicMaterial({ color: colors.physical_reality })
  const surface = new THREE.Mesh(geometry, material)
  surface.position.z = dims.reality_z
  surface.position.y = 1
  return surface
}

const environment = function() {
  var group = new THREE.Object3D()
  return group
}

state.environment = environment()

const scene = function() {
  const s = new THREE.Scene()
  s.add(earth())
  s.add(road())
  s.add(state.environment)
  s.add(physical_reality())
  return s
}

var s = scene()

addEventListener('keypress', function() {
  var d = dream()
  d.position.z = - state.distance - 10
  state.environment.add(d)
})

noise.seed(0)
const render = function(t) {
  requestAnimationFrame(render)

  state.distance += .1
  state.environment.position.z = state.distance

  const t2 = t / 1000
  camera.position.x = dims.camera.x + noise.perlin3(t2, 0, 0) / 10
  camera.position.y = dims.camera.y + noise.perlin3(0, t2, 0) / 10
  camera.position.z = dims.camera.z + noise.perlin3(0, 0, t2) / 10

  renderer.render(s, camera)
}
render(0)
