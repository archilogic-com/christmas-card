var THREE = require('three');

module.exports = function(path, extension) {
  // Creating skybox
  var directions  = ["right", "left", "top", "top", "front", "back"];

  var materialArray = [];
  for (var i = 0; i < 6; i++) {
    materialArray.push( new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture(path + directions[i] + '.' + extension),
      side: THREE.BackSide
    }));
  }
  materialArray[3] = new THREE.MeshBasicMaterial({color: 0x0f0f2b});

  var skyGeo = new THREE.BoxGeometry(2000, 2000, 2000),
      skyMat = new THREE.MeshFaceMaterial(materialArray);
      sky = new THREE.Mesh(skyGeo, skyMat);

  return sky;
};
