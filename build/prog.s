  .global _main

  .text

plus:
  ADD RDI, RSI
  MOV RAX, RDI
  RET

plus_two:
  PUSH RBX
  MOV RBX, RDI
  PUSH RDI
  PUSH RSI
  MOV RDI, RBX
  MOV RSI, 2
  CALL plus
  POP RSI
  POP RDI
  MOV RAX, RAX

  POP RBX
  RET

main:
  PUSH RDI
  MOV RDI, 3
  CALL plus_two
  POP RDI
  MOV RAX, RAX

  RET

_main:
  CALL main
  MOV RDI, RAX
  MOV RAX, 0x2000001
  SYSCALL
