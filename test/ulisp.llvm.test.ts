import { main } from '../src/ulisp'

describe('ulisp llvm', () => {

  it('function_definition', () => {
    main('../tests/function_definition.lisp')
  });
});
