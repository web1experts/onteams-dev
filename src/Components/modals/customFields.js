import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Form, Card, Badge, Row, Col } from 'react-bootstrap';
import {  FaRegTrashAlt,FaRegEdit } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { LuSettings } from "react-icons/lu";
import { createCustomField } from '../../redux/actions/customfield.action';
export const  CustomFieldModal =  (props) => {
  const dispatch = useDispatch()
  const commonState = useSelector( state => state.common)

  const typeLabelMap = {
  text: 'Text Field',
  email: 'Email',
  phone: 'Phone Number',
  textarea: 'Textarea',
  dropdown: 'Dropdown',
  badge: 'Badge',
  date: 'Date',
  password: 'Password',
  range: 'Range',
  checkbox: 'Checkbox',
  radio: 'Radio',
};

const typeColorMap = {
  text: 'primary',
  email: 'secondary',
  phone: 'info',
  textarea: 'warning',
  dropdown: 'success',
  badge: 'dark',
  date: 'light',
  password: 'danger',
  range: 'info',
  checkbox: 'secondary',
  radio: 'secondary',
};

  
  const FieldCard = ({ id, type, title, options }) => (
    <Card className="mb-3">
      <Card.Body>
        <Row className="align-items-center mb-2">
          <Col xs="auto">
            <Badge pill bg="light" text="dark">#{id}</Badge>
          </Col>
          <Col><h5 className="mb-0 fw-bold">{title}</h5></Col>
          <Col xs="auto">
            <Badge bg={typeColorMap[type] || 'secondary'}>
                {typeLabelMap[type] || type}
            </Badge>

          </Col>
        </Row>

        {['radio', 'checkbox', 'dropdown'].includes(type) && (
          <>
            <Badge bg="info" className="mb-2">{options.length} options</Badge>
            <Row className="mb-3">
              {options.map((opt, i) => (
                <Col key={i} className="mb-1">
                  <Form.Control value={opt} readOnly />
                </Col>
              ))}
            </Row>
          </>
        )}

        <Row>
          
          <Col xs="auto">
            <Button variant="outline-primary" className="me-2 border-0 p-0 text-info"><FaRegEdit /></Button>
            <Button variant="outline-danger" className="border-0 p-0"><FaRegTrashAlt /></Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  const [showInitialMessage, setShowInitialMessage] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showAddedFields, setShowAddedFields] = useState(true);
  const [fieldType, setFieldType] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [errors, setErrors] = useState({});
  const [customFields, setCustomFields] = useState([]);
  const [includeColumn, setIncludeColumn] = useState(false)
  const handleAddFieldClick = () => {
    setShowOptions(true);
    setShowInitialMessage(false);
    setShowAddedFields(false);
    setErrors({});
    setFieldName('');
    setFieldType('');
    setOptions([]);
  };

  function createSlug(fieldName) {
    return fieldName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')   // Remove special characters
        .replace(/\s+/g, '-')           // Replace spaces with dashes
        .replace(/-+/g, '-');           // Replace multiple dashes with one
    }

  const handleAddNewClick = async () => {
    const newErrors = {};
    if (!fieldName.trim()) newErrors.fieldName = 'Field name is required';
    if (!fieldType) newErrors.fieldType = 'Field type is required';
    if (['radio', 'checkbox', 'dropdown'].includes(fieldType) && options.length === 0) {
      newErrors.options = 'At least one option is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      name: createSlug(fieldName.trim()),
      label: fieldName.trim(),
      type: fieldType,
      options: ['radio', 'checkbox', 'dropdown'].includes(fieldType) ? options : [],
      showInTable: includeColumn,
      module: props.module
    };
    console.log('Payload:: ', payload)
    try {
      // dispatch action here
      setCustomFields([...customFields, payload]);
      await dispatch(createCustomField(payload));
      console.log('Submitting:', payload);

      setShowOptions(false);
      setShowAddedFields(true);
      setFieldName('');
      setFieldType('');
      setOptions([]);
      setNewOption('');
    } catch (err) {
      console.error('Failed to add custom field:', err);
    }
  };

  const handleCancelClick = () => {
    setShowOptions(false);
    setShowAddedFields(true);
    setErrors({});
  };

  const handleFieldTypeChange = (e) => {
    setFieldType(e.target.value);
    setOptions([]);
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index) => {
    const newOpts = options.filter((_, i) => i !== index);
    setOptions(newOpts);
  };

  const handleCheck = (e) => {
    const { name, checked } = e.target;
    setIncludeColumn( checked)
    };


  const shouldShowOptions = ['dropdown', 'badge', 'radio', 'checkbox'].includes(fieldType);

  return (
    <Modal show={true} onHide={props.toggle} centered size="lg" className="add--workflow--modal">
      <Modal.Header closeButton>
        <Modal.Title><LuSettings /> Custom Fields</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {showInitialMessage && (
          <div className='custom--field'>
            <h3>No custom fields added yet</h3>
            <p>Click "Add Field" to create custom fields for your project</p>
            <Button variant='primary' className='field--btn' onClick={handleAddFieldClick}>Add Field</Button>
          </div>
        )}

        {showOptions && (
          <div className='field--options'>
            <div className='add--new--field'>
              <h5>Add New Custom Field</h5>
              <Form>
                <Row>
                  <Col>
                    <Form.Group className="mb-3 col">
                      <Form.Label>Field Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name='field_name'
                        placeholder="Enter field name"
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                        isInvalid={!!errors.fieldName}
                      />
                      <Form.Control.Feedback type="invalid">{errors.fieldName}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3 col">
                      <Form.Label>Field Type *</Form.Label>
                      <Form.Select
                        value={fieldType}
                        name='field_type'
                        onChange={handleFieldTypeChange}
                        isInvalid={!!errors.fieldType}
                      >
                        <option value="">-- Select Type --</option>
                        <option value="text">Text Field</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone Number</option>
                        <option value="textarea">Textarea</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="badge">Badge</option>
                        <option value="date">Date</option>
                        <option value="password">Password</option>
                        <option value="range">Range</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="radio">Radio</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.fieldType}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {shouldShowOptions && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Options *</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="text"
                          placeholder="Add option..."
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                        />
                        <Button type="button" onClick={handleAddOption} style={{ marginLeft: '10px' }}>Add</Button>
                      </div>
                      {errors.options && <div className="text-danger mt-1">{errors.options}</div>}
                    </Form.Group>

                    <div className="mb-3 d-flex flex-wrap gap-2">
                      {options.map((opt, idx) => (
                        <div key={idx} style={{
                          backgroundColor: '#e0e7ff',
                          padding: '5px 10px',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <span style={{ marginRight: '10px', color: '#3730a3', fontWeight: 500 }}>{opt}</span>
                          <span style={{ cursor: 'pointer' }} onClick={() => removeOption(idx)}>×</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Row>
                  <Col>
                    <Form.Group controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Include in columns" name='include_column' onChange={handleCheck} />
                    </Form.Group>
                  </Col>
                  <Col className='text-end'>
                    <Button variant="secondary" type="button" onClick={handleCancelClick}>Cancel</Button>
                    <Button variant="info" type="button" className='add--new--btn ms-3' onClick={handleAddNewClick}>Add Field</Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        )}

        {showAddedFields && (
          <div className='added--fields'>
            <h4 className='d-flex align-items-center justify-content-between mb-4'>
              <Button variant='primary' className='field--btn' onClick={handleAddFieldClick}><FiPlus /> Add Field</Button>
            </h4>
            <h5>Added Custom Fields</h5>
            <div>
              {customFields.length === 0 ? (
                <p className="text-muted">No custom fields added yet.</p>
                ) : (
                customFields.map((field, index) => (
                    <FieldCard
                    key={index}
                    id={index + 1}
                    type={field.type}
                    title={field.name}
                    options={field.options}
                    />
                ))
                )}

            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}