
var muted=false;
var foodsound = new Howl({
	  src: ['sounds/food2.wav'],
	  rate: 1.5,
	  volume: 3
	});
	
var bonusSound = new Howl({
	  src: ['sounds/food.wav'],
	  rate: 1,
	  volume: 2.5
	});
	
var diesound = new Howl({
	  src: ['sounds/obstacle.wav'],
	  volume: 3.5
	});
	
	
var transition = new Howl({
	  src: ['sounds/trans2.wav'],
	  volume: 1.2,
	  rate:1
	});

var stopwatch = new Howl({
	src: ['sounds/Stopwatch.wav'],
	loop: true,
	volume: 0.3,
});

var timer;
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('sceneWindow'), antialias: true});
renderer.setClearColor("rgb(70, 200, 211)");
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

var preMouseX;
var preMouseY;
var mouseDown=false;

var soundstarted=false;

var camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 0.1, 1000);
var scene = new THREE.Scene();

var lerpX = 0;
var lerpY = 0;

var turnRequested=false;
var turnRequest;


var alight = new THREE.AmbientLight("rgb(195,190,201)", 0.85);
scene.add(alight);

var plight = new THREE.PointLight("rgb(255,255,255)", 0.7);
scene.add(plight);

var plight1 = new THREE.PointLight("rgb(255,255,255)", 0.5);
scene.add(plight1);

var plight2 = new THREE.PointLight("rgb(255,255,255)", 0.4);
scene.add(plight2);

var plight3 = new THREE.PointLight("rgb(255,255,255)", 0.8);
scene.add(plight3);

var plight4 = new THREE.PointLight("rgb(255,255,255)", 0.5);
scene.add(plight4);


var snakeSpeed=2;
var boxgeometry = new THREE.CubeGeometry(180,180,180);
var boxmaterial = new THREE.MeshLambertMaterial({color: "rgb(70,230,130)",  map: THREE.ImageUtils.loadTexture('Textures/directionArrow.png')});
var box = new THREE.Mesh(boxgeometry, boxmaterial);


var snakegeometry = new THREE.CubeGeometry(11,11,11);
var snakematerial = new THREE.MeshLambertMaterial({color: "rgb(222, 40, 80)"});
var snake = new THREE.Mesh(snakegeometry, snakematerial);

var specgeometry = new THREE.CubeGeometry(10,10,10);
var specmaterial = new THREE.MeshLambertMaterial({color: "rgb(210,90,210)"});
var spec = new THREE.Mesh(specgeometry, specmaterial);


var snakeX = -5;
var snakeY = 45;
var snakeZ = 95;
var scaleu = 95;

var score = 0;

var UP=1;
var RIGHT=2;
var LEFT=3;
var DOWN=4;

var totalMoves=0;


var FRONT=5;
var BACK=6;
var TOP=7;
var BOTTOM=8
var RIGHTSIDE=9;
var LEFTSIDE=10;

var rotationAngleY=0;
var rotationAngleX=convToRad(20);


var snakeDir = RIGHT;
var boxPlane = FRONT;

var foodBank = [];
var foodBankSize=32;
var foodObj = [];
var obsObj = [];
var obsBank = [];

var inGame=false;
var camRotDistY = 0;
var camRotDistX = 0;
var gameStarted=false;
var gameOver=false;

var obstacles = [];
var noObs=60;
var snakey = new snakeObj();

function onMouseDown(event) {
	mouseDown=true;			
	preMouseX=event.clientX;
	preMouseY=event.clientY;
	
}

function convToRad(angle) {
	return angle * Math.PI/180;
}

function onMouseUp(event) {
	mouseDown=false;
}

function onMouseMove(event) {
	
	if (mouseDown) {
		var deltaMouseX=preMouseX-event.clientX;
		var deltaMouseY=preMouseY-event.clientY;
		
		preMouseX=event.clientX;
		preMouseY=event.clientY;
		
		scene.rotation.x += -deltaMouseY/500;
		scene.rotation.y += -deltaMouseX/500;
	}

}

function transformCamera() {
	camera.position.set(0,0,580);
}


