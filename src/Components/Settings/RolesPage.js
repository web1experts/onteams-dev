import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Form,
  Accordion,
  Tab,
  Badge,
  Card,
  Modal,
  FloatingLabel,
  Tabs,
  Row,
  Col,
  ListGroup,
  Alert
} from "react-bootstrap";
import { FaPlus, FaTimesCircle, FaCheck, FaTrash } from "react-icons/fa";
import { FiCheck, FiLock, FiUsers } from "react-icons/fi";
import { LuFolderOpen, LuPencilLine } from "react-icons/lu";
import { useToast } from "../../context/ToastContext";
import Spinner from "react-bootstrap/Spinner";
import { AlertDialog } from "../modals";
import {
  permissionModules,
  permissionsLabel,
} from "../../helpers/permissionsModules";
import {
  updatePermissions,
  addRoleWithPermissions,
  deleteRole,
} from "../../redux/actions/permission.action";
import { currentMemberProfile } from "../../helpers/auth";
import { getAllRolesByWorkspace } from "../../redux/actions/workspace.action";
import { Listmembers } from "../../redux/actions/members.action";
import { selectboxObserver } from "../../helpers/commonfunctions";
import { getTeams, createTeam, updateTeam, deleteTeam } from "../../redux/actions/team.action";
import { updateStateData } from "../../redux/actions/common.action";
import { ALL_MEMBERS } from "../../redux/actions/types";
function RolesPage() {
  const dispatch = useDispatch();
  const [fieldserrors, setFieldErrors] = useState({ name: "" });
  const [loader, setLoader] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const memberProfile = currentMemberProfile();
  let fieldErrors = {};
  let hasError = false;
   const addToast = useToast();
  const [search, setSearch] = useState("");
  const [fields, setFields] = useState({ name: "" });
  const [errors, setErrors] = useState({});
  const [activeAccordionKey, setActiveAccordionKey] = useState(null);
  const [teamfields, setTeamFields] = useState({
    name: "",
    color: "#3b82f6",
    members: [],
  });
  const [teamerrors, setTeamErrors] = useState({});
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleFields, setRoleFields] = useState({
    name: "",
    permissions: {},
  });
    const [activeItems, setActiveItems] = useState({});
  const [showTeamAssign, setShowTeamAssign] = useState(false)
  const [roleErrors, setRoleErrors] = useState({});
  const [roleLoader, setRoleLoader] = useState(false);
  const [show, setShow] = useState(false);
  const [showCreate, setCreateShow] = useState(false);
  const [isteamEdit, setIsTeamEdit] = useState( null )
  const handleCreateClose = () => {
    setCreateShow(false);
    setTeamFields({
        name: "",
        color: "#3b82f6",
        members: [],
      })
      setActiveItems({})
  };
    
  const handleCreateShow = () => {
    setTeamFields({
        name: "",
        color: "#3b82f6",
        members: [],
    })
   
    setCreateShow(true)
  };
  const [showdelete, setShowDelete] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [activeRole, setActiveRole] = useState({});
  const workspace = useSelector((state) => state.workspace);
  const members = useSelector((state) => state.member);
  const apiPermission = useSelector((state) => state.permissions);
  const memberFeed = useSelector((state) => state.member.members);
  const commonState = useSelector((state) => state.common);
  const teamsState = useSelector((state) => state.teams)
  const [roles, setRoles] = useState([]);
  const [memberslist, setMemberslist] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [expanded, setExpanded] = useState({});
  const [memberFeeds, setMemberFeed] = useState([]);
  const [teamfeed, setTeamFeed] = useState([]);
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
  // const togglePermission = (module, perm) => {
  //   setPermissions((prev) => {
  //     const currentPerms = prev?.[module] || {};
  //     return {
  //       ...prev,
  //       [module]: {
  //         ...currentPerms,
  //         [perm]: !currentPerms?.[perm],
  //       },
  //     };
  //   });
  // };
  const togglePermission = (module, perm, value) => {
    setPermissions((prev) => {
      const currentPerms = prev?.[module] || {};

      const updatedPerms = {
        ...currentPerms,
        [perm]: value //!currentPerms?.[perm],
      };

      // 🔁 Mutual exclusion logic
      if (perm === "specific_teams_only" && updatedPerms[perm]) {
        updatedPerms.specific_peoples_only = false;
      }

      if (perm === "specific_peoples_only" && updatedPerms[perm]) {
        updatedPerms.specific_teams_only = false;
      }

      return {
        ...prev,
        [module]: updatedPerms,
      };
    });
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

  const autoAddTeamToggle = (module, perm, value) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev?.[module],
        [perm]: value,
      },
    }));
  };

  const autoAddTeamMembersToggle = (module, perm, teamId) => {
    setPermissions((prev) => {
      const currentPerms = prev?.[module] || {};
      const currentAutoTeams = currentPerms[perm] || [];

      const updatedTeams = currentAutoTeams.includes(teamId)
        ? currentAutoTeams.filter((id) => id !== teamId)
        : [...currentAutoTeams, teamId];

      return {
        ...prev,
        [module]: {
          ...currentPerms,
          [perm]: updatedTeams,
        },
      };
    });
  }

  const toggleTeamMembers = (module, perm, teamId, memberId) => {
    setPermissions((prev) => {
      const currentPerms = prev?.[module] || {};
      const currentTeams = currentPerms?.[perm] || {};

      const teamKey = String(teamId);
      const memberKey = String(memberId);

      // ✅ HARD SAFETY: ensure array
      const teamMembers = Array.isArray(currentTeams[teamKey])
        ? currentTeams[teamKey]
        : [];

      const updatedTeamMembers = teamMembers?.includes(memberKey)
        ? teamMembers.filter((id) => id !== memberKey)
        : [...teamMembers, memberKey];

      const updatedTeams = {
        ...currentTeams,
        [teamKey]: updatedTeamMembers,
      };

      // optional cleanup
      if (updatedTeamMembers.length === 0) {
        delete updatedTeams[teamKey];
      }

      return {
        ...prev,
        [module]: {
          ...currentPerms,
          [perm]: updatedTeams,
        },
      };
    });
  };

  const toggleTeams = (module, perm, teamId) => {
    setPermissions((prev) => {
      const currentPerms = prev?.[module] || {};
      const currentTeams = currentPerms[perm] || [];

      const updatedTeams = currentTeams.includes(teamId)
        ? currentTeams.filter((id) => id !== teamId)
        : [...currentTeams, teamId];

      return {
        ...prev,
        [module]: {
          ...currentPerms,
          [perm]: updatedTeams,
        },
      };
    });
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
      },
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
      setFields({ ...fields, ["name"]: activeRole?.name });
    }
  }, [activeRole]);

  const handleDeleteRole = async (e) => {
    setLoader(true);
    dispatch(deleteRole(activeRole._id));
  };

  const handleSave = async (e) => {
    try {
      const roleData = {
        role: activeRole._id,
        permissions,
        type: "default",
        name: fields["name"],
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
    setFields({});
  };

  useEffect(() => {
    if (show === true) {
      setActiveRole({});
    }
    //  else {
    //   if (Array.isArray(roles) && roles.length > 0) {
    //     setActiveRole(roles[0]);
    //   }
    // }
  }, [show]);

  const showError = (name) => {
    if (errors[name]) return <span className="error">{errors[name]}</span>;
    return null;
  };

  const handleRoleList = async () => {
    await dispatch(
      getAllRolesByWorkspace({ fields: "_id name permissions type" }),
    );
  };

  useEffect(() => {
    if (memberFeed && memberFeed.memberData) {
      setMemberFeed(memberFeed.memberData);
      dispatch(updateStateData(ALL_MEMBERS, memberFeed.memberData));
    }
  }, [memberFeed]);

  useEffect(() => {
    if(permissions?.assigned_teams?.specific_peoples_only === true || permissions?.assigned_teams?.specific_teams_only === true){
      setShowTeamAssign(true)
    }
  }, [permissions])

  useEffect(() => {
    if (teamsState && teamsState.teams) {
      setTeamFeed(teamsState.teams);
      setIsTeamEdit(null)
      // if (isteamEdit) {
      //   const teamToEdit = teamsState.teams.find(
      //     (team) => team._id === isteamEdit
      //   );

      //   if (teamToEdit) {
      //     handleEditTeam(teamToEdit);
      //   }
      // }
    }
  }, [teamsState])

  let filteredMembers = commonState.allmembers;

 if(commonState.allmembers && commonState.allmembers.length > 0){
      filteredMembers = commonState.allmembers.filter(member => 
        member.name.toLowerCase().includes(search.toLowerCase())
      );
    }
  useEffect(() => {
    setLoader(false);
    setShowDelete(false);
    if (apiPermission.success) {
      setShow(false);
      setPermissions({});
      if (apiPermission.savedrole) {
        const savedrole = apiPermission.savedrole;
        setFields({ ...fields, ["name"]: savedrole.name });
        
        setRoles((prev) => {
          const index = prev.findIndex((role) => role._id === savedrole._id);
          if (index !== -1) {
            // Replace existing role
            return prev.map((role) =>
              role._id === savedrole._id ? savedrole : role,
            );
          } else {
            // Add new role
            return [...prev, savedrole];
          }
        });
       
          setActiveRole(savedrole)
          setActiveAccordionKey(savedrole._id);
       
      }
      if (apiPermission.deletedRole) {
        setRoles((prev) =>
          prev.filter((role) => role._id !== apiPermission.deletedRole?._id),
        );
        setFields({ name: "" });
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
    dispatch(getTeams());
  }, [dispatch]);

  useEffect(() => {
    if (workspace.all_roles) {
      setRoles(workspace.all_roles);
      // setActiveRole(workspace.available_roles[0]);
    }
  }, [workspace]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const getRoleLabel = (role) => {
    if (!role?.type || role?.type === "system") {
      switch (role?.slug) {
        case "owner":
          return "Full system access";
        case "admin":
          return "Manage teams & projects";
        case "member":
          return "Standard team member";
        case "viewer":
          return "Read only access";
        default:
          return "Custom access";
      }
    }

    return "Custom access";
  };

  const [selected, setSelected] = useState("#4A80D8");
  const colors = [
    "#4A80D8", // blue (selected)
    "#7E5BEF", // purple
    "#E0448F", // pink
    "#F5A000", // orange
    "#1FA97A", // green
    "#5E60CE", // indigo
    "#26A69A", // teal
    "#FF7A18", // orange 2
    "#1EA7B8", // cyan
    "#7BC70E", // lime
  ];

  const handleTeamField = ({ target: { name, value, type } }) => {
    setTeamFields({ ...teamfields, [name]: value });
    setTeamErrors({ ...teamerrors, [name]: "" });
  };

  const handleAddMember = (member) => {
    setActiveItems((prev) => ({
      ...prev,
      [member._id]: {
        id: member._id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
      },
    }));
    setTeamFields((prev) => ({
      ...prev,
      members: [...(prev.members || []), member._id],
    }));
  };

  const handleRemoveMember = (memberId) => {
    setActiveItems((prev) => {
      const updated = { ...prev };
      delete updated[memberId];
      return updated;
    });

   setTeamFields((prev) => ({
    ...prev,
    members: prev.members.filter(
      (id) => id?.toString() !== memberId?.toString()
    ),
  }));
  };

  const handleMemberSelect = (member) => {
    const isSelected = !!activeItems[member._id];

    if (isSelected) {
      handleRemoveMember(member._id);
    } else {
      handleAddMember(member);
    }
  };

  const handleTeamSubmit = async () => {
    setLoader(true)
    
    if( teamfields?.name === ""){
      setTeamErrors({...teamerrors, ['name']: "Team name cannot be blank."});
      setLoader( false )
      return; 
    }
    if(isteamEdit !== null ){
      await dispatch(updateTeam(isteamEdit, teamfields));
    }else{
      await dispatch(createTeam(teamfields));
    }
  
    setLoader(false);
    setCreateShow( false )
  }

  const buildActiveItemsFromTeam = (team) => {
    if (!Array.isArray(team?.members)) {
      setActiveItems({});
      return;
    }

    const membersMap = team.members.reduce((acc, member) => {
      acc[member._id] = {
        id: member._id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
      };
      return acc;
    }, {});

    setActiveItems(membersMap);
  };

 const handleEditTeam = (team) => { 
  setTeamFields({
    name: team?.name,
    color: team?.color || "#4e73df",
    members: team?.members?.map(m => m._id || m) || [],
  });
  setIsTeamEdit( team._id )
  buildActiveItemsFromTeam(team);
  setSelected(team?.color || "#4e73df")
  setCreateShow(true)
};

const handleDeleteTeam = (team) => {
  if(teamfeed?.length <= 1){
    addToast("You cannot delete the team. There should be atleast 1 team in a workspace.", 'danger');
    return;
  }
  setLoader(true)
  dispatch(deleteTeam(team?._id))
  setLoader(false)
}

  const handleRoleFieldChange = (e) => {
    const { name, value } = e.target;

    setRoleFields((prev) => ({
      ...prev,
      [name]: value,
    }));

    setRoleErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleCopyPermissions = (roleId) => {

    const merged = {};

    // Step 1: Initialize merged with empty string values
    permissionModules.forEach((mod) => {
      merged[mod.slug] = {};
      mod.permissions.forEach((p) => {
        merged[mod.slug][p] = "";
      });
    });
  if (roleId === "none") {

    setRoleFields((prev) => ({
      ...prev,
      permissions: merged,
    }));
    return;
  }else{
    const sourceRole = roles?.find((r) => r._id === roleId)
    
    const newPerms = sourceRole.permissions || {};

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

    setRoleFields((prev) => ({
      ...prev,
      permissions: updated,
    }));
      
  }
};

const handleCreateRole = async (e) => {
  e.preventDefault();

  if (!roleFields.name) {
    setRoleErrors({ name: "Role name is required" });
    return;
  }

  setRoleLoader(true);



  // API call here
   await dispatch(addRoleWithPermissions(roleFields))

  setRoleLoader(false);
  setShowRoleModal(false);
};


  return (
    <>
      <div className="page--wrapper setting--page">
        <div className="rounded--box permission__page">
          <Tabs defaultActiveKey="roles">
            <Tab eventKey="roles" title="Roles">
              {
                (memberProfile?.role?.slug === "owner" || memberProfile?.role?.permissions?.members?.update_permissions === true) && (
                  <Button variant="primary" onClick={() => setShowRoleModal(true)}>Create Custom Role</Button>
                )
              }
              
              {roles && roles?.length > 0 && (
                <>
                  <Accordion activeKey={activeAccordionKey} onSelect={(eventKey) => {
                    setActiveAccordionKey(eventKey);
                      const selectedRole = roles.find((role) => role._id === eventKey);
                      setActiveRole(selectedRole);
                    }}>
                    {roles.map((role, index) => {
                      return (
                        <Accordion.Item eventKey={role._id}>
                          <Accordion.Header>
                            <div className="d-flex gap-3 align-items-center">
                              <span className="lock--icon d-flex align-items-center justify-content-center p-3 bg-light rounded-3">
                                <FiLock />
                              </span>
                              <div className="role---name">
                                <h4 className="d-flex align-items-center gap-2 mb-0">
                                  <span>{role.name}</span>
                                  <Badge
                                    bg="secondary"
                                    className="rounded-5 fw-medium"
                                  >
                                    {
                                      (!role?.type || role?.type === 'system') ? 'System' : 'Custom'
                                    }
                                  </Badge>
                                 <span>{getRoleLabel(role)}</span>
                                </h4>
                              </div>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            {activeRole && Object.keys(activeRole).length > 0 && (
                            <div className="new--accordion--block w-100">
                              
                              {permissionModules.map((mod) => {
                                const modSlug = mod.slug;
                                const modPerms = permissions?.[modSlug] || {};
                                
                                const isViewChecked = !!modPerms.view;
                                // const truePermissionCount = Object.values(
                                //   modPerms,
                                // ).filter((val) => val === true).length;

                                const allPermissions = (mod.permissions || []).filter(
                                  (p) =>
                                    ![
                                      "selected_teams",
                                      "selected_team_members",
                                      "auto_add_new_teams",
                                      "auto_add_teams",
                                    ].includes(p)
                                );

                                // Count only boolean permission keys
                                const totalPermissionCount = allPermissions.length;
                                const truePermissionCount = Object.values(modPerms).filter((val) => val === true).length;
                                let accessType = "none";

                                if (truePermissionCount === 0) {
                                  accessType = "none";
                                } else if (truePermissionCount === totalPermissionCount) {
                                  accessType = "full";
                                } else if (truePermissionCount === 1 && modPerms.view === true) {
                                  accessType = "view";
                                } else {
                                  accessType = "limited";
                                }

                                if(modSlug === 'assigned_teams' && activeRole?.slug === "owner" || modSlug === 'assigned_teams' && activeRole?.slug === "admin"){
                                  accessType = "all_teams_and_future_teams"
                                }

                                return (
                                  <Accordion className="mb-3">
                                    <Accordion.Item eventKey="1">
                                      <Accordion.Header>
                                        <div className="d-flex gap-3 align-items-center w-100">
                                          {permissionsLabel[modSlug]?.icon || <LuFolderOpen />}
                                          
                                          <div>
                                            <h6 className="mb-0">
                                              {permissionsLabel[modSlug]?.heading}
                                            </h6>
                                            <small className="d-block">
                                              {permissionsLabel[modSlug]?.sub_heading}
                                            </small>
                                          </div>

                                          {/* ACCESS BADGE */}
                                          <div className="ms-auto">
                                            {accessType === "none" && (
                                              <span className="badge bg-secondary">No Access</span>
                                            )}
                                            {accessType === "view" && (
                                              <span className="badge bg-info">View Only</span>
                                            )}
                                            {accessType === "limited" && (
                                              <span className="badge bg-warning text-dark">Limited</span>
                                            )}
                                            {accessType === "full" && (
                                              <span className="badge bg-success">Full Access</span>
                                            )}
                                            {accessType === "all_teams_and_future_teams" && (
                                              <span className="badge bg-warning">All teams + future teams</span>
                                            )}
                                          </div>
                                        </div>
                                      </Accordion.Header>
                                      <Accordion.Body>
                                        {
                                          (modSlug === 'assigned_teams' && showTeamAssign === false && activeRole?.type !== 'system') && (
                                            <>
                                              <p>This role is not assigned to any teams. Use this feature for team leads, 
                                                managers, and HRs who need to view their team members' projects, time 
                                                tracking, reports, attendance, and other team-related data.</p>
                                              <Button variant="primary" onClick={() => setShowTeamAssign(true)}>+ Assign Team</Button>
                                            </>
                                            
                                          )
                                        }
                                        {
                                          (modSlug === 'assigned_teams' && showTeamAssign === true && activeRole?.type !== 'system') && (
                                            <Alert variant="warning" className="d-flex justify-content-end align-items-center">
                                              <Button
                                                variant="link"
                                                className="p-0 text-decoration-none"
                                                onClick={() => {
                                                  setShowTeamAssign( false);
                                                  setPermissions((prev) => ({
                                                    ...prev,
                                                    assigned_teams: {
                                                      ...prev?.assigned_teams,
                                                      specific_teams_only: false,
                                                      specific_peoples_only: false,
                                                      selected_teams: [],
                                                      selected_team_members: {},
                                                    },
                                                  }));
                                                }}
                                              >
                                               x Remove Team Assignement
                                              </Button>
                                            </Alert>
                                          )
                                        }
                                        {(mod.permissions || []).map((perm) => {
                                          if (perm === "view") {
                                            return (
                                              <>
                                              <div className="d-flex gap-3 align-items-center mt-3 bg-light px-3 py-2 rounded-3">
                                                <Form.Check
                                                  key={`${modSlug}--view`}
                                                  type="checkbox"
                                                  checked={!!modPerms.view}
                                                  onChange={() =>
                                                    toggleView(modSlug)
                                                  }
                                                  name="assign_team_option"
                                                  id={`default-${modSlug}-view`}
                                                  label={permissionsLabel[modSlug][perm]
                                                        ?.heading}
                                                  disabled={role?.type === 'system'}
                                                />
                                                <small className="d-block">
                                                    {
                                                      permissionsLabel[modSlug][perm]
                                                        ?.sub_heading
                                                    }
                                                  </small>
                                              </div>
                                              
                                              </>
                                            );
                                          }else if (perm === "specific_teams_only") {
                                            return (
                                              <div className={ showTeamAssign === false ? 'd-none': ''}>
                                                <div className="d-flex gap-3 align-items-center mt-3 bg-light px-3 py-2 rounded-3">
                                                  <Form.Check
                                                    key={`${modSlug}--assigned-team`}
                                                    type="radio"
                                                    checked={!!modPerms[perm]}
                                                    onChange={(e) =>
                                                      togglePermission(modSlug, perm, e.target.checked)
                                                    }
                                                    // name="assign_team_option"
                                                    id={`default-${perm}-view`}
                                                    label={permissionsLabel[modSlug][perm]
                                                        ?.heading}
                                                    data-val={modPerms[perm]}
                                                    disabled={role?.type === 'system'}
                                                  />
                                                  <small className="d-block">
                                                    {
                                                      permissionsLabel[modSlug][perm]
                                                        ?.sub_heading
                                                    }
                                                  </small>
                                                </div>
                                                {(modPerms[perm] === true) && (
                                                  <>
                                                  <div className="team--card--grid">
                                                      {teamfeed?.map(
                                                        (team) => (
                                                          <Card
                                                            className={`team--card ${
                                                              modPerms[
                                                                "selected_teams"
                                                              ]?.includes(
                                                                String(
                                                                  team._id,
                                                                ),
                                                              )
                                                                ? "selected--card"
                                                                : ""
                                                            }`}
                                                            onClick={() => {
                                                              toggleTeams(
                                                                modSlug,
                                                                "selected_teams",
                                                                team._id,
                                                              );
                                                            }}
                                                            
                                                          >
                                                            <span className="team--initial">
                                                              {team.name?.charAt(
                                                                0,
                                                              ) || "U"}
                                                            </span>
                                                            <Card.Body>
                                                              <h4>
                                                                {team.name}{" "}
                                                                <small className="d-block">
                                                                  Total Members {
                                                                    team?.members?.length
                                                                      || 0
                                                                  }
                                                                </small>
                                                              </h4>
                                                            </Card.Body>
                                                            <FiCheck className="ms-auto" />
                                                          </Card>
                                                        ),
                                                      )}
                                                    </div>
                                                    <div className="auto-add-box mt-4 p-3">
                                                      <Form.Check
                                                        type="switch"
                                                        id={`auto-add-new-teams`}
                                                        onChange={(e) => {autoAddTeamToggle(modSlug,
                                                          "auto_add_new_teams", e.target.checked)}}
                                                        checked={modPerms?.auto_add_new_teams}
                                                        label={
                                                          <>
                                                            <div className="fw-semibold">
                                                              Auto-add future Default Team members
                                                            </div>
                                                            <div className="text-muted small">
                                                              New people joining this team will be automatically visible
                                                            </div>
                                                          </>
                                                        }
                                                        disabled={role?.type === 'system'}
                                                      />
                                                    </div>
                                                    </>
                                                  )}
                                              </div>
                                            );
                                          }else if (perm === "specific_peoples_only") {
                                            return (
                                              <div className={ showTeamAssign === false ? 'd-none': ''}>
                                              <div className="d-flex gap-3 align-items-center mt-3 bg-light px-3 py-2 rounded-3">
                                                <Form.Check
                                                  key={`${modSlug}--assigned-team`}
                                                  type="radio"
                                                  checked={!!modPerms[perm]}
                                                  onChange={(e) =>
                                                    togglePermission(modSlug, perm, e.target.checked)
                                                  }
                                                  id={`default-${perm}-view`}
                                                  label={permissionsLabel[modSlug][perm]
                                                        ?.heading}
                                                  disabled={role?.type === 'system'}
                                                />
                                                <small className="d-block">
                                                    {
                                                      permissionsLabel[modSlug][perm]
                                                        ?.sub_heading
                                                    }
                                                  </small>
                                              </div>
                                              {modPerms[perm] === true && (
                                                <div className="team-container">

                                                  {teamfeed?.map((team) => {
                                                    // const allSelected =
                                                    //   team?.members?.length > 0 &&
                                                    //   team?.members?.every((m) =>
                                                    //     modPerms[perm]?.selected_team_members?.includes(String(m._id))
                                                    //   );

                                                    return (
                                                      <Card key={team._id} className="team-group-card mb-3">
                                                        {/* TEAM HEADER */}
                                                        <Card.Header className="d-flex align-items-center justify-content-between">
                                                          <div className="d-flex align-items-center gap-2">
                                                            <span
                                                              className="team-color"
                                                              style={{ background: team.color || "#3b82f6" }}
                                                            />
                                                            <strong>{team.name}</strong>
                                                            <span className="text-muted">
                                                              ({team?.members?.length || 0} members)
                                                            </span>
                                                          </div>
                                                          <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            onClick={() => {
                                                              setPermissions((prev) => {
                                                                const currentPerms = prev?.[modSlug] || {};
                                                                const currentTeams = currentPerms?.["selected_team_members"] || {};

                                                                const teamKey = String(team._id);

                                                                const existingMembers = Array.isArray(currentTeams[teamKey])
                                                                  ? currentTeams[teamKey]
                                                                  : [];

                                                                const allMemberIds = team.members.map((m) => String(m._id));

                                                                // ✅ check if all already selected
                                                                const isAllSelected =
                                                                  allMemberIds.length > 0 &&
                                                                  allMemberIds.every((id) => existingMembers.includes(id));

                                                                const updatedTeams = {
                                                                  ...currentTeams,
                                                                  [teamKey]: isAllSelected ? [] : allMemberIds,
                                                                };

                                                                // optional cleanup
                                                                if (isAllSelected) {
                                                                  delete updatedTeams[teamKey];
                                                                }

                                                                return {
                                                                  ...prev,
                                                                  [modSlug]: {
                                                                    ...currentPerms,
                                                                    selected_team_members: updatedTeams,
                                                                  },
                                                                };
                                                              });
                                                            }}
                                                          >
                                                            Select All
                                                          </Button>
                                                        </Card.Header>

                                                        {/* TEAM MEMBERS */}
                                                        <Card.Body className="p-0">
                                                          {team?.members?.map((member) => { 
                                                           const isChecked =
                                                                  modPerms?.selected_team_members?.[String(team?._id)]?.includes(
                                                                    String(member._id)
                                                                  ) || false;

                                                            return (
                                                              <div
                                                                key={member._id}
                                                                className="member-row d-flex align-items-center px-3 py-3"
                                                              >
                                                                <Form.Check
                                                                  type="checkbox"
                                                                  checked={isChecked}
                                                                  onChange={(e) =>
                                                                    toggleTeamMembers(
                                                                      modSlug,
                                                                      "selected_team_members",
                                                                      team._id,
                                                                      member._id,
                                                                      e.target.checked
                                                                    )
                                                                  }
                                                                  disabled={role?.type === 'system'}
                                                                />

                                                                <div
                                                                  className="member-avatar ms-3"
                                                                  style={{ background: "#6366f1" }}
                                                                >
                                                                  {member.name?.slice(0, 2)?.toUpperCase()}
                                                                </div>

                                                                <div className="ms-3">
                                                                  <div className="fw-semibold">{member.name}</div>
                                                                  <div className="text-muted small">
                                                                    {member.role || "Member"}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            );
                                                          })}
                                                          {/* AUTO ADD SECTION */}
                                                            <div className="auto-add-box mt-4 p-3">
                                                              <Form.Check
                                                                type="switch"
                                                                id={`auto-add-${team?._id}`}
                                                                onChange={() => {autoAddTeamMembersToggle(modSlug,
                                                                  "auto_add_teams", team?._id)}}
                                                                checked={
                                                                  modPerms?.auto_add_teams?.includes(
                                                                    String(team?._id)
                                                                  ) || false
                                                                }
                                                                label={
                                                                  <>
                                                                    <div className="fw-semibold">
                                                                      Auto-add future Default Team members
                                                                    </div>
                                                                    <div className="text-muted small">
                                                                      New people joining this team will be automatically visible
                                                                    </div>
                                                                  </>
                                                                }
                                                                disabled={role?.type === 'system'}
                                                              />
                                                            </div>
                                                        </Card.Body>
                                                      </Card>
                                                    );
                                                  })}

                                                  
                                                </div>
                                              )}
                                              </div>
                                            );
                                          }
                                          return (
                                            <>
                                              <div className="d-flex gap-3 align-items-center mt-3 bg-light px-3 py-2 rounded-3">
                                                <Form.Check
                                                  id={`${modSlug}-${perm}`}
                                                  key={perm}
                                                  disabled={role.type === "system" || !isViewChecked}
                                                  checked={!!modPerms[perm]}
                                                  onChange={(e) =>
                                                    togglePermission(
                                                      modSlug,
                                                      perm,
                                                      e.target.checked
                                                    )
                                                  }
                                                  label={permissionsLabel[modSlug][perm]
                                                        ?.heading}
                                                />
                                                <small className="d-block">
                                                    {
                                                      permissionsLabel[modSlug][perm]
                                                        ?.sub_heading || ''
                                                    }
                                                  </small>
                                              </div>
                                              {
                                                perm === "view_others" && modPerms[perm] === true && (
                                                  <Alert variant="primary">
                                                    <Alert.Heading>
                                                      Team visibility applies to {modSlug.replace(/_/g, " ")}
                                                    </Alert.Heading>

                                                    <p>
                                                      {(() => {
                                                        const assigned = permissions?.assigned_teams;

                                                        // ✅ Specific people only
                                                        if (
                                                          assigned?.specific_peoples_only === true &&
                                                          Object.keys(assigned?.selected_team_members || {}).length > 0
                                                        ) {
                                                          const memberCount = Object.keys(
                                                            assigned.selected_team_members
                                                          ).length;

                                                          const autoTeamCount = assigned?.auto_add_teams?.length || 0;

                                                          return `This role can see selected ${memberCount} members${
                                                            autoTeamCount > 0
                                                              ? ` + auto from ${autoTeamCount} team${
                                                                  autoTeamCount > 1 ? "s" : ""
                                                                }`
                                                              : ""
                                                          }`;
                                                        }

                                                        // ✅ Specific teams only
                                                        if (
                                                          assigned?.specific_teams_only === true &&
                                                          assigned?.selected_teams?.length > 0
                                                        ) {
                                                          const teamCount = assigned.selected_teams.length;

                                                          return `This role can see ${teamCount} team${
                                                            teamCount > 1 ? "s" : ""
                                                          }${
                                                            assigned?.auto_add_new_teams === true
                                                              ? " + future teams"
                                                              : ""
                                                          }`;
                                                        }

                                                        return null;
                                                      })()}
                                                    </p>
                                                  </Alert>
                                                )
                                              }
                                              {
                                                (permissionsLabel[modSlug][perm]?.caution && permissionsLabel[modSlug][perm]?.caution === true) && (
                                                  <Alert variant="danger">
                                                    <Alert.Heading>
                                                      Caution Required:
                                                    </Alert.Heading>
                                                    <p>{permissionsLabel[modSlug][perm]?.caution_text}</p>
                                                  </Alert>
                                                )
                                              }
                                            </>
                                          );
                                        })}
                                      </Accordion.Body>
                                    </Accordion.Item>
                                  </Accordion>
                                );
                              })}
                              {(role?.type === 'custom' && memberProfile?.role?.slug === "owner" || role?.type === 'custom' && memberProfile?.role?.permissions?.members?.update_permissions === true) && (
                                <div className="mt-4 text-end fixed--bottom">
                                  <Button
                                    variant="secondary"
                                    onClick={() => setShowDelete(true)}
                                  >
                                    Delete
                                  </Button>
                                  <Button
                                    variant="primary"
                                    className="ms-3"
                                    onClick={handleSave}
                                    disabled={loader}
                                  >
                                    {
                                      loader ? 'Please wait...' : 'Save'
                                    }
                                  </Button>
                                </div>
                              )}
                            </div>)}
                          </Accordion.Body>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>
                  {/* <Row className="mt-4">
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
                      
                      </Row> */}
                      <Modal
                        show={showRoleModal}
                        onHide={() => setShowRoleModal(false)}
                        size="lg"
                        centered
                        onShow={() => {
                          setRoleFields({
                            name: "",
                            permissions: {},
                          })
                          selectboxObserver();
                        }}
                      >
                        <Modal.Header closeButton>
                          <Modal.Title>Create Custom Role</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                          <Form onSubmit={handleCreateRole}>
                            {/* Role Name */}
                            <Form.Group className="mb-4">
                              <FloatingLabel label="Role Name *">
                                <Form.Control
                                  type="text"
                                  name="name"
                                  value={roleFields.name}
                                  onChange={handleRoleFieldChange}
                                  disabled={roleLoader}
                                  placeholder="e.g. Contractor, Reviewer"
                                />
                              </FloatingLabel>
                              {roleErrors.name && (
                                <small className="text-danger">{roleErrors.name}</small>
                              )}
                            </Form.Group>

                            {/* Copy Permissions */}
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-semibold">
                                Copy permissions from
                              </Form.Label>

                              <Form.Select
                                value={roleFields.copy_from}
                                name="copy_from"
                                onChange={(e) => handleCopyPermissions(e.target.value)}
                                className="custom-selectbox"
                              >
                                <option value="none">No permissions (start fresh)</option>

                                <optgroup label="Roles">
                                  {roles?.map((role) => {
                                    if(role?.slug !== "owner"){
                                      return (
                                      <option key={role._id} value={role._id}>
                                        {role.name}
                                      </option>
                                    )}})}
                                </optgroup>

                                
                              </Form.Select>
                            </Form.Group>
                          </Form>
                        </Modal.Body>

                        <Modal.Footer>
                          <Button
                            variant="primary"
                            onClick={handleCreateRole}
                            disabled={roleLoader}
                          >
                            {roleLoader ? "Please wait..." : "Save Role"}
                          </Button>
                        </Modal.Footer>
                      </Modal>
                </>
              )}
            </Tab>
            { (memberProfile?.role?.slug === "owner" || memberProfile?.role?.permissions?.teams?.view === true) && (
              <Tab eventKey="teams" title="Teams">
                <Card className="shadow-sm mb-5">
                  <Card.Body className="p-0">
                    <Row className="align-items-center mb-4">
                      <Col>
                        <h4 className="mb-1">Teams</h4>
                        <div className="text-muted" style={{ fontSize: "14px" }}>
                          {teamfeed?.length} team in your organization
                        </div>
                      </Col>
                      {
                        (memberProfile?.role?.slug === "owner" || memberProfile?.role?.permissions?.teams?.create_edit_delete === true) && (
                      
                      <Col xs="auto">
                        <Button
                          variant="primary"
                          onClick={() => handleCreateShow()}
                        >
                          <FaPlus className="me-2" />
                          Create Team
                        </Button>
                      </Col>)}
                    </Row>

                    {/* Team Item */}
                    {
                      (teamfeed && teamfeed?.length > 0) && (
                        teamfeed.map((team, index) => {
                          return (
                            <Card className="border rounded bg-light">
                              <Card.Body className="p-0">
                                <Row className="align-items-center">
                                  <Col xs="auto">
                                    <div
                                      style={{
                                        width: "45px",
                                        height: "45px", 
                                        backgroundColor: team?.color || "#4e73df",
                                        borderRadius: "8px",
                                      }}
                                    />
                                  </Col>

                                  <Col>
                                    <div className="fw-semibold">{team?.name}</div>
                                    <div
                                      className="text-muted"
                                      style={{ fontSize: "14px" }}
                                    >
                                      {team?.members?.length || 0 } members
                                    </div>
                                  </Col>
                                   {
                                    (memberProfile?.role?.slug === "owner" || memberProfile?.role?.permissions?.teams?.create_edit_delete === true) && (
                      
                                  <Col xs="auto">
                                    <LuPencilLine
                                      onClick={() => {
                                        handleEditTeam(team)
                                      }}
                                      style={{ cursor: "pointer", color: "#6c757d" }}
                                    />
                                    <FaTrash onClick={() => {
                                      handleDeleteTeam(team)
                                    }}
                                    style={{ cursor: "pointer", color: "#6c757d" }} />
                                  </Col>)}
                                </Row>
                              </Card.Body>
                            </Card>)
                          })
                      )
                    }
                    
                  </Card.Body>
                </Card>
              </Tab>)}
          </Tabs>
          {/* <h3 className="d-flex align-items-center justify-content-end">
                <Button variant="primary" onClick={() => handleShow()}><FaPlus /> Add New</Button>
            </h3> */}
        </div>
        {showdelete && (
          <AlertDialog
            showdialog={showdelete}
            toggledialog={setShowDelete}
            msg="Are you sure?"
            callback={handleDeleteRole}
          />
        )}
      </div>
      {show && (
        <Modal
          show={show}
          onHide={() => {
            setShow(false);
            setTimeout(() => {
              selectboxObserver();
            }, 650);
          }}
          size="lg"
        >
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
                  
                  const isViewChecked = !!modPerms.view;
                  const truePermissionCount = Object.values(modPerms).filter(
                    (val) => val === true,
                  ).length;
                  return (
                    <div className="bg--blue--accordion">
                      <div className="d-flex gap-3 align-items-center">
                        {permissionsLabel[modSlug]?.icon || <LuFolderOpen />}
                        <h6 className="mb-0">
                          {permissionsLabel[modSlug]?.heading}{" "}
                          <small className="d-block">
                            {permissionsLabel[modSlug]?.sub_heading}
                          </small>
                        </h6>
                      </div>
                      {(mod.permissions || []).map((perm) => {
                        if (perm === "view") {
                          return (
                            <div className="d-flex gap-3 align-items-center mt-3 bg-light px-3 py-2 rounded-3">
                              <Form.Check
                                key={`${modSlug}--view`}
                                type="checkbox"
                                checked={!!modPerms.view}
                                onChange={() => toggleView(modSlug)}
                                id={`default-${modSlug}-view`}
                                label="View"
                              />
                              {/* <Form.Check key={`${modSlug}--view`} type="switch" className="switch--small" checked={!!modPerms.view} onChange={() => toggleView(modSlug)}/>
                                        <p className="mb-0">View</p> */}
                            </div>
                          );
                        }
                        return (
                          <>
                            <div className="d-flex gap-3 align-items-center mt-3 bg-light px-3 py-2 rounded-3">
                              <Form.Check
                                id={`${modSlug}-${perm}`}
                                key={perm}
                                disabled={!isViewChecked}
                                checked={!!modPerms[perm]}
                                onChange={(e) => togglePermission(modSlug, perm, e.target.checked)}
                                label={perm
                                  .replace(/[_-]/g, " ")
                                  .replace(/^\w/, (l) => l.toUpperCase())}
                              />
                              {/* <Form.Check type="switch" className="switch--small" id={`${modSlug}-${perm}`} key={perm}
                                        disabled={!isViewChecked}
                                        checked={!!modPerms[perm]}
                                        onChange={() =>
                                            togglePermission(modSlug, perm)
                                        }
                                        />

                                        <p className="mb-0">{perm.replace(/[_-]/g, " ").replace(/^\w/, (l) => l.toUpperCase())}</p> */}
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
                                    <Card
                                      className={`team--card ${
                                        modPerms["selected_members"]?.includes(
                                          String(member._id),
                                        )
                                          ? "selected--card"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        //if (selectedMember?.role?.slug !== "owner") {
                                        toggleMembers(
                                          modSlug,
                                          "selected_members",
                                          member._id,
                                        );
                                        // }
                                      }}
                                    >
                                      <span className="team--initial">
                                        {member.name?.charAt(0) || "U"}
                                      </span>
                                      <Card.Body>
                                        <h4>
                                          {member.name}{" "}
                                          <small className="d-block">
                                            {member?.role?.name}
                                          </small>
                                        </h4>
                                      </Card.Body>
                                      <FiCheck className="ms-auto" />
                                    </Card>
                                  ))}

                                  {modSlug === "projects" && (
                                    <Card
                                      className={`team--card ${
                                        modPerms["selected_members"]?.includes(
                                          "unassigned",
                                        )
                                          ? "selected--card"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        //if (selectedMember?.role?.slug !== "owner") {
                                        toggleMembers(
                                          modSlug,
                                          "selected_members",
                                          "unassigned",
                                        );
                                        // }
                                      }}
                                      key={`${modSlug}-${perm}-unassigned`}
                                    >
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
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={handleSubmit}
              type="submit"
              disabled={loader}
            >
              {loader ? "Please wait..." : "Save Role"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/*--=-=Create Teams Modal**/}
      <Modal
        show={showCreate}
        onHide={handleCreateClose}
        size="md"
        centered
        className="status--modal assign--task--modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            { (isteamEdit !== null ) ? 'Edit' : 'Create' } Team</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          
            <Form.Group>
              <FloatingLabel label="Team Name">
                <Form.Control
                  type="text"
                  placeholder="Designing, Marketing, etc."
                  name="name"
                  value={teamfields?.name}
                  onChange={handleTeamField}
                  className={teamerrors['name'] ? "input-error" : ''}
                />
              </FloatingLabel>
               <span className="team-error">{teamerrors['name'] || ''}</span>
            </Form.Group>
          

          <p className="mb-3 mt-4 fw-semibold">Color</p>
          <div className="d-flex flex-wrap gap-3 mb-3">
            {colors.map((color, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelected(color);
                  handleTeamField({
                    target: { name: "color", value: color },
                  });
                }}
                className="rounded-2"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: color,
                  cursor: "pointer",
                  border:
                    selected === color
                      ? "4px solid #212529"
                      : "2px solid transparent",
                  boxShadow: selected === color ? "0 0 0 4px #ffffff" : "none",
                  transition: "all 0.2s ease-in-out",
                }}
              />
            ))}
          </div>
          <Form>
            <Form.Group>
              <FloatingLabel label="Search here">
                <Form.Control
                  type="text"
                  placeholder="Search here"
                  value={search}
                  onChange={handleSearchChange}
                />
              </FloatingLabel>
            </Form.Group>
          </Form>
          <ListGroup className="added--list">
            {activeItems &&
              Object.keys(activeItems).length > 0 &&
              Object.entries(activeItems).map(([id, memberInfo], index) => (
                <ListGroup.Item
                  key={`listkey-${index}`}
                  onClick={() => handleRemoveMember(memberInfo.id)}
                >
                  <span>
                    <img
                      src={memberInfo?.avatar || "../images/default.jpg"}
                      alt=""
                    />
                  </span>
                  <p>
                    {memberInfo?.name} <FaTimesCircle />
                  </p>
                </ListGroup.Item>
              ))}
          </ListGroup>
          <ListGroup className="status--list">
            {filteredMembers &&
              filteredMembers.length > 0 &&
              filteredMembers.map((member) => (
                <ListGroup.Item
                  key={member?._id || `listkey-${member.name}`}
                  onClick={() => handleMemberSelect(member)}
                  className={activeItems[member?._id] ? "status--active" : ""}
                >
                  <span>
                    <img
                      src={member?.avatar || "../images/default.jpg"}
                      alt={member?.name || "Default"}
                    />
                  </span>
                  <p>
                    {member?.name}
                    {activeItems[member?._id] && <FaCheck />}
                  </p>
                </ListGroup.Item>
              ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCreateClose}>
            Close
          </Button>
          <Button onClick={handleTeamSubmit} variant="primary" disabled={loader}>{loader ? 'Please wait...' : 'Create Team' }</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RolesPage;
