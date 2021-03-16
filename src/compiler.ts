import os from 'os';

type Arg = string | number
type Operator = string
type Args = [Operator, Arg, Args]
// type TupleType<T extends any[]> = {
//     [P in keyof T]: T[P]
// }
// type InstructionValue = TupleType<Args>

const SYSCALL_MAP = os.platform() === 'darwin' ? {
    'exit': '0x2000001',
} : {
        'exit': 60,
    };

let context = {
    assembly:'',
    push(code:string){
        context.assembly+=code+'\n';
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

    emit(0, '_main:');
}

function emit_postfix() {
    emit(1, 'MOV RDI, RAX'); // Set exit arg
    emit(1, `MOV RAX, ${SYSCALL_MAP['exit']}`); // Set syscall number
    emit(1, 'SYSCALL');
}

function compile_argument(arg: Args[number], destination: string) {
    // If arg AST is a list, call compile_call on it
    if (Array.isArray(arg)) {
        compile_call(arg[0], (arg as Args).slice(1) as Args, destination);
        return;
    }

    // Else must be a literal number, store in destination register
    emit(1, `MOV ${destination}, ${arg}`);
}

const BUILTIN_FUNCTIONS: { [key: string]: string } = { '+': 'plus' };
const PARAM_REGISTERS:string[] = ['RDI', 'RSI', 'RDX'];

function compile_call(fun: string, args: Args, destination?:string) {
    // Save param registers to the stack
    args.forEach((_: Args[number], i: number) => emit(1, `PUSH ${PARAM_REGISTERS[i]}`));

    // Compile arguments and store in param registers
    args.forEach((arg: Args[number], i: number) => compile_argument(arg, PARAM_REGISTERS[i]));

    // Call function
    emit(1, `CALL ${BUILTIN_FUNCTIONS[fun] || fun}`);

    // Restore param registers from the stack
    args.forEach((_: Args[number], i:number) => emit(1, `POP ${PARAM_REGISTERS[args.length - i - 1]}`));

    // Move result into destination if provided
    if (destination) {
        emit(1, `MOV ${destination}, RAX`);
    }

    emit(0, ''); // For nice formatting
}

export function compile(ast:any) {
    emit_prefix();
    compile_call(ast[0], ast.slice(1));
    emit_postfix();
    return context
};