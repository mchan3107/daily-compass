from app.openrouter import MODEL, OpenRouterError, complete


def test_complete_sends_model_and_prompt(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")
    captured = {}

    def fake_post(url: str, body: dict):
        captured["url"] = url
        captured["body"] = body
        return 200, {"choices": [{"message": {"content": "4"}}]}

    assert complete("2+2", http_post=fake_post) == "4"
    assert captured["url"] == "https://openrouter.ai/api/v1/chat/completions"
    assert captured["body"]["model"] == MODEL
    assert captured["body"]["model"] == "nvidia/nemotron-3-ultra-550b-a55b:free"
    assert captured["body"]["messages"] == [{"role": "user", "content": "2+2"}]


def test_complete_requires_api_key(monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    try:
        complete("2+2", http_post=lambda *_args: (200, {}))
    except OpenRouterError as exc:
        assert "OPENROUTER_API_KEY" in str(exc)
    else:
        raise AssertionError("expected OpenRouterError")


def test_complete_raises_on_http_error(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")

    def fake_post(_url: str, _body: dict):
        return 401, {}

    try:
        complete("2+2", http_post=fake_post)
    except OpenRouterError as exc:
        assert "401" in str(exc)
    else:
        raise AssertionError("expected OpenRouterError")


def test_complete_raises_on_malformed_response(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")

    def fake_post(_url: str, _body: dict):
        return 200, {"choices": []}

    try:
        complete("2+2", http_post=fake_post)
    except OpenRouterError:
        return
    raise AssertionError("expected OpenRouterError")
