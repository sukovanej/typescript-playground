const weight = (str: string): number => 
  [...str].map((i) => parseInt(i)).reduce((a, b) => a + b);

const compare = (a: string, b: string): number => {
  return weight(a) - weight(b);
}

export function orderWeight(strng: string): string {
  return strng.split(' ').sort(compare).map((n) => n.toString()).join(' ');
}
