import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import API from '../api'; // Import your configured API module

// Define the initial shape of the form values
interface PostValues {
  name: string;
  title: string;
  description: string;
  status: 'available' | 'pending' | 'sold';
  price: string;
  location: string;
  imageUri: string | null;
}

// Define the validation schema using Yup
const PostSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  title: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
  status: Yup.string().required('Required'),
  price: Yup.string()
    .required('Price is required')
    .test('is-positive-number', 'Must be a valid positive number', (value) => {
      if (!value) return false;
      const number = parseFloat(value);
      return !isNaN(number) && number > 0;
    }),
  location: Yup.string().required('Required'),
  imageUri: Yup.string().nullable().required('An image is required'),
});

// Helper to determine file type for FormData
const getMimeType = (uri: string) => {
    const uriParts = uri.split('.');
    const extension = uriParts[uriParts.length - 1];
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension.toLowerCase())) {
        return `image/${extension.toLowerCase() === 'jpg' ? 'jpeg' : extension.toLowerCase()}`;
    }
    return 'image/jpeg';
};


export default function PostWasteItemScreen() {
  const [loading, setLoading] = useState(false);

  const initialValues: PostValues = {
    name: '',
    title: '',
    description: '',
    status: 'available',
    price: '',
    location: '',
    imageUri: null,
  };

  // --- Image Picker Functionality ---
  const pickImage = async (setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFieldValue('imageUri', result.assets[0].uri);
    }
  };

  // --- Submission Handler ---
  const handleSubmit = async (values: PostValues) => {
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Append fields
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('status', values.status);
      // Ensure price is a stringified number for the backend
      formData.append('price', parseFloat(values.price).toFixed(2)); 
      formData.append('location', values.location);
      formData.append('seller_name', values.name); // Assuming 'seller_name' is the field for the name
      
      // Append image file
      const imageFile = {
        uri: values.imageUri,
        name: values.imageUri.split('/').pop(),
        type: getMimeType(values.imageUri),
      } as any; 
      
      formData.append('image', imageFile);
      
      // Use API.createItem which uses the base axios instance
      // Note: We MUST pass FormData directly, and let Django handle the data extraction.
      const response = await API.createItem(formData); 

      console.log('Post successful:', response.data);
      alert('Item posted successfully!');
      router.back(); 

    } catch (error: any) {
      console.error('Post failed:', error.response?.data || error.message);
      // Display detailed error from the server
      alert('Failed to post item: ' + (JSON.stringify(error.response?.data) || error.message));
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
            
            {/* Image Field */}
            <Text style={styles.label}>Image *</Text>
            {values.imageUri && (
              <Image source={{ uri: values.imageUri }} style={styles.imagePreview} />
            )}
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={() => pickImage(setFieldValue)}
              disabled={loading}
            >
              <Text style={styles.imageButtonText}>
                {values.imageUri ? 'Change Image' : 'Select Image'}
              </Text>
            </TouchableOpacity>
            {errors.imageUri && touched.imageUri && <Text style={styles.errorText}>{errors.imageUri}</Text>}
            
            {/* Name Field */}
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
              placeholder="e.g., 5.00"
              keyboardType="numeric"
            />
            {errors.price && touched.price && <Text style={styles.errorText}>Must be a valid positive number.</Text>}

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

            {/* Status Field (Picker) */}
            <Text style={styles.label}>Status *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={values.status}
                onValueChange={(itemValue) => setFieldValue('status', itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Available" value="available" />
                <Picker.Item label="Pending" value="pending" />
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

// --- Stylesheet (UNCHANGED) ---
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