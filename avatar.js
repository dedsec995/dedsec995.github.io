import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

window.onload = () => loadModel();

function loadModel() {
  const loader = new GLTFLoader();
  loader.load('public/mee.glb',
    (gltf) => {
      setupScene(gltf);
      document.getElementById('avatar-loading').style.display = 'none';
    }, 
    (xhr) => {
      const percentCompletion = Math.round((xhr.loaded / xhr.total) * 100);
      document.getElementById('avatar-loading').innerText = `LOADING... ${percentCompletion}%`
      console.log(`Loading model... ${percentCompletion}%`);
    }, 
    (error) => {
      console.log(error);
    }
  );
}

function setupScene(gltf) {
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    const container = document.getElementById('avatar-container');
    renderer.setSize(container.clientWidth, container.clientHeight); // Change Size
    renderer.setPixelRatio(window.devicePixelRatio);
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Change Performace

    container.appendChild(renderer.domElement);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45, container.clientWidth / container.clientHeight);
    camera.position.set(0.2, 0.5, 1);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minDistance = 3;
    controls.minPolarAngle = 1.4;
    controls.maxPolarAngle = 1.4;
    controls.target = new THREE.Vector3(0, 0.75, 0);
    controls.update();

    //Scence setupScene
    const scene = new THREE.Scene();

    //Lighting setupScene
    scene.add(new THREE.AmbientLight());

    //SpotLight
    const spotlight = new THREE.SpotLight(0xffffff, 20, 8, 1);
    spotlight.penumbra = 0.5;
    spotlight.position.set(0, 4, 2);
    spotlight.castShadow = true;
    scene.add(spotlight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 4);
    keyLight.position.set(1, 1, 2);
    keyLight.lookAt(new THREE.Vector3());
    scene.add(keyLight);


    //Load avatar
    const avatar = gltf.scene;
    avatar.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(avatar);

    // Create pedestal
    const groundGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 64);
    const groundMaterial = new THREE.MeshStandardMaterial();
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.castShadow = false;
    groundMesh.receiveShadow = true;
    groundMesh.position.y -= 0.05;
    scene.add(groundMesh);

    // Load animations
    const mixer = new THREE.AnimationMixer(avatar);
    const clips = gltf.animations;
    const waveClip = THREE.AnimationClip.findByName(clips, 'waving');
    const almostFallingClip = THREE.AnimationClip.findByName(clips, 'almost_falling');
    const fallingClip = THREE.AnimationClip.findByName(clips, 'falling');
    const kickClip = THREE.AnimationClip.findByName(clips, 'kick');
    const punchClip = THREE.AnimationClip.findByName(clips, 'punch');
    const waveAction = mixer.clipAction(waveClip);
    const almostFallingAction = mixer.clipAction(almostFallingClip);
    const fallingAction = mixer.clipAction(fallingClip);
    const kickAction = mixer.clipAction(kickClip);
    const punchAction = mixer.clipAction(punchClip);

    let isStumbling = false;
    const raycaster = new THREE.Raycaster();
    container.addEventListener('mousedown', (ev) => {
        const coords = {
        x: (ev.offsetX / container.clientWidth) * 2 - 1,
        y: -(ev.offsetY / container.clientHeight) * 2 + 1
        };
        console.log(coords);
        
        raycaster.setFromCamera(coords, camera);
        const intersections = raycaster.intersectObject(avatar);
        
        if(intersections.length > 0){
            console.log('intersections');
            if (isStumbling) return;

            isStumbling = true;
            almostFallingAction.reset();
            almostFallingAction.play();
            waveAction.crossFadeTo(almostFallingAction, 0.3);

            setTimeout(() => {
            waveAction.reset();
            waveAction.play();
            almostFallingAction.crossFadeTo(waveAction, 1);
            setTimeout(() => isStumbling = false, 1000);
            }, 4000)
        }
    });
    
    const clock = new THREE.Clock();
    function animate(){
        requestAnimationFrame(animate);
        mixer.update(clock.getDelta());
        renderer.render(scene,camera);
    }
    animate();
    waveAction.play();
}