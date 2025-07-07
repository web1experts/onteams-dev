import React, { useState, useEffect } from "react";
import {Button, Modal, Form, FloatingLabel, Card, ListGroup, Table } from "react-bootstrap";
import { FaRegSave, FaRegTrashAlt } from "react-icons/fa";
import { createClient, ListClients } from "../../redux/actions/client.action";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFieldRules, validateField } from '../../helpers/rules';
import { useToast } from "../../context/ToastContext";
import { renderDynamicField } from "../common/dynamicFields";


function AddClient(props) {

  const inputs = document.querySelectorAll('.form-floating .form-control');
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

const handleChange = (event, fieldname = '') => {
    const { name, value, type, files } = event.target;
    
      setRows({...rows, [name]: value});
      // Update the errors state with the updated array
      setErrors({...errors, [name]: ''});
    
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
            <Modal show={props.show} onHide={handleClose} centered size="md" className="add--member--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Add Client</Modal.Title>
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
                              value: rows[`custom_field[${field.name}]`] || '',
                              options: field?.options || [],
                              onChange: (e) => handleChange(e, field.name),
                              fieldId: `new-${field.name}-${index}`,
                              range_options: field?.range_options || {}
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
        </>
    );
}

export default AddClient;