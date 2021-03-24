import Scope from './Scope';

export class Context {
  scope!:Scope
  tailCallTree:string[]
  constructor() {
    this.scope = new Scope();
    this.tailCallTree = [];
  }

  copy() {
    const c = new Context();
    c.tailCallTree = [...this.tailCallTree];
    c.scope = this.scope.copy();
    return c;
  }
}

module.exports.Context = Context;
