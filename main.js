var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    NUM_SNOWFLAKES = 2000,
    FALL_SPEED_QUOTIENT = 45;

var spin = 0,
    dragStart = 0,
    dragging  = false;

var scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000),
    loader = new THREE.OBJMTLLoader(),
    renderer = new THREE.WebGLRenderer({ antialias: true });

var loading = true,
    messageIndex = 0,
    messages = ['Making hot chocolate...', 'Baking cookies...', 'Singing Christmas carols...', 'Lighting candles...', 'Scaring away grinches...', 'Decorating Christmas tree..'];

setTimeout(function showLoadingMessage() {
  var h1 = document.querySelector("h1");
  if(h1) h1.textContent = messages[messageIndex++];

  if(messageIndex == messages.length) messageIndex = 0;
  if(loading) setTimeout(showLoadingMessage, 5000);
}, 5000);

renderer.setSize(WIDTH, HEIGHT);

// Make the renderer clear with black
renderer.setClearColor(0,0);

// Setup ligthing

var ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

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
scene.add(light);

// Create the glassy box

var box = new THREE.Object3D();

scene.add(box);

// Create awesomeness
var tmpMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
loader.load("model/XMASCard9_TextureImplementation.obj", "model/XMASCard9_TextureImplementation.mtl", function(awesomeStuff) {
  console.log("Loaded");
  awesomeStuff.traverse(function(child) {
    if(child instanceof THREE.Mesh) {
      child.material = tmpMaterial;
    }
  });
  awesomeStuff.position.set(5, 3, -1);
  awesomeStuff.scale.set(0.2, 0.2, 0.2)
  box.add(awesomeStuff);

  loading = false;
  document.body.appendChild(renderer.domElement);
  document.body.removeChild(document.getElementById("loading"));
});


// create Snow

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

box.add(snow);

// Position camera

camera.position.set(0, 10, 40);

// Event listeners
/*
window.addEventListener('mousedown', function(e) {
  dragStart = e.clientX;
  dragging = true;
});

window.addEventListener('mousemove', function(e) {
  if(!dragging) return;
  if(e.clientX < dragStart && spin > -WIDTH/10)
    spin -= 50;
  else if(e.clientX > dragStart && spin < WIDTH/10)
    spin += 50;

  dragStart = e.clientX;
});

window.addEventListener('mouseup', function(e) {
  dragging = false;
});

window.addEventListener('devicemotion', function(e) {
  if(e.rotationRate === null || e.rotationRate.alpha === null) return;
  spin += Math.round(e.rotationRate.alpha * -150);

  if(spin < -1000) {
    spin = -1000;
  } else if (spin > 1000) {
    spin = 1000;
  }
});

window.addEventListener("orientationchange", function() {
  if(window.orientation == 0) alert("Please view this in landscape mode!");
});
*/

// Go!

function render() {
	requestAnimationFrame(render);
  /*
  if(spin < 0) {
    //box.rotation.y -= spin / -5000;
    spin += 1;
  } else if(spin > 0) {
    //box.rotation.y += spin / 5000;
    spin -= 1;
  }
*/
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

  box.rotation.y += 0.001;

  renderer.render(scene, camera);
}

render();
