<template>
  <div class="ma-3 pa-3">
    <v-card>
      <v-card-title class="ma-3 pa-0"> Controls</v-card-title>
      <v-container class="ma-5">
        <v-row>
          <v-col>
            <v-btn class="mb-10" @click="doTrace = !doTrace">Trace</v-btn>
          </v-col>
          <v-col>
            <v-btn class="mb-10" @click="reload">Reset</v-btn>
          </v-col>
          <v-col>
            <v-btn class="mb-10" @click="defaults">Set Defaults</v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-slider
            v-model="mass1"
            class="ma-3"
            min="1"
            label="Mass 1"
            thumb-color="blue"
            thumb-label="always"
          ></v-slider>
          <v-slider
            v-model="radius1"
            class="ma-3"
            min="1"
            label="Radius 1"
            thumb-color="blue"
            thumb-label="always"
          ></v-slider>
          <v-text-field
            v-model="initialAngle1x"
            hide-details
            single-line
            label="Initial Angle 1"
            suffix="radians"
            outlined
            type="number"
          />
        </v-row>
        <v-row>
          <v-slider
            v-model="mass2"
            class="ma-3"
            min="1"
            label="Mass 2"
            thumb-color="blue"
            thumb-label="always"
          ></v-slider>
          <v-slider
            v-model="radius2"
            class="ma-3"
            min="1"
            label="Radius 2"
            thumb-color="blue"
            thumb-label="always"
          ></v-slider>
          <v-text-field
            v-model="initialAngle2x"
            hide-details
            single-line
            label="Initial Angle 2"
            suffix="radians"
            type="number"
          />
        </v-row>
        <v-row>
          <v-slider
            v-model="gravity"
            class="ma-3"
            min="0.001"
            step="0.001"
            max="1"
            label="Gravity"
            thumb-color="blue"
            thumb-label="always"
          ></v-slider>
        </v-row>
      </v-container>
    </v-card>
    <v-card :height="height" :width="width">
      <canvas id="render-canvas" :height="height" :width="width"></canvas>
    </v-card>
    <v-card></v-card>
  </div>
</template>
<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import * as bln from "babylonjs";
import {Utils} from "@/Scripts/Utils";
import Vector3 = bln.Vector3;

@Component({components: {}})
export default class Pendulum extends Vue {
  mass1 = 0;
  radius1 = 10;
  mass2 = 0;
  radius2 = 10;
  gravity = 0;

  initialAngle1x = 0;
  initialAngle2x = 0;
  initialAngle1z = 0;
  initialAngle2z = 0;

  aspectRatio: number = 16 / 9;
  height = 600;
  width: number = this.height * this.aspectRatio;

  canvas!: HTMLCanvasElement;
  engine!: bln.Engine;
  scene!: bln.Scene;
  traceScene!: bln.Scene;
  doTrace = true;

  angle1x_vel = 0;
  angle2x_vel = 0;
  angle1x_acc = 0;
  angle2x_acc = 0;
  angle1x = 0;
  angle2x = 0;

  angle1z_vel = 0;
  angle2z_vel = 0;
  angle1z_acc = 0;
  angle2z_acc = 0;
  angle1z = 0;
  angle2z = 0;

  ball1Accel: Vector3 = new Vector3(0, 0, 0);
  ball1Vel: Vector3 = new Vector3(0, 0, 0);

  box!: bln.Mesh;
  box2!: bln.Mesh;
  ball1!: bln.Mesh;
  ball2!: bln.Mesh;

  traceOptions = {
    points: [Utils.vec3(999), Utils.vec3(999)],
    updatable: true,
  };
  trace!: bln.LinesMesh;

  lineOptions = {
    points: [Utils.vec3(0), Utils.vec3(0), Utils.vec3(0)],
    updatable: true,
  };
  lines!: bln.LinesMesh;

