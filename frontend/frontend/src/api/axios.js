import axios from "axios";

export const api = axios.create({
    //baseURL: 'http://localhost:4000/api',
    baseURL: 'http://159.54.142.179/api', 
    withCredentials: true
});

export default api;