import { fail } from "assert";
import { expect } from "chai";

type NumberToken = { readonly type: 'number', value: number };
const createNumberToken = (numberStr: string): NumberToken => {
  const parseNumber = numberStr.includes('.') ? parseFloat : (str: string) => parseInt(str, 10);
  return ({ type: 'number', value: parseNumber(numberStr) });
}

type LeftParToken = { readonly type: 'leftPar' };
const leftParToken = { type: "leftPar" } as LeftParToken;

type RightParToken = { readonly type: 'rightPar' };
const rightParToken = { type: "rightPar" } as RightParToken;

type BinaryOperator = "+" | "-" | "*" | "/";
type BinaryOperatorToken = { readonly type: 'binaryOperator', operator: BinaryOperator };
const createBinaryOperatorToken = (operator: BinaryOperator): BinaryOperatorToken => ({ type: 'binaryOperator', operator });

type UnaryOperator = "-";
type UnaryOperatorToken = { readonly type: 'unaryOperator', operator: UnaryOperator };
const createUnaryOperatorToken = (operator: UnaryOperator): UnaryOperatorToken => ({ type: 'unaryOperator', operator });

type Token = NumberToken | LeftParToken | RightParToken | BinaryOperatorToken | UnaryOperatorToken;

const isNumberToken = (token: Token): token is NumberToken => token.type === "number";
const isLeftParToken = (token: Token): token is LeftParToken => token.type === "leftPar";
const isRightParToken = (token: Token): token is RightParToken => token.type === "rightPar";
const isBinaryOperatorToken = (token: Token): token is BinaryOperatorToken => token.type === "binaryOperator";
const isUnaryOperatorToken = (token: Token): token is UnaryOperatorToken => token.type === "unaryOperator";

const isNumber = (str: string): boolean => /^\d$/.test(str);
const isLeftPar = (str: string): str is "(" => str === "(";
const isRightPar = (str: string): str is ")" => str === ")";
const isBinaryOperator = (str: string): str is BinaryOperator => ["+", "-", "*", "/"].includes(str);

const tokenize = (expression: string): Token[] => {
  type State = "init" | "number" | "leftPar" | "rightPar" | "negation" | "binaryOperator";

  let state = "init" as State;
  let tokens: Token[] = [];
  let buffer: string = "";

  const chars = [...expression].filter((char) => char !== " ");

  for (const char of chars) {
    switch (state) {
      case "init":
        if (isNumber(char)) {
          state = "number";
          buffer = char;
        } else if (isLeftPar(char)) {
          state = "leftPar";
          tokens.push(leftParToken)
        } else if (char === "-") {
          state = "negation";
          buffer = "-";
        } else {
          throw Error(`Unexpected symbol '${char}'`);
        }
        break;
      case "number":
        if (isNumber(char) || char === '.') {
          buffer += char;
        } else if (isBinaryOperator(char)) {
          state = "binaryOperator";
          tokens.push(createNumberToken(buffer));
          tokens.push(createBinaryOperatorToken(char));
          buffer = "";
        } else if (isRightPar(char)) {
          state = "rightPar";
          tokens.push(createNumberToken(buffer));
          tokens.push(rightParToken);
          buffer = "";
        } else {
          throw Error(`Unexpected symbol '${char}'`);
        }
        break;
      case "leftPar":
        if (isNumber(char)) {
          buffer = char;
          state = "number";
        } else if (isLeftPar(char)) {
          tokens.push(leftParToken);
        } else if (char === "-") {
          state = "negation";
          buffer = "-";
        } else {
          throw Error(`Unexpected symbol '${char}'`);
        }
        break;
      case "rightPar":
        if (isRightPar(char)) {
          tokens.push(rightParToken);
        } else if (isBinaryOperator(char)) {
          state = "binaryOperator";
          tokens.push(createBinaryOperatorToken(char));
        } else {
          throw Error(`Unexpected symbol '${char}'`);
        }
        break;
      case "negation":
        if (isNumber(char)) {
          state = "number";
          buffer += char;
        } else if (isLeftPar(char)) {
          state = "leftPar";
          tokens.push(leftParToken);
        } else {
          throw Error(`Unexpected symbol '${char}'`);
        }
        break;
      case "binaryOperator":
        if (isNumber(char)) {
          state = "number";
          buffer = char;
        } else if (char === '-') {
          state = "negation";
          tokens.push(createUnaryOperatorToken("-"));
        } else if (isLeftPar(char)) {
          state = "leftPar";
          tokens.push(leftParToken);
        } else {
          throw Error(`Unexpected symbol '${char}'`);
        }
        break;
    }
  }

  if (state === 'number') {
    tokens.push(createNumberToken(buffer));
  } else if (buffer.length !== 0) {
    throw new Error('Unexpected tokenizer error');
  }

  return tokens;
};

type TreeValueNode = { type: "value", value: number };
const createValueNode = (value: number): TreeValueNode => ({ type: 'value', value });

type TreeUnaryNode = { type: "unary", operator: UnaryOperator, value: Tree };
const createUnaryNode = (operator: TreeUnaryNode['operator'], value: TreeUnaryNode['value']): TreeUnaryNode =>
  ({ type: 'unary', operator, value });

type TreeBinaryNode = { type: "node", operator: BinaryOperator, left: Tree, right: Tree };
const createBinaryNode = (operator: TreeBinaryNode['operator'], left: TreeBinaryNode['left'], right: TreeBinaryNode['right']): TreeBinaryNode =>
  ({ type: 'node', operator, left, right });

