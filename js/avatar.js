import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// window.onload = () => loadModel();

export function loadModel() {
  const loader = new GLTFLoader();
  loader.load('../static/model/mee.glb',
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
      console.error('Error loading the model:', error);
    }
  );
}

function setupScene(gltf) {
  try {
    const [renderer, container] = setupRenderer();
    const camera = setupCamera(container);
    // const axesHelper = createAxisHelper();
    const controls = setupControls(camera, renderer);
    const scene = new THREE.Scene(); // setupScene

    const [neurons, connections] = createNNVisualizer(scene);
    const [avatar, neck, waist] = createAvatar(gltf);
    const pedestal = createPedestal();
    const [stars, starGeometry] = createStarryBackground();

    setupLighting(scene); // Lighting
    // scene.add(axesHelper);
    scene.add(avatar);
    scene.add(pedestal);
    scene.add(stars);

    const mixer = avatarAnimations(avatar, gltf, container, camera);
    // setupMouseReactive(neck, waist);
    animate_wraper(avatar, mixer, renderer, scene, camera, starGeometry, neurons, connections);

  } catch (error) {
    console.log(error)
  }
}

function getMousePos(e) {
  return { x: e.clientX, y: e.clientY };
}

function degToRad(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

function moveJoint(mouse, joint, degreeLimit) {
  let degrees = getMouseDegrees(mouse.x, mouse.y + 60, degreeLimit);
  // console.log(degToRad(degrees.x))
  joint.rotation.y = degToRad(degrees.x);
  joint.rotation.x = degToRad(degrees.y);
}

function getMouseDegrees(x, y, degreeLimit) {
  let dx = 0,
    dy = 0,
    xdiff,
    xPercentage,
    ydiff,
    yPercentage;

  let w = { x: window.innerWidth, y: window.innerHeight };

  // Left (Rotates neck left between 0 and -degreeLimit)

  // 1. If cursor is in the left half of screen
  if (x <= w.x / 2) {
    // 2. Get the difference between middle of screen and cursor position
    xdiff = w.x / 2 - x;
    // 3. Find the percentage of that difference (percentage toward edge of screen)
    xPercentage = (xdiff / (w.x / 2)) * 100;
    // 4. Convert that to a percentage of the maximum rotation we allow for the neck
    dx = ((degreeLimit * xPercentage) / 100) * -1;
  }
  // Right (Rotates neck right between 0 and degreeLimit)
  if (x >= w.x / 2) {
    xdiff = x - w.x / 2;
    xPercentage = (xdiff / (w.x / 2)) * 100;
    dx = (degreeLimit * xPercentage) / 100;
  }
  // Up (Rotates neck up between 0 and -degreeLimit)
  if (y <= w.y / 2) {
    ydiff = w.y / 2 - y;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    // Note that I cut degreeLimit in half when she looks up
    dy = ((((degreeLimit * 0.5) * yPercentage) / 100) * -1) / 10;
  }

  // Down (Rotates neck down between 0 and degreeLimit)
  if (y >= w.y / 2) {
    ydiff = y - w.y / 2;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    dy = (((degreeLimit * yPercentage) / 100)) * 1.7;
  }
  return { x: dx, y: dy };
}

// Renderer
function setupRenderer() {
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
  return [renderer, container];
}

// Camera setup
function setupCamera(container) {
  const camera = new THREE.PerspectiveCamera(
    45, container.clientWidth / container.clientHeight);
  camera.position.set(0, 0.5, 3);
  return camera;
}

// Lighting
function setupLighting(scene) {
  //Lighting setupScene
  scene.add(new THREE.AmbientLight());
  //SpotLight
  const spotlight = new THREE.SpotLight(0xffffff, 20, 0, 5);
  spotlight.penumbra = 0.5;
  spotlight.position.set(0, 4, 2);
  spotlight.castShadow = true;
  scene.add(spotlight);


  const keyLight = new THREE.DirectionalLight(0xffffff, 3);
  keyLight.position.set(0, 0, 6);
  keyLight.lookAt(new THREE.Vector3());
  scene.add(keyLight);
}

// Axes helper
function createAxisHelper() {
  const axesHelper = new THREE.AxesHelper(50); // 5 is the length of the axes
  return axesHelper;
}

// Setup Controls
function setupControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minDistance = 3;
  controls.minPolarAngle = 1.4;
  controls.maxPolarAngle = 1.4;
  controls.target = new THREE.Vector3(0, 0.75, 0);
  controls.update();
  return controls;
}

