import fitz
import os

pdf_path = "1. Menu fenix.pdf"

print(f"Opening {pdf_path} (size: {os.path.getsize(pdf_path) / (1024*1024):.2f} MB)...")
doc = fitz.open(pdf_path)
print(f"Total pages: {len(doc)}")

# 1. Extract text
print("Extracting text to menu_text.txt...")
with open("menu_text.txt", "w", encoding="utf-8") as f:
    for i, page in enumerate(doc):
        f.write(f"\n--- PAGE {i+1} ---\n")
        f.write(page.get_text())

# 2. Render each page at 120 DPI into a lightweight PDF
print("Compressing pages to menu_small.pdf...")
out_pdf = fitz.open()
for i, page in enumerate(doc):
    print(f"Processing page {i+1}/{len(doc)}...", end="\r")
    pix = page.get_pixmap(dpi=120)
    img_ByteArr = pix.tobytes("jpeg", jpg_quality=75)
    img_page = out_pdf.new_page(width=page.rect.width, height=page.rect.height)
    img_page.insert_image(page.rect, stream=img_ByteArr)

print("\nSaving menu_small.pdf...")
out_pdf.save("menu_small.pdf", deflate=True)
out_pdf.close()
doc.close()

out_size = os.path.getsize("menu_small.pdf") / (1024 * 1024)
txt_size = os.path.getsize("menu_text.txt") / 1024
print(f"Done! menu_small.pdf created ({out_size:.2f} MB). menu_text.txt created ({txt_size:.2f} KB).")
