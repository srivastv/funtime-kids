"""Tests for the content validator.

Run with:  python -m pytest scripts/ -q
"""
import json
from pathlib import Path

from validate_content import validate, DEFAULT_DATA_DIR


def _write(dir_: Path, rel: str, obj) -> None:
    path = dir_ / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj), encoding="utf-8")


def _good_question(qid="q1", answer_index=1):
    return {
        "id": qid,
        "category": "animals",
        "prompt": "Which animal says moo?",
        "choices": ["Dog", "Cow", "Cat", "Duck"],
        "answerIndex": answer_index,
        "difficulty": 1,
    }


def _valid_tree(root: Path) -> None:
    _write(root, "quiz/animals.json", [_good_question()])
    _write(root, "typing/lessons.json", [{"id": "t1", "title": "A", "text": "cat", "difficulty": 1}])
    _write(root, "falling/words.json", [{"word": "cat", "difficulty": 1}])


def test_valid_content_passes(tmp_path):
    _valid_tree(tmp_path)
    assert validate(tmp_path) == []


def test_answer_index_out_of_range(tmp_path):
    _valid_tree(tmp_path)
    _write(tmp_path, "quiz/animals.json", [_good_question(answer_index=9)])
    errors = validate(tmp_path)
    assert any("answerIndex" in e for e in errors)


def test_duplicate_ids(tmp_path):
    _valid_tree(tmp_path)
    _write(tmp_path, "quiz/animals.json", [_good_question("dup"), _good_question("dup")])
    errors = validate(tmp_path)
    assert any("duplicate id" in e for e in errors)


def test_bad_difficulty(tmp_path):
    _valid_tree(tmp_path)
    _write(tmp_path, "falling/words.json", [{"word": "cat", "difficulty": 5}])
    errors = validate(tmp_path)
    assert any("difficulty" in e for e in errors)


def test_uppercase_falling_word_rejected(tmp_path):
    _valid_tree(tmp_path)
    _write(tmp_path, "falling/words.json", [{"word": "Cat", "difficulty": 1}])
    errors = validate(tmp_path)
    assert any("lowercase" in e for e in errors)


def test_bundled_content_is_valid():
    # The real content that ships with the app must always validate.
    assert validate(DEFAULT_DATA_DIR) == []
