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

define i64 @print_char1(i64 %c) {
  %sym10 = add i64 1, 0
  %sym12 = add i64 %c, 0
  %sym11 = alloca i64, align 4
  store i64 %sym12, i64* %sym11, align 4
  %sym13 = add i64 1, 0
  %sym14 = add i64 33554436, 0
  %sym9 = call i64 asm sideeffect "syscall", "=r,{rax},{rdi},{rsi},{rdx},~{dirflag},~{fpsr},~{flags}" (i64 %sym14, i64 %sym10, i64* %sym11, i64 %sym13)
  ret i64 %sym9
}

define i64 @print1(i64 %n) {
  %ifresult14 = alloca i64, align 4
  %sym15 = add i64 %n, 0
  %sym16 = add i64 9, 0
  %sym13 = icmp sgt i64 %sym15, %sym16
  br i1 %sym13, label %iftrue17, label %iffalse18
iftrue17:
  %sym21 = add i64 %n, 0
  %sym22 = add i64 10, 0
  %sym20 = udiv i64 %sym21, %sym22
  %sym19 = call i64 @print1(i64 %sym20)
  store i64 %sym19, i64* %ifresult14, align 4
  br label %ifend23
iffalse18:
  br label %ifend23
ifend23:
  %sym12 = load i64, i64* %ifresult14, align 4
  %sym25 = add i64 48, 0
  %sym27 = add i64 %n, 0
  %sym28 = add i64 10, 0
  %sym26 = urem i64 %sym27, %sym28
  %sym24 = add i64 %sym25, %sym26
  %sym11 = call i64 @print_char1(i64 %sym24)
  ret i64 %sym11
}

define i64 @main() {
  %sym12 = add i64 123, 0
  %sym11 = call i64 @print1(i64 %sym12)
  ret i64 %sym11
}
