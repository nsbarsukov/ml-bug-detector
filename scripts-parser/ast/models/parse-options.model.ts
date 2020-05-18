export interface IParseOptions {
    /**
     * Esprima parser fully understands JSX syntax when jsx flag in the parsing configuration object is set to true
     */
    jsx?: boolean;
    /**
     * include an array of two elements,
     * each indicating the zero-based index of the starting and end location (exclusive) of the token
     */
    range?: boolean;
    /**
     * Location.
     * Contains the line number and column number of the starting and end location (exclusive) of the token.
     */
    loc?: boolean;
    /**
     * When Esprima parser is given an input that does not represent a valid JavaScript program, it throws an exception.
     * With the tolerant mode however, the parser may choose to continue parsing
     */
    tolerant?: boolean;
    /**
     * By default, the tokens are not stored as part of the parsing result. It is possible to keep the tokens found during
     the parsing by setting the tokens flag in the configuration object to true.
     */
    tokens?: boolean;
    comment?: boolean;
}