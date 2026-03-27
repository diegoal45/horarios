export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES');
};

export const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

export const handleError = (error) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    return error.message || 'Error desconocido';
};
