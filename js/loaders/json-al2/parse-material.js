define(function(require, exports, module){

    'use strict';

    // dependencies

    var _ = require('underscore')
    var Q = require('q')
    var THREE = require('three')
    var log = console.log; //require('log')

    require('../dds');

    // functions

    function nearest_pow2(n){
        return Math.pow(2, Math.round(Math.log(n) / Math.LN2))
    }

    function rgb2hex(rgb){
        return ( rgb[ 0 ] * 255 << 16 ) + ( rgb[ 1 ] * 255 << 8 ) + rgb[ 2 ] * 255;
    }

    function create_texture(textureCollection, target, name, sourceFile, repeat, offset, wrap, anisotropy){
        var input = _.findWhere(textureCollection, { fileName: sourceFile }),
            texture = null;

        if (!input) {

            log('texture not found: '+sourceFile)
            return undefined

        } else if (input.dds){

            // compressed texture

            texture = new THREE.CompressedTexture()

            var dds = input.dds

            texture.format = dds.format
            texture.mipmaps = dds.mipmaps
            texture.image.width = dds.width
            texture.image.height = dds.height

            // gl.generateMipmap fails for compressed textures
            // mipmaps must be embedded in the DDS file
            // or texture filters must not use mipmapping

            texture.generateMipmaps = false

        } else if (input.image) {

            // uncompressed texture

            texture = new THREE.Texture()

            var image = input.image

            // correct power of two
            if (THREE.Math.isPowerOfTwo(image.width) === false || THREE.Math.isPowerOfTwo(image.height) === false){

                var width = nearest_pow2(image.width)
                var height = nearest_pow2(image.height)

                var canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height
                canvas.getContext('2d').drawImage(image, 0, 0, width, height)

                texture.image = canvas
            } else {
                texture.image = image
            }

        } else {
            //log('not supported:',sourceFile)
            return undefined

        }

        texture.sourceFile = sourceFile

        if (repeat){
            texture.repeat.set(repeat[ 0 ], repeat[ 1 ])
            if (repeat[0] !== 1) texture.wrapS = THREE.RepeatWrapping
            if (repeat[1] !== 1) texture.wrapT = THREE.RepeatWrapping
        }

        if (offset) texture.offset.set(offset[ 0 ], offset[ 1 ]);

        if (wrap){
            var wrapMap = {
                "repeat": THREE.RepeatWrapping,
                "mirror": THREE.MirroredRepeatWrapping
            }
            if (wrapMap[ wrap[ 0 ] ] !== undefined) texture.wrapS = wrapMap[ wrap[ 0 ] ];
            if (wrapMap[ wrap[ 1 ] ] !== undefined) texture.wrapT = wrapMap[ wrap[ 1 ] ];
        }

        if (anisotropy) texture.anisotropy = anisotropy

        texture.needsUpdate = true

        target[name] = texture

    }

    function parseMaterial(jsonMaterialDefaults, jsonMaterial, textureCollection, levelOfDetail){
        var d = Q.defer()

        var hiRes = (levelOfDetail > 1)

        jsonMaterial = _.defaults(jsonMaterial, jsonMaterialDefaults)

        var m = jsonMaterial

        // defaults

        var mtype = "MeshLambertMaterial";
        var mpars = { color: 0xeeeeee, opacity: 1.0, map: null, lightMap: null, normalMap: null, bumpMap: null, wireframe: false };

        // parameters from model file

        if (m.shading){
            var shading = m.shading.toLowerCase()
            if (shading === "phong"){
                mtype = "MeshPhongMaterial"
            }
            else if (shading === "basic"){
                mtype = "MeshBasicMaterial"
            }
        }

        if (m.blending !== undefined && THREE[ m.blending ] !== undefined) mpars.blending = THREE[ m.blending ]

        if (m.transparent) {
            if(m.transparency < 1.0) {
                mpars.transparent = true;
                mpars.opacity = m.transparency;
            } else {
                mpars.transparent = false;
                mpars.opacity = 1;
            }
        } else {
              mpars.transparent = false;
              mpars.opacity = 1;
        }

        if (m.depthTest !== undefined) mpars.depthTest = m.depthTest
        if (m.depthWrite !== undefined) mpars.depthWrite = m.depthWrite
        if (m.visible !== undefined) mpars.visible = m.visible
        if (m.flipSided !== undefined) mpars.side = THREE.BackSide
        if (m.doubleSided !== undefined) mpars.side = THREE.DoubleSide
        if (m.wireframe !== undefined) mpars.wireframe = m.wireframe

        if (m.vertexColors !== undefined){
            if (m.vertexColors === "face"){
                mpars.vertexColors = THREE.FaceColors
            } else if (m.vertexColors){
                mpars.vertexColors = THREE.VertexColors
            }
        }

        // colors

        if (m.colorDiffuse){
            mpars.color = rgb2hex(m.colorDiffuse);
        } else if (m.DbgColor){
            mpars.color = m.DbgColor
        }

        if (m.colorSpecular) mpars.specular = rgb2hex(m.colorSpecular)
        if (m.colorAmbient) mpars.ambient = rgb2hex(m.colorAmbient)
        if (m.colorEmissive) mpars.emissive = rgb2hex(m.colorEmissive)

        // modifiers

        if (hiRes && m.specularCoef !== undefined) mpars.shininess = m.specularCoef

        // textures

        if (hiRes) {
            if (m.mapDiffuse) create_texture(textureCollection, mpars, "map", m.mapDiffuse, m.mapDiffuseRepeat, m.mapDiffuseOffset, m.mapDiffuseWrap, m.mapDiffuseAnisotropy)
            if (m.mapLight) create_texture(textureCollection, mpars, "lightMap", m.mapLight, m.mapLightRepeat, m.mapLightOffset, m.mapLightWrap, m.mapLightAnisotropy)
            if (m.mapBump) create_texture(textureCollection, mpars, "bumpMap", m.mapBump, m.mapBumpRepeat, m.mapBumpOffset, m.mapBumpWrap, m.mapBumpAnisotropy)
            if (m.mapNormal) create_texture(textureCollection, mpars, "normalMap", m.mapNormal, m.mapNormalRepeat, m.mapNormalOffset, m.mapNormalWrap, m.mapNormalAnisotropy)
            if (m.mapSpecular) create_texture(textureCollection, mpars, "specularMap", m.mapSpecular, m.mapSpecularRepeat, m.mapSpecularOffset, m.mapSpecularWrap, m.mapSpecularAnisotropy)
        } else {
            if (m.mapDiffusePreview) create_texture(textureCollection, mpars, "map", m.mapDiffusePreview, m.mapDiffuseRepeat, m.mapDiffuseOffset, m.mapDiffuseWrap, undefined)
            if (m.mapLightPreview) create_texture(textureCollection, mpars, "lightMap", m.mapLightPreview, m.mapLightRepeat, m.mapLightOffset, m.mapLightWrap, undefined)
            if (m.mapBumpPreview) create_texture(textureCollection, mpars, "bumpMap", m.mapBumpPreview, m.mapBumpRepeat, m.mapBumpOffset, m.mapBumpWrap, undefined)
            if (m.mapNormalPreview) create_texture(textureCollection, mpars, "normalMap", m.mapNormalPreview, m.mapNormalRepeat, m.mapNormalOffset, m.mapNormalWrap, undefined)
            if (m.mapSpecularPreview) create_texture(textureCollection, mpars, "specularMap", m.mapSpecularPreview, m.mapSpecularRepeat, m.mapSpecularOffset, m.mapSpecularWrap, undefined)
        }

        //

        if (m.mapBumpScale !== undefined) mpars.bumpScale = m.mapBumpScale
        if (m.mapNormalScale !== undefined) mpars.normalScale = new THREE.Vector2(m.mapNormalScale, m.mapNormalScale)

        var material = new THREE[ mtype ](mpars)

        //

        if (m.mapLight) {
            material.enhancedLightMap = {
                intensity: m.mapLightIntensity || 1,
                center: m.mapLightCenter || 0.5,
                falloff: m.mapLightFalloff || 0
            }
        }

        if (m.DbgName !== undefined) material.name = m.DbgName
        // json v2
        if (m.name !== undefined) material.name = m.name

        d.resolve(material)

        return d.promise

    }

    // API

    module.exports = parseMaterial

})
