import { Layout } from "@pixi/layout";
import { Container, HTMLText, NineSlicePlane, Sprite, Texture } from "pixi.js";
import { DialogueLine, EmojiDict } from "../../lib/dialogue";

import CardAsset from "../../assets/card.png";
import { Tween } from "tweedle.js";

const emojiRegex = /(\{\w+?\})/;

function createDialogueText(
  dialogueText: string,
  emojies: EmojiDict,
  fontSize: number
): Container[] {
  let textParts = dialogueText.split(emojiRegex);
  const elements = textParts.map((textPart) => {
    if (!textPart || textPart.length == 0) {
      return null;
    } else if (textPart.startsWith("{") && textPart.endsWith("}")) {
      const emojiName = textPart.slice(1, textPart.length - 1);
      if (emojiName in emojies) {
        return new Layout({
          content: {
            content: Sprite.from(emojies[emojiName]),
            styles: {
              position: "center",
              display: "block",
              width: "100%",
              height: "100%",
            },
          },
          styles: {
            display: "block",
            width: fontSize * 2,
            marginLeft: 7.5,
            scale: 0.2,
          },
        });
      } else {
        console.warn(`Unsupported emoji ${textPart}, will skip!`);
        return null;
      }
    } else {
      return new HTMLText(textPart, { fontSize });
    }
  });
  return elements.filter((a) => a != null);
}

export type DialogueElement = {
  /**
   * The layout used for the dialogue window and its contents
   */
  layout: Layout;

  /**
   * Callback for running animations before the window is removed.
   *
   * @returns Promise to be resolved when it is okay to proceed with removing this instance from the stage
   */
  beforeRemoval: () => Promise<void>;
};

/**
 * Creates a dialogue window element for showing a line of text.
 *
 * The line of text may include emojies, which if present in the EmojiDict will be replaced
 * with their image counterpart.
 *
 * If no entry exists, a warning will be raised with no other indication of error.
 *
 * @param index Number of the line in the dialogue
 * @param line The line to present
 * @param emojis The map of known emojies to inject
 * @param onPointerTap Callback for when the window has been interacted with
 * @param fontSize Font size for the text line
 * @param nameFontSize Font size for the name bar
 * @returns DialogueElement and trigger for animating out the
 */
export function createDialogueElement(
  index: number,
  line: DialogueLine,
  emojis: EmojiDict,
  onPointerTap: () => void,
  fontSize: number = 20,
  nameFontSize: number = 26
): DialogueElement {
  let dialogueBox = new NineSlicePlane(Texture.from(CardAsset), 4, 4, 4, 4);
  let profilePicture = line.url ? Sprite.from(line.url) : " ";
  let nameBox = new NineSlicePlane(Texture.from(CardAsset), 4, 4, 4, 4);
  let textContents = createDialogueText(line.text, emojis, fontSize);
  let name = new HTMLText(line.avatarName, {
    fontSize: nameFontSize,
    wordWrap: true,
  });

  const layout = new Layout({
    id: `dialogue-${index}`,
    content: {
      name: {
        content: name,
      },
      window: {
        eventMode: "static",
        content: {
          portrait: {
            content: {
              id: `portrait-${index}`,
              content: " ",
            },
          },

          text: {
            content: {
              id: `text-${index}`,
              content: textContents,
            },
          },
        },
      },
    },
    globalStyles: {
      [`dialogue-${index}`]: {
        width: "100%",
        height: "30%",
        position: "bottomCenter",
      },
      name: {
        display: "block",
        position: `${line.position}Top`,
        textAlign: "center",
        align: "center",
        verticalAlign: "middle",
        paddingTop: fontSize / 2,
        paddingLeft: fontSize / 2,
        paddingRight: fontSize / 2,
        width: "20%",
        height: "20%",
        background: nameBox,
      },
      window: {
        display: "block",
        position: "bottom",
        width: "100%",
        height: "80%",
        background: dialogueBox,
      },

      portrait: {
        background: profilePicture,
        backgroundSize: "contain",
        display: "block",
        height: "80%",
        width: "20%",
        position: line.position,
      },
      text: {
        position: line.position == "left" ? "right" : "left",
        textAlign: line.position,
        display: "block",
        height: "80%",
        width: "80%",
      },

      [`text-${index}`]: {
        padding: 8,
        display: "block",
        height: "100%",
        width: "100%",
      },

      [`portrait-${index}`]: {
        display: "block",
        height: "100%",
        width: "100%",
      },
    },
  });
  layout.eventMode = "static";
  layout.on("pointertap", onPointerTap);

  const animateInData = {
    opacity: 0,
  };
  const animateIn = new Tween(animateInData)
    .to({ opacity: 1 }, 500)
    .onUpdate(() => {
      layout.alpha = animateInData.opacity;
    });

  layout.on("added", () => animateIn.start());

  return {
    layout,
    beforeRemoval: () =>
      new Promise<void>((resolve, _) => {
        const animateOutData = {
          opacity: 1,
        };
        const animateOut = new Tween(animateOutData)
          .to({ opacity: 0 }, 500)
          .onUpdate(() => {
            layout.alpha = animateOutData.opacity;
          })
          .onComplete(() => resolve());
        animateOut.start();
      }),
  };
}
