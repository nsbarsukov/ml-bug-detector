import {TokenTypes} from "./token-types.model";

export interface IToken {
    type: TokenTypes;
    value: string;
}

export interface ITokensJson {
    [key: string]: IToken[];
}