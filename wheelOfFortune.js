
/////////////////////////////
// variables
/////////////////////////////
welcomeMessage = 'Putar untuk memulai...';
nSegements = 16;

frameColor = '#aeaeae';
pinsColor = "#030303";
stoperColor = "#fa0a0a";

availableColors = [ 
	'#ff5555', '#55ff55', '#FFAAEE', '#FFEEAA',
	'#ff5555', '#55ff55', '#FFAAEE', '#FFEEAA',
	'#ff5555', '#55ff55', '#FFAAEE', '#FFEEAA',
	'#ff5555', '#55ff55', '#FFAAEE', '#FFEEAA' 
	]; //not used
availableTexts 	= [ 
	'1 Voucher GRAB 10K', 'ZONK!', '1 Voucher NANNY PAVILILION 100K', 
	'1 Voucher GRAB 10K', 'ZONK!', '1 Voucher MAP 100K', 
	'1 Voucher GRAB 10K', '1 UNIT JBL SPEAKER', 'ZONK!', 
	'1 Voucher NANNY PAVILILION 100K', '1 Voucher GRAB 10K', 'PUTAR LAGI!', 
	'1 UNIT HEADSET SONY', 'ZONK!', '1 Voucher NANNY PAVILILION 100K', '1 Voucher MAP 100K'
	];
useRandomColors = false;

actualSegements = [];

/////////////////////////////

const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI * 0.5;

// canvas settings
var viewWidth = 800,
	viewHeight = 800,
	viewCenterX = viewWidth * 0.5,
	viewCenterY = viewHeight * 0.5,
	drawingCanvas = document.getElementById("drawing_canvas"),
	ctx,
	timeStep = (1/60),
	time = 0;

var ppm = 38, // pixels per meter
	physicsWidth = viewWidth / ppm,
	physicsHeight = viewHeight / ppm,
	physicsCenterX = physicsWidth * 0.5,
	physicsCenterY = physicsHeight * 0.5;

var world;

var wheel,
	arrow,
	mouseBody,
	mouseConstraint;

var arrowMaterial,
	pinMaterial,
	contactMaterial;

var wheelSpinning = false,
	wheelStopped = true;

var particles = [];
var statusLabel = document.getElementById('status_label');

var img = document.getElementById("wheelImg");

function deg2rad(deg, i) { return (deg * Math.PI/(180)); }

window.onload = function() {
	initDrawingCanvas();
	initPhysics();

	requestAnimationFrame(loop);

	statusLabel.innerHTML = welcomeMessage;
};

function initDrawingCanvas() {
	drawingCanvas.width = viewWidth;
	drawingCanvas.height = viewHeight;
	ctx = drawingCanvas.getContext('2d');

	drawingCanvas.addEventListener('mousemove', updateMouseBodyPosition, true);
	drawingCanvas.addEventListener('mousedown', checkStartDrag, true);
	drawingCanvas.addEventListener('mouseup', checkEndDrag, true);
	drawingCanvas.addEventListener('mouseout', checkEndDrag, true);
}

function updateMouseBodyPosition(e) {
	var p = getPhysicsCoord(e);
	mouseBody.position[0] = p.x;
	mouseBody.position[1] = p.y;
}

function checkStartDrag(e) {
	if (world.hitTest(mouseBody.position, [wheel.body])[0]) {

		mouseConstraint = new p2.RevoluteConstraint(mouseBody, wheel.body, {
			worldPivot:mouseBody.position,
			collideConnected:false
		});

		world.addConstraint(mouseConstraint);
	}

	if (wheelSpinning === true) {
		wheelSpinning = false;
		wheelStopped = true;
		statusLabel.innerHTML = "Impatience will not be rewarded.";
	}
}

function checkEndDrag(e) {
	if (mouseConstraint) {
		world.removeConstraint(mouseConstraint);
		mouseConstraint = null;

		if (wheelSpinning === false && wheelStopped === true) {
			if ( Math.abs(wheel.body.angularVelocity) > 7.5) {
				wheelSpinning = true;
				wheelStopped = false;
				//console.log('good spin');
				statusLabel.innerHTML = '...wait...'
			}
			else {
				//console.log('sissy');
				statusLabel.innerHTML = 'Come on, you can spin harder than that.'
			}
		}
	}
}

function getPhysicsCoord(e) {
	var rect = drawingCanvas.getBoundingClientRect(),
		x = (e.clientX - rect.left) / ppm,
		y = physicsHeight - (e.clientY - rect.top) / ppm;

	return {x:x, y:y};
}

