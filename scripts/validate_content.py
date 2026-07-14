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
DEFAULT_DATA_DIR = (
    Path(__file__).resolve().parent.parent / "web" / "src" / "content" / "data"
)

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
        for field in (
            "id",
            "category",
            "prompt",
            "choices",
            "answerIndex",
            "difficulty",
        ):
            if field not in q:
                errors.append(f"{where}: missing field '{field}'")
        if "id" in q:
            if q["id"] in seen_ids:
                errors.append(f"{where}: duplicate id '{q['id']}'")
            seen_ids.add(q["id"])
        choices = q.get("choices")
        if not isinstance(choices, list) or len(choices) != 4:
            errors.append(f"{where}: 'choices' must have exactly 4 options")
        elif not isinstance(q.get("answerIndex"), int) or not (
            0 <= q["answerIndex"] < len(choices)
        ):
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


VALID_CONTINENTS = {
    "Europe",
    "Asia",
    "Africa",
    "North America",
    "South America",
    "Oceania",
    "Antarctica",
}


def validate_geography(path: Path, errors: list[str]) -> None:
    if not path.exists():
        errors.append(f"{path}: missing")
        return
    data = _load_json(path)
    if not isinstance(data, list) or not data:
        errors.append(f"{path}: expected a non-empty list of geography items")
        return
    seen_ids: set[str] = set()
    seen_names: set[str] = set()
    difficulty_counts = {1: 0, 2: 0, 3: 0}
    for i, item in enumerate(data):
        where = f"{path}[{i}]"
        for field in (
            "id",
            "name",
            "capital",
            "continent",
            "latitude",
            "longitude",
            "landmarkClues",
            "funFact",
            "difficulty",
        ):
            if field not in item:
                errors.append(f"{where}: missing field '{field}'")
        item_id = item.get("id")
        if item_id:
            if item_id in seen_ids:
                errors.append(f"{where}: duplicate id '{item_id}'")
            seen_ids.add(item_id)
        name = item.get("name")
        if name:
            if name in seen_names:
                errors.append(f"{where}: duplicate name '{name}'")
            seen_names.add(name)
        continent = item.get("continent")
        if continent not in VALID_CONTINENTS:
            errors.append(
                f"{where}: 'continent' must be one of {sorted(VALID_CONTINENTS)}"
            )
        lat = item.get("latitude")
        try:
            lat_f = float(lat)
            if not -90 <= lat_f <= 90:
                errors.append(f"{where}: latitude must be -90 to 90")
        except Exception:
            errors.append(f"{where}: latitude must be number")
        lon = item.get("longitude")
        try:
            lon_f = float(lon)
            if not -180 <= lon_f <= 180:
                errors.append(f"{where}: longitude must be -180 to 180")
        except Exception:
            errors.append(f"{where}: longitude must be number")
        clues = item.get("landmarkClues")
        if (
            not isinstance(clues, list)
            or not clues
            or not all(isinstance(c, str) and c.strip() for c in clues)
        ):
            errors.append(f"{where}: 'landmarkClues' must be non-empty list of strings")
        fun = item.get("funFact")
        if not isinstance(fun, str) or not fun.strip():
            errors.append(f"{where}: 'funFact' must be non-empty string")
        elif len(fun) > 200:
            errors.append(f"{where}: 'funFact' too long (>200 chars)")
        diff = item.get("difficulty")
        if diff not in VALID_DIFFICULTIES:
            errors.append(f"{where}: 'difficulty' must be 1, 2, or 3")
        else:
            difficulty_counts[diff] += 1
        if not item.get("flagEmoji") and not item.get("flagSvg"):
            errors.append(f"{where}: must have flagEmoji or flagSvg")
    for d, cnt in difficulty_counts.items():
        if cnt < 4:
            errors.append(
                f"{path}: need at least 4 items with difficulty {d} for playable rounds, found {cnt}"
            )


VALID_ODD_TOPICS = {"plants", "rocks", "light-sound"}
VALID_ODD_TYPES = {
    "predict-choice",
    "drag-sort",
    "slider-predict",
}


