import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Form,
  ListGroup,
  Table,
  Card,
  Modal,
  FloatingLabel,
  FormGroup,
  Accordion,
} from "react-bootstrap";
import { FaChevronDown, FaEdit, FaTrashAlt } from "react-icons/fa";
import Spinner from "react-bootstrap/Spinner";
import {
  getUserProfile,
  updateProfile,
} from "../../redux/actions/auth.actions";
import { getFieldRules, validateField } from "../../helpers/rules";
import { AlertDialog } from "../modals";
import { permissionModules } from "../../helpers/permissionsModules";
import { FaPlus } from "react-icons/fa";
import {
  updatePermissions,
  addRoleWithPermissions,
  deleteRole
} from "../../redux/actions/permission.action";
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
          <strong>{label}</strong> {value}{" "}
          <FaEdit onClick={() => onEditClick(true)} />
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
      <div className="team--page">
        <div className="page--wrapper setting--page">
          {spinner && (
            <div class="loading-bar">
              <img src="images/OnTeam-icon-gray.png" className="flipchar" />
            </div>
          )}
          <div className="setting--tabs">
            <h2>Settings</h2>
            <ListGroup horizontal className={isActive ? "toggle--menu" : ""}>
              <ListGroup.Item
                action
                active={activeTab === "Profile"}
                onClick={() => setActiveTab("Profile")}
              >
                Profile
              </ListGroup.Item>
              <ListGroup.Item
                action
                active={activeTab === "Permissions"}
                onClick={() => {
                  setActiveTab("Permissions");
                }}
              >
                Role & Permissions{" "}
                <Button variant="primary" onClick={() => handleShow()}>
                  <FaPlus />
                </Button>
              </ListGroup.Item>
            </ListGroup>
            {activeTab === "Permissions" && (
              <>
                <ListGroup
                  horizontal
                  className={isActive ? "toggle--menu" : ""}
                >
                  {roles.map((role, index) => {
                    return (
                      <ListGroup.Item
                        key={`role-${role._id}`}
                        action
                        active={activeRole?._id === role._id}
                        onClick={() => setActiveRole(role)}
                      >
                        {role.name}
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </>
            )}
          </div>
          {activeTab === "Profile" && (
            <div className="rounded--box">
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
                    {userProfile?.avatar && <span>Edit Photo</span>}
                  </Form.Label>
                  {userProfile?.avatar && (
                    <span className="remove--photo" onClick={removeAvatar}>
                      <FaTrashAlt />
                    </span>
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
          {activeTab === "Permissions" && (
            <div className="rounded--box permission__page">
              <div className="wrapper--title">
                <div className="projecttitle">
                  <h3>
                    <strong>Role & Permissions</strong>
                  </h3>
                </div>
              </div>
              <Card horizontal>
                {activeRole && Object.keys(activeRole).length > 0 && (
                  <>
                    <div className="card--header">
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
                      </div>
                      <div className="card--header">
                      <FormGroup className="form-group mb-0 pb-0">
                        <Form.Check
                          type="checkbox"
                          id="all"
                          label="Select All Permissions"
                          checked={permissionModules.every((mod) => {
                            const modSlug = mod.slug;
                            const modPerms = permissions?.[modSlug] || {};

                            const allPermsChecked = (
                              mod.permissions || []
                            ).every((perm) => modPerms[perm] === true);

                            const selectedIds =
                              modPerms["selected_members"] || [];
                            const allMemberIds = memberFeeds.map((m) =>
                              String(m._id)
                            );
                            if (modSlug === "projects")
                              allMemberIds.push("unassigned");

                            const allMembersChecked =
                              selectedIds.length === allMemberIds.length &&
                              allMemberIds.every((id) =>
                                selectedIds.includes(id)
                              );

                            if (
                              [
                                "tracking",
                                "projects",
                                "reports",
                                "attendance",
                              ].includes(modSlug)
                            ) {
                              return allPermsChecked && allMembersChecked;
                            }

                            return allPermsChecked;
                          })}
                          onChange={(e) =>
                            handleSelectAllPermissions(e.target.checked)
                          }
                        />
                      </FormGroup>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0"
                        onClick={handleToggleExpandAll}
                      >
                        {permissionModules.every((mod) => expanded[mod.slug])
                          ? "Collapse All"
                          : "Expand All"}
                      </Button>
                    </div>
                    <Accordion
                      activeKey={Object.entries(expanded)
                        .filter(([_, v]) => v)
                        .map(([k]) => k)}
                      alwaysOpen
                    >
                      {permissionModules.map((mod) => {
                        const modSlug = mod.slug;
                        const modPerms = permissions?.[modSlug] || {};
                        const isExpanded = expanded?.[modSlug] || false;
                        const isViewChecked = !!modPerms.view;
                        const truePermissionCount = Object.values(
                          modPerms
                        ).filter((val) => val === true).length;
                        return (
                          <Accordion.Item eventKey={modSlug}>
                            <Accordion.Header
                              onClick={() => {
                                setExpanded((prev) => ({
                                  ...prev,
                                  [modSlug]: !prev[modSlug],
                                }));
                              }}
                            >
                              {mod.name}{" "}
                              <span className="per--count">
                                {truePermissionCount}/{mod?.permissions?.length}
                              </span>
                            </Accordion.Header>
                            <Accordion.Body>
                              <div className="transition-all">
                                {/* Permissions List */}
                                {/* {isExpanded && ( */}
                                <div className="transition-all">
                                  {(mod.permissions || []).map((perm) => {
                                    if (perm === "view") {
                                      return (
                                        <Form.Check
                                          key={`${modSlug}--view`}
                                          type="checkbox"
                                          id={`${modSlug}-view`}
                                          label="View"
                                          checked={!!modPerms.view}
                                          onChange={() => toggleView(modSlug)}
                                        />
                                      );
                                    }

                                    return (
                                      <>
                                        <Form.Check
                                          key={perm}
                                          type="checkbox"
                                          id={`${modSlug}-${perm}`}
                                          label={perm
                                            .replace(/[_-]/g, " ")
                                            .replace(/^\w/, (l) =>
                                              l.toUpperCase()
                                            )}
                                          disabled={!isViewChecked}
                                          checked={!!modPerms[perm]}
                                          onChange={() =>
                                            togglePermission(modSlug, perm)
                                          }
                                          className={
                                            !isViewChecked ? "text-muted" : ""
                                          }
                                        />
                                        {[
                                          "tracking",
                                          "projects",
                                          "reports",
                                        ].includes(modSlug) &&
                                          perm === "view_others" &&
                                          modPerms[perm] === true && (
                                            <>
                                              <Form.Check
                                                key={`${modSlug}-${perm}-select-all`}
                                                type="checkbox"
                                                id={`${modSlug}-${perm}-select-all`}
                                                label="Select all"
                                                checked={memberFeeds.every(
                                                  (member) =>
                                                    modPerms[
                                                      "selected_members"
                                                    ]?.includes(
                                                      String(member._id)
                                                    )
                                                )}
                                                onChange={(e) =>
                                                  handleSelectAll(
                                                    modSlug,
                                                    e.target.checked
                                                  )
                                                }
                                                className="sub-items"
                                              />
                                              {memberFeeds.map((member) => (
                                                <Form.Check
                                                  key={`${modSlug}-${perm}-${member._id}`}
                                                  type="checkbox"
                                                  id={`${modSlug}-${perm}-${member._id}`}
                                                  label={member.name}
                                                  checked={modPerms[
                                                    "selected_members"
                                                  ]?.includes(
                                                    String(member._id)
                                                  )}
                                                  onChange={() =>
                                                    toggleMembers(
                                                      modSlug,
                                                      "selected_members",
                                                      member._id
                                                    )
                                                  }
                                                  className="sub-items"
                                                />
                                              ))}
                                              {modSlug === "projects" && (
                                                <Form.Check
                                                  key={`${modSlug}-${perm}-unassigned`}
                                                  type="checkbox"
                                                  id={`${modSlug}-${perm}-unassigned`}
                                                  label="Unassigned"
                                                  checked={modPerms[
                                                    "selected_members"
                                                  ]?.includes("unassigned")}
                                                  disabled={
                                                    activeRole?.slug === "owner"
                                                  }
                                                  onChange={() => {
                                                    if (
                                                      activeRole.slug !==
                                                      "owner"
                                                    ) {
                                                      toggleMembers(
                                                        modSlug,
                                                        "selected_members",
                                                        "unassigned"
                                                      );
                                                    }
                                                  }}
                                                  className="sub-items"
                                                />
                                              )}
                                            </>
                                          )}
                                      </>
                                    );
                                  })}
                                </div>
                                {/* )} */}
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                        );
                      })}

                      <div className="mt-4 text-end">
                      <Button variant="danger" onClick={() => setShowDelete(true)}>
                          Delete Role
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                          Save Permissions
                        </Button>
                      </div>
                    </Accordion>
                  </>
                )}
              </Card>
            </div>
          )}
          {show && (
            <Modal show={show} onHide={() => setShow(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Add New Role</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <div className="project--form">
                  <div className="project--form--inputs">
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

                      <>
                        <div className="card--header">
                          <FormGroup className="form-group mb-0 pb-0">
                            <Form.Check
                              type="checkbox"
                              id="all"
                              label="Select All Permissions"
                              checked={permissionModules.every((mod) => {
                                const modSlug = mod.slug;
                                const modPerms = permissions?.[modSlug] || {};
      
                                const allPermsChecked = (mod.permissions || []).every(
                                  (perm) => modPerms[perm] === true
                                );
      
                                const selectedIds =
                                  modPerms["selected_members"] || [];
                                const allMemberIds = memberFeeds.map((m) =>
                                  String(m._id)
                                );
                                if (modSlug === "projects")
                                  allMemberIds.push("unassigned");
      
                                const allMembersChecked =
                                  selectedIds.length === allMemberIds.length &&
                                  allMemberIds.every((id) =>
                                    selectedIds.includes(id)
                                  );
      
                                if (
                                  [
                                    "tracking",
                                    "projects",
                                    "reports",
                                    "attendance",
                                  ].includes(modSlug)
                                ) {
                                  return allPermsChecked && allMembersChecked;
                                }
      
                                return allPermsChecked;
                              })}
                              onChange={(e) =>
                                handleSelectAllPermissions(e.target.checked)
                              }
                            />
                          </FormGroup>
                          <Button
                            type="button"
                            variant="link"
                            className="p-0"
                            onClick={handleToggleExpandAll}
                          >
                            {permissionModules.every((mod) => expanded[mod.slug])
                              ? "Collapse All"
                              : "Expand All"}
                          </Button>
                        </div>
                        <Accordion
                          activeKey={Object.entries(expanded)
                            .filter(([_, v]) => v)
                            .map(([k]) => k)}
                          alwaysOpen
                        >
                          {permissionModules.map((mod) => {
                            const modSlug = mod.slug;
                            const modPerms = permissions?.[modSlug] || {};
                            const isExpanded = expanded?.[modSlug] || false;
                            const isViewChecked = !!modPerms.view;
                            const truePermissionCount = Object.values(
                              modPerms
                            ).filter((val) => val === true).length;
                            return (
                              <Accordion.Item eventKey={modSlug}>
                                <Accordion.Header
                                  onClick={() => {
                                    setExpanded((prev) => ({
                                      ...prev,
                                      [modSlug]: !prev[modSlug],
                                    }));
                                  }}
                                >
                                  {mod.name}{" "}
                                  <span className="per--count">
                                    {truePermissionCount}/{mod?.permissions?.length}
                                  </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                  <div className="transition-all">
                                    {/* Permissions List */}
                                    {/* {isExpanded && ( */}
                                    <div className="transition-all">
                                      {(mod.permissions || []).map((perm) => {
                                        if (perm === "view") {
                                          return (
                                            <Form.Check
                                              key={`${modSlug}--view`}
                                              type="checkbox"
                                              id={`${modSlug}-view`}
                                              label="View"
                                              checked={!!modPerms.view}
                                              onChange={() => toggleView(modSlug)}
                                            />
                                          );
                                        }
      
                                        return (
                                          <>
                                            <Form.Check
                                              key={perm}
                                              type="checkbox"
                                              id={`${modSlug}-${perm}`}
                                              label={perm
                                                .replace(/[_-]/g, " ")
                                                .replace(/^\w/, (l) =>
                                                  l.toUpperCase()
                                                )}
                                              disabled={!isViewChecked}
                                              checked={!!modPerms[perm]}
                                              onChange={() =>
                                                togglePermission(modSlug, perm)
                                              }
                                              className={
                                                !isViewChecked ? "text-muted" : ""
                                              }
                                            />
                                            {[
                                              "tracking",
                                              "projects",
                                              "reports",
                                            ].includes(modSlug) &&
                                              perm === "view_others" &&
                                              modPerms[perm] === true && (
                                                <>
                                                  <Form.Check
                                                    key={`${modSlug}-${perm}-select-all`}
                                                    type="checkbox"
                                                    id={`${modSlug}-${perm}-select-all`}
                                                    label="Select all"
                                                    checked={memberFeeds.every(
                                                      (member) =>
                                                        modPerms[
                                                          "selected_members"
                                                        ]?.includes(
                                                          String(member._id)
                                                        )
                                                    )}
                                                    onChange={(e) =>
                                                      handleSelectAll(
                                                        modSlug,
                                                        e.target.checked
                                                      )
                                                    }
                                                    className="sub-items"
                                                  />
                                                  {memberFeeds.map((member) => (
                                                    <Form.Check
                                                      key={`${modSlug}-${perm}-${member._id}`}
                                                      type="checkbox"
                                                      id={`${modSlug}-${perm}-${member._id}`}
                                                      label={member.name}
                                                      checked={modPerms[
                                                        "selected_members"
                                                      ]?.includes(String(member._id))}
                                                      onChange={() =>
                                                        toggleMembers(
                                                          modSlug,
                                                          "selected_members",
                                                          member._id
                                                        )
                                                      }
                                                      className="sub-items"
                                                    />
                                                  ))}
                                                  {modSlug === "projects" && (
                                                    <Form.Check
                                                      key={`${modSlug}-${perm}-unassigned`}
                                                      type="checkbox"
                                                      id={`${modSlug}-${perm}-unassigned`}
                                                      label="Unassigned"
                                                      checked={modPerms[
                                                        "selected_members"
                                                      ]?.includes("unassigned")}
                                                      disabled={
                                                        activeRole?.slug === "owner"
                                                      }
                                                      onChange={() => {
                                                        
                                                          toggleMembers(
                                                            modSlug,
                                                            "selected_members",
                                                            "unassigned"
                                                          );
                                                        
                                                      }}
                                                      className="sub-items"
                                                    />
                                                  )}
                                                </>
                                              )}
                                          </>
                                        );
                                      })}
                                    </div>
                                    {/* )} */}
                                  </div>
                                </Accordion.Body>
                              </Accordion.Item>
                            );
                          })}
                        </Accordion>
                      </>
                      <Button variant="primary" type="submit" disabled={loader}>
                        {loader ? "Please wait..." : "Save Role"}
                      </Button>
                    </Form>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
          )}

        {showdelete && (
          <AlertDialog
            showdialog={showdelete}
            toggledialog={setShowDelete}
            msg="Are you sure?"
            callback={handleDeleteRole}
          />
            
          )}
        </div>
      </div>
    </>
  );
}

export default SettingPage;
