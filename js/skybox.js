var THREE = require('three');

module.exports = function(path, extension) {
  var textures = {
    side1: THREE.ImageUtils.loadTexture(path + 'Side1B.' + extension),
    side2: THREE.ImageUtils.loadTexture(path + 'Side4B.' + extension),
    top:   THREE.ImageUtils.loadTexture(path + 'TopB.' + extension),
  }
  var directions  = ["side1", "side1", "top", "top", "side1", "side2"];

  var materialArray = [];
  for (var i = 0; i < 6; i++) {
    materialArray.push( new THREE.MeshBasicMaterial({
      map: textures[directions[i]],
      side: THREE.BackSide
    }));
  }


  var skyGeo = new THREE.BoxGeometry(2000, 2000, 2000),
      skyMat = new THREE.MeshFaceMaterial(materialArray);
      sky = new THREE.Mesh(skyGeo, skyMat);

  return sky;
};
