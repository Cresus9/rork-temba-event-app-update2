export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    
    return date.toLocaleDateString('fr-FR', options);
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return 'Date invalide';
  }
};

export const formatTime = (timeString: string): string => {
  try {
    // Handle different time formats
    if (!timeString) return 'Heure invalide';
    
    // If it's already in HH:MM format
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const min = parseInt(minutes, 10);
      
      if (isNaN(hour) || isNaN(min)) {
        return 'Heure invalide';
      }
      
      return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    }
    
    // If it's a full datetime string, extract time
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
    
    return 'Heure invalide';
  } catch (error) {
    console.warn('Error formatting time:', timeString, error);
    return 'Heure invalide';
  }
};

export const getDayName = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Jour invalide';
    }
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  } catch (error) {
    console.warn('Error getting day name:', dateString, error);
    return 'Jour invalide';
  }
};

export const getMonthName = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Mois invalide';
    }
    return date.toLocaleDateString('fr-FR', { month: 'long' });
  } catch (error) {
    console.warn('Error getting month name:', dateString, error);
    return 'Mois invalide';
  }
};

export const getDayOfMonth = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '0';
    }
    return date.getDate().toString();
  } catch (error) {
    console.warn('Error getting day of month:', dateString, error);
    return '0';
  }
};