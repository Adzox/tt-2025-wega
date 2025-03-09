import { Layout } from "@pixi/layout";
import { FancyButton } from "@pixi/ui";
import { Application, Container, Text } from "pixi.js";

export function createIntro(app: Application): Container {
  const root = new Container();

  const button = new FancyButton({
    text: new Text("Enter Fullscreen", { fill: 0x00ff00 }),
    contentFittingMode: "fill",
    anchorX: 0.5,
    anchorY: 0.5,
    animations: {
      hover: {
        props: {
          scale: { x: 1.2, y: 1.2 },
          y: 0,
        },
        duration: 0.7,
      },
      pressed: {
        props: {
          scale: { x: 0.8, y: 0.8 },
          y: 10,
        },
        duration: 0.7,
      },
    },
  });
  button.onPress.connect(() => document.body.requestFullscreen());

  const layout = new Layout({
    content: {
      content: button,
      styles: {
        position: "center",
        width: "1%",
      },
    },
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
