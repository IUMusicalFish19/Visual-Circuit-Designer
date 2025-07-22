from sqlalchemy import String, Integer, text, Boolean, JSON
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, declarative_base
from sqlalchemy.sql.schema import Column, ForeignKey


Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'), nullable=False)
    password_hash: Mapped[str] = mapped_column("password_hash", String(length=1024),
                                                 nullable=False)
    salt: Mapped[str] = mapped_column(String(64), nullable=False)

    # @property
    # def is_active(self) -> bool:
    #     return True
    #
    # @property
    # def is_superuser(self) -> bool:
    #     return False
    #
    # @property
    # def is_verified(self) -> bool:
    #     return True


class ProjectModel(Base):
    __tablename__ = "projects"

    pid: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    name: Mapped[str] = mapped_column(String(100))
    circuit: Mapped[dict] = mapped_column(JSON, nullable=True)
    custom_nodes: Mapped[dict] = mapped_column(JSON, nullable=True)
    verilog: Mapped[dict] = mapped_column(String(10000), nullable=True)
    created_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))
