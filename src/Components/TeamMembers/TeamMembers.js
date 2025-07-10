import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  FloatingLabel,
  Card,
  ListGroup,
  Table,
  Accordion,
  Dropdown,
  FormGroup,
} from "react-bootstrap";
import { FaList, FaPlus, FaRegTrashAlt, FaCog } from "react-icons/fa";
import {
  FiEdit,
  FiMail,
  FiSidebar,
  FiBriefcase,
  FiShield,
  FiPhone,
  FiCalendar,
  FiVideo,
} from "react-icons/fi";
import { AiOutlineTeam } from "react-icons/ai";
import { BsBriefcase, BsEye, BsGrid } from "react-icons/bs";
import { GrExpand } from "react-icons/gr";
import { TbArrowsSort } from "react-icons/tb";
import { MdOutlineSearch, MdOutlineClose, MdSearch } from "react-icons/md";
import { getMemberdata } from "../../helpers/commonfunctions";
import {
  Listmembers,
  deleteMember,
  updateMember,
} from "../../redux/actions/members.action";
import {
  toggleSidebar,
  toggleSidebarSmall,
} from "../../redux/actions/common.action";
import { leaveCompany } from "../../redux/actions/workspace.action";
import { useNavigate } from "react-router-dom";
import { getAvailableRolesByWorkspace } from "../../redux/actions/workspace.action";
import { getFieldRules, validateField } from "../../helpers/rules";
import { createMember } from "../../redux/actions/members.action";
import Invitation from "./Invitation";
import { AlertDialog, TransferOnwerShip } from "../modals";
import { selectboxObserver } from "../../helpers/commonfunctions";
import { socket, currentMemberProfile } from "../../helpers/auth";
import { updatePermissions } from "../../redux/actions/permission.action";
import { permissionModules } from "../../helpers/permissionsModules";
import { CustomFieldModal } from "../modals/customFields";
import { fetchCustomFields } from "../../redux/actions/customfield.action";
import { renderDynamicField } from "../common/dynamicFields";
function EditableField({
  selectedMember,
  field,
  label,
  value,
  onChange,
  isEditing,
  onEditClick,
  error,
  roles,
  printval,
}) {
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const [originalValue, setOriginalValue] = useState(value);

  useEffect(() => {
    // if( !value ){
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        if (inputRef.current && inputRef.current.contains(event.target)) {
          return; // Click is inside the select box or input field
        }
        if (inputRef.current.value.trim() === "") {
          onChange(originalValue);
        }
      }
    }

    if (isEditing) {
      setOriginalValue(value);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      document.addEventListener("mousedown", handleClickOutside);
      selectboxObserver();
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      if (document.querySelector(".conditional-box")) {
        document.querySelector(".conditional-box").remove();
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // }
  }, [isEditing]);

  if (field === "role") {
    return (
      <ListGroup.Item ref={wrapperRef}>
        <span className="info--icon">
          <FiBriefcase />
        </span>
        <p>
          <small>Role</small>
          {isEditing ? (
            <>
              <Form.Group className="mb-0 form-group pb-0">
                <Form.Select
                  ref={inputRef}
                  className={
                    error
                      ? "input-error form-control custom-selectbox conditional-box"
                      : "form-control custom-selectbox conditional-box"
                  }
                  defaultValue={value}
                  onChange={(e) => onChange(e.target.value)}
                  name="role"
                >
                  <option value="none">None</option>
                  {roles.map((role, index) => (
                    <option key={index} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </Form.Select>

                <span className="error">{error}</span>
              </Form.Group>
            </>
          ) : (
            <>
              {printval}
              <FiEdit
                onClick={() => onEditClick(true)}
                style={{ cursor: "pointer" }}
              />
            </>
          )}
        </p>
      </ListGroup.Item>
    );
  } else if (field !== "email") {
    return (
      <li ref={wrapperRef}>
        <strong>{label}</strong>
        {isEditing ? (
          <>
            <Form.Control
              type="text"
              ref={inputRef}
              placeholder="Search Member.."
              onChange={(e) => onChange(e.target.value)}
              id={`${field}`}
              label={label}
              name={`${field}`}
              value={value}
            />
          </>
        ) : (
          <>
            {value}
            <FiEdit
              onClick={() => onEditClick(true)}
              style={{ cursor: "pointer" }}
            />
            <p className="MuiFormHelperText-root Mui-error">
              <span className="error">{error}</span>
            </p>
          </>
        )}
      </li>
    );
  }
  return null;
}

function TeamMembersPage() {
  const memberProfile = currentMemberProfile();
  const currentMember = getMemberdata();
  //const addToast = useToast();
  const [isActive, setIsActive] = useState(0);
  const handleClick = (event) => {
    setIsActive((current) => !current);
  };

  const handleTableToggle = (member) => {
    setSelectedMember(member);
    if (!isActive) {
      setIsActive(true);
    }
  };
  const apiPermission = useSelector((state) => state.permissions);
  const apiCustomfields = useSelector((state) => state.customfields);
  const [isActiveView, setIsActiveView] = useState(2);
  const [adjustPermissions, setAdjustPermissions] = useState(false);
  const [rows, setRows] = useState([{ email: "", role: "" }]);
  const [errors, setErrors] = useState([]);
  let fieldErrors = {};
  let hasError = false;
  const deleteSuccess = useSelector((state) => state.member.deletedMember);
  const [fields, setFields] = useState({ email: "", name: "", role: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loader, setLoader] = useState(false);
  const [updateloader, setUpdateLoader] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [memberIndex, setMemberIndex] = useState("");
  // const [memberMeta, setMemberMeta] = useState({})
  // const [disable, setDisable] = useState(true);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const workspaceState = useSelector((state) => state.workspace);
  const [show, setShow] = useState(false);
  const handleClose = () => {
    requestAnimationFrame(() => {
      setRows([{ email: "", role: "" }]);
      setErrors([]);
      setShow(false);
    });
  };
  const [tab, setTab] = useState("details");
  const handleShow = () => setShow(true);
  const [activeTab, setActiveTab] = useState("Members");
  // const [activeSubTab, setActiveSubTab] = useState("Grid");
  const [activeSubTab, setActiveSubTab] = useState("GridView");
  const [resetmemberList, setresetmemberList] = useState(false);
  const handleSidebar = () =>
    dispatch(toggleSidebar(commonState.sidebar_open ? false : true));
  const handleSidebarSmall = () =>
    dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true));
  const commonState = useSelector((state) => state.common);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberFeeds, setMemberFeed] = useState([]);
  const [showloader, setShowloader] = useState(false);
  const apiResult = useSelector((state) => state.member);
  const [searchTerm, setsearchTerm] = useState("");
  const memberFeed = useSelector((state) => state.member.members);
  const [editedMember, setEditedMember] = useState({});
  const [showdialog, setShowDialog] = useState(false);
  const [roles, setRoles] = useState([]);
  const handleListMember = async () => {
    if (activeTab === "Members") {
      setMemberFeed([]);

      await dispatch(Listmembers(currentPage, searchTerm));
      setShowloader(false);
    }
  };

  const [showSearch, setSearchShow] = useState(false);
  const handleSearchClose = () => setSearchShow(false);
  const handleSearchShow = () => setSearchShow(true);

  const handledeleteMember = async () => {
    await dispatch(deleteMember(selectedMember._id));
  };

  const handleleavecompany = async () => {
    await dispatch(
      leaveCompany({
        memberId: selectedMember._id,
        companyId: currentMember.company._id,
      })
    );
  };

  const handleownership = async () => {
    console.log("transfer ownership");
  };

  const toggleCustomFields = () => {
    setShowCustomFields((prev) => !prev);
  };

  useEffect(() => {
    dispatch(getAvailableRolesByWorkspace({ fields: "_id name permissions" }));
    let prm = {};
    permissionModules.forEach((mod) => {
      prm[mod.slug] = {}; // Initialize object for each module
      mod.permissions.forEach((p) => {
        prm[mod.slug][p] = "";
      });
    });

    setPermissions(prm);
  }, []);

  useEffect(() => {
    if (currentPage !== "" && activeTab === "Members") {
      setShowloader(true);
      handleListMember();
    }
    dispatch(fetchCustomFields({ module: "members" }));
  }, [currentPage, searchTerm]);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEditing === true) {
      selectboxObserver();
    }
  }, [isEditing]);

  useEffect(() => {
    if (apiResult.success) {
      if (activeTab === "Members") {
        if (apiResult.updatedMember) {
          socket.emit("refresh_record_type", selectedMember?._id);
          const updatedMemberFeeds = memberFeeds.map((m) =>
            m._id.toString() === apiResult.updatedMember._id.toString()
              ? apiResult.updatedMember
              : m
          );

          setMemberFeed(updatedMemberFeeds);
          setSelectedMember(apiResult.updatedMember);
        } else {
          handleListMember();
        }
      }
      setLoader(false);
      setUpdateLoader(false);
      setRows([{ email: "", role: "" }]);
      setErrors([]);
      setShow(false);
    }
    if (
      workspaceState.available_roles &&
      workspaceState.available_roles.length > 0
    ) {
      setRoles(workspaceState.available_roles);
    }
    if (apiResult.deletedMember) {
      setIsActive(false);
      setShowDialog(false);
    }
  }, [apiResult, workspaceState]);

  useEffect(() => {
    setLoader(false);
    if (apiPermission.success && activeTab === "Members") {
      if (apiPermission.updatedMember) {
        const updatedMemberFeeds = memberFeeds.map((m) =>
          m._id.toString() === apiPermission.updatedMember._id.toString()
            ? apiPermission.updatedMember
            : m
        );

        setMemberFeed(updatedMemberFeeds);
      }
    }
  }, [apiPermission]);

  useEffect(() => {
    if (
      workspaceState.available_roles &&
      workspaceState.available_roles.length > 0
    ) {
      setRoles(workspaceState.available_roles);
    }
  }, [workspaceState]);

  useEffect(() => {
    if (apiCustomfields.customFields) {
      setCustomFields(apiCustomfields.customFields);
    }

    if (apiCustomfields.newField) {
      setCustomFields((prevCustomFields) => [
        apiCustomfields.newField,
        ...prevCustomFields,
      ]);
    }

    if (apiCustomfields.updatedField) {
      setCustomFields((prevCustomFields) =>
        prevCustomFields.map((field) =>
          field._id === apiCustomfields.updatedField._id
            ? apiCustomfields.updatedField
            : field
        )
      );
    }
  }, [apiCustomfields]);

  useEffect(() => {
    if (memberFeed && memberFeed.memberData) {
      setMemberFeed(memberFeed.memberData);
    }
  }, [memberFeed]);

  useEffect(() => {
    if (selectedMember !== null) {
      const cleanedMeta = { ...selectedMember?.memberMeta };

      // if (cleanedMeta?.permissions) {
      //   delete cleanedMeta.permissions;
      // }
      // Add 'recordings' key with value 'both' if not present
      if (!("recording" in cleanedMeta)) {
        cleanedMeta.recording = {
          meta_key: "recording",
          meta_value: "screenshot_only",
        };
      }
      // setEditedMember({
      //   name: selectedMember.name,
      //   role: selectedMember.role?._id,
      //   rolename: selectedMember.role?.name,
      //   memberMeta: cleanedMeta, //selectedMember?.memberMeta
      // });
      let fieldsSetup = {
        name: selectedMember?.name,
        role: selectedMember?.role?._id,
      };

      if (cleanedMeta && Object.keys(cleanedMeta).length > 0) {
        Object.values(cleanedMeta).forEach((field) => {
          fieldsSetup[`custom_field[${field.meta_key}]`] = field.meta_value;
        });
      } else {
        customFields.forEach((field) => {
          fieldsSetup[`custom_field[${field.name}]`] = "";
        });
      }
      setFields(fieldsSetup);
      const merged = {};

      // Step 1: Initialize merged with empty string values
      permissionModules.forEach((mod) => {
        merged[mod.slug] = {};
        mod.permissions.forEach((p) => {
          merged[mod.slug][p] = "";
        });
      });

      setPermissions((prev) => {
        const newPerms = cleanedMeta?.permissions?.meta_value || {};

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
    }
  }, [selectedMember]);

  useEffect(() => {
    console.log(fields);
  }, [fields]);

  const handleEditClick = (fieldName) => {
    setIsEditing((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const removeError = (field) => {
    setErrors({ ...fieldErrors, [field]: "" });
  };

  const handleFieldChange = (field, value) => {
    // if (field in editedMember) {
    if (field === "avatar") {
      setAvatarPreview(URL.createObjectURL(value.target.files[0]));
      setEditedMember((prevState) => ({
        ...prevState,
        [field]: value.target.files[0],
      }));
    } else if (field === "memberMeta") {
      const metakey = value.target.name;
      const meta_value = value.target.value;

      setEditedMember((prevState) => ({
        ...prevState,
        memberMeta: {
          ...prevState.memberMeta,
          [metakey]: meta_value,
        },
      }));
    } else if (field === "role") {
      const matchingRole = roles.find((role) => role._id === value);
      setEditedMember((prevState) => ({
        ...prevState,
        ["rolename"]: matchingRole?.name,
        ["role"]: matchingRole._id,
        memberMeta: {
          ...prevState.memberMeta,
          ["permissions"]: matchingRole.permissions,
        },
      }));
      if (value !== "") {
        removeError(field);
      }
    } else {
      setEditedMember((prevState) => ({
        ...prevState,
        [field]: value,
      }));

      if (value !== "") {
        removeError(field);
      }
    }
  };

  const handleChange = ({ target: { name, value, type, files, checked } }) => {
    const finalValue =
      type === "checkbox" ? checked : type === "file" ? files : value;

    if (name === "role") {
      const matchingRole = roles.find((role) => role._id === value);
      setFields((prevState) => ({
        ...prevState,
        role: matchingRole._id,
        ["custom_field[permissions]"]: matchingRole.permissions,
      }));
    } else {
      setFields({ ...fields, [name]: finalValue });
    }

    setErrors({ ...errors, [name]: "" });
  };

  const handleChangeOld = (event, fieldname = "") => {
    // const { name, value, type, files } = event.target;
    // const updatedRows = [...rows];
    // updatedRows[index] = { ...updatedRows[index], [name]: value };
    // setRows(updatedRows);
    // const updatedErrors = [...errors];
    // // Check if there is an error message for the specified field at the given index
    // if (updatedErrors[index] && updatedErrors[index][name]) {
    //   // If an error message exists, update it to an empty string to remove the error
    //   updatedErrors[index][name] = "";
    // }
    // // Update the errors state with the updated array
    // setErrors(updatedErrors);
  };
  const showError = (name) => {
    if (errors && errors[name])
      return <span className="error">{errors[name]}</span>;
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoader(true);
    let updatedErrors = {};

    for (const [fieldName, value] of Object.entries(fields)) {
      // Get rules for the current field
      const rules = getFieldRules("add_member", fieldName);

      // Validate the field
      const error = await validateField("add_member", fieldName, value, rules);

      // If error exists, store it
      if (error) {
        updatedErrors[fieldName] = error;
      }
    }

    // Check for unique email values across all rows
    const emailSet = new Set();

    const email = fields.email;
    if (email === "") return;

    if (emailSet.has(email)) {
      updatedErrors["email"] = "Email must be unique";
    }

    // Check if there are any errors
    const hasError = Object.keys(updatedErrors).length > 0;

    // If there are errors, update the errors state
    if (hasError) {
      setLoader(false);
      setErrors(updatedErrors);
    } else {
      const formData = new FormData();
      Object.entries(fields).forEach(([fieldName, value]) => {
        if (Array.isArray(value)) {
          // Check if the value is an array
          if (value.length === 0) {
            formData.append(`${fieldName}[]`, []); // Append an empty array
          } else {
            value.forEach((item) => {
              formData.append(`${fieldName}[]`, item); // Append with the same key for non-empty arrays
            });
          }
        } else if (typeof value === "object") {
          formData.append(fieldName, JSON.stringify(value));
        } else {
          formData.append(`${fieldName}`, value);
        }
      });

      await dispatch(createMember(formData));
      setLoader(false);
    }
  };

  const addRow = () => {
    setRows([...rows, { email: "", role: "" }]);
  };

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    const updatedErrors = errors.filter((_, i) => i !== index);
    setRows(updatedRows);
    setErrors(updatedErrors);
  };

  useEffect(() => {
    if (rows.length > 0) {
      selectboxObserver();
    }
  }, [rows]);

  const compareMembers = (original, edited) => {
    const changes = {};
    for (const [key, value] of Object.entries(edited)) {
      if (original[key] !== value) {
        changes[key] = value;
      }
    }
    return changes;
  };

  const [permissions, setPermissions] = useState({});
  const [expanded, setExpanded] = useState({});
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

  const handleSelectAll = (modSlug, isChecked) => {
    const memberIds = memberFeeds.map((member) => String(member._id));
    memberIds.push("unassigned");
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

  const [projectToggle, setProjectToggle] = useState(false);
  const handleToggles = () => {
    if (commonState.sidebar_small === false) {
      console.log("1");
      handleSidebarSmall();
    } else {
      setProjectToggle(false);
      handleSidebarSmall();
      console.log("3");
    }
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

  useEffect(() => {
    console.log("permissions:: ", permissions);
  }, [permissions]);

  const handleSave = async (e) => {
    setLoader(true);
    try {
      const roleData = {
        memberId: selectedMember._id,
        permissions,
        type: "member",
      };
      setLoader(true);
      dispatch(updatePermissions(roleData));
    } catch (err) {
      setLoader(false);
      console.error("Error adding role:", err);
      alert("Error adding role");
    }
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    // const changes = compareMembers(selectedMember, editedMember);

    if (Object.keys(fields).length > 0) {
      const updatedErrorsPromises = Object.entries(fields).map(
        async ([fieldName, value]) => {
          // Get rules for the current field
          const rules = getFieldRules("add_member", fieldName);
          // Validate the field
          const error = await validateField(
            "add_member",
            fieldName,
            value,
            rules
          );
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
        setErrors(fieldErrors);
        selectboxObserver();
      } else {
        if (Object.keys(fields).length > 0) {
          setUpdateLoader(true);
          const formData = new FormData();
          for (const [key, value] of Object.entries(fields)) {
            if (key === "avatar" && value instanceof File) {
              formData.append("files[]", value);
            } else if (Array.isArray(value)) {
              // Check if the value is an array
              if (value.length === 0) {
                formData.append(`${key}[]`, []); // Append an empty array
              } else {
                value.forEach((item) => {
                  formData.append(`${key}[]`, item); // Append with the same key for non-empty arrays
                });
              }
            } else if (typeof value === "object") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
          await dispatch(updateMember(selectedMember?._id, formData));
          //  setLoader(false)
        }
      }
    } else {
    }
  };

  const showPermissionsModal = () => {
    const permissionsField = fields[`custom_field[permissions]`];

    if (permissionsField) {
      setPermissions(permissionsField);
    }

    setShowPermissions(true);
  };

  const handleSavePermissions = () => {
    // const updatedRows = [...rows];
    // updatedRows[memberIndex] = {
    //   ...updatedRows[memberIndex],
    //   ["permissions"]: permissions,
    // };
    // setRows(updatedRows);
    setFields({
      ...fields,
      [`custom_field[permissions]`]: permissions,
    });

    setShowPermissions(false);
  };

  const pagetopbar = () => {
    return (
      <div className="page--title px-md-2 py-3 bg-white border-bottom">
        <Container fluid>
          <Row>
            <Col sm={12}>
              <h2>
                <span
                  className="open--sidebar me-3 d-flex d-xl-none"
                  onClick={() => {
                    handleSidebarSmall(false);
                    setIsActive(0);
                  }}
                >
                  <FiSidebar />
                </span>
                {activeTab}
                <ListGroup
                  horizontal
                  className={
                    isActive ? "d-none" : "me-3 ms-auto d-none d-md-flex"
                  }
                >
                  <ListGroup horizontal>
                    <ListGroup.Item
                      className="d-none d-md-block"
                      action
                      active={activeTab === "Members"}
                      onClick={() => {
                        setsearchTerm("");
                        setActiveTab("Members");
                      }}
                    >
                      <AiOutlineTeam /> Team Members
                    </ListGroup.Item>
                    {(memberProfile?.permissions?.members
                      ?.create_edit_delete === true ||
                      memberProfile?.role?.slug === "owner") && (
                      <ListGroup.Item
                        className="d-none d-md-block"
                        action
                        active={activeTab === "Invitations"}
                        onClick={() => {
                          setsearchTerm("");
                          setActiveTab("Invitations");
                        }}
                      >
                        <FiMail /> Invitations
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                  <ListGroup.Item className="d-none d-xl-block ms-3">
                    <Form
                      className="search-filter-list"
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <Form.Group className="mb-0 form-group">
                        <MdOutlineSearch />
                        <Form.Control
                          type="text"
                          placeholder={
                            activeTab === "Members"
                              ? "Search Member.."
                              : "Search Invitations.."
                          }
                          onChange={(e) => setsearchTerm(e.target.value)}
                        />
                      </Form.Group>
                    </Form>
                  </ListGroup.Item>
                </ListGroup>
                <ListGroup
                  horizontal
                  className={isActive ? "d-none" : "d-flex ms-auto ms-md-0"}
                >
                  <ListGroup horizontal>
                    <ListGroup.Item
                      action
                      className="view--icon d-none d-lg-flex"
                      active={isActiveView === 1}
                      onClick={() => setIsActiveView(1)}
                    >
                      <BsGrid />
                    </ListGroup.Item>
                    <ListGroup.Item
                      action
                      className="d-none d-lg-flex view--icon"
                      active={isActiveView === 2}
                      onClick={() => setIsActiveView(2)}
                    >
                      <FaList />
                    </ListGroup.Item>
                  </ListGroup>
                  <ListGroup
                    horizontal
                    className={
                      isActive ? "d-none" : "d-flex bg-white expand--icon"
                    }
                  >
                    <ListGroup.Item
                      className="d-none d-lg-flex me-2"
                      key={`settingskey`}
                      onClick={toggleCustomFields}
                    >
                      <FaCog />
                    </ListGroup.Item>
                    <ListGroup.Item className="d-none d-lg-flex" onClick={handleToggles}>
                      <GrExpand />
                    </ListGroup.Item>
                    {(memberProfile?.permissions?.members
                      ?.create_edit_delete === true ||
                      memberProfile?.role?.slug === "owner") && (
                      <ListGroup.Item
                        className="btn btn-primary"
                        onClick={handleShow}
                      >
                        <FaPlus />
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </ListGroup>
              </h2>
              <ListGroup
                horizontal
                className={
                  isActive
                    ? "d-none"
                    : "me-auto mt-3 ms-0 d-flex d-md-none justify-content-start"
                }
              >
                <ListGroup horizontal>
                  <ListGroup.Item
                    action
                    active={activeTab === "Members"}
                    onClick={() => {
                      setsearchTerm("");
                      setActiveTab("Members");
                    }}
                  >
                    <AiOutlineTeam /> Team Members
                  </ListGroup.Item>
                  {(memberProfile?.permissions?.members?.create_edit_delete ===
                    true ||
                    memberProfile?.role?.slug === "owner") && (
                    <ListGroup.Item
                      action
                      active={activeTab === "Invitations"}
                      onClick={() => {
                        setsearchTerm("");
                        setActiveTab("Invitations");
                      }}
                    >
                      <FiMail /> Invitations
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </ListGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  };

  return (
    <>
      {activeTab === "Members" && (
        <div
          className={`${
            isActive
              ? "show--details team--page project-collapse"
              : "team--page"
          } ${projectToggle === true ? "project-collapse" : ""}`}
        >
          {pagetopbar()}
          <div className="page--wrapper px-md-2 py-3">
            {showloader && (
              <div className="loading-bar">
                <img src="images/OnTeam-icon.png" className="flipchar" />
              </div>
            )}
            <Container fluid className="pb-5 pt-2">
              <>
                <div
                  className={
                    isActiveView === 1
                      ? "project--grid--table project--grid--new--table table-responsive-xl"
                      : isActiveView === 2
                      ? "project--table draggable--table new--project--rows table-responsive-xl"
                      : "project--table new--project--rows table-responsive-xl"
                  }
                >
                  <Table>
                    <thead className="onHide">
                      <tr key="project-table-header">
                        <th
                          scope="col"
                          className="sticky p-0 border-bottom-0"
                          key="client-name-header"
                        >
                          <div className="d-flex align-items-center justify-content-between border-end border-bottom ps-3">
                            Member{" "}
                            <span key="client-action-header" className="onHide">
                              Actions
                            </span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          key="client-email-header"
                          className="onHide p-0 border-bottom-0"
                        >
                          <div className="border-bottom padd--x">
                            Email{" "}
                            <small>
                              <TbArrowsSort />
                            </small>
                          </div>{" "}
                        </th>
                        {Array.isArray(customFields) &&
                          customFields
                            .filter((field) => field?.showInTable !== false)
                            .map((field, idx) => (
                              <th
                                scope="col"
                                key={`member-field-${idx}-header`}
                                className="onHide"
                              >
                                {field.label}
                              </th>
                            ))}
                      </tr>
                    </thead>
                    <tbody>
                      {!showloader && memberFeeds && memberFeeds.length > 0
                        ? memberFeeds.map((member, idx) => (
                            <tr
                              key={`member-table-row-${idx}`}
                              className={
                                member._id === selectedMember?._id
                                  ? "project--active"
                                  : ""
                              }
                              onClick={
                                isActive
                                  ? () => handleTableToggle(member)
                                  : () => {
                                      return false;
                                    }
                              }
                            >
                              <td
                                className="project--title--td sticky"
                                data-label="Member Name"
                              >
                                <div className="d-flex justify-content-between border-end flex-wrap">
                                  <div className="project--name">
                                    <div className="drag--indicator">
                                      <abbr>{idx + 1}</abbr>
                                    </div>
                                    <div className="title--initial">
                                      {member.name.charAt(0)}
                                    </div>
                                    <div className="title--span flex-column align-items-start gap-0">
                                      <span>{member.name}</span>
                                      <strong>{member.role?.name}</strong>
                                    </div>
                                  </div>
                                  <div className="onHide task--buttons">
                                    <Button
                                      variant="primary"
                                      className="px-3 py-2"
                                      onClick={() => {
                                        handleTableToggle(member);
                                        setIsActive(true);
                                      }}
                                    >
                                      <BsEye />
                                    </Button>
                                  </div>
                                </div>
                              </td>
                              <td className="onHide new__td">{member.email}</td>
                              {Array.isArray(customFields) &&
                                customFields
                                  .filter(
                                    (field) => field?.showInTable !== false
                                  )
                                  .map((field, idx) => {
                                    const fieldname = field.name;
                                    let mvalue =
                                      member?.memberMeta?.[fieldname]
                                        ?.meta_value;
                                    if (
                                      field.type === "badge" &&
                                      Array.isArray(field.options)
                                    ) {
                                      const matchedOption = field.options.find(
                                        (opt) => opt.value === mvalue
                                      );
                                      if (matchedOption) {
                                        mvalue = (
                                          <span
                                            style={{
                                              backgroundColor:
                                                matchedOption.color,
                                              padding: "4px 8px",
                                              borderRadius: "8px",
                                              color: "#fff",
                                              display: "inline-block",
                                            }}
                                          >
                                            {
                                              member?.memberMeta?.[fieldname]
                                                ?.meta_value
                                            }
                                          </span>
                                        );
                                      }
                                    }
                                    return (
                                      <td
                                        key={`client-${
                                          fieldname || idx
                                        }-${mvalue}`}
                                        className="onHide"
                                      >
                                        {mvalue}
                                      </td>
                                    );
                                  })}
                              <td className="task--last--buttons">
                                <div className="d-flex justify-content-between flex-wrap">
                                  <div className="onHide">
                                    <Button
                                      variant="primary"
                                      className="px-3 py-2"
                                      onClick={() => {
                                        handleTableToggle(member);
                                        setIsActive(true);
                                      }}
                                    >
                                      <BsEye /> View
                                    </Button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))
                        : !showloader &&
                          memberFeeds &&
                          memberFeeds.length === 0 && (
                            <tr className="no--invite">
                              <td colSpan={5}>
                                <h2 className="mt-2 text-center">
                                  Members Not Found
                                </h2>
                              </td>
                            </tr>
                          )}
                    </tbody>
                  </Table>
                </div>
              </>
            </Container>
          </div>
        </div>
      )}
      {activeTab === "Invitations" && (
        <Invitation
          activeTab={activeTab}
          topbar={pagetopbar}
          activeSubTab={isActiveView}
          searchTerm={searchTerm}
          listfor="company"
          handleIsActive={setIsActive}
          toggleActive={setIsActive}
        />
      )}
      {isActive && (
        <div className="details--member--view">
          <div className="wrapper--title py-2 bg-white border-bottom">
            <span
              className="open--sidebar me-2 d-flex d-xl-none"
              onClick={() => {
                handleSidebarSmall(false);
                setIsActive(0);
              }}
            >
              <FiSidebar />
            </span>
            <div className="projecttitle me-auto">
              <Dropdown>
                <Dropdown.Toggle variant="link" id="dropdown-basic">
                  <h3>
                    <strong>{selectedMember?.name}</strong>
                    <span>{selectedMember?.role?.name}</span>
                  </h3>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className="drop--scroll">
                    {memberFeeds &&
                      memberFeeds.length > 0 &&
                      memberFeeds.map((member, idx) => (
                        <Dropdown.Item
                          onClick={() => {
                            handleTableToggle(member);
                            setIsActive(true);
                          }}
                          key={`item-${idx}`}
                        >
                          <strong>{member?.name}</strong>
                          <span>{member.role?.name}</span>
                        </Dropdown.Item>
                      ))}
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <ListGroup horizontal>
              <ListGroup.Item
                onClick={handleToggles}
                className="d-none d-lg-flex"
              >
                <GrExpand />
              </ListGroup.Item>
              <ListGroup.Item
                className="btn btn-primary"
                key={`closekey`}
                onClick={() => {
                  setIsActive(0);
                  setSelectedMember({});
                }}
              >
                <MdOutlineClose />
              </ListGroup.Item>
            </ListGroup>
          </div>

          <>
            <div className="rounded--box">
              <Card className="contact--card">
                <div className="card--img">
                  <Card.Img
                    variant="top"
                    src={selectedMember?.avatar ?? "./images/default.jpg"}
                  />
                </div>
                <Card.Body className="p-0 ps-4">
                  <Card.Title>
                    {selectedMember?.name}
                    {(memberProfile?.permissions?.members
                      ?.create_edit_delete === true ||
                      memberProfile?.role?.slug === "owner") && (
                      <FiEdit onClick={() => setIsEditing(true)} />
                    )}
                  </Card.Title>

                  {isEditing === false ? (
                    <>
                      <Card.Text>
                        <ListGroup>
                          <ListGroup.Item>
                            <span className="info--icon">
                              <FiMail />
                            </span>
                            <p>
                              <small>Email</small>
                              {selectedMember?.email}
                            </p>
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <span className="info--icon">
                              <BsBriefcase />
                            </span>
                            <p>
                              <small>Role</small>
                              {selectedMember?.role?.name}
                            </p>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Text>
                      <Card.Text>
                        <ListGroup>
                          <ListGroup.Item>
                            <p>
                              <small>Recording Type</small>

                              <span>
                                {selectedMember?.memberMeta?.recording
                                  ? selectedMember?.memberMeta?.recording?.meta_value
                                      ?.replace(/_/g, " ")
                                      .replace(/^./, (char) =>
                                        char.toUpperCase()
                                      )
                                  : "Screenshot only  "}
                              </span>
                            </p>
                          </ListGroup.Item>
                          {customFields?.length > 0 && (
                            <>
                              {customFields.map((field, index) => (
                                <ListGroup.Item key={index}>
                                  <small>{field.label}</small>
                                  {selectedMember?.memberMeta?.[field.name]
                                    ?.meta_value || ""}
                                </ListGroup.Item>
                              ))}
                            </>
                          )}
                        </ListGroup>
                      </Card.Text>
                    </>
                  ) : (
                    <>
                      <Card.Text>
                        <ListGroup>
                          <ListGroup.Item>
                            <span className="info--icon">
                              <FiMail />
                            </span>
                            <p>
                              <small>Email</small>
                              {selectedMember?.email}
                            </p>
                          </ListGroup.Item>
                          {(memberProfile?.permissions?.members
                            ?.create_edit_delete === true &&
                            selectedMember?._id !== memberProfile?._id) ||
                          (memberProfile?.role?.slug === "owner" &&
                            selectedMember?._id !== memberProfile?._id) ? (
                            <ListGroup.Item>
                              <Form.Group className="mb-0 form-group pb-0">
                                <Form.Label>Role</Form.Label>
                                <Form.Select
                                  className={
                                    errors["role"]
                                      ? "input-error form-control custom-selectbox conditional-box"
                                      : "form-control custom-selectbox conditional-box"
                                  }
                                  value={fields?.role || ""}
                                  onChange={handleChange}
                                  name="role"
                                >
                                  <option value="">None</option>
                                  {roles.map((role, index) => (
                                    <option key={index} value={role._id}>
                                      {role.name}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </ListGroup.Item>
                          ) : (
                            <ListGroup.Item>
                              <span className="info--icon">
                                <BsBriefcase />
                              </span>
                              <p>
                                <small>Role</small>
                                {selectedMember?.role?.name}
                              </p>
                            </ListGroup.Item>
                          )}
                        </ListGroup>
                      </Card.Text>
                      <Card.Text>
                        <ListGroup>
                          <ListGroup.Item>
                            <Form.Label>Recording Type</Form.Label>
                            {(memberProfile?.permissions?.members
                              ?.create_edit_delete === true &&
                              selectedMember?._id !== currentMember?._id) ||
                            memberProfile?.role?.slug === "owner" ? (
                              <Form.Select
                                className="form-control custom-selectbox"
                                id="member-meta"
                                name={`custom_field[recording]`}
                                onChange={(event) => handleChange(event)}
                                value={
                                  fields[`custom_field[recording]`] ||
                                  "screenshot_only"
                                }
                              >
                                <option key={`both`} value="both">
                                  Screenshot And Video
                                </option>
                                <option
                                  key={`screenshot_only`}
                                  value="screenshot_only"
                                >
                                  Screenshot Only
                                </option>
                                <option key={`video_only`} value="video_only">
                                  Video Only
                                </option>
                              </Form.Select>
                            ) : (
                              <span>
                                {editedMember?.memberMeta?.recording
                                  ?.replace(/_/g, " ")
                                  .replace(/^./, (char) => char.toUpperCase())}
                              </span>
                            )}
                          </ListGroup.Item>
                          {customFields?.length > 0 && (
                            <>
                              {customFields.map((field, index) => (
                                <ListGroup.Item key={index}>
                                  {renderDynamicField({
                                    name: `custom_field[${field.name}]`,
                                    type: field.type,
                                    label: field.label,
                                    value:
                                      fields[`custom_field[${field.name}]`] ||
                                      "",
                                    options: field?.options || [],
                                    onChange: (e) =>
                                      handleChange(e, field.name),
                                    range_options: field?.range_options || {},
                                  })}
                                </ListGroup.Item>
                              ))}
                            </>
                          )}
                        </ListGroup>
                      </Card.Text>
                    </>
                  )}
                  {/* <Card.Text>
                    <ListGroup>
                      {memberProfile?.permissions?.members
                        ?.create_edit_delete === true ||
                      memberProfile?.role?.slug === "owner" ? (
                        <>
                          <EditableField
                            selectedMember={selectedMember}
                            field="role"
                            // label="Role"
                            value={editedMember?.role}
                            onChange={(value) =>
                              handleFieldChange("role", value)
                            }
                            isEditing={isEditing.role}
                            onEditClick={() => handleEditClick("role")}
                            error={errors["role"] && errors["role"]}
                            printval={editedMember.rolename}
                            roles={roles}
                          />
                        </>
                      ) : (
                        <>
                          
                        </>
                      )}
                     
                    </ListGroup>
                  </Card.Text> */}
                  <div className="text-end mt-3">
                    {(memberProfile?.permissions?.members
                      ?.create_edit_delete === true &&
                      selectedMember?._id !== currentMember?._id) ||
                    memberProfile?.role?.slug === "owner" ? (
                      <>
                        <Button
                          variant="secondary"
                          className="me-3"
                          onClick={() => setShowDialog(true)}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <></>
                    )}
                    {memberProfile?.permissions?.members?.create_edit_delete ===
                      true || memberProfile?.role?.slug === "owner" ? (
                      <Button
                        variant="primary"
                        disabled={updateloader}
                        onClick={handleUpdateSubmit}
                      >
                        {updateloader ? "Please Wait..." : "Save Changes"}
                      </Button>
                    ) : (
                      <></>
                    )}
                  </div>
                </Card.Body>
              </Card>
              {/* <Card className="work--card">
                <Card.Body>
                  <Card.Title>
                    <FiBriefcase /> Work Information
                  </Card.Title>
                  <Card.Text>
                    <ListGroup>
                      <ListGroup.Item>
                        <span className="info--icon">
                          <FiCalendar />
                        </span>
                        <p>
                          <small>Address</small>123, Main Street, Heaven Park,
                          Mohali 160082
                        </p>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Text>
                </Card.Body>
              </Card> */}
              <Card className="permission--card">
                <Card.Body>
                  <Card.Title>
                    <FiShield /> Access Permissions{" "}
                    <Button
                      variant="primary"
                      className="ms-auto"
                      onClick={() => {
                        setAdjustPermissions(true);
                      }}
                    >
                      <FiShield /> Manage Permissions
                    </Button>
                  </Card.Title>
                  <Card.Text>
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
                        const truePermissionCount = Object.values(
                          modPerms
                        ).filter((val) => val === true).length;

                        // Show only modules with some true permissions
                        if (truePermissionCount === 0) return null;

                        return (
                          <Accordion.Item eventKey={modSlug} key={modSlug}>
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
                                {(mod.permissions || []).map((perm) => {
                                  const isChecked = !!modPerms[perm];
                                  if (!isChecked) return null;

                                  const label = perm
                                    .replace(/[_-]/g, " ")
                                    .replace(/^\w/, (l) => l.toUpperCase());

                                  return (
                                    <React.Fragment key={`${modSlug}-${perm}`}>
                                      <Form.Check
                                        type="checkbox"
                                        id={`${modSlug}-${perm}`}
                                        label={label}
                                        checked={true}
                                        disabled={true}
                                        className="parent-item"
                                      />

                                      {/* Show sub-members if view_others is true and selected_members exist */}
                                      {[
                                        "tracking",
                                        "projects",
                                        "reports",
                                        "attendance",
                                      ].includes(modSlug) &&
                                        perm === "view_others" &&
                                        Array.isArray(
                                          modPerms["selected_members"]
                                        ) &&
                                        modPerms["selected_members"].length >
                                          0 && (
                                          <>
                                            {/* <Form.Check
                                              type="checkbox"
                                              id={`${modSlug}-${perm}-select-all`}
                                              label="Select all"
                                              checked={
                                                memberFeeds.length > 0 &&
                                                memberFeeds.every((member) =>
                                                  modPerms[
                                                    "selected_members"
                                                  ].includes(String(member._id))
                                                )
                                              }
                                              disabled
                                              className="sub-items"
                                            /> */}
                                            {memberFeeds.map((member) => {
                                              if (
                                                !modPerms[
                                                  "selected_members"
                                                ].includes(String(member._id))
                                              )
                                                return null;

                                              return (
                                                <Form.Check
                                                  key={`${modSlug}-${perm}-${member._id}`}
                                                  type="checkbox"
                                                  id={`${modSlug}-${perm}-${member._id}`}
                                                  label={member.name}
                                                  checked={true}
                                                  disabled
                                                  className="sub-items"
                                                />
                                              );
                                            })}

                                            {modSlug === "projects" &&
                                              modPerms[
                                                "selected_members"
                                              ].includes("unassigned") && (
                                                <Form.Check
                                                  key={`${modSlug}-${perm}-unassigned`}
                                                  type="checkbox"
                                                  id={`${modSlug}-${perm}-unassigned`}
                                                  label="Unassigned"
                                                  checked={true}
                                                  disabled
                                                  className="sub-items"
                                                />
                                              )}
                                          </>
                                        )}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                        );
                      })}
                    </Accordion>
                  </Card.Text>
                  {/* <div className="text-end mt-3">
                    {
                        (memberProfile?.permissions?.members?.create_edit_delete === true &&
                        selectedMember?._id !== currentMember?._id  || memberProfile?.role?.slug === "owner") ? (
                      <>
                        <Button variant="danger" className="me-3" onClick={() => setShowDialog(true)}>Delete</Button>
                      </>
                    ) : (
                      <></>
                    )}
                    {(memberProfile?.permissions?.members?.create_edit_delete === true || memberProfile?.role?.slug === "owner") ?
                    <Button variant="primary" disabled={updateloader} onClick={handleUpdateSubmit}>{updateloader ? 'Please Wait...' : 'Save Changes'}</Button>
                    :
                    <></>
                    }
                  </div> */}
                </Card.Body>
              </Card>
            </div>
          </>
        </div>
      )}

      {adjustPermissions && (
        <Modal
          show={adjustPermissions}
          onHide={() => setAdjustPermissions(false)}
          centered
          size="lg"
          className="add--team--member--modal add--member--modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Manage Permissions</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card>
              <Card.Body>
                <Card.Title>Permissions</Card.Title>

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
                            </span>{" "}
                          </Accordion.Header>
                          <Accordion.Body>
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
                                      //disabled={selectedMember?.role?.slug === "owner"}
                                      onChange={
                                        () => {
                                          // if(selectedMember?.role?.slug !== "owner"){
                                          toggleView(modSlug);
                                        }
                                        //}
                                      }
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
                                        .replace(/^\w/, (l) => l.toUpperCase())}
                                      disabled={!isViewChecked}
                                      checked={!!modPerms[perm]}
                                      //readOnly={selectedMember?.role?.slug === "owner"}
                                      onChange={() => {
                                        //if(selectedMember?.role?.slug !== "owner"){ togglePermission(modSlug, perm)}
                                        togglePermission(modSlug, perm);
                                      }}
                                      className={
                                        !isViewChecked
                                          ? "parent-item text-muted"
                                          : "parent-item"
                                      }
                                    />

                                    {[
                                      "tracking",
                                      "projects",
                                      "reports",
                                      "attendance",
                                    ].includes(modSlug) &&
                                      perm === "view_others" &&
                                      modPerms[perm] === true && (
                                        <>
                                          <Form.Check
                                            key={`${modSlug}-${perm}-select-all`}
                                            type="checkbox"
                                            id={`${modSlug}-${perm}-select-all`}
                                            label="Select all"
                                            //disabled={selectedMember?.role?.slug === "owner"}
                                            checked={memberFeeds.every(
                                              (member) =>
                                                modPerms[
                                                  "selected_members"
                                                ]?.includes(String(member._id))
                                            )}
                                            onChange={(e) => {
                                              //if(selectedMember?.role?.slug !== "owner"){
                                              handleSelectAll(
                                                modSlug,
                                                e.target.checked
                                              );
                                              // }
                                            }}
                                            className="sub-items"
                                          />
                                          <>
                                            {memberFeeds.map((member) => (
                                              <Form.Check
                                                key={`${modSlug}-${perm}-${member._id}`}
                                                type="checkbox"
                                                id={`${modSlug}-${perm}-${member._id}`}
                                                label={member.name}
                                                checked={modPerms[
                                                  "selected_members"
                                                ]?.includes(String(member._id))}
                                                // disabled={selectedMember?.role?.slug === "owner"}
                                                onChange={() => {
                                                  //if (selectedMember?.role?.slug !== "owner") {
                                                  toggleMembers(
                                                    modSlug,
                                                    "selected_members",
                                                    member._id
                                                  );
                                                  // }
                                                }}
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
                                                // disabled={selectedMember?.role?.slug === "owner"}
                                                onChange={() => {
                                                  // if (selectedMember?.role?.slug !== "owner") {
                                                  toggleMembers(
                                                    modSlug,
                                                    "selected_members",
                                                    "unassigned"
                                                  );
                                                  // }
                                                }}
                                                className="sub-items"
                                              />
                                            )}
                                          </>
                                        </>
                                      )}
                                  </>
                                );
                              })}
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>
                  <div className="mt-4 text-end">
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={loader}
                    >
                      {loader ? "Please wait..." : "Save Permissions"}
                    </Button>
                  </div>
                </>
              </Card.Body>
            </Card>
          </Modal.Body>
        </Modal>
      )}

      <Modal
        show={show}
        onHide={handleClose}
        centered
        size="lg"
        className="add--team--member--modal add--member--modal"
        onShow={() => selectboxObserver()}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* {rows.map((row, index) => ( */}
            <div className="form-row" key={`row-0`}>
              <Form.Group className="mb-0 form-group">
                <FloatingLabel
                  label="Email address *"
                  controlId={`floatingInput-0`}
                >
                  <Form.Control
                    type="text"
                    className={
                      errors["email"] && errors["email"] !== ""
                        ? "input-error"
                        : "form-control"
                    }
                    placeholder="Email address"
                    name="email"
                    value={fields?.email}
                    onChange={handleChange}
                  />
                </FloatingLabel>
                {showError("email")}
              </Form.Group>

              <Button
                variant="primary"
                onClick={() => {
                  showPermissionsModal();
                }}
              >
                Select Role
              </Button>
              {showError("role")}
            </div>
            <div className="form-row" key={`row-1`}>
              <Form.Group>
                {customFields.length > 0 && (
                  <>
                    {customFields.map((field, index) =>
                      renderDynamicField({
                        name: `custom_field[${field.name}]`,
                        type: field.type,
                        label: field.label,
                        value: fields[`custom_field[${field.name}]`] || "",
                        options: field?.options || [],
                        onChange: (e) => handleChange(e, field.name),
                        fieldId: `new-${field.name}-${index}`,
                        range_options: field?.range_options || {},
                      })
                    )}
                  </>
                )}
              </Form.Group>
            </div>
            {/* ))} */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit} disabled={loader}>
            {loader ? "Please Wait..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
      {showPermissions && (
        <Modal
          show={showPermissions}
          onHide={() => setShowPermissions(false)}
          centered
          size="lg"
          className="add--team--member--modal add--member--modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Roles & Permissions</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* {rows.map((row, index) => ( */}
            <div className="form-row" key={`row-role-select`}>
              <Form.Group className="mb-0 form-group">
                <Form.Select
                  placeholder="Select role"
                  area-label="Role"
                  name="role"
                  controlId="floatingSelect"
                  className={"form-control custom-selectbox"}
                  value={fields?.role}
                  onChange={(e) => {
                    handleChange(e);
                    const matchedRole = roles.find(
                      (role) => role._id === e.target.value
                    );
                    const matchedPermissions = matchedRole
                      ? matchedRole.permissions
                      : [];
                    setPermissions(matchedPermissions);
                  }}
                >
                  <option value="role">Select role</option>
                  {roles.map((role, roleIndex) => (
                    <option key={`role-${roleIndex}`} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            {/* ))} */}
            {fields?.role !== null && fields?.role !== "role" && (
              <Card>
                <Card.Body>
                  <>
                    <div className="card--header" data-roleid={fields?.role}>
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
                              </span>{" "}
                            </Accordion.Header>
                            <Accordion.Body>
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
                                        onChange={() => {
                                          toggleView(modSlug);
                                        }}
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
                                        checked={!!modPerms[perm]}
                                        onChange={() => {
                                          togglePermission(modSlug, perm);
                                        }}
                                        className={
                                          !isViewChecked
                                            ? "parent-item text-muted"
                                            : "parent-item"
                                        }
                                      />

                                      {[
                                        "tracking",
                                        "projects",
                                        "reports",
                                        "attendance",
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
                                              onChange={(e) => {
                                                handleSelectAll(
                                                  modSlug,
                                                  e.target.checked
                                                );
                                              }}
                                              className="sub-items"
                                            />
                                            <>
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
                                                  onChange={() => {
                                                    toggleMembers(
                                                      modSlug,
                                                      "selected_members",
                                                      member._id
                                                    );
                                                  }}
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
                                          </>
                                        )}
                                    </>
                                  );
                                })}
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                        );
                      })}
                    </Accordion>
                  </>
                </Card.Body>
              </Card>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={handleSavePermissions}
              disabled={loader}
            >
              {loader ? "Please Wait..." : "Save"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {(memberProfile &&
        memberProfile.role?.slug === "owner" &&
        selectedMember?._id !== memberProfile?._id) ||
      (selectedMember?._id !== memberProfile?._id &&
        memberProfile &&
        Object.keys(memberProfile).length > 0 &&
        memberProfile?.permissions?.members?.create_edit_delete === true &&
        memberProfile?.role?.slug !== "owner") ? (
        <>
          <AlertDialog
            showdialog={showdialog}
            toggledialog={setShowDialog}
            msg="Are you sure you want to delete the member?"
            callback={handledeleteMember}
          />
        </>
      ) : memberProfile &&
        Object.keys(memberProfile).length > 0 &&
        memberProfile.role?.slug !== "owner" &&
        selectedMember?._id === memberProfile._id ? (
        <>
          <AlertDialog
            showdialog={showdialog}
            toggledialog={setShowDialog}
            msg="Are you sure you want leave from the company?"
            callback={handleleavecompany}
          />
        </>
      ) : (memberProfile &&
          Object.keys(memberProfile).length > 0 &&
          memberProfile?.role?.permissions?.members?.create_edit_delete ===
            true) ||
        memberProfile.role?.slug === "owner" ? (
        <>
          <TransferOnwerShip
            currentMember={currentMember}
            showdialog={showdialog}
            toggledialog={setShowDialog}
            members={memberFeed?.memberData}
          />
        </>
      ) : (
        <></>
      )}
      {/*--=-=Search Modal**/}
      <Modal
        show={showSearch}
        onHide={handleSearchClose}
        size="md"
        className="search--modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Search</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item className="border-0 p-0">
              <Form>
                <Form.Group className="mb-0 form-group">
                  <Form.Control
                    type="text"
                    placeholder={
                      activeTab === "Members"
                        ? "Search Member.."
                        : "Search Invitations.."
                    }
                    onChange={(e) => setsearchTerm(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
      </Modal>
      {showCustomFields && (
        <CustomFieldModal toggle={setShowCustomFields} module="members" />
      )}
    </>
  );
}

export default TeamMembersPage;
