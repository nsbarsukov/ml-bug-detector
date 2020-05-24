import {readdirSync, writeFileSync, mkdirSync, existsSync, Dirent} from "fs";

import {tokenizeJSFile} from "./tokenizer/tokenize-js-file";
import {IToken} from "./tokenizer/models";
import {getAstOfJSFile} from "./ast/get-ast-from-js-file";
import {getFunctionArgsFromAST, IFunctionStorageItem} from "./ast/helpers";

export interface IParsedScriptsJson {
    [scriptName: string]: IToken[] | IFunctionStorageItem[];
}

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
    AST_4_FUNCTION_ARGS = 'ast-function-arguments',
    /**
     * раздел дебага некой функциональности (TODO: вырезать в финальном варианте)
     */
    DEBUG_MOD = 'debug'
}

/**
 * В json с каким названием будут складываться распарсенные скрипты
 *** зависит от выбранного мода парсинга
 */
const PARSED_FILES_JSON_NAME = {
    [PARSING_TYPES.TOKENIZATION]: 'tokenized-scripts',
    [PARSING_TYPES.AST_4_FUNCTION_ARGS]: 'ast-functions',
    [PARSING_TYPES.DEBUG_MOD]: 'debug',

};

parseScripts();

function parseScripts() {
    console.log('Script execution starts!');
    const executionTimeStart = Date.now();

    const jsPathsStorage: string[] = [];
    openDirectoryAndFindAllJS(FOLDER_NAME_WITH_SCRIPTS, jsPathsStorage, 100);

    console.log('Парсинг скриптов начался. Мод -', parsingType);
    switch (parsingType) {
        case PARSING_TYPES.TOKENIZATION:
            /**
             * так как токенизация крайне затратная операция в вычислительных мощностях,
             * то чтобы избежать ошибки JavaScript heap out of memory,
             * пришлось делить этот процесс на микро задачи
             */
            const partOfJSPathStorage = splitJSFilesPathsStorage(jsPathsStorage);

            partOfJSPathStorage.forEach((jsPathMiniStorage, index) => {
                const tokenizedScripts = tokenizeFiles(jsPathMiniStorage);
                saveResultsToJson(tokenizedScripts, parsingType, `${index}`);
            });
            break;

        case PARSING_TYPES.AST_4_FUNCTION_ARGS:
            const parsedScriptsJson: IParsedScriptsJson = {};
            let numberScriptParsedWithFail = 0;

            jsPathsStorage.forEach(jsFilePathWithName => {
                try {
                    const ast = getAstOfJSFile(jsFilePathWithName);
                    parsedScriptsJson[jsFilePathWithName] = getFunctionArgsFromAST(ast);
                } catch(e) {
                    numberScriptParsedWithFail++;
                }
            });
            console.log('Количество скриптов, которые не удалось спарсить –', numberScriptParsedWithFail);
            saveResultsToJson(parsedScriptsJson, parsingType);
            break;

        case PARSING_TYPES.DEBUG_MOD:
            // const jsFilePath = 'scripts/bahmutov/js-complexity-viz/src/history.js';
            // const jsFilePath = 'scripts/clappr/clappr/src/plugins/google_analytics/google_analytics.js';
            // writeFileSync(
            //     `${FOLDER_NAME_PUT_PARSED_SCRIPTS}/ast.json`,
            //     JSON.stringify(ast, null, 2),
            //     {encoding:'utf8', flag:'w'}
            // );
            // const parsedScriptsDebugJson: IParsedScriptsJson = {};
            // saveResultsToJson(parsedScriptsDebugJson, parsingType);

            const parts = splitJSFilesPathsStorage(jsPathsStorage, 500);

            parts.slice(0, 3).forEach((jsPathMiniStorage, index) => {
                const tokenizedScripts = tokenizeFiles(jsPathMiniStorage);
                saveResultsToJson(tokenizedScripts, parsingType, `${index}`);
            });
            break;

        default:
            console.log('Введен некорректный мод');
            console.log('Допустимые опции:', Object.values(PARSING_TYPES).toLocaleString());
            return;
    }

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
            openDirectoryAndFindAllJS(`${path}/${entity.name}`, jsPathsStorage, maxDepthFinder, currentDepth + 1);
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

/**
 * Сохряняет результаты парсинга в файл json
 * @param json - словарь (ключ - путь к файлу, значение - токены файлы) с результатами пасринга
 * @param parsingType - каков был тип парсинга (каждый тип парсинга сохраняется со своим названием JSON файла)
 * @param prefixToJsonFile - добавляемый префикс к названию файла JSON
 * (нужно для ситуации, когда данный тип парсинга жрет крайне много мощностей и мы делим его на микрозадачи)
 */
function saveResultsToJson(json: IParsedScriptsJson, parsingType: PARSING_TYPES, prefixToJsonFile = ''): void {
    if (!(existsSync(FOLDER_NAME_PUT_PARSED_SCRIPTS))) {
        mkdirSync(FOLDER_NAME_PUT_PARSED_SCRIPTS)
    }

    const jsonFileName = `${PARSED_FILES_JSON_NAME[parsingType]}_${prefixToJsonFile}.json`;

    console.log(`Сохраняем в ${jsonFileName}.`);
    console.log('Сохраняем в json', Object.values(json).length, 'файлов...');

    try {
        writeFileSync(
            `${FOLDER_NAME_PUT_PARSED_SCRIPTS}/${jsonFileName}`,
            JSON.stringify(json, null, 2),
            {encoding:'utf8', flag: 'w+'}
        );
    } catch(e) {
        console.log('Произошла ошибка при сохранении файла :(');
    }
}

/**
 * Делит массив с путями к js файлами на такие же массивы меньшего размера
 * @param storage изначальный массив, который содержит ссылки КО ВСЕМ файлам
 * @param partStorageSize размер каждого массива, на которые будет поделен изначальный массив с путями к файлам
 */
function splitJSFilesPathsStorage(storage: string[], partStorageSize = 500): string[][] {
    const storageSize = storage.length;
    const partsAmount = Math.ceil(storageSize / partStorageSize);

    const partOfStorage = [];

    for (let part = 1; part <= partsAmount; part++) {
        const minBorder = (part - 1) * partStorageSize;
        const maxBorder = part * partStorageSize;

        partOfStorage.push( storage.slice(minBorder, maxBorder) );
    }

    return partOfStorage;
}

function tokenizeFiles(JSFilesPathStorage: string[]): IParsedScriptsJson {
    const parsedScriptsJson: IParsedScriptsJson = {};

    JSFilesPathStorage.forEach(jsFilePathWithName => {
        try {
            parsedScriptsJson[jsFilePathWithName] = tokenizeJSFile(jsFilePathWithName);
        } catch(e) {
            console.log('Не удалось спарсить файл', jsFilePathWithName);
        }
    });

    return parsedScriptsJson;
}