import {parseScript} from "esprima";
import {readFileSync} from "fs";

import {IAbstractSyntaxTree, IParseOptions} from "./models";

/**
 *** Read js file
 *** Get Abstract Syntax Tree of the file
 */
export function getAstOfJSFile(pathToFile: string): IAbstractSyntaxTree {
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