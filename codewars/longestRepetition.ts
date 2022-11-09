import { assert } from 'chai'

export function longestRepetition (text: string): [string, number] {
  if (text.length === 0) {
    return ['', 0];
  }

  let [longest, length] = [text[0], 1];
  let index = 1;
  
  while (text[index] === longest && index < text.length) {
    length = length + 1;
    index = index + 1;
  }

  let [newLongest, newLength] = longestRepetition(text.slice(index));

  if (newLength > length) {
    return [newLongest, newLength];
  }
  
  return [longest, length];
}

describe('Example Tests', () => {
  it('should work with example tests', () => {
    assert.deepStrictEqual(longestRepetition('aaaabb'), ['a', 4])
    assert.deepStrictEqual(longestRepetition('bbbaaabaaaa'), ['a', 4])
    assert.deepStrictEqual(longestRepetition('cbdeuuu900'), ['u', 3])
    assert.deepStrictEqual(longestRepetition('abbbbb'), ['b', 5])
    assert.deepStrictEqual(longestRepetition('aabb'), ['a', 2])
    assert.deepStrictEqual(longestRepetition('ba'), ['b', 1])
    assert.deepStrictEqual(longestRepetition(''), ['', 0])
  })
})
