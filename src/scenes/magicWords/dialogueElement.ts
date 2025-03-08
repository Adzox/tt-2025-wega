import { Layout } from "@pixi/layout";
import { Container, HTMLText, NineSlicePlane, Sprite, Texture } from "pixi.js";
import { Dialogue, EmojiDict } from "../../lib/dialogue";

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
              maxWidth: "100%",
              maxHeight: "100%",
            },
          },
          styles: {
            marginLeft: fontSize / 2,
            marginRight: fontSize,
            width: fontSize,
            height: fontSize,
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
  layout: Layout;
  beforeRemoval: () => Promise<void>;
};

export function createDialogueElement(
  index: number,
  dialogue: Dialogue,
  emojis: EmojiDict,
  onTap: () => void,
  fontSize: number = 20,
  nameFontSize: number = 26
): DialogueElement {
  let dialogueBox = new NineSlicePlane(Texture.from(CardAsset), 4, 4, 4, 4);
  let profilePicture = dialogue.url
    ? Sprite.from(dialogue.url)
    : new Container();
  let nameBox = new NineSlicePlane(Texture.from(CardAsset), 4, 4, 4, 4);
  let textContents = createDialogueText(dialogue.text, emojis, fontSize);
  let name = new HTMLText(dialogue.name, {
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
                  position: dialogue.position,
                },
              },
              textContents: {
                content: textContents,
                styles: {
                  width: profilePicture.isSprite ? "90%" : "100%",
                  paddingLeft: 10,
                  paddingTop: 20,
                  display: "block",
                  position: dialogue.position == "left" ? "right" : "left",
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
              position: `${dialogue.position}Top`,
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
  layout.on("pointertap", onTap);

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
