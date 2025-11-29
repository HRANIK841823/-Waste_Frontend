import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import API from '../api';

// --- Color Palette Variables for easy modification ---
const PRIMARY_COLOR = '#007BFF'; // A professional, clean blue
const SECONDARY_COLOR = '#28A745'; // A clean, positive green for 'Post' action
const BACKGROUND_LIGHT = '#F8F9FA'; // Very light grey background
const BORDER_COLOR = '#CED4DA'; // Light border color
const TEXT_DARK = '#212529'; // Dark text color
const TEXT_MUTED = '#6C757D'; // Placeholder/Hint text color
const ERROR_COLOR = '#DC3545'; // Standard red for errors

// Define the initial shape of the form values
interface PostValues {
  name: string; 
  title: string;
  description: string;
  status: 'available' | 'sold'; 
  price: string;
  location: string;
  category: string; 
  imageLink: string | null;
}

// Category Choices matching your Django model
const CATEGORY_CHOICES = [
    'Furniture', 'Electronics', 'Clothing', 'Books', 
    'Home Decor', 'Toys', 'Appliances', 'Other'
];

// Corrected Validation Schema
const PostSchema = Yup.object().shape({
  name: Yup.string().required('Seller Name is required'),
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  status: Yup.string().required('Status is required'),
  price: Yup.string()
    .required('Price is required')
    .test('is-positive-number', 'Must be a valid positive number or zero', (value) => {
      if (!value) return false;
      const number = parseFloat(value);
      // Allows zero or any positive number
      return !isNaN(number) && number >= 0; 
    }),
  location: Yup.string().required('Location is required'),
  category: Yup.string().required('Category is required'),
  imageLink: Yup.string().url('Must be a valid URL').required('Image link is required'),
});


