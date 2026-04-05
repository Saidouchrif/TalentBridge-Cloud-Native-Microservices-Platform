import axios from 'axios';

const AI_URL = "http://localhost:5003";
const APP_URL = "http://localhost:5002";

export const generateAI = async (type, userData, jobDesc) => {
    const endpoint = type === 'cv' ? '/generate-cv' : '/generate-letter';
    const res = await axios.post(`${AI_URL}${endpoint}`, { userData, jobDesc });
    return res.data.text;
};

export const submitApplication = async (data) => {
    return await axios.post(`${APP_URL}/apply`, data);
};

export const updateStatus = async (id, status) => {
    return await axios.put(`${APP_URL}/status/${id}`, { status });
};