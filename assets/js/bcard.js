import { OrbitControls } from "./threejs/OrbitControls.js";

var camera, scene, renderer;
var mesh;
var FlyInXYTheta = Math.random() * Math.PI * 2; // random rotation
let clock = undefined;

// Pages Render

class BCardSide{
  constructor(content, title) {
    this.content = content
    this.title = title
    // TODO LOAD MESH AHEAD OF TIME
  }
  getMesh(callback, that){
    var loader = new THREE.FontLoader();
    var content = this.content;

    loader.load("assets/fonts/helvetiker.typeface.json", function(font) {
      var textGeo = new THREE.TextGeometry(
        content,
        {
          font: font,

          size: 20,
          height: 0.01,
          curveSegments: 20,

          bevelEnabled: false
        }
      );
      var text_material = new THREE.MeshBasicMaterial({
        color: "black"// getRandomColor()
      });
      
      const text_mesh = new THREE.Mesh(textGeo, text_material);

      callback(text_mesh, that);
    });
  }
}
// class BCardSideImage extends BCardSide{
// getMesh() {
//    returns an image mesh
//  }
// }

class BCard {
  constructor(){
    this.ring = []
    this.idx = 0
    this.size = 0
    this.front = true; 
    this.transitioning = false;
    this.next_idx = 0;

    this.front_mesh = null;
    this.back_mesh = null; 
  } 
  set setScene(scene) {
    this.scene = scene;
  }
  get getScene() {
    return this.scene; 
  }
  addSide(Side, idx){
    this.size = this.size + 1
    this.ring.splice(idx, 0, Side);
  }
  getCurrSide(front){
    if (front != this.front){
      this.front = front
      
      this.idx = this.next_idx; 
      console.log('new side');
    }
    this.transitioning = false;
    return this.ring[this.idx];
  }
  setMesh(mesh, that){
    mesh.name = that.front ? "BACK" :  "FRONT";
    if (scene.getObjectByName(mesh.name)){
      let obj = scene.getObjectByName(mesh.name);
      obj.geometry.dispose();
      obj.material.dispose();
      scene.remove(obj);
    }
    if (that.front) { // render on back

      mesh.position.set(97, 0, -1.6);
      mesh.scale.x *= -1;
      that.back_mesh = mesh
    }
    else if (!that.front) { // render on front

      mesh.position.set(-97, 0, 1.6);
      that.front_mesh = mesh
    }
    that.getScene.add(mesh);
  }
  

  moveLeft(){
    if (!this.transitioning){

      let idx = (this.idx - 1 + 2*!this.front+this.size)%this.size;
      this.ring[idx].getMesh(this.setMesh, this);
      this.transitioning = true;
      this.next_idx = idx;
      return this.ring[idx];
    }
    else {
      return null; 
    }
  }
  moveRight(){
    if (!this.transitioning){
      
      let idx = (this.idx + 1 - 2*!this.front + this.size)%this.size;
      this.ring[idx].getMesh(this.setMesh, this);
      this.transitioning = true;
      this.next_idx = idx;
      return this.ring[idx];
    }
    else {
      return null; 
    }
  }
  getLeftPages(){
    let it = (this.size-1)/2;
    let tmp = []
    for (let i = 1; i<=it; i++){
      let adj_idx = (this.idx - i)%this.size;
      tmp.push(this.ring[adj_idx].title);
    }
  }
  getRightPages(){
    let it = (this.size-1)/2;
    let tmp = []
    for (let i = 1; i<=it; i++){
      let adj_idx = (this.idx + i)%this.size;
      tmp.push(this.ring[adj_idx].title);
    }
  }
  renderFirst(){
    console.log("rendering first")
    this.ring[0].getMesh(this.renderFirstMesh, this);
  }
  renderFirstMesh(mesh, that){
    mesh.name = "FRONT";
    mesh.position.set(-97, 0, 1.6);
    that.front_mesh = mesh
    that.getScene.add(mesh);
  }
}

var bcard = new BCard() 

function flyInPath(t, dir) {
  let [a, b, c, d] = [[0, 0], [1, 1.3], [0.5, 1], [1, 1]];
  return [
    FlyInPathx(a, b, c, d, t),
    FlyInPathy(a, b, c, d, t),
    FlyInPathz(a, b, c, d, t)
  ];
}
function FlyInPathx(a, b, c, d, t) {
  return Math.cos(1.5 * Math.PI * t) * 20 * (1 / (t + 0.3) ** 3);
}
function FlyInPathy(a, b, c, d, t) {
  return 550 - 500 * cubicBezier(a, b, c, d)(t)[1];
}
function FlyInPathz(a, b, c, d, t) {
  return 800 - 500 * cubicBezier(a, b, c, d)(t)[1];
}
function cubicBezier(a, b, c, d) {
  return t => {
    return [
      (1 - t) ** 3 * a[0] +
        3 * (1 - t) ** 2 * b[0] * t +
        3 * (1 - t) * c[0] * t ** 2 +
        t ** 3 * d[0],
      (1 - t) ** 3 * a[1] +
        3 * (1 - t) ** 2 * b[1] * t +
        3 * (1 - t) * c[1] * t ** 2 +
        t ** 3 * d[1]
    ];
  };
}
function getRandomColor() {
  var letters = "0123456789ABCD"; // no EF for contrast :)
  var color = "";
  for (var i = 0; i < 6; i++) {
    let char = letters[Math.floor(Math.random() * 14)];
    letters.replace(char, ""); // non-replacement, for fun
    color += char;
  }
  return parseInt("0x" + color);
}

