import cp from 'child_process'
import fs from 'fs'
import Scope from './utility/Scope'

// type TupleType<T extends any[]> = {
//     [P in keyof T]: T[P]
// }
// type InstructionValue = TupleType<Expression>
import { FuncDefinition, Literal, Expression, IfExpression} from '../type'
class Compiler {
    outBuffer: string[] = []
    primitiveFunctions:Record<string,Function>

    constructor() {
        this.outBuffer = [];
        this.primitiveFunctions = {
            def: this.compileDefine.bind(this),
            begin: this.compileBegin.bind(this),
            '+': this.compileOp('add'),
            '-': this.compileOp('sub'),
            '*': this.compileOp('mul'),
            '<': this.compileOp('icmp slt'),
            'if': this.compileIf.bind(this),
        };
    }

    compileIf([test, thenBlock, elseBlock]: IfExpression, destination:string, scope:Scope) {
        const testVariable = scope.symbol();

        // Compile expression and branch
        this.compileExpression(test, testVariable, scope);
        const trueLabel = scope.symbol('iftrue');
        const falseLabel = scope.symbol('iffalse');
        this.emit(1, `br i1 %${testVariable}, label %${trueLabel}, label %${falseLabel}`);

        // Compile true section
        this.emit(0, trueLabel + ':');
        this.compileExpression(thenBlock, destination, scope);
        const endLabel = scope.symbol('ifend');
        this.emit(1, 'br label %' + endLabel);
        this.emit(0, falseLabel + ':');

        // Compile false section
        this.compileExpression(elseBlock, destination, scope);
        this.emit(1, 'br label %' + endLabel);

        // Compile cleanup
        this.emit(0, endLabel + ':');
    }

    emit(depth: number, code: string) {
        const indent = new Array(depth + 1).join('  ');
        this.outBuffer.push(indent + code);
    }

    compileOp(op:string) {
        return ([a, b]:[string, string], destination:string, scope:Scope) => {
            const arg1 = scope.symbol();
            const arg2 = scope.symbol();
            this.compileExpression(a, arg1, scope);
            this.compileExpression(b, arg2, scope);
            this.emit(1, `%${destination} = ${op} i32 %${arg1}, %${arg2}`);
        };
    }

    compileDefine([name, params, ...body]: FuncDefinition, _: string, scope: Scope) {
        // Add this function to outer scope
        const safeName = scope.register(name);

        // Copy outer scope so parameter mappings aren't exposed in outer scope.
        const childScope = scope.copy();

        const safeParams = params.map((param:Literal) =>
            // Store parameter mapped to associated local
            childScope.register(param as string),
        );

        this.emit(
            0,
            `define i32 @${safeName}(${safeParams
                .map((p) => `i32 %${p}`)
                .join(', ')}) {`,
        );

        // Pass childScope in for reference when body is compiled.
        const ret = childScope.symbol();
        this.compileExpression(body[0], ret, childScope);

        this.emit(1, `ret i32 %${ret}`);
        this.emit(0, '}\n');
    }

    compileCall(fun: string, args: Expression, destination: string, scope: Scope){
        if (this.primitiveFunctions[fun]) {
            this.primitiveFunctions[fun](args, destination, scope);
            return;
        }

        const validFunction = scope.get(fun);
        if (validFunction) {
            const safeArgs = args
                .map((a) => {
                    const res = scope.symbol();
                    this.compileExpression(a, res, scope);
                    return 'i32 %' + res;
                })
                .join(', ');
            this.emit(1, `%${destination} = call i32 @${validFunction}(${safeArgs})`);
        } else {
            throw new Error('Attempt to call undefined function: ' + fun);
        }
    }

    compileExpression(exp: Expression[number], destination: string, scope: Scope) {
        // Is a nested function call, compile it
        if (Array.isArray(exp)) {
            this.compileCall(exp[0], exp.slice(1) as Expression, destination, scope);
            return;
        }

        // If numeric literal, store to destination register by adding 0.
        if (Number.isInteger(exp)) {
            this.emit(1, `%${destination} = add i32 ${exp}, 0`);
            return;
        }

        // If is local, store to destination register similarly.
        const res = scope.get(exp as string);
        if (res) {
            this.emit(1, `%${destination} = add i32 %${res}, 0`);
        } else {
            throw new Error(
                'Attempt to reference undefined variable or unsupported literal: ' +
                exp,
            );
        }
    }

    compileBegin(body: Expression, destination: string, scope: Scope) {
        body.forEach((expression: Expression[number], i) =>
            this.compileExpression(
                expression,
                i === body.length - 1 ? destination : scope.symbol(),
                scope,
            ),
        );
    }

    getOutput() {
        return this.outBuffer.join('\n');
    }

}

function compile(ast: Expression) {
    const c = new Compiler();
    const scope = new Scope();
    c.compileBegin(ast, scope.symbol(), scope);
    return c.getOutput();
};

function build(buildDir: string,prefix:string='', program: string) {
    const prog = 'prog-' + prefix;
    fs.writeFileSync(buildDir + `/${prog}.ll`, program);
    cp.execSync(`llc -o ${buildDir}/${prog}.s ${buildDir}/${prog}.ll`);
    cp.execSync(`gcc -o ${buildDir}/${prog} ${buildDir}/${prog}.s`);
};

export default {
    compile,
    build
}