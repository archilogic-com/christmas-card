var LoadingScreen = require('./loading.js'),
    Snow = require('./snow.js'),
    World = require('three-world'),
    Skybox = require('./skybox.js'),
    KineticControls = require('./kinetic-controls.js'),
    THREE = require('three'),
    MTLLoader = require('./loaders/MTLLoader.js'),
    OBJMTLLoader = require('./loaders/OBJMTLLoader.js');

var spin = 0,
    wasMoved = false;

var loader = new OBJMTLLoader();
LoadingScreen.start(document.getElementById("loading"));

World.init({
  farPlane: 5000,
  renderCallback: render
});

// Setup ligthing

light = new THREE.DirectionalLight(0xffffff);
light.position.set(0, 100, 60);
light.castShadow = true;
light.shadowCameraLeft = -60;
light.shadowCameraTop = -60;
light.shadowCameraRight = 60;
light.shadowCameraBottom = 60;
light.shadowCameraNear = 1;
light.shadowCameraFar = 1000;
light.shadowBias = -.0001
light.shadowMapWidth = light.shadowMapHeight = 1024;
light.shadowDarkness = .7;
light.intensity = 1.6;
World.add(light);

lightBelow = new THREE.DirectionalLight(0xffffff);
lightBelow.position.set(0, -50, 0);
lightBelow.castShadow = true;
lightBelow.shadowCameraLeft = -60;
lightBelow.shadowCameraTop = -60;
lightBelow.shadowCameraRight = 60;
lightBelow.shadowCameraBottom = 60;
lightBelow.shadowCameraNear = 1;
lightBelow.shadowCameraFar = 1000;
lightBelow.shadowBias = -.0001
lightBelow.shadowMapWidth = light.shadowMapHeight = 1024;
lightBelow.shadowDarkness = .7;
lightBelow.rotation.set(-Math.PI, 0, 0);
lightBelow.intensity = 1.5;
World.add(lightBelow);

// Create the center

var centerAnchor = new THREE.Object3D(),
    camAnchor    = new THREE.Object3D();

World.add(centerAnchor);

// Create awesomeness

loader.load("model/XMASCard9_TextureImplementation.obj", "model/XMASCard9_TextureImplementation.mtl", function(awesomeStuff) {
  console.log("Loaded");

  awesomeStuff.position.set(5, 3, -1);
  awesomeStuff.scale.set(0.2, 0.2, 0.2)
  centerAnchor.add(awesomeStuff);

  LoadingScreen.stop();
  World.startRenderLoop();
});

Snow.init((window.location.hash.slice(1) || "snowflake") + ".png");
centerAnchor.add(Snow.getObject());

var sky = Skybox('skymap/stars_', 'jpg');
World.add(sky);


// Position camera

var camera = World.getCamera();

camera.position.set(0, 10, 40);
camAnchor.rotation.order = 'YXZ';
camAnchor.add(camera);
World.add(camAnchor);

// Event listeners
KineticControls.init(camera, camAnchor);

// Go!

function render() {
  // Kinetic rotation
  KineticControls.update();

  // Snow movement

  Snow.update();

  // Automatic camera rotation

  if(!wasMoved) centerAnchor.rotation.y += 0.001;
}