// Create pedestal
function createPedestal() {
  const groundGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.03, 64);
  const textureLoader = new THREE.TextureLoader();
  const groundTexture = textureLoader.load('../static/images/pedestal.jpg');
  const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.castShadow = false;
  groundMesh.receiveShadow = true;
  groundMesh.position.y -= 0.05;
  return groundMesh;
  // scene.add(groundMesh);
}

// Create starry background
function createStarryBackground() {
  const starGeometry = new THREE.BufferGeometry();
  const vertices = [];

  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 4500;
    const y = (Math.random() - 0.5) * 4500;
    const z = Math.random() * 4500;
    vertices.push(x, y, z);
    const xa = (Math.random() - 0.5) * 4500;
    const ya = (Math.random() - 0.5) * 4500;
    const za = -Math.random() * 4500;
    vertices.push(xa, ya, za);
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
  const stars = new THREE.Points(starGeometry, starMaterial);

  return [stars, starGeometry];
}

//Load avatar
function createAvatar(gltf) {
  const avatar = gltf.scene;
  avatar.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  let neck;
  let waist;
  avatar.traverse(o => {
    if (o.isBone) {
      // console.log(o.name);
      if (o.name === 'Neck') {
        neck = o;
        // console.log("Found neck" + o);
      }
      if (o.name === 'Spine') {
        // console.log("Found neck" + o);
        waist = o;
      }
    }
  });
  return [avatar, neck, waist];
}

// Create FFNN visualization
function createNNVisualizer(scene) {
  const layerSizes = [3, 4, 4, 2]; // input, hidden, output
  const neurons = [];
  const connections = [];

  const verticalHeight = 1.7; // Adjust this value to change the vertical height of the network
  const horizontalHeight = 2.4; // Adjust this value to change the horizontal height of the network

  const neuronSize = 0.05; // Reduced size of the neuron spheres
  const connectionWidth = 0.02; // Reduced width of the connections

  for (let i = 0; i < layerSizes.length; i++) {
    const layer = [];

    for (let j = 0; j < layerSizes[i]; j++) {
      const neuron = new THREE.Mesh(new THREE.SphereGeometry(neuronSize, 32, 32), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
      neuron.position.set(i * 0.5 + horizontalHeight, j * 0.3 - (layerSizes[i] - 1) * 0.15 + verticalHeight, -1);
      neurons.push(neuron);
      scene.add(neuron);

      if (i > 0) {
        for (let k = 0; k < layerSizes[i - 1]; k++) {
          const connectionGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3((i - 1) * 0.5 + horizontalHeight, k * 0.3 - (layerSizes[i - 1] - 1) * 0.15 + verticalHeight, -1),
            new THREE.Vector3(i * 0.5 + horizontalHeight, j * 0.3 - (layerSizes[i] - 1) * 0.15 + verticalHeight, -1)
          ]);
          const connection = new THREE.Line(connectionGeometry, new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: connectionWidth }));
          connections.push(connection);
          scene.add(connection);
        }
      }
    }
  }
  return [neurons, connections];
}

// Make Avatar Responed to Mouse
function setupMouseReactive(neck, waist) {
  document.addEventListener('mousemove', function (e) {
    var mousecoords = getMousePos(e);
    // console.log(mousecoords);
    if (neck && waist) {
      moveJoint(mousecoords, neck, 50);
      moveJoint(mousecoords, waist, 25);
    }
  });
}

// Give Animations List and Actions
function getAnimations(mixer, clips) {
  const waveClip = THREE.AnimationClip.findByName(clips, 'waving');
  const standingClip = THREE.AnimationClip.findByName(clips, 'standing');
  // standingClip.tracks.splice(27, 3);
  // standingClip.tracks.splice(33, 3);
  const backflipClip = THREE.AnimationClip.findByName(clips, 'backflip');
  const danceClip = THREE.AnimationClip.findByName(clips, 'dance');
  const kickClip = THREE.AnimationClip.findByName(clips, 'kick');
  const punchClip = THREE.AnimationClip.findByName(clips, 'punch');


  const waveAction = mixer.clipAction(waveClip);
  const standingAcition = mixer.clipAction(standingClip);
  const backflipAcition = mixer.clipAction(backflipClip);
  const danceAction = mixer.clipAction(danceClip);
  const kickAction = mixer.clipAction(kickClip);
  const punchAction = mixer.clipAction(punchClip);
  return [waveAction, standingAcition, backflipAcition, danceAction, kickAction, punchAction];
}

