// import LoadingScreen from './loading.js'
import Snow from './snow.js'
import * as THREE from '../web_modules/three.js'

import { OBJLoader } from '../web_modules/three/examples/jsm/loaders/OBJLoader.js'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MTLLoader } from '../web_modules/three/examples/jsm/loaders/MTLLoader.js'
import { OrbitControls } from '../web_modules/three/examples/jsm/controls/OrbitControls.js'

function loadIsland() {
  let camera, scene, renderer, controls

  let windowHalfX = window.innerWidth / 2
  let windowHalfY = window.innerHeight / 2

  init()
  animate()

  function init() {
    const container = document.createElement('div')
    document.body.appendChild(container)
    container.setAttribute('style', 'display: none;')

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(30, 15, 30)

    controls = new OrbitControls(camera, container)
    controls.target.set(0, 0, 0)
    controls.enableDamping = true
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.25
    controls.minDistance = 20
    controls.maxDistance = 75
    controls.update()

    // scene

    scene = new THREE.Scene()

    const ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)
    scene.add(camera)

    // model

    // const loader = new GLTFLoader()
    // loader.load('island/island.gltf', function (gltf) {
    //   const island = gltf.scene
    //   island.position.set(5, 3, -1)
    //   island.scale.set(0.2, 0.2, 0.2)

    //   scene.add(island)
    //   render()
    // })

    const onProgress = function (xhr) {
      if (xhr.lengthComputable) {
        const percentComplete = (xhr.loaded / xhr.total) * 100
        console.log(Math.round(percentComplete, 2) + '% downloaded')
      }
    }

    const onError = function () {}

    const manager = new THREE.LoadingManager()

    new MTLLoader(manager).load('island/island.mtl', function (materials) {
      materials.preload()

      new OBJLoader(manager).setMaterials(materials).load(
        'island/island.obj',
        island => {
          island.position.set(5, 3, -1)
          island.scale.set(0.2, 0.2, 0.2)
          scene.add(island)
          document.getElementById('loading').setAttribute('style', 'display: none;')
          container.setAttribute('style', 'display: block;')
        },
        onProgress,
        onError
      )
    })

    // skybox

    scene.background = new THREE.CubeTextureLoader()
      .setPath('skymap/')
      .load([
        'SkyboxSide1B.jpg',
        'SkyboxSide4B.jpg',
        'SkyboxTop.jpg',
        'SkyboxTop.jpg',
        'SkyboxSide1B.jpg',
        'SkyboxSide4B.jpg'
      ])

    Snow.init('archiflake.png', 6000)
    scene.add(Snow.getObject())

    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)

    renderer.setClearColor(0x121023)
    container.appendChild(renderer.domElement)

    //

    window.addEventListener('resize', onWindowResize, false)
  }

  function onWindowResize() {
    windowHalfX = window.innerWidth / 2
    windowHalfY = window.innerHeight / 2

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  //

  function animate() {
    requestAnimationFrame(animate)
    render()
  }

  function render() {
    Snow.update()
    controls.update()

    renderer.render(scene, camera)
  }
}

loadIsland()
