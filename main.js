/**
     --------------------------------
    |   INFORMACIÓN  DEL  PROYECTO   |
     --------------------------------

    Autores:		
                    + <matricula> - Manuel Hernandez de la Rosa
                    + <matricula> - Diego Leonel Matamoros Pérez.
                    + 201905400 - César Rojas Juárez
                    + <matricula> - Angel Jimenez Javier.


    Propósito:		1. Importar modelos y animaciones 3D en Blender
                    2. Programar una aplicación Web interactiva
                    3. Permitir al usuario interactuar con modelos y animaciones

    Versión bases:	three.js: https://threejs.org/examples/?q=skinning#webgl_animation_skinning_morph
**/

import * as THREE from "./build/three.module.js";
import Stats from "./src/jsm/libs/stats.module.js";
import { GUI } from "./src/jsm/libs/dat.gui.module.js";
import { OrbitControls } from "./src/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./src/jsm/loaders/GLTFLoader.js";

let container, stats, clock, gui, mixer, mixer2, actions1, actions2, activeAction, previousAction;
let camera, scene, renderer, model, model2;
let torreModel, pinoModel1, pinoModel2, pinoModel3;

const api = { ciclo: "ocio" };

init();
animate();

function init() {
    container = document.createElement("div");
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.25,
        100
    );
    camera.position.set(-5, 3, 10);
    camera.lookAt(new THREE.Vector3(0, 2, 0));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x90aede);
    scene.fog = new THREE.Fog(0x90aede, 12, 17);

    clock = new THREE.Clock();

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    const floorMesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(20, 20),
        new THREE.MeshPhongMaterial({ color: 0x0e370c, depthWrite: false })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    scene.add(floorMesh);

    const grid = new THREE.GridHelper(10, 4, 0xff0000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;

    gui = new GUI();

    const loader = new GLTFLoader();
    loader.load(
        "./src/models/gltf/persona/persona.glb",
        function (gltf) {
            model = gltf.scene;
            scene.add(model);
            createGUI(model, gltf.animations);
        },
        undefined,
        function (e) {
            console.error(e);
        }
    );

    loader.load('./src/models/gltf/persona/Animaciones.glb', function (gltf) {
        model2 = gltf.scene;
        model2.visible = false;
        GUI_capturas(model2, gltf.animations);
    });

    loader.load(
        "./src/models/gltf/torre_mejorada_pintada.glb",
        function (gltf) {
            torreModel = gltf.scene;
            torreModel.scale.set(0.8, 1.0, 0.8);
            torreModel.position.set(5, 0, -5);

            let torreIzq = torreModel.clone();
            torreIzq.position.set(-5, 0, -5);
            scene.add(torreModel);
            scene.add(torreIzq);
        },
        undefined,
        function (e) {
            console.error(e);
        }
    );

    loader.load(
        "./src/models/gltf/muro.glb",
        function (gltf) {
            let muro = gltf.scene;
            muro.scale.set(1.4, 1.2, 1);
            muro.position.set(0, 0, -5);
            scene.add(muro);
        },
        undefined,
        function (e) {
            console.error(e);
        }
    );

    loader.load(
        "./src/models/gltf/pinos/pino1.glb",
        function (gltf) {
            pinoModel1 = gltf.scene;
            pinoModel1.scale.set(0.5, 0.5, 0.5);
            pinoModel1.position.set(-7, 0, -1);
            scene.add(pinoModel1);
        },
        undefined,
        function (e) {
            console.error(e);
        }
    );

    loader.load(
        "./src/models/gltf/pinos/pino2.glb",
        function (gltf) {
            pinoModel2 = gltf.scene;
            pinoModel2.scale.set(0.3, 0.3, 0.3);
            pinoModel2.position.set(-6, 0, -3);
            scene.add(pinoModel2);
        },
        undefined,
        function (e) {
            console.error(e);
        }
    );

    loader.load(
        "./src/models/gltf/pinos/pino3.glb",
        function (gltf) {
            pinoModel3 = gltf.scene;
            pinoModel3.scale.set(0.5, 0.5, 0.5);
            pinoModel3.position.set(6, 0, -3);
            scene.add(pinoModel3);
        },
        undefined,
        function (e) {
            console.error(e);
        }
        
    );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    window.addEventListener("resize", onWindowResize, false);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set(0, 2, 0);
    controls.update();

    stats = new Stats();
    container.appendChild(stats.dom);

    const grassGeometry = new THREE.CylinderGeometry(0.05, 0.1, 0.5, 3);
    const grassMaterial = new THREE.MeshToonMaterial({ 
       color:   0x0e370c, 
       flatShading: true
    });

    const grassCount = 4000;
    const instancedMesh = new THREE.InstancedMesh(grassGeometry, grassMaterial, grassCount);

    for (let i = 0; i < grassCount; i++) {
        const position = new THREE.Vector3(
            Math.random() * 20 - 10,
            0,
            Math.random() * 20 - 10
        );
        const rotation = new THREE.Euler(0, Math.random() * Math.PI * 2, 0);

        const matrix = new THREE.Matrix4();
        matrix.makeTranslation(position.x, position.y, position.z);
        matrix.multiply(new THREE.Matrix4().makeRotationFromEuler(rotation)); 

        instancedMesh.setMatrixAt(i, matrix);
    }

    scene.add(instancedMesh);
}

function GUI_capturas(model2, animations) {
    const capturas = ["Caminar", "Gallina", "Huracan", "Vuelta", "Backflip"];
    mixer2 = new THREE.AnimationMixer(model2);
    actions2 = {};

    for (let i = 0; i < animations.length; i++) {
        const clip = animations[i];
        const action = mixer2.clipAction(clip);
        actions2[clip.name] = action;
        if (capturas.indexOf(clip.name) >= 0) {
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
        }
    }

    scene.add(model2);

    const capturaFolder = gui.addFolder("Captura de Movimiento");

    function crearCapturaCallback(name) {
        api[name] = function () {
            model2.visible = true;
            model.visible = false;
            fadeToAction(name, 0.2, actions2);
            mixer.addEventListener("finished", restoreState);
        };
        capturaFolder.add(api, name);
    }

    function restoreState() {
        mixer.removeEventListener("finished", restoreState);
        fadeToAction(api.ciclo, 0.2);
    }

    for (let i = 0; i < capturas.length; i++) {
        crearCapturaCallback(capturas[i]);
    }

    capturaFolder.open();
    activeAction = actions2["Gallina"];
    activeAction.play();
}

function createGUI(model, animations) {
    const ciclos = ["ocio", "caminar", "saltar", "roblox", "saludar"];
    mixer = new THREE.AnimationMixer(model);
    actions1 = {};

    for (let i = 0; i < animations.length; i++) {
        const clip = animations[i];
        const action = mixer.clipAction(clip);
        actions1[clip.name] = action;
    }

    const ciclosFolder = gui.addFolder("Ciclos de animación");
    const clipCtrl = ciclosFolder.add(api, "ciclo").options(ciclos);

    clipCtrl.onChange(function () {
        fadeToAction(api.ciclo, 0.5, actions1);
        if (model2.visible) {
            model2.visible = false;
            model.visible = true;
        }
    });

    ciclosFolder.open();
    activeAction = actions1["ocio"];
    activeAction.play();
}

function fadeToAction(name, duration, actions) {
    previousAction = activeAction;
    activeAction = actions[name];

    if (previousAction !== activeAction) {
        previousAction.fadeOut(duration);
    }

    activeAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    const dt = clock.getDelta();

    if (mixer) mixer.update(dt);
    if (mixer2) mixer2.update(dt);

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    stats.update();
}