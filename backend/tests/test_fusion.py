import pytest
from app.detection.threat_fusion import ThreatFusionService
from app.schemas.indicator import ThreatIndicator

def test_fusion_empty():
    assert ThreatFusionService.fuse([])["severity"] == "safe"

def test_fusion_high_severity():
    i1 = ThreatIndicator(id="1", indicator="a.com", indicator_type="domain", severity="high", confidence=80, source="T", status="active")
    i2 = ThreatIndicator(id="2", indicator="b.com", indicator_type="domain", severity="low", confidence=50, source="U", status="active")
    result = ThreatFusionService.fuse([i1, i2])
    assert result["severity"] == "high"
