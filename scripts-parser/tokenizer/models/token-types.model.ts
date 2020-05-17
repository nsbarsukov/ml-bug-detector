export enum TokenTypes {
    /**
     * true / false
     */
    BooleanLiteral = 'Boolean',
    EOF = '<end>',
    /**
     * идентификатор
     * @example название переменной, название проперти объекта и прочее
     */
    Identifier = 'Identifier',
    /**
     * служебные слова
     * @example if else while
     */
    Keyword = 'Keyword',
    NullLiteral = 'Null',
    NumericLiteral = 'Numeric',
    /**
     * Пунктуация
     * @example ( ) { } =
     */
    Punctuator = 'Punctuator',
    StringLiteral = 'String',
    RegularExpression = 'RegularExpression',
    Template = 'Template',
    BlockComment = 'BlockComment',
    LineComment = 'LineComment'
}
