import axios from 'axios';
import { toast } from 'react-toastify';
const BASE_URL = process.env.REACT_APP_BASE_URL;
console.log(BASE_URL);

const PublicUrl = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Enable if using cookies
});

// Attach user token
PublicUrl.interceptors.request.use((config) => {
    const token = localStorage.getItem('user_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));


export default PublicUrl;