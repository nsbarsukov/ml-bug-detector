import {Directive, ModuleDeclaration, Statement} from "estree";

export type IAbstractSyntaxTree = Array<Directive | Statement | ModuleDeclaration>;

export interface IAbstractSyntaxTreeJson {
    [key: string]: IAbstractSyntaxTree
}