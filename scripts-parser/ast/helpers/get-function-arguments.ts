import {IAbstractSyntaxTree} from "../models";
import {ESTREE_GUARDS} from "./estree-guards";

export interface IFunctionStorageItem {
    functionName: string | null;
    argumentsNames: unknown[];
    type: string;
}

/**
 * Находит все объявления функций и их использование данном AST дереве файла
 *** Забирает имя функции и имена её аргументов
 */
export function getFunctionArgsFromAST(ast: IAbstractSyntaxTree): IFunctionStorageItem[] {
    const functionsStorage: IFunctionStorageItem[] = [];

    findFunctions(ast, functionsStorage);

    return functionsStorage;
}

function findFunctions(ast: IAbstractSyntaxTree, storageRef: IFunctionStorageItem[]): void {
    for (let entity of ast) {
        /**
         * Ищем все создания функций
         */
        if (ESTREE_GUARDS.FUNCTIONS_DECLARATION(entity)) {
            const {id, params, type} = entity;
            const argumentsNames = params
                .filter(ESTREE_GUARDS.IDENTIFIER_EXPRESSION)
                .map(arg => arg.name);

            const functionName = id && id.name;

            storageRef.push({functionName, argumentsNames, type});
            findFunctions(entity.body.body, storageRef);
        }
        /**
         * среди объявлений переменных могут быть и function expressions
         */
        else if (ESTREE_GUARDS.VARIABLE_DECLARATION(entity)) {
            entity.declarations.forEach(declaration => {
                const declarationId = declaration.id;
                const declarationInit = declaration.init;

                let varName = '';

                if (ESTREE_GUARDS.IDENTIFIER_EXPRESSION(declarationId)) {
                    varName = declarationId.name;
                }

                if (declarationInit && ESTREE_GUARDS.FUNCTION_EXPRESSION(declarationInit)) {
                    const {params, type} = declarationInit;
                    const argumentsNames = params
                        .filter(ESTREE_GUARDS.IDENTIFIER_EXPRESSION)
                        .map(arg => arg.name);

                    storageRef.push({functionName: varName, argumentsNames, type});
                    findFunctions(declarationInit.body.body, storageRef);
                }
            });
        }
        /**
         * Ищем все ВЫЗОВЫ функций
         */
        else if (ESTREE_GUARDS.EXPRESSION_STATEMENT(entity)) {
            const expression = entity.expression;

            if (ESTREE_GUARDS.CALL_EXPRESSION(expression)) {
                const {type, arguments: args, callee} = expression;

                const argumentsNames = args.map(arg => {
                    if (ESTREE_GUARDS.IDENTIFIER_EXPRESSION(arg)) {
                        return arg.name;
                    } else if (ESTREE_GUARDS.LITERAL_EXPRESSION(arg)) {
                        return arg.value;
                    } else if (ESTREE_GUARDS.OBJECT_EXPRESSION(arg)) {
                        return '{}';
                    } else {
                        return '';
                    }
                });
                let functionName = '';

                /**
                 * IIFE
                 * Раньше так делали замыкание, чтобы не всплывали переменные выше (изоляция такая)
                 */
                if (ESTREE_GUARDS.FUNCTION_EXPRESSION(callee)) {
                    findFunctions(callee.body.body, storageRef);
                    continue;
                }

                /**
                 * вызовы обычных функций
                 */
                if (ESTREE_GUARDS.IDENTIFIER_EXPRESSION(callee)) {
                    functionName = callee.name;
                }
                /**
                 * вызовы методов объектов
                 */
                else if (ESTREE_GUARDS.MEMBER_EXPRESSION(callee)) {
                    const objectMethod = callee.property;

                    if (ESTREE_GUARDS.IDENTIFIER_EXPRESSION(objectMethod)) {
                        functionName = objectMethod.name;
                    }
                }

                storageRef.push({type, argumentsNames, functionName});
            }

        }
        /**
         * Ищем объявления классов (внутри них могут вызываться функции)
         */
        else if (ESTREE_GUARDS.CLASS_DECLARATION(entity)) {
            const classMethodsDefinitions = entity.body.body;
            const methodsBodies = classMethodsDefinitions.map(method => method.value.body.body);

            methodsBodies.forEach(methodBody => findFunctions(methodBody, storageRef));
        }
        /**
         * внутри if() блоков также могут быть вызовы функций
         */
        else if(ESTREE_GUARDS.IF_STATEMENT(entity)) {
            const ifBody = entity.consequent;
            if (ESTREE_GUARDS.BLOCK_STATEMENT(ifBody)) {
                findFunctions(ifBody.body, storageRef);
            }
        }
    }
}