type Tree = TreeValueNode | TreeUnaryNode | TreeBinaryNode;

/**
 * (expression) E -> T { "+" | "-" E }
 * (term)       T -> F "*" T | F "/" T | F
 * (factor)     F -> "(" E ")" | Integer | "-" Integer
 */

type Index = number;

function unsafeAssertToken<T extends Token>(checkFn: (token: Token) => token is T, token: Token, expected: string): asserts token is T {
  if (!checkFn(token)) {
    throw Error(`Unexpected token '${token.type}', expected '${expected}'`);
  }
}

const parseExpression = (tokens: readonly Token[], index: Index): [Tree, Index] => {
  const [left, index1] = parseTerm(tokens, index);

  if (index1 === tokens.length) {
    return [left, index1];
  }

  const operator = tokens[index1];

  if (operator.type === "rightPar") {
    return [left, index1];
  }

  unsafeAssertToken(isBinaryOperatorToken, operator, "binary operator");

  const [right, index2] = parseTerm(tokens, index1 + 1);

  const tree = createBinaryNode(operator.operator, left, right);

  if (index2 === tokens.length) {
    return [tree, index2];
  }

  const secondOperator = tokens[index2];

  if (secondOperator.type === "rightPar") {
    return [tree, index2];
  }

  unsafeAssertToken(isBinaryOperatorToken, secondOperator, "binary operator");
  const [secondTree, index3] = parseExpression(tokens, index2 + 1);
  return [createBinaryNode(secondOperator.operator, tree, secondTree), index3];
}

const parseTerm = (tokens: readonly Token[], index: Index): [Tree, Index] => {
  const [left, index1] = parseFactor(tokens, index);

  if (index1 === tokens.length) {
    return [left, index1];
  }

  const operator = tokens[index1];

  if (operator.type === "rightPar") {
    return [left, index1];
  }

  unsafeAssertToken(isBinaryOperatorToken, operator, "binary operator");

  if (!["*", "/"].includes(operator.operator)) {
    return [left, index1];
  }

  const [right, index2] = parseFactor(tokens, index1 + 1);
  const tree = createBinaryNode(operator.operator, left, right);

  if (index2 === tokens.length) {
    return [tree, index2];
  }

  const secondOperator = tokens[index2]

  if (!isBinaryOperatorToken(secondOperator) || !["*", "/"].includes(secondOperator.operator)) {
    return [tree, index2];
  }

  const [secondTree, index3] = parseTerm(tokens, index2 + 1);
  return [createBinaryNode(secondOperator.operator, tree, secondTree), index3];
}

const parseFactor = (tokens: readonly Token[], index: Index): [Tree, Index] => {
  const token = tokens[index];

  if (isLeftParToken(token)) {
    const [tree, index1] = parseExpression(tokens, index + 1);
    unsafeAssertToken(isRightParToken, tokens[index1], ")");
    return [tree, index1 + 1];
  } else if (isNumberToken(token)) {
    return [createValueNode(token.value), index + 1];
  } else if (isUnaryOperatorToken(token)) {
    const [expressionTree, index1] = parseExpression(tokens, index + 1);
    const tree = createUnaryNode(token.operator, expressionTree);
    return [tree, index1];
  }

  throw Error("Unexpected error");
}

const createTree = (tokens: readonly Token[]): Tree => {
  const [tree] = parseExpression(tokens, 0);
  return tree;
}

const evaluateTree = (tree: Tree): number => {
  if (tree.type === "value") {
    return tree.value
  } else if (tree.type === "unary") {
    const value = evaluateTree(tree.value);
    return -value;
  } else if (tree.type === "node") {
    const left = evaluateTree(tree.left);
    const right = evaluateTree(tree.right);

    switch (tree.operator) {
      case "-":
        return left - right;
      case "+":
        return left + right;
      case "*":
        return left * right;
      case "/":
        return left / right;
    }
  }

  throw Error('Unknown evaluate error');
}

export function calc(expression: string): number {
  const tokens = tokenize(expression);
  const tree = createTree(tokens);
  return evaluateTree(tree);
}

// TESTS

var tests: [string, number][] = [
  ['1+1', 2],
  ['1 - 1', 0],
  ['1* 1', 1],
  ['1 /1', 1],
  ['-123', -123],
  ['123', 123],
  ['2 /2+3 * 4.75- -6', 21.25],
  ['12* 123', 1476],
  ['2 / (2 + 3) * 4.33 - -6', 7.732],
  ['12* 123/-(-5 + 2)', 492],
];

describe("calc", function() {
  it("basic example 1", () => {
    expect(calc("1 + 1")).to.equal(2);
    expect(calc("1 + 1 + 1")).to.equal(3);
    expect(calc("1 + 1 - 1")).to.equal(1);
    expect(calc("1 - 1 - 1")).to.equal(-1);
    expect(calc("1 - 1 + 1")).to.equal(1);
  });

  it("basic example 2", () => {
    expect(calc("(1 + 2) * 3")).to.equal(9);
  });

  it("example 3", () => {
    expect(calc("((80 - (19)))")).to.equal(61);
  })

  it("should evaluate correctly", () => {
    tests.forEach(function(m, index) {
      try {
        var x = calc(m[0]);
      } catch (e) {
        const errorMessage = (e as Error).message;
        fail(`Failed on ${index}. case with ${errorMessage}`);
      }
      var y = m[1];
      expect(x).to.equal(y, `(${index}) Expected: "` + m[0] + '" to be ' + y + ' but got ' + x);
    });
  });
});
