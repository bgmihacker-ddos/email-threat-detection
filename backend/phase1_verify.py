import asyncio
from unittest.mock import MagicMock, patch

from app.integrations.shodan_internetdb import ShodanInternetDBService
from app.integrations.spamhaus_dnsbl import SpamhausDNSBLService
from app.integrations.tor_exit_nodes import TorExitNodeChecker
from app.services.threat_intelligence import PhishTankProvider


async def main():
    service = ShodanInternetDBService()
    with patch('httpx.AsyncClient.get') as mock_get:
        resp = MagicMock(status_code=200)
        resp.json.return_value = {
            'ip': '1.2.3.4',
            'hostnames': ['mail.example.com'],
            'ports': [25, 443, 587],
            'tags': ['cloud'],
            'vulns': ['CVE-2021-44228'],
            'cpes': ['cpe:/a:apache:http_server:2.4.41'],
        }
        mock_get.return_value = resp
        result = await service.lookup('1.2.3.4')
        assert result['status'] == 'ok'
        assert result['has_smtp'] is True
        assert result['vuln_count'] == 1
        assert 'cloud' in result['tags']

    spam = SpamhausDNSBLService()
    with patch('dns.resolver.resolve') as mock_resolve:
        mock_resolve.return_value = ['127.0.0.2']
        result = await spam.check_ip('198.51.100.10')
        assert result['is_blacklisted'] is True
        assert result['blacklist_count'] == 1
        assert result['listings'][0]['code'] == '127.0.0.2'

    TorExitNodeChecker._cache.clear()
    TorExitNodeChecker._cache.add('203.0.113.77')
    TorExitNodeChecker._cache_time = 0
    result = await TorExitNodeChecker.check_ip('203.0.113.77')
    assert result['is_tor_exit_node'] is True
    assert result['source'] == 'torproject.org/torbulkexitlist'

    with patch('app.services.threat_intelligence.settings.PHISHTANK_API_KEY', 'test_pt_key'):
        provider = PhishTankProvider()
        with patch('httpx.AsyncClient.post') as mock_post:
            resp = MagicMock(status_code=200)
            resp.json.return_value = {
                'results': {
                    'in_database': True,
                    'valid': True,
                    'phish_detail_page': 'https://phishtank.org/phish_detail.php?phish_id=1234',
                }
            }
            mock_post.return_value = resp
            result = await provider.lookup('url', 'https://example.com/phish')
            assert result['status'] == 'ok'
            assert result['reputation'] == 'malicious'
            assert result['confidence'] == 95
            assert result['categories'] == ['phishing']

    print('ALL_PHASE1_3_TO_1_6_OK')


asyncio.run(main())
