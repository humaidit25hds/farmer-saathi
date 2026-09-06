from sqlalchemy import Column, Integer, String
from app.database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    phone = Column(String, unique=True, index=True, nullable=False)

    village = Column(String, nullable=True)

    password = Column(String, nullable=False)