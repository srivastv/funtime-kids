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


def _good_geo(gid="g1", diff=1):
    return {
        "id": gid,
        "name": f"Country {gid}",
        "capital": f"Capital {gid}",
        "continent": "Europe",
        "flagEmoji": "🇦🇽",
        "landmarkClues": ["clue one"],
        "funFact": "A fun fact.",
        "latitude": 48.8,
        "longitude": 2.3,
        "difficulty": diff,
    }


def _good_odd(oid="o1"):
    return {
        "id": oid,
        "topic": "plants",
        "title": "Test",
        "prompt": "Which?",
        "type": "predict-choice",
        "difficulty": 1,
        "config": {"options": ["A", "B"], "correctIndex": 0},
        "explanation": "Because.",
        "funFact": "Fun.",
    }


def _good_nr(nid="n1"):
    return {
        "id": nid,
        "target": 10,
        "slots": 3,
        "difficulty": 1,
        "availableOps": [
            {"type": "+", "value": 5, "display": "+5"},
            {"type": "+", "value": 5, "display": "+5"},
            {"type": "+", "value": 2, "display": "+2"},
            {"type": "-", "value": 2, "display": "-2"},
        ],
    }


def _valid_tree(root: Path) -> None:
    _write(root, "quiz/animals.json", [_good_question()])
    _write(
        root,
        "typing/lessons.json",
        [{"id": "t1", "title": "A", "text": "cat", "difficulty": 1}],
    )
    _write(root, "falling/words.json", [{"word": "cat", "difficulty": 1}])
    geos = []
    for d in (1, 2, 3):
        for i in range(4):
            geos.append(_good_geo(f"g{d}{i}", d))
    _write(root, "geography/items.json", geos)
    _write(root, "odd/plants.json", [_good_odd("o1")])
    _write(root, "numberriver/levels.json", [_good_nr("n1")])


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
    _write(
        tmp_path, "quiz/animals.json", [_good_question("dup"), _good_question("dup")]
    )
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
