import React, { useState, useEffect, useRef, act } from "react";
import { useDispatch, useSelector } from "react-redux";
import {Tabs, Tab} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import {
  Button,
  Form,
  ListGroup,
  Card,
  FloatingLabel,
  Dropdown,
  Modal,
  Col,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrashAlt,
  FaRegBell,
  FaRegUser,
  FaEllipsisV,
} from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import {
  getUserProfile,
  updateProfile,
  updatePassword,
  closeAccount,
  logout
} from "../../redux/actions/auth.actions";
import { getFieldRules, validateField } from "../../helpers/rules";
import { selectboxObserver } from "../../helpers/commonfunctions";
import ManagePlan from "../subscriptions/ManagePlan";
import { currentMemberProfile } from "../../helpers/auth";
import PlanOverview from "../subscriptions/PlanOverview";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ChangeEmailModal from "../modals/ChangeEmailModal";
import { DeleteAccount } from "../modals/deleteAccount";
const secretKey = process.env.REACT_APP_SECRET_KEY;
function EditableField({
  field,
  type,
  label,
  value,
  onChange,
  isEditing,
  onEditClick,
  error,
}) {
  const inputRef = useRef(null);
  const [originalValue, setOriginalValue] = useState(value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        if (inputRef.current.value.trim() === "") {
          onChange(originalValue);
        }
        onEditClick(false);
      }
    }
    if (isEditing) {
      setOriginalValue(value);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, onEditClick, value]);

  return (
    <ListGroup.Item>
      {isEditing ? (
        <>
          <strong>{label}</strong>
          <FloatingLabel>
            <Form.Control
              // placeholder={label}
              type={type}
              name={`${field}`}
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </FloatingLabel>
        </>
      ) : (
        <>
          <strong>{label}</strong>{" "}
          <span>
            {value} <FaEdit onClick={() => onEditClick(true)} />
          </span>
          <span className="error">{error}</span>
        </>
      )}
    </ListGroup.Item>
  );
}

