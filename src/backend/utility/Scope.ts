export type NamePointer = { type: string, value: string };
type Locals = Record<string, NamePointer>;

export default class Scope {
  locals: Locals = {}
  constructor() {
    this.locals = {};
  }

  symbol(prefix = 'sym'): NamePointer {
    const nth = Object.keys(this.locals).length + 1;
    return this.register(prefix + nth);
  }

  get(name: string): NamePointer {
    return this.locals[name];
  }

  register(name: string): NamePointer {
    let namePointer: string = name.replace('-', '_');
    let n = 1;
    while (this.locals[namePointer]) {
      namePointer = name + n++;
    }

    this.locals[name] = {
      value: namePointer,
      type: 'i64',
    };
    return this.locals[name];
  }

  copy(): Scope {
    const c = new Scope();
    c.locals = { ...this.locals };
    return c;
  }
}
