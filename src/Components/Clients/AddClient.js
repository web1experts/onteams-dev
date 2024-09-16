import React, { useState, useEffect } from "react";
import {Button, Modal, Form, FloatingLabel, Card, ListGroup, Table } from "react-bootstrap";
import { FaRegSave, FaRegTrashAlt } from "react-icons/fa";
import { createClient, ListClients } from "../../redux/actions/client.action";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFieldRules, validateField } from '../../helpers/rules';
import { useToast } from "../../context/ToastContext";



function AddClient(props) {

  const inputs = document.querySelectorAll('.form-floating .form-control');

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
    const [rows, setRows] = useState([{ name: '' }]);
    const [errors, setErrors] = useState([]);
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
            
            setRows([{ name: '' }]);
            setErrors([]);
            props.toggleshow(false);
          });
        
    }

    useEffect(() => {

      if (apiResult.success) {
        handleClose()
        dispatch(ListClients());
      }
  
    }, [apiResult])

const handleChange = (index, event, fieldname = '') => {
    const { name, value, type, files } = event.target;
    const updatedRows = [...rows];

    
      updatedRows[index] = { ...updatedRows[index], [name]: value };
      setRows(updatedRows);
      const updatedErrors = [...errors]; 
      // Check if there is an error message for the specified field at the given index
      if (updatedErrors[index] && updatedErrors[index][name]) {
        // If an error message exists, update it to an empty string to remove the error
        updatedErrors[index][name] = '';
      }
      // Update the errors state with the updated array
      setErrors(updatedErrors);
    
  };



const showError = (index, name) => {
    if (errors[index] && errors[index][name]) return (<span className="error">{errors[index][name]}</span>);
    return null;
  };
  

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoader(true)
      const updatedErrorsPromises = rows.map(async (row) => {
        let rowError = {};
        for (const [fieldName, value] of Object.entries(row)) {
            // Get rules for the current field
            const rules = getFieldRules('clients', fieldName);
            // Validate the field
            const error = await validateField('clients', fieldName, value, rules);
            console.log('error:', error);
            // If error exists, store it in rowError
            if (error) {
                rowError = { ...rowError, [fieldName]: error };
            }
        }
        return rowError;
    });

    // Wait for all promises to resolve
    const updatedErrors = await Promise.all(updatedErrorsPromises);

    // Check if there are any errors
    const hasError = updatedErrors.some(rowError => Object.keys(rowError).length > 0);

    // If there are errors, update the errors state
    if (hasError) {
      setLoader(false);
      setErrors(updatedErrors);
    } else {
      
      const formData = new FormData();

      rows.forEach((row, index) => {
        formData.append(`clients[${index}][name]`, row.name);
      });
      
      await dispatch(createClient(formData))   
      setLoader(false);
    }

    
  }

  const addRow = () => {
    setRows([...rows, { name: '' }]);
    setErrors([...errors, { name: '' }]);
  };

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    const updatedErrors = errors.filter((_, i) => i !== index);
    setRows(updatedRows);
    setErrors(updatedErrors);
  };

    return (
        <>
            <Modal show={props.show} onHide={handleClose} centered size="md" className="add--member--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Add Client</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                    {rows.map((row, index) => (
                        <div key={`row-${index}`} className="form-row">
                            <Form.Group className="mb-0 form-group">
                                <FloatingLabel label="Client Name *">
                                    <Form.Control type="text" name="name" placeholder="Enter client name" className={errors[index] && errors[index]['name'] && errors[index]['name'] !== "" ? "input-error" : ''} onChange={(e) => handleChange(index, e)} />
                                </FloatingLabel>
                                {showError(index, 'name')}
                            </Form.Group>
                            {
                                rows.length > 1 && 
                                <Button onClick={() => removeRow(index)} variant="link"><FaRegTrashAlt /></Button>
                                
                            }
                         
                        </div>
                     ))} 
                        
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-primary" onClick={addRow}>Add More</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={loader}>{loader ? 'Please Wait...' : 'Save'}</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AddClient;