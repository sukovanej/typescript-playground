// 1

abstract class Expr {
  abstract eval(): number;
  abstract print(): string;
}

class Literal extends Expr {
  constructor(private n: number) {
    super();
  }

  eval() {
    return this.n;
  }

  print() {
    return this.n.toString()
  }
}

class Add extends Expr {
  constructor(private left: Expr, private right: Expr) {
    super();
  }

  eval() {
    return this.left.eval() + this.right.eval();
  }

  print() {
    return `(${this.left.print()} + ${this.right.print()})`;
  }
}

class Mult extends Expr {
  constructor(private left: Expr, private right: Expr) {
    super();
  }

  eval() {
    return this.left.eval() * this.right.eval();
  }

  print() {
    return `(${this.left.print()} * ${this.right.print()})`;
  }
}

const main = () => {
  const expr = new Add(new Mult(new Literal(2), new Literal(3)), new Literal(1));
  console.log(expr.print());
}


// 2

import { makeMatchers } from "ts-adt/MakeADT";
import { pipe } from 'fp-ts/function';

type FuncExprLit = { type: 'lit', value: number };
type FuncExprAdd = { type: 'add', left: FuncExpr, right: FuncExpr };
type FuncExprMult = { type: 'mult', left: FuncExpr, right: FuncExpr };
type FuncExpr = FuncExprLit | FuncExprAdd | FuncExprMult;

const createLit = (value: number): FuncExprLit => ({ value, type: 'lit' });
const createAdd = (left: FuncExpr, right: FuncExpr): FuncExprAdd => ({ left, right, type: 'add' });
const createMult = (left: FuncExpr, right: FuncExpr): FuncExprMult => ({ left, right, type: 'mult' });

const [match] = makeMatchers("type");

const evaluate = (expr: FuncExpr): number => pipe(
  expr,
  match({
    'lit': (v) => v.value,
    'add': (v) => evaluate(v.left) + evaluate(v.right),
    'mult': (v) => evaluate(v.left) * evaluate(v.right)
  })
);

const printExpr = (expr: FuncExpr): string => pipe(
  expr,
  match({
    'lit': (v) => v.value.toString(),
    'add': (v) => `(${printExpr(v.left)} + ${printExpr(v.right)})`,
    'mult': (v) => `(${printExpr(v.left)} * ${printExpr(v.right)})`,
  })
)

const mainFunc = () => {
  const expr = createAdd(createMult(createLit(2), createLit(3)), createLit(1));
  console.log(printExpr(expr));
}

mainFunc();
