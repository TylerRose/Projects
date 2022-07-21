<template>
  <div>
    <v-card>
      <v-card-title>Controls</v-card-title>
      <v-container class="ma-5">
        <v-row>
          <v-col cols="2">
            <v-card-text>Control Name</v-card-text>
          </v-col>
          <v-col cols="11">

          </v-col>
        </v-row>
        <v-row>
          <v-col cols="2">
            <v-card-text>Control Name</v-card-text>
          </v-col>
          <v-col cols="11">

          </v-col>
        </v-row>
      </v-container>
    </v-card>

    <v-card :height="height" :width="width">
      <canvas id="render-canvas" :height="height" :width="width"></canvas>
    </v-card>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import * as bln from "babylonjs";
import {Utils} from "@/Scripts/Utils";

@Component({})
export default class PhysicsBall extends Vue {

  canvas!: HTMLCanvasElement;
  engine!: bln.Engine;
  scene!: bln.Scene;

  height: number = 600;
  width: number = 800;

  mounted() {
    this.canvas = document.getElementById("render-canvas") as HTMLCanvasElement;
    console.log(this.canvas)
    if (this.canvas !== undefined) {
      let engine = new bln.Engine(this.canvas, true);
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
      15,
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
    this.scene.defaultMaterial = material;

    let ball = bln.MeshBuilder.CreateSphere("center", {diameter: 2})


  }


  renderLoop() {
    this.scene.render()
  }

}
</script>
