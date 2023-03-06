export enum Color {
  RED = "red",
  GREEN = "green",
  BLUE = "blue",
}

const color = Color.RED;

const ColorObj = {
  RED: "red",
  GREEN: "green",
  BLUE: "blue",
} as const;

type A = typeof ColorObj[keyof typeof ColorObj];

const breakpoints = ["xs", "sm", "md", "lg", "xl"] as const;
type Breakpoint = typeof breakpoints[number];

const Cmp = ({ breakpoint }: { breakpoint: Breakpoint }) => {};