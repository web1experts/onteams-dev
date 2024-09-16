import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, ListGroup, Table, Card, FloatingLabel } from "react-bootstrap";
import { FaChevronDown, FaEdit, FaTrashAlt } from "react-icons/fa";
import Spinner from 'react-bootstrap/Spinner';
import { getUserProfile, updateProfile } from "../../redux/actions/auth.actions";
import { getFieldRules, validateField } from "../../helpers/rules";
import { parseIfValidJSON } from "../../helpers/commonfunctions";
const secretKey = process.env.REACT_APP_SECRET_KEY
function EditableField({ field, type, label, value, onChange, isEditing, onEditClick, error }) {
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const [originalValue, setOriginalValue] = useState(value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        if (inputRef.current.value.trim() === '') {
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
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, onEditClick, value]);

  

  return (
    <ListGroup.Item>

      {isEditing ? (
        <>
          <strong>{label}</strong>
          <FloatingLabel>
            <Form.Control placeholder={label} type={type} name={`${field}`} ref={inputRef} value={value} onChange={(e) => onChange(e.target.value)} />
          </FloatingLabel>
        </>

      ) : (
        <>
          <strong>{label}</strong> {value} <FaEdit onClick={() => onEditClick(true)} />
          <span className='error'>{error}</span>
        </>
      )}
    </ListGroup.Item>
  );

}


