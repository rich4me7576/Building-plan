import * as THREE from 'three';
import {
  generateWallSegments3D,
  getNorthRoofElevationAtZ,
  getSouthRoofElevationAtZ,
  getRooms3DMetadata,
  WALL_OPENINGS_3D,
  Room3DMetadata,
  MaterialCustomization3D,
} from './building3DGeometry';
import { SiteResolutionConfig } from './architecturalMath';

export interface SceneLayerGroups {
  foundationGroup: THREE.Group;
  floorGroup: THREE.Group;
  externalWallsGroup: THREE.Group;
  internalWallsGroup: THREE.Group;
  doorsGroup: THREE.Group;
  windowsGroup: THREE.Group;
  furnitureGroup: THREE.Group;
  ceilingGroup: THREE.Group;
  roofTrussGroup: THREE.Group;
  roofSheetGroup: THREE.Group;
  labelsGroup: THREE.Group;
  lightingGroup: THREE.Group;
  landscapingGroup: THREE.Group;
  roomFloorMeshes: Map<string, THREE.Mesh>;
  roomHighlightMeshes: Map<string, THREE.Mesh>;
  /** Materials that update dynamically when user clicks color swatches */
  customizableMaterials: {
    extWallMat: THREE.MeshStandardMaterial;
    intWallMat: THREE.MeshStandardMaterial;
    mainFloorMat: THREE.MeshStandardMaterial;
    roofSheetMat: THREE.MeshStandardMaterial;
  };
}

/**
 * Generates procedural PBR CanvasTextures for tiles, corrugated roofing, stone cladding, and wood.
 */
