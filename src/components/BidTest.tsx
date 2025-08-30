import React, { useEffect } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useBidsForListing, createBid, useUserBids } from '../services/bids';

export default function BidTest() {
  const { bids, isLoading, error } = useBidsForListing('1');
  const { madeBids, receivedBids } = useUserBids();

  useEffect(() => {
    console.log('=== BID TEST COMPONENT ===');
    console.log('Bids for listing 1:', bids);
    console.log('Is loading:', isLoading);
    console.log('Error:', error);
    console.log('User made bids:', madeBids);
    console.log('User received bids:', receivedBids);
  }, [bids, isLoading, error, madeBids, receivedBids]);

  const testCreateBid = async () => {
    console.log('Testing create bid...');
    const result = await createBid('1', 350, 'Test bid message');
    console.log('Create bid result:', result);
    
    if (result.success) {
      Alert.alert('Success', 'Test bid created successfully!');
    } else {
      Alert.alert('Error', result.error || 'Failed to create test bid');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Bid System Test</Text>
      
      <Text>Bids for listing 1: {bids ? bids.length : 'none'}</Text>
      <Text>Loading: {isLoading ? 'yes' : 'no'}</Text>
      <Text>Error: {error || 'none'}</Text>
      <Text>Made bids: {madeBids.length}</Text>
      <Text>Received bids: {receivedBids.length}</Text>
      
      <Pressable
        style={{
          backgroundColor: '#00d4aa',
          padding: 16,
          borderRadius: 8,
          marginTop: 20,
        }}
        onPress={testCreateBid}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Test Create Bid</Text>
      </Pressable>
    </View>
  );
}