function isBetween(num, num1, num2) {
	if (num>=num1 && num<=num2) {
		return true;
	}
	else {
		return false;
	}
}
function updateCurrentSide() {
	
		if (turnRequested && totalMoves % 5==0) {
			snakeDir=turnRequest;
			turnRequested=false;
			totalMoves=0;
		}

	 switch(boxPlane) {
			case FRONT:
				if (isBetween(snakeX,-scaleu,scaleu) && snakeY>=scaleu && snakeZ>=scaleu) {
					snakeY=scaleu;
					snakeZ=scaleu;
					snakeDir=UP;
					boxPlane=TOP;
					lerpY=0;
					rotationAngleY = 0;
					rotationAngleX = convToRad(40)+rotationAngleX;
					transition.play();
				}
				else if (isBetween(snakeX,-scaleu,scaleu) && snakeY<=-scaleu && snakeZ>=scaleu) {
					snakeDir=DOWN;
					boxPlane=BOTTOM;
					snakeY=-scaleu;
					snakeZ=scaleu;
					lerpY=0;
					rotationAngleX = -convToRad(90)+rotationAngleX;
					rotationAngleY = 0
					transition.play();
				}
				else if (isBetween(snakeY,-scaleu,scaleu) && snakeX>=scaleu && snakeZ>=scaleu) {
					boxPlane=RIGHTSIDE;
					snakeDir=RIGHT;
					snakeX=scaleu;
					snakeZ=scaleu;
					rotationAngleX = convToRad(20);
					rotationAngleY = -convToRad(90)+rotationAngleY;
					transition.play();
				}
				else if (isBetween(snakeY,-scaleu,scaleu) && snakeX<=-scaleu && snakeZ>=scaleu) {
					boxPlane=LEFTSIDE;
					snakeDir=LEFT;
					snakeX=-scaleu;
					snakeZ=scaleu;
					rotationAngleX = convToRad(20);
					rotationAngleY = convToRad(90)+rotationAngleY;
					transition.play();
				}
				break;
			case BACK:
				if (isBetween(snakeX,-scaleu,scaleu) && snakeZ<=-scaleu && snakeY>=scaleu) {
					boxPlane=TOP;
					snakeDir=DOWN;
					snakeZ=-scaleu;
					snakeY=scaleu;
					lerpY=convToRad(180);
					rotationAngleX = rotationAngleX+convToRad(40);
					rotationAngleY = 0;
					transition.play();
				}
				 else if (isBetween(snakeY,-scaleu,scaleu) && snakeX<=-scaleu && snakeZ<=-scaleu) {
					boxPlane=LEFTSIDE;
					snakeDir=RIGHT;
					snakeX=-scaleu;
					snakeZ=-scaleu;
					rotationAngleX = convToRad(20);
					rotationAngleY = rotationAngleY-convToRad(90);
					transition.play();

				}
				else if (isBetween(snakeY,-scaleu,scaleu) && snakeX>=scaleu && snakeZ<=-scaleu) {
					boxPlane=RIGHTSIDE;
					snakeDir=LEFT;
					snakeX=scaleu;
					snakeZ=-scaleu;
					rotationAngleX = convToRad(20);
					rotationAngleY = rotationAngleY+convToRad(90);
					transition.play();
				}
				 else if (isBetween(snakeX,-scaleu,scaleu) && snakeY<=-scaleu && snakeZ<=-scaleu) {
					boxPlane=BOTTOM;
					snakeDir=UP;
					snakeY=-scaleu;
					snakeZ=-scaleu;
					lerpY=convToRad(180);
					rotationAngleX = rotationAngleX-convToRad(90);
					rotationAngleY = 0;
					transition.play();
				}
				break;
			case RIGHTSIDE:
				if (isBetween(snakeY,-scaleu,scaleu) && snakeX>=scaleu && snakeZ>=scaleu) {
					boxPlane=FRONT;
					 snakeDir=LEFT;
					 snakeX=scaleu;
					 snakeZ=scaleu;
					 rotationAngleX = convToRad(20);
					rotationAngleY = rotationAngleY+convToRad(90);
					transition.play();
				}
				else if (isBetween(snakeZ,-scaleu,scaleu) && snakeX>=scaleu && snakeY>=scaleu) {
					boxPlane=TOP;
					snakeDir=LEFT;
					snakeX=scaleu;
					snakeY=scaleu;
					rotationAngleY = rotationAngleY+convToRad(90);
					rotationAngleX = rotationAngleX+convToRad(40);
					transition.play();
				}
				else if (isBetween(snakeY,-scaleu,scaleu) && snakeX>=scaleu && snakeZ<=-scaleu) {
					boxPlane=BACK;
					snakeDir=RIGHT;
					snakeX=scaleu;
					snakeZ=-scaleu;
					rotationAngleX = convToRad(20);
					rotationAngleY = rotationAngleY-convToRad(90);
					transition.play();

				}
				else if (isBetween(snakeZ,-scaleu,scaleu) && snakeX>=scaleu && snakeY<=-scaleu) {
					boxPlane=BOTTOM;
					snakeDir=LEFT;
					snakeX=scaleu;
					snakeY=-scaleu;
					rotationAngleX = rotationAngleX-convToRad(90);
					rotationAngleY = rotationAngleY+convToRad(90);
					transition.play();
				}
				break;
			case LEFTSIDE:
				if (isBetween(snakeY,-scaleu,scaleu) && snakeX<=-scaleu && snakeZ>=scaleu) {
					boxPlane=FRONT;
					snakeDir=RIGHT;
					snakeX=-scaleu;
					snakeZ=scaleu;
					rotationAngleX = convToRad(20);
					rotationAngleY = rotationAngleY-convToRad(90);
					transition.play();
				}
				else if (isBetween(snakeZ,-scaleu,scaleu) && snakeX<=-scaleu && snakeY>=scaleu) {
					boxPlane=TOP;
					snakeDir=RIGHT;
					snakeX=-scaleu;
					snakeY=scaleu;
					rotationAngleY = rotationAngleY-convToRad(90);
					rotationAngleX = rotationAngleX+convToRad(40);
					transition.play();

				}
				else if (isBetween(snakeY,-scaleu,scaleu) && snakeX<=-scaleu && snakeZ<=-scaleu) {
					boxPlane=BACK;
					snakeDir=LEFT;
					snakeX=-scaleu;
					snakeZ=-scaleu;
					rotationAngleX = convToRad(20);
					rotationAngleY = rotationAngleY+convToRad(90);
					transition.play();

				}
				else if (isBetween(snakeZ,-scaleu,scaleu) && snakeX<=-scaleu && snakeY<=-scaleu) {
					boxPlane=BOTTOM;
					snakeDir=RIGHT;
					snakeX=-scaleu;
					snakeY=-scaleu;
					rotationAngleX = rotationAngleX-convToRad(90);
					rotationAngleY = rotationAngleY-convToRad(90);
					transition.play();

				}
				break;
			case TOP:
				if (isBetween(snakeX,-scaleu,scaleu) && snakeY>=scaleu && snakeZ>=scaleu) {
					boxPlane=FRONT;
					snakeDir=DOWN;
					snakeY=scaleu;
					snakeZ=scaleu;
					lerpY=0;
					rotationAngleY = 0;
					rotationAngleX = rotationAngleX-convToRad(40);
					transition.play();
				}
				else if (isBetween(snakeX,-scaleu,scaleu) && snakeZ<=-scaleu && snakeY>=scaleu) {
					boxPlane=BACK;
					snakeDir=DOWN;
					snakeZ=-scaleu;
					snakeY=scaleu;
					lerpY=0;
					rotationAngleX = convToRad(20);
					rotationAngleY = convToRad(180);
					transition.play();
				}
				else if (isBetween(snakeZ,-scaleu,scaleu) && snakeX>=scaleu && snakeY>=scaleu) {
					boxPlane=RIGHTSIDE;
					snakeDir=DOWN;
					snakeX=scaleu;
					snakeY=scaleu;
					rotationAngleX = convToRad(20);
					rotationAngleY = rotationAngleY-convToRad(90);
					transition.play();

				}
				else if (isBetween(snakeZ,-scaleu,scaleu) && snakeX<=-scaleu && snakeY>=scaleu) {
					boxPlane=LEFTSIDE;
					snakeDir=DOWN;
					snakeX=-scaleu;
					snakeY=scaleu;
					rotationAngleX = convToRad(20);
					rotationAngleY = rotationAngleY+convToRad(90);
					transition.play();

				}
				break;
			case BOTTOM:
				if (isBetween(snakeX,-scaleu,scaleu) && snakeY<=-scaleu && snakeZ>=scaleu) {
					snakeDir=UP;
					boxPlane=FRONT;
					snakeY=-scaleu;
					snakeZ=scaleu;
					lerpY=0;
					rotationAngleX = convToRad(20);
					rotationAngleY = 0;
					transition.play();
				}
				else if (isBetween(snakeZ,-scaleu,scaleu) && snakeX<=-scaleu && snakeY<=-scaleu) {
					boxPlane=LEFTSIDE;
					snakeDir=UP;
					snakeX=-scaleu;
					snakeY=-scaleu;
					rotationAngleX = convToRad(20);
					rotationAngleY = rotationAngleY+convToRad(90);
					transition.play();

				}
				else if (isBetween(snakeZ,-scaleu,scaleu) && snakeX>=scaleu && snakeY<=-scaleu) {
					boxPlane=RIGHTSIDE;
					snakeDir=UP;
					snakeX=scaleu;
					snakeY=-scaleu;
					rotationAngleX = convToRad(20);
					rotationAngleY = rotationAngleY-convToRad(90);
					transition.play();

				}
				else if (isBetween(snakeX,-scaleu,scaleu) && snakeY<=-scaleu && snakeZ<=-scaleu) {
					boxPlane=BACK;
					snakeDir=UP;
					snakeY=-scaleu;
					snakeZ=-scaleu;
					rotationAngleX = rotationAngleX+convToRad(90);
					lerpY=0;
					rotationAngleY = -convToRad(180);
					transition.play();

				}
				break;
		}
}

