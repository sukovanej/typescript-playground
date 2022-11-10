// HKT

interface TypeConstruct1 {
  readonly 0: unknown
  readonly type: unknown
}

interface TypeConstruct2 extends TypeConstruct1 {
  readonly 1: unknown
}

interface Functor<F extends TypeConstruct1> {
  readonly fmap: <A, B>(f: (a: A) => B) => (fa: Kind<F, A>) => Kind<F, B>
}

type Kind<F, A, B = never> = F extends TypeConstruct2 ? (F & { readonly 0: A, readonly 1: B })['type'] : F extends TypeConstruct1 ? (F & { readonly 0: A })['type'] : never;

// Option

type None = { readonly _tag: 'none' };
type Some<A> = { readonly _tag: 'some', readonly value: A };

type Option<A> = Some<A> | None;

const some = <A>(value: A): Option<A> => ({ _tag: 'some', value })

const isNone = <A>(fa: Option<A>): fa is None =>
  fa._tag === 'none';

const isSome = <A>(fa: Option<A>): fa is Some<A> =>
  fa._tag === 'none';

interface OptionConstructor extends TypeConstruct1 {
  readonly type: Option<this[0]>
}

const optionFunctor: Functor<OptionConstructor> = {
  fmap: (f) => (fa) => isSome(fa) ? some(f(fa.value)) : fa
}

// Option

type Left<E> = { readonly _tag: 'left', readonly left: E };
type Right<A> = { readonly _tag: 'right', readonly right: A };

type Either<E, A> = Left<E> | Right<A>;

const right = <A, E = never>(right: A): Either<E, A> => ({ _tag: 'right', right });

const isLeft = <E, A>(fa: Either<E, A>): fa is Left<E> =>
  fa._tag === 'left';

const isRight = <E, A>(fa: Either<E, A>): fa is Right<A> =>
  fa._tag === 'right';

interface EitherConstructor extends TypeConstruct2 {
  readonly type: Either<this[1], this[0]>
}

const eitherFunctor: Functor<EitherConstructor> = {
  fmap: <A, B>(f: (a: A) => B) => <E>(fa: Either<E, A>): Either<E, B> => isRight(fa) ? right(f(fa.right)) : fa
}
