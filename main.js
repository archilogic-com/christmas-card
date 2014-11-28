var WIDTH = document.body.clientWidth,
    HEIGHT = document.body.clientHeight,
    NUM_SNOWFLAKES = 10000,
    FALL_SPEED_QUOTIENT = 10;

var spin = 0,
    dragStart = 0,
    dragging  = false;

var scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000),
    renderer = new THREE.WebGLRenderer();

document.body.appendChild(renderer.domElement);

// React to silly browsers...
WIDTH = document.body.clientWidth;
HEIGHT = document.body.clientHeight;
renderer.setSize(WIDTH, HEIGHT);

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

// Add a random cube...

var geometry = new THREE.CubeGeometry(1, 1, 1);
var material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

// Create the glassy box

var box = new THREE.Mesh(
  new THREE.CubeGeometry(50, 50, 50),
  new THREE.MeshLambertMaterial({
    color: 0x80aaff,
    reflectivity: .8,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  })
);

scene.add(box);

// create ground

var groundGeometry = new THREE.CubeGeometry(49, 5, 49),
    groundMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide}),
    ground = new THREE.Mesh(groundGeometry,groundMaterial);

ground.position.set(0, -22.5, 0);
box.add(ground);
//scene.add(ground);

// create Snow

var snowGeometry = new THREE.Geometry(),
    snowMaterial = new THREE.PointCloudMaterial({ color: 0xffffff, size: 0.1 }),
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

//scene.add(snow);
box.add(snow);

// Position camera

camera.position.set(0,0,80);

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

  box.rotation.y += 0.005;

	renderer.render(scene, camera);
}

render();
