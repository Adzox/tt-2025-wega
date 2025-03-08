import { Layout } from "@pixi/layout";
import { Application, HTMLText } from "pixi.js";

export function createFpsDisplay(
  app: Application,
  updateIntervalMs: number = 0.5
): Layout {
  const text = new HTMLText(`FPS: ${app.ticker.FPS.toFixed(2)}`, { fill: 0x00ff00, fontSize: 20 });

  const layout = new Layout({
    id: "fps",
    content: text,
    styles: {
      position: "right",
      marginRight: 10,
      marginTop: 20,
    }
  });

  let timer = 0;
  const textUpdater = (elapsed: number) => {
      if (timer > updateIntervalMs) {
          timer = 0;
          text.text = `FPS: ${app.ticker.FPS.toFixed(2)}`;
        } else {
        timer += elapsed / app.ticker.FPS;
    }
  }

  layout.on("added", () => app.ticker.add(textUpdater));
  layout.on("removed", () => app.ticker.remove(textUpdater));

  return layout;
}
