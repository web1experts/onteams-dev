import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import useFilledClass from "../customHooks/useFilledclass";
import { Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { validatePassword, deleteWorkspace, validateWorkspaceDeleteOTP } from '../../redux/actions/workspace.action';
import { useToast } from '../../context/ToastContext';
export function DeleteWorkspace({ showdialog, toggledialog, workspacename, workspaceId }) {
  const HOST = process.env.REACT_APP_API_HOST;
  const VERSION = process.env.REACT_APP_API_VERSION;
  const API = HOST + VERSION;
  const addToast = useToast();
  const dispatch = useDispatch();
  const apiResults = useSelector((state) => state.workspace);
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
  };

  // STEP 1 → STEP 2
  const handleContinue = () => {
    setStep(2);
  };

  // STEP 2 → VALIDATE PASSWORD + SEND OTP
  const handleValidateAndSendOtp = async () => {
    if (workspaceInput !== workspacename) {
      addToast("Workspace name does not match", 'danger');
      return //setError('Workspace name does not match');
    }

    if (!password) {
      addToast("Password is required", 'danger');
      return //setError('Password is required');
    }
     setLoader(true);
     setError('');
     await dispatch(validatePassword({password,workspaceId }))
     setLoader(false);
    
  };

  useEffect(() => {
    if(apiResults?.password_validate){ console.log('success password')
      setStep(3);
    }
  },[apiResults?.password_validate])

  useEffect(() => {
    if(apiResults?.workspace_delelete_otp_verified){ 
      setStep(4);
      setTimeout(() => {
        dispatch(deleteWorkspace(workspaceId))
      },1000)
    }
  },[apiResults?.workspace_delelete_otp_verified])

  // STEP 3 → VERIFY OTP + DELETE
  const handleVerifyOtp = async () => {
    const finalOtp = otp.join('');

    if (finalOtp.length !== 6) {
      addToast('Enter valid 6-digit OTP', 'danger');
      return //setError('Enter valid 6-digit OTP');
    }

    try {
      setLoader(true);
      setError('');

      await dispatch(validateWorkspaceDeleteOTP({
        workspaceId,
        finalOtp
      }))
      
    } catch (err) {
      addToast(err?.response?.data?.message || 'Invalid OTP', 'danger');
      // setError(err?.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoader(false);
    }
  };

  // RESEND OTP
  const handleResendOtp = async () => {
    try {
      setLoader(true);
      setError('');
      dispatch(validatePassword({password,workspaceId }))
      setLoader(false);
    } catch (err) {
      addToast('Failed to resend OTP', 'danger');
      // setError('Failed to resend OTP');
    } finally {
      setLoader(false);
    }
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
        <Modal.Title>Delete Workspace</Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="p-3 mb-3 rounded" style={{ background: "#fff4e5", border: "1px solid #f5c27a" }}>
              <h5 className="fw-bold mb-3">
                ⚠️ You're about to delete "{workspacename}" workspace
              </h5>
              <ul>
                <li>All projects will be permanently deleted</li>
                <li>All team members will lose access</li>
                <li>All workspace data, files, and settings will be removed</li>
                <li>Billing and subscriptions will be cancelled</li>
                <li>This action cannot be undone.</li>
              </ul>
            </div>

            <div className="p-3 rounded" style={{ background: "#eef4ff" }}>
              <h6 className="fw-bold">Before you proceed, please make sure to:</h6>
              <ul>
                <li>Export any important data or files</li>
                <li>Inform all team members about the deletion</li>
                <li>Transfer ownership of any important projects, if needed</li>
              </ul>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <Alert variant="warning">
              This is your last chance to cancel. Please confirm you want to delete the workspace.
            </Alert>
            <Form.Group className="mb-3">
              <Form.Label>
                Type the workspace name <b>"{workspacename}"</b> to confirm
              </Form.Label>
              <Form.Control
                value={workspaceInput}
                onChange={(e) => setWorkspaceInput(e.target.value)}
                placeholder='Type workspace name...'
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
            <Alert variant="info">
              Email verification required
            </Alert>
            <p>We've sent a verification code to your email. Enter it to continue.</p>

            <div className="d-flex gap-2 justify-content-center mb-3">
              <Form.Label>Enter 6-digit code</Form.Label>
              {otp.map((digit, index) => (
                <Form.Control
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  maxLength={1}
                  className="text-center"
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
            <h4 className="fw-bold mb-2">Deleting Workspace...</h4>

            {/* Description */}
            <p className="text-muted">
              Removing "{workspacename}" and all associated data.
              This may take a moment.
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
            <Button onClick={handleContinue}>Continue</Button>
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