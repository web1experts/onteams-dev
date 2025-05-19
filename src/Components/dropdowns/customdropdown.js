import React, { useState, useEffect } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';

const CustomDropdown = ({ items, value, extraClass, onChange }) => { 
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedValue, setSelectedValue] = useState(value);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSelect = (itemValue) => {
        setSelectedValue(itemValue);
        if (onChange) {
            onChange(itemValue);
        }
    };

    const filteredItems = items.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if( value ){
            setSelectedValue( value)
        }
    }, [ value ])

    return (
        <Dropdown className={`select--dropdown`}>
            <Dropdown.Toggle variant="success" className={`${extraClass}`} key={`success-selectkey-${Math.floor(Math.random() * 1001)}`}>
                {filteredItems.find(item => item.value === selectedValue)?.label || 'Select'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <div className="drop--scroll">
                    {
                        
                        <Form>
                            <Form.Group className="form-group mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Search here.."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </Form.Group>
                        </Form>
                    }
                    
                    {filteredItems.map((item, idx) => (
                        <Dropdown.Item
                            key={`${item.value}--${idx}`}
                            className={item.value === selectedValue ? 'selected--option' : ''}
                            onClick={() => handleSelect(item.value)}
                            href="#"
                        >
                            {item.label} {item.value === selectedValue && <FaCheck />}
                        </Dropdown.Item>
                    ))}
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default CustomDropdown;
