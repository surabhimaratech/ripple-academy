import { initialState, type State } from "./model";
/** Historical demo save used to verify backward compatibility and original rewards. */
export const legacyState = (): State => ({
  ...initialState(),
  starterCollectionAdded: undefined,
  quests: [
    {
      id: "reading",
      title: "Read a chapter of something wonderful",
      subject: "Literature",
      xp: 40,
      gold: 15,
    },
    {
      id: "curiosity",
      title: "Follow a thread of curiosity",
      subject: "Discovery",
      xp: 30,
      gold: 10,
    },
    {
      id: "create",
      title: "Make a little time to create",
      subject: "Creative arts",
      xp: 50,
      gold: 20,
    },
  ],
});
