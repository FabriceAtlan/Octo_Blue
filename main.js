const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const dist = (x1, y1, x2, y2) => {
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

canvas.width = 600;
canvas.height = 600;

const tileSet = "./assets/tileset.png";
const bullet = "./assets/bullet.png";
const happyFish = "./assets/happyFishImage.png";

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
		if (keys.right) this.x += 3.5;
		if (keys.left) this.x -= 3.5;
		if (keys.space) {
			keys.space = false;
			
			const newBullet = new Bullet(
				imageBullet,
				this.x + this.quadWidth/2 - 6,
				this.y + this.quadHeight/2 + 15
			);

			bulletHero.push(newBullet);
		};

		if (this.x + this.quadWidth >= canvas.width) {
			this.x = canvas.width - this.quadWidth;
		} else if (this.x <= 0) {
			this.x = 0;
		}
	};

	draw() {
		if (this.image) {
			ctx.drawImage(
				this.image,
				this.quadX, this.quadY,
				this.quadWidth, this.quadHeight,
				this.x, this.y,
				this.quadWidth, this.quadHeight
			);
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
			this.y = Math.random() * ((canvas.height - this.quadHeight) - 180) + 180;
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
		this.y += 5;

		for (let i = bulletHero.length - 1; i >= 0; i-- ) {
			const bullet = bulletHero[i];

			if (bullet.y > canvas.height) {
				bulletHero.splice(i, 1);
			}

			for (let j = listFish.length - 1; j >= 0; j-- ) {
				const fish = listFish[j];

				if (dist(fish.x + fish.quadWidth/2, fish.y, bullet.x, bullet.y) <= 25) {
					if (fish.happyFishImage) fish.quadX === 152 ? fish.quadX = 199 : fish.quadX = 152;
					bulletHero.splice(i, 1);
				}

			}
		}
	}

	draw() {
		ctx.drawImage(imageBullet, this.x, this.y);
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
	right: false,
	left: false,
	space: false
};

async function startGame() {
	// Create bullet
	imageBullet = await imageLoader(bullet);

	// Create Hero
	const octoImage = await imageLoader(tileSet);
	const octo = new Hero(spOcto, canvas.width/2, 0);
	
	octo.image = octoImage; 
	octo.x -= octo.quadWidth/2; 
	octo.y = 20;
	
	// Create ennemies
	const fishImage = await imageLoader(tileSet);
	const happyFishImage = await imageLoader(tileSet);

	for (let i = 0; i < 10; i++) {
		let rndPositionX = 0;
		const spawnDice = Math.random() < .5 ? "left" : "right";
		
		if (spawnDice === "left") {
			rndPositionX = Math.random() * (150 - 50) - 50;
			directionLeftOrRight = 1;

		} else {
			rndPositionX = Math.random() * ((canvas.width + 150) - (canvas.width + 50)) + 50;
			directionLeftOrRight = -1;
		}

		const newFish = new Fish(
			spFish,
			rndPositionX,
			0,
			directionLeftOrRight
		);
		
		newFish.image = fishImage;
		newFish.happyFishImage = happyFishImage;
		
		newFish.x -= newFish.quadWidth/2; 
		newFish.y -= newFish.quadHeight/2;
		
		listFish.push(newFish);

		listFish[i].speed = Math.random() * (2 - .1) + .1;
		listFish[i].y = Math.random() * ((canvas.height - 50) - 180) + 180
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
		if (e.key === "ArrowRight") keys.right = true;
		if (e.key === "ArrowLeft") keys.left = true;
		if (e.key === " " && !spaceIsPressed) {
			e.preventDefault();
			keys.space = true;
			spaceIsPressed = true;
		};
	});
	
	document.addEventListener("keyup", (e) => {
		if (e.key === "ArrowRight") keys.right = false;
		if (e.key === "ArrowLeft") keys.left = false;
		if (e.key === " ") {
			e.preventDefault();
			keys.space = false;
			spaceIsPressed = false;
		};
	});
});
