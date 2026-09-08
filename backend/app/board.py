import copy

CATEGORY_IDS = ("health", "relationships", "growth", "hobbies", "career")

DEFAULT_CATEGORIES = (
    ("health", "Physical Health"),
    ("relationships", "Relationships"),
    ("growth", "Mental Wellbeing"),
    ("hobbies", "Hobbies & Fun"),
    ("career", "School & Career"),
)

DUMMY_BOARD = {
    "health": [
        {
            "id": "health-1",
            "categoryId": "health",
            "title": "Morning stretch",
            "details": "Ten minutes of easy mobility before coffee.",
            "completed": False,
        },
        {
            "id": "health-2",
            "categoryId": "health",
            "title": "Walk after lunch",
            "details": "Loop the neighborhood, no headphones.",
            "completed": False,
        },
    ],
    "relationships": [
        {
            "id": "rel-1",
            "categoryId": "relationships",
            "title": "Call Mom",
            "details": "Catch up about the weekend.",
            "completed": False,
        },
        {
            "id": "rel-2",
            "categoryId": "relationships",
            "title": "Write a thank-you note",
            "details": "For last week's dinner with Sam.",
            "completed": False,
        },
    ],
    "growth": [
        {
            "id": "growth-1",
            "categoryId": "growth",
            "title": "Read twenty pages",
            "details": "Continue the essay collection on the nightstand.",
            "completed": False,
        },
        {
            "id": "growth-2",
            "categoryId": "growth",
            "title": "Journal tonight",
            "details": "Three lines about what felt steady today.",
            "completed": False,
        },
    ],
    "hobbies": [
        {
            "id": "hobbies-1",
            "categoryId": "hobbies",
            "title": "Sketch in the garden",
            "details": "Loose ink study of the olive tree.",
            "completed": False,
        },
        {
            "id": "hobbies-2",
            "categoryId": "hobbies",
            "title": "Practice guitar",
            "details": "The slow piece in G, twice through.",
            "completed": False,
        },
    ],
    "career": [
        {
            "id": "career-1",
            "categoryId": "career",
            "title": "Outline the project brief",
            "details": "Keep it to one page, no extras.",
            "completed": False,
        },
        {
            "id": "career-2",
            "categoryId": "career",
            "title": "Review notes from class",
            "details": "Highlight anything still unclear.",
            "completed": False,
        },
        {
            "id": "career-3",
            "categoryId": "career",
            "title": "Send the weekly update",
            "details": "Three bullets, calm and clear.",
            "completed": False,
        },
    ],
}


class BadInput(Exception):
    pass


class NotFound(Exception):
    pass


def empty_board() -> dict:
    return {category_id: [] for category_id in CATEGORY_IDS}


def dummy_board() -> dict:
    return copy.deepcopy(DUMMY_BOARD)


def validate_board(board: object) -> dict:
    if not isinstance(board, dict) or set(board) != set(CATEGORY_IDS):
        raise BadInput("Board must have the five category lists")

    result = empty_board()
    for category_id in CATEGORY_IDS:
        tasks = board[category_id]
        if not isinstance(tasks, list):
            raise BadInput("Each category must be a list")
        cleaned = []
        for task in tasks:
            if not isinstance(task, dict):
                raise BadInput("Each task must be an object")
            task_id = task.get("id")
            title = task.get("title")
            details = task.get("details")
            completed = task.get("completed")
            if not isinstance(task_id, str) or not task_id:
                raise BadInput("Task id is required")
            if not isinstance(title, str) or not title.strip():
                raise BadInput("Task title is required")
            if not isinstance(details, str):
                raise BadInput("Task details must be a string")
            if not isinstance(completed, bool):
                raise BadInput("Task completed must be a boolean")
            if task.get("categoryId") != category_id:
                raise BadInput("Task categoryId must match its list")
            cleaned.append(
                {
                    "id": task_id,
                    "categoryId": category_id,
                    "title": title.strip(),
                    "details": details,
                    "completed": completed,
                }
            )
        result[category_id] = cleaned
    return result


def validate_categories(items: object) -> list[tuple[str, str, int]]:
    if not isinstance(items, list) or len(items) != 5:
        raise BadInput("Must send exactly five categories")

    ids = []
    result = []
    for order, item in enumerate(items):
        if not isinstance(item, dict):
            raise BadInput("Each category must be an object")
        category_id = item.get("id")
        label = item.get("label")
        if category_id not in CATEGORY_IDS:
            raise BadInput("Unknown category id")
        if not isinstance(label, str) or not label.strip():
            raise BadInput("Category label is required")
        ids.append(category_id)
        result.append((category_id, label.strip(), order))

    if set(ids) != set(CATEGORY_IDS) or len(ids) != 5:
        raise BadInput("Must send each of the five category ids once")
    return result
