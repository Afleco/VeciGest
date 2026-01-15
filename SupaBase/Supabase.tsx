import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://miydedgtsebprdbryvon.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1peWRlZGd0c2VicHJkYnJ5dm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTExNzQsImV4cCI6MjA4MzQyNzE3NH0.TVPLvdqrHnJCnX5-2GdFsvXIRp0CWsVkQFwJMscIqIA'; // Pon la que empieza por eyJ...

// Definimos un almacenamiento que no rompa el servidor
const CustomStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        return Promise.resolve(window.localStorage.getItem(key));
      }
      return Promise.resolve(null);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: CustomStorage, // Usamos el almacenamiento personalizado
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});