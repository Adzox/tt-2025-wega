import { Application, BaseTexture, SCALE_MODES } from "pixi.js";

import { createHeader } from "./components/header";
import createAceOfShadows from "./scenes/aceOfShadows";
import { createIntro } from "./scenes/intro";
import { Group } from "tweedle.js";
import createMagicWords from "./scenes/magicWords/scene";

export function initGame() {
  const app = new Application<HTMLCanvasElement>({
    resizeTo: document.body,
  });
  app.view.style.imageRendering = "pixelated";
  document.body.appendChild(app.view);
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

  // Start animation loop
  const tweenLoop = () => {
    Group.shared.update();
    requestAnimationFrame(tweenLoop);
  }
  tweenLoop();

  // Setup scenes and frame
  const scenes = [
    {
      title: "Intro",
      scene: createIntro(app),
    },
    {
      title: "Ace of Shadows",
      scene: createAceOfShadows(app),
    },
    {
      title: "Magic Words",
      scene: createMagicWords(app),
    },
  ];
  let currentScene = 0;
  const menu = createHeader(
    app,
    scenes.map((s) => s.title),
    (next: number) => {
      if (currentScene == next) {
        return;
      }
      currentScene = next;
      app.stage.removeChildAt(0);
      const scene = scenes[next];
      app.stage.addChildAt(scene.scene, 0);
    }
  );
  app.stage.addChild(scenes[0].scene);
  app.stage.addChild(menu);
}
