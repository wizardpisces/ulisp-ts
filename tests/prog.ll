define i32 @fib(i32 %n) {
  %sym7 = add i32 %n, 0
  %sym8 = add i32 2, 0
  %sym6 = icmp slt i32 %sym7, %sym8
  br i1 %sym6, label %iftrue9, label %iffalse10
iftrue9:
  %sym5 = add i32 %n, 0
  br label %ifend11
iffalse10:
  %sym15 = add i32 %n, 0
  %sym16 = add i32 1, 0
  %sym14 = sub i32 %sym15, %sym16
  %sym12 = call i32 @fib(i32 %sym14)
  %sym18 = add i32 %n, 0
  %sym19 = add i32 2, 0
  %sym17 = sub i32 %sym18, %sym19
  %sym13 = call i32 @fib(i32 %sym17)
  %sym5 = add i32 %sym12, %sym13
  br label %ifend11
ifend11:
  ret i32 %sym5
}

define i32 @main() {
  %sym6 = add i32 8, 0
  %sym5 = call i32 @fib(i32 %sym6)
  ret i32 %sym5
}
