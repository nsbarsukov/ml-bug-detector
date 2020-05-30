import json
from shared.helpers.word2VecPreprocessing import filter_tokens_fo_Word2Vec


def transform_json_file_to_train_data(path_to_json_file):
    tokenized_scripts_dic = {}

    tokenized_scripts_json = open(path_to_json_file)
    raw_tokenized_scripts_dictionary = json.load(tokenized_scripts_json)

    for fileName in raw_tokenized_scripts_dictionary.keys():
        tokenized_scripts_dic[fileName] = filter_tokens_fo_Word2Vec(raw_tokenized_scripts_dictionary[fileName])

    return list(tokenized_scripts_dic.values())
