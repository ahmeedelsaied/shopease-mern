from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

images = [
    ('iphone15pro.jpg', 'iPhone 15 Pro', 'Electronics'),
    ('macbook-air-m3.jpg', 'MacBook Air M3', 'Electronics'),
    ('sony-wh1000xm5.jpg', 'Sony WH-1000XM5', 'Electronics'),
    ('airpods-pro-2.jpg', 'AirPods Pro 2', 'Accessories'),
    ('galaxy-watch6.jpg', 'Galaxy Watch 6', 'Accessories'),
    ('nike-air-max-270.jpg', 'Nike Air Max 270', 'Shoes'),
    ('adidas-ultraboost.jpg', 'Adidas Ultraboost', 'Shoes'),
    ('levis-501.jpg', "Levi's 501 Jeans", 'Fashion'),
    ('rayban-aviator.jpg', 'Ray-Ban Aviator', 'Fashion'),
    ('jbl-flip6.jpg', 'JBL Flip 6', 'Electronics'),
    ('logitech-mx-master3s.jpg', 'Logitech MX Master 3S', 'Accessories'),
    ('anker-737.jpg', 'Anker 737 Power Bank', 'Accessories'),
]

output_dir = Path(__file__).resolve().parent.parent / 'public' / 'images' / 'products'
output_dir.mkdir(parents=True, exist_ok=True)

base_colors = {
    'Electronics': (12, 22, 48),
    'Fashion': (67, 29, 79),
    'Shoes': (8, 58, 82),
    'Accessories': (38, 50, 72),
}

for filename, title, category in images:
    width, height = 1200, 900
    bg_color = base_colors.get(category, (28, 30, 35))
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    for i in range(18):
        alpha = int(24 * (18 - i))
        overlay = Image.new('RGBA', (width, height), (255, 255, 255, alpha))
        img = Image.alpha_composite(img.convert('RGBA'), overlay)

    overlay_draw = ImageDraw.Draw(img)
    try:
        font_large = ImageFont.truetype('arial.ttf', 76)
        font_small = ImageFont.truetype('arial.ttf', 35)
    except Exception:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

    title_text = title
    try:
        title_bbox = overlay_draw.textbbox((0, 0), title_text, font=font_large)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
    except AttributeError:
        title_width, title_height = overlay_draw.textsize(title_text, font=font_large)

    overlay_draw.text(
        ((width - title_width) / 2, height * 0.40),
        title_text,
        font=font_large,
        fill=(245, 245, 245),
    )

    subtitle_text = category
    try:
        subtitle_bbox = overlay_draw.textbbox((0, 0), subtitle_text, font=font_small)
        subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
        subtitle_height = subtitle_bbox[3] - subtitle_bbox[1]
    except AttributeError:
        subtitle_width, subtitle_height = overlay_draw.textsize(subtitle_text, font=font_small)

    overlay_draw.text(
        ((width - subtitle_width) / 2, height * 0.33),
        subtitle_text.upper(),
        font=font_small,
        fill=(225, 225, 225),
    )

    shape_margin = 80
    overlay_draw.rounded_rectangle(
        [shape_margin, shape_margin, width - shape_margin, height - shape_margin],
        radius=42,
        outline=(255, 255, 255, 50),
        width=4,
    )

    gradient = Image.new('RGBA', (width, height), (255, 255, 255, 0))
    grad_draw = ImageDraw.Draw(gradient)
    grad_draw.ellipse(
        [(width * 0.5, -height * 0.2), (width * 1.2, height * 0.6)],
        fill=(255, 255, 255, 70),
    )
    img = Image.alpha_composite(img.convert('RGBA'), gradient)

    final_image = img.convert('RGB')
    final_image.save(output_dir / filename, quality=92)
    print('Saved', filename)
