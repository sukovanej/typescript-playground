type Value1 = { value1: string };
type Value2 = { value2: number };

type HelloValue = { hello: Value1, another: string };
type WorldValue = { world: Value2, anotherOne: number };

type AnyValue = HelloValue | WorldValue;

type Value = { dominik: string } & AnyValue;

type X = Extract<Value, { hello: Value1 }>;
type Y = Extract<Value, WorldValue>;
