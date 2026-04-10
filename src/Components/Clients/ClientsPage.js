import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Card,
  ListGroup,
  Table,
  Dropdown,
} from "react-bootstrap";
import debounce from "lodash.debounce";
import { FaList, FaPlus, FaEllipsisV } from "react-icons/fa";
import { LuSettings2 } from "react-icons/lu";
import { FiEdit, FiMail, FiSidebar, FiTrash2 } from "react-icons/fi";
import { BsGrid, BsEye, BsEyeSlash } from "react-icons/bs";
import { GrExpand } from "react-icons/gr";
import {
  MdOutlineSearch,
  MdDragIndicator,
  MdOutlineClose,
  MdSearch,
} from "react-icons/md";
import {
  ListClients,
  deleteClient,
  updateClient,
  reorderedClient,
} from "../../redux/actions/client.action";
import {
  toggleSidebar,
  toggleSidebarSmall,
} from "../../redux/actions/common.action";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFieldRules, validateField } from "../../helpers/rules";
import { jwtDecode } from "jwt-decode";
import AddClient from "./AddClient";
import { AlertDialog } from "../modals";
import { renderDynamicField } from "../common/dynamicFields";
import { fetchCustomFields } from "../../redux/actions/customfield.action";
import { currentMemberProfile } from "../../helpers/auth";
import { CustomFieldModal } from "../modals/customFields";
import {
  convertDDMMYYYYtoYYYYMMDD,
  formatDateToDDMMYYYY,
  selectboxObserver,
} from "../../helpers/commonfunctions";
import { BadgesModal } from "../modals/badges";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function ClientsPage() {
  const inputRef = useRef(null);
  const [spinner, setSpinner] = useState(false);
  const inputs = document.querySelectorAll(".form-floating .form-control");
  const handleSidebarSmall = () =>
    dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true));
  const commonState = useSelector((state) => state.common);
  const [showBadges, setShowBadges] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const memberProfile = currentMemberProfile();
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value) {
        this.classList.add("filled");
      } else {
        this.classList.remove("filled");
      }
    });
    // Initial check in case the input is pre-filled
    if (input.value) {
      input.classList.add("filled");
    }
  });

  const [isActiveView, setIsActiveView] = useState(2);
  const [rows, setRows] = useState([{ name: "" }]);
  const [errors, setErrors] = useState({});
  const [fieldserrors, setFieldErrors] = useState({ name: "" });
  const [customFields, setCustomFields] = useState([]);
  const apiCustomfields = useSelector((state) => state.customfields);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isActive, setIsActive] = useState(false);
  const [disable, setDisable] = useState(true);
  const handleClick = (client) => {
    setAvatarPreview(null);
    setSelectedClient(client);
  };
  let fieldErrors = {};
  let hasError = false;
  const [loader, setLoader] = useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => {
    requestAnimationFrame(() => {
      setRows([{ name: "" }]);
      setErrors([]);
      setShow(false);
    });
  };
  const [showdialog, setShowDialog] = useState(false);
  const handleShow = () => setShow(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState("");
  const [total, setTotal] = useState(0);
  const clientFeed = useSelector((state) => state.client.clients);
  const [clientFeeds, setClientFeed] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [userId, setuserId] = useState("");

  const [showPasswordFields, setShowPasswordFields] = useState({});
  const apiResult = useSelector((state) => state.client);
  const [editedClient, setEditedClient] = useState({});
  const [fields, setFields] = useState({ name: "", remove_avatar: false });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const [showSearch, setSearchShow] = useState(false);
  const handleSearchClose = () => setSearchShow(false);
  const handleSearchShow = () => setSearchShow(true);

  const handleClosePannel = () => {
    setIsEditing({
      name: false,
      avatar: false,
      remove_avatar: false,
    });
    setIsActive(false);
    setIsEditing(false);
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    // If there's no destination (i.e., the item was dropped outside), do nothing
    if (!destination) return;

    const clientId = draggableId.split("-")[1]; // Extract task ID from draggableId
    const sourceTabId = source.droppableId.split("-")[1]; // Get source tab ID
    const destinationTabId = destination.droppableId.split("-")[1]; // Get destination tab ID

    // Clone the projects array to avoid mutating the state directly
    let reorderedClients = [...clientFeeds];
    if (sourceTabId === destinationTabId) {
      // If the task was moved within the same tab, reorder the tasks
      const [removed] = reorderedClients.splice(source.index, 1); // Remove task from the source position
      reorderedClients.splice(destination.index, 0, removed); // Insert task to the destination position
    } else {
      // Task was moved to a different tab (if needed, handle cross-tab logic here)
      const [removed] = reorderedClients.splice(source.index, 1); // Remove from source tab
      reorderedClients.splice(destination.index, 0, removed); // Add to destination tab
    }
    // Generate a list of newly ordered projects
    const newOrder = reorderedClients.map((client, index) => ({
      client_id: client._id, // Adjust this if your project ID key is different
      order: index,
    }));

    // Dispatch the action with the new order
    dispatch(reorderedClient({ clients: newOrder }));
    // Update the state with reordered projects
    setClientFeed(reorderedClients);
  };

  const toggleVisibility = (key) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handledeleteClient = async () => {
    await dispatch(deleteClient(selectedClient._id));
  };

  const handleEditClick = (fieldName) => {
    setIsEditing((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  // Debounced search handler
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setSearch(value);
      }, 1000), // 1 sec debounce
    [],
  );

  const toggleBadges = (fieldIndex) => {
    setShowBadges(fieldIndex);
  };

  const toggleShowPassword = (fieldId) => {
    setShowPasswordFields((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const handleFieldChange = (field, value) => {
    // if (field in editedClient) {
    if (field === "avatar") {
      setFields((prevState) => ({
        ...prevState,
        [field]: value.target.files[0],
        ["remove_avatar"]: true,
      }));
      setAvatarPreview(URL.createObjectURL(value.target.files[0]));
    } else {
      setFields((prevState) => ({
        ...prevState,
        [field]: value,
      }));
      if (value !== "") {
        setFieldErrors({ ...fieldErrors, [field]: "" });
      }
    }
    setDisable(false);
  };

  const toggleCustomFields = () => {
    setShowCustomFields((prev) => !prev);
  };

  const deleteSuccess = useSelector((state) => state.client.deletedClient);

  useEffect(() => {
    let fieldsSetup = {
      name: selectedClient?.name,
      remove_avatar: false,
    };
    if (
      selectedClient?.customFields &&
      Object.keys(selectedClient?.customFields).length > 0
    ) {
      Object.values(selectedClient?.customFields).forEach((field) => {
        fieldsSetup[`custom_field[${field.meta_key}]`] = field.meta_value;
      });
    } else {
      customFields.forEach((field) => {
        fieldsSetup[`custom_field[${field.name}]`] = "";
      });
    }
    setFields(fieldsSetup);
  }, [selectedClient]);

  useEffect(() => {
    if (deleteSuccess) {
      setIsActive(false);
      setIsEditing(false);
      setSelectedClient({});
      setClientFeed((prevClients) =>
        prevClients.filter((client) => client._id !== deleteSuccess._id),
      );
    }
  }, [deleteSuccess]);

  useEffect(() => {
    setTimeout(() => {
      selectboxObserver();
    }, 600);
  }, [isEditing]);

  const handleListClients = async () => {
    setClientFeed([]);
    await dispatch(ListClients(currentPage, search));
    setSpinner(false);
  };

  useEffect(() => {
    if (currentPage !== "") {
      setSpinner(true);
      handleListClients();
    }
  }, [currentPage, search]);

  useEffect(() => {
    let token = localStorage.getItem("accessToken");
    let DecodedToken = jwtDecode(token);
    setuserId(DecodedToken.aud);
    dispatch(fetchCustomFields({ module: "clients" }));
  }, []);

  useEffect(() => {
    if (apiResult.success) {
      handleClose();
      setShowDialog(false);
    }

    if (apiResult.success === true && apiResult.updatedClient) {
      setClientFeed((prevClients) =>
        prevClients.map((client) =>
          client._id === apiResult.updatedClient._id
            ? apiResult.updatedClient
            : client,
        ),
      );
      setSelectedClient(apiResult.updatedClient);
    }

    if (apiResult.success || apiResult.error) {
      setLoader(false);
    }
  }, [apiResult]);

  useEffect(() => {
    if (apiCustomfields.customFields) {
      setCustomFields(apiCustomfields.customFields);
    }

    if (
      apiCustomfields.newField &&
      apiCustomfields.newField?.module === "clients"
    ) {
      setCustomFields((prevCustomFields) => [
        ...prevCustomFields.filter(
          (field) => field._id !== apiCustomfields.newField._id,
        ),
        apiCustomfields.newField,
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
    if (apiCustomfields.deletedField) {
      setCustomFields((prevCustomFields) =>
        prevCustomFields.filter(
          (field) => field._id !== apiCustomfields.deletedField,
        ),
      );
    }
  }, [apiCustomfields]);

  const handleDateChange = (value, name) => {
    console.log(new Date(value));
    setFields({ ...fields, [name]: formatDateToDDMMYYYY(value) });
    setErrors({ ...errors, [name]: "" });
  };

  const handleChange = ({ target: { name, value, type, files, checked } }) => {
    const finalValue =
      type === "checkbox" ? checked : type === "file" ? files : value;

    setFields({ ...fields, [name]: finalValue });
    setErrors({ ...errors, [name]: "" });

    if (
      showBadges !== null &&
      Object.keys(selectedClient).length > 0 &&
      isActive !== true
    ) {
      let payload = {};

      if (name.startsWith("custom_field[")) {
        const fieldName = name.match(/custom_field\[(.*?)\]/)?.[1]; // extract "badge"
        payload = {
          custom_field: {
            [fieldName]: value,
          },
        };
      } else {
        payload[name] = value;
      }
      dispatch(updateClient(selectedClient?._id, payload));
    }
  };

  useEffect(() => {
    const check = ["undefined", undefined, "null", null, ""];
    if (clientFeed && clientFeed.clientData) {
      setClientFeed(clientFeed.clientData);
      setTotalPages(clientFeed.totalPages);
      setTotal(clientFeed.total);
    }
  }, [clientFeed]);

  useEffect(() => {
    // Example: Set currentProject initially if not already set
    if (
      clientFeeds &&
      clientFeeds.length > 0 &&
      selectedClient !== null &&
      Object.keys(selectedClient).length > 0
    ) {
      clientFeeds.forEach((c, inx) => {
        if (c._id === selectedClient._id) {
          setSelectedClient(c);
          setAvatarPreview(null);
          return;
        }
      });
    }
  }, [clientFeeds]);

  const showError = (index, name) => {
    if (errors[index] && errors[index][name])
      return <span className="error">{errors[index][name]}</span>;
    return null;
  };
  const handleUpdateSubmit = async (event) => {
    event.preventDefault();

    if (Object.keys(fields).length > 0) {
      setLoader(true);
      const updatedErrorsPromises = Object.entries(fields).map(
        async ([fieldName, value]) => {
          // Get rules for the current field
          const rules = getFieldRules("clients", fieldName);
          // Validate the field
          const error = await validateField("clients", fieldName, value, rules);
          // If error exists, return it as part of the resolved promise
          return { fieldName, error };
        },
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
        if (Object.keys(fields).length > 0) {
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

          await dispatch(updateClient(selectedClient?._id, formData));
        }
        setFields({ name: "", remove_avatar: false });
        setLoader(false);
        setIsEditing(false);
      }
    } else {
      setLoader(false);
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

  return (
    <>
      <div
        className={`${
          isActive ? "show--details team--page project-collapse" : "team--page"
        } ${projectToggle === true ? "project-collapse" : ""}`}
      >
        <div className="page--title px-md-2 py-3 bg-white border-bottom">
          <Container fluid>
            <Row>
              <Col sm={12}>
                <h2>
                  <span
                    className="open--sidebar me-2"
                    onClick={() => {
                      handleSidebarSmall(false);
                      setIsActive(0);
                    }}
                  >
                    <FiSidebar />
                  </span>
                  Clients
                  <ListGroup
                    horizontal
                    className={
                      isActive
                        ? "d-none"
                        : "onlyIconsView ms-auto d-none d-lg-flex"
                    }
                  >
                    <ListGroup.Item className="d-none d-lg-block">
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
                            ref={inputRef}
                            readOnly={spinner}
                            placeholder="Search Client.."
                            onChange={(e) =>
                              debouncedUpdateSearch(e.target.value)
                            }
                          />
                        </Form.Group>
                      </Form>
                    </ListGroup.Item>
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
                  </ListGroup>
                  <ListGroup
                    horizontal
                    className={isActive ? "" : "d-md-flex ms-auto ms-lg-0"}
                  >
                    <ListGroup
                      horizontal
                      className="bg-white expand--icon ms-3"
                    >
                      <ListGroup.Item
                        className="d-flex d-lg-none"
                        onClick={handleSearchShow}
                      >
                        <MdSearch />
                      </ListGroup.Item>
                      {memberProfile?.role?.permissions?.clients
                        ?.manage_custom_fields === true && (
                        <ListGroup.Item
                          className="d-md-flex"
                          key={`settingskey`}
                          onClick={toggleCustomFields}
                        >
                          <LuSettings2 />
                        </ListGroup.Item>
                      )}
                      <ListGroup.Item
                        className="d-none d-lg-flex"
                        onClick={handleToggles}
                      >
                        <GrExpand />
                      </ListGroup.Item>
                      {(memberProfile?.role?.permissions?.clients
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
              </Col>
            </Row>
          </Container>
        </div>
        <div className="page--wrapper px-md-2 pb-4 pt-4">
          {spinner ? (
            <div className="loading-bar">
              <img src="images/OnTeam-icon-gray.png" className="flipchar" />
            </div>
          ) : (
            <Container fluid>
              <DragDropContext onDragEnd={handleDragEnd}>
                <div
                  className={
                    isActiveView === 1
                      ? "project--grid--table project--grid--new--table table-responsive-xl"
                      : isActiveView === 2
                        ? "project--table draggable--table new--project--rows table-responsive-xl"
                        : "project--table new--project--rows table-responsive-xl"
                  }
                >
                  {!spinner && clientFeeds && clientFeeds.length > 0 ? (
                    <Table>
                      <thead className="onHide">
                        <tr key="project-table-header">
                          <th
                            scope="col"
                            className="sticky p-0 border-bottom-0"
                            key="client-name-header"
                          >
                            <div className="d-flex align-items-center justify-content-between border-end border-bottom ps-3">
                              Clients{" "}
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
                                  key={`client-field-${idx}-header`}
                                  className="onHide p-0 border-bottom-0"
                                >
                                  <div className="border-bottom padd--x">
                                    {field.label}
                                  </div>
                                </th>
                              ))}
                        </tr>
                      </thead>
                      <Droppable
                        droppableId={`droppable-client-table`}
                        type="CLIENTS"
                      >
                        {(provided) => (
                          <tbody
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {clientFeeds.map((client, index) => {
                              return (
                                <>
                                  <Draggable
                                    key={client?._id}
                                    draggableId={`client-${client?._id}`}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <tr
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        key={`client-row-${client._id}`}
                                        className={
                                          client._id === selectedClient?._id
                                            ? "project--active"
                                            : ""
                                        }
                                        onClick={() => handleClick(client)}
                                      >
                                        {/* <td>{index + 1}</td> */}
                                        <td
                                          className="project--title--td sticky border-bottom"
                                          key={`title-index-${index}`}
                                          data-label="Client Name"
                                        >
                                          <div className="d-lg-flex justify-content-between border-end flex-wrap">
                                            <div className="project--name">
                                              <div className="drag--indicator">
                                                <abbr key={`index-${index}`}>
                                                  {index + 1}
                                                </abbr>
                                                <MdDragIndicator />
                                              </div>
                                              <div className="title--initial">
                                                {client?.avatar &&
                                                client?.avatar !== null ? (
                                                  <span>
                                                    <img
                                                      src={client?.avatar}
                                                      alt={"client-avatar"}
                                                    />
                                                  </span>
                                                ) : (
                                                  client.name.charAt(0)
                                                )}
                                              </div>
                                              <div className="title--span flex-column align-items-start gap-0">
                                                <span>{client.name}</span>
                                              </div>
                                            </div>
                                            <div className="onHide task--buttons">
                                              <Button
                                                variant="primary"
                                                className="px-3 py-2"
                                                onClick={() => {
                                                  handleClick(client);
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
                                              (field) =>
                                                field?.showInTable !== false,
                                            )
                                            .map((field, idx) => {
                                              const fieldname = field.name;
                                              let mvalue =
                                                client?.customFields?.[
                                                  fieldname
                                                ]?.meta_value;
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
                                                    (opt) =>
                                                      opt.value === mvalue,
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
                                                      onClick={() => {
                                                        if (
                                                          memberProfile?.role
                                                            ?.permissions
                                                            ?.clients
                                                            ?.create_edit_delete ===
                                                          true
                                                        ) {
                                                          toggleBadges(field);
                                                        } else {
                                                          console.log(
                                                            "Not allowed",
                                                          );
                                                        }
                                                      }}
                                                    >
                                                      {
                                                        client?.customFields?.[
                                                          fieldname
                                                        ]?.meta_value
                                                      }
                                                    </span>
                                                  );
                                                }
                                              } else if (
                                                fieldType === "password"
                                              ) {
                                                return (
                                                  <span className="d-flex align-items-center gap-2">
                                                    {visiblePasswords[uniqueKey]
                                                      ? mvalue
                                                      : "*****"}
                                                    <span
                                                      style={{
                                                        cursor: "pointer",
                                                      }}
                                                      onClick={() =>
                                                        toggleVisibility(
                                                          uniqueKey,
                                                        )
                                                      }
                                                    >
                                                      {visiblePasswords[
                                                        uniqueKey
                                                      ] ? (
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
                                        <td
                                          className="task--last--buttons mt-auto"
                                          key={`client-td3-${index}`}
                                        >
                                          <div className="d-flex justify-content-between">
                                            <div className="onHide">
                                              <Button
                                                variant="dark"
                                                className="me-2 px-3 py-1"
                                                onClick={() => {
                                                  handleClick(client);
                                                  setIsActive(true);
                                                }}
                                              >
                                                <BsEye /> View
                                              </Button>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </Draggable>
                                </>
                              );
                            })}
                          </tbody>
                        )}
                      </Droppable>
                    </Table>
                  ) : (
                    !spinner &&
                    isActiveView === 2 && (
                      <div className="text-center py-3">
                        <h2>No Clients Found</h2>
                      </div>
                    )
                  )}
                  {isActiveView === 1 &&
                    !spinner &&
                    clientFeeds &&
                    clientFeeds.length == 0 && (
                      <div className="text-center py-3">
                        <h2>No Clients Found</h2>
                      </div>
                    )}
                </div>
              </DragDropContext>
            </Container>
          )}
        </div>
      </div>
      {selectedClient && (
        <div className="details--wrapper common--project--grid">
          <div className="wrapper--title py-2 bg-white border-bottom">
            <span
              className="open--sidebar"
              onClick={() => {
                handleSidebarSmall(false);
                setIsActive(0);
              }}
            >
              <FiSidebar />
            </span>
            <div className="projecttitle">
              <Dropdown>
                <Dropdown.Toggle variant="link" id="dropdown-basic">
                  <div className="title--initial">
                    {selectedClient?.avatar &&
                    selectedClient?.avatar !== null ? (
                      <span>
                        <img
                          src={selectedClient?.avatar}
                          alt={"client-avatar"}
                        />
                      </span>
                    ) : (
                      selectedClient?.name?.charAt(0)
                    )}
                  </div>
                  <div className="title--span flex-column align-items-start gap-0">
                    <h3>
                      <strong>{selectedClient?.name}</strong>
                    </h3>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className="drop--scroll">
                    {clientFeeds.map((client, index) => {
                      return (
                        <Dropdown.Item
                          onClick={() => {
                            handleClick(client);
                          }}
                          key={`client-item-${index}`}
                          className={
                            selectedClient?._id === client?._id
                              ? "active-project"
                              : ""
                          }
                        >
                          <div className="title--initial">
                            {client?.avatar && client?.avatar !== null ? (
                              <span>
                                <img
                                  src={client?.avatar}
                                  alt={"client-avatar"}
                                />
                              </span>
                            ) : (
                              client?.name.charAt(0)
                            )}
                          </div>
                          <div className="title--span flex-column align-items-start gap-0">
                            <strong>{client?.name}</strong>
                          </div>
                        </Dropdown.Item>
                      );
                    })}
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <ListGroup horizontal className="ms-auto expand--icon">
              <ListGroup.Item
                onClick={handleToggles}
                className="d-none d-lg-flex"
              >
                <GrExpand />
              </ListGroup.Item>
              <ListGroup.Item
                className="btn btn-primary"
                onClick={() => {
                  handleClosePannel(0);
                  dispatch(toggleSidebarSmall(false));
                }}
              >
                <MdOutlineClose />
              </ListGroup.Item>
            </ListGroup>
          </div>
          <div className="rounded--box client--box">
            <Card className="contact--card">
              <div className="card--img">
                {isEditing === true && (
                  <Form.Control
                    type="file"
                    id="upload--img"
                    hidden
                    onChange={(e) => handleFieldChange("avatar", e)}
                    accept=".jpg, .jpeg, .png, .gif"
                  />
                )}
                {memberProfile?.role?.permissions?.clients
                  ?.create_edit_delete === true ||
                memberProfile?.role?.slug === "owner" ? (
                  <>
                    <Form.Label htmlFor="upload--img">
                      {avatarPreview ? (
                        <Card.Img variant="top" src={avatarPreview} />
                      ) : fields?.remove_avatar === false &&
                        selectedClient?.avatar ? (
                        <Card.Img
                          variant="top"
                          src={selectedClient?.avatar ?? "./images/default.jpg"}
                        />
                      ) : (
                        <Card.Img variant="top" src={"./images/default.jpg"} />
                      )}
                    </Form.Label>
                    <h3>{selectedClient?.name}</h3>
                  </>
                ) : (
                  <Form.Label htmlFor="upload--img">
                    {avatarPreview ? (
                      <Card.Img variant="top" src={avatarPreview} />
                    ) : isEditing.remove_avatar === false &&
                      editedClient?.avatar ? (
                      <Card.Img
                        variant="top"
                        src={editedClient?.avatar ?? "./images/default.jpg"}
                      />
                    ) : (
                      <Card.Img variant="top" src={"./images/default.jpg"} />
                    )}
                  </Form.Label>
                )}
              </div>
              <Card.Body>
                <Card.Title>
                  <FiMail /> Client Information
                  {(memberProfile?.role?.permissions?.clients
                    ?.create_edit_delete === true ||
                    memberProfile?.role?.slug === "owner") && (
                    <Dropdown>
                      <Dropdown.Toggle variant="dark" id="dropdown-basic">
                        <FaEllipsisV />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => setIsEditing(true)}
                          className="d-flex align-items-center gap-1"
                        >
                          <FiEdit className="me-1" /> Edit
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setShowDialog(true)}
                          className="d-flex align-items-center gap-1"
                        >
                          <FiTrash2 /> Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </Card.Title>
                <Card.Text>
                  <ListGroup>
                    {isEditing === false ? (
                      <>
                        <ListGroup.Item>
                          <p>
                            <small>Client Name</small>
                            {selectedClient?.name}
                          </p>
                        </ListGroup.Item>
                        {customFields?.length > 0 && (
                          <>
                            {customFields?.map((field, index) => (
                              <ListGroup.Item key={index}>
                                <p>
                                  <small>{field.label}</small>
                                  {selectedClient?.customFields?.[field.name]
                                    ?.meta_value || ""}
                                </p>
                              </ListGroup.Item>
                            ))}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <ListGroup.Item key={"name-field"}>
                          <Form.Group className="mb-0 form-group pb-0">
                            <Form.Label>Client Name</Form.Label>
                            <Form.Control
                              type="text"
                              className={
                                fieldserrors["name"] &&
                                fieldserrors["name"] !== ""
                                  ? "input-error"
                                  : "form-control"
                              }
                              placeholder="Client name"
                              name="name"
                              value={fields?.name}
                              onChange={handleChange}
                            />
                          </Form.Group>
                          {/* {
                              (fieldserrors['name'] && fieldserrors['name'] !== "") && (
                                 <span className="error">{fieldserrors['name']}</span>
                              )
                            } */}
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
                      </>
                    )}
                  </ListGroup>
                </Card.Text>
                {isEditing === true && (
                  <div className="text-end mt-3">
                    {(memberProfile?.role?.permissions?.clients
                      ?.create_edit_delete === true ||
                      memberProfile?.role?.slug === "owner") && (
                      <>
                        <Button
                          variant="secondary"
                          className="me-3"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleUpdateSubmit}
                          disabled={loader}
                        >
                          {" "}
                          {loader ? "Please wait..." : "Save Changes"}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>

          <AlertDialog
            showdialog={showdialog}
            toggledialog={setShowDialog}
            msg="Are you sure you want to delete the client?"
            callback={handledeleteClient}
          />
        </div>
      )}
      {show && (
        <AddClient
          show={show}
          toggleshow={setShow}
          customFields={customFields}
        />
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
                    ref={inputRef}
                    readOnly={spinner}
                    placeholder="Search Client.."
                    onChange={(e) => debouncedUpdateSearch(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
      </Modal>
      {showCustomFields && (
        <CustomFieldModal toggle={setShowCustomFields} module="clients" />
      )}
      {showBadges !== null && (
        <BadgesModal
          badgesData={showBadges}
          toggleBadges={toggleBadges}
          handleSelect={handleChange}
          value={fields[`custom_field[${showBadges?.name}]`] || ""}
        />
      )}
    </>
  );
}

export default ClientsPage;
