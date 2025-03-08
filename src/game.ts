import {
  Application,
  Assets,
  BaseTexture,
  SCALE_MODES,
  Sprite,
  Texture,
} from "pixi.js";

import TestAsset from "./assets/test.png";

export async function initGame() {
  const app = new Application<HTMLCanvasElement>({
    width: 640,
    height: 320,
    resizeTo: document.body,
  });
  app.view.style.imageRendering = "pixelated";
  document.body.appendChild(app.view);

  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

  const texture = (await Assets.load(TestAsset)) as Texture;
  const a = new Sprite(texture);
  a.x = app.renderer.width / 2;
  a.y = app.renderer.height / 2;

  app.stage.addChild(a);
}
