import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useComments, useAddComment, Comment } from '../services/comments';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
}

export default function CommentsModal({ visible, onClose, listingId, listingTitle }: CommentsModalProps) {
  const [newComment, setNewComment] = useState('');
  const [userName] = useState('Kullanıcı' + Math.floor(Math.random() * 1000)); // In real app, get from auth
  
  const { data: comments, isLoading } = useComments(listingId);
  const addCommentMutation = useAddComment();

  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      Alert.alert('Hata', 'Lütfen bir yorum yazın');
      return;
    }

    addCommentMutation.mutate({
      listingId,
      commentText: newComment.trim(),
      userName,
    }, {
      onSuccess: () => {
        setNewComment('');
        Alert.alert('Başarılı', 'Yorumunuz eklendi!');
      },
      onError: (error) => {
        Alert.alert('Hata', 'Yorum eklenirken bir hata oluştu');
        console.error('Comment error:', error);
      },
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} dk önce`;
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`;
    } else {
      return `${diffDays} gün önce`;
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.user_avatar }} style={styles.avatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.userName}>{item.user_name}</Text>
          <Text style={styles.timeStamp}>{formatTime(item.created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{item.comment_text}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Yorumlar</Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.listingTitle} numberOfLines={2}>{listingTitle}</Text>

        {/* Comments List */}
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={styles.commentsList}
          contentContainerStyle={styles.commentsContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Henüz yorum yok</Text>
              <Text style={styles.emptySubtext}>İlk yorumu siz yapın!</Text>
            </View>
          }
        />

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Yorumunuzu yazın..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <Pressable 
            style={[styles.sendButton, { opacity: newComment.trim() ? 1 : 0.5 }]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || addCommentMutation.isPending}
          >
            <Text style={styles.sendButtonText}>
              {addCommentMutation.isPending ? '...' : 'Gönder'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  listingTitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  timeStamp: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#00d4aa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
