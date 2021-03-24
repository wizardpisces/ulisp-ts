import cp from 'child_process'
import fs from 'fs'
import { Context } from './utility/Context';
import { NamePointer} from './utility/Scope'
// type TupleType<T extends any[]> = {
//     [P in keyof T]: T[P]
// }
// type InstructionValue = TupleType<Expression>
import { FuncDefinition, Literal, Expression, IfExpression } from '../type';
type Platform = 'darwin' | 'linux'

const SYSCALL_TABLE: { 'write': number, 'exit': number } = {
    darwin: {
        write: 0x2000004,
        exit: 0x2000001,
    },
    linux: {
        write: 1,
        exit: 60,
    },
}[process.platform as Platform];

class Compiler {
    outBuffer: string[] = []
    primitiveFunctions: Record<string, Function>

    constructor() {
        this.outBuffer = [];
        this.primitiveFunctions = {
            def: this.compileDefine.bind(this),
            begin: this.compileBegin.bind(this),
            if: this.compileIf.bind(this),
            '+': this.compileOp('add'),
            '-': this.compileOp('sub'),
            '*': this.compileOp('mul'),
            '/': this.compileOp('udiv'),
            '%': this.compileOp('urem'),
            '<': this.compileOp('icmp slt'),
            '>': this.compileOp('icmp sgt'),
            '=': this.compileOp('icmp eq'),
            'syscall/write': this.compileSyscall(SYSCALL_TABLE.write),
            'syscall/exit': this.compileSyscall(SYSCALL_TABLE.exit),
        };
    }

    emit(depth: number, code: string) {
        const indent = new Array(depth + 1).join('  ');
        this.outBuffer.push(indent + code);
    }

    compileSyscall(id:number) {
        return (args:Expression, destination:NamePointer, context:Context) => {
            const argTmps = args
            .map((arg) => {
                const tmp = context.scope.symbol();
                this.compileExpression(arg, tmp, context);
                return tmp.type + ' %' + tmp.value;
            })
            .join(', ');
            const regs = ['rdi', 'rsi', 'rdx', 'r10', 'r8', 'r9'];
            const params = args.map((_, i) => `{${regs[i]}}`).join(',');
            const idTmp = context.scope.symbol().value;
            this.emit(1, `%${idTmp} = add i64 ${id}, 0`);
            this.emit(
                1, 
                `%${destination.value} = call ${destination.type} asm sideeffect "syscall", "=r,{rax},${params},~{dirflag},~{fpsr},~{flags}" (i64 %${idTmp}, ${argTmps})`
            );
        }
    }

    compileOp(op: string) {
        return ([a, b]: [string, string], destination: NamePointer, context: Context) => {
            const arg1 = context.scope.symbol();
            const arg2 = context.scope.symbol();
            this.compileExpression(a, arg1, context);
            this.compileExpression(b, arg2, context);
            this.emit(
                1,
                `%${destination.value} = ${op} ${arg1.type} %${arg1.value}, %${arg2.value}`);
        };
    }

    compileExpression(exp: Expression[number], destination: NamePointer, context: Context) {
        // Is a nested function call, compile it
        if (Array.isArray(exp)) {
            this.compileCall(exp[0], exp.slice(1) as Expression, destination, context);
            return;
        }

        // If numeric literal, store to destination register by adding 0.
        if (Number.isInteger(+exp)) {
            this.emit(1, `%${destination.value} = add i64 ${exp}, 0`);
            return;
        }

        if ((exp).startsWith('&')) {
            const symbol = exp.substring(1);
            const tmp = context.scope.symbol();
            this.compileExpression(symbol, tmp, context);
            this.emit(1, `%${destination.value} = alloca ${tmp.type}, align 4`);
            destination.type = tmp.type + '*';
            this.emit(
                1,
                `store ${tmp.type} %${tmp.value}, ${destination.type} %${destination.value}, align 4`);
            return;
        }
        // If is local, store to destination register similarly.
        const res = context.scope.get(exp);
        if (res) {
            this.emit(1, `%${destination.value} = add ${res.type} %${res.value}, 0`);
        } else {
            throw new Error(
                'Attempt to reference undefined variable or unsupported literal: ' +
                exp,
            );
        }
    }

    compileBegin(body: Expression[], destination: NamePointer, context: Context) {
        body.forEach((expression: Expression[number], i) => {
            const isLast = body.length - 1 === i;
            const contextClone = context.copy();
            contextClone.scope = context.scope;
            if (!isLast) {
                contextClone.tailCallTree = [];
            }
            this.compileExpression(
                expression,
                isLast ? destination : context.scope.symbol(),
                contextClone
            )
        });
    }

