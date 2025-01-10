import React from "react";
import { decryptJsonData } from "./auth";
import CustomDropdown from "../Components/dropdowns/customdropdown";
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

const secretKey = process.env.REACT_APP_SECRET_KEY
const roots = new Map();
export function transformString(input) {
    const words = input.split(' ');
    let result = [];

    if (words.length === 1) {
        // Single word: show the first 2 letters
        result.push(words[0].substring(0, 2).toUpperCase());
    } else {
        // Multiple words: show the first characters of the first 2 words
        result.push(words[0][0].toUpperCase());
        result.push(words[1][0].toUpperCase());
    }

    return result.join('');
}

export function getroleinCompany(){
    try{
        const encryptedCompany = localStorage.getItem('current_dashboard');
        let currentCompanyId = '';
        let role = false ;
        let companies = []
        if(encryptedCompany && encryptedCompany !== ""){
        const decryptedCompany = decryptJsonData(encryptedCompany, secretKey);
        currentCompanyId = decryptedCompany.id
        }

        const encryptedCompanies = localStorage.getItem('dashboards');
        if(encryptedCompanies && encryptedCompanies.length > 1){
            companies = decryptJsonData(encryptedCompanies, secretKey);
            companies.forEach((companyobj, index) => {
                if( companyobj.company._id === currentCompanyId ){
                    role =  companyobj.role
                }
            })
        }
        return role;
    }catch( error ){
        return false
    }
}

export function parseIfValidJSON(jsonString) {
    try {
        const parsedData = JSON.parse(jsonString);
        return parsedData;
    } catch (error) {
        return false;
    }
}


export function checkifUserhasworkspace(){
    const encryptedCompanies = localStorage.getItem('mt_dashboards');
    const workspaces = parseIfValidJSON(encryptedCompanies);
    return workspaces;
}

export function getMemberdata(){
    const mt_featureSwitches = localStorage.getItem('mt_featureSwitches');
    const memberData = parseIfValidJSON(mt_featureSwitches);
    return memberData
}



export const roles =[
    { value: 'software-engineer', label: 'Software Engineer' },
    { value: 'web-designer', label: 'Web Designer' },
    { value: 'sr.web-designer', label: 'Sr. Web Designer' },
    { value: 'seo-manager', label: 'Seo Manager' },
    { value: 'seo-executive', label: 'Seo Executive' },
    { value: 'quality-analyst', label: 'Quality Analyst' },
    { value: 'project-manager', label: 'Project Manager' },
]

export const selectboxObserver = () => {
    const selects = document.querySelectorAll('select.custom-selectbox');
        selects.forEach(select => {
            renderCustomDropdown(select);

            // Create a MutationObserver to watch for changes to the options
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        // Re-render the custom dropdown when options change
                        renderCustomDropdown(select);
                    }
                });
            });

            observer.observe(select, {
                childList: true, // Watch for changes to the child elements
                subtree: true,  // Watch the entire subtree to catch changes to the options
                attributes: true // Watch for attribute changes (optional)
            });

            // Clean up observer on unmount
            return () => observer.disconnect();
        });
}

export const renderCustomDropdown = (select) => {
    const options = Array.from(select.options).map(option => ({
        value: option.value,
        label: option.text,
    }));
    const value = select.value;
    let container = select.nextElementSibling;
    if (!container || !container.classList.contains('custom-dropdown-container')) {
        container = document.createElement('div');
        container.classList.add('custom-dropdown-container');
        if( select.classList.contains('conditional-box')){
            container.classList.add('conditional-box');
        }
        select.parentNode.insertBefore(container, select.nextSibling);
    }

    if (!roots.has(container)) {
        const root = createRoot(container);
        roots.set(container, root);
    }

    const root = roots.get(container);

    root.render(
        <CustomDropdown
            items={options}
            value={value}
            extraClass={select.classList.contains('input-error') ? 'input-error' : ''}
            onChange={(newValue) => {
                select.value = newValue;
                const event = new Event('change', { bubbles: true });
                select.dispatchEvent(event);
            }}
        />
    );

    select.style.display = 'none';
};

// Cleanup function to restore the original select element
export const cleanupCustomDropdown = (select) => {
    const container = select.nextElementSibling;
    if (container && container.classList.contains('custom-dropdown-container')) {
        container.remove();
    }
    select.style.display = ''; // Restore original display style
};

export function parseDateWithoutTimezone(dateString) {
    if( dateString === "" || dateString === null || typeof dateString === "undefined"){
        return ''
    }
    const [year, month, day] = dateString.split('T')[0].split('-');
    return new Date(year, month - 1, day); // Month is zero-indexed
  }

  export const makeLinksClickable = (inputText) => {
    let replacedText;

    // Pattern for URLs starting with http://, https://, or ftp://
    const replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

    // Pattern for URLs starting with "www." (without // before it)
    const replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gi;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank" rel="noopener noreferrer">$2</a>');

    // Pattern for email addresses
    const replacePattern3 = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
};




