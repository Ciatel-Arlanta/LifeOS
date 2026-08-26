"""
LifeOS Logo Variations Generator
Generates 9 abstract logo variations (1024x1024 flat vector PNGs)
Ink: #18181B | Paper: #F4F4F5 | 66% Android Adaptive Icon Safe Zone
"""

import os
from PIL import Image, ImageDraw

OUT_DIR = os.path.join("dist", "logo-ideas", "variations")
os.makedirs(OUT_DIR, exist_ok=True)

# 4x supersampling for razor-sharp antialiasing
SCALE = 4
CANVAS_SIZE = 1024 * SCALE
CENTER = CANVAS_SIZE // 2

INK = (24, 24, 27)       # #18181B
PAPER = (244, 244, 245)  # #F4F4F5

def create_canvas():
    return Image.new("RGB", (CANVAS_SIZE, CANVAS_SIZE), PAPER)

def save_image(img, filename):
    downscaled = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    path = os.path.join(OUT_DIR, filename)
    downscaled.save(path, format="PNG", optimize=True)
    print(f"Saved: {path}")

# ==============================================================================
# BASE 1: Abstract Stack (3 offset rounded cards)
# ==============================================================================

def generate_1a():
    """
    1a: Diagonal Stagger with Paper Gaps (Tactile Slabs)
    Three identical landscape cards offset diagonally, separated by crisp negative space halos.
    """
    img = create_canvas()
    draw = ImageDraw.Draw(img)
    
    w, h, r = 420 * SCALE, 250 * SCALE, 40 * SCALE
    halo = 14 * SCALE
    
    offsets = [
        (-52 * SCALE, -52 * SCALE),  # Card 1 (Back / Top-Left)
        (0, 0),                      # Card 2 (Middle)
        (52 * SCALE, 52 * SCALE),    # Card 3 (Front / Bottom-Right)
    ]
    
    for i, (dx, dy) in enumerate(offsets):
        cx, cy = CENTER + dx, CENTER + dy
        x0, y0 = cx - w // 2, cy - h // 2
        x1, y1 = x0 + w, y0 + h
        
        # If not the first card, cut out previous layers with paper halo
        if i > 0:
            hx0, hy0 = x0 - halo, y0 - halo
            hx1, hy1 = x1 + halo, y1 + halo
            hr = r + halo
            draw.rounded_rectangle([hx0, hy0, hx1, hy1], radius=hr, fill=PAPER)
        
        # Draw solid ink card
        draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=INK)
        
    save_image(img, "1a.png")

def generate_1b():
    """
    1b: Vertical Waterfall / Stepped Cascade (Architectural Layering)
    Three horizontal cards stacked vertically with progressive widths and stepped depths.
    """
    img = create_canvas()
    draw = ImageDraw.Draw(img)
    
    cards = [
        # (width, height, radius, y_center_offset)
        (400 * SCALE, 140 * SCALE, 30 * SCALE, -135 * SCALE),  # Top Card (Narrower, upper deck)
        (450 * SCALE, 155 * SCALE, 34 * SCALE, 0),             # Mid Card
        (490 * SCALE, 175 * SCALE, 38 * SCALE, 140 * SCALE),   # Bottom Card (Wide foundation)
    ]
    
    halo = 14 * SCALE
    
    for i, (w, h, r, dy) in enumerate(cards):
        cx, cy = CENTER, CENTER + dy
        x0, y0 = cx - w // 2, cy - h // 2
        x1, y1 = x0 + w, y0 + h
        
        if i > 0:
            draw.rounded_rectangle([x0 - halo, y0 - halo, x1 + halo, y1 + halo], radius=r + halo, fill=PAPER)
            
        draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=INK)
        
    save_image(img, "1b.png")

