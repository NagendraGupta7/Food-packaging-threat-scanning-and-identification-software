from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.domain import Product, User
from app.schemas.domain import Product as ProductSchema

router = APIRouter()

@router.get("/barcode/{barcode}", response_model=ProductSchema)
def get_product_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.barcode == barcode).first()
    
    if not product:
        # MOCK EXTERNAL DATABASE (AI Agent simulation)
        # If the barcode is not in our local SQLite, we simulate querying 
        # a global database like GS1 or OpenFoodFacts.
        
        # Generate some realistic mock data based on the barcode string
        manufacturers = ["Nestle", "Unilever", "PepsiCo", "ITC Limited", "Parle Products", "Britannia"]
        categories = ["Beverages", "Snacks", "Dairy", "Confectionery", "Groceries"]
        
        random.seed(barcode) # deterministic mock data based on barcode
        mock_name = f"Premium {random.choice(categories)} Pack"
        mock_manufacturer = random.choice(manufacturers)
        
        mock_details = f"Weight: 500g\nShelf Life: 12 Months\nIngredients: Sugar, Wheat, Milk Solids\nAllergens: Contains Dairy\nStorage: Cool, dry place\nNutritional Value (per 100g): Energy 450kcal, Protein 8g, Fat 20g"
        
        product = Product(
            name=mock_name,
            manufacturer=mock_manufacturer,
            category=random.choice(categories),
            barcode=barcode,
            details=mock_details
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        
    return product
