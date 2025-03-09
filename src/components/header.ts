import { Layout } from "@pixi/layout";
import { Application, Container } from "pixi.js";
import { createMenu } from "./menuButton";
import { createFpsDisplay } from "./fpsCounter";

export function createHeader(
  app: Application,
  menuItems: string[],
  onSelectFn: (newIndex: number) => void
): Container {
  const root = new Container();
  root.name = "header";

  const layout = new Layout({
    content: [createMenu(menuItems, onSelectFn), createFpsDisplay(app)],
    styles: {
      position: "center",
      width: "100%",
      height: "100%",
    },
  });
  root.addChild(layout);
  layout.resize(app.renderer.width, app.renderer.height);
  app.renderer.on("resize", (w, h) => layout.resize(w, h));
  return root;
}