function updateSnake() {
		
		//console.log(snakeX + ", " + snakeY + ", " + snakeZ);
		
	if(isOnCorner(snakeX,snakeY,snakeZ) || isEatsSelf() || isOnObstacle(snakeX,snakeY,snakeZ) ) {
		handleGameOver();
	}	


	if (boxPlane==FRONT) {
		switch(snakeDir){
			case UP: snakeY+=snakeSpeed;break;
			case DOWN: snakeY-=snakeSpeed;break;
			case LEFT: snakeX-=snakeSpeed;break;
			case RIGHT: snakeX+=snakeSpeed;break;
		}
	}
	else if (boxPlane==TOP) {
		switch(snakeDir){
			case UP: snakeZ-=snakeSpeed;break;
			case DOWN: snakeZ+=snakeSpeed;break;
			case LEFT: snakeX-=snakeSpeed;break;
			case RIGHT: snakeX+=snakeSpeed;break;
		}
	}
	else if (boxPlane==BOTTOM) {
		switch(snakeDir){
			case UP: snakeZ+=snakeSpeed;break;
			case DOWN: snakeZ-=snakeSpeed;break;
			case LEFT: snakeX-=snakeSpeed;break;
			case RIGHT: snakeX+=snakeSpeed;break;
		}
	}
	else if (boxPlane==RIGHTSIDE) {
		switch(snakeDir){
			case UP: snakeY+=snakeSpeed;break;
			case DOWN: snakeY-=snakeSpeed;break;
			case LEFT: snakeZ+=snakeSpeed;break;
			case RIGHT: snakeZ-=snakeSpeed;break;
		}
	}
	 else if (boxPlane==LEFTSIDE) {
		switch(snakeDir){
			case UP: snakeY+=snakeSpeed;break;
			case DOWN: snakeY-=snakeSpeed;break;
			case LEFT: snakeZ-=snakeSpeed;break;
			case RIGHT: snakeZ+=snakeSpeed;break;
		}
	}
	 else if (boxPlane==BACK) {
		switch(snakeDir){
			case UP: snakeY+=snakeSpeed;break;
			case DOWN: snakeY-=snakeSpeed;break;
			case LEFT: snakeX+=snakeSpeed;break;
			case RIGHT: snakeX-=snakeSpeed;break;
		}
	}
}