export default function PostWasteItemScreen() {
  const [loading, setLoading] = useState(false);

  const initialValues: PostValues = {
    name: '',
    title: '',
    description: '',
    status: 'available',
    price: '',
    location: '',
    category: 'Other',
    imageLink: null,
  };

  // --- Submission Handler ---
  const handleSubmit = async (values: PostValues) => {
    setLoading(true);

    try {
      
      // Prepare the data payload for Django (JSON format)
      const payload = {
        name: values.name,
        title: values.title,
        description: values.description,
        status: values.status,
        price: parseFloat(values.price),
        location: values.location,
        category: values.category,
        image: values.imageLink, // Send the URL string directly
      };
      
      // Post the data to Django using your API module
      const response = await API.createItem(payload); 

      console.log('Post successful:', response.data);
      alert('Item posted successfully!');
      router.back(); 

    } catch (error: any) {
      console.error('Post failed:', error.response?.data || error.message || error);
      // Display detailed error from the server
      alert('Failed to post item: ' + (JSON.stringify(error.response?.data) || error.message || error));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
    <View style={styles.container}>
      <Text style={styles.header}>Post Reusable Item 🚀</Text>
      <Formik
        initialValues={initialValues}
        validationSchema={PostSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            
            {/* Image Link Field (New Input) */}
            <Text style={styles.label}>Image Link (Direct URL) *</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('imageLink')}
              onBlur={handleBlur('imageLink')}
              value={values.imageLink}
              placeholder="Paste image URL here"
              keyboardType="url"
              placeholderTextColor={TEXT_MUTED}
            />
            {errors.imageLink && touched.imageLink && <Text style={styles.errorText}>{errors.imageLink}</Text>}

            {/* Image Preview (Optional) */}
            {values.imageLink && !errors.imageLink && (
              <Image source={{ uri: values.imageLink }} style={styles.imagePreview} />
            )}
            
            {/* Seller Name Field */}
            <Text style={styles.label}>Seller Name *</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
              placeholder="Your Name"
              placeholderTextColor={TEXT_MUTED}
            />
            {errors.name && touched.name && <Text style={styles.errorText}>{errors.name}</Text>}
            
            {/* Title Field */}
            <Text style={styles.label}>Item Title *</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              value={values.title}
              placeholder="e.g., Used Cardboard Boxes (10kg)"
              placeholderTextColor={TEXT_MUTED}
            />
            {errors.title && touched.title && <Text style={styles.errorText}>{errors.title}</Text>}

            {/* Description Field */}
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              onChangeText={handleChange('description')}
              onBlur={handleBlur('description')}
              value={values.description}
              placeholder="Detail the item's condition and quantity"
              placeholderTextColor={TEXT_MUTED}
              multiline
              numberOfLines={4}
            />
            {errors.description && touched.description && <Text style={styles.errorText}>{errors.description}</Text>}

            {/* Price Field */}
            <Text style={styles.label}>Price (USD) *</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('price')}
              onBlur={handleBlur('price')}
              value={values.price}
              placeholder="e.g., 5.00 (Enter 0 for Free)"
              keyboardType="numeric"
              placeholderTextColor={TEXT_MUTED}
            />
            {errors.price && touched.price && <Text style={styles.errorText}>Must be a valid positive number or zero.</Text>}

            {/* Location Field */}
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('location')}
              onBlur={handleBlur('location')}
              value={values.location}
              placeholder="City, Neighborhood, or specific pickup area"
              placeholderTextColor={TEXT_MUTED}
            />
            {errors.location && touched.location && <Text style={styles.errorText}>{errors.location}</Text>}
            
            {/* Category Field (Picker) */}
            <Text style={styles.label}>Category *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={values.category}
                onValueChange={(itemValue) => setFieldValue('category', itemValue)}
                style={styles.picker}
                mode="dropdown"
              >
                {CATEGORY_CHOICES.map(cat => (
                    <Picker.Item key={cat} label={cat} value={cat} color={TEXT_DARK} />
                ))}
              </Picker>
            </View>
            {errors.category && touched.category && <Text style={styles.errorText}>{errors.category}</Text>}


            {/* Status Field (Picker) */}
            <Text style={styles.label}>Status *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={values.status}
                onValueChange={(itemValue) => setFieldValue('status', itemValue)}
                style={styles.picker}
                mode="dropdown"
              >
                <Picker.Item label="Available" value="available" color={TEXT_DARK} />
                <Picker.Item label="Sold" value="sold" color={TEXT_DARK} />
              </Picker>
            </View>
            {errors.status && touched.status && <Text style={styles.errorText}>{errors.status}</Text>}

            {/* Submission Button */}
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleSubmit} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Post Item</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </Formik>
    </View>
    </SafeAreaView>
  );
}

// --- Professional Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT, // Consistent background color
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '700', // Bolder header
    color: PRIMARY_COLOR, // Using the primary color for brand identity
    textAlign: 'center',
    paddingVertical: 15,
    marginBottom: 10,
    backgroundColor: '#fff', // White background for the header area
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
    marginTop: 20, // Increased margin for better spacing between fields
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: TEXT_DARK,
    shadowColor: '#000', // Subtle shadow for depth
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  textArea: {
    height: 120, // Slightly taller text area
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowColor: '#000', // Subtle shadow for depth
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 6,
    marginTop: 15,
    marginBottom: 5,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  submitButton: {
    backgroundColor: SECONDARY_COLOR, // Clean green action color
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 40, // More vertical space before the button
    // Stronger shadow for a primary action button
    shadowColor: SECONDARY_COLOR, 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: TEXT_MUTED, // Gray out when disabled/loading
    shadowOpacity: 0.1,
    elevation: 1,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700', // Stronger button text
    fontSize: 18,
    textTransform: 'uppercase', // Professional touch
  },
  errorText: {
    fontSize: 13,
    color: ERROR_COLOR,
    marginTop: 5,
    marginBottom: 5,
    fontWeight: '500',
  },
});