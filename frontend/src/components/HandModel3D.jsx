import {
  useEffect,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const MODEL_URL = '/models/signverse-hands-rigged.glb';
const DEFAULT_ANIMATION = 'TEST_FINGER_FLEX';

function disposeMaterial(material) {
  if (!material) return;

  Object.values(material).forEach((value) => {
    if (value?.isTexture) value.dispose();
  });

  material.dispose?.();
}

function prepareMeshMaterial(child) {
  if (!child.isMesh && !child.isSkinnedMesh) return;

  child.frustumCulled = false;

  if (child.geometry && !child.geometry.attributes.normal) {
    child.geometry.computeVertexNormals();
  }

  const sourceMaterial = Array.isArray(child.material)
    ? child.material[0]
    : child.material;

  child.material = new THREE.MeshStandardMaterial({
    color: sourceMaterial?.color?.clone?.() || new THREE.Color(0x8a6ac8),
    map: sourceMaterial?.map || null,
    normalMap: sourceMaterial?.normalMap || null,
    roughness: 0.48,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
}

export default function HandModel3D({
  playing = false,
  progress = 0,
  speed = 1,
  zoom = 1,
  compact = false,
  animationName = DEFAULT_ANIMATION,
  onAnimationsReady,
  onDurationChange,
}) {
  const mountRef = useRef(null);

  const progressRef = useRef(progress);
  const zoomRef = useRef(zoom);
  const animationNameRef = useRef(animationName);

  const mixerRef = useRef(null);
  const actionsRef = useRef(new Map());
  const activeActionRef = useRef(null);
  const activeClipRef = useRef(null);

  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    animationNameRef.current = animationName;

    const actions = actionsRef.current;
    const action = (
      actions.get(animationName)
      || actions.get(DEFAULT_ANIMATION)
      || actions.values().next().value
      || null
    );

    if (!action) return;

    mixerRef.current?.stopAllAction();

    activeActionRef.current = action;
    activeClipRef.current = action.getClip();

    action.reset();
    action.enabled = true;
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    action.paused = true;

    onDurationChange?.(
      Math.max(activeClipRef.current.duration, 0.1),
    );
  }, [animationName, onDurationChange]);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return undefined;

    setStatus('loading');
    setError('');

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      compact ? 31 : 28,
      1,
      0.01,
      100,
    );

    camera.position.set(
      0,
      compact ? 0.58 : 0.5,
      compact ? 4.15 : 4.45,
    );

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2),
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(
      camera,
      renderer.domElement,
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 2.2;
    controls.maxDistance = 7;
    controls.target.set(0, 0.45, 0);

    const root = new THREE.Group();
    scene.add(root);

    const hemisphere = new THREE.HemisphereLight(
      0xffffff,
      0x5c496f,
      2.1,
    );
    scene.add(hemisphere);

    const keyLight = new THREE.DirectionalLight(
      0xffffff,
      3.25,
    );
    keyLight.position.set(3.8, 5.5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(
      0xcbb7ff,
      2.0,
    );
    fillLight.position.set(-4, 2.5, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(
      0x8a63d2,
      1.7,
    );
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    const loader = new GLTFLoader();

    let loadedModel = null;
    let animationFrame = null;
    let disposed = false;

    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;

        loadedModel = gltf.scene;
        loadedModel.name = 'SignVerseRiggedHands';

        loadedModel.traverse(prepareMeshMaterial);

        const box = new THREE.Box3().setFromObject(
          loadedModel,
        );

        const size = box.getSize(
          new THREE.Vector3(),
        );

        const center = box.getCenter(
          new THREE.Vector3(),
        );

        const targetHeight = compact ? 2.05 : 2.5;
        const largestDimension = Math.max(
          size.x,
          size.y,
          size.z,
          0.001,
        );
        const fitScale = targetHeight / largestDimension;

        loadedModel.scale.setScalar(fitScale);

        loadedModel.position.set(
          -center.x * fitScale,
          -center.y * fitScale + (compact ? 0.14 : 0.08),
          -center.z * fitScale,
        );

        root.add(loadedModel);

        const mixer = new THREE.AnimationMixer(
          loadedModel,
        );

        mixerRef.current = mixer;
        actionsRef.current = new Map();

        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.enabled = false;
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;

          actionsRef.current.set(
            clip.name,
            action,
          );
        });

        const animationNames = gltf.animations.map(
          (clip) => clip.name,
        );

        onAnimationsReady?.(animationNames);

        const initialAction = (
          actionsRef.current.get(
            animationNameRef.current,
          )
          || actionsRef.current.get(
            DEFAULT_ANIMATION,
          )
          || actionsRef.current.values().next().value
          || null
        );

        activeActionRef.current = initialAction;
        activeClipRef.current = initialAction?.getClip?.() || null;

        if (initialAction) {
          mixer.stopAllAction();

          initialAction.reset();
          initialAction.enabled = true;
          initialAction.setLoop(THREE.LoopOnce, 1);
          initialAction.clampWhenFinished = true;
          initialAction.play();
          initialAction.paused = true;

          onDurationChange?.(
            Math.max(
              activeClipRef.current.duration,
              0.1,
            ),
          );
        }

        setStatus('ready');
      },
      undefined,
      (loadError) => {
        if (disposed) return;

        setStatus('error');
        setError(
          loadError?.message
          || 'Impossible de charger le modèle 3D riggé.',
        );
      },
    );

    const resize = () => {
      const width = Math.max(
        mount.clientWidth,
        1,
      );

      const height = Math.max(
        mount.clientHeight,
        1,
      );

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height,
        false,
      );
    };

    const resizeObserver = new ResizeObserver(
      resize,
    );

    resizeObserver.observe(mount);
    resize();

    const animate = () => {
      animationFrame = window.requestAnimationFrame(
        animate,
      );

      const requestedZoom = THREE.MathUtils.clamp(
        zoomRef.current,
        0.75,
        1.35,
      );

      root.scale.lerp(
        new THREE.Vector3(
          requestedZoom,
          requestedZoom,
          requestedZoom,
        ),
        0.12,
      );

      const action = activeActionRef.current;
      const clip = activeClipRef.current;
      const mixer = mixerRef.current;

      if (action && clip && mixer) {
        const normalizedProgress = THREE.MathUtils.clamp(
          progressRef.current / 100,
          0,
          1,
        );

        action.enabled = true;
        action.paused = true;
        action.time = (
          clip.duration
          * normalizedProgress
        );

        // Une mise à jour avec delta 0 force Three.js à
        // recalculer le squelette à la position choisie.
        mixer.update(0);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;

      resizeObserver.disconnect();
      controls.dispose();

      if (animationFrame) {
        window.cancelAnimationFrame(
          animationFrame,
        );
      }

      mixerRef.current?.stopAllAction();
      mixerRef.current?.uncacheRoot(
        loadedModel,
      );

      actionsRef.current.clear();
      activeActionRef.current = null;
      activeClipRef.current = null;
      mixerRef.current = null;

      scene.traverse((child) => {
        if (!child.isMesh && !child.isSkinnedMesh) return;

        child.geometry?.dispose();

        if (Array.isArray(child.material)) {
          child.material.forEach(disposeMaterial);
        } else {
          disposeMaterial(child.material);
        }
      });

      renderer.dispose();

      if (
        renderer.domElement
        && mount.contains(renderer.domElement)
      ) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [
    compact,
    onAnimationsReady,
    onDurationChange,
  ]);

  return (
    <div
      ref={mountRef}
      className="hand-model-3d"
      aria-label="Visualiseur 3D des mains riggées SignVerse"
      data-playing={playing ? 'true' : 'false'}
      data-speed={speed}
    >
      {status === 'loading' && (
        <div className="hand-model-3d__status">
          Chargement du modèle 3D riggé…
        </div>
      )}

      {status === 'error' && (
        <div className="hand-model-3d__status hand-model-3d__status--error">
          {error}
        </div>
      )}

      {status === 'ready' && (
        <div className="hand-model-3d__hint">
          Glisser pour tourner · molette pour zoomer
        </div>
      )}
    </div>
  );
}
