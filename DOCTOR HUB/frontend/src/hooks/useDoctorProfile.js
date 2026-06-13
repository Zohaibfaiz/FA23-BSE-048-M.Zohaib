import { useFetch } from './useFetch';
import api from '../utils/api';

export const useDoctorProfile = () => {
  const result = useFetch(async () => {
    const { data } = await api.get('/auth/me');
    return data.user?.doctorProfile || null;
  });

  return { doctor: result.data, ...result };
};
