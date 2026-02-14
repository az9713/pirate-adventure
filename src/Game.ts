import * as THREE from 'three';
import { Engine } from './core/Engine';
import { GameLoop } from './core/GameLoop';
import { InputManager } from './core/InputManager';
import { assetLoader } from './core/AssetLoader';
import { eventBus } from './core/EventBus';
import { CameraController } from './camera/CameraController';
import { CharacterLoader } from './character/CharacterLoader';
import { AnimationStateMachine } from './character/AnimationStateMachine';
import { CharacterController } from './character/CharacterController';
import { NavMesh } from './navigation/NavMesh';
import { ClickToMove } from './navigation/ClickToMove';
import { HotspotManager } from './interaction/HotspotManager';
import { DialogueSystem } from './interaction/DialogueSystem';
import { LevelManager } from './level/LevelManager';
import { Background } from './level/Background';
import { AudioManager } from './audio/AudioManager';
import { UIOverlay } from './ui/UIOverlay';
import { DialogueBox } from './ui/DialogueBox';
import { EditorPanel } from './ui/EditorPanel';
import { LevelEditor } from './editor/LevelEditor';
import type { Vec3 } from './types/GameTypes';
import type { LevelData } from './types/LevelTypes';

export class Game {
  private htmlContainer: HTMLElement;
  private engine!: Engine;
  private loop!: GameLoop;
  private cameraController!: CameraController;
  private characterController!: CharacterController;
  private characterModel!: THREE.Group;
  private navMesh!: NavMesh;
  private clickToMove!: ClickToMove;
  private hotspotManager!: HotspotManager;
  private levelManager!: LevelManager;
  private audioManager!: AudioManager;
  private uiOverlay!: UIOverlay;
  private dialogueBox!: DialogueBox;
  private levelEditor!: LevelEditor;
  private inDialogue = false;

  constructor(container: HTMLElement) {
    this.htmlContainer = container;
  }

  async init(): Promise<void> {
    // Engine
    this.engine = new Engine(this.htmlContainer);
    this.loop = new GameLoop();

    // Camera
    this.cameraController = new CameraController(
      this.engine.camera,
      this.engine.renderer.domElement
    );

    // Input
    new InputManager(this.engine.renderer.domElement);

    // Audio
    this.audioManager = new AudioManager(this.engine.camera);

    // UI
    this.uiOverlay = new UIOverlay(this.htmlContainer);
    this.dialogueBox = new DialogueBox(this.uiOverlay.container);
    const editorPanel = new EditorPanel(this.uiOverlay.container);

    this.uiOverlay.setLoadingProgress(10);

    // Load character
    let charLoaded = false;
    try {
      const index = await assetLoader.loadIndex();
      this.uiOverlay.setLoadingProgress(30);
      const charDef = index.characters['pirate'];
      if (charDef) {
        const charLoader = new CharacterLoader();
        const loaded = await charLoader.load(charDef);
        this.characterModel = loaded.model;
        this.engine.scene.add(this.characterModel);
        const animSM = new AnimationStateMachine(loaded.mixer, loaded.clips);
        this.characterController = new CharacterController(this.characterModel, animSM);
        charLoaded = true;
      }
    } catch (e) {
      console.warn('Failed to load character, using fallback:', e);
    }

    if (!charLoaded) {
      this.characterModel = this.createFallbackCharacter();
      this.engine.scene.add(this.characterModel);
      const mixer = new THREE.AnimationMixer(this.characterModel);
      const animSM = new AnimationStateMachine(mixer, new Map());
      this.characterController = new CharacterController(this.characterModel, animSM);
    }

    this.uiOverlay.setLoadingProgress(50);

    // Navigation
    this.navMesh = new NavMesh();
    this.clickToMove = new ClickToMove(
      this.engine.camera,
      this.navMesh,
      this.characterController,
      this.engine.scene
    );

    // Hotspots
    this.hotspotManager = new HotspotManager(this.engine.scene);

    // Level
    const background = new Background(this.engine.scene);
    this.levelManager = new LevelManager(
      this.engine.scene,
      this.navMesh,
      this.hotspotManager,
      background,
      this.audioManager
    );

    // Dialogue system
    new DialogueSystem(this.dialogueBox, this.audioManager);

    // Editor
    this.levelEditor = new LevelEditor(
      this.engine.scene,
      this.engine.camera,
      this.engine.renderer.domElement
    );

    this.uiOverlay.setLoadingProgress(70);

    // Events
    eventBus.on('level:loaded', this.onLevelLoaded as (...args: unknown[]) => void);
    eventBus.on('dialogue:start', () => {
      this.inDialogue = true;
      this.clickToMove.setEnabled(false);
    });
    eventBus.on('dialogue:end', () => {
      this.inDialogue = false;
      this.clickToMove.setEnabled(true);
    });
    eventBus.on('transition:start', () => {
      this.uiOverlay.fadeToBlack();
      this.clickToMove.setEnabled(false);
    });
    eventBus.on('transition:end', () => {
      this.uiOverlay.fadeFromBlack();
      this.clickToMove.setEnabled(true);
    });

    // Load first level
    await this.levelManager.loadLevel('level_01');
    this.uiOverlay.setLoadingProgress(100);
    this.uiOverlay.hideLoading();

    // Start
    this.loop.addCallback((dt) => this.update(dt));
    this.loop.start();
  }

  private update(dt: number): void {
    this.cameraController.update();

    if (!this.inDialogue) {
      this.characterController.update(dt);
    }

    this.hotspotManager.update(dt, this.characterController.getPosition());

    // Follow camera
    const pos = this.characterModel.position;
    this.cameraController.setTarget(pos.x, pos.y + 1, pos.z);

    this.engine.render();
  }

  private onLevelLoaded = (data: LevelData, spawn: Vec3): void => {
    this.characterController.setPosition(spawn.x, spawn.y, spawn.z);
    this.characterController.stop();
    this.levelEditor.loadLevel(data);
  };

  private createFallbackCharacter(): THREE.Group {
    const group = new THREE.Group();

    const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcc6633 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    group.add(body);

    const headGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.4;
    head.castShadow = true;
    group.add(head);

    const hatGeo = new THREE.ConeGeometry(0.3, 0.4, 6);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 1.75;
    hat.castShadow = true;
    group.add(hat);

    return group;
  }

  dispose(): void {
    this.loop.stop();
    this.cameraController.dispose();
    this.clickToMove.dispose();
    this.hotspotManager.dispose();
    this.levelManager.dispose();
    this.audioManager.dispose();
    this.uiOverlay.dispose();
    this.dialogueBox.dispose();
    this.levelEditor.dispose();
    this.engine.dispose();
    eventBus.clear();
  }
}
