from shared.models import TOKEN_TYPES


def filter_tokens_fo_Word2Vec(tokenized_script):
    filtered_tokens = []

    for token in tokenized_script:
        if token['type'] not in [
            TOKEN_TYPES['blockComments'], TOKEN_TYPES['lineComments'], TOKEN_TYPES['punctuator']
        ]:
            filtered_tokens.append(token['value'])

    return filtered_tokens
