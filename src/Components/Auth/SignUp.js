import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { Link } from "react-router-dom";
import { getFieldRules, validateField } from "../../helpers/rules";
import { useSelector, useDispatch } from "react-redux";
import { authregister, requestOtp, verifyOtp, requestEmailVerification } from '../../redux/actions/auth.actions';
import {  emailValidation } from "../../utils/validations";
import { useToast } from "../../context/ToastContext";
import Alert from 'react-bootstrap/Alert';
function SignUpPage() {
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
    const [fields, setFields] = useState({ email: '' });
    const [errors, setErrors] = useState({ email: '' });
    const [loader, setLoader] = useState(false)
    const dispatch = useDispatch();
    let fieldErrors = {};
    const [ msgalert, setMsgalert ] = useState('')
    const apiResult = useSelector(state => state.auth);
    const [showOTP, setShowOtp] = useState(false);
    
    const [resendMail , setResendmail ]= useState( false )
    const [resendLoader, setResendLoader] = useState(false);
    const check = [null, undefined, 'null', 'undefined', ''];
    const handleRequestAgain = async () => {
        setResendLoader(true);
        if (check.includes(fields['email']) || !emailValidation(fields['email'])) {
            setResendLoader(false);
        } else {
            await dispatch(requestEmailVerification({ email: fields['email'] })); 
            setResendLoader(false);
        }
    };

    const handleChange = ({ target: { name, value } }) => {
        setFields({ ...fields, [name]: value });
        setErrors({ ...errors, [name]: '' })
    };

    const showError = (name) => {
        if (errors[name]) return (<span className="error">{errors[name]}</span>)
        return null
    }

    useEffect(() => {

        // if (apiResult.error || apiResult.success) {
        //     //setResendLoader(false); 
        // }

        //if (apiResult.error) {
            
        if( apiResult.statusCode && apiResult.statusCode === 409 ){
            
            setShowOtp( true )
            setMsgalert(apiResult.message)
            setResendmail( true )
        //}
        } else if (apiResult.verifyemail === false) {
            setShowOtp(true)
        }

    }, [apiResult])

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoader(true)
        const updatedErrorsPromises = Object.entries(fields).map(async ([fieldName, value]) => {
            // Get rules for the current field
            const rules = getFieldRules('signup', fieldName);
            // Validate the field
            const error = await validateField('signup', fieldName, value, rules);
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
            jsonPayload['role'] = 'owner';
            await dispatch(authregister(jsonPayload))
            setLoader(false)
        }
    };


    return (
        
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
                            {
                                !showOTP ? 
                            
                                <Form onSubmit={handleSubmit}> 
                                    <h2>Don't have an account? Sign Up</h2>
                                    <Form.Group className={`mb-3 form-group ${errors['email'] ? 'has-error' : ''}`}>
                                        <FloatingLabel label="Email address *">
                                            <Form.Control type="text" name="email" placeholder="Enter Email address" onChange={handleChange} className={errors['email'] ? "input-error" : ''} />
                                        </FloatingLabel>
                                        {showError('email')}
                                    </Form.Group>
                                    <Button variant="primary" type="submit" disabled={loader}>{loader ? 'Please Wait...' : 'Create Account'}</Button>
                                    <p><span>OR</span></p>
                                    <p>Already have an account. <Link to="/login">Login Here</Link></p>
                                </Form>
                                :
                                
                                <>
                                { msgalert && msgalert !== "" &&
                                    <h6>
                                        { msgalert }
                                    </h6>
                                }
                                    { !resendMail && 
                                    <h6>We have sent an email to {fields['email']} to set up your account.</h6>
        }
                                    <p className='paragraph text-center '>Didn't see an email?</p>
                                    
                                    <div className="">
                                        <Button variant="primary" className="mb-3" onClick={() => resendLoader ? null : handleRequestAgain()}><span style={{ cursor: 'pointer' }}>{resendLoader ? 'Please wait...' : 'Resend'}</span></Button>
                                    </div>
                                    <p><span>OR</span></p>
                                    <p>Already have an account. <Link to="/login">Login Here</Link></p>
                                </>
                            }
                        </div>
                    </Col>
                </Row>
            </Container>
    );
}

export default SignUpPage;