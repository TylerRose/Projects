<template>
  <div>
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
            v-model="angle1xDeg"
            hide-details
            single-line
            label="Initial Angle 1"
            suffix="degrees"
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
            v-model="angle2xDeg"
            hide-details
            single-line
            label="Initial Angle 2"
            suffix="degrees"
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
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import * as bln from "babylonjs";
import { Utils } from "@/Scripts/Utils";
import Vector3 = bln.Vector3;

@Component({ components: {} })
export default class Pendulum extends Vue {
  mass1 = 0;
  radius1 = 10;
  mass2 = 0;
  radius2 = 10;
  gravity = 0;

  initialAngle1 = 0;
  initialAngle2 = 0;

  aspectRatio: number = 16 / 9;
  height = 600;
  width: number = this.height * this.aspectRatio;

  canvas!: HTMLCanvasElement;
  engine!: bln.Engine;
  scene!: bln.Scene;
  traceScene!: bln.Scene;
  doTrace = true;

  angle1_vel = 0;
  angle2_vel = 0;
  angle1_acc = 0;
  angle2_acc = 0;
  angle1 = 0;
  angle2 = 0;

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
    const initRad2 = localStorage.getItem("radius2");
    if (initRad2 !== null) this.radius2 = Number.parseFloat(initRad2);

    const initMass1 = localStorage.getItem("mass1");
    if (initMass1 !== null) this.mass1 = Number.parseFloat(initMass1);
    const initMass2 = localStorage.getItem("mass2");
    if (initMass2 !== null) this.mass2 = Number.parseFloat(initMass2);

