import {readdirSync, writeFileSync, mkdirSync, existsSync} from "fs";

import {tokenizeJSFile} from "./tokenizer/parse-js-file";
import {IToken} from "./tokenizer/models";

const FOLDER_NAME_WITH_SCRIPTS = 'scripts';
const FOLDER_NAME_PUT_PARSED_SCRIPTS = 'data';
const parsingType = process.argv[2];

interface ITokensJson {
    [key: string]: IToken[];
}

parseScripts();

function parseScripts() {
    const jsFilesNames = readdirSync(FOLDER_NAME_WITH_SCRIPTS);
    const tokensJson: ITokensJson = {};

    switch (parsingType) {
        case 'tokenization':
            jsFilesNames.forEach(fileName => {
                const tokens = tokenizeJSFile(`${FOLDER_NAME_WITH_SCRIPTS}/${fileName}`);
                tokensJson[fileName] = tokens;
            });
    }

    if (!(existsSync(FOLDER_NAME_PUT_PARSED_SCRIPTS))) {
        mkdirSync(FOLDER_NAME_PUT_PARSED_SCRIPTS)
    }

    writeFileSync(
        `${FOLDER_NAME_PUT_PARSED_SCRIPTS}/parsed-scripts.json`,
        JSON.stringify(tokensJson, null, 2)
    );
}