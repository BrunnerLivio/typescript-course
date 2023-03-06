type Regex<
  T extends string,
  InCapturingGroup extends boolean = false,
  Output extends string[] = [string]
> = T extends `${infer First}${infer Rest}`
  ? First extends "("
    ? Regex<Rest, true, Output>
    : First extends ")"
    ? InCapturingGroup extends true
      ? Regex<Rest, false, [...Output, string]>
      : Regex<Rest, InCapturingGroup, Output>
    : Regex<Rest, InCapturingGroup, Output>
  : Output;

function tsRegex<T extends string>(reg: T, value: string): Regex<T> {
  const regex = new RegExp(reg, "i");
  return [...value.match(regex) as Regex<T>];
}

const asdf = tsRegex("(.*): (.*)", "foo: bar");

console.log(asdf)

// const b = tsRegex("(.*): (.*)", "foo: bar");

// type A = "(asdf)" extends `${infer First}${infer Rest}` ? Rest : never;

// type B = Regex<"(asdf)(asdf)(asdf)">;
