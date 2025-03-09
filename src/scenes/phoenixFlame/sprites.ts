import { AnimatedSprite, BaseTexture, Rectangle, SCALE_MODES, Sprite, Texture } from "pixi.js";

import BigFires from "../../assets/fireBig.png";
import SmallFires from "../../assets/fireSmall.png";

const sheet = BaseTexture.from(BigFires, { scaleMode: SCALE_MODES.NEAREST });

export function getBigFireSprite(): AnimatedSprite {
    const width = 16;
    const height = 24;

    return new AnimatedSprite([
        new Texture(sheet, new Rectangle(0, 0, width, height)),
        new Texture(sheet, new Rectangle(width, 0, width, height)),
        new Texture(sheet, new Rectangle(width * 2, 0, width, height)),
        new Texture(sheet, new Rectangle(width * 3, 0, width, height))
    ]);
}

const smallSheet = BaseTexture.from(SmallFires, { scaleMode: SCALE_MODES.NEAREST });

export function getSmallFireSprite(): AnimatedSprite {
    const width = 16;
    const height = 16;

    return new AnimatedSprite([
        new Texture(smallSheet, new Rectangle(width*2, 0, width, height)),
        new Texture(smallSheet, new Rectangle(width*3, 0, width, height)),
        new Texture(smallSheet, new Rectangle(width*2, height, width, height)),
        new Texture(smallSheet, new Rectangle(width*3, height, width, height)),
    ]);
}

export function getSmokeSprite(): AnimatedSprite {
    const width = 16;
    const height = 16;

    return new AnimatedSprite([
        new Texture(smallSheet, new Rectangle(0, height*3, width, height)),
        new Texture(smallSheet, new Rectangle(width, height*3, width, height)),
        new Texture(smallSheet, new Rectangle(width*2, height*3, width, height)),
        new Texture(smallSheet, new Rectangle(width*3, height*3, width, height)),
    ]);
}

export function createSpark(i: number): Sprite {
    const width = 16;
    const height = 16;
    return new Sprite(new Texture(smallSheet, new Rectangle(width * Math.round(i % 1), 0, width, height)))
}
