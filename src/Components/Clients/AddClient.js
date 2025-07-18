import React, { useState, useEffect } from "react";
import {Button, Modal, Form, FloatingLabel, Card, ListGroup, Table } from "react-bootstrap";
import { FaRegSave, FaRegTrashAlt } from "react-icons/fa";
import { TbUsersPlus } from "react-icons/tb";
import { createClient, ListClients } from "../../redux/actions/client.action";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFieldRules, validateField } from '../../helpers/rules';
import { useToast } from "../../context/ToastContext";
import { renderDynamicField } from "../common/dynamicFields";
import { convertDDMMYYYYtoYYYYMMDD, formatDateToDDMMYYYY } from "../../helpers/commonfunctions";
import { BadgesModal } from "../modals/badges";

function AddClient(props) {

  const inputs = document.querySelectorAll('.form-floating .form-control');
  const [showBadges, setShowBadges] = useState(null);
  const customFields = props.customFields
  inputs.forEach(input => {
    input.addEventListener('input', function () {
      if (this.value) {
        this.classList.add('filled');
      } else {
        this.classList.remove('filled');
      }
    });

    // Initial check in case the input is pre-filled
    if (input.value) {
      input.classList.add('filled');
    }
  });
  
    const addToast = useToast();
    const [rows, setRows] = useState({ name: '' });
    const [errors, setErrors] = useState({});
    const [ fieldserrors, setFieldErrors ] = useState({ name: '' });
    const apiResult = useSelector(state => state.client);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [ disable, setDisable ] = useState(true);
    let fieldErrors = {};
    const [showPasswordFields, setShowPasswordFields] = useState({});
    let hasError = false;
    const [ loader, setLoader ] = useState(false);
    const [show, setShow] = useState(props.show ? props.show : false);
    const handleClose = () => {
        requestAnimationFrame(() => {
            
            setRows({ name: '' });
            setErrors({});
            props.toggleshow(false);
          });
        
    }

    useEffect(() => {

      if (apiResult.success) {
        handleClose()
        dispatch(ListClients());
      }
  
    }, [apiResult])

    const handleDateChange = (value, name) =>{ 
            setRows({ ...rows, [name]: formatDateToDDMMYYYY(value) });
            
            setErrors({ ...errors, [name]: '' })
        }

const handleChange = (event, fieldname = '') => {
  let finalValue;
    const { name, value, type, files, checked } = event.target;
    if (type === 'checkbox' && name.includes('[]')) {
        const arrayName = name.replace('[]', '');
        const existing = rows[arrayName] || [];
        if (checked) {
          finalValue = [...existing, value];
        } else {
          finalValue = existing.filter((v) => v !== value);
        }
        name = arrayName;
    } else if (type === 'checkbox') {
        // For single checkbox: store value when checked, empty string when unchecked
        finalValue = checked ? value : '';
    } else if (type === 'file') {
        finalValue = files;
    } else {
        finalValue = value;
    }
    
      setRows({...rows, [name]: finalValue});
      // Update the errors state with the updated array
      setErrors({...errors, [name]: ''});
    
  };
const toggleBadges = (fieldIndex) => {
        setShowBadges(fieldIndex);
    };

const toggleShowPassword = (fieldId) => {
  setShowPasswordFields((prev) => ({
    ...prev,
    [fieldId]: !prev[fieldId],
  }));
};


const showError = (name) => {
    if (errors && errors[name]) return (<span className="error">{errors[name]}</span>);
    return null;
  };
  

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoader(true)
      let updatedErrors = {};

        for (const [fieldName, value] of Object.entries(rows)) {
            // Get rules for the current field
            const rules = getFieldRules('clients', fieldName);

            // Validate the field
            const error = await validateField('clients', fieldName, value, rules);
            console.log('error:', error);

            // If error exists, store it
            if (error) {
                updatedErrors[fieldName] = error;
            }
        }

        // Check if there are any errors
        const hasError = Object.keys(updatedErrors).length > 0;


    // If there are errors, update the errors state
    if (hasError) {
      setLoader(false);
      setErrors(updatedErrors);
    } else {
      const formData = new FormData();

      Object.entries(rows).forEach(([fieldName, value]) => {
        if (Array.isArray(value)) { // Check if the value is an array
              if (value.length === 0) {
                  formData.append(`${fieldName}[]`, []); // Append an empty array
              } else {
                  value.forEach(item => {
                      formData.append(`${fieldName}[]`, item); // Append with the same key for non-empty arrays
                  });
              }
          } else if (typeof value === 'object') {
              formData.append(fieldName, JSON.stringify(value))
          }else{
            formData.append(`${fieldName}`, value);
          }
        
      });

      await dispatch(createClient(formData))   
      setLoader(false);
    }

    
  }

    return (
        <>
            <Modal show={props.show} onHide={handleClose} centered size="md" className="add--member--modal theme--modal">
                <Modal.Header closeButton>
                  <Modal.Title>
                    <span className="nav--item--icon"><TbUsersPlus /></span>
                    <strong>Add Client <small>Build your client list — add contacts and key details fast</small></strong>
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                    
                      <div key={`row-0`} className="form-row">
                          <Form.Group className="mb-0 form-group">
                              <FloatingLabel label="Client Name *">
                                  <Form.Control type="text" name="name" placeholder="Enter client name" className={errors['name'] && errors['name'] && errors['name'] !== "" ? "input-error" : ''} onChange={(e) => handleChange(e)} />
                              </FloatingLabel>
                              {showError('name')}
                          </Form.Group>
                      </div>
                     
                      {customFields.length > 0 &&
                          <>
                          <hr />
                              <ListGroup>
                                  <p className="m-0"> Other Fields</p>
                              </ListGroup>
                          
                          {customFields.map((field, index) =>
                              renderDynamicField({
                              name: `custom_field[${field.name}]`,
                              type: field.type,
                              label: field.label,
                              value: field.type === 'date' && rows[`custom_field[${field.name}]`]
                                                                                  ? convertDDMMYYYYtoYYYYMMDD(rows[`custom_field[${field.name}]`])
                                                                                  : rows[`custom_field[${field.name}]`] || '',
                              options: field?.options || [],
                              onChange: (e) => {
                                  if(field.type === "date"){
                                      
                                      handleDateChange(e, `custom_field[${field.name}]`)
                                  }else{
                                      handleChange(e)
                                  }
                              },
                              fieldId: `new-${field.name}-${index}`,
                              range_options: field?.range_options || {},
                              showPassword: showPasswordFields[`custom_field[${field.name}]`] || false,
                              toggleShowPassword: () => toggleShowPassword(`custom_field[${field.name}]`),
                              toggleBadges: () => toggleBadges(index),
                              })
                          )}
                          </>
                      }  
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSubmit} disabled={loader}>{loader ? 'Please Wait...' : 'Save'}</Button>
                </Modal.Footer>
            </Modal>
            {
                showBadges !== null && 
                    <BadgesModal badgesData={showBadges} toggleBadges={toggleBadges} handleSelect={handleChange} value={rows[`custom_field[${showBadges?.name}]`] || ''}/>
            }
        </>
    );
}

export default AddClient;