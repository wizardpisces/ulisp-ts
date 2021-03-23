import os from 'os';

type Literal = string | number
// type Operator = string
// type Expression = [Operator, Literal, Expression]
type Scope = Record<string, string>

import { Expression,FuncDefinition} from './type'
// type TupleType<T extends any[]> = {
//     [P in keyof T]: T[P]
// }
// type InstructionValue = TupleType<Expression>

const BUILTIN_FUNCTIONS: Record<string, string> = { '+': 'plus' };
const primitive_functions: Record<string, Function> = {
    def: compile_define,
    begin: compile_begin,
};

const PARAM_REGISTERS: string[] = ['RDI', 'RSI', 'RDX'];
const LOCAL_REGISTERS: string[] = [
    'RBX',
    'RBP',
    'R12',
];

const SYSCALL_MAP: Record<string, string | number> = os.platform() === 'darwin' ? {
    'exit': '0x2000001',
} : {
        'exit': 60,
    };

let context = {
    assembly: '',
    push(code: string) {
        context.assembly += code + '\n';
    },
    reset(){
        context.assembly = ''
    }
}

function emit(depth: number, code: string) {
    const indent = new Array(depth + 1).map(() => '').join('  ');

    // console.log(indent + code);
    context.push(indent + code);
}

function emit_prefix() {
    emit(1, '.global _main\n');

    emit(1, '.text\n');

    emit(0, 'plus:');
    emit(1, 'ADD RDI, RSI');
    emit(1, 'MOV RAX, RDI');
    emit(1, 'RET\n');
}

function emit_postfix() {
    emit(0, '_main:');
    emit(1, 'CALL main');
    emit(1, 'MOV RDI, RAX'); // Set exit arg
    emit(1, `MOV RAX, ${SYSCALL_MAP['exit']}`);
    emit(1, 'SYSCALL');
}

function compile_define([name, params, ...body]: FuncDefinition, _: string, scope: Scope) {
    // Add this function to outer scope
    scope[name] = name.replace('-', '_');

    // Copy outer scope so parameter mappings aren't exposed in outer scope.
    const childScope = { ...scope };

    emit(0, `${scope[name]}:`);

    params.forEach((param: Literal, i: number) => {
        const register = PARAM_REGISTERS[i];
        const local = LOCAL_REGISTERS[i];
        emit(1, `PUSH ${local}`);
        emit(1, `MOV ${local}, ${register}`);
        // Store parameter mapped to associated local
        childScope[param] = local;
    });

    // Pass childScope in for reference when body is compiled.
    compile_expression(body[0], 'RAX', childScope);

    params.forEach((_: Literal, i: number) => {
        // Backwards first
        const local = LOCAL_REGISTERS[params.length - i - 1];
        emit(1, `POP ${local}`);
    });

    emit(1, 'RET\n');
}

function compile_expression(arg: Expression[number], destination: string, scope: Scope) {
    // Is a nested function call, compile it
    if (Array.isArray(arg)) {
        compile_call(arg[0], arg.slice(1) as Expression, destination, scope);
        return;
    }

    if (scope[arg] || Number.isInteger(arg)) {
        emit(1, `MOV ${destination}, ${scope[arg] || arg}`);
    } else {
        throw new Error('Attempt to reference undefined variable or unsupported literal: ' + arg);
    }
}

function compile_call(fun: string, args: Expression, destination: string, scope: Scope) {
    if (primitive_functions[fun]) {
        primitive_functions[fun](args, destination, scope);
        return;
    }
    // Save param registers to the stack
    args.forEach((_: Expression[number], i: number) => emit(1, `PUSH ${PARAM_REGISTERS[i]}`));

    // Compile arguments and store in param registers
    args.forEach((arg: Expression[number], i: number) => compile_expression(arg, PARAM_REGISTERS[i], scope));

    // call functions
    const validFunction = BUILTIN_FUNCTIONS[fun] || scope[fun];
    if (validFunction) {
        emit(1, `CALL ${validFunction}`);
    } else {
        throw new Error('Attempt to call undefined function: ' + fun);
    }

    // Restore param registers from the stack
    args.forEach((_: Expression[number], i: number) => emit(1, `POP ${PARAM_REGISTERS[args.length - i - 1]}`));

    // Move result into destination if provided
    if (destination) {
        emit(1, `MOV ${destination}, RAX`);
    }

    emit(0, ''); // For nice formatting
}

function compile_begin(body: Expression, destination: string, scope: Scope) {
    body.forEach((expression: Expression[number]) => compile_expression(expression, 'RAX', scope));
    if (destination && destination !== 'RAX') {
        emit(1, `MOV ${destination}, RAX`);
    }
}
export function compile(ast: any) {
    context.reset()
    emit_prefix();
    // Pass in new, empty scope mapping
    compile_call('begin', ast, 'RAX', {});
    emit_postfix();
    return context
};