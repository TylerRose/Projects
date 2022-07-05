<template>
  <div class="home">
    <v-row> Controls </v-row>
    <v-row>
      <v-col cols="1">
        <v-card-text>Angle Theta</v-card-text>
      </v-col>
      <v-col cols="11">
        <v-slider
          v-model="theta"
          class="ma-3"
          :step="Math.PI/6"
          :min="0"
          :max="Math.PI*2"
          thumb-color="blue"
          thumb-label="always"
        ></v-slider>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="1">
        <v-card-text>Angle Phi</v-card-text>
      </v-col>
      <v-col cols="11">
        <v-slider
          v-model="phi"
          class="ma-3"
          :step="Math.PI/6"
          :min="0"
          :max="Math.PI*2"
          thumb-color="blue"
          thumb-label="always"
        ></v-slider>
      </v-col>
    </v-row>


    <v-card :height="height" :width="width">
      <canvas id="render-canvas" :height="height" :width="width"></canvas>
    </v-card>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
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
  sectorThetaPoints:any[] = []
  sectortheta = bln.MeshBuilder.CreateLines('sectortheta', {points: this.sectorThetaPoints, updatable:true})

  phi: number = 0;
  sectorPhiPoints:any[] = []
  sectorphi = bln.MeshBuilder.CreateLines('sectorphi', {points: this.sectorPhiPoints, updatable:true})


  mounted() {
    console.log("mount")
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


    const wireframeMaterial = new bln.StandardMaterial("material", this.scene);
    wireframeMaterial.emissiveColor = new bln.Color3(0.5, 0.5, 0.5);
    wireframeMaterial.wireframe = true;
    const material = new bln.StandardMaterial("material", this.scene);
    material.emissiveColor = new bln.Color3(0.5, 0.5, 0.5);
    this.scene.defaultMaterial = material;
    //create a wireframe ring
    const diameter = 10
    const ball = bln.MeshBuilder.CreateSphere("ball", {diameter: diameter, arc:0.001});
    const ball2 = bln.MeshBuilder.CreateSphere("ball", {diameter: diameter, arc:0.001});
    ball2.rotate(new bln.Vector3(0,0,1),Math.PI)
    let mesh = bln.Mesh.MergeMeshes([ball, ball2], true, true, undefined, false, true);
    mesh!.material=wireframeMaterial
    //Create the other two rings
    let mesh2 = mesh!.createInstance("mesh")
    mesh2.rotate(new bln.Vector3(1,0,0), Math.PI/2)
    let mesh3 = mesh!.createInstance("mesh")
    mesh3.rotate(new bln.Vector3(0,1,0), Math.PI/2)

    let centerPoint = bln.MeshBuilder.CreateSphere("center",{diameter:0.25})



  }


  renderLoop() {
    this.scene.render()
  }

  @Watch('phi')
  updatePhiSector(){
    let axis1 = Utils.vec3(0).subtract(new bln.Vector3(-5,-5,0))
    let axis2 = Utils.vec3(0).subtract(new bln.Vector3(5,0,0))
    this.showAngleSector(axis2, axis1, Utils.vec3(0),2, 0)
  }
  //https://playground.babylonjs.com/#FUK3S#8
  showAngleSector(origin: bln.DeepImmutableObject<bln.Vector3>, vector1: bln.DeepImmutableObject<bln.Vector3>, vector2: bln.DeepImmutableObject<bln.Vector3>, radius: number, sectorType: number) {
    radius = radius || 1;
    sectorType = sectorType || 0;
    var cross = bln.Vector3.Cross(vector1, vector2);
    var dot = bln.Vector3.Dot(vector1, vector2);
    var angle = this.phi//Math.acos(Math.max(Math.min(dot / (vector1.length() * vector2.length()),1),-1));
    var points = [];
    var minNb = 4;
    var factor = 2;
    var nbPoints = Math.floor(radius * angle * factor);
    nbPoints = (nbPoints < minNb) ? minNb : nbPoints;

    var firstPoint = ((bln.Vector3.Normalize(vector1)).scale(radius));
    var lastPoint = ((bln.Vector3.Normalize(vector2)).scale(radius));
    var matrix;
    var ang = angle / nbPoints;
    var rotated;
    for (var i = 0; i < nbPoints; i++) {
      matrix = bln.Matrix.RotationAxis(cross, ang * i);
      rotated = bln.Vector3.TransformCoordinates(firstPoint, matrix);
      points.push(rotated.add(origin));
    }
    points.push(lastPoint.add(origin));

    var sector = bln.Mesh.CreateLines("sector", points, this.scene, true);
    this.sectorPhiPoints=points;

    return sector;
  }

}
</script>
