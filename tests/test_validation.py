from src.ingestion.validation import validate_schema, validate_data


def test_valid_schema():
    record = {
        "category": "burglary",
        "location_type": "Force",
        "location": {},
        "context": "",
        "outcome_status": None,
        "persistent_id": "",
        "id": 12345,
        "month": "2026-07",
    }

    assert validate_schema(record) is True


def test_invalid_schema_missing_field():
    record = {
        "category": "burglary",
        "location_type": "Force",
        "location": {},
        "context": "",
        "outcome_status": None,
        "persistent_id": "",
        "id": 12345,
        # month missing
    }

    assert validate_schema(record) is False


def test_valid_data():
    record = {
        "category": "burglary",
        "location_type": "Force",
        "id": 12345,
        "month": "2026-07",
    }

    assert validate_data(record) is True


def test_invalid_data_empty_value():
    record = {
        "category": "",
        "location_type": "Force",
        "id": 12345,
        "month": "2026-07",
    }

    assert validate_data(record) is False