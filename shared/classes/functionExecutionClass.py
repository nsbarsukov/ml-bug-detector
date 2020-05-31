from gensim.models.word2vec import Word2Vec

from shared.consts import FUNCTIONS_JSON_PROPERTIES_NAMES, PATH_TO_WORD2VEC_MODEL
from shared.helpers import get_key_in_func_creation_dict


class FunctionExecution:
    def __init__(self, func_exec_dic, func_creation_dic, word2VecModel = Word2Vec.load(PATH_TO_WORD2VEC_MODEL)):
        self.word2VecModel = word2VecModel

        self.func_name = func_exec_dic[FUNCTIONS_JSON_PROPERTIES_NAMES.FUNC_NAME]
        self.args_names = func_exec_dic[FUNCTIONS_JSON_PROPERTIES_NAMES.ARGS_NAMES]
        self.func_path = func_exec_dic[FUNCTIONS_JSON_PROPERTIES_NAMES.FILE_PATH]

        self.key_in_func_creation_dict = get_key_in_func_creation_dict(self.func_name, self.func_path)
        self.args_in_creation_dic = func_creation_dic[self.key_in_func_creation_dict][FUNCTIONS_JSON_PROPERTIES_NAMES.ARGS_NAMES]

        self.args_similarity_with_creation_args = self.__get_args_similarity_with_creation_args()
        self.total_args_sim_with_creation_args = self.__get_total_args_sim_with_creation_args()
        self.args_similarity_with_func_name = self.__get_args_similarity_with_func_name()

    def check_word_in_Word2Vec_dict(self, word):
        if not word:
            return False

        return word in self.word2VecModel.wv

    def __get_args_similarity_with_creation_args(self):
        """Определяет схожесть названий аргументов в вызове функции с названиями аргументов в объявлении функции"""
        args_similarity = []

        for argIndex in range(len(self.args_names)):

            if argIndex > len(self.args_in_creation_dic) - 1:
                args_similarity.append(None)
                continue

            exec_arg = self.args_names[argIndex]
            create_arg = self.args_in_creation_dic[argIndex]

            if not exec_arg or (isinstance(exec_arg, str) and (
                    len(exec_arg) <= 3 or len(create_arg) <= 3 or '$' in exec_arg or '$' in create_arg)):
                args_similarity.append(None)
                continue

            if self.check_word_in_Word2Vec_dict(exec_arg) and self.check_word_in_Word2Vec_dict(create_arg):
                args_similarity.append(self.word2VecModel.wv.similarity(exec_arg, create_arg))
            else:
                args_similarity.append(None)

        return args_similarity

    def __get_total_args_sim_with_creation_args(self):
        exec_args_which_exists_in_dic = list(filter(self.check_word_in_Word2Vec_dict, self.args_names))
        creation_args_which_exists_in_dic = list(filter(self.check_word_in_Word2Vec_dict, self.args_in_creation_dic))

        try:
            total_similarity = self.word2VecModel.wv.n_similarity(
                exec_args_which_exists_in_dic,
                creation_args_which_exists_in_dic
            )
        except:
            total_similarity = 0

        return total_similarity

    def __get_args_similarity_with_func_name(self):
        args_sim_with_func_name = []

        if not self.check_word_in_Word2Vec_dict(self.func_name):
            return None

        for arg in self.args_names:
            if not self.check_word_in_Word2Vec_dict(arg):
                args_sim_with_func_name.append(None)
                break
            else:
                args_sim_with_func_name.append(self.word2VecModel.wv.similarity(arg, self.func_name))

        return args_sim_with_func_name
