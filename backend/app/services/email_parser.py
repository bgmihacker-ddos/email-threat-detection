import email
from email import policy
from email.parser import BytesParser

class EmailParser:
    @staticmethod
    def parse_raw(raw_email: bytes):
        msg = BytesParser(policy=policy.default).parsebytes(raw_email)

        # Basic extraction
        data = {
            "from": msg.get("from"),
            "to": msg.get_all("to", []),
            "reply_to": msg.get("reply-to"),
            "return_path": msg.get("return-path"),
            "subject": msg.get("subject"),
            "date": msg.get("date"),
            "message_id": msg.get("message-id"),
            "received": msg.get_all("received", []),
            "authentication_results": msg.get("authentication-results"),
            "spf": msg.get("spf"),
            "dkim": msg.get("dkim"),
            "dmarc": msg.get("dmarc"),
            "headers": dict(msg.items()),
            "plain_text": "",
            "html_body": "",
            "attachments": []
        }

        # Body and Attachment Extraction
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition"))

            if content_type == "text/plain" and "attachment" not in content_disposition:
                data["plain_text"] = part.get_content().strip()
            elif content_type == "text/html" and "attachment" not in content_disposition:
                data["html_body"] = part.get_content().strip()
            elif part.get_filename():
                filename = part.get_filename()
                data["attachments"].append({
                    "name": filename,
                    "extension": filename.split('.')[-1] if '.' in filename else '',
                    "type": content_type,
                    "size": len(part.get_content())
                })
        return data
