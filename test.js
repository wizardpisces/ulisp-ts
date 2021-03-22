 const cp = require('child_process')
 cp.execSync('name=`echo "home1"` && echo $name>&2');
//  cp.execSync('gcc -mstackrealign -masm=intel -o build/a.out build/prog.s');
 let result = cp.execSync('./build/a.out && result=`echo $?` && echo $result>&1');
//  console.log(result)