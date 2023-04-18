type Protocol = `http` | "https";
type Domain = `ch` | "com" | "org" | "net" | "de" | "ch" | "io" | "es";

type BasicUrl = `${Protocol}://${string}.${Domain}${string}`;
type Path<
  TPath extends string,
  TIndex extends number,
  Curr extends string = ``,
  Output extends string[] = [],
> =  TPath extends `${infer First}${infer Rest}`
  ? First extends "/"
    ? Path<Rest, TIndex, ``, [...Output, Curr]>
    : Path<Rest, TIndex, `${Curr}${First}`, Output>
  : [...Output, Curr][TIndex];

type Url<TUrl extends string, TIndex extends number> = TUrl extends BasicUrl
  ? TUrl extends `${BasicUrl}/${infer PathRest}`
    ? Path<PathRest, TIndex>
    : ""
  : never;

type Urls = Url<"https://www.google.com/search/asdf", 0>;

function getPath<TUrl extends string, TIndex extends number>(
  url: TUrl,
  index: TIndex
) {
  const split = url.split("/");
  return split[index] as Url<TUrl, TIndex>;
}

const a = getPath("http://qwer.ch/user/search", 1);
