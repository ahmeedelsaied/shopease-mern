from pathlib import Path
import urllib.request

mapping = {
    'iphone15pro.jpg': 'https://source.unsplash.com/1200x900/?iphone,smartphone',
    'macbook-air-m3.jpg': 'https://source.unsplash.com/1200x900/?macbook,laptop',
    'sony-wh1000xm5.jpg': 'https://source.unsplash.com/1200x900/?headphones,wireless',
    'airpods-pro-2.jpg': 'https://source.unsplash.com/1200x900/?airpods,earbuds',
    'galaxy-watch6.jpg': 'https://source.unsplash.com/1200x900/?smartwatch,wearable',
    'nike-air-max-270.jpg': 'https://source.unsplash.com/1200x900/?nike,sneakers',
    'adidas-ultraboost.jpg': 'https://source.unsplash.com/1200x900/?adidas,sneakers',
    'levis-501.jpg': 'https://source.unsplash.com/1200x900/?jeans,denim',
    'rayban-aviator.jpg': 'https://source.unsplash.com/1200x900/?sunglasses,aviator',
    'jbl-flip6.jpg': 'https://source.unsplash.com/1200x900/?bluetooth-speaker,audio',
    'logitech-mx-master3s.jpg': 'https://source.unsplash.com/1200x900/?computer-mouse,office',
    'anker-737.jpg': 'https://source.unsplash.com/1200x900/?portable-charger,power-bank',
}

output_dir = Path(__file__).resolve().parent.parent / 'public' / 'images' / 'products'
output_dir.mkdir(parents=True, exist_ok=True)

for filename, url in mapping.items():
    output_path = output_dir / filename
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            content = response.read()
            output_path.write_bytes(content)
        print(f'Saved {output_path}')
    except Exception as exc:
        print(f'Failed to download {filename}: {exc}')
