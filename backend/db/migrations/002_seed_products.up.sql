-- Seed data for categories and products

-- Insert categories
INSERT INTO categories (id, name, slug, description, is_active, sort_order) VALUES
('cat-rings', 'انگشتر نقره', 'angoshtar-noghre', 'انواع انگشتر نقره با طرح‌های مختلف', true, 1),
('cat-necklaces', 'گردنبند نقره', 'gardanband-noghre', 'گردنبندهای زیبا و شیک نقره', true, 2),
('cat-bracelets', 'دستبند نقره', 'dastband-noghre', 'دستبندهای نقره برای خانم‌ها و آقایان', true, 3),
('cat-earrings', 'گوشواره نقره', 'gooshvareh-noghre', 'گوشواره‌های ظریف و زیبای نقره', true, 4);

-- Insert products for Rings
INSERT INTO products (id, sku, name, slug, description, weight_g, fineness, base_price_irr, premium_percent, use_live_price, stock_status, stock_count, category_id, is_active, is_featured) VALUES
('prod-001', 'RING-001', 'انگشتر نقره طرح سلطنتی', 'angoshtar-noghre-soltani', 'انگشتر نقره عیار 925 با طرح سلطنتی و نگین زیرکونیا. این انگشتر با ظرافت خاص و طراحی منحصر به فرد برای آقایان عزیز طراحی شده است.', 8.5, 925, 2500000, 15, true, 'IN_STOCK', 10, 'cat-rings', true, true),
('prod-002', 'RING-002', 'انگشتر نقره طرح مینیمال', 'angoshtar-noghre-minimal', 'انگشتر نقره ساده و شیک با طراحی مینیمال. مناسب برای استفاده روزمره و تمام مراسم.', 5.2, 925, 1800000, 10, true, 'IN_STOCK', 15, 'cat-rings', true, false),
('prod-003', 'NECK-001', 'گردنبند نقره طرح قلب', 'gardanband-noghre-ghalb', 'گردنبند نقره با آویز قلب ظریف و زنجیر باریک. مناسب برای هدیه دادن به عزیزان.', 6.8, 925, 3200000, 12, true, 'IN_STOCK', 8, 'cat-necklaces', true, true),
('prod-004', 'NECK-002', 'گردنبند نقره مروارید', 'gardanband-noghre-morvarid', 'گردنبند نقره ترکیبی با مروارید طبیعی. طراحی الگانت و خاص برای خانم‌های باسلیقه.', 9.2, 925, 4500000, 18, true, 'IN_STOCK', 5, 'cat-necklaces', true, false),
('prod-005', 'BRAC-001', 'دستبند نقره زنجیری', 'dastband-noghre-zanjiri', 'دستبند نقره با طراحی زنجیری کلاسیک. مناسب برای هم خانم‌ها و هم آقایان.', 7.5, 925, 2800000, 10, true, 'IN_STOCK', 12, 'cat-bracelets', true, true),
('prod-006', 'BRAC-002', 'دستبند نقره چرمی', 'dastband-noghre-charmi', 'دستبند ترکیبی چرم و نقره با طراحی مدرن. بیشتر مناسب برای آقایان.', 12.0, 925, 3500000, 15, true, 'IN_STOCK', 7, 'cat-bracelets', true, false),
('prod-007', 'EAR-001', 'گوشواره نقره حلقه‌ای', 'gooshvareh-noghre-halgheyi', 'گوشواره حلقه‌ای نقره با سایز متوسط. طراحی شیک و مدرن.', 4.5, 925, 2200000, 10, true, 'IN_STOCK', 10, 'cat-earrings', true, true),
('prod-008', 'EAR-002', 'گوشواره نقره آویزی', 'gooshvareh-noghre-avizi', 'گوشواره آویزی نقره با نگین‌های درخشان. مناسب برای مهمانی‌های شیک.', 5.8, 925, 2900000, 12, true, 'IN_STOCK', 6, 'cat-earrings', true, false);

-- Insert sample images for products
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary) VALUES
('img-001', 'prod-001', 'https://via.placeholder.com/600x600/C0C0C0/FFFFFF?text=Silver+Ring+Royal', 'انگشتر نقره سلطنتی', 0, true),
('img-002', 'prod-002', 'https://via.placeholder.com/600x600/C0C0C0/FFFFFF?text=Silver+Ring+Minimal', 'انگشتر نقره مینیمال', 0, true),
('img-003', 'prod-003', 'https://via.placeholder.com/600x600/C0C0C0/FFFFFF?text=Silver+Necklace+Heart', 'گردنبند نقره قلب', 0, true),
('img-004', 'prod-004', 'https://via.placeholder.com/600x600/C0C0C0/FFFFFF?text=Silver+Necklace+Pearl', 'گردنبند نقره مروارید', 0, true),
('img-005', 'prod-005', 'https://via.placeholder.com/600x600/C0C0C0/FFFFFF?text=Silver+Bracelet+Chain', 'دستبند نقره زنجیری', 0, true),
('img-006', 'prod-006', 'https://via.placeholder.com/600x600/C0C0C0/FFFFFF?text=Silver+Bracelet+Leather', 'دستبند نقره چرمی', 0, true),
('img-007', 'prod-007', 'https://via.placeholder.com/600x600/C0C0C0/FFFFFF?text=Silver+Earring+Hoop', 'گوشواره حلقه‌ای', 0, true),
('img-008', 'prod-008', 'https://via.placeholder.com/600x600/C0C0C0/FFFFFF?text=Silver+Earring+Drop', 'گوشواره آویزی', 0, true);
