import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import debounce from "lodash.debounce";
import { Container, Row, Col, Button, Modal, Alert, Form, FloatingLabel, Card, ListGroup, Table, Accordion, Dropdown, FormGroup} from "react-bootstrap";
import { BadgesModal } from "../modals/badges";
import { FaList, FaPlus, FaCog, FaEllipsisV } from "react-icons/fa";
import { FiEdit, FiMail, FiSidebar, FiTrash2, FiShield, FiVideo, FiCamera, FiMonitor, FiCheck} from "react-icons/fi";
import { AiOutlineTeam } from "react-icons/ai";
import { RiUserSettingsLine } from "react-icons/ri";
import { LuFolderOpen, LuUser, LuSettings2 } from 'react-icons/lu';
import { TbUsersPlus } from "react-icons/tb";
import { BsBriefcase, BsEye, BsGrid, BsEyeSlash} from "react-icons/bs";
import { GrExpand } from "react-icons/gr";
import { MdOutlineSearch, MdOutlineClose, MdDragIndicator, MdSearch, MdFilterList } from "react-icons/md";
import { getMemberdata } from "../../helpers/commonfunctions";
import { Listmembers, deleteMember, updateMember, listCompanyinvite} from "../../redux/actions/members.action";
import { toggleSidebar, toggleSidebarSmall} from "../../redux/actions/common.action";
import { leaveCompany } from "../../redux/actions/workspace.action";
import { useNavigate } from "react-router-dom";
import { getAvailableRolesByWorkspace } from "../../redux/actions/workspace.action";
import { getFieldRules, validateField } from "../../helpers/rules";
import { createMember, reorderedMember } from "../../redux/actions/members.action";
import Invitation from "./Invitation";
import { AlertDialog, TransferOnwerShip } from "../modals";
import { selectboxObserver, formatDateToDDMMYYYY, convertDDMMYYYYtoYYYYMMDD } from "../../helpers/commonfunctions";
import { updatePermissions, deleteRole} from "../../redux/actions/permission.action";
import { socket, currentMemberProfile } from "../../helpers/auth";
import { permissionModules, permissionsLabel } from "../../helpers/permissionsModules";
import { CustomFieldModal } from "../modals/customFields";
import { fetchCustomFields } from "../../redux/actions/customfield.action";
import { renderDynamicField } from "../common/dynamicFields";
import RolesPage from "../Settings/RolesPage";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { logout } from "../../redux/actions/auth.actions";
import { getActiveSubscription } from "../../redux/actions/subscription.action";

