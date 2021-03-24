(def print-char (c)
     ; First argument is stdout
     ; Second argument is a pointer to a char array (of length one)
     ; Third argument is the length of the char array
     (syscall/write 1 &c 1))

(def print (n)
     (if (> n 9)
         (print (/ n 10)))

     ; 48 is the ASCII code for '0'
     (print-char (+ 48 (% n 10))))
