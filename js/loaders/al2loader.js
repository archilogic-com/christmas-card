    'use strict';

    // error types

    function JsonLoadError(url, xhr, textStatus, innerError) {
      this.name = 'JsonLoadError';
      this.message = 'Loading json failed for ' + url + '\n  textStatus = ' + textStatus + '\n  error = ' + innerError.name + '\n';

      this.details = {
        url: url,
        xhr: xhr,
        status: textStatus,
        innerError: innerError
      };
    }
    JsonLoadError.prototype = new Error();
    JsonLoadError.prototype.constructor = JsonLoadError;

    // dependencies

    var _ = require('underscore')
    var Q = require('q')
    var THREE = require('three')
    var $ = require('jquery')

    var parseGeometry = require('./json-al1/parse-geometry')
    var parseMaterial = require('./json-al1/parse-material')

    require("./dds/dds-loader");

    var ddsLoader = new THREE.DDSLoader();

    // settings

    var mapWhiteList = [
        {
            // 0: placeholder material
        },
        {
            // 1: preview JPG material
            mapDiffusePreview: true,
            mapLightPreview: true,
            mapBumpPreview: true,
            mapNormalPreview: true,
            mapSpecularPreview: true
        },
        {
            // 2: hi-res DDS material
            mapDiffuse: true,
            mapLight: true,
            mapSpecular: true,
            mapNormal: true,
            mapBump: true
        }
    ]

    // functions

    function log2(x){ return Math.log(x) / Math.LN2 }

    function handleError(error){
        if(error){
            console.error(error)
        }
    }

    function loadJsonFile(data){
        var d = Q.defer()
        $.ajax({
            url: data.url, //convertToShardedUrl(data.url),
            dataType: "json",
            success: function(json){
                data.json = json
                d.resolve(data)
            },
            error: function(jqXHR, textStatus, errorThrown){
                throw new JsonLoadError(data.url, jqXHR, textStatus, errorThrown);
            }
        })
        return d.promise
    }

    function loadTexture(data, fileName){

        var d = Q.defer()
        var url = data.urlBase + '/' + fileName

        //var url = convertToShardedUrl(url)

        var isCompressed = /\.dds$/i.test(fileName)

        if (isCompressed){

            // compressed texture in DDS format

            var xhr = new XMLHttpRequest()
            xhr.onload = function(event){

                if (this.status != 200){
                    console.error(this.status + ' - Loading dds failed: ' + url)
                    d.resolve({})
                    return
                }

                var buffer = xhr.response
                var dds = ddsLoader.parse(buffer, true);

                // check mipmap count
                var mipmapCount = log2(dds.width) + 1
                if (dds.mipmapCount != mipmapCount){
                    console.error('Reading DDS texture failed: ' + fileName + '\nmipmaps counted: ' + dds.mipmapCount + ', should be: ' + mipmapCount + '\nPlease make sure you have mipmap generation enabled when creating DDS textures from images.')
                    d.resolve({})
                    return
                }

                var textureData = {
                    dds: dds,
                    fileName: fileName
                }

                d.resolve(textureData)

            }
            xhr.open('GET', url, true)
            xhr.responseType = 'arraybuffer'
            xhr.send(null)

        } else {

            // any other image format

            var loader = new THREE.ImageLoader()
            loader.crossOrigin = "Anonymous"
            loader.load(url, function(image){

                // success

                var textureData = {
                    image: image,
                    fileName: fileName
                }

                d.resolve(textureData)

            }, undefined, function(event){

                // error
                console.error('Loading image failed: ' + url)
                d.resolve({})

            })

        }

        return d.promise
    }

    function createBufferGeometry(attributes) {
        var geometry = new THREE.BufferGeometry();

        for(var attrName in attributes) {
            var attr = attributes[attrName];
            var array = attrName === "index" ? new Uint16Array(attr.array) : new Float32Array(attr.array);
            geometry.addAttribute(attrName, new THREE.BufferAttribute(array, attr.size));
        }

        return geometry;
    }

    function createGeometry(data){
        var d = Q.defer()

        var meshes = data.json.meshes;

        var object = new THREE.Object3D();
        object.name = data.json.name;

        var matToObjs = data.materialToObjects = {};

        function parseMesh(meshJson) {
            var geometry = createBufferGeometry(meshJson.geometry);
            var material = meshJson.material;

            var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
                color: 0xffffff,
                opacity: 0.4,
                transparent: true,
                name: material ? material : "",
                levelOfDetail: 0
            }));

            mesh.name = meshJson.name;

            object.add(mesh);

            if(material) {
                if(!matToObjs[material]) {
                    var newEntry = matToObjs[material] = [];
                    newEntry.push(mesh);
                } else {
                    matToObjs[material].push(mesh);
                }
            }
        }

        meshes.forEach(function(mesh) {
            if(mesh.children) {
                mesh.children.forEach(parseMesh);
            } else {
                parseMesh(mesh);
            }
        });

        data.object3d = object;

        setUserData(data.object3d, data);
        // add to scene
        data.parent3d.add(data.object3d)
        data.viewModel.viewport.render()
        d.resolve(data);

        return d.promise
    }

    function setUserData(obj3d, data) {
        obj3d.traverse(function(o3d){
            // picking
            o3d.userData.picking = true
            // user data
            o3d.userData = _.extend(o3d.userData, data.userData)
            // shadows
            o3d.receiveShadow = data.receiveShadow
            o3d.castShadow = data.castShadow
        })
    }

    function createMaterials(data, levelOfDetail){
        var d = Q.defer()

        var allTexturePromises = {}

        _.each(data.json.materials, function(jsonMaterial, i){

            var texturePromises = {}

            // load textures

            _.each(jsonMaterial, function(fileName, type){
                if (mapWhiteList[levelOfDetail][type]){

                    if (!allTexturePromises[fileName]) allTexturePromises[fileName] = loadTexture(data, fileName)

                    texturePromises[fileName] = allTexturePromises[fileName]

                }
            })

            // when all material related preview textures are loaded -> create material

            Q.all(_.values(texturePromises)).then(function(textureCollection){

                parseMaterial(data.json.materialDefaults, jsonMaterial, textureCollection, levelOfDetail).then(function(material){
                    data.materialToObjects[material.name].forEach(function(mesh) {
                            var m = mesh.material;
                            // do not update material if object has been removed from scene in the meanwhile
                            if (!data.object3d.parent) return
                            mesh.material = material;

                            if (m.map) m.map.dispose();
                            if (m.alphaMap) m.alphaMap.dispose();
                            if (m.envMap) m.envMap.dispose();
                            if (m.lightMap) m.lightMap.dispose();
                            if (m.specularMap) m.specularMap.dispose();
                            if (m.normalMap) m.normalMap.dispose();
                            m.dispose();

                            if(textureCollection.length > 0) {
                                for(var attr in mesh.geometry.attributes) {
                                    if(attr === "uv" || attr === "uv2") {
                                        mesh.geometry.attributes[attr].needsUpdate = true;
                                    }
                                }
                            }

                            if (material instanceof THREE.ShaderMaterial) mesh.geometry.computeTangents()
                    });

                }).catch(handleError).done()

            }).catch(handleError).done()

        })

        // resolve promise when all textures are loaded

        Q.all(_.values(allTexturePromises)).then(function(textures){
            d.resolve(data)
        }).catch(handleError).done()

        return d.promise
    }

    function loadArchilogicJson(args){
        // API

        var parent3d = args.parent3d
        var viewModel = args.viewModel
        var url = args.url
        var completeCallback = args.complete || function(){}
        var errorCallback = args.error
        var receiveShadow = ( typeof args.receiveShadow != 'undefined' ) ? args.receiveShadow : false
        var castShadow = ( typeof args.castShadow != 'undefined' ) ? args.castShadow : false
        var picking = (args.picking !== undefined) ? args.picking : true
        var userData = args.userData || {}

        // normalize & default

        userData = _.extend(userData, { picking: picking })
        // internals

        var data = {
            viewModel: viewModel,
            url: url,
//            urlBase: getUrlBase(url),
            json: null,
            parent3d: parent3d,
            geometry: null,
            material: null,
            object3d: null,
            userData: userData,
            receiveShadow: receiveShadow,
            castShadow: castShadow,
            wireFrame: null
        }

        loadJsonFile(data)
            .then(function(data){
                // geometry & preview materials
                return Q.all([ createGeometry(data), createMaterials(data, 1) ])
            })
            .then(function(data){
                var d = Q.defer()

                data = data[0]

                //FIXME: add multiple callbacks for different loading states (onLoadedGeometry, onLoadedPreview, onLoadedComplete...)
                // callback
                completeCallback.call(data.object3d, data.object3d)

                // remove wireframe
                // FIXME - this crashes for some scenes and requires more testing
//                data.parent3d.remove(data.wireFrame)

                // hi-res materials
                if (viewModel.viewport.a.hiResTextures){
                        createMaterials(data, 2).then(function(){
                        d.resolve(data)
                    }).done()
                } else {

                    d.resolve(data)
                }

                return d.promise
            })
            .then(function(data){
                var d = Q.defer()
                d.resolve()
                return d.promise
            })
            .catch(handleError)
            .done()

    }

    module.exports = loadArchilogicJson

})
