import { AnimatedSprite, Application, Container, Sprite } from "pixi.js";
import { Tween } from "tweedle.js";
import {
  getBigFireSprite,
  getSmallFireSprite,
  getSmokeSprite,
  createSpark,
} from "./sprites";
import { addParticleSpawner, toSpawnPromise } from "../../lib/particleSpawner";

function addBigFire(
  flame: Container,
  angle: number,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number
) {
  const baseFire = getBigFireSprite();
  baseFire.anchor.set(0.5);
  baseFire.pivot.set(0.5, 1);
  baseFire.animationSpeed = 0.2;
  baseFire.alpha = 0.85;
  baseFire.angle = angle;
  baseFire.position.set(x, y);
  baseFire.currentFrame = Math.round(
    Math.random() * (baseFire.totalFrames - 1)
  );
  const animData = {
    scaleX: 1 * scaleX,
    scaleY: 1 * scaleY,
    angle,
  };
  const baseAnimation = new Tween(animData)
    .to(
      {
        scaleX: [1.1 * scaleX, 1.3 * scaleX, 0.9 * scaleX, 1.2 * scaleX],
        scaleY: [1.2 * scaleY, 1.1 * scaleY, 1.2 * scaleY, 1.4 * scaleY],
      },
      Math.random() * 200 + 800
    )
    .onUpdate(() => baseFire.scale.set(animData.scaleX, animData.scaleY))
    .repeat(Infinity);

  flame.addChild(baseFire);
  flame.on("added", () => {
    baseFire.play();
    baseAnimation.start();
  });
}

function addSmoke(
  flame: Container,
  amount: number,
  spawnWidth: number,
  baseY: number,
  topY: number
) {
  if (amount == 0) {
    return;
  }

  const createParticle = () => {
    const smokeCloud = getSmokeSprite();
    smokeCloud.anchor.set(0.5);
    smokeCloud.pivot.set(0.5, 0.75);
    smokeCloud.animationSpeed = 0.05;
    smokeCloud.position.set(Math.random() * spawnWidth - spawnWidth / 2, baseY);
    smokeCloud.alpha = 0;
    return smokeCloud;
  };

  const animateSmoke = (particle: AnimatedSprite) => {
    const { x, y } = particle.position;
    const animData = {
      scale: 0,
      opacity: 0.7,
      x,
      y,
      angle: Math.random() * 120,
    };

    const tween = new Tween(animData)
      .to(
        {
          scale: [2, 1.5, 0],
          opacity: 0,
          y: y + baseY - topY,
          angle: 0,
        },
        1217
      )
      .onUpdate(() => {
        particle.scale.set(animData.scale);
        particle.alpha = animData.opacity;
        particle.position.set(animData.x, animData.y);
        particle.angle = animData.angle;
      })
      .delay(Math.random() * 300)
      .start();

    particle.play();

    return toSpawnPromise(tween);
  };

  addParticleSpawner(flame, amount, createParticle, animateSmoke);
}

function addSparks(
  flame: Container,
  amount: number,
  spawnWidth: number,
  baseY: number,
  topY: number
) {
  if (amount == 0) {
    return;
  }

  const createParticle = () => {
    const spark = createSpark(Math.random() * 2);
    spark.anchor.set(0.5);
    spark.pivot.set(0.5, 0.75);
    const x = Math.random() * spawnWidth - spawnWidth / 2;
    const y = baseY;
    spark.position.set(x, y);
    return spark;
  };

  const animateSpark = (spark: Sprite) => {
    const x = spark.position.x;
    const y = spark.position.y;

    const animData = {
      scale: 0,
      opacity: 0.9,
      x,
      y,
      angle: 0,
    };

    const tween = new Tween(animData)
      .to(
        {
          scale: [2, 2.5],
          opacity: [0.7, 0],
          x: x + (Math.random() * spawnWidth) / 2 - spawnWidth / 4,
          y: [y + baseY - topY],
          angle: [0, 120],
        },
        800
      )
      .onUpdate(() => {
        spark.scale.set(animData.scale);
        spark.alpha = animData.opacity;
        spark.position.set(animData.x, animData.y);
        spark.angle = animData.angle;
      })
      .start();

    return toSpawnPromise(tween);
  };

  addParticleSpawner(flame, amount, createParticle, animateSpark);
}

export default function createPhoenixFlame(app: Application): Container {
  const container = new Container();
  const flame = new Container();
  addBigFire(flame, 0, 0, 5, 1.75, 2.75);
  addBigFire(flame, 10, 14, 20, 1.5, 1.5);
  addBigFire(flame, -10, -14, 20, 1.4, 1.4);
  addBigFire(flame, 15, 24, 20, 0.8, 0.8);
  addBigFire(flame, -15, -24, 20, 0.8, 0.8);
  addSmoke(flame, 3, 50, 0, 80);
  addSparks(flame, 2, 50, -20, 20);
  container.addChild(flame);
  container.pivot.set(0.5, 0.5);
  container.scale.set(8);

  const manualLayout = (w: number, h: number) => {
    container.position.set(w / 2, h / 2);
  };
  app.renderer.on("resize", manualLayout);
  manualLayout(app.renderer.width, app.renderer.height);

  return container;
}