function loadCount(count) {
  var obj = scene.getObjectByName("visitcount");
  obj.geometry.dispose();
  var loader = new THREE.FontLoader();
  let str = String(count);
  loader.load("assets/fonts/helvetiker.typeface.json", function(font) {
    var textGeo = new THREE.TextGeometry(str, {
      font: font,

      size: 25,
      height: 0.01,
      curveSegments: 10,

      bevelThickness: 0.01,
      bevelSize: 5,
      bevelEnabled: false
    });

    var text_material = new THREE.MeshBasicMaterial({
      color: 0xcfcfcf
    });

    var mesh = new THREE.Mesh(textGeo, text_material);
    mesh.name = "visitcount";
    mesh.position.set(-175, -90, 1.5);

    scene.add(mesh);
  });
}

function init(clock) {
  THREE.Cache.enabled = true;
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  clock = new THREE.Clock();
  camera.position.z = 300;
  camera.position.y = 50;

  scene = new THREE.Scene();
  var card_texture = new THREE.TextureLoader().load(
    "assets/imgs/paper.jpg"
  );

  var card_geometry = new THREE.BoxBufferGeometry(350, 200, 3, 10, 10, 1);
  var card_material = new THREE.MeshBasicMaterial({ map: card_texture });

  mesh = new THREE.Mesh(card_geometry, card_material);
  scene.add(mesh);

  
  let light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.setScalar(1);
  scene.add(light, new THREE.AmbientLight(0xffffff, 0.25));

  bcard.setScene = scene;

  bcard.addSide(new BCardSide("William Eustis", ""), 0);
  bcard.addSide(new BCardSide("Education", ""), 1);
  bcard.addSide(new BCardSide("Experience", ""), 2);
  bcard.addSide(new BCardSide("Projects - SW", ""), 3);
  bcard.addSide(new BCardSide("Projects - ML", ""), 4);
  bcard.addSide(new BCardSide("Projects - HW", ""), 5);
  bcard.addSide(new BCardSide("Interests", ""), 6);
  bcard.addSide(new BCardSide("Photography", ""), 7);
  bcard.addSide(new BCardSide("Contact", ""), 8);



  // loader.load("assets/fonts/helvetiker.typeface.json", function(font) {
  //   var textGeo = new THREE.TextGeometry(
  //     "William Eustis",
  //     {
  //       font: font,

  //       size: 20,
  //       height: 0.01,
  //       curveSegments: 20,

  //       bevelEnabled: false
  //     }
  //   );
  //   var text_material = new THREE.MeshBasicMaterial({
  //     color: "black"// getRandomColor()
  //   });

  //   var text_mesh = new THREE.Mesh(textGeo, text_material);
  //   text_mesh.name = "FRONT";
  //   text_mesh.position.set(-97, 0, 1.6);

  //   scene.add(text_mesh);
  // });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minDistance = 200;
  controls.maxDistance = 700;
  controls.target.set(0, 1, 0);
  controls.minPolarAngle = .6;
  controls.maxPolarAngle = Math.PI - .6;
  controls.update();
  window.addEventListener("resize", onWindowResize, false);

  return clock;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  if (firstFrame){
    bcard.renderFirst();
    firstFrame = false;
  }
  requestAnimationFrame(animate);
  var elapsedTime = clock.getElapsedTime();
  let transitionTime = 2.5;
  if (elapsedTime < transitionTime) {
    let x, y, z;
    [x, y, z] = flyInPath(elapsedTime / transitionTime);
    let xrot = x * Math.cos(FlyInXYTheta) - y * Math.sin(FlyInXYTheta); // rotate
    let yrot = x * Math.sin(FlyInXYTheta) + y * Math.cos(FlyInXYTheta); // rotate

    x =
      (1 - elapsedTime / transitionTime) * xrot +
      (elapsedTime / transitionTime) * x; // taper
    y =
      (1 - elapsedTime / transitionTime) * yrot +
      (elapsedTime / transitionTime) * y; // taper
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
    camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
  }
  // console.log(camera.quaternion.x.toFixed(2), camera.quaternion.y.toFixed(2), camera.quaternion.z.toFixed(2), camera.quaternion.w.toFixed(2));
  let spin_x = camera.quaternion.x;
  let spin_y = camera.quaternion.y;
  let spin_w = camera.quaternion.w;
  if (Math.abs(spin_y) < .5 && spin_w > Math.SQRT2/2) {
    console.log("FRONT");
    bcard.getCurrSide(true);
    // console.log(bcard.getCurrSide(true));
  }
  else if (Math.abs(spin_w) < .5 && spin_y > Math.SQRT2/2){
    console.log("BACK");
    bcard.getCurrSide(false);
    // console.log(bcard.getCurrSide(false));
  }
  else if (Math.abs(spin_x) < .5 && spin_y < 0){
    console.log("LEFT");
    bcard.moveLeft();
  }
  else if (Math.abs(spin_x) < .5 && spin_y > 0){
    console.log("RIGHT");
    bcard.moveRight();
  }
  else {
    console.log("OOB");
  }
    

  render();
}

function render() {
  renderer.render(scene, camera);
}
var firstFrame = true;
clock = init();
animate(clock);