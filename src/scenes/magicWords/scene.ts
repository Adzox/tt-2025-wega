import { Application, Container } from "pixi.js";

import { fetchDialogueData } from "../../lib/dialogue";
import { Layout } from "@pixi/layout";
import { createDialogueElement, DialogueElement } from "./dialogueElement";

export default function createMagicWords(app: Application): Container {
  const root = new Container();
  root.name = "magicWords";

  const layout = new Layout({
    content: {},
    styles: {
      position: "center",
      width: "100%",
      height: "100%",
    },
  });

  let currentDialogue = 0;
  let dialogues: DialogueElement[] = [];

  const createSwitchDialogue = (dialogueIndex: number) => async () => {
    await dialogues[dialogueIndex].beforeRemoval();
    layout.removeChildAt(0);
    if (dialogueIndex + 1 < dialogues.length) {
      layout.addContent(dialogues[dialogueIndex + 1].layout);
    }
  };

  root.on("added", async () => {
    if (dialogues.length == 0) {
      const data = await fetchDialogueData();
      dialogues = data.lines.map((d, i) =>
        createDialogueElement(i, d, data.emojies, createSwitchDialogue(i))
      );
    }
    currentDialogue = 0;
    layout.addContent(dialogues[currentDialogue].layout);
  });

  root.addChild(layout);
  layout.resize(app.renderer.width, app.renderer.height);
  app.renderer.on("resize", (w, h) => layout.resize(w, h));
  return root;
}
