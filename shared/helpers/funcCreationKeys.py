SEPARATOR_REPO_FUNC_NAME = '___'


def get_key_in_func_creation_dict(func_name, file_path):
    """получаем ключ из словаря/json c объявлениями функциями"""
    paths_segments = file_path.split('/')

    if len(paths_segments) > 2:
        return paths_segments[1] + SEPARATOR_REPO_FUNC_NAME + func_name
    else:
        return func_name


def get_func_name_from_key(key_in_func_creation_dict):
    """из ключа от словаря/json c объявлениями функциями извлекаем имя функции"""
    return key_in_func_creation_dict.split(SEPARATOR_REPO_FUNC_NAME)[-1]