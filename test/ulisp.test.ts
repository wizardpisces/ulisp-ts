import { parse, Tokens } from '../src';
import { compile } from '../src/compiler'
import cp from 'child_process'
import fs from 'fs';

describe('ulisp', () => {
  let program = '(+ 31 (+ 1 2))'

  it('parse expression', () => {
    let tokens: Tokens = [[["+", 31, ["+", 1, 2]]], ""]
    expect(JSON.stringify(parse(program))).toEqual(JSON.stringify(tokens));
  });

  it('parse function', () => {
    let program = '(def main () (+ 1 2))'
    expect(JSON.stringify(parse(program))).toMatchSnapshot();
  });

  it('compile expression', () => {
    const script = program;
    const [ast] = parse(script);
    let context = compile(ast);
    expect(context.assembly).toMatchSnapshot();
  })
  it('compile function ', () => {
    const script = '(def main () (+ 1 2))';
    const [ast] = parse(script);
    let context = compile(ast);
    // console.log(context.assembly)
    expect(context.assembly).toMatchSnapshot();
  })
  it('compile user defined function and call', () => {
    const script = `
(def plus-two (a) (+ a 2))
(def main () (plus-two 3))`;

    const [ast] = parse(script);
    expect(JSON.stringify(ast)).toMatchSnapshot();
    let context = compile(ast);
    expect(context.assembly).toMatchSnapshot();
    // console.log(context.assembly)
    try {
      fs.mkdirSync('build');
    } catch (e) { }
    fs.writeFileSync('build/prog.s', context.assembly);
    cp.execSync('gcc -mstackrealign -masm=intel -o build/a.out build/prog.s');
  })
});
