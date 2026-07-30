import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Pose } from '../data/signs';
import { REST_POSE } from '../data/signs';

interface SigningAvatarProps {
  poses: Pose[];
  playing: boolean;
  speed: number;
  rotation: number;
  zoom: number;
  onFrameChange?: (index: number) => void;
  onEnd?: () => void;
}

interface ArmRig {
  upper: THREE.Group;
  forearm: THREE.Group;
  hand: THREE.Group;
  fingers: THREE.Object3D[];
  direction: 1 | -1;
}

interface AvatarRig {
  root: THREE.Group;
  head: THREE.Group;
  left: ArmRig;
  right: ArmRig;
}

export function SigningAvatar({ poses, playing, speed, rotation, zoom, onFrameChange, onEnd }: SigningAvatarProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const poseRef = useRef<Pose>(REST_POSE);
  const animationRef = useRef<number | null>(null);
  const [frame, setFrame] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safePoses = poses.length ? poses : [REST_POSE];
  const currentPose = safePoses[Math.min(frame, safePoses.length - 1)];
  const completion = safePoses.length > 1 ? frame / (safePoses.length - 1) * 100 : 0;

  poseRef.current = currentPose;

  useEffect(() => setFrame(0), [poses]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!playing) return;
    if (frame >= safePoses.length - 1) {
      onEnd?.();
      return;
    }
    timer.current = setTimeout(() => {
      setFrame((value) => {
        const next = Math.min(value + 1, safePoses.length - 1);
        onFrameChange?.(next);
        return next;
      });
    }, 650 / speed);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, frame, speed, safePoses.length, onEnd, onFrameChange]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f7f3ff');

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.25, 8.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight('#ffffff', '#ded7e9', 2.2);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight('#ffffff', 3.4);
    keyLight.position.set(3, 5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const fillLight = new THREE.PointLight('#9d78ff', 18, 10);
    fillLight.position.set(-3.5, 1, 3);
    scene.add(fillLight);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(2.9, 64),
      new THREE.MeshStandardMaterial({ color: '#ece5fa', roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.35;
    ground.receiveShadow = true;
    scene.add(ground);

    const rig = createAvatar();
    scene.add(rig.root);

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const pose = poseRef.current;
      applyPose(rig, pose, elapsed);
      rig.root.rotation.y = THREE.MathUtils.lerp(rig.root.rotation.y, THREE.MathUtils.degToRad(rotation), 0.1);
      rig.root.scale.lerp(new THREE.Vector3(zoom, zoom, zoom), 0.12);
      rig.root.position.y = Math.sin(elapsed * 1.7) * (playing ? 0.025 : 0);
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      observer.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [rotation, zoom, playing]);

  return (
    <div className="sv-avatar-stage relative h-full w-full overflow-hidden">
      <span className="sv-coordinate sv-coordinate-a" />
      <span className="sv-coordinate sv-coordinate-b" />
      <div ref={mountRef} className="h-full w-full" role="img" aria-label="Avatar 3D réalisant une séquence en langue des signes" />
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-3 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-500">
        <span>Geste {String(frame + 1).padStart(2, '0')}</span>
        <div className="h-px flex-1 bg-zinc-300"><div className="h-px bg-violet-600 transition-all duration-500" style={{ width: `${completion}%` }} /></div>
        <span>{Math.round(completion)}%</span>
      </div>
    </div>);

}

function createAvatar(): AvatarRig {
  const root = new THREE.Group();
  root.position.y = -0.18;

  const skin = new THREE.MeshStandardMaterial({ color: '#b86f4d', roughness: 0.58, metalness: 0.02 });
  const suit = new THREE.MeshStandardMaterial({ color: '#f5f3ff', roughness: 0.38, metalness: 0.06 });
  const violet = new THREE.MeshStandardMaterial({ color: '#6d3ce8', roughness: 0.33, metalness: 0.1 });
  const hair = new THREE.MeshStandardMaterial({ color: '#201511', roughness: 0.72 });
  const dark = new THREE.MeshStandardMaterial({ color: '#221c2d', roughness: 0.55 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.82, 1.35, 8, 24), suit);
  torso.scale.set(1, 1.12, 0.72);
  torso.position.y = -0.55;
  torso.castShadow = true;
  root.add(torso);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.075, 10, 28, Math.PI), violet);
  collar.rotation.x = Math.PI / 2;
  collar.rotation.z = Math.PI;
  collar.position.y = 0.26;
  root.add(collar);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.26, 0.34, 16), skin);
  neck.position.y = 0.48;
  neck.castShadow = true;
  root.add(neck);

  const head = new THREE.Group();
  head.position.y = 1.12;
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.55, 28, 22), skin);
  face.scale.set(0.92, 1.06, 0.82);
  face.castShadow = true;
  head.add(face);

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.57, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.52), hair);
  hairCap.scale.set(0.94, 0.72, 0.86);
  hairCap.position.set(0, 0.23, 0.02);
  head.add(hairCap);

  const eyeGeometry = new THREE.SphereGeometry(0.045, 12, 10);
  [-0.18, 0.18].forEach((x) => {
    const eye = new THREE.Mesh(eyeGeometry, dark);
    eye.position.set(x, 0.02, 0.48);
    head.add(eye);
  });
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.013, 8, 16, Math.PI), dark);
  mouth.position.set(0, -0.22, 0.47);
  mouth.rotation.z = Math.PI;
  head.add(mouth);
  root.add(head);

  const left = createArm(-1, suit, skin, violet);
  const right = createArm(1, suit, skin, violet);
  root.add(left.upper, right.upper);

  return { root, head, left, right };
}

