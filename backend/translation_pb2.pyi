from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class TranslateRequest(_message.Message):
    __slots__ = ("text", "source_lang", "target_lang")
    TEXT_FIELD_NUMBER: _ClassVar[int]
    SOURCE_LANG_FIELD_NUMBER: _ClassVar[int]
    TARGET_LANG_FIELD_NUMBER: _ClassVar[int]
    text: str
    source_lang: str
    target_lang: str
    def __init__(self, text: _Optional[str] = ..., source_lang: _Optional[str] = ..., target_lang: _Optional[str] = ...) -> None: ...

class TranslateReply(_message.Message):
    __slots__ = ("translated_text", "success", "error_message")
    TRANSLATED_TEXT_FIELD_NUMBER: _ClassVar[int]
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    ERROR_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    translated_text: str
    success: bool
    error_message: str
    def __init__(self, translated_text: _Optional[str] = ..., success: bool = ..., error_message: _Optional[str] = ...) -> None: ...

class GetLanguagesRequest(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

class GetLanguagesReply(_message.Message):
    __slots__ = ("languages",)
    LANGUAGES_FIELD_NUMBER: _ClassVar[int]
    languages: _containers.RepeatedCompositeFieldContainer[Language]
    def __init__(self, languages: _Optional[_Iterable[_Union[Language, _Mapping]]] = ...) -> None: ...

class Language(_message.Message):
    __slots__ = ("code", "name")
    CODE_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    code: str
    name: str
    def __init__(self, code: _Optional[str] = ..., name: _Optional[str] = ...) -> None: ...
