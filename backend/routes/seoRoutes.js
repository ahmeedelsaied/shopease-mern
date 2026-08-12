import express from 'express';
import { getRobots, getSitemap } from '../controllers/seoController.js';

/**
 * Public SEO infrastructure routes.
 *
 * Mounted under `/api` in server.js so the endpoints live at
 * `/api/sitemap.xml` and `/api/robots.txt`. They are intentionally public —
 * crawlers must reach them without authentication — so no `protect`/`admin`
 * middleware is attached here.
 *
 * The frontend dev server proxies the storefront root paths (`/sitemap.xml`,
 * `/robots.txt`) onto these endpoints so a single backend-generated copy is
 * served from both origins.
 */
const router = express.Router();

router.get('/sitemap.xml', getSitemap);
router.get('/robots.txt', getRobots);

export default router;
