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
        var path = l.pathname.endsWith('/') ? l.pathname.slice(0, -1) : l.pathname
        function forgetStored() {
          try {
            sessionStorage.removeItem('spa-github-pages-path')
          } catch (e) {}
        }
        if (l.search[1] === '/') {
          var decoded = l.search
            .slice(1)
            .split('&')
            .map(function (s) {
              return s.replace(/~and~/g, '&')
            })
            .join('?')
          forgetStored()
          window.history.replaceState(null, '', path + decoded + l.hash)
          return
        }
        try {
          var stored = sessionStorage.getItem('spa-github-pages-path')
          if (stored && stored.charAt(0) === '/') {
            forgetStored()
            window.history.replaceState(null, '', path + stored)
          }
        } catch (e) {}
      })(window.location)
    </script>
"""
html = html.replace("<head>", "<head>\n" + script, 1)
path.write_text(html)
