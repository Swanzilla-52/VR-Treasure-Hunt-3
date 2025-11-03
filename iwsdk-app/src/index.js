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
  
} from '@iwsdk/core';

import {
  Interactable,
  PanelUI,
  ScreenSpace
} from '@iwsdk/core';

import { PanelSystem } from './panel.js'; // system for displaying "Enter VR" panel on Quest 1
import { EnvironmentNode } from 'three/webgpu';

const assets = {  
  Tree: {
    url: "/gltf/Tree/pine_tree.glb",
    type: AssetType.GLTF,
    priority: "critical",
  },
};

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
  const GroundEntity = world.createTransformEntity(Ground);
  GroundEntity.addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });

  const tree = AssetManager.getGLTF('pineTree');
  world.scene.add(tree.scene);
  tree.scene.position.set(0, 0, -3);
  tree.scene.scale.set(10, 10, 10);
  










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