  mounted() {
    const initRad1 = localStorage.getItem("radius1");
    if (initRad1 !== null) this.radius1 = Number.parseFloat(initRad1);
    else this.defaults();
    const initRad2 = localStorage.getItem("radius2");
    if (initRad2 !== null) this.radius2 = Number.parseFloat(initRad2);

    const initMass1 = localStorage.getItem("mass1");
    if (initMass1 !== null) this.mass1 = Number.parseFloat(initMass1);
    const initMass2 = localStorage.getItem("mass2");
    if (initMass2 !== null) this.mass2 = Number.parseFloat(initMass2);

    const initAngle1x = localStorage.getItem("initialAngle1x");
    if (initAngle1x !== null) {
      this.angle1x = Number.parseFloat(initAngle1x);
      this.initialAngle1x = this.angle1x;
    }
    const initAngle2x = localStorage.getItem("initialAngle2x");
    if (initAngle2x !== null) {
      this.angle2x = Number.parseFloat(initAngle2x);
      this.initialAngle2x = this.angle2x;
    }

    const initAngle1z = localStorage.getItem("initialAngle1z");
    if (initAngle1z !== null) {
      this.angle1z = Number.parseFloat(initAngle1z);
      this.initialAngle1z = this.angle1z;
    }
    const initAngle2z = localStorage.getItem("initialAngle2z");
    if (initAngle2z !== null) {
      this.angle2z = Number.parseFloat(initAngle2z);
      this.initialAngle2z = this.angle2z;
    }
    
    const gravity = localStorage.getItem("gravity");
    if (gravity !== null) this.gravity = Number.parseFloat(gravity);

    this.canvas = document.getElementById("render-canvas") as HTMLCanvasElement;
    if (this.canvas !== undefined) {
      this.engine = new bln.Engine(this.canvas, false);
      this.scene = new bln.Scene(this.engine);
      this.traceScene = new bln.Scene(this.engine);
      this.createScene();
      this.engine.runRenderLoop(this.renderLoop);
    }
  }

  @Watch("radius1")
  saveR1() {
    localStorage.setItem("radius1", this.radius1.toString());
  }

  @Watch("radius2")
  saveR2() {
    localStorage.setItem("radius2", this.radius2.toString());
  }

  @Watch("mass1")
  saveM1() {
    localStorage.setItem("mass1", this.mass1.toString());
  }

  @Watch("mass2")
  saveM2() {
    localStorage.setItem("mass2", this.mass2.toString());
  }

  @Watch("initialAngle1x")
  saveA1x() {
    localStorage.setItem("initialAngle1x", this.initialAngle1x.toString());
  }

  @Watch("initialAngle2x")
  saveA2x() {
    localStorage.setItem("initialAngle2x", this.initialAngle2x.toString());
  }

  @Watch("initialAngle1z")
  saveA1z() {
    localStorage.setItem("initialAngle1z", this.initialAngle1z.toString());
  }

  @Watch("initialAngle2z")
  saveA2z() {
    localStorage.setItem("initialAngle2z", this.initialAngle2z.toString());
  }

  @Watch("gravity")
  saveG() {
    localStorage.setItem("gravity", this.gravity.toString());
  }

  reload() {
    location.reload();
  }

  defaults() {
    /*
        this.radius1 = 10;
    this.radius2 = 15;
    this.mass1 = 15;
    this.mass2 = 5;
    this.gravity = 0.1;
    this.initialAngle1x = 90;
    this.initialAngle2x = 135;
     */
    this.radius1 = 10;
    this.radius2 = 15;
    this.mass1 = 15;
    this.mass2 = 5;
    this.gravity = 0.1;
    // this.initialAngle1x = 90;
    // this.initialAngle2x = 135;
    this.initialAngle1x = 0;
    this.initialAngle2x = 0;
    this.initialAngle1z = 0;
    this.initialAngle2z = 0;
  }

  get angle1xDeg() {
    return Number.parseFloat(
      ((this.angle1x * (180 / Math.PI)) % 360).toPrecision(12)
    );
  }

  set angle1xDeg(value: number) {
    this.initialAngle1x = value * (Math.PI / 180);
  }

  get angle2xDeg() {
    return Number.parseFloat(
      ((this.angle1x * (180 / Math.PI)) % 360).toPrecision(12)
    );
  }