function SettingPage() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Profile");
  const [isActive, setIsActive] = useState(false);
  const [fieldserrors, setFieldErrors] = useState({ name: '' });
  const [ profile, setProfile ] = useState({})
  const [ profileFields, setProfileFields ] = useState({})
  const authprofile = useSelector(state => state.auth.profile)
  const [ userProfile, setUserProfile ] = useState({})
  const [loader, setLoader] = useState(false);
  const [spinner, setSpinner] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null);
  let fieldErrors = {};
  let hasError = false
  const [isEditing, setIsEditing] = useState({
    name: false,
    avatar: false
  });
  const handleClick = event => {
    setIsActive(current => !current);
  };

  const handleEditClick = (fieldName) => {
    setIsEditing((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const refreshProfile = async () => {
    setSpinner( true)
    await dispatch(getUserProfile());
    setSpinner( false )
  }

  useEffect(() => {
    refreshProfile();
  },[])


  const handleFieldChange = (field, value) => {
    if (field === "avatar") {
      setProfile((prevState) => ({
        ...prevState,
        [field]: value.target.files[0],
        ['remove_avatar']: false
      }));
      setAvatarPreview(URL.createObjectURL(value.target.files[0]));
    } else {
      setProfile((prevState) => ({
        ...prevState,
        [field]: value,
      }));
      if (value !== "") {
        setFieldErrors({ ...fieldErrors, [field]: "" })
      }
    }
};

  useEffect(() => {
    if( authprofile ){ 
      setUserProfile( authprofile)
      // if( localStorage.hasItem('current_loggedin_user')){
      //   const jsondata = parseIfValidJSON(localStorage.getItem('current_loggedin_user'));

      //   if( jsondata){
      //     jsondata['name'] = authprofile?.name
      //     jsondata['avatar'] = authprofile?.avatar
      //     jsondata['name'] = authprofile?.name
      //     localStorage.setItem('current_loggedin_user', JSON.stringify(jsondata, secretKey));
      //   }
      // }
      
    }
  }, [authprofile ])

  useEffect(() => {
    setProfile({
      email: userProfile.email,
      name: userProfile.name,
      avatar: userProfile.avatar
    })
    setProfileFields({
      email: userProfile.email,
      name: userProfile.name,
      avatar: userProfile.avatar
    })
    setIsEditing({
      name: false,
      avatar: false,
      remove_avatar: false
    });
  }, [userProfile])

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
      setLoader(true)


      const updatedErrorsPromises = Object.entries(changes).map(async ([fieldName, value]) => {
        // Get rules for the current field
        const rules = getFieldRules('profile', fieldName);
        // Validate the field
        const error = await validateField('profile', fieldName, value, rules);
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
        setFieldErrors(fieldErrors);
        setLoader(false)
      } else {
        
        console.log('Profile changes: ', changes)
        if (Object.keys(changes).length > 0) {
          
          const formData = new FormData();
          for (const [key, value] of Object.entries(changes)) {
            formData.append(key, value);
          }
          if( isEditing.remove_avatar === true ){
            formData.append('remove_avatar', true);
          }
          await dispatch(updateProfile(userProfile?._id, formData))
          
        }
        setIsEditing({
          name: false,
          avatar: false,
          remove_avatar: false
        });
        setLoader(false)
      }
    } else {
      setLoader(false)
    }
  };

  const removeAvatar = () => {
    setAvatarPreview( null );
    setIsEditing({...isEditing, ['remove_avatar']: true })
    setProfile({ ...profile, ['avatar'] : false })
  }

  return (
    <>
     
        <div className='team--page'>
          <div className='page--wrapper setting--page'>
          {
              spinner &&
              <div class="loading-bar">
                  <img src="images/OnTeam-icon-gray.png" className="flipchar" />
              </div>
          }
            <div className="setting--tabs">
              <h2>Settings</h2>
              <ListGroup horizontal className={isActive ? 'toggle--menu' : ''}>
                <ListGroup.Item action active={activeTab === "Profile"} onClick={() => setActiveTab("Profile")}>Profile</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Projects"} onClick={() => setActiveTab("Projects")}>Projects</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Clients"} onClick={() => setActiveTab("Clients")}>Clients</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "TimeTracking"} onClick={() => setActiveTab("TimeTracking")}>Time Tracking</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Members"} onClick={() => setActiveTab("Members")}>Team Members</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Reports"} onClick={() => setActiveTab("Reports")}>Reports</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Holidays"} onClick={() => setActiveTab("Holidays")}>Holidays</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Attendance"} onClick={() => setActiveTab("Attendance")}>Attendance</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Docs"} onClick={() => setActiveTab("Docs")}>Docs</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Notes"} onClick={() => setActiveTab("Notes")}>Notes</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Invoices"} onClick={() => setActiveTab("Invoices")}>Invoices</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Passwords"} onClick={() => setActiveTab("Passwords")}>Passwords</ListGroup.Item>
              </ListGroup>
            </div>
            {activeTab === "Profile" && (
              <div className="rounded--box">
                <Card>
                <div className="card--img">
                  <Form.Control type="file" id="upload--avatar" name="avatar" hidden onChange={(e) => handleFieldChange('avatar', e)} accept=".jpg, .jpeg, .png, .gif"/>
                  <Form.Label htmlFor="upload--avatar">
                    {
                      isEditing.remove_avatar === false ? 
                      <Card.Img variant="top" src={avatarPreview ?? userProfile?.avatar ?? "./images/default.jpg"} />
                      :
                      <Card.Img variant="top" src={"./images/default.jpg"} />
                    }
                    
                    {!userProfile?.avatar && 
                      <span>Add Photo</span>
                    }
                    {userProfile?.avatar && 
                      <span>Edit Photo</span>
                    }
                    
                  </Form.Label>
                  {userProfile?.avatar && 
                      
                        <span className="remove--photo" onClick={removeAvatar}><FaTrashAlt /></span>
                      
                    }
                </div>
                  
                  <Card.Body>
                    
                    {
                      
                      <ListGroup>
                        <ListGroup.Item>
                          <strong>Email</strong> {profile?.email}
                        </ListGroup.Item>
                        <EditableField
                          field="name"
                          label="Name"
                          type="text"
                          value={profile?.name}
                          onChange={(value) => handleFieldChange('name', value)}
                          isEditing={isEditing.name}
                          onEditClick={() => handleEditClick('name')}
                          error={fieldserrors['name'] && fieldserrors['name']}
                        />
                      </ListGroup>
                    }
                    
                    <div className="text-end mt-3">
                      <Button variant="primary" onClick={handleUpdateSubmit} disabled={loader}> { loader ? 'Please wait...': 'Save Changes' }</Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}
            {activeTab === "Projects" && (
              <div className="rounded--box">
                <h5>Projects Settings</h5>
                <hr />
                <h6 class="mb-2">Managers</h6>
                <h6 class="mb-1">Default Permissions</h6>
                <p>Default permissions will be applied for the newly added members.</p>
                <div class="switch-wrapper">
                  <input id="View" type="radio" name="switch" checked />
                  <label for="View">View</label>
                  <input id="Add" type="radio" name="switch" />
                  <label for="Add">Add / Edit / Delete</label>
                </div>
                <h6 class="mb-2 mt-3">Users</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View01" type="radio" name="switch01" checked />
                          <label for="View01">View</label>
                          <input id="Add01" type="radio" name="switch01" />
                          <label for="Add01">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h6 class="mb-2">Managers</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View1" type="radio" name="switch1" checked />
                          <label for="View1">View</label>
                          <input id="Add1" type="radio" name="switch1" />
                          <label for="Add1">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h5>Tasks Settings</h5>
                <hr />
                <h6 class="mb-2">Managers</h6>
                <h6 class="mb-1">Default Permissions</h6>
                <p>Default permissions will be applied for the newly added members.</p>
                <div class="switch-wrapper">
                  <input id="View3" type="radio" name="switch3" checked />
                  <label for="View3">View</label>
                  <input id="Add3" type="radio" name="switch3" />
                  <label for="Add3">Add / Edit / Delete</label>
                </div>
                <h6 class="mb-2 mt-3">Users</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View4" type="radio" name="switch4" checked />
                          <label for="View4">View</label>
                          <input id="Add4" type="radio" name="switch4" />
                          <label for="Add4">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h6 class="mb-2">Managers</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View5" type="radio" name="switch5" checked />
                          <label for="View5">View</label>
                          <input id="Add5" type="radio" name="switch5" />
                          <label for="Add5">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <div className="text-end mt-3">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            )}
            {activeTab === "Clients" && (
              <div className="rounded--box">
                <h5>Clients Settings</h5>
                <hr />
                <h6 class="mb-2">Managers</h6>
                <h6 class="mb-1">Default Permissions</h6>
                <p>Default permissions will be applied for the newly added members.</p>
                <div class="switch-wrapper">
                  <input id="View6" type="radio" name="switch6" checked />
                  <label for="View6">View</label>
                  <input id="Add6" type="radio" name="switch6" />
                  <label for="Add6">Add / Edit / Delete</label>
                </div>
                <h6 class="mb-2 mt-3">Users</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View7" type="radio" name="switch7" checked />
                          <label for="View7">View</label>
                          <input id="Add7" type="radio" name="switch7" />
                          <label for="Add7">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h6 class="mb-2">Managers</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View8" type="radio" name="switch8" checked />
                          <label for="View8">View</label>
                          <input id="Add8" type="radio" name="switch8" />
                          <label for="Add8">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <div className="text-end mt-3">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            )}
            {activeTab === "TimeTracking" && (
              <div className="rounded--box">
                <h5>View Time Settings</h5>
                <hr />
                <h6 class="mb-2">Managers</h6>
                <h6 class="mb-1">Default Permissions</h6>
                <p>Default permissions will be applied for the newly added members.</p>
                <div class="switch-wrapper">
                  <input id="View9" type="radio" name="switch9" checked />
                  <label for="View9">View</label>
                  <input id="Add9" type="radio" name="switch9" />
                  <label for="Add9">Add / Edit / Delete</label>
                </div>
                <h6 class="mb-2 mt-3">Users</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View10" type="radio" name="switch10" checked />
                          <label for="View10">View</label>
                          <input id="Add10" type="radio" name="switch10" />
                          <label for="Add10">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h6 class="mb-2">Managers</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View11" type="radio" name="switch11" checked />
                          <label for="View11">View</label>
                          <input id="Add11" type="radio" name="switch11" />
                          <label for="Add11">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h5>Approve Time Settings</h5>
                <hr />
                <h6 class="mb-2">Managers</h6>
                <h6 class="mb-1">Default Permissions</h6>
                <p>Default permissions will be applied for the newly added members.</p>
                <div class="switch-wrapper">
                  <input id="View12" type="radio" name="switch12" checked />
                  <label for="View12">View</label>
                  <input id="Add12" type="radio" name="switch12" />
                  <label for="Add12">Add / Edit / Delete</label>
                </div>
                <h6 class="mb-2 mt-3">Users</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View13" type="radio" name="switch13" checked />
                          <label for="View13">View</label>
                          <input id="Add13" type="radio" name="switch13" />
                          <label for="Add13">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h6 class="mb-2">Managers</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View14" type="radio" name="switch14" checked />
                          <label for="View14">View</label>
                          <input id="Add14" type="radio" name="switch14" />
                          <label for="Add14">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <div className="text-end mt-3">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            )}
            {activeTab === "Members" && (
              <div className="rounded--box">
                <h5>Team Members Settings</h5>
                <hr />
                <h6 class="mb-2">Managers</h6>
                <h6 class="mb-1">Default Permissions</h6>
                <p>Default permissions will be applied for the newly added members.</p>
                <div class="switch-wrapper">
                  <input id="View15" type="radio" name="switch15" checked />
                  <label for="View15">View</label>
                  <input id="Add15" type="radio" name="switch15" />
                  <label for="Add15">Add / Edit / Delete</label>
                </div>
                <h6 class="mb-2 mt-3">Users</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View16" type="radio" name="switch16" checked />
                          <label for="View16">View</label>
                          <input id="Add16" type="radio" name="switch16" />
                          <label for="Add16">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h6 class="mb-2">Managers</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View17" type="radio" name="switch17" checked />
                          <label for="View17">View</label>
                          <input id="Add17" type="radio" name="switch17" />
                          <label for="Add17">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <div className="text-end mt-3">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            )}
            {activeTab === "Reports" && (
              <div className="rounded--box">
                <h5>Reports Settings</h5>
                <hr />
                <h6 class="mb-2">Managers</h6>
                <h6 class="mb-1">Default Permissions</h6>
                <p>Default permissions will be applied for the newly added members.</p>
                <div class="switch-wrapper">
                  <input id="View18" type="radio" name="switch18" checked />
                  <label for="View18">View</label>
                  <input id="Add18" type="radio" name="switch18" />
                  <label for="Add18">Add / Edit / Delete</label>
                </div>
                <h6 class="mb-2 mt-3">Users</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View19" type="radio" name="switch19" checked />
                          <label for="View19">View</label>
                          <input id="Add19" type="radio" name="switch19" />
                          <label for="Add19">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h6 class="mb-2">Managers</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View20" type="radio" name="switch20" checked />
                          <label for="View20">View</label>
                          <input id="Add20" type="radio" name="switch20" />
                          <label for="Add20">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <div className="text-end mt-3">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            )}
            {activeTab === "Holidays" && (
              <div className="rounded--box">
                <h5>Holidays Settings</h5>
                <hr />
                <h6 class="mb-2">Managers</h6>
                <h6 class="mb-1">Default Permissions</h6>
                <p>Default permissions will be applied for the newly added members.</p>
                <div class="switch-wrapper">
                  <input id="View21" type="radio" name="switch21" checked />
                  <label for="View21">View</label>
                  <input id="Add21" type="radio" name="switch21" />
                  <label for="Add21">Add / Edit / Delete</label>
                </div>
                <h6 class="mb-2 mt-3">Users</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View22" type="radio" name="switch22" checked />
                          <label for="View22">View</label>
                          <input id="Add22" type="radio" name="switch22" />
                          <label for="Add22">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h6 class="mb-2">Managers</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View23" type="radio" name="switch23" checked />
                          <label for="View23">View</label>
                          <input id="Add23" type="radio" name="switch23" />
                          <label for="Add23">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <div className="text-end mt-3">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            )}
            {activeTab === "Attendance" && (
              <div className="rounded--box">
                <h5>Attendance Settings</h5>
                <hr />
                <h6 class="mb-2">Managers</h6>
                <h6 class="mb-1">Default Permissions</h6>
                <p>Default permissions will be applied for the newly added members.</p>
                <div class="switch-wrapper">
                  <input id="View24" type="radio" name="switch24" checked />
                  <label for="View24">View</label>
                  <input id="Add24" type="radio" name="switch24" />
                  <label for="Add24">Add / Edit / Delete</label>
                </div>
                <h6 class="mb-2 mt-3">Users</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View25" type="radio" name="switch25" checked />
                          <label for="View25">View</label>
                          <input id="Add25" type="radio" name="switch25" />
                          <label for="Add25">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h6 class="mb-2">Managers</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View26" type="radio" name="switch26" checked />
                          <label for="View26">View</label>
                          <input id="Add26" type="radio" name="switch26" />
                          <label for="Add26">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <div className="text-end mt-3">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            )}
            {activeTab === "Docs" && (
              <div className="rounded--box">
                <h5>Docs Settings</h5>
                <hr />
                <h6 class="mb-2">Managers</h6>
                <h6 class="mb-1">Default Permissions</h6>
                <p>Default permissions will be applied for the newly added members.</p>
                <div class="switch-wrapper">
                  <input id="View27" type="radio" name="switch27" checked />
                  <label for="View27">View</label>
                  <input id="Add27" type="radio" name="switch27" />
                  <label for="Add27">Add / Edit / Delete</label>
                </div>
                <h6 class="mb-2 mt-3">Users</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View28" type="radio" name="switch28" checked />
                          <label for="View28">View</label>
                          <input id="Add28" type="radio" name="switch28" />
                          <label for="Add28">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h6 class="mb-2">Managers</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View29" type="radio" name="switch29" checked />
                          <label for="View29">View</label>
                          <input id="Add29" type="radio" name="switch29" />
                          <label for="Add29">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <div className="text-end mt-3">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            )}
            {activeTab === "Notes" && (
              <div className="rounded--box">
                <h5>Notes Settings</h5>
                <hr />
                <h6 class="mb-2">Managers</h6>
                <h6 class="mb-1">Default Permissions</h6>
                <p>Default permissions will be applied for the newly added members.</p>
                <div class="switch-wrapper">
                  <input id="View30" type="radio" name="switch30" checked />
                  <label for="View30">View</label>
                  <input id="Add30" type="radio" name="switch30" />
                  <label for="Add30">Add / Edit / Delete</label>
                </div>
                <h6 class="mb-2 mt-3">Users</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View31" type="radio" name="switch31" checked />
                          <label for="View31">View</label>
                          <input id="Add31" type="radio" name="switch31" />
                          <label for="Add31">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h6 class="mb-2">Managers</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View32" type="radio" name="switch32" checked />
                          <label for="View32">View</label>
                          <input id="Add32" type="radio" name="switch32" />
                          <label for="Add32">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <div className="text-end mt-3">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            )}
            {activeTab === "Invoices" && (
              <div className="rounded--box">
                <h5>Invoices Settings</h5>
                <hr />
                <h6 class="mb-2">Managers</h6>
                <h6 class="mb-1">Default Permissions</h6>
                <p>Default permissions will be applied for the newly added members.</p>
                <div class="switch-wrapper">
                  <input id="View33" type="radio" name="switch33" checked />
                  <label for="View33">View</label>
                  <input id="Add33" type="radio" name="switch33" />
                  <label for="Add33">Add / Edit / Delete</label>
                </div>
                <h6 class="mb-2 mt-3">Users</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View34" type="radio" name="switch34" checked />
                          <label for="View34">View</label>
                          <input id="Add34" type="radio" name="switch34" />
                          <label for="Add34">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h6 class="mb-2">Managers</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View35" type="radio" name="switch35" checked />
                          <label for="View35">View</label>
                          <input id="Add35" type="radio" name="switch35" />
                          <label for="Add35">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <div className="text-end mt-3">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            )}
            {activeTab === "Passwords" && (
              <div className="rounded--box">
                <h5>Password Settings</h5>
                <hr />
                <h6 class="mb-2">Managers</h6>
                <h6 class="mb-1">Default Permissions</h6>
                <p>Default permissions will be applied for the newly added members.</p>
                <div class="switch-wrapper">
                  <input id="View36" type="radio" name="switch36" checked />
                  <label for="View36">View</label>
                  <input id="Add36" type="radio" name="switch36" />
                  <label for="Add36">Add / Edit / Delete</label>
                </div>
                <h6 class="mb-2 mt-3">Users</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View37" type="radio" name="switch37" checked />
                          <label for="View37">View</label>
                          <input id="Add37" type="radio" name="switch37" />
                          <label for="Add37">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <h6 class="mb-2">Managers</h6>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span><img src="images/tarun.jpg" alt="..." /></span>Tarun Giri</td>
                      <td>
                        <div class="switch-wrapper">
                          <input id="View38" type="radio" name="switch38" checked />
                          <label for="View38">View</label>
                          <input id="Add38" type="radio" name="switch38" />
                          <label for="Add38">Add / Edit / Delete</label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <div className="text-end mt-3">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </div>
    </>
  );
}

export default SettingPage;