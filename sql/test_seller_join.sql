-- Quick test to see seller relationship after script
SELECT 
  l.id,
  l.title,
  l.seller_name,
  l.seller_id,
  p.display_name,
  p.first_name,
  p.last_name,
  p.city
FROM public.listings l
LEFT JOIN public.profiles p ON l.seller_id = p.id
WHERE l.seller_id IS NOT NULL
LIMIT 3;
