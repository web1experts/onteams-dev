import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import useFilledClass from "../customHooks/useFilledclass";
import { Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { validateAccountPassword, validateAccountDeleteOTP } from '../../redux/actions/userActions.action';
import { closeAccount } from '../../redux/actions/auth.actions';
import { useToast } from '../../context/ToastContext';
import { logout } from '../../redux/actions/auth.actions';
export function DeleteAccount({ showdialog, toggledialog}) {
  
  const dispatch = useDispatch();
  const addToast = useToast();
  const apiResults = useSelector((state) => state.useractions);
  const apiResultsAuth = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [step, setStep] = useState(1);

  const [workspaceInput, setWorkspaceInput] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const [error, setError] = useState('');

  useFilledClass('.form-floating .form-control');

  useEffect(() => {
    setOpen(showdialog);
    setLoader(false);
    setStep(1);
    setWorkspaceInput('');
    setPassword('');
    setOtp(['', '', '', '', '', '']);
    setError('');
  }, [showdialog]);

  const handleClose = () => {
    setOpen(false);
    toggledialog(false);
    setStep(1)
  };

  // STEP 1 → STEP 2
  const handleContinue = () => {
    setStep(2);
  };

  // STEP 2 → VALIDATE PASSWORD + SEND OTP
  const handleValidateAndSendOtp = async () => {
    if (workspaceInput !== 'DELETE MY ACCOUNT') {
      addToast("Text does not match", 'danger');
      return //setError('Text does not match');
    }

    if (!password) {
      addToast("Password is required", 'danger');
      return //setError('Password is required');
    }
     setLoader(true);
     setError('');
     await dispatch(validateAccountPassword({password }))
     setLoader(false);
    
  };

  useEffect(() => {
    if(apiResults?.password_validate){ 
      setStep(3);
    }
  },[apiResults?.password_validate])

  useEffect(() => {
    if(apiResults?.account_delelete_otp_verified){ 
      setStep(4);
      setTimeout(() => {
        dispatch(closeAccount())
      },1000)
    }
  },[apiResults?.account_delelete_otp_verified])

  useEffect(() => {
    if(apiResultsAuth?.closseAccountfail === true){
      handleClose()
    }
  }, [apiResultsAuth?.closseAccountfail])

  useEffect(() => {
    if(apiResultsAuth.accountDelete && apiResultsAuth.accountDelete === true){
          dispatch(logout())
        }
  }, [apiResultsAuth?.accountDelete])

  // STEP 3 → VERIFY OTP + DELETE
  const handleVerifyOtp = async () => {
    const finalOtp = otp.join('');

    if (finalOtp.length !== 6) {
      addToast("Enter valid 6-digit OTP", 'danger');
      return //setError('Enter valid 6-digit OTP');
    }

    try {
      setLoader(true);
      setError('');

        await dispatch(validateAccountDeleteOTP({
            finalOtp
        }))
    //   setStep(4)
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoader(false);
    }
  };


  // RESEND OTP
  const handleResendOtp = async () => {
    await handleValidateAndSendOtp()
  };

  // OTP INPUT HANDLER
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
     const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <Modal
      show={open}
      onHide={handleClose}
      centered
      size="md"
    >
      <Modal.Header closeButton>
        <Modal.Title>Delete Account</Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="p-3 mb-3 rounded" style={{ background: "#fff4e5", border: "1px solid #f5c27a" }}>
              <h5 className="fw-bold mb-3">
                ⚠️ Warning: This action is permanent
              </h5>
              <ul>
                <li>All your personal data will be permanently deleted</li>
                <li>Your workspaces and projects will be removed</li>
                <li>Your subscription will be cancelled</li>
                <li>You will be logged out immediately</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>

            <div className="p-3 rounded" style={{ background: "#eef4ff" }}>
              <h6 className="fw-bold">Before proceeding, please consider:</h6>
              <ul>
                <li>Export any important data you want to keep</li>
                <li>Cancel any active subscriptions or services</li>
                <li>Notify team members if you're part of any shared workspaces</li>
              </ul>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <Alert variant="warning">
              This is your last chance to cancel. Please confirm you want to delete your account.
              </Alert>
            <Form.Group className="mb-3">
              <Form.Label>
                Type <b>DELETE MY ACCOUNT</b> to confirm
              </Form.Label>
              <Form.Control
                value={workspaceInput}
                onChange={(e) => setWorkspaceInput(e.target.value)}
                placeholder='Type here...'
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Enter your password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Your password'
              />
            </Form.Group>

            {error && <div className="text-danger mt-2">{error}</div>}
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <p>Email verification required. We've sent a verification code to your email. Enter it to continue.</p>
            <p>Enter 6-digit code</p>
            <div className="d-flex gap-2 justify-content-center mb-3">
              {otp.map((digit, index) => (
                <Form.Control
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  maxLength={1}
                  className="text-center p-1"
                  style={{ width: 45, height: 45 }}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                />
              ))}
            </div>

            <div
              className="text-primary"
              style={{ cursor: 'pointer' }}
              onClick={handleResendOtp}
            >
              Didn't receive code? Resend
            </div>

            {error && <div className="text-danger mt-2">{error}</div>}
          </>
        )}

        {/* STEP 4 */}
    

        {step === 4 && (
          <div className="text-center py-5">
            
            {/* Icon circle */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: '#f4e7db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              <i className="bi bi-building" style={{ fontSize: 28, color: '#e07a5f' }} />
            </div>

            {/* Title */}
            <h4 className="fw-bold mb-2">Deleting your account</h4>

            {/* Description */}
            <p className="text-muted">
              Please wait while we process your reques. You will logged out shortly.
            </p>

            {/* Optional Spinner */}
            <Spinner animation="border" size="sm" />
          </div>
        )}

      </Modal.Body>

      <Modal.Footer>

        {step === 1 && (
          <>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleContinue}>I Understand, Continue</Button>
          </>
        )}

        {step === 2 && (
          <>
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button disabled={loader} onClick={handleValidateAndSendOtp}>
              {loader ? <Spinner size="sm" /> : 'Continue'}
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
            <Button disabled={loader} onClick={handleVerifyOtp}>
              {loader ? <Spinner size="sm" /> : 'Verify'}
            </Button>
          </>
        )}

        {/* {step === 4 && (
          <Button onClick={handleClose}>Close</Button>
        )} */}

        

      </Modal.Footer>
    </Modal>
  );
}