export const sanitizeEmptyQuillValue = (value) => {
    const cleanValue = value.trim();
  
    // If the value is empty or just contains a single <p> or <strong> tag, return an empty string
    if (cleanValue === '<p><br></p>' || cleanValue === '<p></p>' || cleanValue === '<strong></strong>' || cleanValue === '<p><strong> </strong></p>' || cleanValue === '<h1><strong> </strong></h1>' || cleanValue === '<h1><br></h1>') {
      return '';
    }
  
    return cleanValue;
  };

  export const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

    const intervals = {
        year: 365 * 24 * 60 * 60,
        month: 30 * 24 * 60 * 60,
        day: 24 * 60 * 60,
        hour: 60 * 60,
        minute: 60,
        second: 1,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const timeElapsed = Math.floor(diffInSeconds / secondsInUnit);
        if (timeElapsed >= 1) {
            return `${timeElapsed} ${unit}${timeElapsed > 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
};

// Helper function to add suffix to the day (1st, 2nd, 3rd, etc.)
const getDayWithSuffix = (day) => {
    const j = day % 10,
          k = day % 100;
    if (j == 1 && k != 11) {
      return day + 'st';
    }
    if (j == 2 && k != 12) {
      return day + 'nd';
    }
    if (j == 3 && k != 13) {
      return day + 'rd';
    }
    return day + 'th';
  };
  
  // Helper function to format date like "16th October 2024"
  const formatDate = (date) => {
    const day = getDayWithSuffix(date.getDate());
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };
  
  // Helper function to format the time ago
  export const timeAgo = (dateString) => {
    const date = new Date(dateString);
  const now = new Date();
  
  // Calculate the difference in milliseconds
  const diff = now - date;
  
  // Calculate time differences
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours < 24) {
    return `${hours} hours ago`;
  } else {
    // If it's more than 24 hours, return the date in 'ddth Month YYYY' format
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    
    // Format the day with a suffix like 1st, 2nd, 3rd, etc.
    const suffix = (day) => {
      if (day > 3 && day < 21) return 'th'; // Suffix for 4-20
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${day}${suffix(day)} ${month} ${year}`;
  }
  };

  export const showAmPmtime = (timestamp) => {
    // Create a new Date object
    const date = typeof timestamp === "undefined" ? new Date() : new Date(timestamp);
  
    // Extract hours, minutes
    let hours = date.getHours();
    let minutes = date.getMinutes();
  
    // Adjust for 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 and 24 hours to 12 in 12-hour format
  
    // Format the time as HH:MM AM/PM
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  
    return formattedTime;
  };
  

  export function formatDateinString(dateString) {
    // Parse the input date string into a Date object
    const date = new Date(dateString);
  
    // Define arrays for day and month names
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
    // Extract day name, month name, day, and year
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
  
    // Return the formatted string
    return `${dayName}, ${monthName} ${day}, ${year}`;
  }

  // export function generateTimeRange(createdAt, duration) {
  //   // Create Date objects from createdAt and duration
  //   const startTime = new Date(createdAt);
  //   const endTime = new Date(duration);
  
  //   // Format the start and end times using local time zone
  //   const startTimeFormatted = startTime.toLocaleTimeString('en-US', {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: true // Ensures 12-hour format (e.g., 3:00pm)
  //   });
  
  //   const endTimeFormatted = endTime.toLocaleTimeString('en-US', {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: true // Ensures 12-hour format (e.g., 3:00pm)
  //   });
  
  //   // Return the formatted time range in the desired format
  //   return `${startTimeFormatted} - ${endTimeFormatted}`;
  // }

  export function generateTimeRange(createdAt, duration) {
    // Create a Date object from createdAt
    const startTime = new Date(createdAt);

    // Calculate the endTime by adding duration (in seconds) to the startTime
    const endTime = new Date(startTime.getTime() + duration * 1000); // Convert seconds to milliseconds

    // Format the start and end times using local time zone
    const startTimeFormatted = startTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true // Ensures 12-hour format (e.g., 3:00pm)
    });

    const endTimeFormatted = endTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true // Ensures 12-hour format (e.g., 3:00pm)
    });
    const totaltime = convertSecondstoTime(duration)
    // Return the formatted time range in the desired format
    return `${startTimeFormatted} - ${endTimeFormatted} (${totaltime})`;
}


export function secondstoMinutes(seconds) {
    if( seconds < 60 ){
        return `${seconds} secs`;
    }
    const totalMinutes = Math.round(seconds / 60); // Round total seconds to the nearest minute
    const hours = Math.floor(totalMinutes / 60); // Get whole hours
    const minutes = totalMinutes % 60; // Get remaining minutes
  
    if (hours > 0) {
      // Format for hours and minutes (e.g., "1:03 hrs")
      return `${hours}:${String(minutes).padStart(2, '0')} hrs`;
    } else {
      // Format for minutes only (e.g., "15 mins")
      return `${String(minutes).padStart(2, '0')} mins`;
    }
  }
  
  export function convertSecondstoTime(totalSeconds) { 
    if (totalSeconds === 0 || totalSeconds == null) {
        return `00:00`;
    } else if (totalSeconds < 60) {
        return `${totalSeconds} seconds`;
    }

    const hours = Math.floor(totalSeconds / 3600);
    const remainingSecondsAfterHours = totalSeconds % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const seconds = remainingSecondsAfterHours % 60;
    // Pad hours and minutes to ensure two-digit format
    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}`;
}
