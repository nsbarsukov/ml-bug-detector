import {tokenize} from "esprima";
import {readFileSync} from "fs";

import {ITokenizerConfigs} from "./models";
import {IToken} from "./models/token.model";

/**
 *** Read js file
 *** Tokenize each word in js script
 *** Also, give type of each token
 */
export function tokenizeJSFile(pathToFile: string): IToken[] {
    const jsfile = readFileSync(pathToFile, {encoding: "utf8"});
    const TOKENIZER_CONFIGS: ITokenizerConfigs = {
        loc: true,
        range: true,
        tolerant: true,
        comment: true
    }

    return tokenize(jsfile,  TOKENIZER_CONFIGS) as IToken[];
}