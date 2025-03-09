import { Container } from "pixi.js";
import { Tween } from "tweedle.js";

/**
 * Returns a promise that resolves once the tween has completed.
 * 
 * If you wish to still use the onComplete, pass it to this function,
 * since the Tween object can only hold one callback on complete.
 * 
 * @param tween Tween to register to onComplete
 * @param onComplete User-defined onComplete to be called before resolving
 * @returns Promise that resolves after the animation is complete
 */
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

/**
 * Helper to add rate-limited particle spawning functionality to a scene. 
 * 
 * @param parent Which parent to attach to
 * @param maxAmount Maximum amount of particles on screen
 * @param createParticle Function to construct particle view
 * @param animate Function to animate particle view
 * @param refreshCount Set custom rate limit on when to check for spawning.
 */
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
