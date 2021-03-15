import { parse } from '../src';

describe('ulisp', () => {
  it('parse', () => {
    expect(JSON.stringify(parse('(+ 3 (+ 1 2)'))).toEqual('[[["+",3,["+",1,2]]],""]');
  });
});
