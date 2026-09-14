import supabase from "../supabase/index.js";

export const checkDatabaseHealth = async () => {
  try {
    // Simple query to check if database is accessible
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) throw error;

    return {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export const checkStorageHealth = async () => {
  try {
    // Check if storage bucket exists and is accessible
    const { data, error } = await supabase.storage.listBuckets();

    if (error) throw error;

    const uploadsBucket = data.find(bucket => bucket.id === 'uploads');

    return {
      status: uploadsBucket ? 'healthy' : 'bucket_missing',
      storage: uploadsBucket ? 'available' : 'bucket not found',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      storage: 'unavailable',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};