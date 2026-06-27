from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

output_dir = Path(__file__).resolve().parent.parent / 'public' / 'images' / 'products'
output_dir.mkdir(parents=True, exist_ok=True)

products = {
    'iphone15pro.jpg': ('iPhone 15 Pro', 'Electronics'),
    'macbook-air-m3.jpg': ('MacBook Air M3', 'Electronics'),
    'sony-wh1000xm5.jpg': ('Sony WH-1000XM5', 'Electronics'),
    'airpods-pro-2.jpg': ('AirPods Pro 2', 'Accessories'),
    'galaxy-watch6.jpg': ('Galaxy Watch 6', 'Accessories'),
    'nike-air-max-270.jpg': ('Nike Air Max 270', 'Shoes'),
    'adidas-ultraboost.jpg': ('Adidas Ultraboost', 'Shoes'),
    'levis-501.jpg': ("Levi's 501 Jeans", 'Fashion'),
    'rayban-aviator.jpg': ('Ray-Ban Aviator', 'Fashion'),
    'jbl-flip6.jpg': ('JBL Flip 6', 'Electronics'),
    'logitech-mx-master3s.jpg': ('Logitech MX Master 3S', 'Accessories'),
    'anker-737.jpg': ('Anker 737 Power Bank', 'Accessories'),
}

colors = {
    'Electronics': (18, 25, 60),
    'Accessories': (16, 42, 62),
    'Shoes': (45, 26, 70),
    'Fashion': (70, 22, 45),
}

for filename, (label, category) in products.items():
    image_path = output_dir / filename
    width, height = 1200, 900
    background_color = colors.get(category, (34, 34, 34))

    image = Image.new('RGB', (width, height), background_color)
    draw = ImageDraw.Draw(image)

    # Soft gradient overlay
    for i in range(120):
        overlay_color = (255, 255, 255, int(12 * (1 - i / 120)))
        overlay = Image.new('RGBA', (width, height), overlay_color)
        image = Image.alpha_composite(image.convert('RGBA'), overlay)
        draw = ImageDraw.Draw(image)

    try:
        font_large = ImageFont.truetype('arial.ttf', 72)
        font_small = ImageFont.truetype('arial.ttf', 36)
    except OSError:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

    title = label
    subtitle = category.upper()

    title_bbox = draw.textbbox((0, 0), title, font=font_large)
    title_w = title_bbox[2] - title_bbox[0]
    title_h = title_bbox[3] - title_bbox[1]
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=font_small)
    subtitle_w = subtitle_bbox[2] - subtitle_bbox[0]

    # edge accent bar
    accent_color = (255, 255, 255, 28)
    draw.rectangle([60, 60, width - 60, height - 60], outline=accent_color, width=6)
    draw.rounded_rectangle([90, 90, width - 90, height - 160], radius=40, outline=accent_color, width=5)

    draw.text(
        ((width - subtitle_w) / 2, height * 0.28),
        subtitle,
        font=font_small,
        fill=(245, 245, 245),
    )
    draw.text(
        ((width - title_w) / 2, height * 0.35),
        title,
        font=font_large,
        fill=(250, 250, 250),
    )

    flare = Image.new('RGBA', (width, height), (255, 255, 255, 0))
    flare_draw = ImageDraw.Draw(flare)
    flare_draw.ellipse([width * 0.5, -height * 0.2, width * 1.1, height * 0.55], fill=(255, 255, 255, 60))
    image = Image.alpha_composite(image.convert('RGBA'), flare)

    final = image.convert('RGB')
    final.save(image_path, format='JPEG', quality=92)

    with Image.open(image_path) as img:
        img.verify()

    print(f'Written {filename} ({image_path.stat().st_size} bytes)')
