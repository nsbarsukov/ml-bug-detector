import {FunctionDeclaration, FunctionExpression, ClassDeclaration, BaseNode} from "estree";
import {Syntax} from "esprima";

export const ESTREE_GUARDS = {
    FUNCTIONS_DECLARATION: (statement: BaseNode): statement is FunctionDeclaration => statement.type === Syntax.FunctionDeclaration,
    FUNCTIONS_EXPRESSIONS: (statement: BaseNode): statement is FunctionExpression => statement.type === Syntax.FunctionExpression,
    CLASS_DECLARATIONS: (statement: BaseNode): statement is ClassDeclaration => statement.type === Syntax.ClassDeclaration
};
