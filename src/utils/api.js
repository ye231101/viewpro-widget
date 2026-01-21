import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from './constants';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-type': 'application/json',
  },
});

api.interceptors.request.use(
  async (request) => {
    return request;
  },
  (error) => {
    toast.error(error.response?.data?.message || error.message || 'Something went wrong');
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code === 200) {
      if (data.message && data.message !== 'Success') {
        toast.success(data.message);
      }
      return Promise.resolve(data);
    } else {
      toast.error(data.message);
      return Promise.reject(new Error(data.message));
    }
  },
  async (error) => {
    toast.error(error.response?.data?.message || error.message || 'Something went wrong');
    return Promise.reject(error);
  }
);
