define i64 @print_char(i64 %c) {
  %sym6 = add i64 1, 0
  %sym8 = add i64 %c, 0
  %sym7 = alloca i64, align 4
  store i64 %sym8, i64* %sym7, align 4
  %sym9 = add i64 1, 0
  %sym10 = add i64 33554436, 0
  %sym5 = call i64 asm sideeffect "syscall", "=r,{rax},{rdi},{rsi},{rdx},~{dirflag},~{fpsr},~{flags}" (i64 %sym10, i64 %sym6, i64* %sym7, i64 %sym9)
  ret i64 %sym5
}

define i64 @print(i64 %n) {
  %ifresult10 = alloca i64, align 4
  %sym11 = add i64 %n, 0
  %sym12 = add i64 9, 0
  %sym9 = icmp sgt i64 %sym11, %sym12
  br i1 %sym9, label %iftrue13, label %iffalse14
iftrue13:
  %sym17 = add i64 %n, 0
  %sym18 = add i64 10, 0
  %sym16 = udiv i64 %sym17, %sym18
  %sym15 = call i64 @print(i64 %sym16)
  store i64 %sym15, i64* %ifresult10, align 4
  br label %ifend19
iffalse14:
  br label %ifend19
ifend19:
  %sym8 = load i64, i64* %ifresult10, align 4
  %sym21 = add i64 48, 0
  %sym23 = add i64 %n, 0
  %sym24 = add i64 10, 0
  %sym22 = urem i64 %sym23, %sym24
  %sym20 = add i64 %sym21, %sym22
  %sym7 = call i64 @print_char(i64 %sym20)
  ret i64 %sym7
}

define i64 @fib(i64 %n) {
  %ifresult11 = alloca i64, align 4
  %sym12 = add i64 %n, 0
  %sym13 = add i64 2, 0
  %sym10 = icmp slt i64 %sym12, %sym13
  br i1 %sym10, label %iftrue14, label %iffalse15
iftrue14:
  %sym16 = add i64 %n, 0
  store i64 %sym16, i64* %ifresult11, align 4
  br label %ifend17
iffalse15:
  %sym22 = add i64 %n, 0
  %sym23 = add i64 1, 0
  %sym21 = sub i64 %sym22, %sym23
  %sym19 = call i64 @fib(i64 %sym21)
  %sym25 = add i64 %n, 0
  %sym26 = add i64 2, 0
  %sym24 = sub i64 %sym25, %sym26
  %sym20 = call i64 @fib(i64 %sym24)
  %sym18 = add i64 %sym19, %sym20
  store i64 %sym18, i64* %ifresult11, align 4
  br label %ifend17
ifend17:
  %sym9 = load i64, i64* %ifresult11, align 4
  ret i64 %sym9
}

define i64 @main() {
  %sym11 = add i64 20, 0
  %sym10 = call i64 @fib(i64 %sym11)
  %sym9 = call i64 @print(i64 %sym10)
  ret i64 %sym9
}
