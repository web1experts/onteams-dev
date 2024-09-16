import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import {useNavigate, Link } from "react-router-dom";
import { getFieldRules, validateField } from '../../helpers/rules';
import { useSelector, useDispatch } from "react-redux";
import { forgotpassword } from '../../redux/actions/auth.actions';
import { useToast } from "../../context/ToastContext";
import { emailValidation } from '../../utils/validations';

function ForgotPassword() {
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ email:''});
    const [showmsg, setShowmsg ] = useState( false )
    const [ fields, setFields ] = useState( {email: ''})
    const [resendMail , setResendmail ]= useState( false )
    const check = [null, undefined, 'null', 'undefined', ''];
    const [resendLoader, setResendLoader] = useState(false);
    const apiResult = useSelector(state => state.auth);
    let fieldErrors = {};
    let hasError = false;
    const dispatch = useDispatch();

    useEffect(() => {
    
        if(apiResult.message && apiResult.message_variant){
            if( apiResult.message_variant === "success"){
                setShowmsg( true )
            }
        }

       
      
}, [apiResult])

    const handleChangeInput = ({ name, value }) => {
        setFields({ ...fields, [name]: value})
        setError({ ...error, [name]:''})
    }

    const showError = (name) => {
        if (error[name]) return (<span className="error">{error[name]}</span>)
        return null
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true)
        const updatedErrorsPromises = Object.entries(fields).map(async ([fieldName, value]) => {
            // Get rules for the current field
            const rules = getFieldRules('forgot_password', fieldName);
            // Validate the field
            const error = await validateField('forgot_password', fieldName, value, rules);
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
        if (hasError) {
            setLoading(false)
            setError(fieldErrors);
        } else {
            
            await dispatch(forgotpassword(fields))
            setLoading(false)
        }
      };

    useEffect(() => {
        
        if( apiResult ){
            setLoading( false )
        }
    }, [apiResult])

    const handleRequestAgain = async () => {
        setResendLoader(true);
        if (check.includes(fields['email']) || !emailValidation(fields['email'])) {
            setResendLoader(false);
        } else {
            await dispatch(forgotpassword(fields)); 
            setResendLoader(false);
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
                        { !showmsg ? 
                        <div className="common--form">
                            <img className="logo--sm" src="../images/OnTeam-Logo.png" alt="MyTeams" />
                            <Form onSubmit={handleSubmit}>
                                <h2>Forgot Password</h2>
                                <Form.Group className="mb-2 form-group">
                                    <FloatingLabel label="Email address *">
                                        <Form.Control type="text" name="email" placeholder='Email address' className={error['email'] ? "input-error" : ''} onChange={({ target }) => handleChangeInput(target)} />
                                    </FloatingLabel>
                                    {showError('email')}
                                </Form.Group>
                                <Button variant="primary" type="submit"  disabled={loading}>{loading ? 'Please Wait...' : 'Submit'}</Button>
                                <p><Link to="/login">Back to Login</Link></p>
                            </Form>
                        </div>
                        :
                                
                        <>
                         <div className="common--form">
                            <img className="logo--sm" src="../images/OnTeam-Logo.png" alt="MyTeams" />
                            <h6>We've sent a password reset email to {fields['email']}.</h6>
                            <p className='paragraph text-center '>Didn't see an email?</p>
                            <div className="">
                                <Button variant="primary" onClick={() => resendLoader ? null : handleRequestAgain()}><span style={{ cursor: 'pointer' }}>{resendLoader ? 'Please wait...' : 'Resend'}</span></Button>
                            </div>
                            <p><span>OR</span></p>
                            <p><Link to="/login">Login Here</Link></p>
                            </div>
                        </>
                    }
                    </Col>
                </Row>
            </Container>
    );
}

export default ForgotPassword;