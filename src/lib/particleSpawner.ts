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
