import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import {useNavigate, Link, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useSelector, useDispatch } from "react-redux";
import { getFieldRules, validateField } from '../../helpers/rules';
import { resetPassword } from '../../redux/actions/auth.actions';

function ResetPassword() {

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
    const { token } = useParams();
    const navigate = useNavigate()
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fields, setFields] = useState({ password: '', confirm_password: '', token: token });
    const [error, setError] = useState({ password: '', confirm_password: '' });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const apiResult = useSelector(state => state.auth);

    const handleChangeInput = ({ name, value }) => {
        setFields({ ...fields, [name]: value })
        setError({ ...error, [name]: '' })
    }

    const showError = (name) => {
        if (error[name]) return (<span className="error">{error[name]}</span>)
        return null
    }

    let fieldErrors = {};
    let hasError = false;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        const updatedErrorsPromises = Object.entries(fields).map(async ([fieldName, value]) => {
            // Get rules for the current field
            const rules = getFieldRules('reset_password', fieldName);
            // Validate the field
            const error = await validateField('reset_password', fieldName, value, rules);
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
        let hasError = Object.keys(fieldErrors).length > 0;

        if (!hasError) {
            if (fields['password'] !== fields['confirm_password']) {
                hasError = true;
                fieldErrors = { ...fieldErrors, ['confirm_password']: 'Confirm password did not matched with the password.' };
            }
        }

        // If there are errors, update the errors state
        if (hasError) {
            setLoading(false)
            setError(fieldErrors);
        } else {
            

            await dispatch(resetPassword(fields))
            setLoading(false)
        }
    };

    useEffect(() => {
        //setLoading(false)

        if( apiResult.success ){ 
            setTimeout(function(){
                navigate('/login')
            },2000)
            
        }

    }, [apiResult])
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
                            <Form onSubmit={handleSubmit}>
                                <h2>Reset Password</h2>
                                <Form.Group className="mb-2 form-group">
                                    <FloatingLabel label="New Password *">
                                        <Form.Control type="password" placeholder='New Password' className={error['password'] ? "input-error" : ''} onChange={({ target }) => handleChangeInput(target)} value={fields.password || ''} name="password" />
                                    </FloatingLabel>
                                    {showError('password')}
                                </Form.Group>
                                <Form.Group className="mb-2 form-group">
                                    <FloatingLabel label="Confirm Password *">
                                        <Form.Control type="password" placeholder='Confirm Password' value={fields.confirm_password || ''}  className={error['confirm_password'] ? "input-error" : ''}
                                        onChange={({ target }) => handleChangeInput(target)} name="confirm_password" />
                                    </FloatingLabel>
                                    {showError('confirm_password')}
                                </Form.Group>
                                <Button variant="primary" type="submit" disabled={loading} >{loading ? 'Please Wait...' : 'Reset Password'}</Button>
                                <p><Link to="/login">Back to Login</Link></p>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
    );
}

export default ResetPassword;