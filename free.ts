import { HKT } from 'fp-ts/HKT';
import * as M from 'fp-ts/Monad';

type FreePure<A> = {
  _tag: 'pure',
  value: A
};

type FreeF<F, A> = {
  _tag: 'free',
  value: HKT<F, Free<F, A>>
}

type Free<F, A> = FreePure<A> | FreeF<F, A>;

const pure = <A>(value: A): FreePure<A> =>
  ({ _tag: 'pure', value });