    const initAngle1 = localStorage.getItem("initialAngle1");
    if (initAngle1 !== null) {
      this.angle1 = Number.parseFloat(initAngle1);
      this.initialAngle1 = this.angle1;
    }
    const initAngle2 = localStorage.getItem("initialAngle2");
    if (initAngle2 !== null) {
      this.angle2 = Number.parseFloat(initAngle2);
      this.initialAngle2 = this.angle2;
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

  @Watch("initialAngle1")
  saveA1() {
    localStorage.setItem("initialAngle1", this.initialAngle1.toString());
  }

  @Watch("initialAngle2")
  saveA2() {
    localStorage.setItem("initialAngle2", this.initialAngle2.toString());
  }

  @Watch("gravity")
  saveG() {
    localStorage.setItem("gravity", this.gravity.toString());
  }

  reload() {
    location.reload();
  }

  defaults() {
    this.radius1 = 10;
    this.radius2 = 15;
    this.mass1 = 15;
    this.mass2 = 5;
    this.gravity = 0.1;
    this.angle1xDeg = 90;
    this.angle2xDeg = 90;
  }

  get angle1xDeg() {
    return Number.parseFloat(
      ((this.initialAngle1 * (180 / Math.PI)) % 360).toPrecision(12)
    );
  }

  set angle1xDeg(value: number) {
    this.initialAngle1 = value * (Math.PI / 180);
  }

  get angle2xDeg() {
    return Number.parseFloat(
      ((this.initialAngle2 * (180 / Math.PI)) % 360).toPrecision(12)
    );
  }

  set angle2xDeg(value: number) {
    this.initialAngle2 = value * (Math.PI / 180);
  }
  //
  // get angle1zDeg() {
  //   return Number.parseFloat(
  //     ((this.initialAngle1z * (180 / Math.PI)) % 360).toPrecision(12)
  //   );
  // }
  //
  // set angle1zDeg(value: number) {
  //   this.initialAngle1z = value * (Math.PI / 180);
  // }
  //
  // get angle2zDeg() {
  //   return Number.parseFloat(
  //     ((this.initialAngle2z * (180 / Math.PI)) % 360).toPrecision(12)
  //   );
  // }


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

    this.ball1 = bln.MeshBuilder.CreateSphere("ball", { diameter: 1 });
    this.ball1.material = material;
    this.ball2 = bln.MeshBuilder.CreateSphere("ball", { diameter: 1 });
    this.ball2.material = material2;

    //this.lines = bln.MeshBuilder.CreateLines('lines', this.lineOptions, this.scene);

    // console.log("1 ", this.ball1.position.toString());
    // console.log("2 ", this.ball2.position.toString());

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

    if (Math.abs(this.angle1_acc) <= 100 && Math.abs(this.angle2_acc) <= 100) {
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

      //Apply some gravity
      const angle1_vel2 = Math.pow(this.angle1_vel, 2);
      const angle2_vel2 = Math.pow(this.angle2_vel, 2);
      let numerator1 =
        -this.gravity * (2 * this.mass1 + this.mass2) * Math.sin(this.angle1) -
        this.mass2 * this.gravity * Math.sin(this.angle1 - 2 * this.angle2) -
        2 *
          Math.sin(this.angle1 - this.angle2) *
          this.mass2 *
          (Math.pow(this.angle2_vel, 2) * this.radius2 +
            angle1_vel2 * this.radius1 * Math.cos(this.angle1 - this.angle2));

      let numerator2 =
        2 *
        Math.sin(this.angle1 - this.angle2) *
        (angle1_vel2 * this.radius1 * (this.mass1 + this.mass2) +
          this.gravity * (this.mass1 + this.mass2) * Math.cos(this.angle1) +
          angle2_vel2 *
            this.radius2 *
            this.mass2 *
            Math.cos(this.angle1 - this.angle2));
      let denominator =
        2 * this.mass1 +
        this.mass2 -
        this.mass2 * Math.cos(2 * this.angle1 - 2 * this.angle2);

      // Double pendulum equation
      // Arm one
      let num1 =
        -this.gravity * (2 * this.mass1 + this.mass2) * Math.sin(this.angle1);
      let num2 =
        -this.mass2 * this.gravity * Math.sin(this.angle1 - 2 * this.angle2);
      let num3 = -2 * Math.sin(this.angle1 - this.angle2) * this.mass2;
      let num4 =
        this.angle2_vel * this.angle2_vel * this.radius2 +
        this.angle1_vel *
          this.angle1_vel *
          this.radius1 *
          Math.cos(this.angle1 - this.angle2);
      let den =
        this.radius1 *
        (2 * this.mass1 +
          this.mass2 -
          this.mass2 * Math.cos(2 * this.angle1 - 2 * this.angle2));
      const a1acc = (num1 + num2 + num3 * num4) / den;
      // Arm two
      num1 = 2 * Math.sin(this.angle1 - this.angle2);
      num2 =
        this.angle1_vel *
        this.angle1_vel *
        this.radius1 *
        (this.mass1 + this.mass2);
      num3 = this.gravity * (this.mass1 + this.mass2) * Math.cos(this.angle1);
      num4 =
        this.angle2_vel *
        this.angle2_vel *
        this.radius2 *
        this.mass2 *
        Math.cos(this.angle1 - this.angle2);
      den =
        this.radius2 *
        (2 * this.mass1 +
          this.mass2 -
          this.mass2 * Math.cos(2 * this.angle1 - 2 * this.angle2));
      const a2acc = (num1 * (num2 + num3 + num4)) / den;

      this.angle1_acc = a1acc; //= numerator1 / (this.radius1 * denominator);
      this.angle2_acc = a2acc; //numerator2 / (this.radius2 * denominator);
      // console.log(this.angle1_acc)
      // console.log(this.angle2_acc)

      this.angle1_vel += this.angle1_acc;
      this.angle2_vel += this.angle2_acc;
      this.angle1 += this.angle1_vel;
      this.angle2 += this.angle2_vel;

      let x1 = -1 * this.radius1 * Math.sin(this.angle1);
      let y1 = -1 * this.radius1 * Math.cos(this.angle1);

      let x2 = x1 - this.radius2 * Math.sin(this.angle2);
      let y2 = y1 - this.radius2 * Math.cos(this.angle2);

      this.ball1.position = new bln.Vector3(x1, y1, 0);
      // this.lineOptions.points[1] = this.ball1.position;

      this.ball2.position = new bln.Vector3(x2, y2, 0);
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
