import { Picker } from '@react-native-picker/picker';
// Removed ImagePicker, axios, FileSystem imports
import { router } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import API from '../api'; // Assuming you have an API module defined

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

// Validation Schema using Yup
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
  imageLink: Yup.string().url('Must be a valid URL').required('Image link is required'), // Validates it's a URL
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
      // NOTE: API.createItem must be implemented in '../api'
      const response = await API.createItem(payload); 

      console.log('Post successful:', response.data);
      // NOTE: Changed alert() to a placeholder for a custom notification 
      // as alert() is discouraged in professional apps.
      // In a real app, replace with a Toast or custom modal.
      console.log('Item posted successfully!'); 
      router.back(); 

    } catch (error: any) {
      console.error('Post failed:', error.response?.data || error.message || error);
      console.log('Failed to post item: ' + (JSON.stringify(error.response?.data) || error.message || error));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
    <View style={styles.innerContainer}>
      <Text style={styles.header}>Post New Listing 🌿</Text>
      <Formik
        initialValues={initialValues}
        validationSchema={PostSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            
            {/* Image Link Field */}
            <Text style={styles.label}>Image Link (Direct URL) *</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('imageLink')}
              onBlur={handleBlur('imageLink')}
              value={values.imageLink}
              placeholder="Paste image URL here (e.g., from ImgBB)"
              keyboardType="url"
              autoCapitalize="none"
            />
            {errors.imageLink && touched.imageLink && <Text style={styles.errorText}>{errors.imageLink}</Text>}

            {/* Image Preview (Optional) */}
            {values.imageLink && !errors.imageLink && (
              <Image 
                source={{ uri: values.imageLink }} 
                style={styles.imagePreview} 
                onError={() => console.log('Image failed to load')}
              />
            )}
            
            {/* Seller Name Field */}
            <Text style={styles.label}>Seller Name *</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
              placeholder="Your Name"
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
              multiline
              numberOfLines={4}
            />
            {errors.description && touched.description && <Text style={styles.errorText}>{errors.description}</Text>}

            {/* Price Field */}
            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('price')}
              onBlur={handleBlur('price')}
              value={values.price}
              placeholder="e.g., 5.00 (Enter 0 for Free)"
              keyboardType="numeric"
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
            />
            {errors.location && touched.location && <Text style={styles.errorText}>{errors.location}</Text>}
            
            {/* Category Field (Picker) */}
            <Text style={styles.label}>Category *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={values.category}
                onValueChange={(itemValue) => setFieldValue('category', itemValue)}
                style={styles.picker}
              >
                {CATEGORY_CHOICES.map(cat => (
                    <Picker.Item key={cat} label={cat} value={cat} />
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
              >
                <Picker.Item label="Available" value="available" />
                <Picker.Item label="Sold" value="sold" />
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
                <Text style={styles.submitButtonText}>Post Listing</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 50 }} />
          </ScrollView>
        )}
      </Formik>
    </View>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Softer background for the whole screen
  },
  innerContainer: {
    flex: 1,
    paddingTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#047857', // Darker, professional green
    textAlign: 'center',
    marginBottom: 25,
    paddingVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 18,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0', // Light gray border
    borderRadius: 10, // More rounded
    padding: 14,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 120, // Slightly taller
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 15,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#047857', // Primary dark green
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#10b981', // Lighter green when disabled
    opacity: 0.8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444', // Tailwind red-500
    marginTop: 5,
  },
});