<template>
  <div
    ref="container"
    @pointermove="onPointerMove"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    class="w-full h-full relative"
  >
    <div class="absolute right-0 top-0 mt-4 mr-4 flex gap-4">
      <div class="flex-col flex gap-4 bg-gray-700 rounded-md p-4 h-min">
        <div class="flex items-center gap-2">
          <HandThumbUpIcon
            class="w-10 h-10 cursor-pointer"
            @click="saveMesh"
          ></HandThumbUpIcon>
          <span class="text-xl font-medium">Save</span>
        </div>
      </div>
      <div class="flex-col flex gap-4 bg-gray-700 rounded-md p-4 h-min">
        <div class="flex gap-4 items-center">
          <span class="font-medium text-lg w-16">Strength</span>
          <input
            type="range"
            v-model.number="strength"
            min="0.5"
            max="10"
            step="0.5"
            class="w-40"
          />
          <span class="font-mono w-8 text-right">{{
            strength.toFixed(1)
          }}</span>
        </div>
        <div class="flex gap-4 items-center">
          <span class="font-medium text-lg w-16">Radius</span>
          <input
            type="range"
            v-model.number="radius"
            min="0.5"
            max="10"
            step="0.5"
            class="w-40"
          />
          <span class="font-mono w-8 text-right">{{ radius.toFixed(1) }}</span>
        </div>
      </div>
      <div class="flex-col flex gap-4 bg-gray-700 rounded-md p-4">
        <div
          class="flex items-center gap-2"
          :class="currentMode === SelectionMode.Orbit ? 'text-green-500' : ''"
        >
          <CursorArrowRaysIcon
            class="w-10 h-10 cursor-pointer"
            @click="currentMode = SelectionMode.Orbit"
          ></CursorArrowRaysIcon>
          <span class="text-xl font-medium">Orbit</span>
        </div>

        <div
          class="flex items-center gap-2"
          :class="currentMode === SelectionMode.Add ? 'text-green-500' : ''"
        >
          <PlusCircleIcon
            class="w-10 h-10 cursor-pointer"
            @click="currentMode = SelectionMode.Add"
          >
          </PlusCircleIcon>
          <span class="text-xl font-medium">Add</span>
        </div>

        <div
          class="flex items-center gap-2"
          :class="currentMode === SelectionMode.Remove ? 'text-green-500' : ''"
        >
          <MinusCircleIcon
            class="w-10 h-10 cursor-pointer"
            @click="currentMode = SelectionMode.Remove"
          >
          </MinusCircleIcon>
          <span class="text-xl font-medium">Remove</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

//@ts-expect-error
import Delaunator from "delaunator";
import {
  CursorArrowRaysIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  HandThumbUpIcon,
} from "@heroicons/vue/24/outline";

enum SelectionMode {
  Orbit,
  Add,
  Remove,
}

const currentMode = ref<SelectionMode>(SelectionMode.Orbit);

const container = ref<HTMLDivElement>();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const currentIndex = ref<number>();
const controls = ref<OrbitControls>();
let cyl:
  | THREE.Mesh<
      THREE.CylinderGeometry,
      THREE.MeshBasicMaterial,
      THREE.Object3DEventMap
    >
  | undefined = undefined;
const allowOrbit = ref(false);
const mouseDown = ref(false);
const strength = ref(0.1);
const radius = ref(0.1);

let uniforms = {
  selection: { value: new THREE.Vector3() },
  shouldShowSelection: { value: false },
  selectionColor: { value: new THREE.Color(0x00ff00) },
  radius: { value: 0.1 },
  strength: { value: 0.1 },
};

watch(
  () => strength.value,
  (value) => {
    uniforms.strength.value = value;
  }
);

watch(
  () => radius.value,
  (value) => {
    uniforms.radius.value = value;

    //set cyl radius
    if (cyl !== undefined) {
      cyl.geometry.dispose();
      cyl.geometry = new THREE.CylinderGeometry(value, value, 0.5, 32);
    }
  }
);

watch(
  () => currentMode.value,
  (value) => {
    if (value === SelectionMode.Orbit) {
      uniforms.shouldShowSelection.value = false;
      controls.value!.enablePan = true;
      controls.value!.enableRotate = true;
    } else {
      uniforms.shouldShowSelection.value = true;
      controls.value!.enablePan = false;
      controls.value!.enableRotate = false;
    }

    if (value === SelectionMode.Add) {
      uniforms.selectionColor.value = new THREE.Color(0x00ff00);
    } else if (value === SelectionMode.Remove) {
      uniforms.selectionColor.value = new THREE.Color(0xff0000);
    }
  }
);

const onPointerMove = (event: MouseEvent) => {
  if (!container.value) return;

  var rect = container.value.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;
};

const props = defineProps<{
  points: { x: number; y: number; z: number }[];
}>();

const onMouseDown = (event: MouseEvent) => {
  mouseDown.value = true;
};

const onMouseUp = (event: MouseEvent) => {
  mouseDown.value = false;
};

