from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# Auth / Users
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Violations
class ViolationOut(BaseModel):
    id: int
    rule_id: str
    field: Optional[str] = None
    status: str
    severity: str
    message: str
    confidence: Optional[float] = None

    class Config:
        from_attributes = True

# Products
class ProductBase(BaseModel):
    name: str
    manufacturer: Optional[str] = None
    category: Optional[str] = None
    barcode: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Inspection Images
class InspectionImageBase(BaseModel):
    image_url: str
    view_type: Optional[str] = None

class InspectionImage(InspectionImageBase):
    id: int
    inspection_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Inspections
class InspectionBase(BaseModel):
    inspector_name: Optional[str] = None

class InspectionCreate(InspectionBase):
    product_id: Optional[int] = None
    # Can also provide new product details to create on the fly
    new_product: Optional[ProductCreate] = None

class Inspection(InspectionBase):
    id: int
    inspection_id: str
    product_id: Optional[int]
    status: str
    compliance_score: Optional[float]
    created_at: datetime
    product: Optional[Product] = None
    images: List[InspectionImage] = []
    violations: List[ViolationOut] = []

    class Config:
        from_attributes = True
