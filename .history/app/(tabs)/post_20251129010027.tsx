import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import API from '../api';

// --- Professional Color Palette (Clean, Eco-friendly theme) ---
const BRAND_PRIMARY = '#1E88E5'; // Modern Blue for key actions/branding
const ECO_GREEN = '#4CAF50';     // Main action color for 'Post Item'
const BACKGROUND_GREY = '#F4F7F9'; // Light, modern background
const TEXT_COLOR = '#333333';
const TEXT_MUTED = '#888888';
const ERROR_RED = '#E53935'; 

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

// Category Choices
const CATEGORY_CHOICES = [
    'Furniture', 'Electronics', 'Clothing', 'Books', 
    'Home Decor', 'Toys', 'Appliances', 'Other'
];

// Validation Schema
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
      const payload = {
        name: values.name,
        title: values.title,
        description: values.description,
        status: values.status,
        price: parseFloat(values.price),
        location: values.location,
        category: values.category,
        image: values.imageLink,
      };
      
      const response = await API.createItem(payload); 

      console.log('Post successful:', response.data);
      alert('Item posted successfully!');
      router.back(); 

    } catch (error: any) {
      console.error('Post failed:', error.response?.data || error.message || error);
      alert('Failed to post item: ' + (JSON.stringify(error.response?.data) || error.message || error));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
    <View style={styles.container}>
      <Text style={styles.header}>List Your Reusable Item 🛒</Text>
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
            
            {/* Image Link Field */}
            <View style={styles.card}>
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
            </View>

            {/* Item Details Card */}
            <View style={styles.card}>
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
            </View>

            {/* Pricing & Logistics Card */}
            <View style={styles.card}>
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
                        <Picker.Item key={cat} label={cat} value={cat} color={TEXT_COLOR} />
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
                    <Picker.Item label="Available" value="available" color={TEXT_COLOR} />
                    <Picker.Item label="Sold" value="sold" color={TEXT_COLOR} />
                </Picker>
                </View>
                {errors.status && touched.status && <Text style={styles.errorText}>{errors.status}</Text>}
            </View>


            {/* Submission Button */}
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleSubmit} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Publish Listing</Text>
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

// --- High-End Professional Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_GREY, 
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_GREY,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '800', // Extra bold header
    color: BRAND_PRIMARY, 
    textAlign: 'center',
    paddingVertical: 15,
    marginBottom: 5,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12, // Rounded corners for card effect
    padding: 20,
    marginTop: 15,
    // Stronger shadow for professional elevation effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '700', // Bolder labels
    color: TEXT_COLOR,
    marginTop: 15, 
    marginBottom: 8,
  },
  input: {
    backgroundColor: BACKGROUND_GREY, // Input fields use a slightly different background
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: TEXT_COLOR,
  },
  textArea: {
    height: 120, 
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  pickerContainer: {
    backgroundColor: BACKGROUND_GREY,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 5,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  submitButton: {
    backgroundColor: ECO_GREEN, // High-visibility action color
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30, 
    // Powerful shadow for the main action button
    shadowColor: ECO_GREEN, 
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: TEXT_MUTED, 
    shadowOpacity: 0.1,
    elevation: 1,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '800', 
    fontSize: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase', 
  },
  errorText: {
    fontSize: 13,
    color: ERROR_RED,
    marginTop: 5,
    marginBottom: 5,
    fontWeight: '500',
  },
});