function SettingPage(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const memberProfile = currentMemberProfile();
  const fileInputRef = useRef();
  const [activeTab, setActiveTab] = useState("Profile");
  const [activePlanTab, setActivePlanTab] = useState("planDetails");
  const [isActive, setIsActive] = useState(false);
  const [fieldserrors, setFieldErrors] = useState({ name: "" });
  const [profile, setProfile] = useState({});
  const [profileFields, setProfileFields] = useState({});
  const authprofile = useSelector((state) => state.auth.profile);
  const authAPI = useSelector((state) => state.auth);
  const activeSubscription = useSelector(
      (state) => state.subscription?.activeSubscription
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [userProfile, setUserProfile] = useState({});
  const [loader, setLoader] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [securityFields, setSecurityFields] = useState({new_password: '', confirm_password: '', current_password: ''});
  const [secutiryErrors, setSecutiryErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [ showEmailchange, setShowEmailchange] = useState( false )

  const handleshowEmailchange = () => {
    setShowEmailchange(true)
  }

  const handlecloseEmailchange = () => {
    setShowEmailchange(false)
  }

  const handleAlertClose = () => {
     setShowAlert(false);
     setSpinner(false)
  }
  const [errors, setErrors] = useState({});
  let fieldErrors = {};
  let hasError = false;
  const [isEditing, setIsEditing] = useState({
    name: false,
    avatar: false,
  });

  const handleEditClick = (fieldName) => {
    setIsEditing((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const handleSecurityFields = ({ target: { name, type, value } }) => {
    setSecurityFields({ ...securityFields, [name]: value });
  };

  const handleCloseAccount = () => {
    setSpinner(true)
    dispatch(closeAccount())
    setSpinner(false)
  }

  const handleSecurityUpdate = async (e) => {
    e.preventDefault();

    const errors = {};

    Object.entries(securityFields).forEach(([key, value]) => {
      if (!value || value.trim() === "") {
        errors[key] = key.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) + ' cannot be blank';
      }
    });
    if (
      securityFields.new_password &&
      securityFields.confirm_password &&
      securityFields.new_password !== securityFields.confirm_password
    ) {
      errors.confirm_password = "Passwords do not match";
    }
    setSecutiryErrors(errors);

    if (Object.keys(errors).length === 0) {
      console.log("Security Fields:", securityFields);
      dispatch(updatePassword(securityFields));
      // Proceed with API call or next steps
    } else {
      return;
    }
  };

  const refreshProfile = async () => {
    setSpinner(true);
    await dispatch(getUserProfile());
    setSpinner(false);
  };

  useEffect(() => {
    refreshProfile();
  }, []);

   useEffect(() => {
      setCurrentSubscription(activeSubscription)
  },[activeSubscription])

  useEffect(() => {
    if (activeTab === "Preferences") {
      selectboxObserver();
    }
  }, [activeTab]);

  useEffect(() => {
    if (authAPI.success) {
      setSecurityFields({new_password: '', confirm_password: '', current_password: ''});
    }

    if(authAPI.accountDelete && authAPI.accountDelete === true){
      dispatch(logout())
    }
  }, [authAPI]);





  const handleFieldChange = (field, value) => {
    if (field === "avatar") {
      setProfile((prevState) => ({
        ...prevState,
        [field]: value.target.files[0],
        ["remove_avatar"]: false,
      }));
      setAvatarPreview(URL.createObjectURL(value.target.files[0]));
    } else {
      setProfile((prevState) => ({
        ...prevState,
        [field]: value,
      }));
      if (value !== "") {
        setFieldErrors({ ...fieldErrors, [field]: "" });
      }
    }
  };

  useEffect(() => {
    if (authprofile) {
      setUserProfile(authprofile);
    }
  }, [authprofile]);

  useEffect(() => {
    setProfile({
      email: userProfile.email,
      name: userProfile.name,
      avatar: userProfile.avatar,
    });
    setProfileFields({
      email: userProfile.email,
      name: userProfile.name,
      avatar: userProfile.avatar,
    });
    setIsEditing({
      name: false,
      avatar: false,
      remove_avatar: false,
    });
  }, [userProfile]);

  const compareProfile = (original, edited) => {
    const changes = {};
    for (const [key, value] of Object.entries(edited)) {
      if (original[key] !== value) {
        changes[key] = value;
      }
    }
    return changes;
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();

    const changes = compareProfile(profileFields, profile);
    if (Object.keys(changes).length > 0) {
      setLoader(true);

      const updatedErrorsPromises = Object.entries(changes).map(
        async ([fieldName, value]) => {
          // Get rules for the current field
          const rules = getFieldRules("profile", fieldName);
          // Validate the field
          const error = await validateField("profile", fieldName, value, rules);
          // If error exists, return it as part of the resolved promise
          return { fieldName, error };
        }
      );

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
        setFieldErrors(fieldErrors);
        setLoader(false);
      } else {
        console.log("Profile changes: ", changes);
        if (Object.keys(changes).length > 0) {
          const formData = new FormData();
          for (const [key, value] of Object.entries(changes)) {
            formData.append(key, value);
          }
          if (isEditing.remove_avatar === true) {
            formData.append("remove_avatar", true);
          }
          await dispatch(updateProfile(userProfile?._id, formData));
        }
        setIsEditing({
          name: false,
          avatar: false,
          remove_avatar: false,
        });
        setLoader(false);
      }
    } else {
      setLoader(false);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setIsEditing({ ...isEditing, ["remove_avatar"]: true });
    setProfile({ ...profile, ["avatar"]: false });
  };

  const showError = (name, type = "default") => {
    if (type === "security") {
      if (secutiryErrors[name])
        return <span className="error">{secutiryErrors[name]}</span>;
    } else {
      if (errors[name]) return <span className="error">{errors[name]}</span>;
    }
    return null;
  };

  return (
    <>
      <div className="page--wrapper setting--page">
        <div className="setting--tabs">
          <ListGroup horizontal className={isActive ? "toggle--menu" : ""}>
            <ListGroup.Item
              action
              active={activeTab === "Profile"}
              onClick={() => setActiveTab("Profile")}
            >
              <FaRegUser /> Profile
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === "Security"}
              onClick={() => {
                setActiveTab("Security");
              }}
            >
              <MdLockOutline /> Security
            </ListGroup.Item>
             {
              memberProfile?.role?.slug === "owner" ?
                // currentSubscription === null ? 
                //   <ListGroup.Item
                //     onClick={() => {
                //       if(props.close){
                //         props.close()
                //       }
                //       navigate('/subscription-plans', { replace: true })
                //     }}
                //   >
                //     <MdLockOutline /> Billing
                //     </ListGroup.Item>
                // :
                <ListGroup.Item
                  action
                  active={activeTab === "billing"}
                  onClick={() => {
                    if( currentSubscription === null ){
                      if(props.close){
                        props.close()
                      }
                      navigate('/subscription-plans', { replace: true })
                    }else{
                      setActiveTab("billing");
                    }
                    
                  }}
                >
                  <MdLockOutline /> Billing
                </ListGroup.Item>
                :<></>
            } 
            
             {/* <ListGroup.Item onClick={() => setShowAlert(true)}>
              <FaRegBell /> Close Account
            </ListGroup.Item> */}
            {/*<ListGroup.Item
              action
              active={activeTab === "Preferences"}
              onClick={() => {
                setActiveTab("Preferences");
              }}
            >
              <FiGlobe /> Preferences
            </ListGroup.Item> */}
          </ListGroup>
        </div>
        {activeTab === "Profile" && (
          <div className="rounded--box p-4">
            <h3 className="mb-3">Profile</h3>
            <Card>
              <div className="card--img">
                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  id="upload--avatar"
                  name="avatar"
                  hidden
                  onChange={(e) => handleFieldChange("avatar", e)}
                  accept=".jpg, .jpeg, .png, .gif"
                />
                <Form.Label htmlFor="upload--avatar">
                  {isEditing.remove_avatar === false ? (
                    <Card.Img
                      variant="top"
                      src={
                        avatarPreview ??
                        userProfile?.avatar ??
                        "./images/default.jpg"
                      }
                    />
                  ) : (
                    <Card.Img variant="top" src={"./images/default.jpg"} />
                  )}

                  {!userProfile?.avatar && <span>Add Photo</span>}
                </Form.Label>
                {userProfile?.avatar && (
                  <Dropdown className="edit--dropdown">
                    <Dropdown.Toggle variant="dark">
                      <FaEllipsisV />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => fileInputRef.current.click()}
                      >
                        <Form.Label htmlFor="upload--avatar">
                          <FaEdit />{" "}
                          {userProfile?.avatar && <span>Edit Photo</span>}
                        </Form.Label>
                      </Dropdown.Item>
                      <Dropdown.Item onClick={removeAvatar}>
                        <FaTrashAlt /> Delete Photo
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>

              <Card.Body>
                {
                  <>
                  <ListGroup>
                    <ListGroup.Item>
                      <strong>Email</strong> {profile?.email}
                      <Button variant="primary" className="mt-2 px-3 py-2" onClick={() => {handleshowEmailchange()}}>Change Email</Button>
                    </ListGroup.Item>
                    <EditableField
                      field="name"
                      label="Name"
                      type="text"
                      value={profile?.name}
                      onChange={(value) => handleFieldChange("name", value)}
                      isEditing={isEditing.name}
                      onEditClick={() => handleEditClick("name")}
                      error={fieldserrors["name"] && fieldserrors["name"]}
                    />
                  </ListGroup>
                  
                  {
                    (showEmailchange === true) && (
                      <ChangeEmailModal show= {showEmailchange} handleClose={handlecloseEmailchange} currentEmail={memberProfile?.email} />
                    )
                  }
                  </>
                }

                <div className="text-end mt-3">
                  <Button variant="danger" className="me-3" onClick={() => setShowAlert(true)}>
                    Delete Account
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleUpdateSubmit}
                    disabled={loader}
                  >
                    {" "}
                    {loader ? "Please wait..." : "Save Changes"}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
        {activeTab === "Security" && (
          <div className="rounded--box p-4">
            <h3 className="mb-3">Security</h3>
            <div className="new--accordion--block">
              <div className="bg--blue--accordion">
                <Form onSubmit={handleSecurityUpdate}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                      type={showCurrentPassword ? "text" : "password"}
                      name="current_password"
                      value={securityFields?.current_password || ""}
                      onChange={handleSecurityFields}
                    />
                    {/* Show/Hide Password Toggle */}
                    <span
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          cursor: "pointer",
                          color: "#6c757d",
                          bottom: "14px"
                        }}
                    >
                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                    </div>
                    {showError("current_password", "security")}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="new_password"
                        value={securityFields?.new_password || ""}
                        onChange={handleSecurityFields}
                      />
                      <span
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "12px",
                            cursor: "pointer",
                            color: "#6c757d",
                            bottom: "14px"
                          }}
                      >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    {showError("confirm_password", "security")}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirm_password"
                        value={securityFields?.confirm_password || ""}
                        onChange={handleSecurityFields}
                      />
                      <span
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                        position: "absolute",
                        right: "12px",
                        cursor: "pointer",
                        color: "#6c757d",
                        bottom: "14px"
                        }}
                    >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                    {showError("confirm_password", "security")}
                  </Form.Group>
                  <div className="text-end">
                    <Button variant="primary" type="submit">
                      Update Password
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        )}
        {
          activeTab === "billing" && (
            <div className="manage__plan__tabs rounded--box p-4">
              <Tabs defaultActiveKey="planDetails" id="manage-plans-tab" onSelect={(k) => setActivePlanTab(k)}>
                <Tab eventKey="planDetails" title="Plan Details">
                  {activePlanTab === "planDetails" && <PlanOverview />}
                </Tab>
                <Tab eventKey="manage" title="Manage Plan">
                  {activePlanTab === "manage" && <ManagePlan />}
                </Tab>
                
              </Tabs>
            </div>
          )
        }
        {
        showAlert && 
          <DeleteAccount showdialog={showAlert} toggledialog={handleAlertClose}/>
        
      }
      </div>
    </>
  );
}

export default SettingPage;