    compileIf([test, thenBlock, elseBlock]: IfExpression, destination: NamePointer, context: Context) {
        const testVariable = context.scope.symbol(); 
        const result = context.scope.symbol('ifresult');
        // Space for result
        result.type = 'i64*';
        this.emit(1, `%${result.value} = alloca i64, align 4`);
        // Compile expression and branch
        this.compileExpression(test, testVariable, context);
        const trueLabel = context.scope.symbol('iftrue').value;
        const falseLabel = context.scope.symbol('iffalse').value;
        this.emit(
            1,
            `br i1 %${testVariable.value}, label %${trueLabel}, label %${falseLabel}`,
            );

        // Compile true section
        this.emit(0, trueLabel + ':');
        const tmp1 = context.scope.symbol();
        this.compileExpression(thenBlock, tmp1, context);
        this.emit(
            1,
            `store ${tmp1.type} %${tmp1.value}, ${result.type} %${result.value}, align 4`,
        );
        const endLabel = context.scope.symbol('ifend').value;
        this.emit(1, 'br label %' + endLabel);
        this.emit(0, falseLabel + ':');
        if (elseBlock) {
            const tmp2 = context.scope.symbol();
            this.compileExpression(elseBlock, tmp2, context);
            this.emit(
                1,
                `store ${tmp2.type} %${tmp2.value}, ${result.type} %${result.value}, align 4`,
            );
        }
        this.emit(1, 'br label %' + endLabel);

        // Compile cleanup
        this.emit(0, endLabel + ':');
        this.emit(
            1,
            `%${destination.value} = load ${destination.type}, ${result.type} %${result.value}, align 4`,
        );
    }

    compileDefine([name, params, ...body]: FuncDefinition, _: NamePointer, context: Context) {
        // Add this function to outer context.scope
        const fn = context.scope.register(name);

        // Copy outer context.scope so parameter mappings aren't exposed in outer context.scope.
        const childContext = context.copy();
        childContext.tailCallTree.push(fn.value);

        const safeParams: NamePointer[] = params.map((param: Literal) =>
            // Store parameter mapped to associated local
            childContext.scope.register(param),
        );

        this.emit(
            0,
            `define i64 @${fn.value}(${safeParams
                .map((p:NamePointer) => `${p.type} %${p.value}`)
                .join(', ')}) {`,
        );

        // Pass childContext in for reference when body is compiled.
        const ret = childContext.scope.symbol();
        this.compileBegin(body, ret, childContext);

        this.emit(1, `ret ${ret.type} %${ret.value}`);
        this.emit(0, '}\n');
    }

    compileCall(fun: string, args: Expression, destination: NamePointer, context: Context) {
        if (this.primitiveFunctions[fun]) {
            this.primitiveFunctions[fun](args, destination, context);
            return;
        }

        const validFunction = context.scope.get(fun);
        if (validFunction) {
            const safeArgs = args
                .map((a) => {
                    const res = context.scope.symbol();
                    this.compileExpression(a, res, context);
                    return `${res.type} %` + res.value;
                })
                .join(', ');

            const isTailCall = module.exports.TAIL_CALL_ENABLED &&
                context.tailCallTree.includes(validFunction.value);
            const maybeTail = isTailCall ? 'tail ' : '';

            this.emit(
                1, 
                `%${destination.value} = ${maybeTail}call ${validFunction.type} @${validFunction.value}(${safeArgs})`,
                );
            if (isTailCall) {
                this.emit(1, `ret ${destination.type} %${destination.value}`);
            }
        } else {
            throw new Error('Attempt to call undefined function: ' + fun);
        }
    }

    getOutput() {
        return this.outBuffer.join('\n');
    }

}

function compile(ast: Expression) {
    const c = new Compiler();
    const context = new Context();
    c.compileCall('begin',ast, context.scope.symbol(), context);
    return c.getOutput();
};

function build(buildDir: string, prefix: string = '', program: string) {
    const prog = 'prog-' + prefix;
    fs.writeFileSync(buildDir + `/${prog}.ll`, program);
    cp.execSync(`llc --x86-asm-syntax=intel -o ${buildDir}/${prog}.s ${buildDir}/${prog}.ll`);
    cp.execSync(`gcc -o ${buildDir}/${prog} -masm=intel ${buildDir}/${prog}.s`);
};

export default {
    compile,
    build
}

module.exports.TAIL_CALL_ENABLED = false;