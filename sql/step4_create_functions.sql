-- Step 4: Create functions and triggers (run this after step 3)

CREATE OR REPLACE FUNCTION update_user_rating_stats(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
    seller_stats RECORD;
    buyer_stats RECORD;
BEGIN
    -- Calculate seller statistics
    SELECT 
        COALESCE(AVG(rating), 0)::DECIMAL(3,2) as avg_rating,
        COUNT(*)::INTEGER as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END)::INTEGER as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END)::INTEGER as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END)::INTEGER as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END)::INTEGER as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END)::INTEGER as one_star,
        COALESCE(AVG(communication_rating), 0)::DECIMAL(3,2) as avg_comm,
        COALESCE(AVG(item_condition_rating), 0)::DECIMAL(3,2) as avg_condition,
        COALESCE(AVG(delivery_rating), 0)::DECIMAL(3,2) as avg_delivery
    INTO seller_stats
    FROM public.ratings 
    WHERE reviewed_user_id = target_user_id AND transaction_type = 'seller';
    
    -- Calculate buyer statistics
    SELECT 
        COALESCE(AVG(rating), 0)::DECIMAL(3,2) as avg_rating,
        COUNT(*)::INTEGER as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END)::INTEGER as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END)::INTEGER as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END)::INTEGER as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END)::INTEGER as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END)::INTEGER as one_star
    INTO buyer_stats
    FROM public.ratings 
    WHERE reviewed_user_id = target_user_id AND transaction_type = 'buyer';
    
    -- Insert or update statistics
    INSERT INTO public.user_rating_stats (
        user_id,
        average_rating,
        total_reviews,
        seller_average_rating,
        seller_total_reviews,
        seller_5_star,
        seller_4_star,
        seller_3_star,
        seller_2_star,
        seller_1_star,
        buyer_average_rating,
        buyer_total_reviews,
        buyer_5_star,
        buyer_4_star,
        buyer_3_star,
        buyer_2_star,
        buyer_1_star,
        avg_communication,
        avg_item_condition,
        avg_delivery,
        last_updated
    ) VALUES (
        target_user_id,
        COALESCE((seller_stats.avg_rating * seller_stats.total_reviews + buyer_stats.avg_rating * buyer_stats.total_reviews) / NULLIF(seller_stats.total_reviews + buyer_stats.total_reviews, 0), 0),
        seller_stats.total_reviews + buyer_stats.total_reviews,
        seller_stats.avg_rating,
        seller_stats.total_reviews,
        seller_stats.five_star,
        seller_stats.four_star,
        seller_stats.three_star,
        seller_stats.two_star,
        seller_stats.one_star,
        buyer_stats.avg_rating,
        buyer_stats.total_reviews,
        buyer_stats.five_star,
        buyer_stats.four_star,
        buyer_stats.three_star,
        buyer_stats.two_star,
        buyer_stats.one_star,
        seller_stats.avg_comm,
        seller_stats.avg_condition,
        seller_stats.avg_delivery,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        average_rating = EXCLUDED.average_rating,
        total_reviews = EXCLUDED.total_reviews,
        seller_average_rating = EXCLUDED.seller_average_rating,
        seller_total_reviews = EXCLUDED.seller_total_reviews,
        seller_5_star = EXCLUDED.seller_5_star,
        seller_4_star = EXCLUDED.seller_4_star,
        seller_3_star = EXCLUDED.seller_3_star,
        seller_2_star = EXCLUDED.seller_2_star,
        seller_1_star = EXCLUDED.seller_1_star,
        buyer_average_rating = EXCLUDED.buyer_average_rating,
        buyer_total_reviews = EXCLUDED.buyer_total_reviews,
        buyer_5_star = EXCLUDED.buyer_5_star,
        buyer_4_star = EXCLUDED.buyer_4_star,
        buyer_3_star = EXCLUDED.buyer_3_star,
        buyer_2_star = EXCLUDED.buyer_2_star,
        buyer_1_star = EXCLUDED.buyer_1_star,
        avg_communication = EXCLUDED.avg_communication,
        avg_item_condition = EXCLUDED.avg_item_condition,
        avg_delivery = EXCLUDED.avg_delivery,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION trigger_update_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_user_rating_stats(COALESCE(NEW.reviewed_user_id, OLD.reviewed_user_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ratings_update_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.ratings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_rating_stats();

SELECT 'Step 4 completed: Functions and triggers created' as result;
