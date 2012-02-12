#!/usr/bin/env python

"""
Packs everything into one big html file.
Run from this directory.
"""
out_lines = []
for line in open("index.html"):
  if "text/javascript" not in line:
    out_lines.append(line)
    continue

  filename = line.split("src=")[1].split(">")[0].strip('"')
  out_lines.append('<script type="text/javascript">')
  out_lines.extend(open(filename).readlines())
  out_lines.append('</script>')

f = open("packed.html", "w")
for line in out_lines:
  f.write(line)
f.close()
