import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

export const registerUser = (data: any) => {
  const form = new FormData();
  Object.keys(data).forEach(k => form.append(k, data[k]));
  return API.post('/users/register', form);
};

export const askText = (data: any) => {
  const form = new FormData();
  Object.keys(data).forEach(k => form.append(k, data[k]));
  return API.post('/ask/text', form);
};

export const askVoiceCharacter = (data: any) => {
  const form = new FormData();
  Object.keys(data).forEach(k => form.append(k, data[k]));
  return API.post('/ask/voice-character', form);
};

export const askImage = (data: any, imageFile: File) => {
  const form = new FormData();
  Object.keys(data).forEach(k => form.append(k, data[k]));
  form.append('image', imageFile);
  return API.post('/ask/image', form);
};

export const getProgress = (userId: number) =>
  API.get(`/progress/${userId}`);

export const getRecommendations = (userId: number) =>
  API.get(`/recommendations/${userId}`);

export const setParentSettings = (data: any) => {
  const form = new FormData();
  Object.keys(data).forEach(k => form.append(k, data[k]));
  return API.post('/parent/settings', form);
};

export const verifyParentPin = (data: any) => {
  const form = new FormData();
  Object.keys(data).forEach(k => form.append(k, data[k]));
  return API.post('/parent/verify', form);
};