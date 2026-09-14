"""Run post-migration checks against an explicitly isolated local MySQL database."""

import os

from sqlalchemy import create_engine, select, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.user import User
from app.repositories import user_repository as user_repo
from app.routers.auth import login
from app.schemas.user import LoginRequest


ENV_NAME = "KOTCHOMNOL_MIGRATION_TEST_DATABASE_URL"
ALLOWED_HOSTS = {"127.0.0.1", "localhost", "::1"}
DATABASE_PREFIX = "kotchomnol_migration_test_"
TEST_TELEGRAM_IDS = (700000000000000001, 700000000000000002)


def require_isolated_database():
    raw_url = os.environ.get(ENV_NAME)
    if not raw_url:
        raise RuntimeError(f"{ENV_NAME} is required")

    url = make_url(raw_url)
    if url.host not in ALLOWED_HOSTS:
        raise RuntimeError("Migration check refuses non-loopback database hosts")
    if not (url.database or "").startswith(DATABASE_PREFIX):
        raise RuntimeError("Migration check refuses non-test database names")
    return url


def expect_integrity_error(action, db) -> None:
    try:
        action()
    except IntegrityError:
        db.rollback()
        return
    raise AssertionError("Expected a unique constraint violation")


def main() -> None:
    url = require_isolated_database()
    engine = create_engine(url, pool_pre_ping=True)
    Session = sessionmaker(bind=engine)

    with engine.connect() as connection:
        selected_database, selected_port = connection.execute(
            text("SELECT DATABASE(), @@port")
        ).one()
        if selected_database != url.database or selected_port != 3307:
            raise RuntimeError("Connected database does not match the isolated target")

    with Session() as db:
        db.query(User).filter(User.telegram_id.in_(TEST_TELEGRAM_IDS)).delete(
            synchronize_session=False
        )
        db.commit()

        existing = user_repo.find_user_by_email(db, "existing@example.com")
        assert existing is not None
        assert existing.phone_number == "+85510000001"
        login_response = login(
            LoginRequest(
                email="existing@example.com",
                password="MigrationTestPassword123!",
            ),
            db,
        )
        assert login_response["data"]["user"].user_id == existing.user_id
        assert login_response["data"]["token"]

        sale = db.scalar(select(Sale).where(Sale.user_id == existing.user_id))
        assert sale is not None
        item = db.scalar(select(SaleItem).where(SaleItem.sale_id == sale.sale_id))
        assert item is not None

        first = user_repo.create_user_telegram(
            db, TEST_TELEGRAM_IDS[0], "migration_first", "Migration", "First"
        )
        second = user_repo.create_user_telegram(
            db, TEST_TELEGRAM_IDS[1], "migration_second", "Migration", "Second"
        )
        assert first.phone_number is None and first.password_hash is None
        assert second.phone_number is None and second.password_hash is None

        expect_integrity_error(
            lambda: user_repo.create_user(
                db,
                "Duplicate",
                "Phone",
                existing.phone_number,
                "duplicate-phone@example.invalid",
                "test-hash",
            ),
            db,
        )
        expect_integrity_error(
            lambda: user_repo.create_user_telegram(
                db,
                first.telegram_id,
                "duplicate_identity",
                "Duplicate",
                "Telegram",
            ),
            db,
        )

        assert user_repo.find_user_by_email(db, existing.email).user_id == existing.user_id
        assert user_repo.find_user_by_telegram_id(db, first.telegram_id).user_id == first.user_id
        assert user_repo.find_user_by_telegram_id(db, second.telegram_id).user_id == second.user_id
        assert db.query(User).filter(User.phone_number.is_(None)).count() == 2

    print("PASS: isolated MySQL migration and authentication checks")


if __name__ == "__main__":
    main()
