import {Directive, ModuleDeclaration, Statement, Function} from "estree";

export type IAbstractSyntaxTree = Array<Directive | Statement | ModuleDeclaration | Function>;

export interface IAbstractSyntaxTreeJson {
    [key: string]: IAbstractSyntaxTree
}
