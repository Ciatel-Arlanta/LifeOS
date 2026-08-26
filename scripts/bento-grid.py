"""
LifeOS Bento-Grid Logo Generator
Renders a minimal, premium 2x2 asymmetrical bento-grid app icon logo.

Geometry:
- 4 asymmetrical modular pill/rounded blocks inside an invisible square (66% safe zone)
- 14px uniform negative space gutters (mapped from 3.5px base)
- Inner corners curve inward (R=92px) carving a radiant 4-point star/cross in negative space
- Solid matte obsidian black (#111216) on cool off-white paper (#F4F4F6)
- Master render at 4096x4096 (4x supersampling) downscaled via Lanczos to 1024, 512, 256
"""

import os
import math
from PIL import Image, ImageDraw

# Output directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE_DIR, "dist", "logo-ideas")
os.makedirs(OUT_DIR, exist_ok=True)

# 4x Supersampling Configuration
SCALE = 4
CANVAS_1024 = 1024
CANVAS_SIZE = CANVAS_1024 * SCALE
CENTER = CANVAS_SIZE // 2

# Color Palette
BG_COLOR = (244, 244, 246)   # #F4F4F6 (Cool Off-White Paper)
INK_COLOR = (17, 18, 22)     # #111216 (Matte Obsidian Black)

# Grid Geometry Specifications (at 1024 scale)
SAFE_ZONE_PX = 676           # 66% of 1024px
GUTTER_PX = 14               # 14px negative space gutter
SPLIT_OFFSET_X = -36         # Asymmetrical vertical gutter offset from center
SPLIT_OFFSET_Y = 36          # Asymmetrical horizontal gutter offset from center

R_OUTER_PX = 76              # Outer bounding squircle corner radius
R_STAR_PX = 92               # Inner star negative-space corner radius
R_GUTTER_PX = 32             # Gutter-facing non-intersection corner radius

def generate_polygon_corners(x0, y0, x1, y1, r_tl, r_tr, r_br, r_bl, n_pts=64):
    """
    Generates high-precision polygon vertices for a rectangle with independent corner radii.
    """
    pts = []
    w = x1 - x0
    h = y1 - y0
    
    # Clamp radii so corners never overlap
    r_tl = max(0.0, min(float(r_tl), w / 2.0, h / 2.0))
    r_tr = max(0.0, min(float(r_tr), w / 2.0, h / 2.0))
    r_br = max(0.0, min(float(r_br), w / 2.0, h / 2.0))
    r_bl = max(0.0, min(float(r_bl), w / 2.0, h / 2.0))
    
    # Top-Left Corner Arc (180 to 270 deg)
    if r_tl > 0:
        cx, cy = x0 + r_tl, y0 + r_tl
        for i in range(n_pts + 1):
            theta = math.pi + i * (math.pi / 2.0) / n_pts
            pts.append((cx + r_tl * math.cos(theta), cy + r_tl * math.sin(theta)))
    else:
        pts.append((x0, y0))
        
    # Top-Right Corner Arc (270 to 360 deg)
    if r_tr > 0:
        cx, cy = x1 - r_tr, y0 + r_tr
        for i in range(n_pts + 1):
            theta = -math.pi / 2.0 + i * (math.pi / 2.0) / n_pts
            pts.append((cx + r_tr * math.cos(theta), cy + r_tr * math.sin(theta)))
    else:
        pts.append((x1, y0))
        
    # Bottom-Right Corner Arc (0 to 90 deg)
    if r_br > 0:
        cx, cy = x1 - r_br, y1 - r_br
        for i in range(n_pts + 1):
            theta = 0.0 + i * (math.pi / 2.0) / n_pts
            pts.append((cx + r_br * math.cos(theta), cy + r_br * math.sin(theta)))
    else:
        pts.append((x1, y1))
        
    # Bottom-Left Corner Arc (90 to 180 deg)
    if r_bl > 0:
        cx, cy = x0 + r_bl, y1 - r_bl
        for i in range(n_pts + 1):
            theta = math.pi / 2.0 + i * (math.pi / 2.0) / n_pts
            pts.append((cx + r_bl * math.cos(theta), cy + r_bl * math.sin(theta)))
    else:
        pts.append((x0, y1))
        
    return pts

