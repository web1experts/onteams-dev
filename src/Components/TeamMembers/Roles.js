import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, ListGroup, Card, Modal, FloatingLabel, FormGroup, Row, Col} from "react-bootstrap";
import { FaEdit, FaTrashAlt,FaRegBell, FaPlus, FaRegUser } from "react-icons/fa";
import { FiCheck} from "react-icons/fi";
import { LuFolderOpen } from "react-icons/lu";
import { MdLockOutline } from "react-icons/md";
import Spinner from "react-bootstrap/Spinner";
import { getUserProfile, updateProfile } from "../../redux/actions/auth.actions";
import { getFieldRules, validateField } from "../../helpers/rules";
import { AlertDialog } from "../modals";
import { permissionModules, permissionsLabel } from "../../helpers/permissionsModules";
import { updatePermissions, addRoleWithPermissions, deleteRole} from "../../redux/actions/permission.action";
import { getAvailableRolesByWorkspace } from "../../redux/actions/workspace.action";
import { Listmembers } from "../../redux/actions/members.action";
import { selectboxObserver } from "../../helpers/commonfunctions";
const secretKey = process.env.REACT_APP_SECRET_KEY;

function Roles() {
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
      if (["time_tracking", "projects", "reports", "attendance"].includes(modSlug)) {
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
    setTimeout(() => {
      selectboxObserver()
    },700)
    
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
    setLoader(true); 
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
        setFields({name: ""})
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
          <div className="rounded--box permission__page">
            <h3 className="d-flex align-items-center justify-content-end">
                <Button variant="primary" onClick={() => handleShow()}><FaPlus /> Add New</Button>
            </h3>
            
            {activeRole && Object.keys(activeRole).length > 0 && (
            <>
                <Row className="mt-4">
                  <Col lg={6}>
                    <FormGroup className="form-group mb-3 mb-lg-0 pb-0">
                    <FloatingLabel label="Select Role">
                        <Form.Select className="custom-selectbox" key={`rolelist`}  onChange={(e) => {
                          const selectedRole = roles.find((role) => role._id === e.target.value);
                          setActiveRole(selectedRole);
                        }}>
                        {roles.map((role, index) => {
                            return (
                            <option key={`role-${role._id}`} value={role?._id} action active={activeRole?._id === role._id}>{role.name}</option>
                            );
                        })}
                        </Form.Select>
                    </FloatingLabel>
                    {/* <Form.Label>Select Role</Form.Label> */}
                    
                    </FormGroup>
                </Col>
                <Col lg={6}>
                    <FormGroup className="form-group mb-0 pb-0">
                      <FloatingLabel label="Role name">
                        <Form.Control
                        type="text"
                        className={
                        "form-control"
                        }
                        placeholder="Role name"
                        name="name"
                        value={fields['name']}
                        onChange={(e) => {
                            const { value} = e.target;
                            setFields({...fields, ['name']: value})
                        }}
                        />
                      </FloatingLabel>
                    </FormGroup>
                </Col>
                
                </Row>
                
                <div className="new--accordion--block w-100 mt-4">
                {permissionModules.map((mod) => {
                    const modSlug = mod.slug;
                    const modPerms = permissions?.[modSlug] || {};
                    const isExpanded = expanded?.[modSlug] || false;
                    const isViewChecked = !!modPerms.view;
                    const truePermissionCount = Object.values(
                    modPerms
                    ).filter((val) => val === true).length;
                    return (
                    <div className="bg--blue--accordion">
                        <div className="d-flex gap-3 align-items-center">
                            {permissionsLabel[modSlug]?.icon || <LuFolderOpen />}
                            <h6 className="mb-0">{permissionsLabel[modSlug]?.heading} <small className="d-block">{permissionsLabel[modSlug]?.sub_heading}</small></h6>
                        </div>
                        {(mod.permissions || []).map((perm) => {
                        if (perm === "view") {
                            return (
                            <div className="d-flex gap-3 align-items-center mt-3 bg-white px-3 py-2 rounded-3">
                                <p className="mb-0">View</p>
                                <Form.Check key={`${modSlug}--view`} type="switch" className="ms-auto switch--small" checked={!!modPerms.view}
                                    onChange={() => toggleView(modSlug)}/>
                            </div>
                            )
                        }
                        return (
                            <>
                            <div className="d-flex gap-3 align-items-center mt-3 bg-white px-3 py-2 rounded-3">
                                <p className="mb-0">{perm
                                                    .replace(/[_-]/g, " ")
                                                    .replace(/^\w/, (l) => l.toUpperCase())}</p>
                                <Form.Check type="switch" className="ms-auto switch--small" id={`${modSlug}-${perm}`} key={perm}
                                disabled={!isViewChecked}
                                checked={!!modPerms[perm]}
                                onChange={() =>
                                    togglePermission(modSlug, perm)
                                }
                                />
                            </div>
                            {[
                                "time_tracking",
                                "projects",
                                "reports",
                                "attendance",
                            ].includes(modSlug) &&
                                perm === "view_others" &&
                                modPerms[perm] === true && (
                                <div className="team--card--grid">
                                    {memberFeeds.map((member) => (
                                    <Card className={`team--card ${modPerms[
                                        "selected_members"
                                        ]?.includes(String(member._id))? 'selected--card' : ''}`} onClick={() => {
                                        //if (selectedMember?.role?.slug !== "owner") {
                                        toggleMembers(
                                            modSlug,
                                            "selected_members",
                                            member._id
                                        )
                                        // }
                                        }}>
                                        <span className="team--initial">{member.name?.charAt(0) || "U"}</span>
                                        <Card.Body>
                                        <h4>{member.name} <small className="d-block">{member?.role?.name}</small></h4>
                                        </Card.Body>
                                        <FiCheck className="ms-auto" />
                                    </Card>
                                    ))}
        
                                    {modSlug === "projects" && (
                                    <Card className={`team--card ${modPerms[
                                        "selected_members"
                                        ]?.includes("unassigned")? 'selected--card' : ''}`} onClick={() => {
                                        //if (selectedMember?.role?.slug !== "owner") {
                                        if(activeRole.slug !==
                                                "owner"
                                                ) {
                                                toggleMembers(
                                                    modSlug,
                                                    "selected_members",
                                                    "unassigned"
                                                );
                                                }
                                        // }
                                        }} key={`${modSlug}-${perm}-unassigned`}>
                                        <span className="team--initial">U</span>
                                        <Card.Body>
                                        <h4>Unassigned</h4>
                                        </Card.Body>
                                        <FiCheck className="ms-auto" />
                                    </Card>
                                    )}
                                </div>
                                )}
                            </>
                        )
                        })}
                        </div>
                        )
                    })}

                  <div className="mt-4 text-end">
                    <Button variant="secondary" onClick={() => setShowDelete(true)}>Delete</Button>
                    <Button variant="primary" className="ms-3" onClick={handleSave}>Save</Button>
                  </div>
                </div>
            </>
            )}
        </div>
        {showdelete && (
          <AlertDialog showdialog={showdelete} toggledialog={setShowDelete} msg="Are you sure?" callback={handleDeleteRole}/>
        )}
      </div>
      {show && (
        <Modal show={show} onHide={() => {setShow(false);
          setTimeout(() => {
            selectboxObserver()
          },650)
        }} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add New Role</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="roleName">
                        <FloatingLabel label="Role Name *">
                        <Form.Control
                            type="text"
                            name="name"
                            value={fields?.name}
                            onChange={(e) => {
                            setFields({
                                ...fields,
                                ["name"]: e.target.value,
                            });
                            setErrors({ ...errors, ["name"]: "" });
                            }}
                            disabled={loader}
                        />
                        </FloatingLabel>

                        {showError("name")}
                    </Form.Group>
                    <h5 className="mt-4">Permissions</h5>
                    <div className="new--accordion--block mb-4">
                        {permissionModules.map((mod) => {
                            const modSlug = mod.slug;
                            const modPerms = permissions?.[modSlug] || {};
                            const isExpanded = expanded?.[modSlug] || false;
                            const isViewChecked = !!modPerms.view;
                            const truePermissionCount = Object.values(
                            modPerms
                            ).filter((val) => val === true).length;
                            return (
                            <div className="bg--blue--accordion">
                                <div className="d-flex gap-3 align-items-center">
                                    {permissionsLabel[modSlug]?.icon || <LuFolderOpen />}
                                    <h6 className="mb-0">{permissionsLabel[modSlug]?.heading} <small className="d-block">{permissionsLabel[modSlug]?.sub_heading}</small></h6>
                                </div>
                                {(mod.permissions || []).map((perm) => {
                                if (perm === "view") {
                                    return (
                                    <div className="d-flex gap-3 align-items-center mt-3 bg-white px-3 py-2 rounded-3">
                                        <p className="mb-0">View</p>
                                        <Form.Check key={`${modSlug}--view`} type="switch" className="ms-auto switch--small" checked={!!modPerms.view} onChange={() => toggleView(modSlug)}/>
                                    </div>
                                    )
                                }
                                return (
                                    <>
                                    <div className="d-flex gap-3 align-items-center mt-3 bg-white px-3 py-2 rounded-3">
                                        <p className="mb-0">{perm.replace(/[_-]/g, " ").replace(/^\w/, (l) => l.toUpperCase())}</p>
                                        <Form.Check type="switch" className="ms-auto switch--small" id={`${modSlug}-${perm}`} key={perm}
                                        disabled={!isViewChecked}
                                        checked={!!modPerms[perm]}
                                        onChange={() =>
                                            togglePermission(modSlug, perm)
                                        }
                                        />
                                    </div>
                                    {[
                                        "time_tracking",
                                        "projects",
                                        "reports",
                                        "attendance",
                                    ].includes(modSlug) &&
                                        perm === "view_others" &&
                                        modPerms[perm] === true && (
                                        <div className="team--card--grid">
                                            {memberFeeds.map((member) => (
                                            <Card className={`team--card ${modPerms[
                                                "selected_members"
                                                ]?.includes(String(member._id))? 'selected--card' : ''}`} onClick={() => {
                                                //if (selectedMember?.role?.slug !== "owner") {
                                                toggleMembers(
                                                    modSlug,
                                                    "selected_members",
                                                    member._id
                                                )
                                                // }
                                                }}>
                                                <span className="team--initial">{member.name?.charAt(0) || "U"}</span>
                                                <Card.Body>
                                                <h4>{member.name} <small className="d-block">{member?.role?.name}</small></h4>
                                                </Card.Body>
                                                <FiCheck className="ms-auto" />
                                            </Card>
                                            ))}
                
                                            {modSlug === "projects" && (
                                            <Card className={`team--card ${modPerms[
                                                "selected_members"
                                                ]?.includes("unassigned")? 'selected--card' : ''}`} onClick={() => {
                                                //if (selectedMember?.role?.slug !== "owner") {
                                                toggleMembers(
                                                    modSlug,
                                                    "selected_members",
                                                    "unassigned"
                                                );
                                                // }
                                                }} key={`${modSlug}-${perm}-unassigned`}>
                                                <span className="team--initial">U</span>
                                                <Card.Body>
                                                <h4>Unassigned</h4>
                                                </Card.Body>
                                                <FiCheck className="ms-auto" />
                                            </Card>
                                            )}
                                        </div>
                                        )}
                                    </>
                                )
                                })}

                        </div>
                        )
                    })}
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={handleSubmit} type="submit" disabled={loader}>{loader ? "Please wait..." : "Save Role"}</Button>
            </Modal.Footer>
        </Modal>
      )}
    </>
  );
}

export default Roles;
