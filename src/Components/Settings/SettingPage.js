import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, ListGroup, Card, FloatingLabel, Dropdown, Row, Col} from "react-bootstrap";
import { FaEdit, FaTrashAlt,FaRegBell, FaRegUser, FaEllipsisV } from "react-icons/fa";
import { FiGlobe} from "react-icons/fi";
import { TbTimezone } from "react-icons/tb";
import { MdLockOutline, MdOutlineEmail } from "react-icons/md";
import Spinner from "react-bootstrap/Spinner";
import { getUserProfile, updateProfile } from "../../redux/actions/auth.actions";
import { getFieldRules, validateField } from "../../helpers/rules";
import { AlertDialog } from "../modals";
import { permissionModules, permissionsLabel } from "../../helpers/permissionsModules";
import { updatePermissions, addRoleWithPermissions, deleteRole} from "../../redux/actions/permission.action";
import { getAvailableRolesByWorkspace } from "../../redux/actions/workspace.action";
import { Listmembers } from "../../redux/actions/members.action";
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
  const wrapperRef = useRef(null);
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
              placeholder={label}
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
          <strong>{label}</strong> <span>{value}{" "}<FaEdit onClick={() => onEditClick(true)} /></span>
          
          <span className="error">{error}</span>
        </>
      )}
    </ListGroup.Item>
  );
}