function MemberPermissionPage() {
  const inputRef = useRef(null);
  const memberProfile = currentMemberProfile();
  const currentMember = getMemberdata();
  //const addToast = useToast();
  const [isActive, setIsActive] = useState(0);
  const handleClick = (event) => {
    setIsActive((current) => !current);
  };
  const subscriptionState = useSelector((state) => state.subscription);
  const [invitationsTotal, setInvitationsTotal] = useState(0)
  const [activeSubscription, setActiveSubscription] = useState(null)
  const [showdelete, setShowDelete] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [activeRole, setActiveRole] = useState({});

  const handleDeleteRole = async (e) => {
    setLoader(true); 
    dispatch(deleteRole(activeRole._id))
  }

  const [screenshots, setScreenshots] = useState(true);
  const [screenRecording, setScreenRecording] = useState(false);
  const [liveScreen, setLiveScreen] = useState(false);

  const [showSetting, setSettingShow] = useState(false);
  const handleSettingClose = () => setSettingShow(false);
  const handleSettingShow = () => setSettingShow(true);

  const handleTableToggle = (member) => {
    setSelectedMember(member);
    // if (!isActive) {
    //   setIsActive(true);
    // }
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
  const [visiblePasswords, setVisiblePasswords] = useState({});
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
  const invitationsFeed = useSelector((state) => state.member.invitations);
  const [showloader, setShowloader] = useState(false);
   const [showPasswordFields, setShowPasswordFields] = useState({});
  const apiResult = useSelector((state) => state.member);
  const [searchTerm, setsearchTerm] = useState("");
  const memberFeed = useSelector((state) => state.member.members);
  const [showBadges, setShowBadges] = useState(null);
  const [editedMember, setEditedMember] = useState({});
  const [showdialog, setShowDialog] = useState(false);
  const [roles, setRoles] = useState([]);
  const handleListMember = async () => {
    if (activeTab === "Members") {
      setMemberFeed([]);

      await dispatch(Listmembers(currentPage, searchTerm));
      await dispatch(
        listCompanyinvite(0, 'company')
      );
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

  useEffect(() => {
    console.log('invitationsTotal:: ', invitationsTotal)
  }, [invitationsTotal])
  
  useEffect(() => {
    console.log('memberfeed length:: ', memberFeeds.length)
  }, [memberFeeds])
  const toggleCustomFields = () => {
    setShowCustomFields((prev) => !prev);
  };

  const toggleShowPassword = (fieldId) => {
    setShowPasswordFields((prev) => ({
        ...prev,
        [fieldId]: !prev[fieldId],
    }));
  };

  const toggleBadges = (fieldIndex) => {
        setShowBadges(fieldIndex);
    };

  useEffect(() => {
    dispatch(getAvailableRolesByWorkspace({ fields: "_id name permissions" }));
    let prm = {};
    permissionModules.forEach((mod) => {
      prm[mod.slug] = {}; // Initialize object for each module
      mod.permissions.forEach((p) => {
        prm[mod.slug][p] = false;
      });
    });

    setPermissions(prm);

    setTimeout(() => {
        dispatch(getActiveSubscription())
      }, 1000)

       socket.on('receive_record_types', async (record_types = {}) => { 
        console.log('record_types:: ', record_types)
       })
      
  }, []);


   
  useEffect(() => {
    if (currentPage !== "" && activeTab === "Members") {
      setShowloader(true);
      handleListMember();
    }
    dispatch(fetchCustomFields({ module: "members" }));
  }, [currentPage, searchTerm, activeTab]);

  useEffect(() => {
    if (invitationsFeed && invitationsFeed.inviteData) {
      setInvitationsTotal(invitationsFeed.total);
    }
  }, [invitationsFeed]);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEditing === true) {
      selectboxObserver();
    }
  }, [isEditing]);
  
  useEffect(() => {
  if (!fields?.role && roles?.length > 0) {
    const defaultRoleId = roles[0]._id;

    // Simulate handleChange for default role
    handleChange({ target: { name: "role", value: defaultRoleId } });

    // Set permissions for default role
    setPermissions(roles[0].permissions || []);
  }
}, [fields?.role, roles]);

useEffect(() => {
  
  if(subscriptionState.activeSubscription){
    setActiveSubscription(subscriptionState.activeSubscription) 
  }
}, [subscriptionState.activeSubscription])


  useEffect(() => {
    if (apiResult.success) { console.log('on success', activeTab)
      if (activeTab === "Members") {
        if (apiResult.updatedMember) { console.log('I am here')
          socket.emit("refresh_record_type", selectedMember?._id);
          socket.emit("refresh_record_types", selectedMember?._id);
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

    if( workspaceState.ownershipUpdate === true){
      setShowDialog(false)
      setTimeout(function(){
        dispatch(logout())
      },1000)
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

    // if (apiCustomfields.newField) {
    //   setCustomFields((prevCustomFields) => [
    //     apiCustomfields.newField,
    //     ...prevCustomFields,
    //   ]);
    // }

    if (
      apiCustomfields.newField &&
        apiCustomfields.newField?.module === "members"
      ) {
        setCustomFields((prevCustomFields) => [
          ...prevCustomFields.filter(
            (field) => field._id !== apiCustomfields.newField._id
          ),
          apiCustomfields.newField
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
     if (apiCustomfields.deletedField) {
        setCustomFields((prevCustomFields) =>
            prevCustomFields.filter((field) => field._id !== apiCustomfields.deletedField)
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
      if (!("screenshot_recording" in cleanedMeta)) {
        cleanedMeta.screenshot_recording = {
          meta_key: "screenshot_recording",
          meta_value: "disabled",
        };
      }
      if (!("video_recording" in cleanedMeta)) {
        cleanedMeta.video_recording = {
          meta_key: "video_recording",
          meta_value: "disabled",
        };
      }
      if (!("live_streaming" in cleanedMeta)) {
        cleanedMeta.live_streaming = {
          meta_key: "live_streaming",
          meta_value: "disabled",
        };
      }
     
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
              updated[module][key] = false;
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

  const handleEditClick = (fieldName) => {
    setIsEditing((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  // Debounced search handler
      const debouncedUpdateSearch = useMemo(
      () =>
        debounce((value) => {
          setsearchTerm(value)
        }, 1000), // 1 sec debounce
      []
    );

  const toggleVisibility = (key) => {
        setVisiblePasswords((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
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
      if( value !== "role"){
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
      }
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
  const handleDateChange = (value, name) =>{ 
        setFields({ ...fields, [name]: formatDateToDDMMYYYY(value) });
        setErrors({ ...errors, [name]: '' })
    }
    
  const handleChange = ({ target: { name, value, type, files, checked } }) => {
    let finalValue;
    if (type === 'checkbox' && name.includes('[]')) {
        const arrayName = name.replace('[]', '');
        const existing = fields[arrayName] || [];
        if (checked) {
          finalValue = [...existing, value];
        } else {
          finalValue = existing.filter((v) => v !== value);
        }
        name = arrayName;
    } else if (type === 'checkbox') {
        // For single checkbox: store value when checked, empty string when unchecked
        finalValue = checked ? value : '';
    } else if (type === 'file') {
        finalValue = files;
    } else {
        finalValue = value;
    }
   
    if (name === "role") { 
      if( finalValue !== "role"){
        const matchingRole = roles.find((role) => role._id === value);
      setFields((prevState) => ({
        ...prevState,
        role: matchingRole._id,
        rolename: matchingRole.name,
        ["custom_field[permissions]"]: matchingRole.permissions,
      }));
      }
    } else {
      setFields({ ...fields, [name]: finalValue });
    }

    setErrors({ ...errors, [name]: "" });

    if( showBadges !== null && selectedMember && Object.keys(selectedMember).length > 0 && isActive !== true){
        let payload = {};

        if (name.startsWith('custom_field[')) {
            const fieldName = name.match(/custom_field\[(.*?)\]/)?.[1]; // extract "badge"
                payload = {
                    custom_field: {
                        [fieldName]: value,
                    }
                }
        } else {
            payload[name] = value;
        }
        dispatch(updateMember(selectedMember._id, payload));
    }
  };

  const updateRecodingType = async(payload) => {
    dispatch(updateMember(selectedMember._id, payload));
  }

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


  const [projectToggle, setProjectToggle] = useState(false);
  const handleToggles = () => {
    if (commonState.sidebar_small === false) {
     
      handleSidebarSmall();
    } else {
      setProjectToggle(false);
      handleSidebarSmall();
     
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
    setFields({
      ...fields,
      [`custom_field[permissions]`]: permissions,
    });

    setShowPermissions(false);
  };

  const [showTeamGrid, setShowTeamGrid] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);


  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    // If there's no destination (i.e., the item was dropped outside), do nothing
    if (!destination) return;

    const memberId = draggableId.split('-')[1]; // Extract task ID from draggableId
    const sourceTabId = source.droppableId.split('-')[1]; // Get source tab ID
    const destinationTabId = destination.droppableId.split('-')[1]; // Get destination tab ID

    // Clone the projects array to avoid mutating the state directly
    let reorderedMembers = [...memberFeeds];
    if (sourceTabId === destinationTabId) {
        // If the task was moved within the same tab, reorder the tasks
        const [removed] = reorderedMembers.splice(source.index, 1); // Remove task from the source position
        reorderedMembers.splice(destination.index, 0, removed); // Insert task to the destination position
    } else {
        // Task was moved to a different tab (if needed, handle cross-tab logic here)
        const [removed] = reorderedMembers.splice(source.index, 1); // Remove from source tab
        reorderedMembers.splice(destination.index, 0, removed); // Add to destination tab
    }
    // Generate a list of newly ordered projects
    const newOrder = reorderedMembers.map((member, index) => ({
        member_id: member._id, // Adjust this if your project ID key is different
        order: index
    }));

    // Dispatch the action with the new order
    dispatch(reorderedMember({ members: newOrder}));
    // Update the state with reordered projects
    setMemberFeed(reorderedMembers);
};
  
  const pagetopbar = () => {
    return (
      <div className="page--title px-md-2 py-3 bg-white border-bottom">
        <Container fluid>
          <Row>
            <Col sm={12}>
              <h2>
                <span className="open--sidebar me-2" onClick={() => {handleSidebarSmall(false);setIsActive(0); }}><FiSidebar /></span>
                {activeTab}
                <ListGroup horizontal className={isActive ? "d-none" : "me-2 ms-auto d-none d-xl-flex" }>
                  <ListGroup horizontal>
                    <ListGroup.Item className="d-none d-md-flex gap-2 align-items-center" action active={activeTab === "Members"} onClick={() => {setsearchTerm("");setActiveTab("Members");}}><AiOutlineTeam /> Team Members</ListGroup.Item>
                    {(memberProfile?.permissions?.members
                      ?.create_edit_delete === true ||
                      memberProfile?.role?.slug === "owner") && (
                      <ListGroup.Item className="d-none d-md-flex gap-2 align-items-center" action active={activeTab === "Invitations"} onClick={() => {setsearchTerm("");setActiveTab("Invitations");}}><FiMail /> Invitations</ListGroup.Item>
                    )}
                  </ListGroup>
                  <ListGroup.Item className="d-none d-xl-flex ms-3">
                    <Form className="search-filter-list" onSubmit={(e) => {e.preventDefault();}}>
                      <Form.Group className="mb-0 form-group">
                        <MdOutlineSearch />
                        <Form.Control type="text" readOnly={showloader} ref={inputRef} placeholder={activeTab === "Members"? "Search Member..": "Search Invitations.."} onChange={(e) => debouncedUpdateSearch(e.target.value)}/>
                      </Form.Group>
                    </Form>
                  </ListGroup.Item>
                </ListGroup>
                <ListGroup horizontal className="ms-auto ms-xl-0">
                  <ListGroup horizontal className="d-none d-lg-flex">
                    <ListGroup.Item action className="view--icon" active={isActiveView === 1} onClick={() => setIsActiveView(1)}><BsGrid /></ListGroup.Item>
                    <ListGroup.Item action className="view--icon" active={isActiveView === 2} onClick={() => setIsActiveView(2)}><FaList /></ListGroup.Item>
                  </ListGroup>
                  <ListGroup horizontal className={isActive ? "d-none" : "d-flex bg-white expand--icon"}>
                    <ListGroup.Item className="d-flex d-xl-none" onClick={handleSearchShow}><MdFilterList /></ListGroup.Item>
                    <ListGroup.Item className="d-lg-flex" key={`settingskey`} onClick={toggleCustomFields}><LuSettings2 /></ListGroup.Item>
                    <ListGroup.Item className="d-lg-flex" onClick={handleSettingShow}><RiUserSettingsLine /></ListGroup.Item>
                    <ListGroup.Item className="d-none d-lg-flex" onClick={handleToggles}><GrExpand /></ListGroup.Item>
                    {(memberProfile?.permissions?.members
                      ?.create_edit_delete === true ||
                      memberProfile?.role?.slug === "owner") && (
                      <ListGroup.Item className="btn btn-primary"  onClick={() => {
                          // if (
                          //   activeSubscription?.planId === 'free' &&
                          //   (invitationsTotal + memberFeeds?.length === activeSubscription?.quantity) || activeSubscription?.quantity <=
                          //   invitationsTotal + memberFeeds?.length
                          // ) {
                          //   navigate('/subscription-plans', { replace: true });
                          // } else {
                            handleShow();
                          // }
                        }}><FaPlus /></ListGroup.Item>
                    )}
                  </ListGroup>
                </ListGroup>
              </h2>
            </Col>
          </Row>
        </Container>
      </div>
    );
  };

  return (
    <>
      {activeTab === "Members" && (
        <div className={`${ isActive ? "show--details team--page project-collapse" : "team--page" } ${projectToggle === true ? "project-collapse" : ""}`}>
          {pagetopbar()}
          <div className="page--wrapper px-md-2 pb-4 pt-4">
            {showloader ?
              <div className="loading-bar"><img src="images/OnTeam-icon-gray.png" className="flipchar" /></div>
            :
            <Container fluid>
              <>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className={ isActiveView === 1 ? "project--grid--table project--grid--new--table table-responsive-xl" : isActiveView === 2 ? "project--table draggable--table new--project--rows table-responsive-xl" : "project--table new--project--rows table-responsive-xl"}>
                    {!showloader && memberFeeds && memberFeeds.length > 0
                      ?
                      <Table>
                        <thead className="onHide">
                          <tr key="project-table-header">
                            <th scope="col" className="sticky p-0 border-bottom-0" key="client-name-header">
                              <div className="d-flex align-items-center justify-content-between border-end border-bottom ps-3">Member{" "}<span key="client-action-header" className="onHide">Actions</span></div>
                            </th>
                            <th scope="col" key="client-email-header" className="onHide p-0 border-bottom-0"><div className="border-bottom padd--x">Email{" "}</div>{" "}</th>
                            
                          </tr>
                        </thead>
                        <Droppable droppableId={`droppable-members-table`} type="MEMBERS" >
                          {(provided) => (
                            <tbody ref={provided.innerRef} {...provided.droppableProps}>
                              {memberFeeds.map((member, idx) => (
                                  <>
                                  <Draggable
                                    key={member?._id}
                                    draggableId={`member-${member?._id}`}
                                    index={idx}
                                  >
                                    {(provided) => (
                                      <tr
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        key={`member-table-row-${member._id}`}
                                        className={
                                          member._id === selectedMember?._id
                                            ? "project--active"
                                            : ""
                                        }
                                        onClick={
                                            () => handleTableToggle(member)
                                            
                                        }
                                      >
                                        <td className="project--title--td sticky border-bottom" data-label="Member Name">
                                          <div className="d-flex justify-content-between border-end flex-wrap">
                                            <div className="project--name">
                                              <div className="drag--indicator"><abbr>{idx + 1}</abbr><MdDragIndicator /></div>
                                              <div className="title--initial">{
                                                (member?.avatar && member?.avatar !== null ) ? 
                                                  <span><img src={member?.avatar} alt={'member-avatar'} /></span>
                                                  :
                                                  member.name.charAt(0)
                                              }</div>
                                              <div className="title--span flex-column align-items-start gap-0">
                                                <span>{member.name}</span>
                                                <strong>{member.role?.name}</strong>
                                              </div>
                                            </div>
                                            <div className="onHide task--buttons">
                                              <Dropdown>
                                                <Dropdown.Toggle variant="dark" id="dropdown-basic">
                                                  <FaEllipsisV />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                  {
                                                    (memberProfile &&
                                                    Object.keys(memberProfile).length > 0 &&
                                                    memberProfile?.permissions?.members?.create_edit_delete === true ||
                                                    memberProfile?.role?.slug !== "owner") ? (
                                                      <Dropdown.Item onClick={() => {
                                                        setAdjustPermissions(true);
                                                        setIsActive(true)
                                                      }} className="d-flex align-items-center gap-1"><FiEdit className="me-1" /> Edit Permissions</Dropdown.Item>
                                                     ) : <></>                    
                                                  }
                                                  
                                                  <Dropdown.Item onClick={() => setShowDialog(true)} className="d-flex align-items-center gap-1"><FiTrash2 /> 
                                                  Change Role
                                                  
                                                  </Dropdown.Item>
                                                </Dropdown.Menu>
                                              </Dropdown>
                                             
                                             </div>
                                          </div>
                                        </td>
                                        <td className="onHide new--td">
                                          <strong className={isActiveView === 1 ? 'd-flex text-uppercase fs-small' : isActiveView === 2 ? 'd-flex d-lg-none text-uppercase fs-small mb-1' : 'd-flex d-lg-none text-uppercase fs-small mb-1'}>Email</strong>
                                          {member.email}
                                        </td>
                                        
                                        
                                      </tr>
                                    )}
                                    </Draggable>
                                    </>
                                  ))
                                }   
                            </tbody>
                          )}
                          </Droppable>
                      </Table>
                    : !showloader && memberFeeds && memberFeeds.length === 0 && (
                    <div className="text-center">
                      <h2>No Members Found</h2>
                    </div>
                  )}
                  </div>
                </DragDropContext>
              </>
            </Container>
            }
          </div>
        </div>
      )}
      
      {adjustPermissions ? (
        <div className="details--member--view">
          <>
            <div className="rounded--box">
              <div className="new--accordion--block">
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
                          <Form.Check key={`${modSlug}--view`} type="switch" className="ms-auto switch--small" checked={!!modPerms.view} onChange={
                            () => {
                              // if(selectedMember?.role?.slug !== "owner"){
                              toggleView(modSlug);
                            }
                            //}
                          }/>
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
                            //onChange={(e) => setShowTeamGrid(e.target.checked)} 
                              onChange={() => {
                                //if(selectedMember?.role?.slug !== "owner"){ togglePermission(modSlug, perm)}
                                togglePermission(modSlug, perm);
                              }}
                          />
                        </div>
                        {[
                          "tracking",
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
                                    );
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
            </div>
          </>
        </div>
      ): <></>}

      
     

 
      {(memberProfile &&
        memberProfile.role?.slug === "owner" &&
        selectedMember?._id !== memberProfile?._id) ||
      (selectedMember?._id !== memberProfile?._id &&
        memberProfile &&
        Object.keys(memberProfile).length > 0 &&
        memberProfile?.permissions?.members?.create_edit_delete === true ||
        memberProfile?.role?.slug !== "owner") ? (
        <>
          <AlertDialog
            showdialog={showdialog}
            toggledialog={setShowDialog}
            msg="Are you sure you want to delete the member?"
            callback={handledeleteMember}
          />
        </>
      ) 
      : memberProfile &&
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
      ) 
      : (memberProfile &&
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
      <Modal show={showSearch} onHide={handleSearchClose} size="md" className="search--modal">
        <Modal.Header closeButton>
          <Modal.Title>Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item className="p-0 border-0">
              <Dropdown className="select--dropdown manual--dropdown">
                <Dropdown.Toggle variant="success">
                  {activeTab}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className="drop--scroll">
                    <Dropdown.Item className="d-flex gap-2 align-items-center dropdown-item" action active={activeTab === "Members"} onClick={() => {setsearchTerm("");setActiveTab("Members");}}><AiOutlineTeam /> Team Members</Dropdown.Item>
                    {(memberProfile?.permissions?.members
                      ?.create_edit_delete === true ||
                      memberProfile?.role?.slug === "owner") && (
                      <Dropdown.Item className="d-flex gap-2 align-items-center dropdown-item" action active={activeTab === "Invitations"} onClick={() => {setsearchTerm("");setActiveTab("Invitations");}}><FiMail /> Invitations</Dropdown.Item>
                    )}
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </ListGroup.Item>
            <ListGroup.Item className="border-0 p-0 mt-3">
              <Form className="search-filter-list" onSubmit={(e) => {e.preventDefault();}}>
                <Form.Group className="mb-0 form-group">
                  <MdOutlineSearch />
                  <Form.Control type="text" readOnly={showloader} ref={inputRef} placeholder={activeTab === "Members"? "Search Member..": "Search Invitations.."} onChange={(e) => debouncedUpdateSearch(e.target.value)}/>
                </Form.Group>
              </Form>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
      </Modal>
      {showCustomFields && (
        <CustomFieldModal toggle={setShowCustomFields} module="members" />
      )}
      {
        showBadges !== null && 
        <BadgesModal badgesData={showBadges} toggleBadges={toggleBadges} handleSelect={handleChange} value={fields[`custom_field[${showBadges?.name}]`] || ''}/>
      }
      {
        showSetting && 
      
        <Modal show={showSetting} onHide={handleSettingClose} size="xl" centered className="theme--modal">
          <Modal.Header closeButton>
              <Modal.Title>
                  <strong>Role & Permissions <small>Manage access permissions</small></strong>
              </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pb-0">
              <RolesPage />
          </Modal.Body>
        </Modal>
      }
    </>
  );
}

export default MemberPermissionPage;
