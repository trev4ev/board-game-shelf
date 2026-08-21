#!/usr/bin/env python3
from pathlib import Path
import sys

path = Path(sys.argv[1])
html = path.read_text()
if "spa-github-pages-restore" in html:
    raise SystemExit(0)

script = """    <script>
      /* spa-github-pages-restore */
      (function (l) {
        if (l.search[1] === '/') {
          var decoded = l.search.slice(1).split('&').map(function (s) {
            return s.replace(/~and~/g, '&')
          }).join('?')
          window.history.replaceState(null, '', l.pathname.slice(0, -1) + decoded + l.hash)
        }
      })(window.location)
    </script>
"""
html = html.replace("<head>", "<head>\n" + script, 1)
path.write_text(html)
