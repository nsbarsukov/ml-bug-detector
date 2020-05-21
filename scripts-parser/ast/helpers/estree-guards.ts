import {
    BaseNode,
    CallExpression,
    ClassDeclaration,
    ExpressionStatement,
    Expression,
    FunctionDeclaration,
    FunctionExpression,
    Identifier,
    MemberExpression,
    Super,
    Pattern,
    SpreadElement
} from "estree";
import {Syntax} from "esprima";

export const ESTREE_GUARDS = {
    /* Элементы с body */

    FUNCTIONS_DECLARATION: (node: BaseNode): node is FunctionDeclaration => node.type === Syntax.FunctionDeclaration,
    FUNCTIONS_EXPRESSIONS: (node: BaseNode): node is FunctionExpression => node.type === Syntax.FunctionExpression,
    CLASS_DECLARATIONS: (node: BaseNode): node is ClassDeclaration => node.type === Syntax.ClassDeclaration,

    /*_________________*/

    EXPRESSION_STATEMENT: (node: BaseNode): node is ExpressionStatement => node.type === Syntax.ExpressionStatement,
    /**
     * вызовы функций
     */
    CALL_EXPRESSION: (expression: Expression): expression is CallExpression => expression.type === Syntax.CallExpression,

    IDENTIFIER_EXPRESSION: (expression: Expression | Super | Pattern | SpreadElement): expression is Identifier => expression.type === Syntax.Identifier,
    MEMBER_EXPRESSION: (expression: Expression | Super): expression is MemberExpression => expression.type === Syntax.MemberExpression
};