function moveSnake() {
	totalMoves++;
	snake.position.set(snakeX,snakeY,snakeZ);
}

function addFood() {
	var foodgeometry = new THREE.CubeGeometry(10,10,10);
	var foodmaterial = new THREE.MeshLambertMaterial({color: "rgb(247, 164, 56)"});
	
	var i=0;			
	for (i = 0; i<foodBank.length; i++) {
		foodObj.push(new THREE.Mesh(foodgeometry, foodmaterial));
	}
	for (i = 0; i<foodObj.length; i++) {
		scene.add(foodObj[i]);
		foodObj[i].position.set(foodBank[i].getX(),foodBank[i].getY(),foodBank[i].getZ());
	}
}

function initialiseScene() {
	scene.add(box);
	addFood();
	addObstacles();
	scene.add(spec);
	scene.add(snake);
	scene.rotation.x= 0;
	scene.rotation.y= 0;
}

function initialiseSnake() {
	snake.position.set(snakeX,snakeY,snakeZ);
}
function initialiseSpec() {
	spec.position.set(0,0,0);
}


var scaled = 85;
//FRONT
var bp0 = [scaled,scaled,scaleu];
var bp1 = [scaled,-scaled,scaleu];
var bp2 = [-scaled,scaled,scaleu];
var bp3 = [-scaled,-scaled,scaleu];

//TOP
var bp4 = [scaled,scaleu,scaled];
var bp5 = [scaled,scaleu,-scaled];
var bp6 = [-scaled,scaleu,scaled];
var bp7 = [-scaled,scaleu,-scaled];

//RIGHTSIDE
var bp8 = [scaleu,scaled,scaled];
var bp9 = [scaleu,-scaled,scaled];
var bp10 = [scaleu,scaled,-scaled];
var bp11 = [scaleu,-scaled,-scaled];

//LEFTSIDE
var bp12 = [-scaleu,scaled,scaled];
var bp13 = [-scaleu,-scaled,scaled];
var bp14 = [-scaleu,scaled,-scaled];
var bp15 = [-scaleu,-scaled,-scaled];

//BACK
var bp16 = [scaled,scaled,-scaleu];
var bp17 = [-scaled,scaled,-scaleu];
var bp18 = [scaled,-scaled,-scaleu];
var bp19 = [-scaled,-scaled,-scaleu];

//BOTTOM
var bp20 = [scaled,-scaleu,scaled];
var bp21 = [scaled,-scaleu,-scaled];
var bp22 = [-scaled,-scaleu,scaled];
var bp23 = [-scaled,-scaleu,-scaled];

var boxCornerPlanes = [bp0,bp1,bp2,bp3,
					bp4,bp5,bp6,bp7,
					bp8,bp9,bp10,bp11,
					bp12,bp13,bp14,bp15,
					bp16,bp17,bp18,bp19,
					bp20,bp21,bp22,bp23]



var b0 = new boxCorner(scaled+0.5,scaled+0.5,scaled+0.5);
var b1 = new boxCorner(scaled+0.5,-scaled-0.5,-scaled-0.5);
var b2 = new boxCorner(scaled+0.5,scaled+0.5,-scaled-0.5);
var b3 = new boxCorner(scaled+0.5,-scaled-0.5,scaled+0.5);
var b4 = new boxCorner(-scaled-0.5,scaled+0.5,scaled+0.5);
var b5 = new boxCorner(-scaled-0.5,-scaled-0.5,-scaled-0.5);
var b6 = new boxCorner(-scaled-0.5,scaled+0.5,-scaled-0.5);
var b7 = new boxCorner(-scaled-0.5,-scaled-0.5,scaled+0.5);

var boxmaterial = new THREE.MeshLambertMaterial({color: "rgb(20,100,200)"});
var bCorner = new THREE.CubeGeometry(13,13,13);
	
var bC0 = new THREE.Mesh(bCorner, boxmaterial);
var bC1 = new THREE.Mesh(bCorner, boxmaterial);
var bC2 = new THREE.Mesh(bCorner, boxmaterial);
var bC3 = new THREE.Mesh(bCorner, boxmaterial);
var bC4 = new THREE.Mesh(bCorner, boxmaterial);
var bC5 = new THREE.Mesh(bCorner, boxmaterial);
var bC6 = new THREE.Mesh(bCorner, boxmaterial);
var bC7 = new THREE.Mesh(bCorner, boxmaterial);

function prepareCorners() {
	scene.add(bC0);
	scene.add(bC1);
	scene.add(bC2);
	scene.add(bC3);
	scene.add(bC4);
	scene.add(bC5);
	scene.add(bC6);
	scene.add(bC7);
}


function initialiseBox() {
	box.position.set(0,0,0);
	bC0.position.set(b0.getX(),b0.getY(),b0.getZ());
	bC1.position.set(b1.getX(),b1.getY(),b1.getZ());
	bC2.position.set(b2.getX(),b2.getY(),b2.getZ());
	bC3.position.set(b3.getX(),b3.getY(),b3.getZ());
	bC4.position.set(b4.getX(),b4.getY(),b4.getZ());
	bC5.position.set(b5.getX(),b5.getY(),b5.getZ());
	bC6.position.set(b6.getX(),b6.getY(),b6.getZ());
	bC7.position.set(b7.getX(),b7.getY(),b7.getZ());
}

function transformLights() {
	plight.position.set(0,180,180);
	plight1.position.set(0,180,0);
	plight2.position.set(-180,0,-0);
	plight3.position.set(180,0,0);
	plight4.position.set(0,-180,0);
}

