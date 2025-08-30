import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseConfig } from "../utils/supabase";

// Utility function to generate consistent UUID-like strings for mock data
const generateMockUUID = (seed: string): string => {
  const seeds = {
    'mock_1': '272b2de6-f9b3-4340-9c67-d13650b6b229',
    'mock_2': '9bfa692d-ebee-438f-afa2-6e63b8ea7053', 
    'mock_3': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'mock_4': 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    'mock_5': 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    'mock_6': 'd4e5f6g7-h8i9-0123-defa-456789012345',
    'mock_7': 'e5f6g7h8-i9j0-1234-efab-567890123456',
    'mock_8': 'f6g7h8i9-j0k1-2345-fabc-678901234567'
  };
  return seeds[seed as keyof typeof seeds] || `${seed.replace('mock_', '')}-0000-0000-0000-000000000000`;
};

export type Comment = {
  id: string;
  listing_id: string;
  user_name: string;
  user_avatar?: string;
  comment_text: string;
  created_at: string;
};

// In-memory storage for comments (in development mode)
let mockComments: Comment[] = [
  {
    id: "comment_1",
    listing_id: generateMockUUID("mock_1"),
    user_name: "Ayşe",
    user_avatar: "https://i.pravatar.cc/40?u=ayse",
    comment_text: "Çok güzel! Bedeni nasıl?",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "comment_2",
    listing_id: generateMockUUID("mock_1"),
    user_name: "Mehmet",
    user_avatar: "https://i.pravatar.cc/40?u=mehmet",
    comment_text: "Kargo ücreti dahil mi?",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: "comment_3",
    listing_id: generateMockUUID("mock_2"),
    user_name: "Fatma",
    user_avatar: "https://i.pravatar.cc/40?u=fatma",
    comment_text: "Hangi mağazadan aldınız?",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
];

export const useComments = (listingId: string) => useQuery({
  queryKey: ["comments", listingId],
  queryFn: async () => {
    // Validate listingId - must be a valid UUID or mock format
    if (!listingId || listingId.trim() === '') {
      console.log('⚠️ Empty listingId provided to useComments');
      return [];
    }

    if (supabaseConfig.isPlaceholder) {
      // Return mock comments for development
      return mockComments.filter(comment => comment.listing_id === listingId);
    } else {
      // Real Supabase query - validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(listingId)) {
        console.error('❌ Invalid UUID format for listingId:', listingId);
        return [];
      }

      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }

      return data as Comment[];
    }
  },
  enabled: !!listingId && listingId.trim() !== '', // Only run query if listingId is valid
});

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, commentText, userName }: {
      listingId: string;
      commentText: string;
      userName: string;
    }) => {
      const newComment: Comment = {
        id: `comment_${Date.now()}`,
        listing_id: listingId,
        user_name: userName,
        user_avatar: `https://i.pravatar.cc/40?u=${userName}`,
        comment_text: commentText,
        created_at: new Date().toISOString(),
      };

      if (supabaseConfig.isPlaceholder) {
        // Add to mock storage
        mockComments.unshift(newComment);
        return newComment;
      } else {
        // Real Supabase insert - use null user_id for demo/anonymous comments
        const { data, error } = await supabase
          .from("comments")
          .insert([{
            listing_id: listingId,
            user_id: null, // Anonymous comments for demo
            user_name: userName,
            user_avatar: `https://i.pravatar.cc/40?u=${userName}`,
            comment_text: commentText,
          }])
          .select()
          .single();

        if (error) {
          console.error("Error adding comment:", error);
          throw error;
        }

        return data as Comment;
      }
    },
    onSuccess: (data, variables) => {
      // Update the comments cache
      queryClient.invalidateQueries({ queryKey: ["comments", variables.listingId] });
    },
  });
};

export const useCommentCount = (listingId: string) => useQuery({
  queryKey: ["commentCount", listingId],
  queryFn: async () => {
    // Validate listingId
    if (!listingId || listingId.trim() === '') {
      return 0;
    }

    if (supabaseConfig.isPlaceholder) {
      return mockComments.filter(comment => comment.listing_id === listingId).length;
    } else {
      // Real Supabase query - validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(listingId)) {
        console.error('❌ Invalid UUID format for comment count:', listingId);
        return 0;
      }

      const { count, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("listing_id", listingId);

      if (error) {
        console.error("Error fetching comment count:", error);
        throw error;
      }

      return count || 0;
    }
  },
  enabled: !!listingId && listingId.trim() !== '', // Only run query if listingId is valid
});
