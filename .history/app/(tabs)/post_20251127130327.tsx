import { Picker } from '@react-native-picker/picker';
// Removed ImagePicker, axios, FileSystem imports
import { router } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import API from '../api';

// Define the initial shape of the form values
interface PostValues {
  name: string; 
  title: string;
  description: string;
  status: 'available' | 'sold'; 
  price: string;
  location: string;
  category: string; 
  imageLink: string | null; // Changed from imageUri to imageLink
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
    <View style={styles.container}>
      <Text style={styles.header}>Post Waste Item ♻️</Text>
      <Formik
        initialValues={initialValues}
        validationSchema={PostSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* Image Link Field (New Input) */}
            <Text style={styles.label}>Image Link (ImgBB/Direct URL) *</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('imageLink')}
              onBlur={handleBlur('imageLink')}
              value={values.imageLink}
              placeholder="Paste image URL here (e.g., from ImgBB)"
              keyboardType="url"
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
              style={styles.submitButton} 
              onPress={handleSubmit} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Post Item</Text>
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
    backgroundColor: '#f9f9f9',
    paddingTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#125e17',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  imageButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  submitButton: {
    backgroundColor: '#125e17',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
    marginBottom: 5,
  },
});