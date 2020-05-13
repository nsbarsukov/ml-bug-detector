export interface ITokenizerConfigs {
    /**
     * Location.
     * Contains the line number and column number of the starting and end location (exclusive) of the token.
     */
    loc: boolean;
    /**
     * include an array of two elements,
     * each indicating the zero-based index of the starting and end location (exclusive) of the token
     */
    range: boolean;
    /**
     * When Esprima parser is given an input that does not represent a valid JavaScript program, it throws an exception.
     * With the tolerant mode however, the parser may choose to continue parsing
     */
    tolerant: boolean;
    comment: boolean
}