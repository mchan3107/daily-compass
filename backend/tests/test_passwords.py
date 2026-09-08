from app.passwords import hash_password, verify_password


def test_hash_is_not_plaintext():
    stored = hash_password("password")
    assert stored != "password"
    assert "password" not in stored


def test_verify_accepts_correct_password():
    stored = hash_password("password")
    assert verify_password("password", stored)


def test_verify_rejects_wrong_password():
    stored = hash_password("password")
    assert not verify_password("wrong", stored)


def test_same_password_gets_different_salts():
    assert hash_password("password") != hash_password("password")
