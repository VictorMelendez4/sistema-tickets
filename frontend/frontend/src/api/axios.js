import axios from "axios";

export const api = axios.create({
    
    baseURL: 'http://159.54.142.179/api', 
    withCredentials: true
});

export default api;