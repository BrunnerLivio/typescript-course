type Protocol = `http` | "https";
type Domain = `ch` | "com" | "org" | "net" | "de" | "ch" | "io" | "es";

type Arr<N extends number, T extends any[] = []> = T["length"] extends N
  ? T
  : Arr<N, [...T, any]>;
type Inc<N extends number> = [...Arr<N>, any]["length"];

type BasicUrl = `${Protocol}://${string}.${Domain}${string}`;
type Path<
  T extends string,
  Target extends number,
  Curr extends string = ``,
  Output extends string[] = [],
  Return extends boolean = false
> = Return extends true
  ? Output[Target]
  : T extends `${infer First}${infer Rest}`
  ? First extends "/"
    ? Path<Rest, Target, ``, [...Output, Curr]>
    : Path<Rest, Target, `${Curr}${First}`, Output>
  : Path<"", Target, ``, [...Output, Curr], true>;

type Url<T extends string, Target extends number> = T extends BasicUrl
  ? T extends `${BasicUrl}/${infer PathRest}`
    ? Path<PathRest, Target>
    : ""
  : never;

type Urls = Url<"https://www.google.com/search/asdf", 0>;

function getPath<U extends string, T extends number>(url: U, index: T) {
  const split = url.split("/");
  return split[index] as Url<U, T>;
}

const a = getPath("http://asdf.ch/asdf/qwer", 0);
