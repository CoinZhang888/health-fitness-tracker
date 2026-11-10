import * as THREE from 'three';import type {AvatarParams} from './avatar-config';
const skinColors={porcelain:'#d9d5cf',sand:'#c5aa8c',warm:'#b58462',umber:'#74503c',graphite:'#777981'};
export function ellipseRadius(circumference:number,depthRatio=.7){return circumference/100/(Math.PI*(3*(1+depthRatio)-Math.sqrt((3+depthRatio)*(1+3*depthRatio))))}
function ringGeometry(rings:{y:number;x:number;z:number;offset?:number}[]){
 // Interpolate by ring index; y is monotonic, preserving sensible dimensions at every setting.
 const curve=new THREE.CatmullRomCurve3(rings.map(r=>new THREE.Vector3(r.x,r.y,r.z)),false,'catmullrom',.3);
 const offsets=new THREE.SplineCurve(rings.map((r,i)=>new THREE.Vector2(i/(rings.length-1),r.offset||0)));
 const pos:number[]=[],uv:number[]=[],idx:number[]=[];const sides=64,levels=60;
 for(let i=0;i<=levels;i++){const t=i/levels,v=curve.getPoint(t),off=offsets.getPoint(t).y;for(let j=0;j<=sides;j++){const angle=j/sides*Math.PI*2;pos.push(Math.cos(angle)*Math.max(.002,v.x),v.y,Math.sin(angle)*Math.max(.002,v.z)+off);uv.push(j/sides,t)}}
 for(let i=0;i<levels;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;idx.push(a,b,a+1,b,b+1,a+1)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
export function createAvatar(p:AvatarParams,wireframe=false){
 const root=new THREE.Group();const h=p.height/100,leg=h*p.legRatio,bmi=p.weight/(h*h),bulk=Math.min(1.6,Math.max(.65,Math.sqrt(bmi/24))),definition=p.muscle/100;
 const bodyMat=new THREE.MeshStandardMaterial({color:skinColors[p.skin],roughness:.73,metalness:.02,wireframe});
 const darkMat=new THREE.MeshStandardMaterial({color:'#48403c',roughness:.85,wireframe});
 const eyeMat=new THREE.MeshStandardMaterial({color:'#dedbd5',roughness:.65});
 const pupilMat=new THREE.MeshStandardMaterial({color:'#393937',roughness:.7});
 const lipMat=new THREE.MeshStandardMaterial({color:new THREE.Color(skinColors[p.skin]).multiplyScalar(.76),roughness:.8});
 function ellipsoid(x:number,y:number,z:number,sx:number,sy:number,sz:number,mat=bodyMat){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);root.add(mesh);return mesh}
 function limb(from:THREE.Vector3,to:THREE.Vector3,r1:number,r2:number){const d=to.clone().sub(from);const g=new THREE.CylinderGeometry(r1,r2,d.length(),32,10);const m=new THREE.Mesh(g,bodyMat);m.position.copy(from).add(to).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),from.clone().sub(to).normalize());root.add(m)}
 const shoulder=p.shoulders/200,chest=ellipseRadius(p.chest,.68),waist=ellipseRadius(p.waist,.7+(bulk-1)*.22),hip=ellipseRadius(p.hip,.76);
 const shoulderY=h*.81,upper=shoulderY-leg,hipY=leg+upper*.16,waistY=leg+upper*.45,chestY=leg+upper*.76;
 const torso=ringGeometry([
 {y:leg-.025,x:hip*.38,z:hip*.45}, {y:leg+.035,x:hip*.84,z:hip*.67}, {y:hipY,x:hip,z:hip*.76},
 {y:waistY-h*.045,x:waist*1.03,z:waist*(.74+(bulk-1)*.15),offset:Math.max(0,bulk-1)*.025},
 {y:waistY,x:waist,z:waist*(.7+(bulk-1)*.22),offset:Math.max(0,bulk-1)*.03},
 {y:chestY,x:chest,z:chest*(.68+definition*.035)}, {y:shoulderY-.025,x:shoulder*.92,z:chest*.55},
 {y:h*.835,x:h*.047,z:h*.04}, {y:h*.87,x:h*.034,z:h*.033}
 ]);root.add(new THREE.Mesh(torso,bodyMat));
 for(const sign of[-1,1]){
 const upperX=hip*.49*sign,ankleX=h*.059*sign,kneeX=h*.062*sign;
 const thighR=p.thigh/100/(2*Math.PI),calfR=p.calf/100/(2*Math.PI),armR=p.arm/100/(2*Math.PI);
 const kneeY=leg*.51,ankleY=h*.055;
 const legGeo=ringGeometry([{y:ankleY,x:calfR*.55,z:calfR*.6},{y:kneeY*.58,x:calfR*.87,z:calfR},{y:kneeY*.91,x:calfR*.65,z:calfR*.71},{y:kneeY,x:thighR*.58,z:thighR*.62},{y:leg*.72,x:thighR*.89,z:thighR*.97},{y:leg*.94,x:thighR,z:thighR*1.02},{y:hipY,x:thighR*.79,z:thighR*.78}]);
 const v=legGeo.getAttribute('position');for(let i=0;i<v.count;i++){const y=v.getY(i);const t=Math.min(1,Math.max(0,(y-ankleY)/(hipY-ankleY)));v.setX(i,v.getX(i)+THREE.MathUtils.lerp(ankleX,upperX,t));}legGeo.computeVertexNormals();root.add(new THREE.Mesh(legGeo,bodyMat));
 ellipsoid(ankleX,h*.035,h*.035,calfR*.64,h*.035,h*.083);
 const shoulderPt=new THREE.Vector3(sign*shoulder,shoulderY-.025,0),elbowPt=new THREE.Vector3(sign*(shoulder+h*.055),h*.655,0),wristPt=new THREE.Vector3(sign*(shoulder+h*.085),h*.50,.005);
 ellipsoid(shoulderPt.x,shoulderPt.y,0,armR*(1.08+definition*.2),armR*1.05,armR);limb(shoulderPt,elbowPt,armR,armR*.65);ellipsoid(elbowPt.x,elbowPt.y,0,armR*.66,armR*.7,armR*.67);limb(elbowPt,wristPt,armR*.69,armR*.39);ellipsoid(wristPt.x,wristPt.y-h*.025,.006,armR*.43,h*.038,armR*.29);
 // Separate fingers keep the hand readable without adding expressive gestures.
 for(let f=0;f<4;f++){const length=h*(.024-Math.abs(f-1.3)*.003);ellipsoid(wristPt.x+(f-1.5)*h*.008,wristPt.y-h*.055-length*.35,.008,h*.0047,length*.58,h*.0045)}
 ellipsoid(wristPt.x-sign*h*.018,wristPt.y-h*.033,h*.009,h*.006,h*.019,h*.006);
 }
 const headH=h*.066*p.head,headW=h*.047*p.head*p.faceWidth,headY=h-headH;
 const headGeo=new THREE.SphereGeometry(1,56,44),v=headGeo.getAttribute('position');
 for(let i=0;i<v.count;i++){const x=v.getX(i),y=v.getY(i),z=v.getZ(i);const jawFactor=y<-.15?THREE.MathUtils.lerp(p.jaw*.8,1,(y+1)/.85):1;const cheekFactor=1+(p.cheek-1)*Math.exp(-(((y+.05)/.32)**2))*.35;v.setXYZ(i,x*headW*jawFactor*cheekFactor,y*headH*(y<-.4?p.chin:1),z*headW*.91)}headGeo.computeVertexNormals();const headMesh=new THREE.Mesh(headGeo,bodyMat);headMesh.position.y=headY;root.add(headMesh);
 const front=headW*.84;
 // The face is original procedural geometry; all features respond to their controls.
 for(const sign of[-1,1]){
 const eyeX=sign*headW*.39*p.eyeSpacing,eyeY=headY+headH*.03;
 ellipsoid(eyeX,eyeY,front,headW*.18*p.eyes,headH*.067*p.eyes,headW*.075,eyeMat);
 ellipsoid(eyeX,eyeY,front+headW*.065,headW*.063*p.eyes,headH*.05*p.eyes,headW*.032,pupilMat);
 ellipsoid(eyeX,eyeY+headH*.12,front-headW*.02,headW*.2,headH*.022,headW*.037,lipMat);
 ellipsoid(sign*headW*.97,headY-headH*.04,0,headW*.11,headH*.23,headW*.18);
 }
 ellipsoid(0,headY-headH*.05,front+headW*.04,headW*.085*p.nose,headH*.22,headW*.14*p.nose);
 ellipsoid(0,headY-headH*.19,front+headW*.12*p.nose,headW*.13*p.nose,headH*.083,headW*.13*p.nose);
 ellipsoid(0,headY-headH*.39,headW*.80,headW*.27*p.mouth,headH*.024,headW*.055,lipMat);
 if(p.hair!=='none'){
 const hairGeo=new THREE.SphereGeometry(1,40,32,0,Math.PI*2,0,Math.PI*.47);const hair=new THREE.Mesh(hairGeo,darkMat);hair.position.set(0,headY+.006,-.002);hair.scale.set(headW*1.045,headH*1.04,headW*.96);root.add(hair);
 if(p.hair==='long'){const back=ellipsoid(0,headY-headH*.45,-headW*.48,headW*1.03,headH*1.05,headW*.58,darkMat);back.rotation.x=-.08}
 }
 root.userData={height:p.height,weight:p.weight};return root;
}
export function disposeAvatar(group:THREE.Object3D){const materials=new Set<THREE.Material>();group.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>materials.add(m))}});materials.forEach(m=>m.dispose())}
