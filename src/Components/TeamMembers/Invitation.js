import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Accordion,
  Button,
  Modal,
  Form,
  Card,
  ListGroup,
  Table,
  Dropdown,
  FloatingLabel,
  Badge
} from "react-bootstrap";
import { useToast } from "../../context/ToastContext";
import { currentMemberProfile } from "../../helpers/auth";
import {
  permissionModules,
  permissionsLabel,
} from "../../helpers/permissionsModules";
import { getAvailableRolesByWorkspace } from "../../redux/actions/workspace.action";
import {
  toggleSidebar,
  toggleSidebarSmall,
} from "../../redux/actions/common.action";
import { LuUser, LuSettings2, LuUsers, LuFolderOpen } from 'react-icons/lu';
import { FcInvite } from "react-icons/fc";
import { GrExpand } from "react-icons/gr";
import { AiOutlineTeam } from "react-icons/ai";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { FaCheck, FaCog, FaEllipsisV } from "react-icons/fa";
import { FiEdit, FiUsers } from "react-icons/fi";
import {
  FiMail,
  FiBriefcase,
  FiShield,
  FiCheck,
  FiTrash2,
} from "react-icons/fi";
import {
  acceptCompanyinvite,
  listCompanyinvite,
  deleteInvite,
  Listmembers,
  updateInvite,
} from "../../redux/actions/members.action";
import { MdOutlineClose } from "react-icons/md";
import { fetchCustomFields } from "../../redux/actions/customfield.action";
import { updatePermissions } from "../../redux/actions/permission.action";
import {
  selectboxObserver,
  convertDDMMYYYYtoYYYYMMDD,
  formatDateToDDMMYYYY,
  roleHelperText
} from "../../helpers/commonfunctions";
import { renderDynamicField } from "../common/dynamicFields";
import { BadgesModal } from "../modals/badges";
import { getTeams } from "../../redux/actions/team.action";
function Invitation(props) {
  const [isActiveView, setIsActiveView] = useState(2);
  const [showPermissions, setShowPermissions] = useState(false);
  const memberProfile = currentMemberProfile();
  const [isActive, setIsActive] = useState(0);
  const [loader, setLoader] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showBadges, setShowBadges] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const dispatch = useDispatch();
  const addToast = useToast();
  const [currentPage, setCurrentPage] = useState(0);
  const [teamfeed, setTeamFeed] = useState([]);
  const [filteredteamfeed, setFilteredTeamFeed] = useState([])
  const apiCustomfields = useSelector((state) => state.customfields);
  const [customFields, setCustomFields] = useState([]);
  const [fields, setFields] = useState({ email: "", name: "", role: "" });
  const [errors, setErrors] = useState([]);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const memberstate = useSelector((state) => state.member);
  const memberFeed = useSelector((state) => state.member.members);
  const invitationsFeed = useSelector((state) => state.member.invitations);
  const teamsState = useSelector((state) => state.teams);
  const handleSidebarSmall = () =>
    dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true));
  const handleSidebar = () =>
    dispatch(toggleSidebar(commonState.sidebar_open ? false : true));
  const commonState = useSelector((state) => state.common);
  const [invitationsFeeds, setInvitationsFeed] = useState([]);
  const [memberFeeds, setMemberFeed] = useState([]);
  const [total, setTotal] = useState(0);
  const [showloader, setShowloader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [expanded, setExpanded] = useState({});
  const workspaceState = useSelector((state) => state.workspace);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [showTeams, setTeamsShow] = useState(false);
  const handleTeamsClose = () => setTeamsShow(false);
  const handleTeamsShow = () => setTeamsShow(true);

  const [showRoles, setShowRoles] = useState(false);
  const handleRoleClose = () => setShowRoles(false);
  const handleRoleShow = () => {
    setShowRoles(true);
    setTimeout(() => {
      selectboxObserver()
    },500)

    // setTimeout(() => {
      if(selectedInvitation?.role?._id === roles?.[0]?._id ){
        handleClickRoles(roles?.[1]?._id)
      }else{
        handleClickRoles(roles?.[0]?._id)
      }
      
    // },700)
    
    
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    let filteredteams = [];
    if( teamfeed && teamfeed.length > 0 ){ 
      filteredteams = teamfeed.filter(team => 
        team.name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredTeamFeed(filteredteams)
    }
  };

  const handleClickTeams = (teamId) => {
    setFields((prev) => {
      const selectedTeams = prev?.selected_teams || [];

      const updatedTeams = selectedTeams.includes(teamId)
        ? selectedTeams.filter((id) => id !== teamId) // remove
        : [...selectedTeams, teamId]; // add

      return {
        ...prev,
        selected_teams: updatedTeams,
      };
    });
  };

  const handleSaveTeams = async () => {
    if(fields?.selected_teams && fields?.selected_teams?.length === 0 || !fields?.selected_teams ){
      addToast("Please select at least one team.", "danger");
      return;
    }
    setLoader(true)
    const formData = new FormData()
    fields['selected_teams'].forEach((item) => {
      formData.append(`selected_teams[]`, item);
    });
    await dispatch(updateInvite(selectedInvitation?._id, formData));
    setLoader(false)
    handleTeamsClose()
  }

  const handleClickRoles = (roleId) => {
    setFields((prev) => {
      return {
        ...prev,
        role: roleId,
      };
    });
  };

  const toggleVisibility = (key) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };


  const handleInvitationList = async () => {
    if (props.activeTab === "Invitations") {
      setInvitationsFeed([]);

      await dispatch(
        listCompanyinvite(currentPage, props.listfor, props.searchTerm),
      );
      setShowloader(false);
    }
  };

  useEffect(() => {
    dispatch(getAvailableRolesByWorkspace({ fields: "_id name permissions" }));
    handleListMember();
    let prm = {};
    permissionModules.forEach((mod) => {
      prm[mod.slug] = {}; // Initialize object for each module
      mod.permissions.forEach((p) => {
        prm[mod.slug][p] = "";
      });
    });

    setPermissions(prm);

    dispatch(getTeams());
  }, []);

  

  useEffect(() => {
    if (teamsState && teamsState.teams) {
      setTeamFeed(teamsState.teams);
      setFilteredTeamFeed(teamsState.teams)
      
    }
  }, [teamsState]);

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
      const inviteData = {
        Id: selectedInvitation._id,
        permissions,
        type: "invite",
      };
      setLoader(true);
      dispatch(updatePermissions(inviteData));
    } catch (err) {
      setLoader(false);
      console.error("Error changing permissions:", err);
    }
  };

  const handleListMember = async () => {
    await dispatch(Listmembers());
    setShowloader(false);
  };


  const handleSaveRole = async () => {
    if(!fields?.role && fields?.role === "" ){
      addToast("Please select a role.", "danger");
      return;
    }
    setLoader(true)
    const formData = new FormData()
    
    formData.append(`role`, fields?.role);
    
    await dispatch(updateInvite(selectedInvitation?._id, formData));
    setLoader(false)
    handleRoleClose()
  }


  const handleSavePermissions = () => {
    setFields({
      ...fields,
      [`custom_field[permissions]`]: permissions,
    });

    sentInviteAgain(selectedInvitation?._id);
    setShowPermissions(false);
  };
  useEffect(() => {
    setLoader(false);
    if (
      workspaceState.available_roles &&
      workspaceState.available_roles.length > 0
    ) {
      setRoles(workspaceState.available_roles);
    }
  }, [workspaceState]);

  useEffect(() => {
    if (memberFeed && memberFeed.memberData) {
      setMemberFeed(memberFeed.memberData);
    }
  }, [memberFeed]);

  useEffect(() => {
    if (selectedInvitation) {
      const cleanedMeta = { ...selectedInvitation?.custom_fields };

      let fieldsSetup = {
        role: selectedInvitation?.role?._id,
        selected_teams: selectedInvitation?.teams || []

      };

      if (cleanedMeta && Object.keys(cleanedMeta).length > 0) {
        Object.entries(cleanedMeta).forEach(([key, value]) => {
          fieldsSetup[`custom_field[${key}]`] = value;
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
        const newPerms = cleanedMeta?.permissions || {};

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
  }, [selectedInvitation]);

  const handleDateChange = (value, name) => {
    setFields({ ...fields, [name]: formatDateToDDMMYYYY(value) });
    setErrors({ ...errors, [name]: "" });
  };

  const handleChange = ({ target: { name, value, type, files, checked } }) => {
    let finalValue;
    if (type === "checkbox" && name.includes("[]")) {
      const arrayName = name.replace("[]", "");
      const existing = fields[arrayName] || [];
      if (checked) {
        finalValue = [...existing, value];
      } else {
        finalValue = existing.filter((v) => v !== value);
      }
      name = arrayName;
    } else if (type === "checkbox") {
      // For single checkbox: store value when checked, empty string when unchecked
      finalValue = checked ? value : "";
    } else if (type === "file") {
      finalValue = files;
    } else {
      finalValue = value;
    }

    if (name === "role") {
      const matchingRole = roles.find((role) => role._id === value);
      setFields((prevState) => ({
        ...prevState,
        role: matchingRole._id,
        rolename: matchingRole.name,
        ["custom_field[permissions]"]: matchingRole.permissions,
      }));
    } else {
      setFields({ ...fields, [name]: finalValue });
    }

    setErrors({ ...errors, [name]: "" });
  };

  useEffect(() => {
    if (currentPage !== "") {
      setShowloader(true);
      handleInvitationList();
    }
    dispatch(fetchCustomFields({ module: "members" }));
  }, [currentPage, props.searchTerm]);

  useEffect(() => {
    const check = ["undefined", undefined, "null", null, ""];

    if (invitationsFeed && invitationsFeed.inviteData) {
      setInvitationsFeed(invitationsFeed.inviteData);
      setTotal(invitationsFeed.total);
    }
  }, [invitationsFeed]);

  const handleTableToggle = (invitation) => {
    setSelectedInvitation(invitation);
    if (!isActive) {
      setIsActive(true);
    }
    if (props.toggleActive) {
      props.toggleActive(true);
    }
  };

  const acceptInvite = (token) => {
    dispatch(acceptCompanyinvite({ token: token }));
  };

  const rejectInvite = (inviteId) => {
    dispatch(deleteInvite(inviteId));
  };

  const sentInviteAgain = (inviteId) => {

    if (!fields?.selected_teams || fields?.selected_teams?.length === 0 ) {
        addToast("You must assign atleast 1 team to a member.", 'danger');
        return;
    }
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
    dispatch(updateInvite(inviteId, formData));
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
    if (memberstate) {
      setLoading(false);
    }
    if (memberstate.invite) {
      handleInvitationList();
    }

    if (memberstate?.udpatedInvite) {
      const updatedinviteFeeds = invitationsFeeds.map((m) =>
        m._id.toString() === memberstate?.udpatedInvite?._id.toString()
          ? memberstate?.udpatedInvite
          : m,
      );
      setInvitationsFeed(updatedinviteFeeds);
      setSelectedInvitation(memberstate?.udpatedInvite);
      setIsEditing(false)
    }
  }, [memberstate]);

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
            : field,
        ),
      );
    }
  }, [apiCustomfields]);

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
  return (
    <>
      <div
        className={`${
          isActive ? "view--invitee team--page project-collapse" : "team--page"
        } ${projectToggle === true ? "project-collapse" : ""}`}
      >
        {props.topbar()}
        <div className="page--wrapper px-md-2 pb-4 pt-4">
          {showloader && (
            <div className="loading-bar">
              <img src="images/OnTeam-icon-gray.png" className="flipchar" />
            </div>
          )}
          <Container fluid>
            {props.activeTab === "Invitations" && (
              <>
                {/* <div className={isActiveView === 1 ? 'project--grid--table project--grid--new--table table-responsive-xl' : isActiveView === 2 ? 'project--table draggable--table new--project--rows table-responsive-xl' : 'project--table new--project--rows table-responsive-xl'}></div> */}
                <div
                  className={
                    props.activeSubTab === 1
                      ? "project--grid--table project--grid--new--table table-responsive-xl"
                      : props.activeSubTab === 2
                        ? "project--table draggable--table new--project--rows table-responsive-xl"
                        : "project--table new--project--rows table-responsive-xl"
                  }
                >
                  {invitationsFeeds && invitationsFeeds.length > 0 ? (
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
                              <span
                                key="client-action-header"
                                className="onHide"
                              >
                                Actions
                              </span>
                            </div>
                          </th>
                          {Array.isArray(customFields) &&
                            customFields
                              .filter((field) => field?.showInTable !== false)
                              .map((field, idx) => (
                                <th
                                  scope="col"
                                  key={`member-field-${idx}-header`}
                                  className="onHide p-0 border-bottom-0"
                                >
                                  <div className="border-bottom padd--x">
                                    {field.label}
                                  </div>
                                </th>
                              ))}
                        </tr>
                      </thead>
                      <tbody>
                        {invitationsFeeds.map((invitation, index) => {
                          return (
                            <>
                              <tr
                                key={`member-table-row-${index}`}
                                className={
                                  invitation._id === selectedInvitation?._id
                                    ? "project--active"
                                    : ""
                                }
                                onClick={
                                  isActive
                                    ? () => handleTableToggle(invitation)
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
                                        <abbr>{index + 1}</abbr>
                                      </div>
                                      <div className="title--initial">
                                        {invitation.email.charAt(0)}
                                      </div>
                                      <div className="title--span flex-column align-items-start gap-0">
                                        <span>{invitation.email}</span>
                                        <strong>
                                          {invitation.role?.name?.replace(
                                            /\b\w/g,
                                            function (char) {
                                              return char.toUpperCase();
                                            },
                                          )}
                                        </strong>
                                      </div>
                                    </div>
                                    <div className="onHide task--buttons">
                                      <Button
                                        variant="primary"
                                        className="px-3 py-2"
                                        onClick={() => {
                                          handleTableToggle(invitation);
                                          setIsActive(true);
                                        }}
                                      >
                                        <BsEye />
                                      </Button>
                                    </div>
                                  </div>
                                </td>
                                {Array.isArray(customFields) &&
                                  customFields
                                    .filter(
                                      (field) => field?.showInTable !== false,
                                    )
                                    .map((field, idx) => {
                                      const fieldname = field.name;
                                      let mvalue =
                                        invitation?.custom_fields?.[
                                          fieldname
                                        ] || "";
                                      const fieldType = field.type;
                                      const uniqueKey = `${
                                        fieldname || idx
                                      }-${mvalue}`;
                                      if (
                                        field.type === "badge" &&
                                        Array.isArray(field.options)
                                      ) {
                                        const matchedOption =
                                          field.options.find(
                                            (opt) => opt.value === mvalue,
                                          );
                                        if (matchedOption) {
                                          mvalue = (
                                            <span
                                              className="priority--badge"
                                              style={{
                                                backgroundColor:
                                                  matchedOption.color,
                                                color: "#fff",
                                                display: "inline-block",
                                                borderColor:
                                                  matchedOption.color,
                                                borderWidth: "1px",
                                                borderStyle: "solid",
                                              }}
                                              onClick={() =>
                                                toggleBadges(field)
                                              }
                                            >
                                              {
                                                invitation?.custom_fields?.[
                                                  fieldname
                                                ]?.meta_value
                                              }
                                            </span>
                                          );
                                        }
                                      } else if (fieldType === "password") {
                                        return (
                                          <span className="d-flex align-items-center gap-2">
                                            {visiblePasswords[uniqueKey]
                                              ? mvalue
                                              : "*****"}
                                            <span
                                              style={{ cursor: "pointer" }}
                                              onClick={() =>
                                                toggleVisibility(uniqueKey)
                                              }
                                            >
                                              {visiblePasswords[uniqueKey] ? (
                                                <BsEyeSlash />
                                              ) : (
                                                <BsEye />
                                              )}
                                            </span>
                                          </span>
                                        );
                                      }
                                      return (
                                        <td
                                          key={`client-${
                                            fieldname || idx
                                          }-${mvalue}`}
                                          className="onHide new--td"
                                        >
                                          <strong
                                            className={
                                              isActiveView === 1
                                                ? "d-flex text-uppercase fs-small"
                                                : isActiveView === 2
                                                  ? "d-flex d-lg-none text-uppercase fs-small mb-1"
                                                  : "d-flex d-lg-none text-uppercase fs-small mb-1"
                                            }
                                          >
                                            {field.label}
                                          </strong>
                                          {mvalue}
                                        </td>
                                      );
                                    })}
                                <td className="task--last--buttons mt-auto">
                                  <div className="d-flex justify-content-between flex-wrap">
                                    <div className="onHide">
                                      <Button
                                        variant="dark"
                                        className="px-3 py-1"
                                        onClick={() => {
                                          handleTableToggle(invitation);
                                          setIsActive(true);
                                        }}
                                      >
                                        <BsEye /> View
                                      </Button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </>
                          );
                        })}
                      </tbody>
                    </Table>
                  ) : <></>}
                </div>
                {
                  (
                    !showloader &&
                    invitationsFeeds &&
                    invitationsFeeds.length === 0 && (
                      <div className="text-center">
                        <h2>No Invitations Found</h2>
                      </div>
                    )
                  )
                }
              </>
            )}
          </Container>
        </div>
      </div>
      <div className="details--invitee--view">
        <div className="wrapper--title py-2 bg-white border-bottom">
          <Dropdown>
            <Dropdown.Toggle variant="link" id="dropdown-basic">
              <div className="title--initial">
                {selectedInvitation?.email?.charAt(0)}
              </div>
              <div className="title--span flex-column align-items-start gap-0">
                <h3>
                  <strong>{selectedInvitation?.email}</strong>
                  <span>{selectedInvitation?.role?.name}</span>
                </h3>
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <div className="drop--scroll">
                {invitationsFeeds &&
                  invitationsFeeds.length > 0 &&
                  invitationsFeeds.map((invite, idx) => (
                    <Dropdown.Item
                      onClick={() => {
                        handleTableToggle(invite);
                      }}
                      key={`item-${idx}`}
                      className={
                        selectedInvitation?._id === invite?._id
                          ? "active-project"
                          : ""
                      }
                    >
                      <div className="title--initial">
                        {invite?.email.charAt(0)}
                      </div>
                      <div className="title--span flex-column align-items-start gap-0">
                        <strong>{invite?.email}</strong>
                        <span>{invite.role?.name}</span>
                      </div>
                    </Dropdown.Item>
                  ))}
              </div>
            </Dropdown.Menu>
          </Dropdown>
          <ListGroup horizontal>
            <ListGroup.Item nClick={handleToggles} className="d-none d-lg-flex">
              <GrExpand />
            </ListGroup.Item>
            <ListGroup.Item
              className="btn btn-primary"
              key={`closekey`}
              onClick={() => {
                if (props.toggleActive) {
                  props.toggleActive(false);
                }
                setIsActive(0);
                dispatch(toggleSidebarSmall(false));
              }}
            >
              <MdOutlineClose />
            </ListGroup.Item>
          </ListGroup>
        </div>

        <div className="rounded--box">
          <Card className="contact--card">
            <div className="card--img">
              <Card.Img
                variant="top"
                src={selectedInvitation?.avatar ?? "./images/default.jpg"}
              />
            </div>
            <Card.Body className="p-0 ps-4">
              <Card.Title>
                <FiMail /> Member Information
                 {(memberProfile?.role?.permissions?.members?.create_edit_delete === true || memberProfile?.role?.permissions?.members?.update_permissions === true) && (
                  <Dropdown>
                    <Dropdown.Toggle variant="dark" id="dropdown-basic">
                      <FaEllipsisV />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => sentInviteAgain(selectedInvitation?._id)}
                        className="d-flex align-items-center gap-1"
                      >
                        <FcInvite className="me-1" /> Resend
                      </Dropdown.Item>
                      {
                        (memberProfile?.role?.permissions?.members?.create_edit_delete === true) && (
                          
                          <Dropdown.Item
                            onClick={() => {
                              setIsEditing(true);
                              setTimeout(() => {
                                selectboxObserver();
                              }, 650);
                            }}
                            className="d-flex align-items-center gap-1"
                          >
                            <FiEdit className="me-1" /> Edit
                          </Dropdown.Item>)
                        }
                        

                        {
                          (memberProfile?.role?.permissions?.members?.update_permissions === true) && (
                            <Dropdown.Item onClick={() => handleRoleShow()} className="d-flex align-items-center gap-1"><LuUser className="me-1" /> Change Role</Dropdown.Item>    
                          )
                        }
                        {
                          (memberProfile?.role?.permissions?.members?.manage_teams === true) && (
                          <Dropdown.Item onClick={() => handleTeamsShow()} className="d-flex align-items-center gap-1"><LuUsers className="me-1" /> Change Teams</Dropdown.Item>)
                        }

                        {
                        (memberProfile?.role?.permissions?.members?.create_edit_delete === true) && (
                          <Dropdown.Item
                            onClick={() => rejectInvite(selectedInvitation?._id)}
                            className="d-flex align-items-center gap-1"
                          >
                            <FiTrash2 />{" "}
                            {props.listfor && props.listfor === "company"
                              ? "Delete"
                              : "Decline"}
                          </Dropdown.Item>
                        
                        )}
                    </Dropdown.Menu>
                  </Dropdown>
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
                          {selectedInvitation?.email}
                        </p>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <span className="info--icon">
                          <FiBriefcase />
                        </span>
                        <p>
                          <small>Role</small>
                          {selectedInvitation?.role?.name}
                        </p>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Text>
                  <Card.Text>
                    <ListGroup>
                      <ListGroup.Item>
                        <span className="info--icon">
                          <FiUsers />
                        </span>
                        <p>
                          <small>Teams</small>
                          {teamfeed?.map((team) => {
                            if (selectedInvitation?.teams?.includes(team?._id)) {
                              return (
                                <Badge bg="primary" className="me-2" key={team?._id}>{team?.name}</Badge>
                                
                              );
                            }

                            return null;
                          })}
                        </p>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Text>
                  <Card.Text>
                    <ListGroup>
                      {customFields?.length > 0 && (
                        <>
                          {customFields.map((field, index) => (
                            <ListGroup.Item key={index}>
                              <p>
                                <small>{field.label}</small>
                                {selectedInvitation?.custom_fields?.[
                                  field.name
                                ] || ""}
                              </p>
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
                          {selectedInvitation?.email}
                        </p>
                      </ListGroup.Item>
                      {memberProfile?.role?.permissions?.members
                        ?.create_edit_delete === true && (
                        <ListGroup.Item>
                          <span className="info--icon">
                            <FiBriefcase />
                          </span>
                          <p>
                            <small>Role</small>
                            {selectedInvitation?.role?.name}
                          </p>
                          {/* <Form.Group className="mb-0 form-group pb-0">
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
                          </Form.Group> */}
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Card.Text>
                  <Card.Text>
                    <ListGroup>
                      <ListGroup.Item>
                        <span className="info--icon">
                          <FiMail />
                        </span>
                        <p>
                          <small>Teams</small>
                          </p>
                          
                        {
                          teamfeed?.map((team) => {
                            if (selectedInvitation?.teams?.includes(team?._id)) {
                              return (
                                <Badge bg="primary" className="me-2" key={team?._id}>{team?.name}</Badge>
                                
                              );
                            }

                            return null;
                          })
                        } 
                  </ListGroup.Item>
                  </ListGroup>
                  </Card.Text>
                  <Card.Text>
                    <ListGroup>
                      {customFields?.length > 0 && (
                        <>
                          {customFields.map((field, index) => (
                            <ListGroup.Item key={index}>
                              {renderDynamicField({
                                name: `custom_field[${field.name}]`,
                                type: field.type,
                                label: field.label,
                                value:
                                  field.type === "date" &&
                                  fields[`custom_field[${field.name}]`]
                                    ? convertDDMMYYYYtoYYYYMMDD(
                                        fields[`custom_field[${field.name}]`],
                                      )
                                    : fields[`custom_field[${field.name}]`] ||
                                      "",
                                options: field?.options || [],

                                onChange: (e) => {
                                  if (field.type === "date") {
                                    handleDateChange(
                                      e,
                                      `custom_field[${field.name}]`,
                                    );
                                  } else {
                                    handleChange(e);
                                  }
                                },
                                range_options: field?.range_options || {},
                                showPassword:
                                  showPasswordFields[
                                    `custom_field[${field.name}]`
                                  ] || false,
                                toggleShowPassword: () =>
                                  toggleShowPassword(
                                    `custom_field[${field.name}]`,
                                  ),
                                toggleBadges: () => toggleBadges(field),
                              })}
                            </ListGroup.Item>
                          ))}
                        </>
                      )}
                    </ListGroup>
                  </Card.Text>
                </>
              )}
              {isEditing === true && (
                <div className="text-end mt-4">
                  <Button
                    variant="secondary"
                    className="me-3"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>

                  {props.listfor && props.listfor === "company" ? (
                    <>
                      <Button
                        variant="primary"
                        className="ms-3"
                        onClick={() => sentInviteAgain(selectedInvitation?._id)}
                      >
                        Send Changes
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        className="ms-3"
                        onClick={() =>
                          acceptInvite(selectedInvitation?.inviteToken)
                        }
                      >
                        Accept
                      </Button>
                    </>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
      
      {showPermissions && (
        <Modal
          show={showPermissions}
          onShow={() => {
            selectboxObserver();
          }}
          onHide={() => setShowPermissions(false)}
          centered
          size="lg"
          className="add--team--member--modal add--member--modal theme--modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <strong>
                Roles & Permissions{" "}
                <small>Manage members role & permissions</small>
              </strong>
            </Modal.Title>
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
                  defaultValue={fields?.role}
                  onChange={(e) => {
                    handleChange(e);
                    const matchedRole = roles.find(
                      (role) => role._id === e.target.value,
                    );
                    // handleChange({ target: { name: 'rolename', value: matchedRole.name } });
                    const matchedPermissions = matchedRole
                      ? matchedRole.permissions
                      : [];
                    setPermissions(matchedPermissions);
                  }}
                >
                  {/* <option value="role">Select role</option> */}
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
              <Card className="border-0">
                <Card.Body className="p-0 border-0">
                  <>
                    <div className="new--accordion--block">
                      {permissionModules.map((mod) => {
                        const modSlug = mod.slug;
                        const modPerms = permissions?.[modSlug] || {};
                        const isExpanded = expanded?.[modSlug] || false;
                        const isViewChecked = !!modPerms.view;
                        const truePermissionCount = Object.values(
                          modPerms,
                        ).filter((val) => val === true).length;

                        return (
                          <div className="bg--blue--accordion">
                            <div className="d-flex gap-3 align-items-center">
                              {permissionsLabel[modSlug]?.icon || (
                                <LuFolderOpen />
                              )}
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
                                  <div className="d-flex gap-3 align-items-center mt-3 bg-white px-3 py-2 rounded-3">
                                    <p className="mb-0">View</p>
                                    <Form.Check
                                      key={`${modSlug}--view`}
                                      id={`${modSlug}-view`}
                                      type="switch"
                                      className="ms-auto switch--small"
                                      checked={!!modPerms.view}
                                      onChange={
                                        () => {
                                          // if(selectedMember?.role?.slug !== "owner"){
                                          toggleView(modSlug);
                                        }
                                        //}
                                      }
                                    />
                                  </div>
                                );
                              }

                              return (
                                <>
                                  <div className="d-flex gap-3 align-items-center mt-3 bg-white px-3 py-2 rounded-3">
                                    <p className="mb-0">
                                      {perm
                                        .replace(/[_-]/g, " ")
                                        .replace(/^\w/, (l) => l.toUpperCase())}
                                    </p>
                                    <Form.Check
                                      type="switch"
                                      className="ms-auto switch--small"
                                      id={`${modSlug}-${perm}`}
                                      key={perm}
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
                                    "time_tracking",
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
                                              modPerms[
                                                "selected_members"
                                              ]?.includes(String(member._id))
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
                                              modPerms[
                                                "selected_members"
                                              ]?.includes("unassigned")
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
                                            <span className="team--initial">
                                              U
                                            </span>
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
                  </>
                </Card.Body>
              </Card>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => {
                handleSavePermissions();
              }}
              disabled={loader}
            >
              {loader ? "Please Wait..." : "Save"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {showBadges !== null && (
        <BadgesModal
          badgesData={showBadges}
          toggleBadges={toggleBadges}
          handleSelect={handleChange}
          value={fields[`custom_field[${showBadges?.name}]`] || ""}
        />
      )}

      {(showRoles === true) && (
            
          <Modal show={showRoles} onHide={handleRoleClose} size="md" centered className="status--modal assign--task--modal">
            <Modal.Header closeButton>
              <Modal.Title>
                <div className="change--team--icon d-flex align-items-center gap-3">
                  
                  <div className="title--span d-flex flex-column align-items-start gap-2">
                    <strong>Change Role</strong>
                    <small className="text-secondary">{selectedInvitation?.email}</small>
                  </div>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              
                    <Form.Group className="mb-3">
                      <Form.Label className="mb-2 fw-semibold">Select Role</Form.Label>
                      <Form.Select
                        className={"form-control custom-selectbox conditional-box"}
                        value={fields?.role || ""}
                        onChange={(e) => handleClickRoles(e.target.value)}
                        name="role"
                      >
                        {roles?.map((role, index) => {
                          if(selectedInvitation?.role?._id !== role?._id){
                            return(
                              <option key={`role-id-${index}`} value={role._id}>
                                {(() => {
                                  const helperText = roleHelperText(role.slug);
                                  return helperText
                                    ? `${role.name} - ${helperText}`
                                    : role.name;
                                })()}
                              </option>
                            )
                          }
                      })}
                      </Form.Select>
                  </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <small>Changing the role will update this member's permissions to match the selected role's defaults.</small>
              <Button variant="secondary" onClick={handleRoleClose} disabled={loader}>
              {loader ? "Please Wait..." : "Cancel"}
              </Button>
              <Button variant="primary" onClick={handleSaveRole} disabled={loader}>
              {loader ? "Please Wait..." : "Save"}
              </Button>
            </Modal.Footer>
          </Modal>)
        }

        {/*--=-=Teams Modal**/
          (showTeams === true) && (
          
            <Modal show={showTeams} onHide={handleTeamsClose} size="md" centered className="status--modal assign--task--modal">
              <Modal.Header closeButton>
                <Modal.Title>
                  <div className="change--team--icon d-flex align-items-center gap-3">
                    
                    <div className="title--span d-flex flex-column align-items-start gap-2">
                      <strong>Change Teams</strong>
                      <small className="text-secondary">{selectedInvitation?.email}</small>
                    </div>
                  </div>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group>
                    <FloatingLabel label="Search here">
                      <Form.Control type="text" placeholder="Search here" value={search} onChange={handleSearchChange} />
                    </FloatingLabel>
                  </Form.Group>
                </Form>
                <ListGroup className="status--list mb-1">
                  {filteredteamfeed.map((team, index) => (
                    <ListGroup.Item key={index} onClick={() => handleClickTeams(team?._id)} className={fields?.selected_teams?.includes(team?._id) ? "status--active" : ""}> 
                      <span className="team--color" style={{ background: team?.color }}></span> 
                      <p>{team?.name} {fields?.selected_teams?.includes(team?._id) && <FaCheck />} </p>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <small>Teams organize members into groups. Members with visibility to specific teams can see data, time entries, reports, and projects from only those teams.</small>
              </Modal.Body>
              <Modal.Footer>
                  <Button variant="secondary" onClick={handleTeamsClose} disabled={loader}>
                    {loader ? "Please Wait..." : "Cancel"}
                  </Button>
                  <Button variant="primary" onClick={handleSaveTeams} disabled={loader}>
                    {loader ? "Please Wait..." : "Save"}
                  </Button>
                </Modal.Footer>
            </Modal>)
          }
    </>
  );
}

export default Invitation;
