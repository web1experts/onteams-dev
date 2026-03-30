import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { sendOldEmailOtp,
  verifyOldOtp,
  sendNewEmailOtp,
  verifyNewOtp } from "../../redux/actions/userActions.action";
import { logout } from "../../redux/actions/auth.actions";
const ChangeEmailModal = ({ show, handleClose, currentEmail }) => {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newEmail, setNewEmail] = useState("");

  const { email_updated, error, otp_for, old_email_otp_verified } = useSelector((state) => state.useractions);

  useEffect(() => {
    if(otp_for === 'old_email'){ 
        setStep(2)
    }else if(otp_for === 'new_email'){
        setStep(4)
    }
  }, [otp_for])

  useEffect(() => {
    if(old_email_otp_verified){
        setStep(3)
    }
  }, [old_email_otp_verified])

  // handle OTP input
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // auto focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const otpValue = otp.join("");

  // Step handlers
  const handleSendOldOtp = async () => {
   await dispatch(sendOldEmailOtp());
  };

  const handleVerifyOldOtp = async () => {
    await dispatch(verifyOldOtp(otpValue));
    setOtp(["", "", "", "", "", ""]);
  };

  const handleSendNewOtp = async () => {
    await dispatch(sendNewEmailOtp(newEmail));
    
  };

  const handleVerifyNewOtp = async () => {
    await dispatch(verifyNewOtp(otpValue));
  };

  useEffect(() => {
    if (email_updated) {
      setStep(5);
      setTimeout(() => {
         dispatch(logout())
      }, 2000)
    }
  }, [email_updated]);

  const renderOtpInputs = () => (
    <div className="d-flex gap-2 mt-2">
      {otp.map((digit, i) => (
        <Form.Control
          key={i}
          id={`otp-${i}`}
          value={digit}
          maxLength={1}
          onChange={(e) => handleOtpChange(e.target.value, i)}
          style={{
            width: "45px",
            height: "45px",
            textAlign: "center",
            fontSize: "18px"
          }}
        />
      ))}
    </div>
  );

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Change Email Address</Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="p-3 bg-light rounded mb-3">
              <strong>Step 1 of 2</strong>
              <div>Verify your current email</div>
            </div>

            <p>
              We'll send a verification code to <b>{currentEmail}</b>
            </p>

            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSendOldOtp}>
                Send OTP →
              </Button>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="p-3 bg-light rounded mb-3">
              <strong>Step 1 of 2</strong>
              <div>Verify your current email</div>
            </div>

            <p>Enter 6-digit code sent to <b>{currentEmail}</b></p>

            {renderOtpInputs()}

            <div className="mt-2 text-primary" style={{ cursor: "pointer" }}
              onClick={handleSendOldOtp}>
              Resend
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                disabled={otpValue.length !== 6}
                onClick={handleVerifyOldOtp}
              >
                Continue →
              </Button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div className="p-3 bg-light rounded mb-3">
              <strong>Step 2 of 2</strong>
              <div>Enter your new email</div>
            </div>

            <Form.Group>
              <Form.Label>New Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="new-email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </Form.Group>

            <div className="mt-3 text-muted">
              We'll send a verification code to this email
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                disabled={!newEmail}
                onClick={handleSendNewOtp}
              >
                Send OTP →
              </Button>
            </div>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            <div className="p-3 bg-light rounded mb-3">
              <strong>Step 2 of 2</strong>
              <div>Verify your new email</div>
            </div>

            <p>Enter code sent to <b>{newEmail}</b></p>

            {renderOtpInputs()}

            <div className="mt-2 text-primary" style={{ cursor: "pointer" }}
              onClick={() => dispatch(sendNewEmailOtp(newEmail))}>
              Resend
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button
                disabled={otpValue.length !== 6}
                onClick={handleVerifyNewOtp}
              >
                Verify →
              </Button>
            </div>
          </>
        )}

        {/* STEP 5 SUCCESS */}
        {step === 5 && (
          <div className="text-center">
            <h5>Email Updated Successfully 🎉</h5>
            <Button className="mt-3" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}

        {error && (
          <div className="text-danger mt-2">{error}</div>
        )}

      </Modal.Body>
    </Modal>
  );
};

export default ChangeEmailModal;