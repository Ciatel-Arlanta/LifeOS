"""
Promote bento-grid logo to app assets.
- icon.png: 1024 light #F4F4F6 with black #111216 (copy from dist)
- adaptive-icon.png: 1024 transparent with white #FFFFFF bento (for ink background)
- splash.png: 2048 transparent with black bento centered on paper (app.json background #F4F4F6)
- favicon.png: 64 ink #111216 tile with white bento (for contrast)
"""
import os, shutil, math
from PIL import Image, ImageDraw
import importlib.util

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Import bento generator for polygon logic
spec = importlib.util.spec_from_file_location("bento", os.path.join(BASE, "scripts", "bento-grid.py"))
bento = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bento)

OUT = os.path.join(BASE, "assets", "images")
os.makedirs(OUT, exist_ok=True)
DIST = os.path.join(BASE, "dist", "logo-ideas")

# 1. icon.png - copy light variant
shutil.copy(os.path.join(DIST, "bento-grid.png"), os.path.join(OUT, "icon.png"))
print("icon.png ->", os.path.join(OUT, "icon.png"))

# Helper to render bento at given canvas, palette, scale
SCALE = 4
def render_bento(canvas_size, bg_rgba, ink_rgba, safe_zone_px, gutter_px=14, split_x=-36, split_y=36, r_outer=76, r_star=92, r_gut=32):
    CANVAS = canvas_size * SCALE
    CENTER = CANVAS // 2
    img = Image.new("RGBA", (CANVAS, CANVAS), bg_rgba)
    d = ImageDraw.Draw(img)
    box = safe_zone_px * SCALE
    gutter = gutter_px * SCALE
    half = gutter // 2
    x_min = CENTER - box // 2
    x_max = CENTER + box // 2
    y_min = CENTER - box // 2
    y_max = CENTER + box // 2
    cx = CENTER + split_x * SCALE
    cy = CENTER + split_y * SCALE
    r_out = r_outer * SCALE
    r_star_s = r_star * SCALE
    r_gut_s = r_gut * SCALE
    pts_tl = bento.generate_polygon_corners(x_min, y_min, cx-half, cy-half, r_out, r_gut, r_star_s, r_gut)
    pts_tr = bento.generate_polygon_corners(cx+half, y_min, x_max, cy-half, r_gut, r_out, r_gut, r_star_s)
    pts_bl = bento.generate_polygon_corners(x_min, cy+half, cx-half, y_max, r_gut, r_star_s, r_gut, r_out)
    pts_br = bento.generate_polygon_corners(cx+half, cy+half, x_max, y_max, r_star_s, r_gut, r_out, r_gut)
    d.polygon(pts_tl, fill=ink_rgba)
    d.polygon(pts_tr, fill=ink_rgba)
    d.polygon(pts_bl, fill=ink_rgba)
    d.polygon(pts_br, fill=ink_rgba)
    # downscale
    return img.resize((canvas_size, canvas_size), Image.Resampling.LANCZOS)

# 2. adaptive-icon.png: 1024 transparent, white bento
adaptive = render_bento(1024, (0,0,0,0), (255,255,255,255), 676)
adaptive.save(os.path.join(OUT, "adaptive-icon.png"), "PNG", optimize=True)
print("adaptive-icon.png")

# 3. splash.png: 2048 transparent, black bento centered at 1024 scale then centered on 2048
# Render 1024 black on transparent, then paste centered on 2048
bento_1024 = render_bento(1024, (0,0,0,0), (17,18,22,255), 676)
splash = Image.new("RGBA", (2048, 2048), (0,0,0,0))
splash.paste(bento_1024, (512, 512), bento_1024)
splash.save(os.path.join(OUT, "splash.png"), "PNG", optimize=True)
print("splash.png 2048")

# 4. favicon.png: 64 ink tile with white bento (for contrast on light browser tab)
favicon = render_bento(64, (17,18,22,255), (255,255,255,255), 42)  # 66% of 64 ≈ 42
favicon.save(os.path.join(OUT, "favicon.png"), "PNG", optimize=True)
print("favicon.png 64")

print("done")