function initPhysics() {
	world = new p2.World();
	world.solver.iterations = 100;
	world.solver.tolerance = 0;

	arrowMaterial = new p2.Material();
	pinMaterial = new p2.Material();
	contactMaterial = new p2.ContactMaterial(arrowMaterial, pinMaterial, {
		friction:0.7,
		restitution:0.2
	});
	world.addContactMaterial(contactMaterial);

	var wheelRadius = 8,
		wheelX = physicsCenterX,
		wheelY = wheelRadius + 4,
		arrowX = wheelX + wheelRadius + 0.625,
		arrowY = wheelY;

	wheel = new Wheel(wheelX, wheelY, wheelRadius, nSegements, 0.25, 7.5);
	wheel.body.angle = (Math.PI / 32.5);
	wheel.body.angularVelocity = 5;
	arrow = new Arrow(arrowX, arrowY, 0.5, 1.5);
	mouseBody = new p2.Body();

	world.addBody(mouseBody);
}

function spawnPartices() {
	for (var i = 0; i < 200; i++) {
		var p0 = new Point(viewCenterX, viewCenterY - 64);
		var p1 = new Point(viewCenterX, 0);
		var p2 = new Point(Math.random() * viewWidth, Math.random() * viewCenterY);
		var p3 = new Point(Math.random() * viewWidth, viewHeight + 64);

		particles.push(new Particle(p0, p1, p2, p3));
	}
}

function update() {
	particles.forEach(function(p) {
		p.update();
		if (p.complete) {
			particles.splice(particles.indexOf(p), 1);
		}
	});

	var currVal = (wheel.body.angle * 180 / Math.PI);
		
	if (currVal > 360 || currVal < -360) {
		currVal %= 360;
	}
		
	currVal /= (360/nSegements);
		
	if (currVal < 0) {
		//currVal *= -1;
	}
	
	if (currVal == nSegements) {
		currVal = 0;
	}
	
	//currVal+=90;
	currVal = Math.floor(currVal * 100) / 100;
	currLabel = ''
	
	if(currVal < 0) {
		currVal = Math.floor(currVal)
		currVal *= -1
		currLabel = actualSegements[nSegements - currVal];
	} else if(currVal > 0) {
		currVal = Math.ceil(currVal)
		currLabel = actualSegements[currVal - 1];
	} else {
		currVal = 0;
		currLabel = actualSegements[currVal];
	}
	
	
	statusLabel.innerHTML = currLabel; // + ' ' + currVal
	//console.log('currentRotation: ' + currVal)
	
	// p2 does not support continuous collision detection :(
	// but stepping twice seems to help
	// considering there are only a few bodies, this is ok for now.
	world.step(timeStep * 0.5);
	world.step(timeStep * 0.5);

	if (wheelSpinning === true && wheelStopped === false &&
		wheel.body.angularVelocity < 1 && arrow.hasStopped()) {

		var win = wheel.gotLucky();

		wheelStopped = true;
		wheelSpinning = false;

		if (win < 0) { 
			win *= -1; 
			win -= 1;
			if(win<0) {
				win = nSegements - 1;
			}
		}
		
		wheel.body.angularVelocity = 0;
		statusLabel.innerHTML = 'Result: ' + actualSegements[win - 1];
		console.log((win))
		
		//if (win) {
		//	spawnPartices();
			//statusLabel.innerHTML = 'Woop woop!'
		//}
		//else {
			//statusLabel.innerHTML = 'Too bad! Invite a Facebook friend to try again!';
		//}
	}
}

function draw() {
	// ctx.fillStyle = '#fff';
	ctx.clearRect(0, 0, viewWidth, viewHeight);

	wheel.draw();
	arrow.draw();
	
	particles.forEach(function(p) {
		p.draw();
	});
}

function loop() {
	update();
	draw();

	requestAnimationFrame(loop);
}
	
function drawText(i, deg, text) {
	
	ctx.save();
	ctx.translate(0, 0);	
	part_ = 360/nSegements;	
	deg = deg - (2 * part_/5);	
	ctx.rotate(deg2rad(deg, i));
	ctx.textAlign="end"; 
	ctx.fillStyle = "#000";
	ctx.font = "27px Arial";
	ctx.fillText(text, 330, 0);
	ctx.restore();	
}

