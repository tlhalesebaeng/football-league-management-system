import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_BASEURL,
    validateStatus: () => {
        return true; // resolve all responses
    },
    withCredentials: true,
});

export default api;
