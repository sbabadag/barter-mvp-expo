import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DropdownProps {
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  style?: any;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Seçiniz...',
  label,
  style
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsOpen(false);
  };

  const displayValue = selectedValue || placeholder;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Pressable 
        style={[styles.dropdown, isOpen && styles.dropdownOpen]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[
          styles.dropdownText,
          !selectedValue && styles.placeholderText
        ]}>
          {displayValue}
        </Text>
        <MaterialIcons 
          name={isOpen ? "arrow-drop-up" : "arrow-drop-down"} 
          size={24} 
          color="#666" 
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategori Seçin</Text>
              <Pressable 
                onPress={() => setIsOpen(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </Pressable>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.option,
                    selectedValue === item && styles.selectedOption
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedValue === item && styles.selectedOptionText
                  ]}>
                    {item}
                  </Text>
                  {selectedValue === item && (
                    <MaterialIcons name="check" size={20} color="#f0a500" />
                  )}
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  dropdownOpen: {
    borderColor: '#f0a500',
    shadowColor: '#f0a500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedOption: {
    backgroundColor: '#fff8f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#f0a500',
    fontWeight: '600',
  },
});

export default Dropdown;
