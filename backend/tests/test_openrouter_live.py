import os
from pathlib import Path

import pytest

from app.openrouter import complete

pytestmark = pytest.mark.openrouter


def _load_key() -> None:
    if os.environ.get("OPENROUTER_API_KEY"):
        return
    roots = [
        Path(__file__).resolve().parents[2],
        Path(__file__).resolve().parents[3],
    ]
    for root in roots:
        path = root / ".env"
        if not path.exists():
            continue
        for line in path.read_text().splitlines():
            if line.startswith("OPENROUTER_API_KEY="):
                os.environ["OPENROUTER_API_KEY"] = line.split("=", 1)[1].strip()
                return


def test_real_two_plus_two():
    _load_key()
    if not os.environ.get("OPENROUTER_API_KEY"):
        pytest.skip("OPENROUTER_API_KEY is not set")
    reply = complete("What is 2+2? Reply with only the digit 4.")
    assert "4" in reply
