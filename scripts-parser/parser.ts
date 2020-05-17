import {readdirSync, writeFileSync, mkdirSync, existsSync, Dirent} from "fs";

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
    const jsPathsStorage: string[] = [];
    openDirectoryAndFindAllJS(FOLDER_NAME_WITH_SCRIPTS, jsPathsStorage);

    const tokensJson: ITokensJson = {};

    switch (parsingType) {
        case 'tokenization':
            jsPathsStorage.forEach(jsFilePathWithName => {
                const tokens = tokenizeJSFile(jsFilePathWithName);
                tokensJson[jsFilePathWithName] = tokens;
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

/**
 * Открывает указанную директорию и ищет в нём все js файлы (лежащие внутри с любой вложенностью),
 * а после складывает пути к этим js файлам в массив, который был передан вторым аргументом
 */
function openDirectoryAndFindAllJS(path: string, jsPathsStorage: string[]) {
    const insideEntities = readdirSync(path, {withFileTypes: true}).filter(excludeUselessFiles);

    insideEntities.forEach(entity => {
        if (entity.isDirectory()) {
            openDirectoryAndFindAllJS(`${path}/${entity.name}`, jsPathsStorage);
        } else if (entity.isFile() && entity.name.endsWith('.js')) {
            jsPathsStorage.push(`${path}/${entity.name}`);
        }
    })
}

/**
 * Возвращает false, если название файла/папки:
 *** node_modules
 *** начинается с точки
 */
function excludeUselessFiles(entity: Dirent): boolean {
    return !(entity.name.startsWith('.') || entity.name === 'node_modules');
}