// Switch Character Animations
function switchAvatarAnimation(changeAnimation, danceAction, backflipAcition, punchAction, kickAction, standingAcition) {
  if (changeAnimation === 1) {
    danceAction.reset();
    danceAction.play();
    standingAcition.crossFadeTo(danceAction, 0.3);

    setTimeout(() => {
      standingAcition.reset();
      standingAcition.play();
      danceAction.crossFadeTo(standingAcition, 1);
    }, 3000);
  } else if (changeAnimation === 2) {
    backflipAcition.reset();
    backflipAcition.play();
    standingAcition.crossFadeTo(backflipAcition, 0.1);

    setTimeout(() => {
      standingAcition.reset();
      standingAcition.play();
      backflipAcition.crossFadeTo(standingAcition, 0.3);
    }, 2000);
  } else if (changeAnimation === 3) {
    punchAction.reset();
    punchAction.play();
    standingAcition.crossFadeTo(punchAction, 0.3);

    setTimeout(() => {
      standingAcition.reset();
      standingAcition.play();
      punchAction.crossFadeTo(standingAcition, 1);
    }, 2000);
  } else if (changeAnimation === 4) {
    changeAnimation = 0;
    kickAction.reset();
    kickAction.play();
    standingAcition.crossFadeTo(kickAction, 0.3);

    setTimeout(() => {
      standingAcition.reset();
      standingAcition.play();
      kickAction.crossFadeTo(standingAcition, 1);
    }, 2000);
  }
  return changeAnimation
}

// Animate other things
function animate_wraper(avatar, mixer, renderer, scene, camera, starGeometry, neurons, connections) {
  const clock = new THREE.Clock();
  let colorUpdateCounter = 0;
  const colorUpdateDelay = 10;
  let angle = 0;
  const radius = 2.9; // Radius of the circular path
  let speed = 0.07; // Speed of avatar rotation
  function animate() {
    requestAnimationFrame(animate);
    mixer.update(clock.getDelta());

    [angle, speed] = camera_rotation_animation(avatar, camera, radius, angle, speed);
    stars_animation(starGeometry);
    colorUpdateCounter = nn_animation(neurons, connections, colorUpdateCounter, colorUpdateDelay);

    // controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

// Load and set Avatar animations
function avatarAnimations(avatar, gltf, container, camera) {
  const mixer = new THREE.AnimationMixer(avatar);
  const clips = gltf.animations;
  const [waveAction, standingAcition, backflipAcition, danceAction, kickAction, punchAction] = getAnimations(mixer, clips);
  let changeAnimation = 0;
  const raycaster = new THREE.Raycaster();
  container.addEventListener('mousedown', (ev) => {
    const coords = {
      x: (ev.offsetX / container.clientWidth) * 2 - 1,
      y: -(ev.offsetY / container.clientHeight) * 2 + 1
    };
    // console.log(coords);

    raycaster.setFromCamera(coords, camera);
    const intersections = raycaster.intersectObject(avatar);

    if (intersections.length > 0) {
      changeAnimation += 1;
      changeAnimation = switchAvatarAnimation(changeAnimation, danceAction, backflipAcition, punchAction, kickAction, standingAcition);
    }
  });
  waveAction.play();
  setTimeout(() => {
    standingAcition.reset();
    standingAcition.play();
    waveAction.crossFadeTo(standingAcition, 0.3);
  }, 2000);
  return mixer;
}

function nn_animation(neurons, connections, colorUpdateCounter, colorUpdateDelay) {
  // Neuron Animation
  neurons.forEach(neuron => {
    // Update color less frequently
    if (colorUpdateCounter % colorUpdateDelay === 0) {
      const scaleFactor = Math.random() * 0.5 + 0.5;
      neuron.material.color.setHex(Math.random() * 0xffffff);
      neuron.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
  });

  // Link Animation
  connections.forEach(connection => {
    // Update color less frequently
    if (colorUpdateCounter % colorUpdateDelay === 0) {
      connection.material.color.setHex(Math.random() * 0xffffff);
    }
  });
  // Increment color update counter
  colorUpdateCounter++;
  return colorUpdateCounter;
}

function stars_animation(starGeometry) {
  // Move stars over time
  const positions = starGeometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += (Math.random() - 0.5) * 0.1;  // x
    positions[i + 1] += (Math.random() - 0.5) * 0.1;  // y
    positions[i + 2] += 0.1;  // z

    // if (positions[i + 2] > 0) {
    //   positions[i + 2] = -2000;  // Reset z position
    // }
  }

  starGeometry.attributes.position.needsUpdate = true;
}

function camera_rotation_animation(avatar, camera, radius, angle, speed) {
  // Rotate camera around the avatar
  camera.position.x = radius * Math.sin(angle);
  camera.position.z = radius * Math.cos(angle);
  camera.lookAt(avatar.position.x, avatar.position.y + 0.8, avatar.position.z); // Keep the camera looking at the avatar
  angle += speed;
  if (angle + 0.3 >= (Math.PI * 2)) {
    speed = 0.001;
  }
  return [angle, speed];
}