function updateCamera() {

	lerpX += (rotationAngleX - lerpX) * 0.075;
	lerpY += (rotationAngleY - lerpY) * 0.075;		
	
	scene.rotation.x = lerpX + camRotDistX;
	scene.rotation.y = lerpY + camRotDistY;
}

function food(x,y,z){
	this.x=x;
	this.y=y;
	this.z=z;
	this.getX = function() {
		return this.x;
	}
	this.getY = function() {
		return this.y;
	}
	this.getZ = function() {
		return this.z;
	}
	
	this.setX = function(x) {
		this.x=x;
	}
	this.setY = function(y) {
		this.y=y;
	}
	this.setZ = function(z) {
		this.z=z;
	}
} 

function section(x,y,z) {
	this.x=x;
	this.y=y;
	this.z=z;
	this.getX = function() {
		return this.x;
	}
	this.getY = function() {
		return this.y;
	}
	this.getZ = function() {
		return this.z;
	}
	
	this.setX = function(x) {
		this.x=x;
	}
	this.setY = function(y) {
		this.y=y;
	}
	this.setZ = function(z) {
		this.z=z;
	}
}

function snakeObj(){
	this.body = [];
	this.bodyObj = [];
	this.bodyLength = 0;
	
	this.getBody = function() {
		return this.body;
	}
	this.getbodyLength = function() {
		return this.bodyLength;
	}
	this.setbodyLength = function(len) {
		this.bodyLength=len;
	}
	this.addBody = function(x,y,z) {
		this.body.push(new section(x,y,z));
		
		
		var bodygeometry = new THREE.CubeGeometry(10,10,10);
		var bodymaterial = new THREE.MeshLambertMaterial({color: "rgb(249, 81, 69)"});
		
		this.bodyObj.push(new THREE.Mesh(bodygeometry, bodymaterial));
		//console.log("Just added " + this.bodyObj[this.bodyObj.length-1]);
	}
}

function boxCorner(x,y,z) {
	this.x=x;
	this.y=y;
	this.z=z;
	this.getX = function() {
		return this.x;
	}
	this.getY = function() {
		return this.y;
	}
	this.getZ = function() {
		return this.z;
	}
	
	this.setX = function(x) {
		this.x=x;
	}
	this.setY = function(y) {
		this.y=y;
	}
	this.setZ = function(z) {
		this.z=z;
	}
}

function isOnFood(x, y, z) {
	var i=0;
	//console.log("FOODLENGTH: " + foodBank.length);
	for (i = 0; i<foodBank.length; i++) {
		if(x==foodBank[i].getX() && y==foodBank[i].getY() && z==foodBank[i].getZ()) {
			return true;
		}
	}
	return false;
}

function isOnObstacle(x, y, z) {
	var i = 0;
	for (i = 0; i<obsBank.length; i++) {
		if(x==obsBank[i][0] && y==obsBank[i][1] && z==obsBank[i][2]) {
			return true;
		}
	}
	return false;
}

function random(num, num1) {
	return Math.floor((Math.random() * num1) + num);
}


function isOnCorner(x, y, z) {
	var i=0;
	for (i = 0; i<24; i++) {
		if(x==boxCornerPlanes[i][0] && y==boxCornerPlanes[i][1] && z==boxCornerPlanes[i][2]) {
			//console.log("HELLOO " + boxCornerPlanes[i]);
			return true;
		}
	}
	return false;
}

function genFoodLoc() {
	var foodX =scaleu;
	var foodY =85;
	var foodZ =85;
	do {
		var face = random(1,6)-1;
		switch(face) {
			case 0:
				foodZ=scaleu;
				foodX=85-((random(1,17)*10));
				foodY=85-((random(1,17)*10));
				break;
			case 1:
				foodY=scaleu;
				foodZ=85-((random(1,17)*10));
				foodX=85-((random(1,17)*10));
				break;
			case 2:
				foodX=scaleu;
				foodZ=85-((random(1,17)*10));
				foodY=85-((random(1,17)*10));
				break;
			case 3:
				foodX=-scaleu;
				foodZ=85-((random(1,17)*10));
				foodY=85-((random(1,17)*10));
				break;
			case 4:
				foodZ=-scaleu;
				foodX=85-((random(1,17)*10));
				foodY=85-((random(1,17)*10));
				break;
			case 5:
				foodY=-scaleu;
				foodX=85-((random(1,17)*10));
				foodZ=85-((random(1,17)*10));
				break;
		}
	}   while (isOnCorner(foodX,foodY, foodZ) || isOnFood(foodX,foodY,foodZ));
	var meal = new food(foodX,foodY,foodZ);
	foodBank.push(meal);
	
}

function genSpecFood() {
	var foodX =scaleu;
	var foodY =85;
	var foodZ =85;
	do {
		var face = random(1,6)-1;
		switch(face) {
			case 0:
				foodZ=scaleu;
				foodX=85-((random(1,17)*10));
				foodY=85-((random(1,17)*10));
				break;
			case 1:
				foodY=scaleu;
				foodZ=85-((random(1,17)*10));
				foodX=85-((random(1,17)*10));
				break;
			case 2:
				foodX=scaleu;
				foodZ=85-((random(1,17)*10));
				foodY=85-((random(1,17)*10));
				break;
			case 3:
				foodX=-scaleu;
				foodZ=85-((random(1,17)*10));
				foodY=85-((random(1,17)*10));
				break;
			case 4:
				foodZ=-scaleu;
				foodX=85-((random(1,17)*10));
				foodY=85-((random(1,17)*10));
				break;
			case 5:
				foodY=-scaleu;
				foodX=85-((random(1,17)*10));
				foodZ=85-((random(1,17)*10));
				break;
		}
	}   while (isOnCorner(foodX,foodY, foodZ) || isOnFood(foodX,foodY,foodZ) || isOnObstacle(foodX,foodY,foodZ));
	spec.position.set(foodX,foodY,foodZ);
	
}

