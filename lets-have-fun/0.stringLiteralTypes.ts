////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// STRING LITERAL TYPES
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


type Decrement = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
type RepeatString<S extends string, N extends number> = N extends 1
  ? S
  : `${S}${RepeatString<S, Decrement[N]>}`;

type Chars =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";
type AllowedChars = Uppercase<Chars> | Chars;

type HexShorthand = `#${RepeatString<AllowedChars, 3>}`;
type RGB = `rgb(${number},${number},${number})`;
type Color = HexShorthand | RGB;

// type HexLonghand  = `#${RepeatString<Chars, 6>}`

const isDark = (hex: Color) => {};

isDark("rgb(0,0,0)");
isDark('#ccc');
isDark('#zzz');