const generateStartingMesh = () => {
  let points = props.points;
  console.log(points);
  if (!points) {
    points = [];
    const size = 20;
    for (let i = -1 * size; i < size; i++) {
      for (let j = -1 * size; j < size; j++) {
        const y = THREE.MathUtils.randFloat(-2, 2);
        points.push({ x: i, y: j, z: y });
      }
    }
  }

  //basic cube, array of Vector3
  const points3d = points.map((v) => {
    return new THREE.Vector3(v.x, v.z, v.y);
  });
  var geom = new THREE.BufferGeometry().setFromPoints(points3d);

  // triangulate x, z
  var indexDelaunay = Delaunator.from(
    points3d.map((v) => {
      return [v.x, v.z];
    })
  );

  var meshIndex = []; // delaunay index => js index
  for (let i = 0; i < indexDelaunay.triangles.length; i++) {
    meshIndex.push(indexDelaunay.triangles[i]);
  }

  geom.setIndex(meshIndex); // add js index to the existing geometry
  geom.computeVertexNormals();

  const material = new THREE.MeshLambertMaterial({
    wireframe: false,
    color: 0x003264,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.selection = uniforms.selection;
    shader.uniforms.shouldShowSelection = uniforms.shouldShowSelection;
    shader.uniforms.selectionColor = uniforms.selectionColor;
    shader.uniforms.radius = uniforms.radius;
    shader.uniforms.strength = uniforms.strength;
    shader.vertexShader = `
        varying vec3 vPos;
      ${shader.vertexShader}
    `.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
        vPos = transformed;
      `
    );
    shader.fragmentShader = `
        #define ss(a, b, c) smoothstep(a, b, c)
        uniform vec3 selection;
        uniform bool shouldShowSelection;
        uniform vec3 selectionColor;
        uniform float radius;
        uniform float strength;
      varying vec3 vPos;
      ${shader.fragmentShader}
    `.replace(
      `#include <dithering_fragment>`,
      `#include <dithering_fragment>

        if (shouldShowSelection) {
          float dist = distance(selection.xz, vPos.xz);
          float r = radius;

          float shape = (ss(r-0.1, r, dist)*0.75 + 0.25) - ss(r, r + 0.1, dist);

          vec3 col = mix(gl_FragColor.rgb, selectionColor, shape);
          gl_FragColor = vec4(col, gl_FragColor.a);
        }
      `
    );
  };

  const mesh = new THREE.Mesh(geom, material);
  mesh.castShadow = true;
  return mesh;
};

let newMesh: any;

const init = () => {
  const scene = new THREE.Scene();
  const light = new THREE.DirectionalLight(0xffffff); // soft white light
  light.intensity = 10;
  light.castShadow = true;
  scene.background = new THREE.Color(0xffffff);
  scene.add(light);

  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(
    container.value?.clientWidth ?? 0,
    container.value?.clientHeight ?? 0
  );
  cyl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32),
    new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0 })
  );

  container.value?.appendChild(renderer.domElement);
  controls.value = new OrbitControls(camera, renderer.domElement);
  controls.value.maxPolarAngle = Math.PI / 2;
  controls.value.maxDistance = 100;
  controls.value.minDistance = 10;

  const originalMesh = generateStartingMesh();
  scene.add(cyl);
  scene.add(originalMesh);
  newMesh = generateStartingMesh();
  newMesh.material.color = new THREE.Color(0xff0000);
  newMesh.material.side = THREE.DoubleSide;
  newMesh.material.opacity = 0.4;
  newMesh.material.transparent = true;

  scene.add(newMesh);

  camera.position.z = 5;

  const animate = () => {
    requestAnimationFrame(animate);
    light.position.copy(camera.position);
    controls.value!.update();

    raycaster.setFromCamera(pointer, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObject(newMesh);

    if (intersects.length !== 0) {
      const intersection = intersects[0];
      if (intersection.faceIndex) {
        uniforms.selection.value.copy(intersection.point);
        if (cyl) {
          cyl.position.copy(intersection.point);
        }

        if (mouseDown.value && currentMode.value !== SelectionMode.Orbit) {
          const positionAttribute = newMesh.geometry.getAttribute("position");
          const face = intersection.face!;

          const offset =
            currentMode.value === SelectionMode.Add
              ? strength.value
              : -1 * strength.value;

          positionAttribute.setY(
            face.a,
            positionAttribute.getY(face.a) + offset
          );
          positionAttribute.setY(
            face.b,
            positionAttribute.getY(face.b) + offset
          );
          positionAttribute.setY(
            face.c,
            positionAttribute.getY(face.c) + offset
          );

          positionAttribute.needsUpdate = true;
        }
      }
    }

    if (intersects.length !== 0) {
      currentIndex.value = intersects[0].faceIndex;
    }

    renderer.render(scene, camera);
  };

  animate();
};

const emit = defineEmits<{
  saved: [value: { x: number; y: number; z: number }[]];
}>();

//For each of the input points, get the new Y position.
const saveMesh = () => {
  let gp = newMesh.geometry.attributes.position;
  let wPos = [];
  for (let i = 0; i < gp.count; i++) {
    let p = new THREE.Vector3().fromBufferAttribute(gp, i); // set p from `position`
    newMesh.localToWorld(p); // p has wordl coords
    wPos.push(p);
  }
  const points = wPos.map((v) => {
    return { x: v.x, y: v.z, z: v.y };
  });
  console.log(points);
  emit("saved", points);
};

onNuxtReady(() => {
  init();
});
</script>
