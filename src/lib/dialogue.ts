
/**
 * Map between emoji tags in DialogueLine and their image source
 */
export type EmojiDict = { [id: string]: string };

/**
 * Map between avatar name in DialogueLine and their related data
 */
export type AvatarDict = { [id: string]: Omit<Avatar, "name"> };

export type Dialogue = {
    lines: DialogueLine[];
    emojies: EmojiDict;
};

export type DialogueLine = {
    text: string;
    avatarName: string;
} & Omit<Avatar, "name">;

interface DialogueText {
    name: string;
    text: string;
}

interface DialogueResponse {
  dialogue: DialogueText[];
  emojies: Emoji[];
  avatars: Avatar[];
}

interface Emoji {
  name: string;
  url: string;
}

interface Avatar {
  name: string;
  url: string;
  position: "left" | "right";
}

/**
 * Fetches the Dialogue data from upstream
 * 
 * To configure where to fetch from, override the following env var:
 * VITE_DIALOGUE_URL=<Your URL>
 * 
 * Note: this function currently has no safety measures or error handling.
 * The caller will instead have to verify that everything is correct. 
 * 
 * @returns Promise to Dialogue data
 */
export async function fetchDialogueData(): Promise<Dialogue> {
  var response = await fetch(import.meta.env.VITE_DIALOGUE_URL);
  const data: DialogueResponse = await response.json();

  const avatarMap: AvatarDict = data.avatars.reduce((a, avatar) => {
    return {
      ...a,
      [avatar.name]: { url: avatar.url, position: avatar.position },
    };
  }, {});

  const emojiMap: EmojiDict = data.emojies.reduce((all, e) => {
    return {
      ...all,
      [e.name]: e.url,
    };
  }, {});

  return {
    lines: data.dialogue.map((d) => {
      const entry: Omit<Avatar, "name"> =
        d.name in avatarMap ? avatarMap[d.name] : { url: "", position: "left" };
      return {
        ...d,
        ...entry,
        avatarName: d.name,
      };
    }),
    emojies: emojiMap,
  };
}
