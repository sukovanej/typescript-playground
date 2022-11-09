type Map1 = {
  a: string,
  b: number
}

type MapStruct<S extends Record<string, unknown>, FieldMap extends Record<keyof S, unknown>> = { [K in keyof S]: FieldMap[K] };

const mapStruct = <S extends Record<string, unknown>, N extends Record<keyof S, unknown>>(f: (k: keyof N) => N[keyof N]) => (struct: S): MapStruct<S, N> => {
  return struct as unknown as MapStruct<S, N>;
}
