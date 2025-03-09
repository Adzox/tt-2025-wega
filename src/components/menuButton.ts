import { Layout } from "@pixi/layout";
import { Select } from "@pixi/ui";
import { Container, Graphics, HTMLText } from "pixi.js";

function createClosedBackground(
  backgroundColor: number,
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number
) {
  const background = new Graphics()
    .beginFill(backgroundColor)
    .drawRoundedRect(0, 0, width, height, radius);

  const arrow = new HTMLText("📁");
  arrow.anchor.set(0.5);
  arrow.x = x;
  arrow.y = y;
  background.addChild(arrow);

  return background;
}

function createOpenedBackground(
  backgroundColor: number,
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number
) {
  const background = new Graphics()
    .beginFill(backgroundColor)
    .drawRoundedRect(0, 0, width, height * 6, radius);

  const arrow = new HTMLText("📂");
  arrow.anchor.set(0.5);
  arrow.x = x;
  arrow.y = y;
  background.addChild(arrow);

  return background;
}

export function createMenu(
  menuItems: string[],
  onSelectFn: (newIndex: number) => void
): Container {
  const select = new Select({
    closedBG: createClosedBackground(0x444444, 250, 50, 250 * 0.2, 22, 25),
    openBG: createOpenedBackground(0x444444, 250, 45, 250*0.2, 22, 25),
    textStyle: { fill: 0xEBD4CB, fontSize: 14 },
    items: {
      items: menuItems,
      backgroundColor: 0x444444,
      textStyle: { fill: 0xEBD4CB, fontSize: 14 },
      hoverColor: 0xB6465F,
      width: 250,
      height: 50,
    },
    scrollBox: {
      width: 250,
      height: 350,
      radius: 30,
    },
  });

  select.onSelect.connect((value: number, _text: string) => {
    onSelectFn(value);
  });

  const layout = new Layout({
    id: "menu",
    content: select,
    styles: {
      position: "left",
      marginLeft: 10,
      marginTop: 10,
    },
  });
  return layout;
}