function SettingPage() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Profile");
  const [isActive, setIsActive] = useState(false);
  const [fieldserrors, setFieldErrors] = useState({ name: "" });
  const [profile, setProfile] = useState({});
  const [profileFields, setProfileFields] = useState({});
  const authprofile = useSelector((state) => state.auth.profile);
  const [userProfile, setUserProfile] = useState({});
  const [loader, setLoader] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  let fieldErrors = {};
  let hasError = false;
  const [isEditing, setIsEditing] = useState({
    name: false,
    avatar: false,
  });
  let defaultrole;
  const [fields, setFields] = useState({ name: "" });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [showdelete, setShowDelete] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [activeRole, setActiveRole] = useState({});
  const workspace = useSelector((state) => state.workspace);
  const members = useSelector((state) => state.member);
  const apiPermission = useSelector((state) => state.permissions);
  const memberFeed = useSelector((state) => state.member.members);
  const [roles, setRoles] = useState([]);
  const [memberslist, setMemberslist] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [expanded, setExpanded] = useState({});
  const [memberFeeds, setMemberFeed] = useState([]);

  const handleToggleExpandAll = () => {
    const areAllExpanded = permissionModules.every((mod) => expanded[mod.slug]);

    const newExpandedState = {};
    permissionModules.forEach((mod) => {
      newExpandedState[mod.slug] = !areAllExpanded;
    });

    setExpanded(newExpandedState);
  };

  const toggleExpand = (module) => {
    setExpanded((prev) => ({
      ...prev,
      [module]: !prev[module],
    }));
  };

  const toggleView = (module) => {
    const isChecked = !(permissions?.[module]?.view || false);

    const currentPerms = permissions?.[module] || {};
    const updated = {
      ...currentPerms,
      view: isChecked,
    };

    if (!isChecked) {
      const moduleData = permissionModules.find((m) => m.slug === module);
      if (moduleData) {
        (moduleData.permissions || []).forEach((perm) => {
          if (perm !== "view") {
            updated[perm] = false;
          }
        });
      }
    }

    setPermissions((prev) => ({
      ...prev,
      [module]: updated,
    }));
  };
  const togglePermission = (module, perm) => {
    setPermissions((prev) => {
      const currentPerms = prev?.[module] || {};
      return {
        ...prev,
        [module]: {
          ...currentPerms,
          [perm]: !currentPerms?.[perm],
        },
      };
    });
  };

  const handleSelectAllPermissions = (isChecked) => {
    const updatedPermissions = {};

    permissionModules.forEach((mod) => {
      const modSlug = mod.slug;
      const currentModPerms = permissions?.[modSlug] || {};

      const updatedModPerms = {};

      // Set all boolean permissions to true/false
      (mod.permissions || []).forEach((perm) => {
        updatedModPerms[perm] = isChecked;
      });

      // For modules that have selected_members, add them
      if (["tracking", "projects", "reports", "attendance"].includes(modSlug)) {
        if (isChecked) {
          const allMemberIds = memberFeeds.map((m) => String(m._id));
          if (modSlug === "projects") {
            allMemberIds.push("unassigned");
          }
          updatedModPerms["selected_members"] = allMemberIds;
        } else {
          updatedModPerms["selected_members"] = [];
        }
      }

      updatedPermissions[modSlug] = updatedModPerms;
    });

    setPermissions((prev) => ({ ...prev, ...updatedPermissions }));
  };

  const handleSelectAll = (modSlug, isChecked) => {
    const memberIds = memberFeeds.map((member) => String(member._id));
    if (isChecked) {
      setPermissions((prev) => {
        const currentPerms = prev?.[modSlug] || {};
        const currentMembers = currentPerms["selected_members"] || [];

        return {
          ...prev,
          [modSlug]: {
            ...currentPerms,
            ["selected_members"]: memberIds,
          },
        };
      });
    } else {
      setPermissions((prev) => {
        const currentPerms = prev?.[modSlug] || {};
        return {
          ...prev,
          [modSlug]: {
            ...currentPerms,
            ["selected_members"]: [],
          },
        };
      });
    }
  };

  const toggleMembers = (module, perm, memberId) => {
    setPermissions((prev) => {
      const currentPerms = prev?.[module] || {};
      const currentMembers = currentPerms[perm] || [];

      const updatedMembers = currentMembers.includes(memberId)
        ? currentMembers.filter((id) => id !== memberId)
        : [...currentMembers, memberId];

      return {
        ...prev,
        [module]: {
          ...currentPerms,
          [perm]: updatedMembers,
        },
      };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPermissions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleClick = (event) => {
    setIsActive((current) => !current);
  };

  const handleEditClick = (fieldName) => {
    setIsEditing((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const refreshProfile = async () => {
    setSpinner(true);
    await dispatch(getUserProfile());
    setSpinner(false);
  };

  useEffect(() => {
    refreshProfile();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedErrorsPromises = Object.entries(fields).map(
      async ([fieldName, value]) => {
        if (value === "") {
          return { fieldName, error: "Field cannot be blank" };
        } else {
          return { fieldName, error: "" };
        }
      }
    );

    // Wait for all promises to resolve
    const updatedErrorsArray = await Promise.all(updatedErrorsPromises);
    const errors = {};
    updatedErrorsArray.forEach(({ fieldName, error }) => {
      if (error) {
        errors[fieldName] = error;
      }
    });
    const hasError = Object.keys(errors).length > 0;

    if (hasError) {
      setErrors(errors);
      return;
    }
    try {
      const roleData = {
        name: fields.name,
        permissions,
      };
      
      setLoader(true);
      dispatch(addRoleWithPermissions(roleData));
    } catch (err) {
      console.error("Error adding role:", err);
      alert("Error adding role");
    }
  };
  useEffect(() => {
    if (authprofile) {
      setUserProfile(authprofile);
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

  useEffect(() => {
    if (activeRole) {
      const merged = {};

      // Step 1: Initialize merged with empty string values
      permissionModules.forEach((mod) => {
        merged[mod.slug] = {};
        mod.permissions.forEach((p) => {
          merged[mod.slug][p] = "";
        });
      });

     
      setPermissions((prev) => {
        const newPerms = activeRole.permissions || {};

        // Clone merged to avoid mutating the original reference
        const updated = { ...merged };

        // First, update existing keys in merged
        for (const module in updated) {
          updated[module] = { ...updated[module] }; // clone inner object
          for (const key in updated[module]) {
            if (newPerms?.[module] && key in newPerms[module]) {
              updated[module][key] = newPerms[module][key];
            } else {
              updated[module][key] = "";
            }
          }
        }

        // Then, add any missing modules or keys from newPerms
        for (const module in newPerms) {
          if (!updated[module]) {
            updated[module] = {};
          }
          for (const key in newPerms[module]) {
            if (!(key in updated[module])) {
              updated[module][key] = newPerms[module][key];
            }
          }
        }

        return updated;
      });
      setFields({...fields, ['name']: activeRole?.name})
    }
  }, [activeRole]);

  const handleDeleteRole = async (e) => {
    setLoader(true); console.log(activeRole._id)
    dispatch(deleteRole(activeRole._id))
  }

  const handleSave = async (e) => {
    try {
      const roleData = {
        role: activeRole._id,
        permissions,
        type: "default",
        name: fields['name']
      };
      setLoader(true);
      dispatch(updatePermissions(roleData));
    } catch (err) {
      console.error("Error adding role:", err);
      alert("Error adding role");
    }
  };
  const handleShow = () => {
    setShow((prev) => !prev);
    setFields({})
  };

  useEffect(() => {
    if( show === true){
      setActiveRole({})
    }else{ 
      if (Array.isArray(roles) && roles.length > 0) {
        setActiveRole(roles[0]);
      }
    }
  },[show])

  const showError = (name) => {
    if (errors[name]) return <span className="error">{errors[name]}</span>;
    return null;
  };

  const handleRoleList = async () => {
    await dispatch(
      getAvailableRolesByWorkspace({ fields: "_id name permissions" })
    );
  };

  useEffect(() => {
    if (memberFeed && memberFeed.memberData) {
      setMemberFeed(memberFeed.memberData);
    }
  }, [memberFeed]);

  useEffect(() => {
    setLoader(false);
    setShowDelete(false)
    if (apiPermission.success) {
      setShow(false);
      setPermissions({})
      if (apiPermission.savedrole) {
        const savedrole = apiPermission.savedrole;
        setFields({...fields, ['name']: savedrole.name})
        setRoles((prev) => {
          const index = prev.findIndex((role) => role._id === savedrole._id);
          if (index !== -1) {
            // Replace existing role
            return prev.map((role) =>
              role._id === savedrole._id ? savedrole : role
            );
          } else {
            // Add new role
            return [...prev, savedrole];
          }
        });
        
      }
      if( apiPermission.deletedRole){
        setRoles((prev) => prev.filter((role) => role._id !== apiPermission.deletedRole?._id));
      }
      if (apiPermission.updatedMeta) {
        const meta = apiPermission.updatedMeta?.meta_value;
        const memberIdToUpdate = apiPermission.updatedMeta?.member;

        setMemberslist((prev) => {
          const existing = prev[activeKey];

          if (!existing) return prev;

          const updatedMembers = existing.members.map((member) => {
            if (member._id === memberIdToUpdate) {
              return {
                ...member,
                permissions: meta, // or savedrole.permissions if that’s what you want
              };
            }
            return member;
          });

          return {
            ...prev,
            [activeKey]: {
              ...existing,
              members: updatedMembers,
            },
          };
        });
      }
    }
  }, [apiPermission]);

  useEffect(() => {
    handleRoleList();
    let prm = {};
    permissionModules.forEach((mod) => {
      prm[mod.slug] = {}; // Initialize object for each module
      mod.permissions.forEach((p) => {
        prm[mod.slug][p] = "";
      });
    });

    setPermissions(prm);
    dispatch(Listmembers());
  }, [dispatch]);

  useEffect(() => {
    if (workspace.available_roles) {
      setRoles(workspace.available_roles);
      defaultrole = workspace.available_roles[0];
      setActiveRole(workspace.available_roles[0]);
    }
  }, [workspace]);

  return (
    <>
        <div className="page--wrapper setting--page">
          <div className="setting--tabs">
            <ListGroup horizontal className={isActive ? "toggle--menu" : ""}>
              <ListGroup.Item action active={activeTab === "Profile"} onClick={() => setActiveTab("Profile")}><FaRegUser /> Profile</ListGroup.Item>
              <ListGroup.Item action active={activeTab === "Security"} onClick={() => {setActiveTab("Security");}}><MdLockOutline /> Security</ListGroup.Item>
              <ListGroup.Item action active={activeTab === "Notifications"} onClick={() => setActiveTab("Notifications")}><FaRegBell /> Notifications</ListGroup.Item>
              <ListGroup.Item action active={activeTab === "Preferences"} onClick={() => {setActiveTab("Preferences");}}><FiGlobe /> Preferences</ListGroup.Item>
              <ListGroup.Item action></ListGroup.Item>
            </ListGroup>
          </div>
          {activeTab === "Profile" && (
            <div className="rounded--box p-4">
              <h3>Profile</h3>
              <Card>
                <div className="card--img">
                  <Form.Control
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
                    {/* {userProfile?.avatar && <span>Edit Photo</span>} */}
                  </Form.Label>
                  {userProfile?.avatar && (
                    <Dropdown className="edit--dropdown">
                      <Dropdown.Toggle variant="dark">
                        <FaEllipsisV />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item>
                          <Form.Label htmlFor="upload--avatar">
                            <FaEdit /> {userProfile?.avatar && <span>Edit Photo</span>}
                          </Form.Label>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={removeAvatar}><FaTrashAlt /> Delete Photo</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
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
                        onChange={(value) => handleFieldChange("name", value)}
                        isEditing={isEditing.name}
                        onEditClick={() => handleEditClick("name")}
                        error={fieldserrors["name"] && fieldserrors["name"]}
                      />
                    </ListGroup>
                  }

                  <div className="text-end mt-3">
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
              <h3>Security</h3>
              <div className="new--accordion--block">
                <div className="bg--blue--accordion">
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control type="password" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control type="password" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control type="password"/>
                    </Form.Group>
                    <div className="text-end">
                      <Button variant="primary" type="submit">Update Password</Button> 
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          )}
          {activeTab === "Notifications" && (
            <div className="rounded--box p-4">
              
                <h3 className="mb-0">Notifications</h3>
              <div className="new--accordion--block">
                <div className="bg--blue--accordion mb-3">
                  <div className="d-flex gap-3 align-items-center mb-3">
                    <div className="d-flex gap-3 align-items-center mb-3">
                      <MdOutlineEmail />
                      <h6 className="mb-0">Notifications</h6>
                    </div>
                    <div className="d-flex gap-3 align-items-center ms-auto">
                      <p className="mb-0">Email</p>
                      <Form.Check type="switch" className="ps-0 switch--small" checked/>
                    </div>
                    <div className="d-flex gap-3 align-items-center">
                      <p className="mb-0">Push</p>
                      <Form.Check type="switch" className="ps-0 switch--small" checked/>
                    </div>
                  </div>
                  <div className="d-flex gap-5 align-items-center mb-3 bg-white px-3 py-2 rounded-3">
                    <p className="mb-0">Project Notifications</p>
                    <div className="d-flex gap-3 align-items-center ms-auto">
                      <Form.Check type="switch" className="ps-0 switch--small" checked/>
                    </div>
                    <div className="d-flex gap-3 align-items-center">
                      <Form.Check type="switch" className="ps-0 switch--small"/>
                    </div>
                  </div>
                  <div className="d-flex gap-5 align-items-center mb-3 bg-white px-3 py-2 rounded-3">
                    <p className="mb-0">Client Notifications</p>
                    <div className="d-flex gap-3 align-items-center ms-auto">
                      <Form.Check type="switch" className="ps-0 switch--small" checked/>
                    </div>
                    <div className="d-flex gap-3 align-items-center">
                      <Form.Check type="switch" className="ps-0 switch--small"/>
                    </div>
                  </div>
                  <div className="d-flex gap-5 align-items-center mb-3 bg-white px-3 py-2 rounded-3">
                    <p className="mb-0">Members Notifications</p>
                    <div className="d-flex gap-3 align-items-center ms-auto">
                      <Form.Check type="switch" className="ps-0 switch--small" checked/>
                    </div>
                    <div className="d-flex gap-3 align-items-center">
                      <Form.Check type="switch" className="ps-0 switch--small"/>
                    </div>
                  </div>
                </div> 
                <div className="text-end">
                  <Button variant="primary" type="submit">Save Changes</Button> 
                </div>                        
              </div>
            </div>
          )}
          {activeTab === "Preferences" && (
            <div className="rounded--box p-4">
              <h3>Preferences</h3>
              <div className="new--accordion--block">
                <div className="bg--blue--accordion mb-3">
                  <div className="d-flex gap-3 align-items-center">
                    <FiGlobe />
                    <h6 className="mb-0">Timezone</h6>
                  </div>
                  <Form>
                    <div class="d-flex gap-3 mt-3">
                      <Form.Group className="mb-0 form-group w-100 w-md-50">
                        <Form.Label>Timezone</Form.Label>
                        <Form.Select>
                          <option>Pacific Time (PT)</option>
                          <option>Mountain Time (MT)</option>
                          <option>Central Time (CT)</option>
                          <option>Eastern Time (ET)</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </Form>
                </div>
                <div className="text-end">
                  <Button variant="primary" type="submit">Save Changes</Button> 
                </div>                     
              </div>
            </div>
          )}
        </div>
    </>
  );
}

export default SettingPage;