/////////////////////////////
// wheel of fortune
/////////////////////////////
function Wheel(x, y, radius, segments, pinRadius, pinDistance) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.segments = segments;
	this.pinRadius = pinRadius;
	this.pinDistance = pinDistance;

	this.pX = this.x * ppm;
	this.pY = (physicsHeight - this.y) * ppm;
	this.pRadius = this.radius * ppm;
	this.pPinRadius = this.pinRadius * ppm;
	this.pPinPositions = [];

	this.deltaPI = TWO_PI / this.segments;

	this.createBody();
	this.createPins();
	
	this.usedColors = [];
		
	for (var i = 0; i < this.segments; i++) {
		//console.log('.....')
		
		if (useRandomColors) {
			do {
				tempI = Math.floor((Math.random() * 100) + 1)
				position_ =  tempI % availableColors.length;
			
			} while(i != 0 && this.usedColors[i - 1] === availableColors[position_] );
			
		} else {
			position_ =  i % availableColors.length;
		}
		
		this.usedColors[i] = availableColors[position_];
		actualSegements[i] = availableTexts[position_];
	}
}

Wheel.prototype = {
	
	createBody:function() {
		this.body = new p2.Body({mass:1, position:[this.x, this.y]});
		this.body.angularDamping = 0.0;
		this.body.addShape(new p2.Circle(this.radius));
		this.body.shapes[0].sensor = true; //TODO use collision bits instead

		var axis = new p2.Body({position:[this.x, this.y]});
		var constraint = new p2.LockConstraint(this.body, axis);
		constraint.collideConnected = false;

		world.addBody(this.body);
		world.addBody(axis);
		world.addConstraint(constraint);
	},
	createPins:function() {
		var l = this.segments,
			pin = new p2.Circle(this.pinRadius);

		pin.material = pinMaterial;

		for (var i = 0; i < l; i++) {
			var x = Math.cos(i / l * TWO_PI) * this.pinDistance,
				y = Math.sin(i / l * TWO_PI) * this.pinDistance;

			this.body.addShape(pin, [x, y]);
			this.pPinPositions[i] = [x * ppm, -y * ppm];
		}
	},
	gotLucky:function() {
		var currentRotation = wheel.body.angle % TWO_PI,
			currentSegment = Math.floor(currentRotation / this.deltaPI);
		
		var posVal = (currentRotation * Math.PI / 180);
		if (posVal < 0 ) {
			posVal *= -1;
		}
		
		//console.log('currentRotation: '  + (wheel.body.angle * Math.PI / 180) )
		//console.log('currentSegment: '  + Math.floor(posVal))
		
		return (currentSegment);
	},
	draw:function() {
		// TODO this should be cached in a canvas, and drawn as an image
		// also, more doodads
		ctx.save();
		ctx.translate(this.pX, this.pY);

		ctx.beginPath();
		ctx.fillStyle = frameColor;
		ctx.arc(0, 0, this.pRadius + 24, 0, TWO_PI);
		ctx.fill();
		ctx.fillRect(-12, 0, 24, 400);
		ctx.font = "30px Arial";
		ctx.rotate(-this.body.angle);
			
		var sliceDeg = 360/this.segments;
		var deg_ = 0;
		
		//console.log(this.pRadius)
				
		/*
		for (var i = 0; i < this.segments; i++) {			
			ctx.fillStyle = this.usedColors[i];						
			ctx.beginPath();
			ctx.arc(0, 0, this.pRadius, i * this.deltaPI, (i + 1) * this.deltaPI);
			ctx.lineTo(0, 0);
			ctx.closePath();

			ctx.fill();			
			
		}
		*/
		
		var position_ = -1*(this.pRadius*1.0)
		
		ctx.drawImage(img, position_, position_, (2*this.pRadius), (2*this.pRadius) );	
		/*
		for (var i = 0; i < this.segments; i++) {		
			drawText(i, deg_ + sliceDeg, actualSegements[i]);
			deg_ += sliceDeg;	
		}
		*/
		ctx.fillStyle = stoperColor;

		this.pPinPositions.forEach(function(p, i) {
			ctx.beginPath();
			ctx.arc(p[0], p[1], this.pPinRadius, 0, TWO_PI);
			ctx.fill();
		}, this);

		ctx.restore();
		
	}
};

/////////////////////////////
// arrow on top of the wheel of fortune
/////////////////////////////
function Arrow(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.verts = [];

	this.pX = this.x * ppm;
	this.pY = (physicsHeight - this.y) * ppm;
	this.pVerts = [];

	this.createBody();
}

