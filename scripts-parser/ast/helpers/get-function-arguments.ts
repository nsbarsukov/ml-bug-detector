import {writeFileSync} from "fs";

import {IAbstractSyntaxTree} from "../models";
import {getAstOfJSFile} from "../get-ast-from-js-file";
import {ESTREE_GUARDS} from "./estree-guards";


/**
 * Находит все объявления функций и их использование данном AST дереве файла
 */
export function getFunctionArgsFromAST(ast: IAbstractSyntaxTree) {
    const partOfTreeWithBody = findAllRootPartOfTreeWithBody(ast);


    writeFileSync(
        `test.json`,
        JSON.stringify(partOfTreeWithBody, null, 2),
        {encoding:'utf8', flag:'w'}
    );
}
// const ast = getAstOfJSFile('scripts/bahmutov/js-complexity-viz/src/history.js');
const ast = getAstOfJSFile('scripts/clappr/clappr/src/plugins/google_analytics/google_analytics.js');

getFunctionArgsFromAST(ast);

/**
 * Находит в синтаксическом дереве все элементы c пропертей body
 */
function findAllRootPartOfTreeWithBody(ast: IAbstractSyntaxTree) {
    const functionsDeclarations = ast.filter(ESTREE_GUARDS.FUNCTIONS_DECLARATION);
    const functionsExpressions = ast.filter(ESTREE_GUARDS.FUNCTIONS_EXPRESSIONS);
    const classesDeclarations = ast.filter(ESTREE_GUARDS.CLASS_DECLARATIONS);

    return {functionsDeclarations, functionsExpressions, classesDeclarations}
}
