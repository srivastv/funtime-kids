#!/usr/bin/env python3
"""Validate Funtime's static JSON content.

Checks the quiz, typing, and falling-word data files that ship with the app so
bad content can't slip in. Drawing lessons are authored in TypeScript and are
out of scope here.

Usage:
    python scripts/validate_content.py            # validate the bundled content
    python scripts/validate_content.py <data_dir> # validate a custom directory

Exits 0 when everything is valid, 1 otherwise.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# Repo layout: <root>/scripts/validate_content.py and <root>/web/src/content/data
DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent / "web" / "src" / "content" / "data"

VALID_DIFFICULTIES = {1, 2, 3}


class ValidationError(Exception):
    pass


def _load_json(path: Path):
    try:
        with path.open(encoding="utf-8") as fh:
            return json.load(fh)
    except json.JSONDecodeError as exc:  # pragma: no cover - message formatting
        raise ValidationError(f"{path}: invalid JSON ({exc})")


def validate_questions(path: Path, errors: list[str], seen_ids: set[str]) -> None:
    data = _load_json(path)
    if not isinstance(data, list) or not data:
        errors.append(f"{path}: expected a non-empty list of questions")
        return
    for i, q in enumerate(data):
        where = f"{path}[{i}]"
        for field in ("id", "category", "prompt", "choices", "answerIndex", "difficulty"):
            if field not in q:
                errors.append(f"{where}: missing field '{field}'")
        if "id" in q:
            if q["id"] in seen_ids:
                errors.append(f"{where}: duplicate id '{q['id']}'")
            seen_ids.add(q["id"])
        choices = q.get("choices")
        if not isinstance(choices, list) or len(choices) != 4:
            errors.append(f"{where}: 'choices' must have exactly 4 options")
        elif not isinstance(q.get("answerIndex"), int) or not (0 <= q["answerIndex"] < len(choices)):
            errors.append(f"{where}: 'answerIndex' out of range")
        if q.get("difficulty") not in VALID_DIFFICULTIES:
            errors.append(f"{where}: 'difficulty' must be 1, 2, or 3")


def validate_typing(path: Path, errors: list[str], seen_ids: set[str]) -> None:
    data = _load_json(path)
    if not isinstance(data, list) or not data:
        errors.append(f"{path}: expected a non-empty list of lessons")
        return
    for i, lesson in enumerate(data):
        where = f"{path}[{i}]"
        for field in ("id", "title", "text", "difficulty"):
            if field not in lesson:
                errors.append(f"{where}: missing field '{field}'")
        if lesson.get("id") in seen_ids:
            errors.append(f"{where}: duplicate id '{lesson.get('id')}'")
        seen_ids.add(lesson.get("id"))
        if not lesson.get("text"):
            errors.append(f"{where}: 'text' must not be empty")
        if lesson.get("difficulty") not in VALID_DIFFICULTIES:
            errors.append(f"{where}: 'difficulty' must be 1, 2, or 3")


def validate_falling(path: Path, errors: list[str]) -> None:
    data = _load_json(path)
    if not isinstance(data, list) or not data:
        errors.append(f"{path}: expected a non-empty list of words")
        return
    for i, entry in enumerate(data):
        where = f"{path}[{i}]"
        word = entry.get("word")
        if not isinstance(word, str) or not word.strip():
            errors.append(f"{where}: 'word' must be a non-empty string")
        elif word != word.lower():
            errors.append(f"{where}: 'word' must be lowercase for matching")
        if entry.get("difficulty") not in VALID_DIFFICULTIES:
            errors.append(f"{where}: 'difficulty' must be 1, 2, or 3")


def validate(data_dir: Path) -> list[str]:
    errors: list[str] = []

    quiz_dir = data_dir / "quiz"
    quiz_files = sorted(quiz_dir.glob("*.json"))
    if not quiz_files:
        errors.append(f"{quiz_dir}: no quiz files found")
    quiz_ids: set[str] = set()
    for path in quiz_files:
        validate_questions(path, errors, quiz_ids)

    typing_file = data_dir / "typing" / "lessons.json"
    if typing_file.exists():
        validate_typing(typing_file, errors, set())
    else:
        errors.append(f"{typing_file}: missing")

    falling_file = data_dir / "falling" / "words.json"
    if falling_file.exists():
        validate_falling(falling_file, errors)
    else:
        errors.append(f"{falling_file}: missing")

    return errors


def main(argv: list[str]) -> int:
    data_dir = Path(argv[1]) if len(argv) > 1 else DEFAULT_DATA_DIR
    if not data_dir.exists():
        print(f"error: data directory not found: {data_dir}", file=sys.stderr)
        return 1
    errors = validate(data_dir)
    if errors:
        print(f"❌ {len(errors)} content problem(s) found:")
        for e in errors:
            print(f"  - {e}")
        return 1
    print("✅ All content is valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
