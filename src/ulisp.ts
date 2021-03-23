import fs from 'fs';
import path from 'path'
import { Args} from './type'
import { parse } from './parser';
import { llvm } from './backend';

export function main(src: string, backendType: 'llvm' | 'x86' = 'llvm') {
    const input = fs.readFileSync(path.join(__dirname,src)).toString();

    let backend;
    switch (backendType) {
        case 'llvm':
        case undefined:
            backend = llvm;
            break;
        // case 'x86':
        //     backend = x86;
        //     break;
        default:
            throw Error('Unsupported backend ' + backendType);
    }

    const [ast] = parse(input);
    const program = backend.compile(ast as Args);

    try {
        fs.mkdirSync('build');
    } catch (e) { }
    backend.build('build', program);
}

// main(process.argv);