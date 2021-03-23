

export type Arg = string | number
export type Operator = string
export type Args = [Operator, Arg, Args]
// type Scope = Record<string, string>
export type FuncName = string
export type Expression = Args[]
export type FuncDefinition = [FuncName, Arg[], ...Expression]

export type Token = string | number
export type Tokens = (Tokens | Token)[]