  get angle1zDeg() {
    return Number.parseFloat(
      ((this.angle1z * (180 / Math.PI)) % 360).toPrecision(12)
    );
  }

  set angle1zDeg(value: number) {
    this.initialAngle1z = value * (Math.PI / 180);
  }

  get angle2zDeg() {
    return Number.parseFloat(
      ((this.angle1z * (180 / Math.PI)) % 360).toPrecision(12)
    );
  }


  set angle2xDeg(value: number) {
    this.initialAngle2x = value * (Math.PI / 180);
  }

  async createScene() {
    this.scene.clearColor = new bln.Color4(0.2, 0.2, 0.2, 0.5);
    this.traceScene.clearColor = new bln.Color4(0.2, 0.2, 0.2, 0.5);
    //this.traceScene.autoClear = false

    const camera = new bln.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      2 * (this.radius1 + this.radius2) + 10,
      new bln.Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);
    this.scene.activeCamera = camera;
    this.traceScene.activeCamera = camera;

    const light = new bln.HemisphericLight(
      "light",
      new bln.Vector3(1, 1, 0),
      this.scene
    );
    const light2 = new bln.HemisphericLight(
      "light",
      new bln.Vector3(1, 1, 0),
      this.traceScene
    );

    const material = new bln.StandardMaterial("material", this.scene);
    material.emissiveColor = new bln.Color3(0.5, 0.5, 0.5);
    const material2 = new bln.StandardMaterial("material", this.scene);
    material2.emissiveColor = new bln.Color3(0.5, 1.0, 0.5);

    this.ball1 = bln.MeshBuilder.CreateSphere("ball", {diameter: 1});
    this.ball1.material = material;
    this.ball2 = bln.MeshBuilder.CreateSphere("ball", {diameter: 1});
    this.ball2.material = material2;

