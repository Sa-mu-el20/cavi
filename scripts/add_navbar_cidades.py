"""Script para adicionar link de Cidades na navbar."""
import re

filepath = "C:/Users/20242inn022/Documents/cavi/templates/base_privada.html"

with open(filepath, "rb") as f:
    content = f.read()

old = re.search(rb"Backup</a>\r?\n\s*</li>\r?\n\s*{% else %}", content)
if not old:
    print("NOT FOUND")
    exit(1)

new = (
    b"Backup</a>\r\n"
    b" </li>\r\n"
    b" <li class=\"nav-item\">\r\n"
    b" <a class=\"nav-link {{ 'active' if '/admin/cidades/' in request.path else '' }}\"\r\n"
    b"   href=\"/admin/cidades/listar\"\r\n"
    b"   {{ 'aria-current=page' if '/admin/cidades/' in request.path else '' }}>Cidades</a>\r\n"
    b" </li>\r\n"
    b" {% else %}"
)

content = content[:old.start()] + new + content[old.end():]

with open(filepath, "wb") as f:
    f.write(content)

print("OK - Cidades link added to navbar")
