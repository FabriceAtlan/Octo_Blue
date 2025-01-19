const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 600;

const tileSet = "./assets/tileset.png";
const bullet = "./assets/bullet.png";
let imageBullet;

const spOcto = {
	quadX: 0,
	quadY: 0,
	quadWidth: 140,
	quadHeight: 131,
	speed: 2
};

const spFish = {
	quadX: 152,
	quadY: 0,
	quadWidth: 47,
	quadHeight: 40,
	speed: 2
};

const listFish = [];

const bulletHero = [];

class Actor {
	constructor(sprite, coordX, coordY) {
		this.image = null;
		this.quadX = sprite.quadX;
		this.quadY = sprite.quadY;
		
		this.quadWidth = sprite.quadWidth;
		this.quadHeight = sprite.quadHeight;
		
		this.x = coordX;
		this.y = coordY;
		this.angle = 0;
		
		this.speed = sprite.speed;
	}
};

class Hero extends Actor {
	constructor(sprite, coordX, coordY) {
		super(sprite, coordX, coordY);
	}

	update() {
		if (keys.rotateLeft) this.angle -= 2;
		if (keys.rotateRight) this.angle += 2;
		if (keys.space) {
			keys.space = false;
			
			const angle = Math.abs(this.angle);// * Math.PI / 180;
			console.log(angle);
			
			const spawnBulletX = this.x + (Math.cos(angle) * 12);
			const spawnBulletY = this.y + (Math.sin(angle) * 18);

			const newBullet = new Bullet(
				imageBullet,
				spawnBulletX,
				spawnBulletY
			);

			newBullet.angle = Math.abs(angle);
			console.log("Bullet angle: ", newBullet.angle)

			bulletHero.push(newBullet);
		};
	};

	draw() {
		if (this.image) {
			ctx.save();
			ctx.translate(canvas.width/2, canvas.height/2);
			ctx.rotate(this.angle * Math.PI / 180);
			ctx.drawImage(
				this.image,
				this.quadX, this.quadY,
				this.quadWidth, this.quadHeight,
				this.x, this.y,
				this.quadWidth, this.quadHeight
			);
			ctx.translate(-canvas.width/2, -canvas.height/2);
			ctx.restore();
		}
	}
}

class Fish extends Actor {
	constructor(sprite, coordX, coordY, dir) {
		super(sprite, coordX, coordY, dir);
		this.dir = dir;
		this.speed = 3;
	}

	update() {
		this.x += this.dir * this.speed;

		if (this.x - this.quadWidth >= canvas.width || this.x  + this.quadWidth <= -this.quadWidth) {
			this.dir *= -1;
			this.y = Math.random() * ((canvas.height - this.quadHeight) - this.quadHeight) + this.quadHeight;
			this.speed = Math.random() * (2 - .8) + .8;
		};
	}

	draw() {
		if (this.image) {
			ctx.save();

			if (this.dir === - 1) {
				ctx.translate(this.x + this.quadWidth, this.y);
				ctx.scale(-1, 1);
				ctx.drawImage(
					this.image,
					this.quadX, this.quadY,
					this.quadWidth, this.quadHeight,
					0, 0,
					this.quadWidth, this.quadHeight
				);
				ctx.translate(-this.x + this.quadWidth, this.y);

			} else {
				ctx.translate(this.x, this.y);
				ctx.drawImage(
					this.image,
					this.quadX, this.quadY,
					this.quadWidth, this.quadHeight,
					0, 0,
					this.quadWidth, this.quadHeight
				);
				ctx.translate(-this.x, this.y);
			}

			ctx.restore();
		}
	}
}

class Bullet extends Actor {
	constructor(sprite, coordX, coordY) {
		super(sprite, coordX, coordY);
	}

	update() {
		const forceX = Math.cos(this.angle) * 2;
		const forceY = Math.sin(this.angle) * 2;

		this.x += forceX;
		this.y += forceY;
	}

	draw() {
		ctx.save();
		ctx.translate(canvas.width/2, canvas.height/2);
		ctx.rotate(this.angle * Math.PI / 180);

		ctx.drawImage(imageBullet, this.x, this.y);

		ctx.translate(-canvas.width/2, -canvas.height/2);
		ctx.restore();
	}
}

async function imageLoader(src) {
	const img = new Image();
	img.src = src;

	await new Promise(resolve => {
		img.onload = resolve;
	});

	return img;
}

const keys = {
	rotateRight: false,
	rotateLeft: false,
	space: false
};

async function startGame() {
	// Create bullet
	imageBullet = await imageLoader(bullet);

	// Create Hero
	const octoImage = await imageLoader(tileSet);
	const octo = new Hero(spOcto, 0, 0);
	
	octo.image = octoImage; 
	octo.x -= octo.quadWidth/2; 
	octo.y -= octo.quadHeight/2;
	
	// Create ennemies
	const fishImage = await imageLoader(tileSet);

	for (let i = 0; i < 10; i++) {
		let rndPositionX = 0;
		const spawnDice = Math.random() < .5 ? "left" : "right";
		
		if (spawnDice === "left") {
			rndPositionX = Math.random() * (- 100 - 50) - 50;
			directionLeftOrRight = -1;

		} else {
			rndPositionX = Math.random() * ((canvas.width + 50) - (canvas.width + 50)) + (canvas.width + 50);
			directionLeftOrRight = 1;
		}

		const newFish = new Fish(
			spFish,
			rndPositionX,
			0,
			directionLeftOrRight
		);
		
		newFish.image = fishImage; 
		newFish.x -= newFish.quadWidth/2; 
		newFish.y -= newFish.quadHeight/2;
		
		listFish.push(newFish);
		
		listFish[i].speed = Math.random() * (2 - .1) + .1;
		listFish[i].y = Math.random() * ((canvas.height - 50) - 50) + 50
	}
	
	function gameLoop() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// Hero
		octo.update();
		octo.draw();
		
		// Fish
		for (let i=0; i < listFish.length; i++) {
			const currentFish = listFish[i];

			currentFish.update();
			currentFish.draw();
		}

		// Bullet
		if (bulletHero.length > 0) {
			for (let i=0; i < bulletHero.length; i++) {
				const currentBullet = bulletHero[i];

				currentBullet.update();
				currentBullet.draw();
			}
		}

		requestAnimationFrame(gameLoop);
	}

	gameLoop();
}

let spaceIsPressed = false;

document.addEventListener("DOMContentLoaded", async () => {
	await startGame();

	document.addEventListener("keydown", (e) => {
		if (e.key === "ArrowRight") keys.rotateRight = true;
		if (e.key === "ArrowLeft") keys.rotateLeft = true;
		if (e.key === " " && !spaceIsPressed) {
			e.preventDefault();
			keys.space = true;
			spaceIsPressed = true;
		};
	});
	
	document.addEventListener("keyup", (e) => {
		if (e.key === "ArrowRight") keys.rotateRight = false;
		if (e.key === "ArrowLeft") keys.rotateLeft = false;
		if (e.key === " ") {
			e.preventDefault();
			keys.space = false;
			spaceIsPressed = false;
		};
	});
});
