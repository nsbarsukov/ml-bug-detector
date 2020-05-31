import {
    BaseNode,
    BlockStatement,
    CallExpression,
    ClassDeclaration,
    Expression,
    ExpressionStatement,
    FunctionDeclaration,
    FunctionExpression,
    Identifier,
    IfStatement,
    Literal,
    MemberExpression,
    ObjectExpression,
    Pattern,
    SpreadElement,
    Super,
    VariableDeclaration
} from "estree";
import {Syntax} from "esprima";

export const ESTREE_GUARDS = {
    FUNCTIONS_DECLARATION: (node: BaseNode): node is FunctionDeclaration => node.type === Syntax.FunctionDeclaration,
    FUNCTION_EXPRESSION: (node: BaseNode): node is FunctionExpression => node.type === Syntax.FunctionExpression,
    CLASS_DECLARATION: (node: BaseNode): node is ClassDeclaration => node.type === Syntax.ClassDeclaration,
    VARIABLE_DECLARATION: (node: BaseNode): node is VariableDeclaration => node.type === Syntax.VariableDeclaration,

    EXPRESSION_STATEMENT: (node: BaseNode): node is ExpressionStatement => node.type === Syntax.ExpressionStatement,
    /**
     * вызовы функций
     */
    CALL_EXPRESSION: (expression: Expression): expression is CallExpression => expression.type === Syntax.CallExpression,

    IDENTIFIER_EXPRESSION: (expression: Expression | Super | Pattern | SpreadElement): expression is Identifier => expression.type === Syntax.Identifier,
    LITERAL_EXPRESSION: (expression: Expression | SpreadElement): expression is Literal => expression.type === Syntax.Literal,
    OBJECT_EXPRESSION: (expression: Expression | SpreadElement): expression is ObjectExpression => expression.type === Syntax.ObjectExpression,
    MEMBER_EXPRESSION: (expression: Expression | Super): expression is MemberExpression => expression.type === Syntax.MemberExpression,

    IF_STATEMENT: (node: BaseNode): node is IfStatement => node.type === Syntax.IfStatement,
    BLOCK_STATEMENT: (node: BaseNode): node is BlockStatement => node.type === Syntax.BlockStatement,
};
