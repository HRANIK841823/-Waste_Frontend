import { Picker } from '@react-native-picker/picker';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import API from '../../api'; // Assuming API module is in '../api'

// Define the shape of the data expected from the fetch API (similar to SellProduct)
interface FetchedProduct {
    id: string;
    name: string;
    title: string;
    description: string;
    status: 'available' | 'sold';
    price: number; // Price is a number when fetched
    location: string;
    category: string;
    image: string | null;
}

// Define the shape of the form values
interface PostValues {
    name: string;
    title: string;
    description: string;
    status: 'available' | 'sold';
    price: string; // Price must be a string for TextInput
    location: string;
    category: string;
    imageLink: string | null;
}

// Category Choices matching your Django model
const CATEGORY_CHOICES = [
    'Furniture', 'Electronics', 'Clothing', 'Books', 
    'Home Decor', 'Toys', 'Appliances', 'Other'
];

// Re-use Validation Schema
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


export default function EditWasteItemScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // Get the item ID from the URL
    const itemId = typeof id === 'string' ? id : null;

    const [loading, setLoading] = useState(false);

    // 1. Fetch existing item data using useQuery
    const { data: productData, isLoading, isError, error, refetch } = useQuery<FetchedProduct>({
        queryKey: ["productDetail", itemId],
        queryFn: async () => {
            if (!itemId) throw new Error("Item ID is missing.");
            // Assuming API.getItem(id) fetches the specific product details
            // NOTE: The API function to fetch a single item details is assumed to be API.getItem(itemId).
            const response = await API.getItem(itemId); 
            return response.data;
        },
        enabled: !!itemId, // Only run query if itemId is available
    });

    // 2. Derive initial values from fetched data. This will trigger Formik reinitialization
    // when productData changes from undefined to the actual object (due to enableReinitialize=true).
    const initialValues: PostValues = {
        name: productData?.name || '',
        title: productData?.title || '',
        description: productData?.description || '',
        status: productData?.status || 'available',
        price: productData?.price?.toString() || '',
        location: productData?.location || '',
        category: productData?.category || 'Other',
        imageLink: productData?.image || null,
    };

    // --- Update Handler ---
    const handleUpdate = async (values: PostValues) => {
        if (!itemId) {
            Alert.alert('Error', 'Cannot update: Item ID not found.');
            return;
        }

        setLoading(true);

        try {
            // Prepare the data payload, converting price back to a number
            const payload = {
                name: values.name,
                title: values.title,
                description: values.description,
                status: values.status,
                price: parseFloat(values.price),
                location: values.location,
                category: values.category,
                image: values.imageLink, // Send the URL string
            };
            
            // Call the update API endpoint
            const response = await API.updateItem(itemId, payload); 

            console.log('Update successful:', response.data);
            Alert.alert('Success', 'Item updated successfully!');
            router.back(); 

        } catch (error: any) {
            console.error('Update failed:', error.response?.data || error.message || error);
            // Display detailed error from the server
            Alert.alert('Failed to update item: ' + (JSON.stringify(error.response?.data) || error.message || error));
        } finally {
            setLoading(false);
        }
    };
    
    // =======================================================
    // Conditional Rendering: Handle Loading and Errors first
    // =======================================================
    
    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#125e17" />
                <Text style={{ marginTop: 10, color: '#555' }}>Loading item data...</Text>
            </View>
        );
    }

    if (isError || !productData) { 
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>
                    {itemId ? 'Failed to load item details.' : 'Invalid Item ID provided.'}
                </Text>
                <Text style={styles.errorTextDetail}>{error?.message || (itemId ? "Check network connection or item existence." : "Item ID is null.")}</Text>
                <TouchableOpacity style={styles.reloadButton} onPress={() => refetch()}>
                    <Text style={styles.reloadText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }
    
    // =======================================================
    // Render Formik only when data is successfully loaded (productData is defined)
    // =======================================================
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.container}>
            <Text style={styles.header}>Edit Waste Item ✏️</Text>
            <Formik
                // Use initialValues derived from the successfully loaded productData
                initialValues={initialValues as PostValues}
                validationSchema={PostSchema}
                onSubmit={handleUpdate}
                // This ensures the form updates when initialValues change after fetch
                enableReinitialize={true} 
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        
                        {/* Image Link Field */}
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
                                <Text style={styles.submitButtonText}>Save Changes</Text>
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    errorTextDetail: {
        color: '#777',
        marginTop: 5,
        textAlign: 'center',
        paddingHorizontal: 20
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
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
        marginTop: 10,
        resizeMode: 'cover',
    },
    submitButton: {
        backgroundColor: '#047857', // Changed color for 'Save Changes' to match 'Details' button in history
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
    reloadButton: {
        marginTop: 20,
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    reloadText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});