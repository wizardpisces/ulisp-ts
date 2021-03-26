import fs from 'fs';
import path from 'path'
import { Expression} from './type'
import { parse } from './parser';
import { llvm,x86 } from './backend';

export function main(src: string, backendType: 'llvm' | 'x86' = 'llvm') {
    const kernel = fs.readFileSync(__dirname + '/../lib/kernel.lisp').toString();
    const input = kernel + '\n' + fs.readFileSync(path.join(__dirname,src)).toString();

    let backend;
    switch (backendType) {
        case 'llvm':
        case undefined:
            backend = llvm;
            break;
        case 'x86':
            backend = x86;
            break;
        default:
            throw Error('Unsupported backend ' + backendType);
    }

    const [ast] = parse(input);
    const program = backend.compile(ast as Expression);

    try {
        fs.mkdirSync('build');
    } catch (e) { }
    backend.build('build', src.split('/').join('-'), program);
}

// main(process.argv);