def render_bento_grid():
    """
    Renders the master 4096x4096 bento-grid image and exports downscaled PNGs.
    """
    # 1. Create supersampled canvas
    img = Image.new("RGB", (CANVAS_SIZE, CANVAS_SIZE), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # 2. Scale metrics to 4096 canvas
    box_size = SAFE_ZONE_PX * SCALE
    gutter = GUTTER_PX * SCALE
    half_g = gutter // 2
    
    x_min = CENTER - box_size // 2
    x_max = CENTER + box_size // 2
    y_min = CENTER - box_size // 2
    y_max = CENTER + box_size // 2
    
    cx = CENTER + SPLIT_OFFSET_X * SCALE
    cy = CENTER + SPLIT_OFFSET_Y * SCALE
    
    r_out = R_OUTER_PX * SCALE
    r_star = R_STAR_PX * SCALE
    r_gut = R_GUTTER_PX * SCALE
    
    # 3. Compute the 4 asymmetrical modular blocks
    # Block 1: Top-Left (Vertical modular card)
    pts_tl = generate_polygon_corners(
        x0=x_min,
        y0=y_min,
        x1=cx - half_g,
        y1=cy - half_g,
        r_tl=r_out,
        r_tr=r_gut,
        r_br=r_star,  # Inner star corner
        r_bl=r_gut
    )
    
    # Block 2: Top-Right (Wide hero card)
    pts_tr = generate_polygon_corners(
        x0=cx + half_g,
        y0=y_min,
        x1=x_max,
        y1=cy - half_g,
        r_tl=r_gut,
        r_tr=r_out,
        r_br=r_gut,
        r_bl=r_star   # Inner star corner
    )
    
    # Block 3: Bottom-Left (Compact foundation card)
    pts_bl = generate_polygon_corners(
        x0=x_min,
        y0=cy + half_g,
        x1=cx - half_g,
        y1=y_max,
        r_tl=r_gut,
        r_tr=r_star,  # Inner star corner
        r_br=r_gut,
        r_bl=r_out
    )
    
    # Block 4: Bottom-Right (Horizontal landscape pill card)
    pts_br = generate_polygon_corners(
        x0=cx + half_g,
        y0=cy + half_g,
        x1=x_max,
        y1=y_max,
        r_tl=r_star,  # Inner star corner
        r_tr=r_gut,
        r_br=r_out,
        r_bl=r_gut
    )
    
    # 4. Draw the solid blocks
    draw.polygon(pts_tl, fill=INK_COLOR)
    draw.polygon(pts_tr, fill=INK_COLOR)
    draw.polygon(pts_bl, fill=INK_COLOR)
    draw.polygon(pts_br, fill=INK_COLOR)
    
    # 5. Export Downscaled Multi-Resolution PNGs
    targets = [
        ("bento-grid.png", 1024),
        ("bento-grid-512.png", 512),
        ("bento-grid-256.png", 256),
    ]
    
    print("=" * 60)
    print("LifeOS Bento-Grid Logo Generator")
    print(f"Canvas: {CANVAS_1024}x{CANVAS_1024} (4x Supersampling: {CANVAS_SIZE}x{CANVAS_SIZE})")
    print(f"Safe Area: {SAFE_ZONE_PX}x{SAFE_ZONE_PX} ({round(SAFE_ZONE_PX/1024*100, 1)}%)")
    print(f"Gutters: {GUTTER_PX}px | Inner Star Radius: {R_STAR_PX}px")
    print(f"Palette: {INK_COLOR} on {BG_COLOR}")
    print("=" * 60)
    
    for filename, size in targets:
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        out_path = os.path.join(OUT_DIR, filename)
        resized.save(out_path, format="PNG", optimize=True)
        print(f"[OK] Generated [{size}x{size}]: {out_path}")
    print("=" * 60)

if __name__ == "__main__":
    render_bento_grid()
