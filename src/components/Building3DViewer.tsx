import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Camera,
  Compass,
  Eye,
  EyeOff,
  Home,
  Layers,
  Maximize2,
  Minimize2,
  Move,
  Palette,
  RotateCcw,
  Sofa,
  Sparkles,
  Sun,
  Download,
  Navigation,
  Box,
  Sliders,
  Check,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Info,
  Printer,
} from 'lucide-react';
import {
  CAMERA_PRESETS_3D,
  CameraPresetId,
  findRoomAtPoint3D,
  FLOOR_COLOR_SWATCHES,
  getRooms3DMetadata,
  isWalkthroughPositionValid,
  LayerVisibility3D,
  MaterialCustomization3D,
  ROOF_COLOR_SWATCHES,
  Room3DMetadata,
  ViewMode3D,
  WALL_COLOR_SWATCHES,
} from '../utils/building3DGeometry';
import { buildArchitecturalScene3D, SceneLayerGroups } from '../utils/building3DSceneBuilder';
import { SiteResolutionConfig } from '../utils/architecturalMath';

interface Building3DViewerProps {
  siteConfig: SiteResolutionConfig;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
  onSwitchTo2DSheet?: (sheetId: string) => void;
  onOpenPrintModal?: (defaultScope?: '3d-views') => void;
  onRegisterSnapshotGetter?: (getter: () => string | null) => void;
}

