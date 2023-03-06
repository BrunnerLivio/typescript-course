import { Query } from "@codemix/ts-sql";

const db = {
  things: [
    { id: 1, name: "a", active: true },
    { id: 2, name: "b", active: false },
    { id: 3, name: "c", active: true },
  ],
} as const;

type ActiveThings = Query<
  "SELECT id, name AS nom FROM things WHERE active = true",
  typeof db
>;

// ActiveThings is now equal to the following type:
type Expected = [{ id: 1; nom: "a" }, { id: 3; nom: "c" }];