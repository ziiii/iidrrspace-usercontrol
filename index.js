
//import * as THREE from 'three';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

import { EffectComposer } from 'https://unpkg.com/three@0.130.0/examples/jsm/postprocessing/EffectComposer.js';
// import { ShaderPass } from 'https://unpkg.com/three@0.130.0/examples/jsm/postprocessing/ShaderPass.js';
// import { FXAAShader } from 'https://unpkg.com/three@0.130.0/examples/jsm/shaders/FXAAShader.js';
// import { SMAAPass } from 'https://unpkg.com/three@0.130.0/examples/jsm/postprocessing/SMAAPass.js';
import { RenderPass } from 'https://unpkg.com/three@0.130.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.130.0/examples/jsm/postprocessing/UnrealBloomPass.js';
// import { GUI } from './module/lil-gui.module.min.js';

//define VertexShader and Fragment Shader
const _VS=`

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPattern;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDisplace;
uniform float uSpread;
uniform float uNoise;


#define PI 3.14159265358979
#define MOD3 vec3(.1031,.11369,.13787)

vec3 hash33(vec3 p3) {
	p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz+19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}

float pnoise(vec3 p) {
    vec3 pi = floor(p);
    vec3 pf = p - pi;
    vec3 w = pf * pf * (3. - 2.0 * pf);
    return 	mix(
        		mix(
                	mix(dot(pf - vec3(0, 0, 0), hash33(pi + vec3(0, 0, 0))),
                        dot(pf - vec3(1, 0, 0), hash33(pi + vec3(1, 0, 0))),
                       	w.x),
                	mix(dot(pf - vec3(0, 0, 1), hash33(pi + vec3(0, 0, 1))),
                        dot(pf - vec3(1, 0, 1), hash33(pi + vec3(1, 0, 1))),
                       	w.x),
                	w.z),
        		mix(
                    mix(dot(pf - vec3(0, 1, 0), hash33(pi + vec3(0, 1, 0))),
                        dot(pf - vec3(1, 1, 0), hash33(pi + vec3(1, 1, 0))),
                       	w.x),
                   	mix(dot(pf - vec3(0, 1, 1), hash33(pi + vec3(0, 1, 1))),
                        dot(pf - vec3(1, 1, 1), hash33(pi + vec3(1, 1, 1))),
                       	w.x),
                	w.z),
    			w.y);
}

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    
    float pat = pnoise(vec3(vUv * uNoise , sin(uTime) * 1.4 )) * uDisplace ;
    float proximity = abs(vUv.x - (.5 + sin(uTime)/(12. * uSpread ) ));

    vec3 full = pat * vec3(clamp(.23 * uSpread  - proximity , 0., 1.));
    vec3 newPosition = vPosition + vNormal * full; 

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

}`;


const _FS=`
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPattern;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDisplace;
uniform float uSpread;
uniform float uNoise;

#define PI 3.14159265358979
#define MOD3 vec3(.1031,.11369,.13787)

vec3 hash33(vec3 p3) {
	p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz+19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}
float pnoise(vec3 p) {
    vec3 pi = floor(p);
    vec3 pf = p - pi;
    vec3 w = pf * pf * (3. - 2.0 * pf);
    return 	mix(
        		mix(
                	mix(dot(pf - vec3(0, 0, 0), hash33(pi + vec3(0, 0, 0))),
                        dot(pf - vec3(1, 0, 0), hash33(pi + vec3(1, 0, 0))),
                       	w.x),
                	mix(dot(pf - vec3(0, 0, 1), hash33(pi + vec3(0, 0, 1))),
                        dot(pf - vec3(1, 0, 1), hash33(pi + vec3(1, 0, 1))),
                       	w.x),
                	w.z),
        		mix(
                    mix(dot(pf - vec3(0, 1, 0), hash33(pi + vec3(0, 1, 0))),
                        dot(pf - vec3(1, 1, 0), hash33(pi + vec3(1, 1, 0))),
                       	w.x),
                   	mix(dot(pf - vec3(0, 1, 1), hash33(pi + vec3(0, 1, 1))),
                        dot(pf - vec3(1, 1, 1), hash33(pi + vec3(1, 1, 1))),
                       	w.x),
                	w.z),
    			w.y);
}

void main() {
   
    float pat = pnoise(vec3(vUv * uNoise , sin(uTime) * 1.4 )) * uDisplace ;
    float proximity = abs(vUv.x - (.5 + sin(uTime)/(12. * uSpread ) ));

    vec3 full = pat * vec3(clamp(.23 * uSpread  - proximity , 0., 1.));
    vec3 newPosition = vPosition + vNormal * full; 
    vec3 purpleColor = vec3(0.498, 0.2039, 0.8314) / vec3(0.4941, 0.4941, 0.051);
    vec3 color = -vec3(pnoise(vec3(1. - newPosition.z * 35.))*40.) * (.01 -full) * purpleColor;
  gl_FragColor = vec4(color , 1.);
}
`;

