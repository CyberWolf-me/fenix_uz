import os
import time
from PIL import Image

webp_dir = "compressed_webp"
png_dir = "compressed_png"

os.makedirs(webp_dir, exist_ok=True)
os.makedirs(png_dir, exist_ok=True)

total_orig = 0
total_webp = 0
total_png = 0

print("Starting compression of 30 images...")
start_time = time.time()

for i in range(1, 31):
    src_file = f"{i}.png"
    if not os.path.exists(src_file):
        print(f"File {src_file} not found, skipping.")
        continue

    orig_size = os.path.getsize(src_file)
    total_orig += orig_size

    with Image.open(src_file) as im:
        # 1. Save WebP (preserves alpha transparency, quality 80)
        webp_path = os.path.join(webp_dir, f"{i}.webp")
        im.save(webp_path, "WEBP", quality=80)
        webp_size = os.path.getsize(webp_path)
        total_webp += webp_size

        # 2. Save Optimized PNG (preserves alpha transparency, 256-color palette)
        png_path = os.path.join(png_dir, f"{i}.png")
        im_quant = im.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
        im_quant.save(png_path, optimize=True)
        png_size = os.path.getsize(png_path)
        total_png += png_size

    print(f"[{i}/30] {src_file}: {orig_size/1024:.0f}KB -> WebP: {webp_size/1024:.0f}KB, PNG: {png_size/1024:.0f}KB")

elapsed = time.time() - start_time
print("=" * 50)
print(f"COMPRESSION FINISHED in {elapsed:.1f}s")
print(f"Original size:     {total_orig / (1024*1024):.2f} MB")
print(f"WebP total size:   {total_webp / (1024*1024):.2f} MB ({(1 - total_webp/total_orig)*100:.1f}% reduction)")
print(f"Optimized PNG size:{total_png / (1024*1024):.2f} MB ({(1 - total_png/total_orig)*100:.1f}% reduction)")
print("=" * 50)
