-- Mevcut teklifleri temizle ve gerçek teklif testine hazırlan
-- Bu script tüm mevcut bids'leri siler

-- Önce mevcut teklifleri göster
SELECT 
  b.id, 
  b.listing_id, 
  b.bidder_id, 
  b.amount, 
  b.status, 
  b.created_at,
  l.title as listing_title
FROM bids b 
LEFT JOIN listings l ON b.listing_id = l.id 
ORDER BY b.created_at DESC;

-- Tüm teklifleri sil
DELETE FROM bids;

-- Sonuç kontrolü
SELECT COUNT(*) as remaining_bids FROM bids;

-- Güncel ilanları kontrol et (tekliflerin silindiğini doğrulamak için)
SELECT 
  l.id, 
  l.title, 
  l.price, 
  l.created_at,
  l.seller_id,
  COUNT(b.id) as bid_count
FROM listings l 
LEFT JOIN bids b ON l.id = b.listing_id 
GROUP BY l.id, l.title, l.price, l.created_at, l.seller_id
ORDER BY l.created_at DESC 
LIMIT 10;