function genObsLoc() {
	var obsX = 85;
	var obsY = 85;
	var obsZ = 95;
	do {
		var face = random(1,6)-1;
		switch(face) {
			case 0:
				obsZ=scaleu;
				obsX=90/2-((random(1,8)*10));
				obsY=90/2-((random(1,8)*10));
				break;
			case 1:
				obsY=scaleu;
				obsZ=90/2-((random(1,8)*10));
				obsX=90/2-((random(1,8)*10));
				break;
			case 2:
				obsX=scaleu;
				obsZ=90/2-((random(1,8)*10));
				obsY=90/2-((random(1,8)*10));
				break;
			case 3:
				obsX=-scaleu;
				obsZ=90/2-((random(1,8)*10));
				obsY=90/2-((random(1,8)*10));
				break;
			case 4:
				obsZ=-scaleu;
				obsX=90/2-((random(1,8)*10));
				obsY=90/2-((random(1,8)*10));
				break;
			case 5:
				obsY=-scaleu;
				obsX=90/2-((random(1,8)*10));
				obsZ=90/2-((random(1,8)*10));
				break;
		}
	}   while (isOnCorner(obsX,obsY, obsZ) || isOnFood(obsX,obsY,obsZ) || isOnObstacle(obsX,obsY,obsZ));
	var newobs = [obsX,obsY,obsZ];
	obsBank.push(newobs);
	
}

function addObstacles() {
	var obsgeometry = new THREE.CubeGeometry(10,10,10);
	var obsmaterial = new THREE.MeshLambertMaterial({color: "rgb(20,100,200)"});
	var i=0;
				
	for (i = 0; i<noObs; i++) {
		obsObj.push(new THREE.Mesh(obsgeometry, obsmaterial));
	}
	
	for (i = 0; i<obsObj.length; i++) {
		scene.add(obsObj[i]);
		obsObj[i].position.set(obsBank[i][0],obsBank[i][1],obsBank[i][2]);
	}
}


function genFoodLoc2(index) {
	var foodX =85;
	var foodY =85;
	var foodZ =95;
	do {
		var face = random(1,6) - 1;
		switch(face) {
			case 0:
				foodZ=scaleu;
				foodX=85-((random(1,17)*10));
				foodY=85-((random(1,17)*10));
				break;
			case 1:
				foodY=scaleu;
				foodZ=85-((random(1,17)*10));
				foodX=85-((random(1,17)*10));
				break;
			case 2:
				foodX=scaleu;
				foodZ=85-((random(1,17)*10));
				foodY=85-((random(1,17)*10));
				break;
			case 3:
				foodX=-scaleu;
				foodZ=85-((random(1,17)*10));
				foodY=85-((random(1,17)*10));
				break;
			case 4:
				foodZ=-scaleu;
				foodX=85-((random(1,17)*10));
				foodY=85-((random(1,17)*10));
				break;
			case 5:
				foodY=-scaleu;
				foodX=85-((random(1,17)*10));
				foodZ=85-((random(1,17)*10));
				break;
		}
	}   while (isOnCorner(foodX,foodY,foodZ) || isOnObstacle(foodX,foodY,foodZ) || isOnFood(foodX,foodY,foodZ));
	
	var meal = new food(foodX,foodY,foodZ);
	this.foodBank[index]=meal;
	//console.log("FOOD: " + foodBank[index].getX());
	foodObj[index].position.set(foodBank[index].getX(),foodBank[index].getY(),foodBank[index].getZ());
	//console.log("FOODfdf: " + foodObj[index]);
}

function genOriginalFoodLoc() {
	var i=0;
	for (i = 0; i<foodBankSize; i++ ) {
		genFoodLoc();
	}
	//console.log(foodBank);
	//console.log("LENTHODFOOD: " + foodBank.length);
}

function genOriginalObsLoc() {
	var i = 0; 
	for (i = 0; i<noObs; i++ ) {
		genObsLoc();
	}
}

function addBody() {
	if (snakey.bodyObj.length===0) {
		console.log("this");
		snakey.addBody(snakeX,snakeY,snakeZ);
		scene.add(snakey.bodyObj[snakey.bodyObj.length-1]);
		//snakey.bodyObj[snakey.bodyObj.length-1].position.set(snakey.body[snakey.body.length-1].getX(),snakey.body[snakey.body.length-1].getY(),snakey.body[snakey.body.length-1].getZ());
	}
	else {
		var tail = snakey.getBody()[snakey.bodyObj.length-1];
		//console.log(tail);
		snakey.addBody(tail.getX(), tail.getY(), tail.getZ());
		scene.add(snakey.bodyObj[snakey.bodyObj.length-1]);
		//snakey.bodyObj[snakey.bodyObj.length-1].position.set(snakey.body[snakey.body.length-1].getX(),snakey.body[snakey.body.length-1].getY(),snakey.body[snakey.body.length-1].getZ());
	}
	console.log(scene);
	
}

