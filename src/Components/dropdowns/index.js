import React, { useState } from 'react'
import { Container, Row, Col, Button, Modal, Form, FloatingLabel, ListGroup, Table, Badge, Accordion, Dropdown } from "react-bootstrap";
import { FaBold, FaChevronDown, FaItalic, FaPlus, FaList, FaRegTrashAlt, FaCheck, FaPlusCircle, FaTimes, FaUpload, FaCog, FaPlay, FaPause, FaEllipsisV, FaTrashAlt } from "react-icons/fa";
import { MdFileDownload, MdFilterList, MdOutlineClose, MdSearch } from "react-icons/md";
import { FiFileText } from "react-icons/fi";
import { GrAttachment } from "react-icons/gr";
import { BsCopy, BsShare, BsGrid } from "react-icons/bs";
export default function Dropdowns(props){
    const [search, setSearch] = useState('');

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    let filteredItems = []
    if(props.items && props.items.length > 0){
        filteredItems = props.items.filter(item => 
            item.label.toLowerCase().includes(search.toLowerCase())
      );
    }

    const renderItems = (items) => {
        return (
            <>
                {items.length > 0 &&
                    items.map((item, index) => (
                        <Dropdown.Item
                            key={`value-${item.value}`}
                            onClick={() => {
                                if (props.onchange) {
                                    props.onchange(item.value);
                                } else {
                                    return false;
                                }
                            }}
                            className={ props?.defaultValue === item.value ? 'selected--option':''}
                        >
                            {item.label}
                            {props?.defaultValue === item.value && <FaCheck /> }
                        </Dropdown.Item>
                    ))
                }
            </>
        );
    };
    
    return (
        <Dropdown className="select--dropdown">
            <Dropdown.Toggle variant="success">
                {filteredItems && filteredItems.length > 0 ? (
                    filteredItems.find(item => props.defaultValue === item.value)?.label || props.title
                ) : (
                    props.title
                )}
                
            </Dropdown.Toggle>
            <Dropdown.Menu>
            <div className="drop--scroll">
                {
                    props.hasSearch && 
                    <Form>
                        <Form.Group className="form-group mb-3">
                            <Form.Control type="text" placeholder="Search here.." value={search || ''}  onChange={handleSearchChange} />
                        </Form.Group>
                    </Form>
                }
                
                {
                    filteredItems && filteredItems.length > 0 &&
                    renderItems( filteredItems )
                }
                </div>
            </Dropdown.Menu>
        </Dropdown>
    )
}
