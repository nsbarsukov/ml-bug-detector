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
    console.log('Script execution starts!');

    const executionTimeStart = Date.now();

    const jsPathsStorage: string[] = [];
    openDirectoryAndFindAllJS(FOLDER_NAME_WITH_SCRIPTS, jsPathsStorage, 50);

    const tokensJson: ITokensJson = {};

    console.log('Парсинг скриптов начался. Мод -', parsingType);
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

    console.log('Сохраняем в json', Object.values(tokensJson).length, 'файлов...');
    writeFileSync(
        `${FOLDER_NAME_PUT_PARSED_SCRIPTS}/parsed-scripts.json`,
        JSON.stringify(tokensJson, null, 2),
        {encoding:'utf8', flag:'w'}
    );

    console.log('Было токенизировано', jsPathsStorage.length, 'файла');
    console.log('Время выполнения скрипта составило', Date.now() - executionTimeStart, 'ms');
}

/**
 * Открывает указанную директорию и ищет в нём все js файлы (лежащие внутри с любой вложенностью),
 * а после складывает пути к этим js файлам в массив, который был передан вторым аргументом
 * @param maxDepthFinder - отвечает за максимальную глубину вложенности, после которой уже стоит прекратить
 */
function openDirectoryAndFindAllJS(path: string, jsPathsStorage: string[], maxDepthFinder = Infinity, currentDepth = 0) {
    const insideEntities = readdirSync(path, {withFileTypes: true}).filter(excludeUselessFiles);

    insideEntities.forEach(entity => {
        if (entity.isDirectory() && currentDepth <= maxDepthFinder) {
            openDirectoryAndFindAllJS(`${path}/${entity.name}`, jsPathsStorage, maxDepthFinder, currentDepth++);
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
