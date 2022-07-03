import * as bln from 'babylonjs'
import Vector3 = bln.Vector3;
import Vector4 = bln.Vector4;

export class Utils{
  public static dist3(o1:Vector3, o2:Vector3){
    return Math.sqrt(Math.pow(arguments[0].x+arguments[1].x,2)+Math.pow(arguments[0].y+arguments[1].y,2)+Math.pow(arguments[0].z+arguments[1].z,2))
  }
  public static dist4(o1:Vector4, o2:Vector4){
    return Math.sqrt(Math.pow(arguments[0].x+arguments[1].x,2)+Math.pow(arguments[0].y+arguments[1].y,2)+Math.pow(arguments[0].z+arguments[1].z,2)+Math.pow(arguments[0].w+arguments[1].w,2))
  }
  public static vec3(value:number){
    return new bln.Vector3(value,value,value);
  }
  public static vec4(value:number){
    return new bln.Vector4(value,value,value,value);
  }
}