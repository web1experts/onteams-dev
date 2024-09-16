import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login } from '../../redux/actions/auth.actions';
import { getFieldRules, validateField } from '../../helpers/rules';
import { useToast } from "../../context/ToastContext";
function LoginPage() {
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
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const paramsObject = {};
    queryParams.forEach((value, key) => {
        paramsObject[key] = value;
    });
    const [singinfields, setsinginfields] = useState({ email: paramsObject['email'] || '', password: '' });
    const [error, setError] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const apiResult = useSelector(state => state.auth);

    const handleChangeInput = (event) => {
        const { name, value } = event.target;
        setsinginfields({ ...singinfields, [name]: value })
        setError({ ...error, [name]: '' })
    }

    const showError = (name) => {
        if (error[name]) return (<span className="error">{error[name]}</span>)
        return null
    }

    let fieldErrors = {};
    let hasError = false;

    useEffect(() => {
        if (paramsObject['invite_token']) {
            setsinginfields({ ...singinfields, ['invite_token']: paramsObject['invite_token'] })
        }
    }, [])

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        const updatedErrorsPromises = Object.entries(singinfields).map(async ([fieldName, value]) => {
            // Get rules for the current field
            const rules = getFieldRules('signin', fieldName);
            // Validate the field
            const error = await validateField('signin', fieldName, value, rules);
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
            setLoading(false)
            setError(fieldErrors);
        } else {

            await dispatch(login(singinfields))
            setLoading(false)
        }
    }


    // useEffect(() => {

    //     if (apiResult.error || apiResult.loggedIn || apiResult.success ) {
    //         setLoading(false)
    //     }
    // }, [apiResult])

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
                            <Form onSubmit={onSubmit}>
                                <h2>Sign in to your workspace</h2>
                                <Form.Group className="mb-3 form-group">
                                    <FloatingLabel label="Email address *">
                                        <Form.Control placeholder='Email address' className={error['email'] ? "input-error" : ''} type="text" name="email" onChange={handleChangeInput} readonly={paramsObject['email'] ? true : false}
                                            disabled={paramsObject['email'] ? true : false} value={paramsObject['email'] || singinfields.email || ''} />
                                    </FloatingLabel>
                                    {showError('email')}
                                </Form.Group>
                                <Form.Group className="mb-3 form-group">
                                    <FloatingLabel label="Password">
                                        <Form.Control type="password" placeholder='Password *' className={error['password'] ? "input-error" : ''} name="password" value={singinfields.password || ''}
                                            onChange={handleChangeInput} />
                                    </FloatingLabel>
                                    {showError('password')}
                                </Form.Group>
                                <Button variant="primary" disabled={loading} type="submit">{loading ? 'Please Wait...' : 'Sign In'}</Button>
                                <p className="text-center"><Link to="/forgot-password">Forgot Password?</Link></p>
                                <p><span>OR</span></p>
                                <p>Don't have an account. <Link to="/signup">Sign Up</Link></p>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
    );
}

export default LoginPage;