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
            },
          },
          styles: {
            display: "inline",
            marginLeft: fontSize * 0.7,
            marginRight: fontSize * 0.3,
            maxHeight: fontSize,
            width: fontSize * 1.25,
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
  let profilePicture = line.url
    ? Sprite.from(line.url)
    : new Container();
  let nameBox = new NineSlicePlane(Texture.from(CardAsset), 4, 4, 4, 4);
  let textContents = createDialogueText(line.text, emojis, fontSize);
  let name = new HTMLText(line.avatarName, {
    fontSize: nameFontSize,
  });

  const layout = new Layout({
    id: `dialogue-${index}`,
    content: {
      window: {
        content: {
          text: {
            content: {
              profile: {
                content: profilePicture,
                styles: {
                  display: "block",
                  width: "10%",
                  position: line.position,
                },
              },
              textContents: {
                content: textContents,
                styles: {
                  width: profilePicture.isSprite ? "90%" : "100%",
                  paddingLeft: 10,
                  paddingTop: 20,
                  display: "block",
                  position: line.position == "left" ? "right" : "left",
                },
              },
            },
            styles: {
              display: "block",
              background: dialogueBox,
              wordWrap: true,
              position: "bottomCenter",
              align: "left",
              width: "100%",
              height: "100%",
            },
          },
          name: {
            content: name,
            styles: {
              background: nameBox,
              display: "block",
              textAlign: "center",
              paddingLeft: 10,
              paddingTop: 8,
              height: 40,
              marginTop: -40,
              width: "20%",
              position: `${line.position}Top`,
            },
          },
        },
        eventMode: "static",
        styles: {
          position: "bottomCenter",
          width: "100%",
          height: "20%",
        },
      },
    },
    styles: {
      position: "center",
      width: "100%",
      height: "100%",
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
