var LoadingScreen = require('./loading.js'),
    Snow = require('./snow.js'),
    World = require('three-world'),
    Skybox = require('./skybox.js'),
    KineticControls = require('./kinetic-controls.js'),
    THREE = require('three'),
    loadAL2 = require('./loaders/al2loader');

LoadingScreen.start(document.getElementById("loading"));

if(!Detector.webgl) {
  document.body.classList.add("fallback");
  document.body.innerHTML = "<div class=\"wrap\"><h1>Merry Christmas from Archilogic!</h1><p><a href=\"http://beta.archilogic.com/getwebgl\">Get WebGL for the full experience</a></p></div>";
  return;
}

World.init({
  farPlane: 10000,
  renderCallback: render,
  clearColor: 0x121023,
  ambientLightColor: 0
});

// Setup ligthing

lightBelow = new THREE.DirectionalLight(0x0000ff);
lightBelow.position.set(0, -50, 0);
lightBelow.castShadow = true;
lightBelow.shadowCameraLeft = -60;
lightBelow.shadowCameraTop = -60;
lightBelow.shadowCameraRight = 60;
lightBelow.shadowCameraBottom = 60;
lightBelow.shadowCameraNear = 1;
lightBelow.shadowCameraFar = 1000;
lightBelow.shadowBias = -.0001
lightBelow.shadowMapWidth = 1024;
lightBelow.shadowDarkness = .7;
lightBelow.rotation.set(-Math.PI, 0, 0);
lightBelow.intensity = 0.2;
World.add(lightBelow);

// Create the center

var centerAnchor = new THREE.Object3D(),
    camAnchor    = new THREE.Object3D();

World.add(centerAnchor);

// Create awesomeness

loadAL2({
  url: "model2/XMASCard9_TextureImplementationB.al2.json",
  onReady: function(model) {
    var theIsland = model.parent3d;
    theIsland.position.set(5, 3, -1);
    theIsland.scale.set(0.2, 0.2, 0.2)

    centerAnchor.add(theIsland);
    LoadingScreen.stop();
    World.startRenderLoop();
  }
});

Snow.init("archiflake.png", 6000);
centerAnchor.add(Snow.getObject());

var sky = Skybox('skymap/stars_', 'jpg');
World.add(sky);

// Position camera

var camera = World.getCamera();

camera.position.set(0, 0, 40);
camAnchor.rotation.order = 'YXZ';
camAnchor.add(camera);
window.camAnchor = camAnchor;
World.add(camAnchor);

camAnchor.rotation.set(-Math.PI/8, Math.PI/2 - 0.1, 0);

// Event listeners
KineticControls.init(camera, camAnchor, 23);

// Go!

function render() {
  // Kinetic rotation
  KineticControls.update();

  // Snow movement

  Snow.update();

  // Automatic camera rotation

  if(!KineticControls.wasMoved()) centerAnchor.rotation.y += 0.001;
}
