import os
from collections.abc import Callable

import httpx

MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free"
URL = "https://openrouter.ai/api/v1/chat/completions"

HttpPost = Callable[[str, dict], tuple[int, object]]


class OpenRouterError(Exception):
    pass


def complete(prompt: str, http_post: HttpPost | None = None) -> str:
    return chat([{"role": "user", "content": prompt}], http_post=http_post)


def chat(
    messages: list[dict], http_post: HttpPost | None = None
) -> str:
    if not os.environ.get("OPENROUTER_API_KEY", "").strip():
        raise OpenRouterError("OPENROUTER_API_KEY is missing")
    body = {"model": MODEL, "messages": messages}
    poster = http_post or _post
    status, data = poster(URL, body)
    if status >= 400:
        raise OpenRouterError(f"OpenRouter returned {status}")
    try:
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise OpenRouterError("Unexpected OpenRouter response") from exc
    if not isinstance(content, str):
        raise OpenRouterError("Unexpected OpenRouter response")
    return content


def _post(url: str, body: dict) -> tuple[int, object]:
    try:
        response = httpx.post(
            url,
            json=body,
            headers={
                "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
                "Content-Type": "application/json",
            },
            timeout=60,
        )
    except httpx.RequestError as exc:
        raise OpenRouterError("OpenRouter request failed") from exc
    try:
        data = response.json()
    except ValueError:
        data = {}
    return response.status_code, data
