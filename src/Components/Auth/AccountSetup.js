import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { json, useNavigate, Link as RouterLink, useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setupaccount } from '../../redux/actions/auth.actions';
import { getFieldRules, validateField } from '../../helpers/rules';
import WorkspaceForm from "../workspaces/workspaceform";
import { useToast } from "../../context/ToastContext";
import useFilledClass from "../customHooks/useFilledclass";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { timezonesData, selectboxObserver } from "../../helpers/commonfunctions";
const timer = 60

function AccountSetup() {
    const inputs = document.querySelectorAll('.form-floating .form-control');
    useFilledClass('.form-floating .form-control');

    const addToast = useToast();
    const { token } = useParams();
    const [showPassword, setShowPassword] = useState(false);
    const [fields, setFields] = useState({ name: '', password: '', token: token });
    const navigate = useNavigate();
    /** -- Form Fields Errors -- */
    const [errors, setErrors] = useState({ name: '', password: '' });
    const [loader, setLoader] = useState(false);
    const [disable, setDisable] = useState(true);
    const [companyform, setCompanyForm] = useState(false)
    const dispatch = useDispatch();
    const check = [null, undefined, 'null', 'undefined', ''];
    const state = useSelector(state => state.auth)
    const requestMessage = useSelector(state => state.auth.requestMessage)
    let fieldErrors = {};
    let hasError = false;
    const apiResult = useSelector(state => state.auth);
    const [showOTP, setShowOtp] = useState(false);
    const [owneremail, setOwneremail] = useState('');
    const [companyerrors, setcompanyerrors] = useState('')
    const workspace = useSelector(state => state.workspace)

    const handleChange = ({ target: { name, value, type, checked } }) => {
        
        if (name === "email") {
            setOwneremail(value);
        }
        let newFields = { ...fields };
        let newErrors = { ...errors };
        
        if (name === "companyname" && value === "") {
            delete newFields.companyname;
            delete newErrors.companyname;
        } else if(name === 'agree'){
            newFields[name] = checked
        }else {
            newFields[name] = value;
            newErrors[name] = '';

            if( name === 'companyname'){
                setcompanyerrors('')
            }
        }

        setFields(newFields);
        setErrors(newErrors);
    };

    const showError = (name) => {
        if (errors[name]) return (<span className="error">{errors[name]}</span>)
        return null
    }

    const handleSubmit = async (event) => {
        
        event.preventDefault();
        
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
            if (!fields.agree) {
                addToast("Please agree to the Terms & Conditions", 'danger');
                
                return;
            }
            setLoader(true)
            const jsonPayload = {};
            for (const [key, value] of Object.entries(fields)) {
                jsonPayload[key] = value;
            }
            jsonPayload['role'] = 'owner';
            await dispatch(setupaccount(jsonPayload))
            setLoader(false)
            
        }

        return hasError
    };

    useEffect(() => {
        selectboxObserver()
    },[])

    useEffect(() => {
        
        if( apiResult.token && apiResult.token !== ""){
            setCompanyForm(true)
        }

        if( workspace.success ){ 
            setTimeout(function(){
                navigate('/plans')
            },1000)
        }
    },[apiResult, workspace])

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
                            <span className='new--logo'><img className="logo--sm" src="../images/logo-prime-team-icon.png" alt="MyTeams" /></span>
                            <div className="account--setup">
                                {(companyform === false) ?
                                    <Form onSubmit={handleSubmit} >
                                        <h2>Complete account setup</h2>
                                        <Form.Group className="mb-3 form-group">
                                            <FloatingLabel label="Your Name" controlId="floatingInput">
                                                <Form.Control type="text" className={errors['name'] ? "input-error" : ''} placeholder="Your Name*" name="name" onChange={handleChange} />
                                            </FloatingLabel>
                                            {showError('name')}
                                        </Form.Group>
                                        <Form.Group className="mb-3 form-group">
                                            <FloatingLabel label="Password" controlId="floatingPassword">
                                                <Form.Control 
                                                    type={showPassword ? "text" : "password"} 
                                                    className={errors['password'] ? "input-error" : ''} 
                                                    placeholder="Password*" 
                                                    name="password" 
                                                    onChange={handleChange} 
                                                />
                                            </FloatingLabel>
                                            {/* Show/Hide Password Toggle */}
                                            <span
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                position: "absolute",
                                                right: "12px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                cursor: "pointer",
                                                fontSize: "18px",
                                                color: "#6c757d",
                                                }}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </span>
                                            {showError('password')}
                                        </Form.Group>
                                        <Form.Group className="mb-0 form-group">
                                            <Form.Select aria-label="Select Timezone" placeholder="Select Timezone" 
                                                className={errors['timezone'] && errors['timezone'] !== "" ? "form-control input-error filled custom-selectbox" : 'form-control filled custom-selectbox'} 
                                                onChange={handleChange} value={fields['timezone'] || "Asia/Kolkata"} name="timezone">
                                                {
                                                Object.entries(timezonesData)?.map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))
                                                }
                                            </Form.Select>
                                            {showError('timezone')}
                                        </Form.Group>
                                        <div className="form-check mb-3" style={{ display: 'flex', alignItems: 'center' }}>
                                            <Form.Check
                                                type="checkbox"
                                                name="agree"
                                                checked={fields?.agree}
                                                onChange={handleChange}
                                                id="terms-checkbox-input"
                                            />
                                             <label className="form-check-label" htmlFor="terms-checkbox-input">
                                                I agree to the <a href="https://primeteams.ai/terms-and-conditions/" target="_blank" rel="noreferrer">Terms & Conditions</a>
                                            </label>
                                        </div>
                                        <Button variant="primary" type="submit" disabled={loader}>{loader ? 'Please wait...' : 'Setup Account' }</Button>
                                    </Form>
                                :
                                <>
                                    <WorkspaceForm  show_more_buttons={true} heading={true} />
                                </>
                                }
                                
                                <p><span>OR</span></p>
                                <p>Already have an account. <Link to="/login">Login Here</Link></p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
    );
}

export default AccountSetup;