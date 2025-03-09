export interface DialogueResponse {
  dialogue: DialogueText[];
  emojies: Emoji[];
  avatars: Avatar[];
}

export type EmojiDict = { [id: string]: string };
export type AvatarDict = { [id: string]: Omit<Avatar, "name"> };

export type Dialogues = {
  dialogues: Dialogue[];
  emojies: EmojiDict;
};

export type Dialogue = {
  text: string;
  name: string;
} & Omit<Avatar, "name">;

export interface DialogueText {
  name: string;
  text: string;
}

export interface Emoji {
  name: string;
  url: string;
}

export interface Avatar {
  name: string;
  url: string;
  position: "left" | "right";
}

export async function fetchDialogueData(): Promise<Dialogues> {
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
    dialogues: data.dialogue.map((d) => {
      const entry: Omit<Avatar, "name"> =
        d.name in avatarMap ? avatarMap[d.name] : { url: "", position: "left" };
      return {
        ...d,
        ...entry,
      };
    }),
    emojies: emojiMap,
  };
}
