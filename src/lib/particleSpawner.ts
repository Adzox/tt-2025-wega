import { Container } from "pixi.js";
import { Tween } from "tweedle.js";

export function toSpawnPromise<T>(
  tween: Tween<T>,
  onComplete: () => void = () => {}
) {
  let promise = new Promise<void>((resolve, _) => {
    tween.onComplete(() => {
      onComplete();
      resolve();
    });
  });
  return promise;
}

export function addParticleSpawner<T extends Container>(
  parent: Container,
  maxAmount: number,
  createParticle: (i: number) => T,
  animate: (particle: T) => Promise<void>,
  refreshCount = 250
) {
  let id: NodeJS.Timeout | null = null;
  let currentCount = 0;

  const spawner = () => {
    if (currentCount < maxAmount) {
      const particle = createParticle(currentCount);
      particle.on("added", () => {
        animate(particle).then(() => {
          currentCount--;
          particle.destroy(false);
        });
      });
      parent.addChild(particle);
      currentCount++;
    }
  };

  parent.on("added", () => {
    id = setInterval(spawner, refreshCount);
  });

  parent.on("removed", () => {
    if (id) {
      clearInterval(id);
      id = null;
      currentCount = 0;
    }
  });
  parent.on("destroy", () => {
    if (id) {
      clearInterval(id);
      id = null;
      currentCount = 0;
    }
  });
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

  let currentSparkCount = 0;

  const spawnSparkAnimation = (
    spawnWidth: number,
    baseY: number,
    topY: number
  ) => {
    const spark = createSpark(Math.random() * 2);
    spark.anchor.set(0.5);
    spark.pivot.set(0.5, 0.75);

    const x = Math.random() * spawnWidth - spawnWidth / 2;
    const y = baseY;
    const animData = {
      scale: 0,
      opacity: 0.9,
      x,
      y,
      angle: 0,
    };

    spark.on("added", () =>
      new Tween(animData)
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
        .onComplete(() => {
          currentSparkCount--;
          spark.destroy(false);
        })
        .start()
    );

    flame.addChild(spark);
  };
}
