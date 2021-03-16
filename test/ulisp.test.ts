import { parse,Tokens } from '../src';
import {compile} from '../src/compiler'

describe('ulisp', () => {
  let program = '(+ 31 (+ 1 2))'
  it('parse', () => {
    let tokens: Tokens = [[["+", 31, ["+", 1, 2]]], ""]
    expect(JSON.stringify(parse(program))).toEqual(JSON.stringify(tokens));
  });
  it('compile',()=>{
    const script = program;
    // const result = `.global _main
    //   .text
    // plus:  ADD RDI, RSI  MOV RAX, RDI  RET
    // _main:  PUSH RDI  PUSH RSI  MOV RDI, 31  PUSH RDI  PUSH RSI  MOV RDI, 1  MOV RSI, 2  CALL plus  POP RSI  POP RDI  MOV RSI, RAX  CALL plus  POP RSI  POP RDI  MOV RDI, RAX  MOV RAX, 0x2000001  SYSCALL`
    const [ast] = parse(script);
    let context = compile(ast[0]);
    expect(context.assembly).toMatchSnapshot();
    console.log(context.assembly)
  })
});