def generate_1c():
    """
    1c: Symmetrical Nested Squircles (High-Density Modernist Stack)
    Three square-proportioned squircle cards fanning along an ascending diagonal with tight Swiss precision.
    """
    img = create_canvas()
    draw = ImageDraw.Draw(img)
    
    size = 330 * SCALE
    r = 54 * SCALE
    halo = 16 * SCALE
    
    offsets = [
        (-64 * SCALE, -64 * SCALE),  # Bottom-left back
        (0, 0),                      # Center
        (64 * SCALE, 64 * SCALE),    # Top-right front
    ]
    
    for i, (dx, dy) in enumerate(offsets):
        cx, cy = CENTER + dx, CENTER + dy
        x0, y0 = cx - size // 2, cy - size // 2
        x1, y1 = x0 + size, y0 + size
        
        if i > 0:
            draw.rounded_rectangle([x0 - halo, y0 - halo, x1 + halo, y1 + halo], radius=r + halo, fill=PAPER)
            
        draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=INK)
        
    save_image(img, "1c.png")

# ==============================================================================
# BASE 2: Abstract Tape (5 vertical bars)
# ==============================================================================

def generate_2a():
    """
    2a: Organic Pill Crescendo / Wave Curve (Dynamic Cadence)
    5 capsule-ended vertical bars in a symmetrical cadence wave.
    """
    img = create_canvas()
    draw = ImageDraw.Draw(img)
    
    bar_w = 54 * SCALE
    gap = 34 * SCALE
    heights = [180 * SCALE, 320 * SCALE, 520 * SCALE, 390 * SCALE, 240 * SCALE]
    
    total_w = len(heights) * bar_w + (len(heights) - 1) * gap
    start_x = CENTER - total_w // 2
    
    for i, h in enumerate(heights):
        x0 = start_x + i * (bar_w + gap)
        x1 = x0 + bar_w
        y0 = CENTER - h // 2
        y1 = CENTER + h // 2
        r = bar_w // 2  # Pill / capsule
        draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=INK)
        
    save_image(img, "2a.png")

def generate_2b():
    """
    2b: Architectural Barcode / Ascending Stepped Columns (Ledger Columns)
    5 crisp monolithic bars on a grounded baseline with micro-radius.
    """
    img = create_canvas()
    draw = ImageDraw.Draw(img)
    
    bar_w = 58 * SCALE
    gap = 24 * SCALE
    heights = [130 * SCALE, 210 * SCALE, 300 * SCALE, 390 * SCALE, 480 * SCALE]
    r = 16 * SCALE
    
    total_w = len(heights) * bar_w + (len(heights) - 1) * gap
    start_x = CENTER - total_w // 2
    baseline_y = CENTER + 215 * SCALE
    
    for i, h in enumerate(heights):
        x0 = start_x + i * (bar_w + gap)
        x1 = x0 + bar_w
        y0 = baseline_y - h
        y1 = baseline_y
        draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=INK)
        
    save_image(img, "2b.png")

def generate_2c():
    """
    2c: Modulated Tape Weights / Monospace Slits (Category Proportions)
    5 vertical bars of uniform height but modulated proportional widths.
    """
    img = create_canvas()
    draw = ImageDraw.Draw(img)
    
    widths = [28 * SCALE, 52 * SCALE, 104 * SCALE, 68 * SCALE, 36 * SCALE]
    gap = 26 * SCALE
    h = 460 * SCALE
    r = 14 * SCALE
    
    total_w = sum(widths) + (len(widths) - 1) * gap
    start_x = CENTER - total_w // 2
    
    curr_x = start_x
    for w in widths:
        x0 = curr_x
        x1 = x0 + w
        y0 = CENTER - h // 2
        y1 = CENTER + h // 2
        draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=INK)
        curr_x += w + gap
        
    save_image(img, "2c.png")

# ==============================================================================
# BASE 6: Generic Horizon (Layered strata with sun dot)
# ==============================================================================

