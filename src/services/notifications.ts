import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../state/AuthProvider';
import { useReceivedOffers } from './tekliflerim';

export interface NotificationCounts {
  pendingOffers: number;
  newMessages: number; // for future implementation
  total: number;
}

export const useNotificationCounts = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: receivedOffers } = useReceivedOffers();

  return useQuery({
    queryKey: ["notificationCounts", user?.id],
    queryFn: async (): Promise<NotificationCounts> => {
      if (!isAuthenticated || !user) {
        return { pendingOffers: 0, newMessages: 0, total: 0 };
      }

      // Count pending received offers (new bids on user's listings)
      const pendingOffers = receivedOffers?.filter(offer => 
        offer.status === 'pending' || offer.status === 'countered'
      ).length || 0;

      // Future: Add new messages count
      const newMessages = 0;

      const total = pendingOffers + newMessages;

      return {
        pendingOffers,
        newMessages,
        total
      };
    },
    enabled: isAuthenticated && !!user,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};
