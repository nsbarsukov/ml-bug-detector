import {Directive, ModuleDeclaration, Statement} from "estree";
import {parseScript} from "esprima";
import {readFileSync} from "fs";

import {IParseOptions} from "./models";

/**
 *** Read js file
 *** Get Abstract Syntax Tree of the file
 */
export function getASTJSFile(pathToFile: string): Array<Directive | Statement | ModuleDeclaration> {
    const jsfile = readFileSync(pathToFile, {encoding: "utf8"});
    const PARSER_CONFIGS: IParseOptions = {
        tolerant: true,
        loc: false,
        range: false,
        comment: false,
        jsx: false,
        tokens: false
    }

    return parseScript(jsfile, PARSER_CONFIGS).body;
}