//let gui = new GUI();

const modelPosZ=600;
const cameraPosZ=modelPosZ+850; //850
const planePosZ=modelPosZ-380;  //20
const magicPosZ=modelPosZ+100; 
let logoDisappear=false;

//load the video 
let video = document.getElementById('video');
let videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;


let scanModel;
let logoModel;
let blenderModel;
var magicWorld=false;

const movieMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.FrontSide,
    toneMapped: false,
})

const meshMaterial = new THREE.MeshStandardMaterial( {color: 0xffffff} ); 

const scene = new THREE.Scene();
const sizes = (window.innerWidth, window.innerHeight);
console.log(window.innerWidth);
console.log(window.innerHeight);
const near = 0.1;
const far = 3000;
const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, near, far);
camera.position.set(70, -40, cameraPosZ);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor(0x000000); // Set backgroxsund color to black
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// renderer.toneMapping = THREE.LinearToneMapping;
// renderer.toneMappingExposure = 0.5;

const logoStartX=35;
const logoStartY=-45;
const logoStartZ=1200;

//LOAD LOGO pink
const loader2= new GLTFLoader();
loader2.load('asset/logoModel-PINK/logo copy.gltf', function (gltf) {
    logoModel=gltf.scene;
     scene.add(gltf.scene);
     gltf.scene.scale.set(600, 600, 600);
     gltf.scene.position.set(logoStartX, logoStartY, logoStartZ);
     console.log(gltf.scene);

 }, function (xhr) {
     console.log((xhr.loaded / xhr.total * 100) + "%");
 }, function (error) {
     console.error('An error occurred:', error);
 
 });

//load gallery
 const loader = new GLTFLoader();
// loader.load('asset/gallery_newscan/untitled.gltf', function (gltf) {
loader.load('asset/cleanedScan/newscan.gltf', function (gltf) {
    scanModel=gltf.scene;
    scene.add(gltf.scene);
    gltf.scene.scale.set(100, 100, 100);
    gltf.scene.position.set(20, -200, modelPosZ);
   gltf.scene.rotation.y = Math.PI /80;
    console.log(gltf);
   fadeOut(logoModel);

}, function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + "%");
}, function (error) {
    console.error('An error occurred:', error);
});

//load magic scene
const loader3= new GLTFLoader();
loader3.load('asset/galleryGLTF/gallerymodel.gltf',function(gltf){
    blenderModel=gltf.scene;
    blenderModel.traverse(function (child) {
        if (child.isMesh) {
            child.material = meshMaterial;
        }
    });
     scene.add(gltf.scene);
     gltf.scene.scale.set(1,1,1);
     gltf.scene.position.set(0,-200,magicPosZ);
     gltf.scene.rotation.y=Math.PI /80;
     console.log(gltf);
     gltf.scene.visible=magicWorld;
 
 
 },function(xhr){
     console.log((xhr.loaded/xhr.total*100)+"%");
 },function(error){
     console.error('An error occurred:', error);
 
 });


//CREATE SHADER WALL(box)

const uniforms={
    // u_resolution:{type:'v2',value: new THREE.Vector2(window.innerWidth,window.innerHeight)},
    // u_time:{type:'f',value:0.0},
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2() },
    uDisplace: { value: 0.1 },
    uSpread: { value: 0.9 },
    uNoise: { value: 11 },
    }

const shaderGeo = new THREE.BoxGeometry(240, 340, 1 ); 
const shaderMat = new THREE.ShaderMaterial({
    uniforms, 
    side:THREE.DoubleSide,
    //color: 0xffffff
    // vertexShader: document.getElementById('vertexshader').textContent,
    // fragmentShader: document.getElementById('fragmentshader').textContent 
    vertexShader: _VS,
    fragmentShader: _FS
}); 
const shaderWall = new THREE.Mesh( shaderGeo, shaderMat ); 
scene.add( shaderWall );
shaderWall.position.set(100,-50,0);
shaderWall.visible=false;

let composer = new EffectComposer(renderer);

// gui
//   .add(shaderMat.uniforms.uDisplace, 'value', 0, 2, 0.1)
//   .name('displacemnt');
// gui.add( shaderMat.uniforms.uSpread, 'value', 0, 2, 0.1).name('spread');
// gui.add( shaderMat.uniforms.uNoise, 'value', 10, 25, 0.1).name('noise');


const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.4,
  0.0001,
  0.01
);

// composer.addPass(bloomPass);
const clock = new THREE.Clock();

 const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });

//ADD lighting
const topLight = new THREE.SpotLight(0xffffff, 0.8, 200,0.5); // (color, intensity)
topLight.position.set(logoStartX, logoStartY, logoStartZ+100) //top-left-ish
topLight.castShadow = true;
scene.add(topLight);
const spotLightHelper = new THREE.SpotLightHelper( topLight );
//scene.add( spotLightHelper );

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
ambientLight.castShadow = true;
ambientLight.position.set(30, 20, 500);
scene.add(ambientLight);

const meshLight = new THREE.SpotLight(0xffffff, 4, 1500, 1.5); // (color, intensity)
meshLight.position.set(50, 0, 1500);
meshLight.castShadow =false;
scene.add(meshLight);
const spotLightHelper2 = new THREE.SpotLightHelper(meshLight);
//scene.add( spotLightHelper2);
meshLight.visible=false;


const meshLightB = new THREE.DirectionalLight(0xffffff, 2); // (color, intensity)
meshLightB.position.set(0, 0, 100);
meshLightB.target.position.set(0, 0, 1300)
meshLightB.castShadow = false;
scene.add(meshLightB);
//const directionalLightHelper2 = new THREE.DirectionalLightHelper(meshLightB);
//scene.add( directionalLightHelper2);
meshLightB.visible=false;



//Orbitcontrols
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set(40,-40, 850 );
controls.update();


//fade out logo

function fadeOut(object) {
    let opacity = 1;

    function deOpacity() {
        if (opacity > 0) {
            opacity -= 0.01;
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.material.transparent = true;
                    child.material.opacity = opacity;
                }
            });
            requestAnimationFrame(deOpacity);


        } else {
            scene.remove(object);
            topLight.visible=false;
           //playTimeline();   //after the fading out is done, start animation
        }
    }
    deOpacity();
    
}

function fadeIn(object) {
    scene.add(object);
    let opacity = 0;

    function reOpacity() {
        if (opacity <1) {
            opacity += 0.01;
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.material.transparent = true;
                    child.material.opacity = opacity;
                }
            });
            requestAnimationFrame(reOpacity);
        } 
    }
    reOpacity();
    
}


//update visibility
function updateVisibility() { //When models are both loaded
     if (scanModel && blenderModel) {
        scanModel.visible=!magicWorld; 
        ambientLight.visible=!magicWorld; 
        blenderModel.visible=magicWorld; 
        meshLight.visible=magicWorld; 
       // meshLightB.visible=magicWorld; 
    }
}




//ANIMATE
function animate() {
    requestAnimationFrame(animate);
    controls.update();
console.log(camera.position.z);

if(logoModel){
 logoModel.rotation.y+=0.02;
}
    renderer.render(scene, camera);

    const elapsedTime = clock.getElapsedTime();
    shaderMat.uniforms.uTime.value = elapsedTime;
    // composer.render();

if(camera.position.z<551){
    shaderWall.visible=true;
}
    if (magicWorld==false&&camera.position.z < 60) {
        magicWorld=true;
        updateVisibility();
        console.log("enter magic world");
    } 
}
animate();


//TIMELINE animation 一个完了再另一个
//  window.addEventListener('mousedown', function () {

  function playTimeline(){

    const tl = gsap.timeline({
        onComplete: function() {
                scene.add(logoModel);
                logoModel.position.set(85,-110, 1000);
                fadeIn(logoModel);

                const topLight2 = new THREE.SpotLight(0xffffff, 0.5, 200, 0.5); // (color, intensity)
                topLight2.position.set(85,-130, 1100);
                topLight2.castShadow = true;
                scene.add(topLight2);
                //const spotLightHelper3 = new THREE.SpotLightHelper(topLight2);
                //scene.add( spotLightHelper3);
            }
    });

    tl.to(camera.position, {      //MOVE IN from gate
        z: cameraPosZ-900,
        duration: 4.5
    })

    .to(camera.rotation, {
        y: 0.9,                // turn left
        duration: 2.5
    })

    .to(camera.rotation, {
        y: 0,                  
        duration: 3
    })
    .to(camera.position, {
        z: cameraPosZ-800,
        duration: 3
    }, "<")     // Turn right and step back
   

    .to(camera.position, {
        z: cameraPosZ-1000,  
        x:120,
        y:-60,
        duration: 2.5
    })                         //MOVE forward a little
 

    .to(camera.position, {
        z: cameraPosZ-1400,     //MOVE in corridor
        y:-90,
        duration: 3
    })
    .to({}, { duration: 2 })    //pause
     

    .to(camera.position, {      //leave the corridor
        z: cameraPosZ-300,  
        x:100,
        duration: 6
    })


;
  }
