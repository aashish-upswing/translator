import grpc
from concurrent import futures
import os
import json
import ctranslate2
import sentencepiece

import translation_pb2
import translation_pb2_grpc

PACKAGES_DIR = os.path.expanduser(r'~\.local\share\argos-translate\packages')

# Map language codes to human-readable names
LANG_NAMES = {
    'en': 'English', 'ar': 'Arabic', 'fr': 'French', 'es': 'Spanish',
    'de': 'German', 'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian',
    'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean', 'hi': 'Hindi',
    'tr': 'Turkish', 'nl': 'Dutch', 'pl': 'Polish', 'sv': 'Swedish',
    'da': 'Danish', 'fi': 'Finnish', 'el': 'Greek', 'he': 'Hebrew',
    'id': 'Indonesian', 'uk': 'Ukrainian', 'cs': 'Czech', 'hu': 'Hungarian',
    'az': 'Azerbaijani', 'sq': 'Albanian', 'eu': 'Basque', 'bn': 'Bengali',
    'ca': 'Catalan', 'eo': 'Esperanto', 'ga': 'Irish', 'fa': 'Persian',
    'sk': 'Slovak', 'ur': 'Urdu', 'ky': 'Kyrgyz', 'ms': 'Malay',
    'gl': 'Galician',
}


class TranslationModel:
    """Holds a CTranslate2 translator and SentencePiece tokenizer for one language pair."""
    def __init__(self, model_dir, sp_model_path):
        self.translator = ctranslate2.Translator(model_dir, compute_type="auto")
        self.sp = sentencepiece.SentencePieceProcessor(model_file=sp_model_path)

    def translate(self, text):
        tokens = self.sp.encode(text, out_type=str)
        results = self.translator.translate_batch([tokens])
        translated_tokens = results[0].hypotheses[0]
        return self.sp.decode(translated_tokens)


class TranslationEngineService(translation_pb2_grpc.TranslationEngineServicer):
    def __init__(self):
        self.models = {}  # key: "from_to", e.g. "en_ar"
        self.available_langs = set()
        self.load_models()

    def load_models(self):
        print(f"Scanning for Argos models in: {PACKAGES_DIR}")
        if not os.path.exists(PACKAGES_DIR):
            print("No packages directory found. Please download models first.")
            return

        for pkg_name in os.listdir(PACKAGES_DIR):
            pkg_path = os.path.join(PACKAGES_DIR, pkg_name)
            if not os.path.isdir(pkg_path):
                continue
            
            # Each package has a sub-directory like "en_ar"
            for sub in os.listdir(pkg_path):
                sub_path = os.path.join(pkg_path, sub)
                if not os.path.isdir(sub_path):
                    continue
                
                model_dir = os.path.join(sub_path, 'model')
                sp_path = os.path.join(sub_path, 'sentencepiece.model')
                metadata_path = os.path.join(sub_path, 'metadata.json')
                
                if os.path.exists(model_dir) and os.path.exists(sp_path):
                    try:
                        # Read metadata to get language codes
                        if os.path.exists(metadata_path):
                            with open(metadata_path, 'r', encoding='utf-8') as f:
                                meta = json.load(f)
                            from_code = meta.get('from_code', sub.split('_')[0])
                            to_code = meta.get('to_code', sub.split('_')[1] if '_' in sub else 'unknown')
                        else:
                            parts = sub.split('_')
                            from_code, to_code = parts[0], parts[1]

                        key = f"{from_code}_{to_code}"
                        print(f"Loading model: {from_code} -> {to_code} from {sub_path}")
                        self.models[key] = TranslationModel(model_dir, sp_path)
                        self.available_langs.add(from_code)
                        self.available_langs.add(to_code)
                        print(f"  ✓ Loaded {key}")
                    except Exception as e:
                        print(f"  ✗ Error loading {sub_path}: {e}")

        print(f"Total models loaded: {len(self.models)}")
        print(f"Available languages: {self.available_langs}")

    def TranslateText(self, request, context):
        text = request.text
        source_lang = request.source_lang
        target_lang = request.target_lang

        print(f"TranslateRequest: '{text}' from {source_lang} to {target_lang}")

        key = f"{source_lang}_{target_lang}"
        model = self.models.get(key)

        if not model:
            return translation_pb2.TranslateReply(
                translated_text="",
                success=False,
                error_message=f"No model installed for {source_lang} -> {target_lang}. Install the corresponding .argosmodel."
            )

        try:
            translated = model.translate(text)
            return translation_pb2.TranslateReply(
                translated_text=translated,
                success=True,
                error_message=""
            )
        except Exception as e:
            print(f"Translation error: {e}")
            return translation_pb2.TranslateReply(
                translated_text="",
                success=False,
                error_message=str(e)
            )

    def GetSupportedLanguages(self, request, context):
        languages = []
        for code in sorted(self.available_langs):
            name = LANG_NAMES.get(code, code)
            languages.append(translation_pb2.Language(code=code, name=name))
        return translation_pb2.GetLanguagesReply(languages=languages)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    translation_pb2_grpc.add_TranslationEngineServicer_to_server(
        TranslationEngineService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("gRPC CTranslate2 Translation Server started on port 50051")
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        server.stop(0)


if __name__ == '__main__':
    serve()
