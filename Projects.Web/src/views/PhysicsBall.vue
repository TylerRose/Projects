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
import {Component, Vue} from "vue-property-decorator";
import * as bln from "babylonjs";
import {Space} from "babylonjs/Maths/math.axis";
import {Utils} from "@/Scripts/Utils";

@Component({})
export default class PhysicsBall extends Vue {

  canvas!: HTMLCanvasElement;
  engine!: bln.Engine;
  scene!: bln.Scene;

  height: number = 600;
  width: number = 800;

  gravity = new bln.Vector3(0, -9.81, 0);

  mounted() {
    this.canvas = document.getElementById("render-canvas") as HTMLCanvasElement;
    console.log(this.canvas)
    if (this.canvas !== undefined) {
      let engine = new bln.Engine(this.canvas, true);
      console.log(engine);
      this.engine = engine;
      const gravityVector = this.gravity;
      const physicsPlugin = new bln.CannonJSPlugin();
      this.scene = new bln.Scene(this.engine);
      this.scene.enablePhysics(gravityVector, physicsPlugin);
      this.createScene();
      this.engine.runRenderLoop(this.renderLoop);
    }
  }

  ball!:bln.Mesh;

  createScene() {
    this.scene.clearColor = new bln.Color4(0.2, 0.2, 0.2, 0.5,)

    const camera = new bln.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      200,
      new bln.Vector3(0, -50, 0)
    );
    camera.attachControl(this.canvas, true);
    this.scene.activeCamera = camera;

    const light = new bln.HemisphericLight(
      "SceneLight",
      new bln.Vector3(1, 1, 0),
      this.scene
    );

    const material = new bln.StandardMaterial("material", this.scene);
    material.emissiveColor = new bln.Color3(0.01, 0.01, 0.01);
    this.scene.defaultMaterial = material;

    var ground = bln.MeshBuilder.CreateBox('ground', {size: 200, height: 1}, this.scene)
    ground.physicsImpostor = new bln.PhysicsImpostor(ground, bln.PhysicsImpostor.BoxImpostor, {
      mass: 0,
      friction: 0.5,
      restitution: 1
    }, this.scene);
    ground.position = new bln.Vector3(0,-50,0);
    ground.rotate(new bln.Vector3(0,0,1),10, bln.Space.LOCAL)

    var ball = bln.MeshBuilder.CreateSphere('ball', {diameter:5});
    const ballMaterial = new bln.StandardMaterial("material", this.scene);
    ballMaterial.emissiveColor = new bln.Color3(0.01, 0.2, 0.01);
    ball.material = ballMaterial;
    ball.physicsImpostor = new bln.PhysicsImpostor(ball,bln.PhysicsImpostor.SphereImpostor,{mass:10})


    this.ball = ball;
  }

  renderLoop() {
    this.scene.render()
  }

}
</script>
