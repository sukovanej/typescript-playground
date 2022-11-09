import express from 'express';
import * as E from 'fp-ts/Either';
import * as IO from 'fp-ts/IO';
import * as IOE from 'fp-ts/IOEither';
import * as B from 'fp-ts/boolean';
import { pipe } from 'fp-ts/function';

const app = express();
const port = 3000;

const unsafeRunIO = <A>(io: IO.IO<A>): A => io();
const unsafeRandom = () => Math.random();
const unsafeRandomBool = () => unsafeRandom() <= 0.5;

const random: IO.IO<number> = unsafeRandom;
const randomBool: IO.IO<boolean> = pipe(random, IO.map((value) => value <= 0.5));

const createResponse = (code: number, json: Record<string, unknown>) =>
  ({ code, json});

const doStuffFp = pipe(
  randomBool,
  IO.chain(B.match(() => IO.of(0), () => random)),
  IO.chain((value) => pipe(
    randomBool,
    IO.map(B.match(() => E.left('error'), () => E.of(value)))
  )),
  IOE.match(
    (error) => createResponse(500, { error }),
    (value) => createResponse(200, { value }),
  )
);

const doStuffException = () => {
  let value = undefined;

  try {
    if (unsafeRandomBool()) {
      value = unsafeRandom();
    }
  } catch (error) {
    value = 0;
  }

  try {
    if (unsafeRandomBool()) {
      throw new Error('error');
    }

    return createResponse(500, { value });
  } catch (error) {
    return createResponse(500, { error: (error as Error).message });
  }
}

app.get('/fp', (_, res) => {
  const { code, json } = unsafeRunIO(doStuffFp);
  res.status(code).send(JSON.stringify(json))
})

app.get('/exception', (_, res) => {
  const { code, json } = doStuffException();
  res.status(code).send(JSON.stringify(json))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
