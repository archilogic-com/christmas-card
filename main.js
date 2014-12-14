var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    NUM_SNOWFLAKES = 2000,
    FALL_SPEED_QUOTIENT = 45;

var spin = 0,
    wasMoved = false;

var scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 5000),
    loader = new THREE.OBJMTLLoader(),
    renderer = new THREE.WebGLRenderer({ antialias: true });


renderer.setSize(WIDTH, HEIGHT);

// Make the renderer clear with black
renderer.setClearColor(0x00001f);

// Setup ligthing

//var ambient = new THREE.AmbientLight(0x0f0f2b);
//scene.add(ambient);

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
scene.add(light);

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
scene.add(lightBelow);

// Create the center

var centerAnchor = new THREE.Object3D(),
    camAnchor    = new THREE.Object3D();

scene.add(centerAnchor);

// Create awesomeness

loader.load("model/XMASCard9_TextureImplementation.obj", "model/XMASCard9_TextureImplementation.mtl", function(awesomeStuff) {
  console.log("Loaded");

  awesomeStuff.position.set(5, 3, -1);
  awesomeStuff.scale.set(0.2, 0.2, 0.2)
  centerAnchor.add(awesomeStuff);

  loading = false;
  document.body.appendChild(renderer.domElement);
  document.body.removeChild(document.getElementById("loading"));
});

// Create Snow

var snowGeometry = new THREE.Geometry(),
    snowflake    = THREE.ImageUtils.loadTexture((window.location.hash.slice(1) || "snowflake") + ".png"),
    snowMaterial = new THREE.PointCloudMaterial({
      size: 0.3,
      map: snowflake,
      opacity: 0.5,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      transparent: true
    }),
    snow         = new THREE.PointCloud(snowGeometry, snowMaterial);

snow.sortParticles = true;

for(var i=0;i<NUM_SNOWFLAKES;i++) {
  var vector = new THREE.Vector3(-25 + Math.random() * 50, -25 + Math.random() * 50, -25 + Math.random() * 50);
  vector.velocity = {
    x: -1 + Math.random() * 2,
    y: Math.random() / FALL_SPEED_QUOTIENT,
    z: -1 + Math.random() * 2,
    recalcIn: Math.round(Math.random() * 10)
  };
	snowGeometry.vertices.push(vector);
}

centerAnchor.add(snow);

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
scene.add(sky);


// Position camera

camera.position.set(0, 10, 40);
camAnchor.rotation.order = 'YXZ';
camAnchor.add(camera);
scene.add(camAnchor);

// Event listeners

var YAxis = new THREE.Vector3(0,1,0),
    XAxis = new THREE.Vector3(1,0,0);

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
	requestAnimationFrame(render);

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

  for(var i=0;i<NUM_SNOWFLAKES;i++) {
		snowGeometry.vertices[i].y -= snowGeometry.vertices[i].velocity.y;
    snowGeometry.vertices[i].x += snowGeometry.vertices[i].velocity.x / 100;
    snowGeometry.vertices[i].z += snowGeometry.vertices[i].velocity.z / 100;

    // Boundaries

    if(snowGeometry.vertices[i].x < -25) snowGeometry.vertices[i].x =  25;
    if(snowGeometry.vertices[i].x >  25) snowGeometry.vertices[i].x = -25;

    if(snowGeometry.vertices[i].z < -25) snowGeometry.vertices[i].z =  25;
    if(snowGeometry.vertices[i].z >  25) snowGeometry.vertices[i].z = -25;

    // Velocity recalc

    if(--snowGeometry.vertices[i].velocity.recalcIn == 0) {
      snowGeometry.vertices[i].velocity = {
        x: -1 + Math.random() * 2,
        y: Math.random() / FALL_SPEED_QUOTIENT,
        z: -1 + Math.random() * 2,
        recalcIn: Math.round(Math.random() * 10)
      };
    }

    // Reset

	if (snowGeometry.vertices[i].y < -25) {
      snowGeometry.vertices[i].x = -25 + Math.random() * 50;
		  snowGeometry.vertices[i].y =  10 + Math.random() * 15;
      snowGeometry.vertices[i].z = -25 + Math.random() * 50;

      snowGeometry.vertices[i].velocity = {
        x: -1 + Math.random() * 2,
        y: Math.random() / FALL_SPEED_QUOTIENT,
        z: -1 + Math.random() * 2,
        recalcIn: Math.round(Math.random() * 10)
      };

    }
  }

  // Automatic camera rotation

  if(!wasMoved) centerAnchor.rotation.y += 0.001;

  renderer.render(scene, camera);
}

render();
