from os import walk
from shared.consts import FOLDER_WITH_JSONS, TOKENIZED_JSON_NAME_PREFIX


def get_tokenized_scripts_json_paths():
    """Получаем список путей к json файлам с токенами (от корня репозитория)"""
    # filenames - Список всех файлов в интересуемой нами директории
    fdirpath, dirnames, filenames = list(walk(FOLDER_WITH_JSONS))[0]
    tokenJsonsNames = list(filter(lambda script_name: script_name.startswith(TOKENIZED_JSON_NAME_PREFIX), filenames))

    return list(map(lambda jsonName: FOLDER_WITH_JSONS + '/' + jsonName, tokenJsonsNames))