function createArm(direction: 1 | -1, suit: THREE.Material, skin: THREE.Material, violet: THREE.Material): ArmRig {
  const upper = new THREE.Group();
  upper.position.set(direction * 0.8, 0.02, 0);
  const upperMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.68, 6, 16), suit);
  upperMesh.position.y = -0.42;
  upperMesh.castShadow = true;
  upper.add(upperMesh);

  const shoulderAccent = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.028, 8, 18), violet);
  shoulderAccent.rotation.x = Math.PI / 2;
  shoulderAccent.position.y = -0.08;
  upper.add(shoulderAccent);

  const forearm = new THREE.Group();
  forearm.position.y = -0.82;
  const forearmMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.61, 6, 16), suit);
  forearmMesh.position.y = -0.35;
  forearmMesh.castShadow = true;
  forearm.add(forearmMesh);

  const hand = new THREE.Group();
  hand.position.y = -0.77;
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), skin);
  palm.scale.set(0.72, 1.05, 0.38);
  palm.castShadow = true;
  hand.add(palm);

  const fingers: THREE.Object3D[] = [];
  for (let i = -1; i <= 1; i += 1) {
    const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.16, 4, 8), skin);
    finger.position.set(i * 0.075, -0.16, 0.01);
    finger.castShadow = true;
    hand.add(finger);
    fingers.push(finger);
  }
  forearm.add(hand);
  upper.add(forearm);
  return { upper, forearm, hand, fingers, direction };
}

function applyPose(rig: AvatarRig, pose: Pose, elapsed: number): void {
  updateArm(rig.left, pose.left.upper, pose.left.fore, pose.left.hand);
  updateArm(rig.right, pose.right.upper, pose.right.fore, pose.right.hand);

  const expressionLift = pose.expression === 'surprise' ? 0.075 : pose.expression === 'sad' ? -0.035 : 0;
  rig.head.rotation.x = THREE.MathUtils.lerp(rig.head.rotation.x, expressionLift + Math.sin(elapsed * 1.4) * 0.018, 0.08);
  rig.head.rotation.z = THREE.MathUtils.lerp(rig.head.rotation.z, pose.expression === 'question' ? -0.06 : 0, 0.08);
}

function updateArm(arm: ArmRig, upperDegrees: number, foreDegrees: number, handShape: Pose['left']['hand']): void {
  const upperTarget = arm.direction * THREE.MathUtils.degToRad((upperDegrees - 10) * 0.62);
  const foreTarget = arm.direction * THREE.MathUtils.degToRad((foreDegrees - 10) * 0.55);
  arm.upper.rotation.z = THREE.MathUtils.lerp(arm.upper.rotation.z, upperTarget, 0.12);
  arm.forearm.rotation.z = THREE.MathUtils.lerp(arm.forearm.rotation.z, foreTarget, 0.14);
  arm.hand.rotation.z = THREE.MathUtils.lerp(arm.hand.rotation.z, handShape === 'point' ? arm.direction * -0.22 : handShape === 'flat' ? arm.direction * 0.14 : 0, 0.12);

  const curl = handShape === 'fist' ? Math.PI * 0.45 : handShape === 'pinch' ? Math.PI * 0.25 : handShape === 'point' ? Math.PI * 0.08 : 0;
  arm.fingers.forEach((finger, index) => {
    const target = handShape === 'point' && index === 1 ? 0 : curl;
    finger.rotation.x = THREE.MathUtils.lerp(finger.rotation.x, target, 0.16);
  });
}