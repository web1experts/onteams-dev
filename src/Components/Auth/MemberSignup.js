import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { Link, useLocation, useParams  } from "react-router-dom";
import { getFieldRules, validateField } from "../../helpers/rules";
import { useSelector, useDispatch } from "react-redux";
import { authregister } from '../../redux/actions/auth.actions';
import {  emailValidation } from "../../utils/validations";
import { useToast } from "../../context/ToastContext";
import { getloggedInUser } from "../../helpers/auth";
import Invite from "../invite";
function MemberSignUp() {
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
    
    
    const [loader, setLoader] = useState(false)
    const dispatch = useDispatch();
    let fieldErrors = {};
    let hasError = false;

    let currentUser = getloggedInUser();
    const { token } = useParams();
    const apiResult = useSelector(state => state.auth);
    const check = [null, undefined, 'null', 'undefined', ''];
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const paramsObject = {};
    queryParams.forEach((value, key) => {
        paramsObject[key] = value;
    });

    const [ fields, setFields ] = useState({ email: paramsObject?.member_email, password: '', name: ''});
    const [ errors, setErrors ] = useState({ email:'', password: '', name: '' });



    const handleChange = ({ target: { name, value } }) => {
        setFields({ ...fields, [name]: value });
        setErrors({ ...errors, [name]: '' })
    };

    const showError = (name) => {
        if (errors[name]) return (<span className="error">{errors[name]}</span>)
        return null
    }

    useEffect(() => {
        if( apiResult.token ){
            currentUser = getloggedInUser();
        }

        if (apiResult.error || apiResult.success) {
            setLoader(false)
        }

    }, [apiResult])

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoader(true)
        const updatedErrorsPromises = Object.entries(fields).map(async ([fieldName, value]) => {
            // Get rules for the current field
            const rules = getFieldRules('member_signup', fieldName);
            // Validate the field
            const error = await validateField('member_signup', fieldName, value, rules);
            // If error exists, return it as part of the resolved promise
            return { fieldName, error };
        });
        
        // Wait for all promises to resolve
        const updatedErrorsArray = await Promise.all(updatedErrorsPromises);
       
        updatedErrorsArray.forEach(({ fieldName, error }) => {
            if (error) {
                fieldErrors[fieldName] = error;
            }
        });
        
        // Check if there are any errors
        const hasError = Object.keys(fieldErrors).length > 0;
        
          
        // If there are errors, update the errors state
        if (hasError) {
            setLoader(false)
            setErrors(fieldErrors);
        } else {
            
            const jsonPayload = {};
            for (const [key, value] of Object.entries(fields)) {
                jsonPayload[key] = value;
            }
            jsonPayload['token'] = token;
            await dispatch(authregister(jsonPayload))
            setLoader(false)
        }
      };



    return (
        <>
    { !currentUser ?
        
            <Container fluid className="h-100">
                <Row className="h-100">
                    <Col sm={12} lg={6} className="px-0 d-none d-lg-block">
                        <div className="login--image">
                            <img src="../images/login-bg.jpg" alt="..." />
                        </div>
                    </Col>
                    <Col sm={12} lg={6} className="px-0">
                        <div className="common--form">
                            <img className="logo--sm" src="../images/OnTeam-Logo.png" alt="MyTeams" />
                                <Form onSubmit={handleSubmit}> 
                                    <h2>Don't have an account? Sign Up</h2>
                                    <Form.Group className={`mb-3 form-group ${errors['email'] ? 'has-error' : ''}`}>
                                        <FloatingLabel label="Email address *">
                                            <Form.Control type="text" placeholder="Email address" name="email" value={fields.email} readonly disabled className={errors['email'] ? "input-error" : ''} />
                                        </FloatingLabel>
                                        {showError('email')}
                                    </Form.Group>
                                    <Form.Group className="mb-3 form-group">
                                        <FloatingLabel label="Your Name *">
                                            <Form.Control type="text" placeholder="Your Name" value={fields.name} className={errors['name'] ? "input-error" : ''} name="name" onChange={handleChange} />
                                        </FloatingLabel>
                                        {showError('name')}
                                    </Form.Group>
                                    <Form.Group className="mb-3 form-group">
                                        <FloatingLabel label="Password *">
                                            <Form.Control type="password" placeholder="Password" value={fields.password}  className={errors['password'] ? "input-error" : ''} name="password" onChange={handleChange} />
                                        </FloatingLabel>
                                        {showError('password')}
                                    </Form.Group>
                                    <Button variant="primary" type="submit" disabled={loader}>{loader ? 'Please Wait...' : 'Create Account'}</Button>
                                    <p><span>OR</span></p>
                                    <p>Already have an account. <Link to="/login">Login Here</Link></p>
                                </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        :
        <Invite />                    
    }
    </>
    
    );
}

export default MemberSignUp;