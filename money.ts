type EUR = number & { _tag: 'EUR' };
type USD = number & { _tag: 'USD' };

const usdToEur = (eur: EUR): USD => undefined;

declare const getMoneyInEur: () => EUR;

// const moneyUSD: USD = getMoneyInEur();

declare const getMoneyInUsd: () => USD;

type DifferentUSD = number & { _tag: 'USD' };

const moneyUSD2: DifferentUSD = getMoneyInUsd();

//

const symbol1 = Symbol();
const symbol2 = Symbol('foo');
const symbol3 = Symbol('foo');

let symbol: Symbol = Symbol();
symbol = Symbol();

symbol1 == symbol1 // true
// symbol1 == symbol2 // false
// symbol2 == symbol3 // false
Symbol('foo') === Symbol('foo')  // false


type USD2 = number & { readonly _tag: unique symbol };
type DifferentUSD2 = number & { readonly _tag: unique symbol };

declare const getMoneyInUsd2: () => USD2;

const moneyUSD3: DifferentUSD2 = getMoneyInUsd2();
