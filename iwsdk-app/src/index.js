import {
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  EnvironmentType,
  LocomotionEnvironment,
  SessionMode,
  World,
  AssetType,
  AssetManager,
  DirectionalLight,
  Scene,
  AmbientLight,
  SphereGeometry,
  
} from '@iwsdk/core';

import {
  Interactable,
  PanelUI,
  ScreenSpace
} from '@iwsdk/core';

import { PanelSystem } from './panel.js'; // system for displaying "Enter VR" panel on Quest 1

const assets = {
  furtree: {                                // <----------------------- added plant model
    url: '/gltf/Tree/oak_tree.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },

 };//

World.create(document.getElementById('scene-container'), {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    offer: 'always',
    features: { }
  },

  features: {
    locomotion: {
      smooth: true,
      teleport: true,
      speed: 1.5,
      teleportDistance: 2.5,
    },
   },
}).then((world) => {

  const { camera } = world;
  


  const GroundGeometry = new PlaneGeometry(40, 40);
  const GroundMaterial = new MeshStandardMaterial({ color: 0x377F03 });
  const Ground = new Mesh(GroundGeometry, GroundMaterial);
  Ground.rotation.x = -Math.PI / 2;
  Ground.receiveShadow = true;
  const GroundEntity = world.createTransformEntity(Ground);
  GroundEntity.addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });
  
  const treeModel = AssetManager.getGLTF('furtree').scene;
  treeModel.castShadow = true;
  treeModel.receiveShadow = true;
  const treeEntity = world.createTransformEntity(treeModel);
  treeEntity.object3D.position.set(-1, 0, -1);


  const sphereGeometry = new SphereGeometry(0.25, 32, 32);
  const sphereMaterial = new MeshStandardMaterial({ color: 0xff0000 }); // red
  
  const sphere = new Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(0, 0.5, -2);
  const sphereEntity = world.createTransformEntity(sphere);

  const sphere1 = new Mesh(sphereGeometry, sphereMaterial);
  sphere1.position.set(1, 0.5, -2);
  const sphere1Entity = world.createTransformEntity(sphere1);

  const sphere2 = new Mesh(sphereGeometry, sphereMaterial);
  sphere2.position.set(2, 0.5, -2);
  const sphere2Entity = world.createTransformEntity(sphere2);

  let numsFound = 0;

  sphereEntity.addComponent(Interactable);
  sphereEntity.object3D.addEventListener("pointerdown", removeObject);
  function removeObject() {
    sphereEntity.destroy();
    numsFound += 1;
  };
  
  const sun = new DirectionalLight(0xffffff, 1.5);
  sun.position.set(5, 10, 7);
  sun.castShadow = true;
  scene.add(sun);

  const ambient = new AmbientLight(0x404040, 1.2);
  scene.add(ambient);
  









  // vvvvvvvv EVERYTHING BELOW WAS ADDED TO DISPLAY A BUTTON TO ENTER VR FOR QUEST 1 DEVICES vvvvvv
  //          (for some reason IWSDK doesn't show Enter VR button on Quest 1)
  world.registerSystem(PanelSystem);
  
  if (isMetaQuest1()) {
    const panelEntity = world
      .createTransformEntity()
      .addComponent(PanelUI, {
        config: '/ui/welcome.json',
        maxHeight: 0.8,
        maxWidth: 1.6
      })
      .addComponent(Interactable)
      .addComponent(ScreenSpace, {
        top: '20px',
        left: '20px',
        height: '40%'
      });
    panelEntity.object3D.position.set(0, 1.29, -1.9);
  } else {
    // Skip panel on non-Meta-Quest-1 devices
    // Useful for debugging on desktop or newer headsets.
    console.log('Panel UI skipped: not running on Meta Quest 1 (heuristic).');
  }
  function isMetaQuest1() {
    try {
      const ua = (navigator && (navigator.userAgent || '')) || '';
      const hasOculus = /Oculus|Quest|Meta Quest/i.test(ua);
      const isQuest2or3 = /Quest\s?2|Quest\s?3|Quest2|Quest3|MetaQuest2|Meta Quest 2/i.test(ua);
      return hasOculus && !isQuest2or3;
    } catch (e) {
      return false;
    }
  }

});
