#lang pyret

provide *
provide-types *

data S-Exp:
  | s-list(exps :: List<S-Exp>)
  | s-num(n :: Number)
  | s-str(s :: String)
  | s-sym(s :: String)
end

