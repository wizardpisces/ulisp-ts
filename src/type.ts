export type Literal = string
export type Operator = string
export type FuncName = string
export type Expression = [Operator, Literal, Expression]

export type FuncDefinition = [FuncName, Literal[], ...Expression[]]
export type IfExpression = [Expression, Expression, Expression]

export type Token = string | number
export type Tokens = (Tokens | Token)[]