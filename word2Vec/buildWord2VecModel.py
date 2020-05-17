import json
from gensim.models.word2vec import Word2Vec
from multiprocessing import cpu_count

from shared.helpers.word2VecPreprocessing import filter_tokens_fo_Word2Vec


def train_word2Vec_model(path_to_tokenized_scripts_json):
    tokenized_scripts_json = open(path_to_tokenized_scripts_json)
    tokenized_scripts_dictionary = json.load(tokenized_scripts_json)

    for fileName in tokenized_scripts_dictionary.keys():
        tokenized_scripts_dictionary[fileName] = filter_tokens_fo_Word2Vec(tokenized_scripts_dictionary[fileName])

    tokenized_scripts_list_of_lists = list(tokenized_scripts_dictionary.values())

    return Word2Vec(
        # list of lists. Example: [["cat", "say", "meow"], ["dog", "say", "woof"]]
        sentences=tokenized_scripts_list_of_lists,

        # The number of dimensions of the embeddings and the default is 100
        size=300,

        # The maximum distance between a target word and words around the target word. The default window is 5.
        window=5,

        # final size of vocabulary
        max_final_vocab=10000,

        # ignore word which freq lower than that number
        min_count=5,

        workers=cpu_count(),

        # The training algorithm, either CBOW(0) or skip gram(1). The default training algorithm is CBOW
        sg=0
    )


path_scripts_json = '../data/parsed-scripts.json'
train_word2Vec_model(path_scripts_json).save('./word2VecModel')
