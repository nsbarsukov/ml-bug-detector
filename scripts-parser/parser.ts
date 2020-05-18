import {readdirSync, writeFileSync, mkdirSync, existsSync, Dirent} from "fs";

import {tokenizeJSFile} from "./tokenizer/tokenize-js-file";
import {ITokensJson} from "./tokenizer/models";

const FOLDER_NAME_WITH_SCRIPTS = 'scripts';
const FOLDER_NAME_PUT_PARSED_SCRIPTS = 'data';
const parsingType = process.argv[2];

enum PARSING_TYPES {
    /**
     * Разбиение на токены
     */
    TOKENIZATION = 'tokenization',
    /**
     * Abstract Syntax Tree
     */
    AST = 'ast'
}

/**
 * В json с каким названием будут складываться распарсенные скрипты
 *** зависит от выбранного мода парсинга
 */
const PARSED_FILES_JSON_NAME = {
    [PARSING_TYPES.TOKENIZATION]: 'tokenized-scripts.json',
    [PARSING_TYPES.AST]: 'ast-scripts.json'
};

parseScripts();

function parseScripts() {
    console.log('Script execution starts!');

    const executionTimeStart = Date.now();

    const jsPathsStorage: string[] = [];
    openDirectoryAndFindAllJS(FOLDER_NAME_WITH_SCRIPTS, jsPathsStorage, 50);

    const tokensJson: ITokensJson = {};

    console.log('Парсинг скриптов начался. Мод -', parsingType);
    switch (parsingType) {
        case PARSING_TYPES.TOKENIZATION:
            jsPathsStorage.forEach(jsFilePathWithName => {
                const tokens = tokenizeJSFile(jsFilePathWithName);
                tokensJson[jsFilePathWithName] = tokens;
            });
            break;

        case PARSING_TYPES.AST:
            console.log('here');
            break;

        default:
            console.log('Введен некорректный мод');
            console.log('Допустимые опции:', Object.values(PARSING_TYPES).toLocaleString());
            return;
    }

    if (!(existsSync(FOLDER_NAME_PUT_PARSED_SCRIPTS))) {
        mkdirSync(FOLDER_NAME_PUT_PARSED_SCRIPTS)
    }

    console.log('Сохраняем в json', Object.values(tokensJson).length, 'файлов...');
    console.log(`Сохраняем в ${PARSED_FILES_JSON_NAME[parsingType]} ${Object.values(tokensJson).length} файлов...`);
    writeFileSync(
        `${FOLDER_NAME_PUT_PARSED_SCRIPTS}/${PARSED_FILES_JSON_NAME[parsingType]}`,
        JSON.stringify(tokensJson, null, 2),
        {encoding:'utf8', flag:'w'}
    );

    console.log('Было обработано', jsPathsStorage.length, 'файла');
    console.log('Время выполнения скрипта составило', Date.now() - executionTimeStart, 'ms');
}

/**
 * Открывает указанную директорию и ищет в нём все js файлы (лежащие внутри с любой вложенностью),
 * а после складывает пути к этим js файлам в массив, который был передан вторым аргументом
 * @param path - путь к директорию, который нужно открыть
 * @param jsPathsStorage - ссылка на массив, куда функция склыдвает пути к найденным js-файлам
 * @param maxDepthFinder - отвечает за максимальную глубину вложенности, после которой уже стоит прекратить
 * @param currentDepth - на каком уровне вложенности мы находимся мы уже сейчас (как часто мы вошли в рекурсию)
 */
function openDirectoryAndFindAllJS(
    path: string,
    jsPathsStorage: string[],
    maxDepthFinder = Infinity,
    currentDepth = 0
): void {
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
function excludeUselessFiles({name: entityName}: Dirent): boolean {
    return !(entityName.startsWith('.') || entityName === 'node_modules');
}
