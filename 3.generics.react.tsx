////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// GENERICS + REACT
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

type Pokemon = { name: string; id: number };

const getPokemons = async () => {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon");
  const data = (await response.json()) as Pokemon[];
  return data;
};

type FormatterParam<T extends () => Promise<unknown[]>> = Awaited<
  ReturnType<T>
>[number];

const Export = <
  FetchFn extends () => Promise<unknown[]>,
  FormatterResult extends FormatterParam<FetchFn>
>({
  fetch,
  formatter,
}: {
  fetch: FetchFn;
  formatter: (input: FormatterParam<FetchFn>) => FormatterResult;
}) => {
  return <div></div>;
};

const a = Export({
  fetch: getPokemons,
  formatter: (pokemon) => ({
    ...pokemon,
    nameId: `${pokemon.name}#${pokemon.id}`,
  }),
});