export const Building3DViewer: React.FC<Building3DViewerProps> = ({
  siteConfig,
  selectedRoomId,
  onSelectRoom,
  onSwitchTo2DSheet,
  onOpenPrintModal,
  onRegisterSnapshotGetter,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const perspCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const activeCameraRef = useRef<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const layersRef = useRef<SceneLayerGroups | null>(null);
  const requestRenderRef = useRef<(() => void) | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode3D>('complete');
  const [activePreset, setActivePreset] = useState<CameraPresetId>('rear-north');
  const [isOrthographic, setIsOrthographic] = useState(false);
  const [explodedFactor, setExplodedFactor] = useState(0); // 0 to 1
  const [isFurnished, setIsFurnished] = useState(true);
  const [daylightHour, setDaylightHour] = useState<'morning' | 'midday' | 'golden'>('midday');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hideHud, setHideHud] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'room' | 'materials' | 'analysis'>('room');
  const [walkRoomName, setWalkRoomName] = useState<string>('Front Verandah');

  const [layerVis, setLayerVis] = useState<LayerVisibility3D>({
    roof: true, // Default to complete 12° split-level roof view immediately on load
    ceiling: true,
    externalWalls: true,
    internalWalls: true,
    doors: true,
    windows: true,
    furniture: true,
    labels: false, // Hide interior floating room badges when solid roof is on; enabled automatically in open-roof/plan modes
    lighting: true,
    landscaping: true,
  });

  const [customColors, setCustomColors] = useState<MaterialCustomization3D>({
    wallColorHex: WALL_COLOR_SWATCHES[0].hex,
    wallName: WALL_COLOR_SWATCHES[0].name,
    floorColorHex: FLOOR_COLOR_SWATCHES[0].hex,
    floorName: FLOOR_COLOR_SWATCHES[0].name,
    roofColorHex: ROOF_COLOR_SWATCHES[0].hex,
    roofName: ROOF_COLOR_SWATCHES[0].name,
  });

  const roomsList = getRooms3DMetadata();
  const activeRoomMeta: Room3DMetadata =
    roomsList.find((r) => r.id === selectedRoomId) ??
    roomsList.find((r) => r.id === 'living') ??
    roomsList[0];

  // Camera animation target refs
  const camTargetPosRef = useRef<THREE.Vector3 | null>(null);
  const camTargetLookRef = useRef<THREE.Vector3 | null>(null);
  const currentExplodedRef = useRef<number>(0);
  const targetExplodedRef = useRef<number>(0);

  // Walkthrough state refs
  const walkPosRef = useRef<THREE.Vector3>(new THREE.Vector3(5.025, 1.62, 10.2));
  const walkYawRef = useRef<number>(0); // 0 = looking North (-Z)
  const walkPitchRef = useRef<number>(-0.05);
  const keysPressedRef = useRef<Record<string, boolean>>({});
  const viewModeRef = useRef<ViewMode3D>(viewMode);
  viewModeRef.current = viewMode;

  // Apply viewMode presets to layer visibility & camera
  const applyViewMode = useCallback((mode: ViewMode3D) => {
    setViewMode(mode);
    viewModeRef.current = mode;

    if (mode === 'complete') {
      setIsOrthographic(false);
      targetExplodedRef.current = 0;
      setExplodedFactor(0);
      setLayerVis((prev) => ({
        ...prev,
        roof: true,
        ceiling: true,
        externalWalls: true,
        internalWalls: true,
        labels: false,
      }));
      camTargetPosRef.current = new THREE.Vector3(-3.2, 3.15, -11.6);
      camTargetLookRef.current = new THREE.Vector3(4.8, 1.85, 3.2);
    } else if (mode === 'roof-removed') {
      setIsOrthographic(false);
      targetExplodedRef.current = 0;
      setExplodedFactor(0);
      setLayerVis((prev) => ({
        ...prev,
        roof: false,
        ceiling: false,
        externalWalls: true,
        internalWalls: true,
        labels: true,
      }));
      camTargetPosRef.current = new THREE.Vector3(15.5, 13.5, 17.5);
      camTargetLookRef.current = new THREE.Vector3(6.0, 1.0, 5.2);
    } else if (mode === 'floor-plan') {
      setIsOrthographic(true);
      targetExplodedRef.current = 0;
      setExplodedFactor(0);
      setLayerVis((prev) => ({
        ...prev,
        roof: false,
        ceiling: false,
        externalWalls: true,
        internalWalls: true,
        labels: true,
      }));
      camTargetPosRef.current = new THREE.Vector3(6.0, 22.0, 5.51);
      camTargetLookRef.current = new THREE.Vector3(6.0, 0.0, 5.5);
    } else if (mode === 'cutaway') {
      setIsOrthographic(false);
      targetExplodedRef.current = 0;
      setExplodedFactor(0);
      setLayerVis((prev) => ({
        ...prev,
        roof: false,
        ceiling: false,
        externalWalls: true,
        internalWalls: true,
        labels: true,
      }));
      camTargetPosRef.current = new THREE.Vector3(16.0, 8.2, 16.5);
      camTargetLookRef.current = new THREE.Vector3(6.0, 1.1, 5.2);
    } else if (mode === 'exploded') {
      setIsOrthographic(false);
      targetExplodedRef.current = 0.75;
      setExplodedFactor(0.75);
      setLayerVis((prev) => ({
        ...prev,
        roof: true,
        ceiling: true,
        externalWalls: true,
        internalWalls: true,
        labels: true,
      }));
      camTargetPosRef.current = new THREE.Vector3(19.5, 14.5, 21.5);
      camTargetLookRef.current = new THREE.Vector3(6.0, 3.2, 5.2);
    } else if (mode === 'walkthrough') {
      setIsOrthographic(false);
      targetExplodedRef.current = 0;
      setExplodedFactor(0);
      setLayerVis((prev) => ({
        ...prev,
        roof: true,
        ceiling: true,
        externalWalls: true,
        internalWalls: true,
        doors: true,
      }));
      walkPosRef.current.set(4.65, 1.55, 8.15);
      walkYawRef.current = 0.28;
      walkPitchRef.current = -0.05;
      setWalkRoomName('Living Room');
      camTargetPosRef.current = null;
      camTargetLookRef.current = null;
    }

    requestRenderRef.current?.();
  }, []);

  // Fly camera to preset
  const handleSelectCameraPreset = useCallback(
    (presetId: CameraPresetId) => {
      setActivePreset(presetId);
      const spec = CAMERA_PRESETS_3D.find((p) => p.id === presetId);
      if (!spec) return;

      if (presetId === 'walkthrough-entry') {
        applyViewMode('walkthrough');
        return;
      }

      if (viewModeRef.current === 'walkthrough') {
        setViewMode('roof-removed');
        viewModeRef.current = 'roof-removed';
      }

      setIsOrthographic(Boolean(spec.orthographic));
      camTargetPosRef.current = new THREE.Vector3(...spec.position);
      camTargetLookRef.current = new THREE.Vector3(...spec.target);
      requestRenderRef.current?.();
    },
    [applyViewMode]
  );

  // Fly camera into a specific room
  const handleFocusRoom = useCallback(
    (roomMeta: Room3DMetadata, enterFirstPerson = false) => {
      onSelectRoom(roomMeta.id);
      setActiveRightTab('room');

      if (enterFirstPerson) {
        setViewMode('walkthrough');
        viewModeRef.current = 'walkthrough';
        setIsOrthographic(false);
        setLayerVis((prev) => ({ ...prev, roof: true, ceiling: true }));
        walkPosRef.current.set(roomMeta.centerX, 1.62, roomMeta.centerZ + 0.35);
        walkYawRef.current = 0;
        walkPitchRef.current = -0.05;
        setWalkRoomName(roomMeta.room.name);
        requestRenderRef.current?.();
        return;
      }

      // Ensure roof is hidden so room interior is clearly visible from above/angle
      if (layerVis.roof && viewMode !== 'exploded') {
        setLayerVis((prev) => ({ ...prev, roof: false, ceiling: false }));
        if (viewMode === 'complete') setViewMode('roof-removed');
      }
      camTargetPosRef.current = new THREE.Vector3(...roomMeta.cameraEye);
      camTargetLookRef.current = new THREE.Vector3(...roomMeta.cameraTarget);
      requestRenderRef.current?.();
    },
    [layerVis.roof, onSelectRoom, viewMode]
  );

  // Initialize Three.js WebGL scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Software WebGL (SwiftShader) detection & context cleanup
    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2') || probe.getContext('webgl');
      if (!gl) return true;
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const rendererInfo = dbg
        ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
        : '';
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|Software|llvmpipe/i.test(rendererInfo);
    })();

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 600;
    const aspect = width / height;

    // 2. Scene & Environment Lighting
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B111E');
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // Required for Screenshot PNG capture
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // RoomEnvironment IBL
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Perspective & Orthographic Cameras
    const perspCam = new THREE.PerspectiveCamera(42, aspect, 0.1, 150);
    perspCam.position.set(-3.2, 3.15, -11.6);
    perspCameraRef.current = perspCam;

    const frustumSize = 15.5;
    const orthoCam = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      150
    );
    orthoCam.position.set(6.0, 22.0, 5.51);
    orthoCameraRef.current = orthoCam;
    activeCameraRef.current = perspCam;

    // 4. OrbitControls
    const controls = new OrbitControls(perspCam, renderer.domElement);
    controls.target.set(4.8, 1.85, 3.2);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 2.0;
    controls.maxDistance = 48.0;
    controls.update();
    controlsRef.current = controls;

    // 5. Architectural Lighting Setup (Sun Directional + Hemisphere + Warm Interior Point Lights)
    const hemiLight = new THREE.HemisphereLight('#E0F2FE', '#475569', 0.85);
    hemiLight.position.set(6, 25, 6);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#FFFBEB', 1.85);
    sunLight.position.set(-16, 26, -15);
    sunLight.target.position.set(6, 0, 5.5);
    scene.add(sunLight.target);
    if (!isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.set(2048, 2048);
      sunLight.shadow.camera.near = 2;
      sunLight.shadow.camera.far = 65;
      const d = 14;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
    }
    scene.add(sunLight);

    // Secondary South-East fill light so all 4 elevations are warmly lit during 360° orbit
    const seFillLight = new THREE.DirectionalLight('#FEF3C7', 1.15);
    seFillLight.position.set(18, 22, 20);
    seFillLight.target.position.set(6, 0, 5.5);
    scene.add(seFillLight.target);
    scene.add(seFillLight);

    scene.userData.sunLight = sunLight;
    scene.userData.hemiLight = hemiLight;

    // Subtle Ground Grid Helper outside the compound apron
    const gridHelper = new THREE.GridHelper(36, 36, '#1E293B', '#1E293B');
    gridHelper.position.set(6.0, -0.195, 5.5);
    scene.add(gridHelper);

    // 6. Build Architectural Layers
    const layers = buildArchitecturalScene3D(
      siteConfig,
      customColors,
      !isSoftwareGl
    );
    layersRef.current = layers;

    // Initial Complete Roof view state (showing the 12° split-level roof immediately)
    layers.roofSheetGroup.visible = true;
    layers.roofTrussGroup.visible = true;
    layers.ceilingGroup.visible = true;
    layers.labelsGroup.visible = false;

    scene.add(layers.foundationGroup);
    scene.add(layers.floorGroup);
    scene.add(layers.externalWallsGroup);
    scene.add(layers.internalWallsGroup);
    scene.add(layers.doorsGroup);
    scene.add(layers.windowsGroup);
    scene.add(layers.furnitureGroup);
    scene.add(layers.ceilingGroup);
    scene.add(layers.roofTrussGroup);
    scene.add(layers.roofSheetGroup);
    scene.add(layers.labelsGroup);
    scene.add(layers.lightingGroup);
    scene.add(layers.landscapingGroup);

    // 7. Coalesced Render & Software-WebGL Paced Animation Loop
    let disposed = false;
    let rafId = 0;
    let timerId = 0;

    const afterDraw = isSoftwareGl
      ? (cb: () => void) => {
          timerId = window.setTimeout(() => {
            rafId = requestAnimationFrame(cb);
          }, 16);
        }
      : (cb: () => void) => {
          rafId = requestAnimationFrame(cb);
        };

    let renderPending = false;
    let lastTimeMs = performance.now();

    const stepSceneAndRender = () => {
      renderPending = false;
      if (disposed) return;

      const nowMs = performance.now();
      const dt = Math.min((nowMs - lastTimeMs) / 1000, 0.1);
      lastTimeMs = nowMs;
      let needsAnotherFrame = false;

      const cam = activeCameraRef.current || perspCam;

      // A. First-Person Walkthrough movement
      if (viewModeRef.current === 'walkthrough') {
        controls.enabled = false;
        const speed = 3.4 * dt;
        const turnSpeed = 1.6 * dt;
        const keys = keysPressedRef.current;

        if (keys['ArrowLeft'] || keys['KeyQ']) {
          walkYawRef.current += turnSpeed;
          needsAnotherFrame = true;
        }
        if (keys['ArrowRight'] || keys['KeyE']) {
          walkYawRef.current -= turnSpeed;
          needsAnotherFrame = true;
        }

        let moveForward = 0;
        let moveStrafe = 0;
        if (keys['KeyW'] || keys['ArrowUp']) moveForward += 1;
        if (keys['KeyS'] || keys['ArrowDown']) moveForward -= 1;
        if (keys['KeyA']) moveStrafe -= 1;
        if (keys['KeyD']) moveStrafe += 1;

        if (moveForward !== 0 || moveStrafe !== 0) {
          needsAnotherFrame = true;
          const forwardX = -Math.sin(walkYawRef.current);
          const forwardZ = -Math.cos(walkYawRef.current);
          const rightX = Math.cos(walkYawRef.current);
          const rightZ = -Math.sin(walkYawRef.current);

          const dx = (forwardX * moveForward + rightX * moveStrafe) * speed;
          const dz = (forwardZ * moveForward + rightZ * moveStrafe) * speed;

          const curX = walkPosRef.current.x;
          const curZ = walkPosRef.current.z;

          if (isWalkthroughPositionValid(curX + dx, curZ)) {
            walkPosRef.current.x += dx;
          }
          if (isWalkthroughPositionValid(walkPosRef.current.x, curZ + dz)) {
            walkPosRef.current.z += dz;
          }

          const currentRoom = findRoomAtPoint3D(
            walkPosRef.current.x,
            walkPosRef.current.z
          );
          if (currentRoom) {
            setWalkRoomName(currentRoom.room.name);
          } else {
            setWalkRoomName('Compound Exterior');
          }
        }

        perspCam.position.copy(walkPosRef.current);
        const lookX =
          walkPosRef.current.x -
          Math.sin(walkYawRef.current) * Math.cos(walkPitchRef.current);
        const lookY =
          walkPosRef.current.y + Math.sin(walkPitchRef.current);
        const lookZ =
          walkPosRef.current.z -
          Math.cos(walkYawRef.current) * Math.cos(walkPitchRef.current);
        perspCam.lookAt(lookX, lookY, lookZ);
      } else {
        controls.enabled = true;

        // B. Smooth Camera Fly-To Transition
        if (camTargetPosRef.current && camTargetLookRef.current) {
          const lerpAlpha = isSoftwareGl ? 0.35 : 1 - Math.exp(-8 * dt);
          cam.position.lerp(camTargetPosRef.current, lerpAlpha);
          controls.target.lerp(camTargetLookRef.current, lerpAlpha);
          controls.update();

          if (
            cam.position.distanceTo(camTargetPosRef.current) < 0.05 &&
            controls.target.distanceTo(camTargetLookRef.current) < 0.05
          ) {
            cam.position.copy(camTargetPosRef.current);
            controls.target.copy(camTargetLookRef.current);
            camTargetPosRef.current = null;
            camTargetLookRef.current = null;
          } else {
            needsAnotherFrame = true;
          }
        } else if (controls.enableDamping) {
          controls.update();
        }
      }

      // C. Smooth Exploded View Vertical Separation
      if (Math.abs(currentExplodedRef.current - targetExplodedRef.current) > 0.002) {
        currentExplodedRef.current = isSoftwareGl
          ? targetExplodedRef.current
          : THREE.MathUtils.lerp(
              currentExplodedRef.current,
              targetExplodedRef.current,
              1 - Math.exp(-9 * dt)
            );
        needsAnotherFrame = true;
      } else {
        currentExplodedRef.current = targetExplodedRef.current;
      }

      const ex = currentExplodedRef.current;
      if (layersRef.current) {
        layersRef.current.foundationGroup.position.y = -ex * 1.1;
        layersRef.current.floorGroup.position.y = 0;
        layersRef.current.furnitureGroup.position.y = ex * 0.45;
        layersRef.current.externalWallsGroup.position.y = ex * 1.35;
        layersRef.current.internalWallsGroup.position.y = ex * 1.35;
        layersRef.current.doorsGroup.position.y = ex * 1.35;
        layersRef.current.windowsGroup.position.y = ex * 1.35;
        layersRef.current.ceilingGroup.position.y = ex * 2.9;
        layersRef.current.lightingGroup.position.y = ex * 2.9;
        layersRef.current.roofTrussGroup.position.y = ex * 4.2;
        layersRef.current.roofSheetGroup.position.y = ex * 5.6;
        layersRef.current.labelsGroup.position.y = ex * 1.65;
      }

      renderer.render(scene, cam);

      if (needsAnotherFrame && !renderPending) {
        renderPending = true;
        afterDraw(stepSceneAndRender);
      }
    };

    const requestRender = () => {
      if (disposed || renderPending) return;
      renderPending = true;
      afterDraw(stepSceneAndRender);
    };
    requestRenderRef.current = requestRender;

    controls.addEventListener('change', requestRender);

    // 8. Raycasting for Interactive Room Click Selection & Walkthrough Mouse Look
    const raycaster = new THREE.Raycaster();
    const pointerDownPos = new THREE.Vector2();
    let isDraggingLook = false;
    let prevLookX = 0;
    let prevLookY = 0;

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos.set(e.clientX, e.clientY);
      if (viewModeRef.current === 'walkthrough') {
        isDraggingLook = true;
        prevLookX = e.clientX;
        prevLookY = e.clientY;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (viewModeRef.current === 'walkthrough' && isDraggingLook) {
        const dx = e.clientX - prevLookX;
        const dy = e.clientY - prevLookY;
        prevLookX = e.clientX;
        prevLookY = e.clientY;
        walkYawRef.current -= dx * 0.0045;
        walkPitchRef.current = THREE.MathUtils.clamp(
          walkPitchRef.current - dy * 0.0035,
          -Math.PI / 3,
          Math.PI / 3
        );
        requestRender();
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      isDraggingLook = false;
      const moveDist = Math.hypot(
        e.clientX - pointerDownPos.x,
        e.clientY - pointerDownPos.y
      );
      if (moveDist > 6) return; // Ignore orbit drag

      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const cam = activeCameraRef.current || perspCam;
      raycaster.setFromCamera(mouse, cam);

      if (!layersRef.current) return;
      const floorTargets = Array.from(layersRef.current.roomFloorMeshes.values());
      const labelTargets = layersRef.current.labelsGroup.children;
      const hits = raycaster.intersectObjects([...labelTargets, ...floorTargets], false);

      if (hits.length > 0) {
        const roomId = hits[0].object.userData?.roomId;
        if (roomId) {
          onSelectRoom(roomId);
          setActiveRightTab('room');
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Keyboard listeners for First-Person Walkthrough
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      keysPressedRef.current[e.code] = true;
      if (viewModeRef.current === 'walkthrough') {
        requestRender();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 320);
        const h = Math.max(entry.contentRect.height, 280);
        const asp = w / h;

        perspCam.aspect = asp;
        perspCam.updateProjectionMatrix();

        orthoCam.left = (-frustumSize * asp) / 2;
        orthoCam.right = (frustumSize * asp) / 2;
        orthoCam.top = frustumSize / 2;
        orthoCam.bottom = -frustumSize / 2;
        orthoCam.updateProjectionMatrix();

        renderer.setSize(w, h);
        requestRender();
      }
    });
    resizeObserver.observe(container);

    // Initial synchronous render so canvas is immediately populated
    renderer.render(scene, perspCam);
    setIsReady(true);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      resizeObserver.disconnect();
      controls.removeEventListener('change', requestRender);
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteConfig.eastOverhangMode]);

  // Sync Layer Visibility, Cutaway Wall Transparency, and Furnished Toggle
  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;

    layers.roofSheetGroup.visible = layerVis.roof;
    layers.roofTrussGroup.visible = layerVis.roof;
    layers.ceilingGroup.visible = layerVis.ceiling;
    layers.externalWallsGroup.visible = layerVis.externalWalls;
    layers.internalWallsGroup.visible = layerVis.internalWalls;
    layers.doorsGroup.visible = layerVis.doors;
    layers.windowsGroup.visible = layerVis.windows;
    layers.furnitureGroup.visible = layerVis.furniture && isFurnished;
    layers.labelsGroup.visible = layerVis.labels && viewMode !== 'walkthrough';
    layers.lightingGroup.visible = layerVis.lighting;
    layers.landscapingGroup.visible = layerVis.landscaping;

    // Cutaway mode: make external walls semi-transparent & lowered scale so interior rooms are visible from outside
    const isCutaway = viewMode === 'cutaway';
    layers.customizableMaterials.extWallMat.transparent = isCutaway;
    layers.customizableMaterials.extWallMat.opacity = isCutaway ? 0.28 : 1.0;
    layers.customizableMaterials.extWallMat.needsUpdate = true;

    requestRenderRef.current?.();
  }, [layerVis, isFurnished, viewMode]);

  // Sync Selected Room Highlight in 3D Floor
  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;
    layers.roomHighlightMeshes.forEach((mesh, id) => {
      const isSelected = id === (selectedRoomId ?? 'living');
      mesh.visible = isSelected;
      (mesh.material as THREE.MeshBasicMaterial).opacity = isSelected ? 0.32 : 0.0;
    });
    requestRenderRef.current?.();
  }, [selectedRoomId]);

  // Sync Perspective vs Orthographic Camera Projection
  useEffect(() => {
    const perspCam = perspCameraRef.current;
    const orthoCam = orthoCameraRef.current;
    const controls = controlsRef.current;
    if (!perspCam || !orthoCam || !controls) return;

    if (isOrthographic) {
      orthoCam.position.copy(perspCam.position);
      orthoCam.quaternion.copy(perspCam.quaternion);
      activeCameraRef.current = orthoCam;
      controls.object = orthoCam;
    } else {
      activeCameraRef.current = perspCam;
      controls.object = perspCam;
    }
    controls.update();
    requestRenderRef.current?.();
  }, [isOrthographic]);

  // Sync Custom Wall, Floor, and Roof Colours
  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;
    layers.customizableMaterials.extWallMat.color.set(customColors.wallColorHex);
    layers.customizableMaterials.intWallMat.color.set(customColors.wallColorHex);
    layers.customizableMaterials.mainFloorMat.color.set(customColors.floorColorHex);
    layers.customizableMaterials.roofSheetMat.color.set(customColors.roofColorHex);
    requestRenderRef.current?.();
  }, [customColors]);

  // Sync Daylight Sun Orientation & Warmth
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const sun = scene.userData.sunLight as THREE.DirectionalLight | undefined;
    const hemi = scene.userData.hemiLight as THREE.HemisphereLight | undefined;
    if (!sun || !hemi) return;

    if (daylightHour === 'morning') {
      sun.position.set(24, 16, 10);
      sun.color.set('#FEF3C7');
      sun.intensity = 1.65;
      scene.background = new THREE.Color('#0F172A');
    } else if (daylightHour === 'midday') {
      sun.position.set(14, 28, 18);
      sun.color.set('#FFFFFF');
      sun.intensity = 1.95;
      scene.background = new THREE.Color('#0B111E');
    } else {
      sun.position.set(-22, 11, 18);
      sun.color.set('#FDBA74');
      sun.intensity = 1.75;
      scene.background = new THREE.Color('#13111C');
    }
    requestRenderRef.current?.();
  }, [daylightHour]);

  // Screenshot PNG Capture
  const handleCaptureScreenshot = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const cam = activeCameraRef.current;
    if (!renderer || !scene || !cam) return;

    renderer.render(scene, cam);
    const dataUrl = renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `2Bed-Boys-Quarters-3D-${viewMode}.png`;
    a.click();
  };

  // Register snapshot getter for parent Print dialog
  useEffect(() => {
    if (!onRegisterSnapshotGetter) return;
    const getter = () => {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const cam = activeCameraRef.current;
      if (!renderer || !scene || !cam) return null;
      renderer.render(scene, cam);
      return renderer.domElement.toDataURL('image/png');
    };
    onRegisterSnapshotGetter(getter);
  }, [onRegisterSnapshotGetter]);

  // Export 3D BIM / Architectural Specification JSON
  const handleExportModelSpec = () => {
    const payload = {
      project: "2-Bedroom Boys' Quarters — Interactive 3D Architectural Model (Nigeria)",
      dimensionsM: {
        overallWidth: 12.0,
        overallDepth: 11.0,
        mainBlockDepth: 9.15,
        verandahWidth: 6.0,
        verandahDepth: 1.85,
        ceilingHeight: 3.0,
        upperSpineRidgeM: 4.54,
        lowerSpineRidgeM: 4.12,
        rearLowEave: 3.2,
        frontLowEave: 2.8,
        roofPitchDeg: 12,
      },
      selectedFinishes: customColors,
      siteConfig,
      rooms: roomsList.map((r) => ({
        code: r.room.code,
        name: r.room.name,
        widthM: r.widthM,
        depthM: r.depthM,
        areaSqm: r.areaSqm,
        furniture: r.furnitureItems,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2Bed-BQ-3D-Architectural-BIM-Spec.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Manual Camera Zoom / Rotate Helpers for Touch & Button Users
  const handleManualZoom = (factor: number) => {
    const cam = activeCameraRef.current;
    const controls = controlsRef.current;
    if (!cam || !controls) return;
    const offset = cam.position.clone().sub(controls.target).multiplyScalar(factor);
    if (offset.length() >= 2.2 && offset.length() <= 45) {
      cam.position.copy(controls.target).add(offset);
      controls.update();
      requestRenderRef.current?.();
    }
  };

  const handleManualStepWalk = (forwardStep: number, turnStep: number) => {
    if (viewModeRef.current !== 'walkthrough') {
      applyViewMode('walkthrough');
      return;
    }
    walkYawRef.current += turnStep;
    const fx = -Math.sin(walkYawRef.current) * forwardStep;
    const fz = -Math.cos(walkYawRef.current) * forwardStep;
    if (isWalkthroughPositionValid(walkPosRef.current.x + fx, walkPosRef.current.z + fz)) {
      walkPosRef.current.x += fx;
      walkPosRef.current.z += fz;
      const rm = findRoomAtPoint3D(walkPosRef.current.x, walkPosRef.current.z);
      if (rm) setWalkRoomName(rm.room.name);
    }
    requestRenderRef.current?.();
  };

  return (
    <div
      data-testid="building-3d-viewer"
      data-state={isReady ? 'ready' : 'loading'}
      className={`relative w-full bg-[#0B111E] text-slate-100 rounded-xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[780px]'
      }`}
    >
      {/* =====================================================================
          TOP ARCHITECTURAL VIEWER BAR (Phase 8: Project Name, Reset, Fullscreen, Screenshot, Export)
          ===================================================================== */}
      <div className="z-20 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#0B0F17] border-b border-slate-800/90">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">
                3D ARCHITECTURAL BIM MODELER
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                12.00m × 11.00m • 1:1 METRIC SCALE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              2-Bedroom Boys&apos; Quarters • 225mm Ext / 150mm Int Sandcrete • 12° Split-Level Roof (+4.54m Ridge / +3.20m &amp; +2.80m Eaves)
            </p>
          </div>
        </div>

        {/* Viewing Mode Quick Switcher (Phase 4: Complete, Roof Removal, Floor Plan, Cutaway, Exploded, Walkthrough) */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          {(
            [
              { id: 'complete', label: 'Complete Roof' },
              { id: 'roof-removed', label: 'Roof Removal' },
              { id: 'floor-plan', label: '2D Top Plan' },
              { id: 'cutaway', label: 'Cutaway Walls' },
              { id: 'exploded', label: 'Exploded View' },
              { id: 'walkthrough', label: '1st-Person Walk' },
            ] as { id: ViewMode3D; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => applyViewMode(m.id)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                viewMode === m.id
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsFurnished((f) => !f)}
            title="Switch between Furnished and Unfurnished 3D Model"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isFurnished
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Sofa className="w-3.5 h-3.5" />
            <span>{isFurnished ? 'Furnished' : 'Unfurnished'}</span>
          </button>

          <button
            onClick={() =>
              setDaylightHour((h) =>
                h === 'morning' ? 'midday' : h === 'midday' ? 'golden' : 'morning'
              )
            }
            title="Cycle Daylight & Sun Shadow Angle"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="capitalize hidden md:inline">{daylightHour}</span>
          </button>

          <button
            onClick={() => applyViewMode('roof-removed')}
            title="Reset 3D Camera View"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </button>

          <button
            onClick={handleCaptureScreenshot}
            title="Capture 3D Screenshot as PNG"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Screenshot</span>
          </button>

          <button
            onClick={() => onOpenPrintModal?.('3d-views')}
            title="Print 3D Architectural Perspectives Plate"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Print 3D</span>
          </button>

          <button
            onClick={handleExportModelSpec}
            title="Export 3D Architectural BIM Data (JSON)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Export</span>
          </button>

          <button
            onClick={() => setHideHud((h) => !h)}
            title={hideHud ? 'Show Sidebars & Controls' : 'Cinema Mode (Hide Sidebars)'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            {hideHud ? <Eye className="w-4 h-4 text-sky-400" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsFullscreen((f) => !f)}
            title="Toggle Fullscreen 3D Workspace"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-amber-400" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* =====================================================================
          MAIN 3D VIEWPORT & OVERLAY SIDEBARS
          ===================================================================== */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Three.js WebGL Canvas Container */}
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* First-Person Walkthrough HUD Banner & On-Screen Navigation Pad */}
        {viewMode === 'walkthrough' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
            <div className="px-4 py-2 rounded-xl bg-[#0B0F17]/95 border border-sky-500/50 shadow-xl flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Walkthrough Location:
                </span>
                <span className="text-xs font-mono font-bold text-white bg-sky-500/20 px-2 py-0.5 rounded">
                  {walkRoomName}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden md:inline">
                Use WASD / Arrow Keys to Walk • Drag Mouse to Look • Click Exit to Orbit
              </span>
              <button
                onClick={() => applyViewMode('roof-removed')}
                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold"
              >
                Exit Walkthrough
              </button>
            </div>

            {/* Mobile / Mouse On-Screen Directional Step Pad */}
            <div className="flex items-center gap-1.5 bg-[#0B0F17]/95 px-3 py-1.5 rounded-lg border border-slate-700">
              <button
                onClick={() => handleManualStepWalk(0, 0.35)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Turn Left"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleManualStepWalk(0.65, 0)}
                className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1"
                title="Step Forward"
              >
                <ArrowUp className="w-3.5 h-3.5" /> Step Forward
              </button>
              <button
                onClick={() => handleManualStepWalk(-0.65, 0)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Step Backward"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleManualStepWalk(0, -0.35)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Turn Right"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Exploded View Vertical Separation Slider Banner */}
        {viewMode === 'exploded' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-2.5 rounded-xl bg-[#0B0F17]/95 border border-amber-500/50 shadow-xl flex items-center gap-4">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">
              EXPLODED LAYER SEPARATION:
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={explodedFactor}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setExplodedFactor(v);
                targetExplodedRef.current = v;
                requestRenderRef.current?.();
              }}
              className="w-36 accent-amber-400 cursor-pointer"
            />
            <span className="text-xs font-mono text-white w-10">
              {Math.round(explodedFactor * 100)}%
            </span>
          </div>
        )}

        {/* =================================================================
            LEFT SIDEBAR: BUILDING STRUCTURE, ROOM LIST & LAYER TOGGLES
            ================================================================= */}
        {!hideHud && (
          <div className="absolute top-3 left-3 bottom-16 z-10 w-64 bg-[#0B0F17]/95 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl">
            {/* Building Components / Layer Visibility */}
            <div className="p-3 border-b border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Building Components
                </span>
                <span className="text-[10px] font-mono text-slate-400">Toggle Layers</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { key: 'roof', label: '12° Split Roof' },
                    { key: 'ceiling', label: 'POP Ceiling' },
                    { key: 'externalWalls', label: 'Ext Walls 225' },
                    { key: 'internalWalls', label: 'Int Walls 150' },
                    { key: 'doors', label: 'Doors D1–D5' },
                    { key: 'windows', label: 'Windows W1–5' },
                    { key: 'furniture', label: '3D Furniture' },
                    { key: 'labels', label: 'Room Labels' },
                    { key: 'lighting', label: 'Lights & AC' },
                    { key: 'landscaping', label: 'Site & Tank' },
                  ] as { key: keyof LayerVisibility3D; label: string }[]
                ).map((item) => {
                  const active = layerVis[item.key];
                  return (
                    <button
                      key={item.key}
                      onClick={() =>
                        setLayerVis((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                      }
                      className={`flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-medium border transition-colors ${
                        active
                          ? 'bg-sky-500/15 text-sky-200 border-sky-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          active ? 'bg-sky-400' : 'bg-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Room Directory (All 11 Spaces from Uploaded Plan) */}
            <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-sky-400" /> Rooms (11 Spaces)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Click to Inspect</span>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
              {roomsList.map((rm) => {
                const isSelected = activeRoomMeta.id === rm.id;
                return (
                  <div
                    key={rm.id}
                    className={`rounded-lg border p-2 transition-all ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500/50'
                        : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <button
                        onClick={() => handleFocusRoom(rm, false)}
                        className="text-left flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-sky-300">
                            {rm.room.code}
                          </span>
                          <span className="text-xs font-semibold text-white truncate">
                            {rm.shortLabel}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>
                            {rm.widthM.toFixed(2)}m × {rm.depthM.toFixed(2)}m
                          </span>
                          <span className="text-amber-300 font-semibold">
                            {rm.areaSqm.toFixed(2)} m²
                          </span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleFocusRoom(rm, true)}
                        title={`Enter ${rm.room.name} in First-Person Walkthrough`}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-[10px] font-bold text-sky-300 border border-slate-700 transition-colors"
                      >
                        Enter
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================
            RIGHT SIDEBAR: ROOM DETAILS, MATERIAL CUSTOMIZER & PLAN ANALYSIS
            ================================================================= */}
        {!hideHud && (
          <div className="absolute top-3 right-3 bottom-16 z-10 w-76 bg-[#0B0F17]/95 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl">
            {/* Right Sidebar Tabs */}
            <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-900/70 p-1 gap-1">
              <button
                onClick={() => setActiveRightTab('room')}
                className={`py-1.5 rounded text-[11px] font-bold transition-colors ${
                  activeRightTab === 'room'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Room Info
              </button>
              <button
                onClick={() => setActiveRightTab('materials')}
                className={`py-1.5 rounded text-[11px] font-bold transition-colors ${
                  activeRightTab === 'materials'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Finishes & Color
              </button>
              <button
                onClick={() => setActiveRightTab('analysis')}
                className={`py-1.5 rounded text-[11px] font-bold transition-colors ${
                  activeRightTab === 'analysis'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Plan Analysis
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {activeRightTab === 'room' && (
                <>
                  <div className="p-3 rounded-lg bg-slate-900 border border-sky-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                        {activeRoomMeta.room.code} • SELECTED SPACE
                      </span>
                      <button
                        onClick={() => handleFocusRoom(activeRoomMeta, true)}
                        className="text-[11px] font-semibold text-amber-300 hover:underline flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3" /> Walk Inside
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5">
                      {activeRoomMeta.room.name}
                    </h3>

                    {/* Key Metric Grid (Phase 5: Length, Width, Floor Area in m²) */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">Length</div>
                        <div className="text-sm font-mono font-bold text-white">
                          {activeRoomMeta.widthM.toFixed(2)} m
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">Width</div>
                        <div className="text-sm font-mono font-bold text-white">
                          {activeRoomMeta.depthM.toFixed(2)} m
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">Floor Area</div>
                        <div className="text-sm font-mono font-bold text-amber-300">
                          {activeRoomMeta.areaSqm.toFixed(2)} m²
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected Architectural Finishes */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                      Architectural Specifications
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
                      <div>
                        <span className="text-slate-400 font-medium">Floor Finish: </span>
                        <span className="text-slate-200">{activeRoomMeta.room.floorFinish}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Wall Finish: </span>
                        <span className="text-slate-200">{activeRoomMeta.room.wallFinish}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Ceiling (+3.00m): </span>
                        <span className="text-slate-200">{activeRoomMeta.room.ceilingFinish}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3D Furniture & Fittings in this Room */}
                  <div className="space-y-1.5">
                    <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                      3D Furniture & Fittings ({activeRoomMeta.furnitureItems.length})
                    </div>
                    <ul className="space-y-1">
                      {activeRoomMeta.furnitureItems.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-200 bg-slate-900/70 px-2.5 py-1.5 rounded border border-slate-800/80"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Doors & Windows in this Room */}
                  <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-slate-300 text-[11px]">
                      Openings & MEP Services
                    </div>
                    <div className="text-slate-400">
                      <strong className="text-slate-200">Doors:</strong>{' '}
                      {activeRoomMeta.room.doors.join(', ') || 'None'}
                    </div>
                    <div className="text-slate-400">
                      <strong className="text-slate-200">Windows:</strong>{' '}
                      {activeRoomMeta.room.windows.join(', ') || 'None'}
                    </div>
                  </div>
                </>
              )}

              {activeRightTab === 'materials' && (
                <div className="space-y-4">
                  {/* Wall Colour Customizer */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-sky-400" /> Wall Render Paint
                      </span>
                      <span className="text-[11px] text-sky-300">{customColors.wallName}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {WALL_COLOR_SWATCHES.map((sw) => (
                        <button
                          key={sw.hex}
                          onClick={() =>
                            setCustomColors((prev) => ({
                              ...prev,
                              wallColorHex: sw.hex,
                              wallName: sw.name,
                            }))
                          }
                          title={sw.name}
                          style={{ backgroundColor: sw.hex }}
                          className={`h-8 rounded-lg border-2 transition-transform ${
                            customColors.wallColorHex === sw.hex
                              ? 'border-sky-400 scale-105 shadow-md'
                              : 'border-slate-700 hover:scale-105'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Floor Tile Customizer */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Porcelain Floor Tiles
                      </span>
                      <span className="text-[11px] text-amber-300">{customColors.floorName}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {FLOOR_COLOR_SWATCHES.map((sw) => (
                        <button
                          key={sw.hex}
                          onClick={() =>
                            setCustomColors((prev) => ({
                              ...prev,
                              floorColorHex: sw.hex,
                              floorName: sw.name,
                            }))
                          }
                          title={sw.name}
                          style={{ backgroundColor: sw.hex }}
                          className={`h-8 rounded-lg border-2 transition-transform ${
                            customColors.floorColorHex === sw.hex
                              ? 'border-amber-400 scale-105 shadow-md'
                              : 'border-slate-700 hover:scale-105'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Roof Sheet Colour Customizer */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-emerald-400" /> 0.55mm Aluminium Roof
                      </span>
                      <span className="text-[11px] text-emerald-300">{customColors.roofName}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {ROOF_COLOR_SWATCHES.map((sw) => (
                        <button
                          key={sw.hex}
                          onClick={() => {
                            setCustomColors((prev) => ({
                              ...prev,
                              roofColorHex: sw.hex,
                              roofName: sw.name,
                            }));
                            // Ensure roof is visible when user customizes roof colour
                            if (!layerVis.roof) {
                              setLayerVis((prev) => ({ ...prev, roof: true }));
                            }
                          }}
                          title={sw.name}
                          style={{ backgroundColor: sw.hex }}
                          className={`h-8 rounded-lg border-2 transition-transform ${
                            customColors.roofColorHex === sw.hex
                              ? 'border-emerald-400 scale-105 shadow-md'
                              : 'border-slate-700 hover:scale-105'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <div className="font-bold text-white">PBR Visualization Notes</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      All textures (600×600mm vitrified porcelain tiles, 300×300mm non-slip bathroom ceramic tiles, stone-clad verandah columns, and 0.55mm corrugated aluminium roof sheets) are procedurally generated at 1:1 scale.
                    </p>
                  </div>
                </div>
              )}

              {activeRightTab === 'analysis' && (
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/30">
                    <div className="font-bold text-sky-300 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> Phase 1 Plan Analysis Summary
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Every wall, room, door, and window in this 3D model is generated directly from the uploaded 10-page Nigerian 2-Bedroom Boys&apos; Quarters architectural drawing.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-white">Adopted 12° Split-Level Roof</div>
                    <img
                      src="/assets/aistudio/download_c39a46c7.png"
                      alt="Adopted 12-Degree Split-Level Roof Reference"
                      className="w-full h-28 object-cover rounded border border-slate-700"
                    />
                    <div className="text-[11px] text-slate-300 font-mono">
                      • North Wing: 12° Rise (+3.20m Rear Eave → +4.54m Spine Ridge)
                      <br />• South Wing: 12° Fall (+4.12m Step-Ridge → +2.80m Front Eave)
                      <br />• Clerestory Step: 420mm Vertical Step at Y = 5.25m Spine
                      <br />• Drainage: Rear &amp; Front Gutters + Ø100mm Downpipes DP1–DP4
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-white">Envelope &amp; Structural Grid</div>
                    <div className="text-[11px] text-slate-300 font-mono">
                      • Gross Envelope: 12.00m × 11.00m
                      <br />• Main Block: 12.00m × 9.15m (109.80 m²)
                      <br />• Front Verandah: 6.00m × 1.85m (11.10 m²)
                      <br />• External Walls: 225mm (9&quot;) Sandcrete
                      <br />• Internal Walls: 150mm (6&quot;) Sandcrete
                      <br />• Ceiling Datum: +3.00m above FFL
                      <br />• Roof Pitch: 12° Split-Level Standing Seam
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-white">17 Verified 3D Openings</div>
                    <div className="text-[11px] text-slate-300">
                      • <strong>D1:</strong> 1200×2100mm Main Entrance Door
                      <br />• <strong>D2 (×2):</strong> 900×2100mm Bedroom Doors
                      <br />• <strong>D3:</strong> 900×2100mm Kitchen Door
                      <br />• <strong>D4 (×2):</strong> 750×2100mm Bathroom Doors
                      <br />• <strong>D5:</strong> 750×2100mm Pantry Door
                      <br />• <strong>W1:</strong> 1800×1500mm Living Sliding Window
                      <br />• <strong>W2 (×4):</strong> 1200×1500mm Bedroom Casements
                      <br />• <strong>W3:</strong> 1200×1200mm Kitchen Casement
                      <br />• <strong>W4 (×2) & W5:</strong> 600×600mm High Louvres
                    </div>
                  </div>

                  {onSwitchTo2DSheet && (
                    <button
                      onClick={() => onSwitchTo2DSheet('A-001')}
                      className="w-full py-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-bold text-xs transition-colors"
                    >
                      Inspect 2D CAD Sheet A-001 →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================
            BOTTOM CONTROL BAR: CAMERA PRESETS, PROJECTION & ZOOM CONTROLS
            ================================================================= */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#0B0F17]/95 border border-slate-800 shadow-xl">
          {/* Camera Orientation Presets (Top, Front, Rear, Left, Right, 3D, Walkthrough) */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-sky-400" /> Views:
            </span>
            {CAMERA_PRESETS_3D.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectCameraPreset(preset.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  activePreset === preset.id
                    ? 'bg-sky-500/25 text-sky-300 border border-sky-500/50'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Right Camera Controls: Perspective/Ortho + Zoom In/Out */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsOrthographic((o) => !o)}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-200 border border-slate-700"
              title="Toggle Perspective vs Orthographic Camera Projection"
            >
              {isOrthographic ? 'ORTHOGRAPHIC' : 'PERSPECTIVE'}
            </button>

            <button
              onClick={() => handleManualZoom(0.82)}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleManualZoom(1.22)}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 pl-2 border-l border-slate-800">
              <Move className="w-3 h-3 text-sky-400" />
              <span>Drag: Orbit • Right-Drag: Pan • Scroll: Zoom • Click Room: Inspect</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
