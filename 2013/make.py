#!/usr/bin/env python

# Code to break images into a bunch of different smaller squares.
# This requires PIL which is a pain to install. Try using Pillow,
# which you can install with sudo easy_install pillow.

from PIL import Image

# Splats a JPG into 408x408 squares.
# I chose 408x408 because that is a precise divisor of iPhone picture dimensions.
#
# fname is relative to "sources"
# outprefix is the prefix to create within "pieces"
#
# This creates output files for each tile like
# outprefix_x_y.jpg
def splat(fname, outprefix):
  image = Image.open("sources/" + fname)
  _, _, max_x, max_y = image.getbbox()
  size = 408
  x_tiles = max_x / size
  y_tiles = max_y / size
  for x in range(x_tiles):
    for y in range(y_tiles):
      left = x * size
      top = y * size
      tile = image.crop((left, top, left + size, top + size))

      if fname.startswith("vertical"):
        # vertical iPhone pictures appear to be stored rotated to the left
        # by 90 degrees.
        # So we need to rotate by 90 degrees clockwise here.

      outname = "pieces/%s_%d_%d.jpg" % (outprefix, x, y)
      print "generating", outname
      tile.save(outname)
  
def makeall():
  for n in [40, 43, 87, 98, 99, 102, 103, 104, 112, 122, 123, 131]:
    splat("horizontal/IMG_%04d.JPG" % n, "h%d" % n)
  for n in [29, 30, 32, 33, 38, 44, 45, 48, 49, 51, 58, 62, 63, 64,
            71, 76, 80, 86, 91, 93, 94, 105, 109, 111, 113, 128,
            133, 137]:
    splat("vertical/IMG_%04d.JPG" % n, "v%d" % n)
    
if __name__ == "__main__":
  makeall()