function trail() {
	//THIS FUNCTIONS SHIFTS EVERY PORTION OF THE SNAKE TO ITS PREVIOUS TO GET THE TRAILING EFFECT
	//OF TRADITIONAL SNAKES
	if (snakey.bodyObj.length>0) {
		snakey.bodyObj[0].position.x=snakeX;
		snakey.bodyObj[0].position.y=snakeY;
		snakey.bodyObj[0].position.z=snakeZ;
		//SET LOCATION OF FIRST PORTION OF BODY TO LOCATION OF THE HEAD
	}
	
	for (i=snakey.bodyObj.length-1; i>0; i--) {
	
		snakey.bodyObj[i].position.x=snakey.bodyObj[i-1].position.x;
		snakey.bodyObj[i].position.y=snakey.bodyObj[i-1].position.y;
		snakey.bodyObj[i].position.z=snakey.bodyObj[i-1].position.z;
	
		//snakey.body[i]=snakey.body[i-1]; //MOVE THE PREVIOUS PORTION OF THE BODY TO THE PORTION OF THE BODY AHEAD TO GET TRAILING EFFECT
	}
}

function callfoodSound() {
	foodsound.rate(1);
	foodsound.play();
	
}		

var count=8;
var anim=0;
var animate;
var purp = 70;
var animSpeed=1;
var purp2=81;

function animateSnake() {
	
	if (anim<10) {
		if (purp>255) {
			animSpeed*=-1;
		}
		purp+=40*animSpeed;
		purp2-=animSpeed*10;
		for (i = 0; i<snakey.body.length; i++) {
			snakey.bodyObj[i].material = new THREE.MeshLambertMaterial({color: "rgb(249, " + purp2 + ", "+ purp + ")"});
		}
		animate = setTimeout(animateSnake, 100);
		//console.log(anim +  "pr: " +  purp);
		anim++;
	}
	else {
		clearTimeout(animate);
	}
}


function updateSpecFood(){
	var i=0;
	if (snakeX==spec.position.x && snakeY==spec.position.y  && snakeZ==spec.position.z) {
	
		var ele2m = document.getElementById("Gametext3");
		ele2m.parentNode.removeChild(ele2m);
		clearTimeout(timer);
		spec.position.set(0,0,0);
		timer = setTimeout(specialFood, 1000);
		score+=count;
		document.getElementById("Gametext2").innerHTML = "<div id = 'score3'>" + score + "</div>";
		stopwatch.stop();
		callfoodSound();
		bonusSound.play();
		for (i = 0; i<2*count;i++) {
			addBody();
		}
		anim=0;
		animSpeed=1;
		animate = setTimeout(animateSnake, 100);
		
	}
}

function updateFood() {
	var i=0;
	for (i = 0; i<foodBank.length; i++ ) {
		if (snakeX==foodBank[i].getX() && snakeY==foodBank[i].getY() && snakeZ==foodBank[i].getZ()) {
			//console.log("OLD FOOD: " + this.foodBank[i].getX());
			genFoodLoc2(i);
			//console.log("NEW FOOD: " + foodBank[i].getX());
			var i=0;
			score++;
			document.getElementById("Gametext2").innerHTML = "<div id = 'score'>" + score + "</div>";
			callfoodSound();
			//console.log("SCORE: " + score);
			for (i = 0; i<2;i++) {
				addBody();
			}
			break;
		}
	}
}

var gamehasBegun=false;
var controls = document.createElement("controls");

function manageGameStates() {
	if (!gameStarted) {
		camRotDistY+=convToRad(0.3);
		camRotDistX+=convToRad(0.3);
		//locationTm=1100;
		
		
		
	}
	 else if (!inGame) {
	 //console.log("her dfe");
		lerpX=0;
		lerpY=0;
		camRotDistY=0;
		camRotDistX=0;
		rotationAngleY = 0;
		rotationAngleX = convToRad(20);
		//console.log(foodBank);
		score=0;
		inGame=true;
		timer = setTimeout(specialFood, 1000);
		totalMoves=0;
		
		spec.position.set(0,0,0);
		snakey.setbodyLength(0);
		snakeX = -5;
		snakeY = 45;;
		snakeZ = 95;
		snakeDir=RIGHT;
		boxPlane=FRONT;
		
		document.getElementById("Gametext2").innerHTML = "<div id = 'score3'>" + score + "</div>";
		controls.innerHTML = "";
		document.getElementById("Gametext").innerHTML = "";
		
		
		
		
		if (gamehasBegun) {
			snakey.body=[];
			snakey.bodyObj=[];
			scene.children = scene.children.slice(0,7+8);
			genOriginalFoodLoc();
			genOriginalObsLoc();
			initialiseBox();
			initialiseScene();
			initialiseSnake();
		}
		

		//newHighscore=false;
		//specFoodX = 0;
		//specFoodY = 0;
		//specFoodZ = 0;
		//locationY = 580;
		//lerpTextY = 1000;
		//lerpTextHsc = 1000;
		//lerpTextSc = 1000;
		//specFood=false;
		//locationTm=1100;
	}
}


