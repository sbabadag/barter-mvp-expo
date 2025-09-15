import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AIRecognitionResult, formatAISuggestions } from '../services/aiRecognition';

interface AISuggestionsProps {
  isAnalyzing: boolean;
  aiResult?: AIRecognitionResult | null;
  onAcceptSuggestion: (field: 'title' | 'description' | 'category' | 'condition', value: string) => void;
  onAcceptAllSuggestions?: () => void;
  onRetryAnalysis: () => void;
  style?: any;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({
  isAnalyzing,
  aiResult,
  onAcceptSuggestion,
  onAcceptAllSuggestions,
  onRetryAnalysis,
  style
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  const toggleCard = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  if (isAnalyzing) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.analyzingCard}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.analyzingText}>🤖 AI görüntüyü analiz ediyor...</Text>
          <Text style={styles.analyzingSubtext}>Bu birkaç saniye sürebilir</Text>
        </View>
      </View>
    );
  }

  if (!aiResult) {
    return null;
  }

  const suggestions = formatAISuggestions(aiResult);
  const confidenceColor = suggestions.confidence > 80 ? '#28a745' : 
                         suggestions.confidence > 60 ? '#ffc107' : '#dc3545';

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="auto-awesome" size={24} color="#007AFF" />
          <Text style={styles.headerTitle}>AI Önerileri</Text>
          <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}>
            <Text style={styles.confidenceText}>{suggestions.confidence}%</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {onAcceptAllSuggestions && (
            <Pressable 
              onPress={onAcceptAllSuggestions} 
              style={styles.acceptAllButton}
            >
              <Text style={styles.acceptAllText}>Hepsini Kabul Et</Text>
            </Pressable>
          )}
          <Pressable onPress={onRetryAnalysis} style={styles.retryButton}>
            <MaterialIcons name="refresh" size={20} color="#007AFF" />
          </Pressable>
        </View>
      </View>

      {/* Title Suggestion */}
      <SuggestionCard
        icon="title"
        title="Başlık Önerisi"
        value={aiResult.suggestedTitle}
        isExpanded={expandedCards.has('title')}
        onToggle={() => toggleCard('title')}
        onAccept={() => onAcceptSuggestion('title', aiResult.suggestedTitle)}
      />

      {/* Description Suggestion */}
      <SuggestionCard
        icon="description"
        title="Açıklama Önerisi"
        value={aiResult.suggestedDescription}
        isExpanded={expandedCards.has('description')}
        onToggle={() => toggleCard('description')}
        onAccept={() => onAcceptSuggestion('description', aiResult.suggestedDescription)}
      />

      {/* Category Suggestion */}
      <SuggestionCard
        icon="category"
        title="Kategori Önerisi"
        value={aiResult.category}
        isExpanded={expandedCards.has('category')}
        onToggle={() => toggleCard('category')}
        onAccept={() => onAcceptSuggestion('category', aiResult.category)}
      />

      {/* Condition Suggestion */}
      {aiResult.condition && (
        <SuggestionCard
          icon="info"
          title="Durum Önerisi"
          value={getConditionText(aiResult.condition)}
          isExpanded={expandedCards.has('condition')}
          onToggle={() => toggleCard('condition')}
          onAccept={() => onAcceptSuggestion('condition', aiResult.condition!)}
        />
      )}

      {/* Detected Objects */}
      <View style={styles.detectedObjects}>
        <Text style={styles.detectedTitle}>🔍 Tespit Edilen Objeler:</Text>
        <View style={styles.objectTags}>
          {aiResult.detectedObjects.map((object, index) => (
            <View key={index} style={styles.objectTag}>
              <Text style={styles.objectText}>{object}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Price Suggestion */}
      {aiResult.estimatedPrice && (
        <View style={styles.priceCard}>
          <MaterialIcons name="attach-money" size={20} color="#28a745" />
          <Text style={styles.priceTitle}>Tahmini Fiyat Aralığı:</Text>
          <Text style={styles.priceText}>
            {aiResult.estimatedPrice.min}-{aiResult.estimatedPrice.max} {aiResult.estimatedPrice.currency}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

interface SuggestionCardProps {
  icon: string;
  title: string;
  value: string;
  isExpanded: boolean;
  onToggle: () => void;
  onAccept: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  icon,
  title,
  value,
  isExpanded,
  onToggle,
  onAccept
}) => {
  const maxLength = 40;
  const shouldTruncate = value.length > maxLength;
  const displayValue = shouldTruncate && !isExpanded 
    ? `${value.substring(0, maxLength)}...` 
    : value;

  return (
    <View style={styles.suggestionCard}>
      <Pressable onPress={onToggle} style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <MaterialIcons name={icon as any} size={18} color="#666" />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {shouldTruncate && (
          <MaterialIcons 
            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={20} 
            color="#666" 
          />
        )}
      </Pressable>
      
      <Text style={styles.cardValue}>{displayValue}</Text>
      
      <Pressable onPress={onAccept} style={styles.acceptButton}>
        <MaterialIcons name="check" size={16} color="#007AFF" />
        <Text style={styles.acceptText}>Kullan</Text>
      </Pressable>
    </View>
  );
};

const getConditionText = (condition: string): string => {
  const conditionMap: Record<string, string> = {
    'new': 'Sıfır',
    'like_new': 'Sıfır Ayarında',
    'good': 'İyi',
    'fair': 'Orta',
    'poor': 'Kötü'
  };
  return conditionMap[condition] || condition;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  analyzingCard: {
    alignItems: 'center',
    padding: 20,
  },
  analyzingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  retryButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  cardValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  acceptText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  detectedObjects: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detectedTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  objectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  objectTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  objectText: {
    fontSize: 12,
    color: '#666',
  },
  priceCard: {
    backgroundColor: '#f0fff4',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  priceTitle: {
    fontSize: 14,
    color: '#155724',
    marginLeft: 6,
    marginRight: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptAllButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  acceptAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AISuggestions;