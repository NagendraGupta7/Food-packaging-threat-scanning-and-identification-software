from typing import Dict, Any, List

class ComplianceRuleEngine:
    def __init__(self):
        # Legal Metrology (Packaged Commodities) Mandatory Rules
        self.rules = [
            {"id": "PC-001", "field": "manufacturer", "severity": "HIGH", "name": "Manufacturer / Packer Details"},
            {"id": "PC-002", "field": "net_quantity", "severity": "HIGH", "name": "Net Quantity"},
            {"id": "PC-003", "field": "mrp", "severity": "HIGH", "name": "Maximum Retail Price (MRP)"},
            {"id": "PC-004", "field": "packing_date", "severity": "HIGH", "name": "Month & Year of Mfg / Packing"},
            {"id": "PC-005", "field": "consumer_care", "severity": "MEDIUM", "name": "Consumer Care Details"},
            {"id": "PC-006", "field": "country_of_origin", "severity": "MEDIUM", "name": "Country of Origin"},
        ]

    def evaluate(self, extracted_data: Dict[str, Any], readability_score: int) -> Dict[str, Any]:
        violations = []
        passed = 0
        
        for rule in self.rules:
            field_value = extracted_data.get(rule["field"])
            
            if not field_value:
                violations.append({
                    "rule_id": rule["id"],
                    "field": rule["field"],
                    "status": "FAIL",
                    "severity": rule["severity"],
                    "message": f"Required declaration '{rule['name']}' could not be detected.",
                    "confidence": 0.95
                })
            else:
                passed += 1

        if readability_score < 75:
             violations.append({
                    "rule_id": "PC-007",
                    "field": "readability",
                    "status": "WARNING",
                    "severity": "MEDIUM",
                    "message": f"Overall text readability is low ({readability_score}/100).",
                    "confidence": 0.80
             })
             
        total_rules = len(self.rules)
        score = int((passed / total_rules) * 100)
        
        # Deduct for readability
        if readability_score < 75:
            score -= 10
            
        final_status = "COMPLIANT"
        if any(v["severity"] == "HIGH" for v in violations):
            final_status = "NON-COMPLIANT"
        elif len(violations) > 0:
            final_status = "NEEDS_REVIEW"

        return {
            "score": max(0, score),
            "status": final_status,
            "violations": violations
        }

rule_engine = ComplianceRuleEngine()
