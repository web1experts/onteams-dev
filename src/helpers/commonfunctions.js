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