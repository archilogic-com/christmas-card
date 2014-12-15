var LoadingScreen = require('./loading.js'),
    Snow = require('./snow.js'),
    World = require('three-world'),
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

// Creating skybox
var directions  = ["right", "left", "top", "top", "front", "back"];

var materialArray = [];
for (var i = 0; i < 6; i++) {
  materialArray.push( new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('skymap/stars_' + directions[i] + '.jpg'),
    side: THREE.BackSide
  }));
}
materialArray[3] = new THREE.MeshBasicMaterial({color: 0x0f0f2b});

var skyGeo = new THREE.BoxGeometry(2000, 2000, 2000),
    skyMat = new THREE.MeshFaceMaterial(materialArray);
    sky = new THREE.Mesh(skyGeo, skyMat);
World.add(sky);


// Position camera

var camera = World.getCamera();

camera.position.set(0, 10, 40);
camAnchor.rotation.order = 'YXZ';
camAnchor.add(camera);
World.add(camAnchor);

// Event listeners

var swingX = 0, swingY = 0;

var hammertime = new Hammer(document.body, {});
hammertime.get('pinch').set({ enable: true });

hammertime.on('pan', function(e) {
  var turnY = -Math.PI * 0.05 * (e.deltaX / window.innerWidth),
      turnX = -Math.PI * 0.05 * (e.deltaY / window.innerHeight);
  camAnchor.rotation.y += turnY;
  camAnchor.rotation.x += turnX;

  swingX = turnX;
  swingY = turnY;

  wasMoved = true;
});

hammertime.on('pinchmove', function(e) {
  camera.position.z += 1 - e.scale;
});

window.addEventListener('wheel', function(e) {
  camera.position.z -= e.wheelDelta / 120;
})


// Go!

function render() {
  // Kinetic rotation

  if(swingX != 0) {
    camAnchor.rotation.x += swingX;
    if(swingX < -0.001) {
      swingX += 0.001;
    } else if(swingX > 0.001) {
      swingX -= 0.001;
    } else {
      swingX = 0;
    }
  }

  if(swingY != 0) {
    camAnchor.rotation.y += swingY;
    if(swingY < -0.001) {
      swingY += 0.001;
    } else if(swingY > 0.001) {
      swingY -= 0.001;
    } else {
      swingY = 0;
    }
  }


  // Snow movement

  Snow.update();

  // Automatic camera rotation

  if(!wasMoved) centerAnchor.rotation.y += 0.001;
}
