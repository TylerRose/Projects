<template>
  <div class="home">
    <v-text-field
      v-model="theta"
      hide-details
      single-line
      label="Angle Theta"
      suffix="degrees"
      outlined
      type="number"
      min="-360"
      max="360"
    />
    <v-text-field
      v-model="phi"
      hide-details
      single-line
      label="Angle Phi"
      suffix="degrees"
      outlined
      type="number"
      min="-360"
      max="360"
    />
    <v-card :height="height" :width="width">
      <canvas id="render-canvas" :height="height" :width="width"></canvas>
    </v-card>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import * as bln from "babylonjs";
import { Utils } from "@/Scripts/Utils";

@Component({})
export default class SphericalCoords extends Vue {

  canvas!: HTMLCanvasElement;
  engine!: bln.Engine;
  scene!: bln.Scene;

  height: number = 600;
  width: number = 800;

  theta: number = 0;
  phi: number = 0;

  mounted() {
    console.log("mount")
    this.canvas = document.getElementById("render-canvas") as HTMLCanvasElement;
    console.log(this.canvas)
    if (this.canvas !== undefined) {
      let engine = new bln.Engine(this.canvas, false);
      console.log(engine);
      this.engine = engine;
      this.scene = new bln.Scene(this.engine);
      this.createScene();
      this.engine.runRenderLoop(this.renderLoop);
    }
  }


  createScene() {
    this.scene.clearColor = new bln.Color4(0.2, 0.2, 0.2, 0.5,)

    const camera = new bln.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      new bln.Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);
    this.scene.activeCamera = camera;

    const light = new bln.HemisphericLight(
      "SceneLight",
      new bln.Vector3(1, 1, 0),
      this.scene
    );

    const material = new bln.StandardMaterial("material", this.scene);
    material.emissiveColor = new bln.Color3(0.5, 0.5, 0.5);
    const ball = bln.MeshBuilder.CreateSphere("ball", {diameter: 1});

  }


  renderLoop() {
  }

}
</script>
