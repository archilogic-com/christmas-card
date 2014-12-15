module.exports = (function() {
  var instance = {}, hammertime, cam, camAnchor;
  var swingX = 0, swingY = 0, wasMoved = false;

  instance.init = function(camera, cameraAnchor) {
    var hammertime = new Hammer(document.body, {});

    cam = camera;
    camAnchor = cameraAnchor;

    hammertime.get('pinch').set({ enable: true });

    hammertime.on('pan', function(e) {
      var turnY = -Math.PI * 0.05 * (e.deltaX / window.innerWidth),
          turnX = -Math.PI * 0.05 * (e.deltaY / window.innerHeight);

      if(camAnchor) {
        camAnchor.rotation.y += turnY;
        camAnchor.rotation.x += turnX;
      } else {
        cam.rotation.y += turnY;
        cam.rotation.x += turnX;
      }
      swingX = turnX;
      swingY = turnY;

      wasMoved = true;
    });

    hammertime.on('pinchmove', function(e) {
      camera.position.z += 1 - e.scale;
      wasMoved = true;
    });

    window.addEventListener('wheel', function(e) {
      camera.position.z -= e.wheelDelta / 120;
      wasMoved = true;
    })
  };

  instance.update = function() {
    if(!camAnchor) camAnchor = cam;

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
  };

  instance.wasMoved = function() { return wasMoved; };

  return instance;
})();
