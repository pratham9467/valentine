import { supabase } from './supabase';
import { nanoid } from 'nanoid';

/**
 * Generate a unique shareable code
 */
export const generateUniqueCode = () => {
  return nanoid(10); // Generates a 10-character unique ID
};

/**
 * Upload images to Supabase Storage
 * @param {File[]} files - Array of image files
 * @param {string} uniqueCode - Unique code for this experience
 * @returns {Promise<string[]>} Array of public URLs
 */
export const uploadImages = async (files, uniqueCode) => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uniqueCode}/${index}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('valentine-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('valentine-images')
        .getPublicUrl(fileName);

      return publicData.publicUrl;
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

/**
 * Create a new Valentine experience
 * @param {Object} data - Experience data
 * @param {string} data.partnerName - Partner's name
 * @param {string} data.creatorName - Creator's name (optional)
 * @param {File[]} data.images - Array of image files
 * @returns {Promise<string>} Unique shareable code
 */
export const createExperience = async ({ partnerName, creatorName, images }) => {
  try {
    const uniqueCode = generateUniqueCode();
    
    // Upload images first
    const imageUrls = await uploadImages(images, uniqueCode);

    // Create database record
    const { data, error } = await supabase
      .from('valentine_experiences')
      .insert([
        {
          unique_code: uniqueCode,
          partner_name: partnerName,
          creator_name: creatorName || null,
          image_urls: imageUrls,
          view_count: 0
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return uniqueCode;
  } catch (error) {
    console.error('Error creating experience:', error);
    throw error;
  }
};

/**
 * Get experience by unique code
 * @param {string} uniqueCode - Unique code
 * @returns {Promise<Object>} Experience data
 */
export const getExperience = async (uniqueCode) => {
  try {
    const { data, error } = await supabase
      .from('valentine_experiences')
      .select('*')
      .eq('unique_code', uniqueCode)
      .single();

    if (error) throw error;

    // Increment view count
    await supabase
      .from('valentine_experiences')
      .update({ view_count: data.view_count + 1 })
      .eq('unique_code', uniqueCode);

    return data;
  } catch (error) {
    console.error('Error fetching experience:', error);
    throw error;
  }
};

/**
 * Check if unique code exists (for link validation)
 * @param {string} uniqueCode - Unique code to check
 * @returns {Promise<boolean>} True if exists
 */
export const checkCodeExists = async (uniqueCode) => {
  try {
    const { data, error } = await supabase
      .from('valentine_experiences')
      .select('id')
      .eq('unique_code', uniqueCode)
      .single();

    return !error && data !== null;
  } catch (error) {
    return false;
  }
};