    //this.lines = bln.MeshBuilder.CreateLines('lines', this.lineOptions, this.scene);
    //this.box = bln.MeshBuilder.CreateBox("box");
    //this.box2 = bln.MeshBuilder.CreateBox("box2");
    //this.box2.position = this.ball2.position
    material.freeze();
    material2.freeze();
  }

  first = true;

  renderLoop() {
    this.scene.render();
    this.traceScene.render();
    //let trace = bln.MeshBuilder.CreateSphere("trace", {diameter: 0.25})
    //trace.position = this.ball2.position;

    if (!this.doTrace) {
      //trace.dispose();
      this.traceScene.getMeshesById("trace").forEach((m) => m.dispose());
      //console.log(this.traceScene.getMeshesById('trace'))
    }
    this.traceScene
      .getMeshesById("trace")
      .filter((m) => m.position == Utils.vec3(0))
      .forEach((m) => m.dispose());

    if (Math.abs(this.angle1x_acc) <= 100 && Math.abs(this.angle2x_acc) <= 100) {
      this.lineOptions.points = [
        Utils.vec3(0),
        this.ball1.position,
        this.ball2.position,
      ];

      //console.log(this.traceOptions.points)
      //if (this.ball2.position !== Utils.vec3(0))
      this.traceOptions.points[0] = this.ball2.position;

      // this.ball1.position = Utils.vec3(this.radius1).multiply(new Vector3(Math.sin(this.angle1),Math.cos(this.angle1),0))
      // this.ball2.position = this.ball1.position.add(Utils.vec3(this.radius2).multiply(new Vector3(Math.sin(this.angle2),Math.cos(this.angle2),0)))
      // console.log(Utils.dist3(this.ball1.position, new Vector3(0, 0, 0)))

      //Apply some gravity left/right
      const angle1x_vel2 = Math.pow(this.angle1x_vel, 2);
      const angle2x_vel2 = Math.pow(this.angle2x_vel, 2);
      let numerator1 =
        -this.gravity * (2 * this.mass1 + this.mass2) * Math.sin(this.angle1x) -
        this.mass2 * this.gravity * Math.sin(this.angle1x - 2 * this.angle2x) -
        2 *
        Math.sin(this.angle1x - this.angle2x) *
        this.mass2 *
        (Math.pow(this.angle2x_vel, 2) * this.radius2 +
          angle1x_vel2 * this.radius1 * Math.cos(this.angle1x - this.angle2x));

      let numerator2 =
        2 *
        Math.sin(this.angle1x - this.angle2x) *
        (angle1x_vel2 * this.radius1 * (this.mass1 + this.mass2) +
          this.gravity * (this.mass1 + this.mass2) * Math.cos(this.angle1x) +
          angle2x_vel2 *
          this.radius2 *
          this.mass2 *
          Math.cos(this.angle1x - this.angle2x));
      let denominator =
        2 * this.mass1 +
        this.mass2 -
        this.mass2 * Math.cos(2 * this.angle1x - 2 * this.angle2x);

      this.angle1x_acc = numerator1 / (this.radius1 * denominator);
      this.angle2x_acc = numerator2 / (this.radius2 * denominator);

      //Apply some gravity forward/backward
      const angle1z_vel2 = Math.pow(this.angle1z_vel, 2);
      const angle2z_vel2 = Math.pow(this.angle2z_vel, 2);
      numerator1 =
        -this.gravity * (2 * this.mass1 + this.mass2) * Math.sin(this.angle1z) -
        this.mass2 * this.gravity * Math.sin(this.angle1z - 2 * this.angle2z) -
        2 *
        Math.sin(this.angle1z - this.angle2z) *
        this.mass2 *
        (Math.pow(this.angle2z_vel, 2) * this.radius2 +
          angle1z_vel2 * this.radius1 * Math.cos(this.angle1z - this.angle2z));

      numerator2 =
        2 *
        Math.sin(this.angle1z - this.angle2z) *
        (angle1z_vel2 * this.radius1 * (this.mass1 + this.mass2) +
          this.gravity * (this.mass1 + this.mass2) * Math.cos(this.angle1z) +
          angle2z_vel2 *
          this.radius2 *
          this.mass2 *
          Math.cos(this.angle1z - this.angle2z));
      denominator =
        2 * this.mass1 +
        this.mass2 -
        this.mass2 * Math.cos(2 * this.angle1z - 2 * this.angle2z);

      this.angle1z_acc = numerator1 / (this.radius1 * denominator);
      this.angle2z_acc = numerator2 / (this.radius2 * denominator);
      // console.log(this.angle1_acc)
      // console.log(this.angle2_acc)

      this.angle1x_vel += this.angle1x_acc;
      this.angle2x_vel += this.angle2x_acc;
      this.angle1x += this.angle1x_vel;
      this.angle2x += this.angle2x_vel;

      this.angle1z_vel += this.angle1z_acc;
      this.angle2z_vel += this.angle2z_acc;
      this.angle1z += this.angle1z_vel;
      this.angle2z += this.angle2z_vel;

      let y1 = -1 * this.radius1 * Math.sin(this.angle1z) * Math.sin(this.angle1x);
      let x1 = -1 * this.radius1 * Math.sin(this.angle1x) * Math.cos(this.angle1z);
      let z1 = -1 * this.radius1 * Math.cos(this.angle1z);

      let y2 = y1 - this.radius1 * Math.sin(this.angle1z) * Math.sin(this.angle1x);
      let x2 = x1 - this.radius1 * Math.sin(this.angle1x) * Math.cos(this.angle1z);
      let z2 = z1 - this.radius1 * Math.cos(this.angle1z);

      this.ball1.position = new bln.Vector3(x1, y1, z1);
      // this.lineOptions.points[1] = this.ball1.position;

      this.ball2.position = new bln.Vector3(x2, y2, z2);
      // this.lineOptions.points[2] = this.ball2.position;
      //this.box2.position = this.ball2.position

      //console.log("dist: ",Utils.dist3(Utils.vec3(0),this.ball2.position))
      this.traceOptions.points[1] = this.ball2.position;
      if (this.doTrace && !this.first)
        this.trace = bln.MeshBuilder.CreateLines(
          "trace",
          this.traceOptions,
          this.traceScene
        );
      this.first = false;
    }
  }
}
</script>