Arrow.prototype = {
	createBody:function() {
		this.body = new p2.Body({mass:1, position:[this.x, this.y]});
		this.body.addShape(this.createArrowShape());

		var axis = new p2.Body({position:[this.x, this.y]});
		var constraint = new p2.RevoluteConstraint(this.body, axis, {
			worldPivot:[this.x, this.y]
		});
		constraint.collideConnected = false;

		var left = new p2.Body({position:[this.x - 2, this.y]});
		var right = new p2.Body({position:[this.x + 2, this.y]});
		var leftConstraint = new p2.DistanceConstraint(this.body, left, {
			localAnchorA:[-this.w * 2, this.h * 0.25],
			collideConnected:false
		});
		var rightConstraint = new p2.DistanceConstraint(this.body, right, {
			localAnchorA:[this.w * 2, this.h * 0.25],
			collideConnected:false
		});
		var s = 32,
			r = 4;

		leftConstraint.setStiffness(s);
		leftConstraint.setRelaxation(r);
		rightConstraint.setStiffness(s);
		rightConstraint.setRelaxation(r);

		world.addBody(this.body);
		world.addBody(axis);
		world.addConstraint(constraint);
		world.addConstraint(leftConstraint);
		world.addConstraint(rightConstraint);
	},

	createArrowShape:function() {
		this.verts[0] = [0, -this.h * 0.25];
		this.verts[1] = [-this.w * 2.7, 0];
		this.verts[2] = [0, -this.h * 0.25];
		this.verts[3] = [this.w * 0.7, 0];

		this.pVerts[0] = [this.verts[0][0] * ppm, -this.verts[0][1] * ppm];
		this.pVerts[1] = [this.verts[1][0] * ppm, -this.verts[1][1] * ppm];
		this.pVerts[2] = [this.verts[2][0] * ppm, -this.verts[2][1] * ppm];
		this.pVerts[3] = [this.verts[3][0] * ppm, -this.verts[3][1] * ppm];

		var shape = new p2.Convex(this.verts);
		shape.material = arrowMaterial;

		return shape;
	},
	
	hasStopped:function() {
		var angle = Math.abs(this.body.angle % TWO_PI);

		return (angle < 1e-3 || (TWO_PI - angle) < 1e-3);
	},
	
	update:function() {

	},
	
	draw:function() {
		ctx.save();
		ctx.translate(this.pX, this.pY);
		ctx.rotate(-this.body.angle);

		ctx.fillStyle = pinsColor;

		ctx.beginPath();
		ctx.moveTo(-this.pVerts[0][0], -this.pVerts[0][1]);
		ctx.lineTo(this.pVerts[1][0], this.pVerts[1][1]);
		ctx.lineTo(this.pVerts[2][0], this.pVerts[2][1]);
		ctx.lineTo(this.pVerts[3][0], this.pVerts[3][1]);
		ctx.closePath();
		ctx.fill();

		ctx.restore();
	}
};

/////////////////////////////
// your reward
/////////////////////////////
Particle = function(p0, p1, p2, p3) {
	this.p0 = p0;
	this.p1 = p1;
	this.p2 = p2;
	this.p3 = p3;

	this.time = 0;
	this.duration = 3 + Math.random() * 2;
	this.color =  'hsl(' + Math.floor(Math.random() * 360) + ',100%,50%)';

	this.w = 10;
	this.h = 7;

	this.complete = false;
};

Particle.prototype = {
	update:function() {
		this.time = Math.min(this.duration, this.time + timeStep);

		var f = Ease.outCubic(this.time, 0, 1, this.duration);
		var p = cubeBezier(this.p0, this.p1, this.p2, this.p3, f);

		var dx = p.x - this.x;
		var dy = p.y - this.y;

		this.r =  Math.atan2(dy, dx) + HALF_PI;
		this.sy = Math.sin(Math.PI * f * 10);
		this.x = p.x;
		this.y = p.y;

		this.complete = this.time === this.duration;
	},
	draw:function() {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.r);
		ctx.scale(1, this.sy);

		ctx.fillStyle = this.color;
		ctx.fillRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h);

		ctx.restore();
	}
};

Point = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

/////////////////////////////
// math
/////////////////////////////
/**
 * easing equations from http://gizma.com/easing/
 * t = current time
 * b = start value
 * c = delta value
 * d = duration
 */
var Ease = {
	inCubic:function (t, b, c, d) {
		t /= d;
		return c*t*t*t + b;
	},
	outCubic:function(t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t + 1) + b;
	},
	inOutCubic:function(t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t + 2) + b;
	},
	inBack: function (t, b, c, d, s) {
		s = s || 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	}
};

function cubeBezier(p0, c0, c1, p1, t) {
	var p = new Point();
	var nt = (1 - t);

	p.x = nt * nt * nt * p0.x + 3 * nt * nt * t * c0.x + 3 * nt * t * t * c1.x + t * t * t * p1.x;
	p.y = nt * nt * nt * p0.y + 3 * nt * nt * t * c0.y + 3 * nt * t * t * c1.y + t * t * t * p1.y;

	return p;
}