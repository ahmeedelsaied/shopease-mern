import dotenv from 'dotenv';
import { existsSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import Product from './models/Product.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imageDirectory = path.join(__dirname, '..', 'frontend', 'public', 'images', 'products');

const normalizeName = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const availableImages = readdirSync(imageDirectory)
  .filter((file) => file.toLowerCase().endsWith('.jpg'))
  .sort();

const imageMap = {
  'Apple iPhone 15 Pro': 'iphone15pro.jpg',
  'MacBook Air M3': 'macbook-air-m3.jpg',
  'Sony WH-1000XM5': 'sony-wh1000xm5.jpg',
  'JBL Flip 6': 'jbl-flip6.jpg',
  'AirPods Pro 2': 'airpods-pro-2.jpg',
  'Logitech MX Master 3S': 'logitech-mx-master3s.jpg',
  'Samsung Galaxy Watch': 'galaxy-watch6.jpg',
  'Anker Power Bank': 'anker-737.jpg',
  'Nike Air Max 270': 'nike-air-max-270.jpg',
  'Adidas Ultraboost': 'adidas-ultraboost.jpg',
  "Levi's 501 Jeans": 'levis-501.jpg',
  'Ray-Ban Sunglasses': 'rayban-aviator.jpg',
};

const resolveImagePath = (productName) => {
  const explicitFile = imageMap[productName];
  if (explicitFile) {
    const imagePath = path.join(imageDirectory, explicitFile);
    if (!existsSync(imagePath)) {
      throw new Error(`Missing required image for ${productName}: ${explicitFile}`);
    }
    return `/images/products/${explicitFile}`;
  }

  const normalizedProductName = normalizeName(productName);
  const bestMatch = availableImages
    .map((imageFile) => ({
      imageFile,
      score: normalizeName(imageFile).split('-').filter((token) => normalizedProductName.includes(token)).length,
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)[0];

  if (!bestMatch) {
    throw new Error(`No local product image found for ${productName}`);
  }

  const imagePath = path.join(imageDirectory, bestMatch.imageFile);
  if (!existsSync(imagePath)) {
    throw new Error(`Missing image for ${productName}: ${bestMatch.imageFile}`);
  }

  return `/images/products/${bestMatch.imageFile}`;
};

const missingImages = Object.values(imageMap).filter((fileName) => !existsSync(path.join(imageDirectory, fileName)));
if (missingImages.length) {
  throw new Error(`Missing product image files: ${missingImages.join(', ')}`);
}

const products = [
  {
    name: 'Apple iPhone 15 Pro',
    description:
      'A premium smartphone with a titanium frame, powerful A17 chip, and advanced camera system for crisp low-light photography.',
    price: 1099,
    image: resolveImagePath('Apple iPhone 15 Pro'),
    category: 'Electronics',
    rating: 4.9,
    stock: 28,
    featured: true,
  },
  {
    name: 'MacBook Air M3',
    description:
      'Super thin and silent with Apple silicon performance, long battery life, and a Liquid Retina display designed for creative workflows.',
    price: 1299,
    image: resolveImagePath('MacBook Air M3'),
    category: 'Electronics',
    rating: 4.8,
    stock: 16,
    featured: true,
  },
  {
    name: 'Sony WH-1000XM5',
    description:
      'Industry-leading noise cancellation headphones with premium sound, adaptive listening, and ultra-soft ear cushions for all-day comfort.',
    price: 349,
    image: resolveImagePath('Sony WH-1000XM5'),
    category: 'Electronics',
    rating: 4.7,
    stock: 42,
    featured: false,
  },
  {
    name: 'JBL Flip 6',
    description:
      'Portable Bluetooth speaker with punchy bass, IP67 waterproof build, and extended battery life for premium sound anywhere.',
    price: 149,
    image: resolveImagePath('JBL Flip 6'),
    category: 'Electronics',
    rating: 4.6,
    stock: 34,
    featured: false,
  },
  {
    name: 'AirPods Pro 2',
    description:
      'Wireless earbuds with adaptive noise cancellation, spatial audio, and a compact charging case for premium everyday listening.',
    price: 249,
    image: resolveImagePath('AirPods Pro 2'),
    category: 'Accessories',
    rating: 4.8,
    stock: 26,
    featured: true,
  },
  {
    name: 'Logitech MX Master 3S',
    description:
      'Advanced ergonomic mouse with silent clicks, ultra-fast scrolling, and cross-computer control for a polished productivity experience.',
    price: 99,
    image: resolveImagePath('Logitech MX Master 3S'),
    category: 'Accessories',
    rating: 4.8,
    stock: 39,
    featured: false,
  },
  {
    name: 'Samsung Galaxy Watch',
    description:
      'Premium smartwatch with a sleek display, workout tracking, sleep analysis, and seamless phone integration on the go.',
    price: 279,
    image: resolveImagePath('Samsung Galaxy Watch'),
    category: 'Accessories',
    rating: 4.5,
    stock: 18,
    featured: false,
  },
  {
    name: 'Anker Power Bank',
    description:
      'Compact high-capacity portable charger with fast charging and multi-device support for power anywhere.',
    price: 59,
    image: resolveImagePath('Anker Power Bank'),
    category: 'Accessories',
    rating: 4.6,
    stock: 46,
    featured: false,
  },
  {
    name: 'Nike Air Max 270',
    description:
      'Iconic lifestyle sneaker with responsive cushioning, breathable mesh, and a bold silhouette designed for everyday comfort.',
    price: 160,
    image: resolveImagePath('Nike Air Max 270'),
    category: 'Shoes',
    rating: 4.7,
    stock: 24,
    featured: true,
  },
  {
    name: 'Adidas Ultraboost',
    description:
      'Performance running shoes featuring responsive Boost cushioning, Primeknit upper, and a sleek finish for premium daily wear.',
    price: 180,
    image: resolveImagePath('Adidas Ultraboost'),
    category: 'Shoes',
    rating: 4.8,
    stock: 29,
    featured: false,
  },
  {
    name: "Levi's 501 Jeans",
    description:
      'Classic straight-fit denim with durable construction, timeless style, and a premium finish for everyday wear.',
    price: 89,
    image: resolveImagePath("Levi's 501 Jeans"),
    category: 'Fashion',
    rating: 4.6,
    stock: 33,
    featured: false,
  },
  {
    name: 'Ray-Ban Sunglasses',
    description:
      'Premium polarized sunglasses with iconic styling, lightweight frames, and sharp UV protection for elevated everyday looks.',
    price: 159,
    image: resolveImagePath('Ray-Ban Sunglasses'),
    category: 'Fashion',
    rating: 4.7,
    stock: 27,
    featured: true,
  },
];

console.log(`Verified ${products.length} product image assignments from ${availableImages.length} local files.`);

const importData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await Product.insertMany(products);

    console.log('Products imported successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Error importing products: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();

    console.log('All products deleted successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Error deleting products: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv.includes('-d')) {
  destroyData();
} else {
  importData();
}
