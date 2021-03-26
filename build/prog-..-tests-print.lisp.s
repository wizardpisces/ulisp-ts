  .global _main

  .text

print_char:
  PUSH RBP
  MOV RBP, RSP

  PUSH 1
  MOV RAX, RBP
  ADD RAX, 16 # &c
  PUSH RAX
  PUSH 1
  POP RDX
  POP RSI
  POP RDI
  MOV RAX, 33554436
  SYSCALL
  PUSH RAX

  POP RAX
  POP RBP

  RET

print:
  PUSH RBP
  MOV RBP, RSP

  # If
    # >
    PUSH [RBP + 16] # n
    PUSH 9
    POP RAX
    CMP [RSP], RAX
    MOV RAX, 0
    MOV DWORD PTR [RSP], 1
    CMOVA RAX, [RSP]
    MOV [RSP], RAX
    # End >

  POP RAX
  TEST RAX, RAX
  JZ .else_branch3

  # If then
    # DIV
    PUSH [RBP + 16] # n
    PUSH 10
    POP RAX
    XCHG [RSP], RAX
    XOR RDX, RDX
    DIV QWORD PTR [RSP]
    MOV [RSP], RAX
  CALL print
  MOV [RSP], RAX

  JMP .after_else_branch3

  # If else
.else_branch3:
  PUSH 0 # Null else branch
.after_else_branch3:
  # End if
  POP RAX # Ignore non-final expression
    # ADD
    PUSH 48
      # DIV
      PUSH [RBP + 16] # n
      PUSH 10
      POP RAX
      XCHG [RSP], RAX
      XOR RDX, RDX
      DIV QWORD PTR [RSP]
      MOV [RSP], RDX
    POP RAX
    ADD [RSP], RAX
    # End ADD
  CALL print_char
  MOV [RSP], RAX

  POP RAX
  POP RBP

  RET

print_char1:
  PUSH RBP
  MOV RBP, RSP

  PUSH 1
  MOV RAX, RBP
  ADD RAX, 16 # &c
  PUSH RAX
  PUSH 1
  POP RDX
  POP RSI
  POP RDI
  MOV RAX, 33554436
  SYSCALL
  PUSH RAX

  POP RAX
  POP RBP

  RET

print1:
  PUSH RBP
  MOV RBP, RSP

  # If
    # >
    PUSH [RBP + 16] # n
    PUSH 9
    POP RAX
    CMP [RSP], RAX
    MOV RAX, 0
    MOV DWORD PTR [RSP], 1
    CMOVA RAX, [RSP]
    MOV [RSP], RAX
    # End >

  POP RAX
  TEST RAX, RAX
  JZ .else_branch4

  # If then
    # DIV
    PUSH [RBP + 16] # n
    PUSH 10
    POP RAX
    XCHG [RSP], RAX
    XOR RDX, RDX
    DIV QWORD PTR [RSP]
    MOV [RSP], RAX
  CALL print1
  MOV [RSP], RAX

  JMP .after_else_branch4

  # If else
.else_branch4:
  PUSH 0 # Null else branch
.after_else_branch4:
  # End if
  POP RAX # Ignore non-final expression
    # ADD
    PUSH 48
      # DIV
      PUSH [RBP + 16] # n
      PUSH 10
      POP RAX
      XCHG [RSP], RAX
      XOR RDX, RDX
      DIV QWORD PTR [RSP]
      MOV [RSP], RDX
    POP RAX
    ADD [RSP], RAX
    # End ADD
  CALL print_char1
  MOV [RSP], RAX

  POP RAX
  POP RBP

  RET

main:
  PUSH RBP
  MOV RBP, RSP

  PUSH 123
  CALL print1
  MOV [RSP], RAX

  POP RAX
  POP RBP

  RET

_main:
  CALL main
  MOV RDI, RAX
  MOV RAX, 33554433
  SYSCALL