function createTileTexture(baseHex: string, groutHex: string, gridCount = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle marble/ceramic tonal variation
  const step = 256 / gridCount;
  for (let gx = 0; gx < gridCount; gx++) {
    for (let gy = 0; gy < gridCount; gy++) {
      ctx.fillStyle = (gx + gy) % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.025)';
      ctx.fillRect(gx * step + 2, gy * step + 2, step - 4, step - 4);
    }
  }

  ctx.strokeStyle = groutHex;
  ctx.lineWidth = 3;
  for (let i = 0; i <= gridCount; i++) {
    const pos = i * step;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(256, pos);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function createCorrugatedRoofTexture(baseHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  // Continuous standing-seam ribs running from ridge to eave (matching uploaded reference)
  const ribs = 16;
  const panelWidth = 512 / ribs;
  for (let i = 0; i < ribs; i++) {
    const x = i * panelWidth;
    // Flat pan subtle gradient
    const panGrad = ctx.createLinearGradient(x, 0, x + panelWidth, 0);
    panGrad.addColorStop(0, 'rgba(0,0,0,0.32)');
    panGrad.addColorStop(0.12, 'rgba(255,255,255,0.22)');
    panGrad.addColorStop(0.22, 'rgba(255,255,255,0.04)');
    panGrad.addColorStop(0.88, 'rgba(0,0,0,0.05)');
    panGrad.addColorStop(1, 'rgba(0,0,0,0.36)');
    ctx.fillStyle = panGrad;
    ctx.fillRect(x, 0, panelWidth, 512);

    // Crisp standing seam lock rib
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(x + 2, 0, 2, 512);
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.fillRect(x, 0, 2, 512);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return tex;
}

function createStoneCladdingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#78716C';
  ctx.fillRect(0, 0, 128, 128);

  const colors = ['#57534E', '#A8A29E', '#8A817C', '#6B6560', '#968E86'];
  for (let row = 0; row < 8; row++) {
    const y = row * 16;
    const offset = (row % 2) * 16;
    for (let col = -1; col < 5; col++) {
      const x = col * 32 + offset;
      ctx.fillStyle = colors[Math.abs(row * 3 + col) % colors.length];
      ctx.fillRect(x + 1, y + 1, 30, 14);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 4);
  return tex;
}

/**
 * Creates a crisp 3D Sprite badge for room labels showing Room Name, Dimensions (m), and Area (m²).
 */
function createRoomLabelSprite(meta: Room3DMetadata): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;

  // High-contrast architectural pill/card
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(12, 12, 488, 168, 22);
  ctx.fill();
  ctx.stroke();

  // Room Code Tag
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${meta.room.code} • ${meta.widthM.toFixed(2)}m × ${meta.depthM.toFixed(2)}m`,
    256,
    56
  );

  // Room Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px "Outfit", sans-serif';
  ctx.fillText(meta.shortLabel, 256, 104);

  // Area in m²
  ctx.fillStyle = '#FCD34D';
  ctx.font = 'bold 26px "JetBrains Mono", monospace';
  ctx.fillText(`AREA: ${meta.areaSqm.toFixed(2)} m²`, 256, 148);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.3, 0.86, 1);
  sprite.position.set(meta.centerX, 2.35, meta.centerZ);
  sprite.renderOrder = 25;
  sprite.userData = { roomId: meta.id, isRoomLabel: true };
  return sprite;
}

/**
 * Builds a complete, multi-layered 3D architectural model of the 2-Bedroom Boys' Quarters.
 */
export function buildArchitecturalScene3D(
  siteConfig: SiteResolutionConfig,
  customColors: MaterialCustomization3D,
  enableShadows: boolean
): SceneLayerGroups {
  const foundationGroup = new THREE.Group();
  const floorGroup = new THREE.Group();
  const externalWallsGroup = new THREE.Group();
  const internalWallsGroup = new THREE.Group();
  const doorsGroup = new THREE.Group();
  const windowsGroup = new THREE.Group();
  const furnitureGroup = new THREE.Group();
  const ceilingGroup = new THREE.Group();
  const roofTrussGroup = new THREE.Group();
  const roofSheetGroup = new THREE.Group();
  const labelsGroup = new THREE.Group();
  const lightingGroup = new THREE.Group();
  const landscapingGroup = new THREE.Group();

  const roomFloorMeshes = new Map<string, THREE.Mesh>();
  const roomHighlightMeshes = new Map<string, THREE.Mesh>();

  // Shared PBR Materials
  const extWallMat = new THREE.MeshStandardMaterial({
    color: customColors.wallColorHex,
    roughness: 0.78,
    metalness: 0.04,
  });

  const intWallMat = new THREE.MeshStandardMaterial({
    color: customColors.wallColorHex,
    roughness: 0.72,
    metalness: 0.02,
  });

  const mainFloorTex = createTileTexture(customColors.floorColorHex, '#ABA499', 4);
  const mainFloorMat = new THREE.MeshStandardMaterial({
    color: customColors.floorColorHex,
    map: mainFloorTex,
    roughness: 0.28,
    metalness: 0.08,
  });

  const bathFloorTex = createTileTexture('#CBD5E1', '#64748B', 6);
  const bathFloorMat = new THREE.MeshStandardMaterial({
    map: bathFloorTex,
    roughness: 0.45,
    metalness: 0.05,
  });

  const verandahFloorTex = createTileTexture('#A8A29E', '#57534E', 5);
  const verandahFloorMat = new THREE.MeshStandardMaterial({
    map: verandahFloorTex,
    roughness: 0.68,
    metalness: 0.05,
  });

  const roofTex = createCorrugatedRoofTexture(customColors.roofColorHex);
  const roofSheetMat = new THREE.MeshStandardMaterial({
    color: customColors.roofColorHex,
    map: roofTex,
    roughness: 0.42,
    metalness: 0.45,
    side: THREE.DoubleSide,
  });

  const concreteMat = new THREE.MeshStandardMaterial({
    color: '#94A3B8',
    roughness: 0.85,
    metalness: 0.05,
  });

  const plinthMat = new THREE.MeshStandardMaterial({
    color: '#475569',
    roughness: 0.88,
    metalness: 0.05,
  });

  const stoneTex = createStoneCladdingTexture();
  const stoneMat = new THREE.MeshStandardMaterial({
    map: stoneTex,
    roughness: 0.85,
    metalness: 0.05,
  });

  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: '#5C3A21',
    roughness: 0.48,
    metalness: 0.06,
  });

  const warmOakMat = new THREE.MeshStandardMaterial({
    color: '#9A6B43',
    roughness: 0.52,
    metalness: 0.05,
  });

  const steelDoorMat = new THREE.MeshStandardMaterial({
    color: '#292524',
    roughness: 0.35,
    metalness: 0.65,
  });

  const aluFrameMat = new THREE.MeshStandardMaterial({
    color: '#1E293B',
    roughness: 0.25,
    metalness: 0.78,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#BAE6FD',
    transparent: true,
    opacity: 0.42,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.55,
    side: THREE.DoubleSide,
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: '#D97706',
    roughness: 0.25,
    metalness: 0.85,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: '#E2E8F0',
    roughness: 0.15,
    metalness: 0.9,
  });

  const ceramicWhiteMat = new THREE.MeshStandardMaterial({
    color: '#F8FAFC',
    roughness: 0.18,
    metalness: 0.08,
  });

  const graniteMat = new THREE.MeshStandardMaterial({
    color: '#1E293B',
    roughness: 0.22,
    metalness: 0.15,
  });

  const setShadow = (obj: THREE.Object3D, cast = true, receive = true) => {
    if (!enableShadows) return;
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = cast;
        child.receiveShadow = receive;
      }
    });
  };

  // ============================================================================
  // 1. SUBSTRUCTURE: FOUNDATION TRENCH FOOTINGS (-1.20m) & PLINTH SLAB (±0.00m)
  // ============================================================================
  // Main Block Plinth (12.00m × 9.15m, height 0.22m from -0.22m to 0.00m)
  const mainPlinth = new THREE.Mesh(
    new THREE.BoxGeometry(12.08, 0.22, 9.23),
    plinthMat
  );
  mainPlinth.position.set(6.0, -0.11, 4.575);
  foundationGroup.add(mainPlinth);

  // Verandah Plinth (6.00m × 1.85m on SW) + Entrance Steps
  const verPlinth = new THREE.Mesh(
    new THREE.BoxGeometry(6.08, 0.2, 1.88),
    plinthMat
  );
  verPlinth.position.set(3.0, -0.11, 10.075);
  foundationGroup.add(verPlinth);

  // Front entrance steps leading up to Verandah
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.35), stoneMat);
  step1.position.set(5.025, -0.15, 11.18);
  foundationGroup.add(step1);

  // Strip Footing Pad Base (visible in Exploded view at y = -0.55m)
  const stripFootingPerimeter = new THREE.Mesh(
    new THREE.BoxGeometry(12.5, 0.225, 9.65),
    concreteMat
  );
  stripFootingPerimeter.position.set(6.0, -0.45, 4.575);
  foundationGroup.add(stripFootingPerimeter);

  // Column Pad Footings (900×900×300mm) under Verandah Columns C1, C2, C3 (+ optional C4)
  const colPositionsX =
    siteConfig.eastOverhangMode === 'add-column-c4'
      ? [0.1125, 3.0, 5.8875, 11.8875]
      : [0.1125, 3.0, 5.8875];

  for (const cx of colPositionsX) {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.9), concreteMat);
    pad.position.set(cx, -0.45, 10.8875);
    foundationGroup.add(pad);
  }
  setShadow(foundationGroup, true, true);

  // ============================================================================
  // 2. INDIVIDUAL ROOM FLOOR TILES & INTERACTIVE SELECTION HIGHLIGHTS
  // ============================================================================
  const roomsMeta = getRooms3DMetadata();
  for (const rm of roomsMeta) {
    // Pantry sits inside the NE corner of Kitchen; elevate Pantry floor by 2mm to prevent z-fighting
    const isPantry = rm.id === 'pantry';
    const isUtility = rm.id === 'utility-store';
    const yFloor = isPantry || isUtility ? 0.014 : 0.01;

    let fMat = mainFloorMat;
    if (rm.id === 'bath-1' || rm.id === 'bath-2') fMat = bathFloorMat;
    if (rm.id === 'verandah') fMat = verandahFloorMat;

    const floorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(rm.widthM, 0.02, rm.depthM),
      fMat
    );
    floorMesh.position.set(rm.centerX, yFloor, rm.centerZ);
    floorMesh.userData = { roomId: rm.id, isRoomFloor: true, roomMeta: rm };
    floorGroup.add(floorMesh);
    roomFloorMeshes.set(rm.id, floorMesh);

    // Interactive Selection Highlight Overlay
    const hlMat = new THREE.MeshBasicMaterial({
      color: '#38BDF8',
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const hlMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(rm.widthM - 0.08, rm.depthM - 0.08),
      hlMat
    );
    hlMesh.rotation.x = -Math.PI / 2;
    hlMesh.position.set(rm.centerX, yFloor + 0.022, rm.centerZ);
    hlMesh.visible = false;
    floorGroup.add(hlMesh);
    roomHighlightMeshes.set(rm.id, hlMesh);

    // Room 3D Label Sprite
    const sprite = createRoomLabelSprite(rm);
    labelsGroup.add(sprite);
  }
  setShadow(floorGroup, false, true);

  // ============================================================================
  // 3. ACCURATE 3D EXTERNAL (225mm) & INTERNAL (150mm) WALLS WITH OPENINGS
  // ============================================================================
  const wallSegments = generateWallSegments3D();
  for (const seg of wallSegments) {
    const w = seg.maxX - seg.minX;
    const h = seg.maxY - seg.minY;
    const d = seg.maxZ - seg.minZ;
    const geom = new THREE.BoxGeometry(w, h, d);
    const mat = seg.isExternal ? extWallMat : intWallMat;
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(
      (seg.minX + seg.maxX) / 2,
      (seg.minY + seg.maxY) / 2,
      (seg.minZ + seg.maxZ) / 2
    );
    mesh.userData = { segmentId: seg.id, isExternal: seg.isExternal, maxY: seg.maxY, minY: seg.minY };

    // Add subtle architectural edge lines on piers for crispness
    const edges = new THREE.EdgesGeometry(geom);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: '#94A3B8', transparent: true, opacity: 0.25 })
    );
    mesh.add(line);

    if (seg.isExternal) {
      externalWallsGroup.add(mesh);
    } else {
      internalWallsGroup.add(mesh);
    }
  }

  // Verandah Stone-Clad Columns C1, C2, C3 (+ C4 if enabled)
  for (const cx of colPositionsX) {
    const colGroup = new THREE.Group();
    // Stone-clad base pedestal (320×320mm up to 1.0m)
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.0, 0.32), stoneMat);
    pedestal.position.set(cx, 0.5, 10.8875);
    colGroup.add(pedestal);

    // Upper RC shaft (225×225mm up to 2.82m verandah roof beam under 12° South wing)
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.225, 1.82, 0.225), extWallMat);
    shaft.position.set(cx, 1.91, 10.8875);
    colGroup.add(shaft);

    externalWallsGroup.add(colGroup);
  }

  // Verandah Front & Side Overhead Fascia Ring Beam at y = 2.62..2.84m
  const verFrontBeamLength = siteConfig.eastOverhangMode === 'add-column-c4' ? 12.0 : 6.0;
  const verFrontBeam = new THREE.Mesh(
    new THREE.BoxGeometry(verFrontBeamLength, 0.22, 0.225),
    extWallMat
  );
  verFrontBeam.position.set(verFrontBeamLength / 2, 2.73, 10.8875);
  externalWallsGroup.add(verFrontBeam);

  const verWestBeam = new THREE.Mesh(new THREE.BoxGeometry(0.225, 0.22, 1.85), extWallMat);
  verWestBeam.position.set(0.1125, 2.73, 10.075);
  externalWallsGroup.add(verWestBeam);

  setShadow(externalWallsGroup, true, true);
  setShadow(internalWallsGroup, true, true);

  // ============================================================================
  // 4. REALISTIC 3D DOORS (D1–D5) & WINDOWS (W1–W5) WITH FRAMES & GLAZING
  // ============================================================================
  for (const op of WALL_OPENINGS_3D) {
    if (op.kind === 'portal') {
      // Decorative timber architrave trim around the Central Spine Portal
      const portalW = op.endM - op.startM;
      const topTrim = new THREE.Mesh(
        new THREE.BoxGeometry(portalW + 0.12, 0.06, op.wallThicknessM + 0.04),
        warmOakMat
      );
      topTrim.position.set((op.startM + op.endM) / 2, op.headM, op.perpCenterM);
      doorsGroup.add(topTrim);
      continue;
    }

    const opLength = op.endM - op.startM;
    const opHeight = op.headM - op.sillM;
    const midAlong = (op.startM + op.endM) / 2;
    const midY = (op.sillM + op.headM) / 2;
    const centerX = op.axis === 'x' ? midAlong : op.perpCenterM;
    const centerZ = op.axis === 'x' ? op.perpCenterM : midAlong;

    if (op.kind === 'door') {
      const doorUnit = new THREE.Group();
      doorUnit.position.set(centerX, op.sillM, centerZ);
      if (op.axis === 'z') doorUnit.rotation.y = Math.PI / 2;

      const frameDepth = op.wallThicknessM + 0.03;
      const jambThickness = 0.05;

      // Left & Right Jambs + Head Frame
      const leftJamb = new THREE.Mesh(
        new THREE.BoxGeometry(jambThickness, opHeight, frameDepth),
        darkWoodMat
      );
      leftJamb.position.set(-opLength / 2 + jambThickness / 2, opHeight / 2, 0);
      doorUnit.add(leftJamb);

      const rightJamb = new THREE.Mesh(
        new THREE.BoxGeometry(jambThickness, opHeight, frameDepth),
        darkWoodMat
      );
      rightJamb.position.set(opLength / 2 - jambThickness / 2, opHeight / 2, 0);
      doorUnit.add(rightJamb);

      const headJamb = new THREE.Mesh(
        new THREE.BoxGeometry(opLength + 0.06, jambThickness, frameDepth),
        darkWoodMat
      );
      headJamb.position.set(0, opHeight - jambThickness / 2, 0);
      doorUnit.add(headJamb);

      // Door Leaf (slightly ajar by 22° so rooms feel inviting and realistic)
      const leafWidth = opLength - jambThickness * 2;
      const leafHeight = opHeight - jambThickness;
      const leafPivot = new THREE.Group();
      leafPivot.position.set(-leafWidth / 2, 0, 0);

      const isSecurityDoor = op.tag === 'D1';
      const leafMat = isSecurityDoor ? steelDoorMat : warmOakMat;
      const leafPanel = new THREE.Mesh(
        new THREE.BoxGeometry(leafWidth, leafHeight, 0.045),
        leafMat
      );
      leafPanel.position.set(leafWidth / 2, leafHeight / 2, 0);
      leafPivot.add(leafPanel);

      // Brass Lever Handle on both sides
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.14), brassMat);
      handle.position.set(leafWidth - 0.1, 1.02, 0);
      leafPivot.add(handle);

      // Half-glazed glass insert for Kitchen Door D3
      if (op.tag === 'D3') {
        const glassInsert = new THREE.Mesh(
          new THREE.BoxGeometry(leafWidth * 0.55, leafHeight * 0.42, 0.055),
          glassMat
        );
        glassInsert.position.set(leafWidth / 2, leafHeight * 0.65, 0);
        leafPivot.add(glassInsert);
      }

      leafPivot.rotation.y = isSecurityDoor ? 0.35 : -0.42;
      doorUnit.add(leafPivot);
      doorsGroup.add(doorUnit);
    } else if (op.kind === 'window') {
      const winUnit = new THREE.Group();
      winUnit.position.set(centerX, midY, centerZ);
      if (op.axis === 'z') winUnit.rotation.y = Math.PI / 2;

      const frameDepth = op.wallThicknessM + 0.02;
      const barThick = 0.045;

      // Outer Aluminium Window Frame (Top, Bottom, Left, Right)
      const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(opLength, barThick, frameDepth),
        aluFrameMat
      );
      topFrame.position.set(0, opHeight / 2 - barThick / 2, 0);
      winUnit.add(topFrame);

      const botFrame = new THREE.Mesh(
        new THREE.BoxGeometry(opLength + 0.08, barThick * 1.2, frameDepth + 0.05),
        aluFrameMat
      );
      botFrame.position.set(0, -opHeight / 2 + barThick / 2, 0);
      winUnit.add(botFrame);

      const leftFrame = new THREE.Mesh(
        new THREE.BoxGeometry(barThick, opHeight, frameDepth),
        aluFrameMat
      );
      leftFrame.position.set(-opLength / 2 + barThick / 2, 0, 0);
      winUnit.add(leftFrame);

      const rightFrame = new THREE.Mesh(
        new THREE.BoxGeometry(barThick, opHeight, frameDepth),
        aluFrameMat
      );
      rightFrame.position.set(opLength / 2 - barThick / 2, 0, 0);
      winUnit.add(rightFrame);

      // Center Mullion for W1, W2, W3
      if (op.tag === 'W1' || op.tag === 'W2' || op.tag === 'W3') {
        const mullion = new THREE.Mesh(
          new THREE.BoxGeometry(barThick * 0.85, opHeight - barThick * 2, frameDepth * 0.7),
          aluFrameMat
        );
        winUnit.add(mullion);
      }

      // Horizontal Louvre Blades for W4 & W5
      if (op.tag === 'W4' || op.tag === 'W5') {
        for (let b = -1; b <= 1; b++) {
          const blade = new THREE.Mesh(
            new THREE.BoxGeometry(opLength - barThick * 2, 0.02, 0.08),
            glassMat
          );
          blade.position.set(0, b * 0.14, 0);
          blade.rotation.x = 0.35;
          winUnit.add(blade);
        }
      }

      // Main Reflective Glazing Pane
      const glassPane = new THREE.Mesh(
        new THREE.BoxGeometry(opLength - barThick * 2, opHeight - barThick * 2, 0.018),
        glassMat
      );
      winUnit.add(glassPane);
      windowsGroup.add(winUnit);
    }
  }
  setShadow(doorsGroup, true, true);
  setShadow(windowsGroup, true, true);

  // ============================================================================
  // 5. COMPOSITE 3D INTERIOR FURNITURE & SANITARY FIXTURES (ALL 11 SPACES)
  // ============================================================================
  const fabricNavyMat = new THREE.MeshStandardMaterial({ color: '#1E3A8A', roughness: 0.82 });
  const fabricCreamMat = new THREE.MeshStandardMaterial({ color: '#F5F5F4', roughness: 0.78 });
  const fabricTealMat = new THREE.MeshStandardMaterial({ color: '#0F766E', roughness: 0.8 });
  const rugMat = new THREE.MeshStandardMaterial({ color: '#D6D3D1', roughness: 0.92 });

  // Helper to build a realistic multi-part Bed + Headboard + Pillows + Blanket + Side Tables
  const buildBedroomSuite = (
    bedCenterX: number,
    bedCenterZ: number,
    bedWidth: number,
    accentMat: THREE.Material,
    wardrobeX: number,
    wardrobeZ: number
  ) => {
    const suite = new THREE.Group();

    // Woven Area Rug
    const rug = new THREE.Mesh(new THREE.BoxGeometry(bedWidth + 0.9, 0.012, 2.3), rugMat);
    rug.position.set(bedCenterX, 0.022, bedCenterZ + 0.15);
    suite.add(rug);

    // Timber Bed Base Frame
    const base = new THREE.Mesh(new THREE.BoxGeometry(bedWidth, 0.28, 2.05), darkWoodMat);
    base.position.set(bedCenterX, 0.16, bedCenterZ);
    suite.add(base);

    // Upholstered Headboard against North wall
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(bedWidth + 0.08, 1.05, 0.12), darkWoodMat);
    headboard.position.set(bedCenterX, 0.54, bedCenterZ - 0.98);
    suite.add(headboard);

    // Mattress
    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(bedWidth - 0.08, 0.22, 1.92),
      fabricCreamMat
    );
    mattress.position.set(bedCenterX, 0.4, bedCenterZ + 0.02);
    suite.add(mattress);

    // Duvet Cover on lower half
    const duvet = new THREE.Mesh(new THREE.BoxGeometry(bedWidth - 0.04, 0.24, 1.15), accentMat);
    duvet.position.set(bedCenterX, 0.41, bedCenterZ + 0.42);
    suite.add(duvet);

    // 2 Pillows
    for (const px of [-0.36, 0.36]) {
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.36), fabricCreamMat);
      pillow.position.set(bedCenterX + px, 0.55, bedCenterZ - 0.68);
      pillow.rotation.x = 0.18;
      suite.add(pillow);
    }

    // 2 Bedside Tables + Warm Lamps
    for (const side of [-1, 1]) {
      const tx = bedCenterX + side * (bedWidth / 2 + 0.32);
      const tz = bedCenterZ - 0.78;
      const nightStand = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.48, 0.42), warmOakMat);
      nightStand.position.set(tx, 0.25, tz);
      suite.add(nightStand);

      const lampShade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.14, 0.22, 12),
        new THREE.MeshStandardMaterial({
          color: '#FEF3C7',
          emissive: '#F59E0B',
          emissiveIntensity: 0.4,
        })
      );
      lampShade.position.set(tx, 0.64, tz);
      suite.add(lampShade);
    }

    // Built-in 2-Door Wardrobe (1.60m × 0.58m × 2.10m high)
    const wardrobe = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.1, 0.58), warmOakMat);
    wardrobe.position.set(wardrobeX, 1.06, wardrobeZ);
    suite.add(wardrobe);

    // Split AC Indoor Unit mounted on North wall at y = 2.55m
    const acUnit = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.26, 0.22), ceramicWhiteMat);
    acUnit.position.set(bedCenterX, 2.55, 0.35);
    suite.add(acUnit);

    return suite;
  };

  // BEDROOM 1 (West: x = 0.225..3.825, z = 0.225..3.825)
  furnitureGroup.add(buildBedroomSuite(2.025, 1.35, 1.6, fabricNavyMat, 3.0, 3.45));

  // BEDROOM 2 (East: x = 8.175..11.775, z = 0.225..3.825)
  furnitureGroup.add(buildBedroomSuite(9.975, 1.35, 1.5, fabricTealMat, 9.0, 3.45));

  // BATHROOM 1 (x = 3.975..5.925, z = 0.225..2.625) & BATHROOM 2 (x = 6.075..8.025, z = 0.225..2.625)
  const buildBathroomFixtures = (minX: number, maxX: number) => {
    const bath = new THREE.Group();

    // Tempered Glass Shower Enclosure in North-East corner (0.85m × 0.85m)
    const shX = maxX - 0.46;
    const shZ = 0.68;
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.08, 0.86), ceramicWhiteMat);
    tray.position.set(shX, 0.05, shZ);
    bath.add(tray);

    const glassScreen = new THREE.Mesh(new THREE.BoxGeometry(0.84, 1.95, 0.02), glassMat);
    glassScreen.position.set(shX, 1.05, shZ + 0.42);
    bath.add(glassScreen);

    const glassSide = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.95, 0.84), glassMat);
    glassSide.position.set(shX - 0.42, 1.05, shZ);
    bath.add(glassSide);

    // Chrome Overhead Shower Riser
    const riser = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 8), chromeMat);
    riser.position.set(shX, 1.45, 0.28);
    bath.add(riser);

    // Close-Coupled Ceramic WC along North wall (left side)
    const wcX = minX + 0.52;
    const wcBowl = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.4, 0.52), ceramicWhiteMat);
    wcBowl.position.set(wcX, 0.21, 0.56);
    bath.add(wcBowl);

    const wcCistern = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 0.2), ceramicWhiteMat);
    wcCistern.position.set(wcX, 0.62, 0.34);
    bath.add(wcCistern);

    // Pedestal Wash Hand Basin + Mirror on West/East wall
    const wbX = maxX - 0.32;
    const wbZ = 1.85;
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.68, 12), ceramicWhiteMat);
    pedestal.position.set(wbX, 0.35, wbZ);
    bath.add(pedestal);

    const basin = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.56), ceramicWhiteMat);
    basin.position.set(wbX, 0.76, wbZ);
    bath.add(basin);

    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.75, 0.52), chromeMat);
    mirror.position.set(maxX - 0.03, 1.42, wbZ);
    bath.add(mirror);

    return bath;
  };

  furnitureGroup.add(buildBathroomFixtures(3.975, 5.925));
  furnitureGroup.add(buildBathroomFixtures(6.075, 8.025));

  // UTILITY / STORE BAY (x = 3.975..8.025, z = 2.775..3.825)
  const utilityCabinet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.85, 0.45), warmOakMat);
  utilityCabinet.position.set(6.0, 0.94, 3.05);
  furnitureGroup.add(utilityCabinet);

  // LIVING ROOM (x = 0.225..5.625, z = 5.325..8.925)
  const livingGroup = new THREE.Group();

  // Living Room Area Rug
  const livingRug = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.012, 2.2), rugMat);
  livingRug.position.set(2.35, 0.022, 7.15);
  livingGroup.add(livingRug);

  // L-Shaped Contemporary Sofa (facing North toward TV console)
  const sofaMainBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.42, 0.88), fabricNavyMat);
  sofaMainBase.position.set(2.35, 0.22, 7.85);
  livingGroup.add(sofaMainBase);

  const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.48, 0.18), fabricNavyMat);
  sofaBack.position.set(2.35, 0.62, 8.2);
  livingGroup.add(sofaBack);

  const sofaChaise = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.42, 1.55), fabricNavyMat);
  sofaChaise.position.set(0.95, 0.22, 7.15);
  livingGroup.add(sofaChaise);

  const sofaChaiseBack = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.48, 1.55), fabricNavyMat);
  sofaChaiseBack.position.set(0.58, 0.62, 7.15);
  livingGroup.add(sofaChaiseBack);

  // Accent Throw Pillows
  for (const px of [1.5, 2.2, 2.9]) {
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.14), fabricCreamMat);
    cushion.position.set(px, 0.56, 7.98);
    livingGroup.add(cushion);
  }

  // Hardwood & Glass Coffee Table
  const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.38, 0.68), darkWoodMat);
  coffeeTable.position.set(2.45, 0.2, 6.85);
  livingGroup.add(coffeeTable);

  // Media Console & 65" Smart TV against North Spine Wall (z = 5.325)
  const tvConsole = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.48, 0.44), warmOakMat);
  tvConsole.position.set(2.35, 0.25, 5.6);
  livingGroup.add(tvConsole);

  const smartTv = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 0.88, 0.05),
    new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.15, metalness: 0.5 })
  );
  smartTv.position.set(2.35, 1.28, 5.4);
  livingGroup.add(smartTv);

  // Split AC3 on West Living Wall
  const acLiving = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.9), ceramicWhiteMat);
  acLiving.position.set(0.35, 2.55, 7.1);
  livingGroup.add(acLiving);

  furnitureGroup.add(livingGroup);

  // DINING AREA (x = 5.625..8.625, z = 5.325..8.925)
  const diningGroup = new THREE.Group();
  const dCenterX = 7.125;
  const dCenterZ = 7.125;

  // 6-Seater Hardwood Dining Table
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.06, 0.95), darkWoodMat);
  tableTop.position.set(dCenterX, 0.76, dCenterZ);
  diningGroup.add(tableTop);

  for (const [lx, lz] of [
    [-0.8, -0.38],
    [0.8, -0.38],
    [-0.8, 0.38],
    [0.8, 0.38],
  ]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.74, 0.07), darkWoodMat);
    leg.position.set(dCenterX + lx, 0.38, dCenterZ + lz);
    diningGroup.add(leg);
  }

  // 6 Upholstered Dining Chairs
  for (const cxOffset of [-0.58, 0, 0.58]) {
    for (const side of [-1, 1]) {
      const chair = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.44), fabricTealMat);
      seat.position.set(0, 0.46, 0);
      chair.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.48, 0.05), darkWoodMat);
      back.position.set(0, 0.72, side * 0.2);
      chair.add(back);

      const baseLeg = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.44, 0.38), darkWoodMat);
      baseLeg.position.set(0, 0.22, 0);
      chair.add(baseLeg);

      chair.position.set(dCenterX + cxOffset, 0, dCenterZ + side * 0.68);
      diningGroup.add(chair);
    }
  }
  furnitureGroup.add(diningGroup);

  // KITCHEN (x = 8.775..11.775, z = 5.325..8.925, with Pantry in NE corner x = 9.975..11.775, z = 5.325..6.825)
  const kitchenGroup = new THREE.Group();

  // South Counter + Granite Worktop (along South wall z = 8.325..8.925, x = 8.80..11.775)
  const southBaseCab = new THREE.Mesh(new THREE.BoxGeometry(2.95, 0.86, 0.6), warmOakMat);
  southBaseCab.position.set(10.28, 0.44, 8.62);
  kitchenGroup.add(southBaseCab);

  const southGranite = new THREE.Mesh(new THREE.BoxGeometry(2.98, 0.04, 0.63), graniteMat);
  southGranite.position.set(10.28, 0.89, 8.62);
  kitchenGroup.add(southGranite);

  // 4-Burner Hob on South Counter
  const hob = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.52), aluFrameMat);
  hob.position.set(10.0, 0.92, 8.62);
  kitchenGroup.add(hob);

  // East Counter + Stainless Sink under Window W3 (x = 11.175..11.775, z = 6.98..8.32)
  const eastBaseCab = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.86, 1.34), warmOakMat);
  eastBaseCab.position.set(11.47, 0.44, 7.65);
  kitchenGroup.add(eastBaseCab);

  const eastGranite = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.04, 1.36), graniteMat);
  eastGranite.position.set(11.47, 0.89, 7.65);
  kitchenGroup.add(eastGranite);

  // Stainless Sink & Tap
  const sinkBasin = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.03, 0.78), chromeMat);
  sinkBasin.position.set(11.47, 0.915, 7.85);
  kitchenGroup.add(sinkBasin);

  // Double-Door Stainless Refrigerator in NW Kitchen Alcove (x = 8.85..9.65, z = 5.45..6.15)
  const fridge = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.82, 0.72), chromeMat);
  fridge.position.set(9.25, 0.92, 5.75);
  kitchenGroup.add(fridge);

  // PANTRY SHELVING (x = 9.975..11.775, z = 5.325..6.825)
  for (let tier = 0; tier < 4; tier++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.035, 0.38), warmOakMat);
    shelf.position.set(10.88, 0.45 + tier * 0.48, 5.55);
    kitchenGroup.add(shelf);
  }
  furnitureGroup.add(kitchenGroup);

  // VERANDAH OUTDOOR LOUNGE SEATING (x = 0.00..6.00, z = 9.15..11.00)
  const verFurniture = new THREE.Group();
  for (const vx of [1.6, 3.2]) {
    const loungeChair = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.68, 0.72), warmOakMat);
    loungeChair.position.set(vx, 0.35, 10.05);
    verFurniture.add(loungeChair);

    const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.12, 0.64), fabricCreamMat);
    cushion.position.set(vx, 0.44, 10.05);
    verFurniture.add(cushion);
  }
  const patioTable = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.48, 16), darkWoodMat);
  patioTable.position.set(2.4, 0.25, 10.1);
  verFurniture.add(patioTable);
  furnitureGroup.add(verFurniture);

  setShadow(furnitureGroup, true, true);

  // ============================================================================
  // 6. SUSPENDED CEILING BOARD AT +3.00m FFL + RECESSED LED FIXTURES
  // ============================================================================
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: '#F8FAFC',
    roughness: 0.85,
    side: THREE.DoubleSide,
  });

  const mainCeiling = new THREE.Mesh(new THREE.BoxGeometry(11.9, 0.04, 9.05), ceilingMat);
  mainCeiling.position.set(6.0, 3.0, 4.575);
  ceilingGroup.add(mainCeiling);

  const verandahSoffit = new THREE.Mesh(
    new THREE.BoxGeometry(verFrontBeamLength, 0.04, 1.85),
    ceilingMat
  );
  verandahSoffit.position.set(verFrontBeamLength / 2, 2.82, 10.075);
  ceilingGroup.add(verandahSoffit);

  // 600×600mm Ceiling Access Hatch in Central Passage
  const accessHatch = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.6), aluFrameMat);
  accessHatch.position.set(6.0, 3.0, 4.575);
  ceilingGroup.add(accessHatch);

  // Glowing Ceiling Light Fixtures in every room
  const bulbMat = new THREE.MeshStandardMaterial({
    color: '#FEF3C7',
    emissive: '#FBBF24',
    emissiveIntensity: 0.9,
  });
  for (const rm of roomsMeta) {
    const fixtureY = rm.id === 'verandah' ? 2.78 : 2.96;
    const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16), bulbMat);
    fixture.position.set(rm.centerX, fixtureY, rm.centerZ);
    lightingGroup.add(fixture);
  }

  // Dining Room Suspended Brass Pendant Chandelier
  const pendantCord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.75, 8), brassMat);
  pendantCord.position.set(7.125, 2.6, 7.125);
  lightingGroup.add(pendantCord);

  const pendantShade = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 0.22, 16), brassMat);
  pendantShade.position.set(7.125, 2.2, 7.125);
  lightingGroup.add(pendantShade);

  // Warm Interior PointLights for First-Person Walkthrough & Cutaway Illumination
  const interiorLightCoords: [number, number, number][] = [
    [3.2, 2.75, 7.1], // Living Room
    [7.2, 2.75, 7.1], // Dining & Kitchen
    [6.0, 2.75, 4.5], // Central Spine Passage
    [2.0, 2.75, 2.0], // Bedroom 1
    [10.0, 2.75, 2.0], // Bedroom 2
  ];
  for (const [lx, ly, lz] of interiorLightCoords) {
    const ptLight = new THREE.PointLight('#FFFBEB', 1.4, 9.5, 1.5);
    ptLight.position.set(lx, ly, lz);
    lightingGroup.add(ptLight);
  }

  // ============================================================================
  // 7. 12° SPLIT-LEVEL CLERESTORY ROOF STRUCTURE (MATCHING UPLOADED DESIGN)
  // ============================================================================
  // North Wing: rises at 12° from Rear Eave (z = -0.90m, y = +3.20m) to Central Spine Ridge (z = 5.45m, y = +4.55m)
  // South Wing: slopes at 12° from Central Spine Lower Ridge (z = 5.20m, y = +4.13m) to Front Eave (z = 11.45m, y = +2.80m)
  const zNorthRear = -0.9;
  const zNorthPeak = 5.45;
  const yNorthRear = getNorthRoofElevationAtZ(zNorthRear); // +3.20m
  const yNorthPeak = getNorthRoofElevationAtZ(zNorthPeak); // ~+4.55m
  // Negative X rotation tips the +Z (Spine) end UP and the -Z (North Rear) end DOWN
  const northPitchRad = -Math.atan2(yNorthPeak - yNorthRear, zNorthPeak - zNorthRear);
  const northSlopeLen = Math.hypot(zNorthPeak - zNorthRear, yNorthPeak - yNorthRear);
  const northMidZ = (zNorthRear + zNorthPeak) / 2;
  const northMidY = (yNorthRear + yNorthPeak) / 2;

  const zSouthPeak = 5.2;
  const zSouthFront = 11.45;
  const ySouthPeak = getSouthRoofElevationAtZ(zSouthPeak); // ~+4.13m
  const ySouthFront = getSouthRoofElevationAtZ(zSouthFront); // +2.80m
  // Positive X rotation tips the +Z (South Front) end DOWN and the -Z (Spine) end UP
  const southPitchRad = Math.atan2(ySouthPeak - ySouthFront, zSouthFront - zSouthPeak);
  const southSlopeLen = Math.hypot(zSouthFront - zSouthPeak, ySouthPeak - ySouthFront);
  const southMidZ = (zSouthPeak + zSouthFront) / 2;
  const southMidY = (ySouthPeak + ySouthFront) / 2;

  // Upper Gable & Spine Masonry Walls above +3.00m ceiling datum up to underside of rafters
  const yNorthWallTop = getNorthRoofElevationAtZ(0.1125) - 0.08; // ~3.34m
  const yNorthSpineTop = getNorthRoofElevationAtZ(5.25) - 0.07; // ~4.44m
  const ySouthSpineTop = getSouthRoofElevationAtZ(5.25) - 0.07; // ~4.05m
  const ySouthWallTop = getSouthRoofElevationAtZ(9.0375) - 0.08; // ~3.24m

  // North Rear Upper Wall (z = 0.1125, y = 3.00 to yNorthWallTop)
  const northUpperH = yNorthWallTop - 3.0;
  const northUpperWall = new THREE.Mesh(
    new THREE.BoxGeometry(12.0, northUpperH, 0.225),
    extWallMat
  );
  northUpperWall.position.set(6.0, 3.0 + northUpperH / 2, 0.1125);
  roofTrussGroup.add(northUpperWall);

  // Central Spine Step-Ridge Wall (z = 5.25, y = 3.00 to yNorthSpineTop)
  const spineUpperH = yNorthSpineTop - 3.0;
  const spineUpperWall = new THREE.Mesh(
    new THREE.BoxGeometry(12.0, spineUpperH, 0.18),
    extWallMat
  );
  spineUpperWall.position.set(6.0, 3.0 + spineUpperH / 2, 5.25);
  roofTrussGroup.add(spineUpperWall);

  // South Front Upper Wall (z = 9.0375, y = 3.00 to ySouthWallTop)
  const southUpperH = ySouthWallTop - 3.0;
  const southUpperWall = new THREE.Mesh(
    new THREE.BoxGeometry(12.0, southUpperH, 0.225),
    extWallMat
  );
  southUpperWall.position.set(6.0, 3.0 + southUpperH / 2, 9.0375);
  roofTrussGroup.add(southUpperWall);

  // West & East Split-Level Gable Walls (dual-slope step profile from z = 0.225 to z = 8.925)
  const yGableNorthStart = getNorthRoofElevationAtZ(0.225) - 0.07;
  const yGableSouthEnd = getSouthRoofElevationAtZ(8.925) - 0.07;

  const gableShape = new THREE.Shape();
  gableShape.moveTo(0.225, 3.0);
  gableShape.lineTo(8.925, 3.0);
  gableShape.lineTo(8.925, yGableSouthEnd);
  gableShape.lineTo(5.25, ySouthSpineTop);
  gableShape.lineTo(5.25, yNorthSpineTop);
  gableShape.lineTo(0.225, yGableNorthStart);
  gableShape.closePath();

  const gableExtrude = new THREE.ExtrudeGeometry(gableShape, {
    depth: 0.225,
    bevelEnabled: false,
  });
  gableExtrude.rotateY(-Math.PI / 2);

  const westGable = new THREE.Mesh(gableExtrude, extWallMat);
  westGable.position.set(0.225, 0, 0);
  roofTrussGroup.add(westGable);

  const eastGable = new THREE.Mesh(gableExtrude, extWallMat);
  eastGable.position.set(12.0, 0, 0);
  roofTrussGroup.add(eastGable);

  // Timber Rafters @ 1200mm c/c (150×50mm) for North Wing & South Wing
  for (let rx = -0.6; rx <= 12.6; rx += 1.2) {
    // North Wing Rafter (rises at 12° from z = -0.90 to z = 5.45)
    const northRafter = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.14, northSlopeLen),
      warmOakMat
    );
    northRafter.position.set(rx, northMidY - 0.08, northMidZ);
    northRafter.rotation.x = northPitchRad;
    roofTrussGroup.add(northRafter);

    // South Wing Rafter (falls at 12° from z = 5.20 to maxSouthZ)
    const maxSouthZ =
      siteConfig.eastOverhangMode === 'cut-back-eave' && rx > 6.45 ? 9.6 : zSouthFront;
    const yEnd = getSouthRoofElevationAtZ(maxSouthZ);
    const sLen = Math.hypot(maxSouthZ - zSouthPeak, ySouthPeak - yEnd);
    const southRafter = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, sLen), warmOakMat);
    southRafter.position.set(rx, (ySouthPeak + yEnd) / 2 - 0.08, (zSouthPeak + maxSouthZ) / 2);
    southRafter.rotation.x = southPitchRad;
    roofTrussGroup.add(southRafter);
  }

  // Purlins @ 900mm c/c on North Wing & South Wing
  for (let pz = -0.7; pz <= 5.35; pz += 0.86) {
    const py = getNorthRoofElevationAtZ(pz);
    const purlin = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.05, 0.075), darkWoodMat);
    purlin.position.set(6.0, py - 0.02, pz);
    purlin.rotation.x = northPitchRad;
    roofTrussGroup.add(purlin);
  }

  for (let pz = 5.35; pz <= 11.35; pz += 0.86) {
    const pWidth =
      siteConfig.eastOverhangMode === 'cut-back-eave' && pz > 9.6 ? 7.35 : 13.8;
    const pCenterX =
      siteConfig.eastOverhangMode === 'cut-back-eave' && pz > 9.6 ? 2.775 : 6.0;
    const py = getSouthRoofElevationAtZ(pz);
    const purlin = new THREE.Mesh(new THREE.BoxGeometry(pWidth, 0.05, 0.075), darkWoodMat);
    purlin.position.set(pCenterX, py - 0.02, pz);
    purlin.rotation.x = southPitchRad;
    roofTrussGroup.add(purlin);
  }

  // NORTH WING 12° STANDING-SEAM ALUMINIUM ROOF SHEET (13.80m wide, z = -0.90 to 5.45m)
  const northRoofSheet = new THREE.Mesh(
    new THREE.BoxGeometry(13.8, 0.05, northSlopeLen),
    roofSheetMat
  );
  northRoofSheet.position.set(6.0, northMidY + 0.04, northMidZ);
  northRoofSheet.rotation.x = northPitchRad;
  roofSheetGroup.add(northRoofSheet);

  // 3D Raised Standing-Seam Ribs across North Wing Roof (@ 450mm c/c matching uploaded reference)
  const northSeamGeom = new THREE.BoxGeometry(0.028, 0.038, northSlopeLen - 0.04);
  for (let sx = -0.75; sx <= 12.75; sx += 0.45) {
    const seamRib = new THREE.Mesh(northSeamGeom, roofSheetMat);
    seamRib.position.set(sx, northMidY + 0.075, northMidZ);
    seamRib.rotation.x = northPitchRad;
    roofSheetGroup.add(seamRib);
  }

  // SOUTH WING 12° STANDING-SEAM ALUMINIUM ROOF SHEET (z = 5.20 to 11.45m)
  if (siteConfig.eastOverhangMode === 'cut-back-eave') {
    const yCut = getSouthRoofElevationAtZ(9.6);
    const mainSouthLen = Math.hypot(9.6 - zSouthPeak, ySouthPeak - yCut);
    const mainSouthSheet = new THREE.Mesh(
      new THREE.BoxGeometry(13.8, 0.05, mainSouthLen),
      roofSheetMat
    );
    mainSouthSheet.position.set(6.0, (ySouthPeak + yCut) / 2 + 0.04, (zSouthPeak + 9.6) / 2);
    mainSouthSheet.rotation.x = southPitchRad;
    roofSheetGroup.add(mainSouthSheet);

    const verSlopeLen = Math.hypot(zSouthFront - 9.6, yCut - ySouthFront);
    const verSouthSheet = new THREE.Mesh(
      new THREE.BoxGeometry(7.35, 0.05, verSlopeLen),
      roofSheetMat
    );
    verSouthSheet.position.set(2.775, (yCut + ySouthFront) / 2 + 0.04, (9.6 + zSouthFront) / 2);
    verSouthSheet.rotation.x = southPitchRad;
    roofSheetGroup.add(verSouthSheet);

    // 3D Raised Standing-Seam Ribs on South Wing
    for (let sx = -0.75; sx <= 12.75; sx += 0.45) {
      const sEndZ = sx > 6.45 ? 9.6 : zSouthFront;
      const sEndY = getSouthRoofElevationAtZ(sEndZ);
      const sLen = Math.hypot(sEndZ - zSouthPeak, ySouthPeak - sEndY);
      const sRib = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.038, sLen - 0.04), roofSheetMat);
      sRib.position.set(sx, (ySouthPeak + sEndY) / 2 + 0.075, (zSouthPeak + sEndZ) / 2);
      sRib.rotation.x = southPitchRad;
      roofSheetGroup.add(sRib);
    }
  } else {
    const fullSouthSheet = new THREE.Mesh(
      new THREE.BoxGeometry(13.8, 0.05, southSlopeLen),
      roofSheetMat
    );
    fullSouthSheet.position.set(6.0, southMidY + 0.04, southMidZ);
    fullSouthSheet.rotation.x = southPitchRad;
    roofSheetGroup.add(fullSouthSheet);

    const southSeamGeom = new THREE.BoxGeometry(0.028, 0.038, southSlopeLen - 0.04);
    for (let sx = -0.75; sx <= 12.75; sx += 0.45) {
      const sRib = new THREE.Mesh(southSeamGeom, roofSheetMat);
      sRib.position.set(sx, southMidY + 0.075, southMidZ);
      sRib.rotation.x = southPitchRad;
      roofSheetGroup.add(sRib);
    }
  }

  // Taupe-Grey Architectural Fascia Trim, Bargeboards & Clerestory Step Flashing (matching uploaded reference)
  const taupeFasciaMat = new THREE.MeshStandardMaterial({
    color: '#78716C',
    roughness: 0.45,
    metalness: 0.25,
  });

  // Rear (North) Low-Eave Fascia & Box Gutter at z = -0.90m (+3.20m)
  const rearGutterFascia = new THREE.Mesh(
    new THREE.BoxGeometry(13.86, 0.22, 0.14),
    taupeFasciaMat
  );
  rearGutterFascia.position.set(6.0, yNorthRear - 0.02, zNorthRear);
  roofSheetGroup.add(rearGutterFascia);

  // Upper Ridge Fascia Cap at z = 5.45m (+4.55m)
  const upperRidgeCap = new THREE.Mesh(
    new THREE.BoxGeometry(13.86, 0.22, 0.08),
    taupeFasciaMat
  );
  upperRidgeCap.position.set(6.0, yNorthPeak - 0.02, zNorthPeak);
  roofSheetGroup.add(upperRidgeCap);

  // Clerestory Step Flashing Board between Upper North Ridge (+4.54m) and Lower South Ridge (+4.12m)
  const stepFlashing = new THREE.Mesh(
    new THREE.BoxGeometry(13.8, 0.44, 0.06),
    taupeFasciaMat
  );
  stepFlashing.position.set(6.0, 4.32, 5.32);
  roofSheetGroup.add(stepFlashing);

  // Sloped West & East Bargeboards for North Wing & South Wing
  for (const bx of [-0.9, 12.9]) {
    const nBarge = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.22, northSlopeLen + 0.06),
      taupeFasciaMat
    );
    nBarge.position.set(bx, northMidY - 0.01, northMidZ);
    nBarge.rotation.x = northPitchRad;
    roofSheetGroup.add(nBarge);

    if (bx < 0 || siteConfig.eastOverhangMode !== 'cut-back-eave') {
      const sBarge = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.2, southSlopeLen + 0.06),
        taupeFasciaMat
      );
      sBarge.position.set(bx, southMidY - 0.01, southMidZ);
      sBarge.rotation.x = southPitchRad;
      roofSheetGroup.add(sBarge);
    }
  }

  // Front (South) Low-Eave Fascia & Box Gutter at z = 11.45m (+2.80m)
  const frontGutterWidth = siteConfig.eastOverhangMode === 'cut-back-eave' ? 7.35 : 13.86;
  const frontGutterX = siteConfig.eastOverhangMode === 'cut-back-eave' ? 2.775 : 6.0;
  const frontFascia = new THREE.Mesh(
    new THREE.BoxGeometry(frontGutterWidth, 0.22, 0.14),
    taupeFasciaMat
  );
  frontFascia.position.set(frontGutterX, ySouthFront - 0.02, zSouthFront);
  roofSheetGroup.add(frontFascia);

  // Ø100mm Dark Bronze Rainwater Downpipes (DP1 & DP2 on Rear North Wall Corners, matching uploaded image)
  const downpipeMat = new THREE.MeshStandardMaterial({
    color: '#292524',
    roughness: 0.35,
    metalness: 0.65,
  });

  for (const dpX of [0.18, 11.82]) {
    const dpGroup = new THREE.Group();

    // Vertical drop pipe along North external wall face (z = -0.06m, y = -0.15m to 2.78m)
    const vPipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 2.95, 12),
      downpipeMat
    );
    vPipe.position.set(dpX, 1.32, -0.06);
    dpGroup.add(vPipe);

    // Swan-neck angled offset connecting Rear Eave Gutter (z = -0.86m, y = 3.12m) to wall face (z = -0.06m, y = 2.78m)
    const offsetLen = Math.hypot(0.8, 0.34);
    const swanNeck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, offsetLen, 12),
      downpipeMat
    );
    swanNeck.position.set(dpX, 2.95, -0.46);
    swanNeck.rotation.x = Math.atan2(0.8, 0.34);
    dpGroup.add(swanNeck);

    // Wall fixing brackets
    for (const clipY of [0.55, 1.55, 2.45]) {
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.09), downpipeMat);
      bracket.position.set(dpX, clipY, -0.04);
      dpGroup.add(bracket);
    }

    // Bottom rainwater shoe discharging onto concrete apron
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.14), downpipeMat);
    shoe.position.set(dpX, -0.12, -0.09);
    dpGroup.add(shoe);

    roofSheetGroup.add(dpGroup);
  }

  setShadow(roofTrussGroup, true, true);
  setShadow(roofSheetGroup, true, true);

  // ============================================================================
  // 8. EXTERIOR LANDSCAPING, DRIVEWAY, TREES & 1,000L OVERHEAD WATER TANK TOWER
  // ============================================================================
  // Compound Grass & Paved Apron
  const lawnMat = new THREE.MeshStandardMaterial({ color: '#3F6212', roughness: 0.92 });
  const lawn = new THREE.Mesh(new THREE.BoxGeometry(30, 0.08, 28), lawnMat);
  lawn.position.set(6.0, -0.24, 5.5);
  landscapingGroup.add(lawn);

  // Interlocking Paved Walkway & Apron around building
  const apronMat = new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.8 });
  const apron = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.04, 13.4), apronMat);
  apron.position.set(6.0, -0.19, 5.5);
  landscapingGroup.add(apron);

  const frontPath = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 5.5), apronMat);
  frontPath.position.set(5.025, -0.18, 13.8);
  landscapingGroup.add(frontPath);

  // 1,000L Overhead PVC Water Tank on 3.0m Galvanized Steel Tower at East Service Yard (x = 14.2m, z = 4.8m)
  const tankTowerGroup = new THREE.Group();
  tankTowerGroup.position.set(14.2, -0.18, 4.8);
  for (const [tx, tz] of [
    [-0.55, -0.55],
    [0.55, -0.55],
    [-0.55, 0.55],
    [0.55, 0.55],
  ]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8), aluFrameMat);
    leg.position.set(tx, 1.6, tz);
    tankTowerGroup.add(leg);
  }
  const tankPlatform = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.4), aluFrameMat);
  tankPlatform.position.set(0, 3.2, 0);
  tankTowerGroup.add(tankPlatform);

  const waterTank = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.58, 1.35, 20),
    new THREE.MeshStandardMaterial({ color: '#1D4ED8', roughness: 0.35 })
  );
  waterTank.position.set(0, 3.9, 0);
  tankTowerGroup.add(waterTank);
  landscapingGroup.add(tankTowerGroup);

  // Tropical Trees & Planters around compound
  const foliageMat = new THREE.MeshStandardMaterial({ color: '#15803D', roughness: 0.85 });
  const treeCoords: [number, number, number][] = [
    [-3.5, -0.18, 9.5],
    [-3.8, -0.18, 2.5],
    [15.2, -0.18, 9.8],
    [15.5, -0.18, 2.0],
    [9.8, -0.18, 11.2],
  ];
  for (const [tx, ty, tz] of treeCoords) {
    const tree = new THREE.Group();
    tree.position.set(tx, ty, tz);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 2.2, 10), darkWoodMat);
    trunk.position.set(0, 1.1, 0);
    tree.add(trunk);

    const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 1), foliageMat);
    canopy1.position.set(0, 2.6, 0);
    tree.add(canopy1);

    const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 1), foliageMat);
    canopy2.position.set(0.45, 3.2, 0.25);
    tree.add(canopy2);

    landscapingGroup.add(tree);
  }
  setShadow(landscapingGroup, true, true);

  return {
    foundationGroup,
    floorGroup,
    externalWallsGroup,
    internalWallsGroup,
    doorsGroup,
    windowsGroup,
    furnitureGroup,
    ceilingGroup,
    roofTrussGroup,
    roofSheetGroup,
    labelsGroup,
    lightingGroup,
    landscapingGroup,
    roomFloorMeshes,
    roomHighlightMeshes,
    customizableMaterials: {
      extWallMat,
      intWallMat,
      mainFloorMat,
      roofSheetMat,
    },
  };
}
