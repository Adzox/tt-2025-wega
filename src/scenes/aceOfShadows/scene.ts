import { Application, Container, HTMLText, Sprite } from "pixi.js";

import CardAsset from "../../assets/card.png";
import { Easing, Tween } from "tweedle.js";

export function createCard(
  maxNumber: number,
  number: number,
  x: number,
  y: number,
  xGap: number,
  yGap: number
): { container: Container; tween: Tween<{ x: number; y: number }> } {
  const container = new Container();

  const sprite = Sprite.from(CardAsset);
  sprite.anchor.set(0.5, 0.5);
  const text = new HTMLText(`#${number}`, { fill: 0x000000, fontSize: 20 });
  text.anchor.set(0.5, 0.5);
  container.addChild(sprite);
  container.addChild(text);
  
  let position = {
    x: x,
    y: y + yGap * number,
    z: maxNumber - number - 1,
  };
  container.position.set(position.x, position.y);
  container.zIndex = position.z;
  const tween = new Tween(position)
    .delay(1000 * number)
    .to(
      {
        x: x + xGap / 2,
        y: y,
        z: maxNumber - number - 1,
      },
      1000
    )
    .easing(Easing.Quadratic.In)
    .onUpdate(() => {
      container.position.set(position.x, position.y);
      container.zIndex = position.z;
    })
    .onComplete(() => (container.zIndex = number))
    .chain(
      new Tween(position)
        .to(
          {
            x: x + xGap,
            y: y + yGap * (maxNumber - number - 1),
          },
          1000
        )
        .easing(Easing.Bounce.Out)
        .onUpdate(() => {
          container.position.set(position.x, position.y);
        })
    );

  return { container, tween };
}

export default function createAceOfShadows(
  app: Application,
  cardCount: number = 144
): Container {
  const cards = [...Array(cardCount).keys()].map((i) =>
    createCard(cardCount, i, -60, -300, 120, 4)
  );
  const container = new Container();
  container.addChild(...cards.map((c) => c.container));
  container.sortableChildren = true;
  container.scale.set(0.75);
  container.on("added", () => {
    cards.forEach((c) => c.tween.start());
  });

  container.on("removed", () => {
    cards.forEach((c) => {
      c.tween.end();
    });
  });

  const manualLayout= (w: number, h: number) => {
    container.position.set(w / 2, h / 2);
  }
  app.renderer.on("resize", manualLayout);
  manualLayout(app.renderer.width, app.renderer.height);

  return container;
}