function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function handleGameOver() {

	var elem = document.getElementById("Gametext");
	elem.parentNode.removeChild(elem);
	
	var newelem = document.createElement("Gametext");
	document.body.appendChild(elem);
	
	document.getElementById("Gametext2").innerHTML = "";
	
	var highscore = getCookie("BSNAKEHIGHSCORE");
	//console.log("highscore: " + highscore);
	if (highscore=="") {
		document.cookie="BSNAKEHIGHSCORE="+score;
		document.getElementById("Gametext").innerHTML = "<div id = 'red'>GAME OVER</div><div id='score2'> New Highscore " + score + "</div><div class='presskey'><blink>Press 'r' key to restart!</blink></div>";
	}
	else if(parseInt(highscore)<score) {
		document.cookie="BSNAKEHIGHSCORE="+score;
		document.getElementById("Gametext").innerHTML = "<div id = 'red'>GAME OVER</div><div id='score2'> New Highscore " + score + "</div><div class='presskey'><blink>Press 'r' key to restart!</blink></div>";
	}
	else {
		document.getElementById("Gametext").innerHTML = "<div id = 'red'>GAME OVER</div><div id='score2'> Score "+ score+ "<div style='display:inline; margin-left:100px;'></div>     Highscore " + highscore +  "</div><div class='presskey'><blink>Press 'r' key to restart!</blink></div>";
	}
	
	diesound.play();
	stopwatch.stop();
	foodBank=[];
	foodObj=[];
	obsBank=[];
	obsObj=[];
	clearTimeout(timer);
	scene.children = scene.children.slice(0,7+8+32+60+1+1+snakey.bodyObj.length);
	gamehasBegun=true;
	
	var ele2m = document.getElementById("Gametext3");
	if (ele2m!=null) {
		ele2m.parentNode.removeChild(ele2m);
	}
		
	
	
	
	
	//console.log(scene);
	
	
	gameStarted=false;
	gameOver=true;
	inGame=false;
	///specFood=false;
	//locationTm=1100;
}

function isEatsSelf() {
	if (score>1) {
	for (i = 5; i<snakey.bodyObj.length; i++ ) {
			if (snakeX==snakey.bodyObj[i].position.x && snakeY==snakey.bodyObj[i].position.y && snakeZ==snakey.bodyObj[i].position.z) {
				return true;
				break;
			}
		}
	}
	return false;
}


function renderScene() {
	
	transformLights();
	transformCamera();
	manageGameStates();
	if (gameStarted) {
		updateCurrentSide();
		updateSnake();
		updateFood();
		updateSpecFood();
		moveSnake();
		trail();
	}
	updateCamera()
	renderer.render(scene, camera);
	requestAnimationFrame(renderScene);
}



window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mouseup', onMouseUp, false);
window.addEventListener('mousemove', onMouseMove, false);

document.onkeydown = function(evt) {evt = evt || window.event;var keyCode = evt.keyCode;if (keyCode >= 37 && keyCode <= 40) {return false;}}

window.onkeydown = function (e) {

	var code = e.keyCode ? e.keyCode : e.which;
	
	if(code===77) {
		muted^=true;
		Howler.mute(muted);	
		
		if (muted) {
			document.getElementById("audio").innerHTML = "AUDIO: OFF";
		}
		else {
			document.getElementById("audio").innerHTML = "AUDIO: ON";
		}		

	}

	if(!soundstarted){
		var sound = new Howl({
			src: ['sounds/music.mpeg'],
			autoplay: true,
			loop: true,
			volume: 0.3,
			onend: function() {
				//console.log('Playing Sound!');
			}
		});
		sound.play();
		soundstarted = true;
	
	}
	
	if (gameStarted) {
		if (code === 38 || code === 87) { //up key
			if (snakeDir!=DOWN){turnRequest=UP;turnRequested=true;}
		} else if (code === 40 || code === 83) { //down key
			if(snakeDir!=UP){turnRequest=DOWN;turnRequested=true;}
		} else if (code === 37 || code === 65) { //down key
			if(snakeDir!=RIGHT){turnRequest=LEFT;turnRequested=true;}
		} else if (code === 39 || code === 68) { //down key
			if(snakeDir!=LEFT){turnRequest=RIGHT;turnRequested=true;}
		}
	}
	if (gameOver && code==82) {
		gameStarted=true;
		 gameOver=false;
	
	}
	else if (!inGame && !gameOver && !(code===77)) {
		 gameStarted=true;
		 gameOver=false;	 
	}
};






genOriginalFoodLoc();
initialiseBox();
prepareCorners();
genOriginalObsLoc();
initialiseScene();
initialiseSpec();
document.getElementById("Gametext").innerHTML = "<div id = 'red'>BOX</div><div id = 'blue'>SNAKE</div> <div class='presskey'><blink>Press any key to start!</blink></div>";

controls.innerHTML = "<div class='controls'>Controls: w,a,s,d + Arrow keys <br> Use 'm' to toggle audio </div>";
document.body.appendChild(controls);



function countDown() {
	if (count>1) {
		count--;
		document.getElementById("Gametext3").innerHTML = "<div id = 'countdown'> Bonus " + count + "</div>";
		timer = setTimeout(countDown, 1000);
	}
	else {
		var elem = document.getElementById("Gametext3");
		elem.parentNode.removeChild(elem);
		stopwatch.stop();
		clearTimeout(timer);
		spec.position.set(0,0,0);
		timer = setTimeout(specialFood, 1000);
	}
	
}

function specialFood() {
	
	if (random(1,100)<9 && score>10) {
	
		
		
		var newelem = document.createElement("Gametext3");
		document.body.appendChild(elem);
		
		document.getElementById("Gametext3").innerHTML = "<div id = 'countdown'> Bonus " + count + "</div>";
	
		count=8;
		genSpecFood();
		stopwatch.play();
		clearTimeout(timer);
		timer=setTimeout(countDown,1000);
	}
	else {
		timer = setTimeout(specialFood, 1000);
	}
}


var elem = document.getElementById("Gametext3");
		elem.parentNode.removeChild(elem);
requestAnimationFrame(renderScene);







