import {TokenTypes} from "./token-types.model";

export interface IToken {
    type: TokenTypes;
    value: string;
}
