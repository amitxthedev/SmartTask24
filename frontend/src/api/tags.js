import api from './axios'

export const getTags = () => api.get('/tags')
export const getTag = id => api.get(`/tags/${id}`)
export const createTag = data => api.post('/tags', data)
export const updateTag = (id, data) => api.put(`/tags/${id}`, data)
export const deleteTag = id => api.delete(`/tags/${id}`)