def generate_6a():
    """
    6a: Classic Proportional Strata & Floating Orb (Organic Horizon)
    3 pill-shaped strata of increasing thickness and width topped by a centered sun dot.
    """
    img = create_canvas()
    draw = ImageDraw.Draw(img)
    
    # Sun dot
    sun_r = 60 * SCALE
    sun_cy = CENTER - 165 * SCALE
    draw.ellipse([CENTER - sun_r, sun_cy - sun_r, CENTER + sun_r, sun_cy + sun_r], fill=INK)
    
    # 3 Strata bars (width, height, y_offset)
    strata = [
        (340 * SCALE, 32 * SCALE, -15 * SCALE),    # Top bar
        (440 * SCALE, 50 * SCALE, 60 * SCALE),     # Middle bar
        (520 * SCALE, 80 * SCALE, 150 * SCALE),    # Base foundation
    ]
    
    for w, h, dy in strata:
        cx, cy = CENTER, CENTER + dy
        x0 = cx - w // 2
        x1 = cx + w // 2
        y0 = cy - h // 2
        y1 = cy + h // 2
        r = h // 2  # Pill shape
        draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=INK)
        
    save_image(img, "6a.png")

def generate_6b():
    """
    6b: Technical Swiss Strata / Ruled Ledger Horizon
    4 precision architectural horizontal slats with micro-radius topped by a sharp sun dot.
    """
    img = create_canvas()
    draw = ImageDraw.Draw(img)
    
    # Sun dot
    sun_r = 48 * SCALE
    sun_cy = CENTER - 180 * SCALE
    draw.ellipse([CENTER - sun_r, sun_cy - sun_r, CENTER + sun_r, sun_cy + sun_r], fill=INK)
    
    # 4 Ruled slats (width, height, y_offset, radius)
    slats = [
        (280 * SCALE, 30 * SCALE, -45 * SCALE, 8 * SCALE),
        (370 * SCALE, 36 * SCALE, 15 * SCALE, 10 * SCALE),
        (450 * SCALE, 44 * SCALE, 80 * SCALE, 12 * SCALE),
        (530 * SCALE, 54 * SCALE, 150 * SCALE, 14 * SCALE),
    ]
    
    for w, h, dy, r in slats:
        cx, cy = CENTER, CENTER + dy
        x0 = cx - w // 2
        x1 = cx + w // 2
        y0 = cy - h // 2
        y1 = cy + h // 2
        draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=INK)
        
    save_image(img, "6b.png")

def generate_6c():
    """
    6c: Monolithic Dual Horizon & Bold Focal Orb (High-Contrast Silhouette)
    Two bold heavy foundational slabs with an oversized focal sun dot.
    """
    img = create_canvas()
    draw = ImageDraw.Draw(img)
    
    # Large focal sun dot
    sun_r = 85 * SCALE
    sun_cy = CENTER - 160 * SCALE
    draw.ellipse([CENTER - sun_r, sun_cy - sun_r, CENTER + sun_r, sun_cy + sun_r], fill=INK)
    
    # Two monolithic foundation slabs
    slabs = [
        (480 * SCALE, 72 * SCALE, -5 * SCALE, 24 * SCALE),   # Upper slab
        (540 * SCALE, 110 * SCALE, 120 * SCALE, 32 * SCALE), # Base slab
    ]
    
    for w, h, dy, r in slabs:
        cx, cy = CENTER, CENTER + dy
        x0 = cx - w // 2
        x1 = cx + w // 2
        y0 = cy - h // 2
        y1 = cy + h // 2
        draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=INK)
        
    save_image(img, "6c.png")

# ==============================================================================
# MAIN RUNNER
# ==============================================================================

if __name__ == "__main__":
    print("Generating LifeOS Logo Variations...")
    generate_1a()
    generate_1b()
    generate_1c()
    generate_2a()
    generate_2b()
    generate_2c()
    generate_6a()
    generate_6b()
    generate_6c()
    print("All 9 variations generated successfully!")
