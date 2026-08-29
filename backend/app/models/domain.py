from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="INSPECTOR")  # INSPECTOR, ADMIN
    created_at = Column(DateTime, default=datetime.utcnow)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    manufacturer = Column(String, index=True, nullable=True)
    category = Column(String, index=True, nullable=True)
    barcode = Column(String, index=True, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inspections = relationship("Inspection", back_populates="product")


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(String, unique=True, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"))
    inspector_name = Column(String, nullable=True)
    status = Column(String, default="PENDING") # PENDING, REVIEW, COMPLIANT, NON-COMPLIANT
    compliance_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="inspections")
    images = relationship("InspectionImage", back_populates="inspection")
    violations = relationship("Violation", back_populates="inspection")


class InspectionImage(Base):
    __tablename__ = "inspection_images"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"))
    image_url = Column(String, nullable=False)
    view_type = Column(String) # front, back, side, etc.
    created_at = Column(DateTime, default=datetime.utcnow)

    inspection = relationship("Inspection", back_populates="images")


class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"))
    rule_id = Column(String, nullable=False)
    field = Column(String, nullable=True)
    status = Column(String, nullable=False)      # FAIL, WARNING
    severity = Column(String, nullable=False)     # HIGH, MEDIUM, LOW
    message = Column(String, nullable=False)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inspection = relationship("Inspection", back_populates="violations")
