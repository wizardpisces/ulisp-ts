import { parse } from './parse';
import { compile } from './compiler';

function main(args: any[]) {
    const script = args[2];
    const [ast] = parse(script);
    compile(ast[0]);
}

main(process.argv);