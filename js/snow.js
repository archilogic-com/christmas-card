import * as THREE from 'three'

export default (function () {
  var Snow = {}

  var NUM_SNOWFLAKES = 2000,
    FALL_SPEED_QUOTIENT = 45

  var snow, snowGeometry

  // Create Snow

  Snow.init = function (flakeImgUrl, numFlakes, fallSpeedQuotient) {
    if (numFlakes) NUM_SNOWFLAKES = numFlakes
    if (fallSpeedQuotient) FALL_SPEED_QUOTIENT = fallSpeedQuotient

    var snowflake = THREE.ImageUtils.loadTexture(flakeImgUrl),
      snowMaterial = new THREE.PointsMaterial({
        size: 0.3,
        map: snowflake,
        opacity: 0.5,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        transparent: true
      })

    ;(snowGeometry = new THREE.Geometry()), (snow = new THREE.Points(snowGeometry, snowMaterial))

    snow.sortParticles = true

    for (var i = 0; i < NUM_SNOWFLAKES; i++) {
      var vector = new THREE.Vector3(
        -25 + Math.random() * 50,
        -25 + Math.random() * 50,
        -25 + Math.random() * 50
      )
      vector.velocity = {
        x: -1 + Math.random() * 2,
        y: Math.random() / FALL_SPEED_QUOTIENT,
        z: -1 + Math.random() * 2,
        recalcIn: Math.round(Math.random() * 10)
      }
      snowGeometry.vertices.push(vector)
    }
  }

  Snow.getObject = function () {
    return snow
  }

  Snow.update = function () {
    // console.log('snow update')
    for (var i = 0; i < NUM_SNOWFLAKES; i++) {
      snowGeometry.vertices[i].y -= snowGeometry.vertices[i].velocity.y
      snowGeometry.vertices[i].x += snowGeometry.vertices[i].velocity.x / 100
      snowGeometry.vertices[i].z += snowGeometry.vertices[i].velocity.z / 100

      // Boundaries

      if (snowGeometry.vertices[i].x < -25) snowGeometry.vertices[i].x = 25
      if (snowGeometry.vertices[i].x > 25) snowGeometry.vertices[i].x = -25

      if (snowGeometry.vertices[i].z < -25) snowGeometry.vertices[i].z = 25
      if (snowGeometry.vertices[i].z > 25) snowGeometry.vertices[i].z = -25

      // Velocity recalc

      if (--snowGeometry.vertices[i].velocity.recalcIn == 0) {
        snowGeometry.vertices[i].velocity = {
          x: -1 + Math.random() * 2,
          y: Math.random() / FALL_SPEED_QUOTIENT,
          z: -1 + Math.random() * 2,
          recalcIn: Math.round(Math.random() * 10)
        }
      }

      // Reset

      if (snowGeometry.vertices[i].y < -25) {
        snowGeometry.vertices[i].x = -25 + Math.random() * 50
        snowGeometry.vertices[i].y = 10 + Math.random() * 15
        snowGeometry.vertices[i].z = -25 + Math.random() * 50

        snowGeometry.vertices[i].velocity = {
          x: -1 + Math.random() * 2,
          y: Math.random() / FALL_SPEED_QUOTIENT,
          z: -1 + Math.random() * 2,
          recalcIn: Math.round(Math.random() * 10)
        }
      }
    }

    snowGeometry.verticesNeedUpdate = true
  }

  return Snow
})()
