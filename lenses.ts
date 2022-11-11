import { Covariant } from '@fp-ts/core/typeclass/Covariant';
import { Kind, TypeLambda } from '@fp-ts/core/HKT';
import * as C from '@fp-ts/data/Const';
import * as I from '@fp-ts/data/Identity';
import { constant, flow, pipe } from '@fp-ts/data/Function';

// Experimental van Laarhaven lenses using the new `@fp-ts/core` and `@fp-ts/data`

type Lens<S, T, A, B> = <F extends TypeLambda>(F: Covariant<F>) => <R, O, E>(m: (a: A) => Kind<F, R, O, E, B>) => (s: S) => Kind<F, R, O, E, T>;

type MonoLens<S, A> = Lens<S, S, A, A>;

const view: <S, T, A, B>(lens: Lens<S, T, A, B>) => (s: S) => A = (lens) => (s) =>
  lens<C.ConstTypeLambda>(C.Covariant)(C.make)(s).value;

const over: <S, T, A, B>(lens: Lens<S, T, A, B>) => (m: (a: A) => B) => (s: S) => T = (lens) => (m) =>
  lens<I.IdentityTypeLambda>(I.Covariant)(m);

const set: <S, T, A, B>(lens: Lens<S, T, A, B>) => (b: B) => (s: S) => T = (lens) => (b) =>
  lens<I.IdentityTypeLambda>(I.Covariant)(constant(b));

// Tuples

const first = <A, B, X>(): Lens<readonly [A, X], readonly [B, X], A, B> =>
  (F) => (m) => ([first, second]) => pipe(
    m(first),
    F.map((newFirst) => [newFirst, second] as const)
  );

const second = <A, B, X>(): Lens<readonly [X, A], readonly [X, B], A, B> =>
  (F) => (m) => ([first, second]) => pipe(
    m(second),
    F.map((newSecond) => [first, newSecond] as const)
  );

const id = <A>() => <B>(): Lens<A, B, A, B> =>
  (_) => (m) => (s) => m(s);

const prop =
   <S,
    A,
    Field extends keyof A,
    T = S,
    B = A
  >(field: Field) =>
  (lens: Lens<S, T, A, B>): Lens<S, { [K in keyof A]: K extends Field ? B : A[K] }, A[Field], B> =>
    (F) => (m) => (s) => pipe(
      lens(F)((a) => m(a[field]))(s),
      F.map((t) => t[field])
    );

// examples

console.log(view(first())([1, 2] as const))

type MyStruct = {
  x: {
    y: {
      z: number
    }
  }
}

const myStructLens = id<MyStruct>();
const xLens = pipe(myStructLens(), prop('x'));