def validate_odd(path: Path, errors: list[str], seen_ids: set[str]) -> None:
    data = _load_json(path)
    if not isinstance(data, list) or not data:
        errors.append(f"{path}: expected non-empty list of experiments")
        return
    for i, ex in enumerate(data):
        where = f"{path}[{i}]"
        for field in (
            "id",
            "topic",
            "title",
            "prompt",
            "type",
            "difficulty",
            "config",
            "explanation",
            "funFact",
        ):
            if field not in ex:
                errors.append(f"{where}: missing field '{field}'")
        ex_id = ex.get("id")
        if ex_id:
            if ex_id in seen_ids:
                errors.append(f"{where}: duplicate id '{ex_id}'")
            seen_ids.add(ex_id)
        if ex.get("topic") not in VALID_ODD_TOPICS:
            errors.append(f"{where}: topic must be one of {sorted(VALID_ODD_TOPICS)}")
        if ex.get("type") not in VALID_ODD_TYPES:
            errors.append(f"{where}: type must be one of {sorted(VALID_ODD_TYPES)}")
        if ex.get("difficulty") not in VALID_DIFFICULTIES:
            errors.append(f"{where}: difficulty must be 1,2,or3")
        fun = ex.get("funFact")
        if not isinstance(fun, str) or not fun.strip() or len(fun) > 200:
            errors.append(f"{where}: funFact must be non-empty string <=200 chars")
        exp = ex.get("explanation")
        if not isinstance(exp, str) or not exp.strip() or len(exp) > 200:
            errors.append(f"{where}: explanation must be non-empty string <=200 chars")
        cfg = ex.get("config")
        if not isinstance(cfg, dict):
            errors.append(f"{where}: config must be object")
            continue
        t = ex.get("type")
        if t == "predict-choice":
            opts = cfg.get("options")
            ci = cfg.get("correctIndex")
            if not isinstance(opts, list) or len(opts) < 2:
                errors.append(f"{where}: config.options must list >=2")
            if not isinstance(ci, int) or not (0 <= ci < len(opts or [])):
                errors.append(f"{where}: config.correctIndex out of range")
        elif t == "drag-sort":
            cats = cfg.get("categories")
            items = cfg.get("items")
            if not isinstance(cats, list) or not cats:
                errors.append(f"{where}: config.categories must non-empty list")
            if not isinstance(items, list) or not items:
                errors.append(f"{where}: config.items must non-empty list")
            else:
                for j, it in enumerate(items):
                    if (
                        not isinstance(it, dict)
                        or "label" not in it
                        or "category" not in it
                    ):
                        errors.append(f"{where} items[{j}]: need label and category")
                    elif cats and it.get("category") not in cats:
                        errors.append(
                            f"{where} items[{j}]: category not in categories list"
                        )
        elif t == "slider-predict":
            for f in ("min", "max", "correctValue"):
                if f not in cfg or not isinstance(cfg[f], (int, float)):
                    errors.append(f"{where}: config.{f} must be number")
            if "tolerance" in cfg and not isinstance(cfg["tolerance"], (int, float)):
                errors.append(f"{where}: config.tolerance must be number")


VALID_NR_OPS = {"+", "-", "×", "÷", "missing"}


def validate_numberriver(path: Path, errors: list[str]) -> None:
    if not path.exists():
        errors.append(f"{path}: missing")
        return
    data = _load_json(path)
    if not isinstance(data, list) or not data:
        errors.append(f"{path}: expected non-empty list of levels")
        return
    seen = set()
    for i, lvl in enumerate(data):
        where = f"{path}[{i}]"
        for f in ("id", "target", "slots", "availableOps", "difficulty"):
            if f not in lvl:
                errors.append(f"{where}: missing field '{f}'")
        lid = lvl.get("id")
        if lid:
            if lid in seen:
                errors.append(f"{where}: duplicate id '{lid}'")
            seen.add(lid)
        target = lvl.get("target")
        if not isinstance(target, int) or target < 0:
            errors.append(f"{where}: target must be non-negative int")
        slots = lvl.get("slots")
        if slots not in (3, 4, 5):
            errors.append(f"{where}: slots must be 3,4,or5")
        diff = lvl.get("difficulty")
        if diff not in VALID_DIFFICULTIES:
            errors.append(f"{where}: difficulty must be 1,2,3")
        ops = lvl.get("availableOps")
        if not isinstance(ops, list) or len(ops) < 3:
            errors.append(f"{where}: availableOps must list >=3")
        else:
            for j, op in enumerate(ops):
                ow = f"{where} ops[{j}]"
                if not isinstance(op, dict):
                    errors.append(f"{ow}: must be object")
                    continue
                if op.get("type") not in VALID_NR_OPS:
                    errors.append(f"{ow}: type must be one of {sorted(VALID_NR_OPS)}")
                if "display" not in op or not isinstance(op["display"], str):
                    errors.append(f"{ow}: display must be string")
                if (
                    op.get("type") != "missing"
                    and "value" in op
                    and not isinstance(op["value"], (int, float))
                ):
                    errors.append(f"{ow}: value must be number if present")


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

    geography_file = data_dir / "geography" / "items.json"
    validate_geography(geography_file, errors)

    odd_dir = data_dir / "odd"
    odd_files = sorted(odd_dir.glob("*.json"))
    if not odd_files:
        errors.append(f"{odd_dir}: no odd science files found")
    odd_ids: set[str] = set()
    for path in odd_files:
        validate_odd(path, errors, odd_ids)

    nr_file = data_dir / "numberriver" / "levels.json"
    validate_numberriver(nr_file, errors)

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
