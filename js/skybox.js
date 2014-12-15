var THREE = require('three');

module.exports = function(path, extension) {
  var tex = THREE.ImageUtils.loadTexture('StarryNightSky_compressed.jpg')

  var materialArray = [];
  for (var i = 0; i < 6; i++) {
    materialArray.push( new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide
    }));
  }

  // top and bottom shall have solid colours
  materialArray[2] = new THREE.MeshBasicMaterial({color: 0x121023});
  materialArray[3] = new THREE.MeshBasicMaterial({color: 0x121023});

  var skyGeo = new THREE.BoxGeometry(2000, 2000, 2000),
      skyMat = new THREE.MeshFaceMaterial(materialArray);
      sky = new THREE.Mesh(skyGeo, skyMat);

  return sky;
};
