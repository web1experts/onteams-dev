import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Button,
  Modal,
  Form,
  FloatingLabel,
  ListGroup,
  Dropdown,
  ListGroupItem,
} from "react-bootstrap";
import {
  FaChevronDown,
  FaPlus,
  FaRegTrashAlt,
  FaUpload,
  FaEllipsisV,
  FaCheck,
  FaRegCalendarAlt,
  FaCog,
} from "react-icons/fa";
import {
  MdFileDownload,
  MdOutlineClose,
  MdOutlineCancel,
} from "react-icons/md";
import { FiFileText } from "react-icons/fi";
import { GrAttachment, GrExpand } from "react-icons/gr";
import { FiSidebar } from "react-icons/fi";
import {
  updateProject,
  deleteProject,
} from "../../redux/actions/project.action";
import { BadgesModal } from "../modals/badges";
import { getFieldRules, validateField } from "../../helpers/rules";
import { AlertDialog } from "../modals";
import { useDropzone } from "react-dropzone";
import fileIcon from "./../../images/file-icon-image.jpg";
import {
  selectboxObserver,
  formatDateToDDMMYYYY,
  convertDDMMYYYYtoYYYYMMDD,
} from "../../helpers/commonfunctions";
import {
  togglePopups,
  updateStateData,
  toggleSidebar,
  toggleSidebarSmall,
} from "../../redux/actions/common.action";
import {
  EDIT_PROJECT_FORM,
  RESET_FORMS,
  CURRENT_PROJECT,
  DIRECT_UPDATE,
} from "../../redux/actions/types";
import { MemberInitials } from "../common/memberInitials";
import ReactQuill, { Quill } from "react-quill";
import AutoLinks from "quill-auto-links";
import "react-quill/dist/quill.snow.css";
import ProjectDatePicker from "../Datepickers/projectDatepicker";
import { renderDynamicField } from "../common/dynamicFields";
import { BiEdit } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
Quill.register("modules/autoLinks", AutoLinks);
function SingleProject(props) {
  const dispatch = useDispatch();
  const memberProfile = props.memberProfile || {};
  const quillRef = useRef(null);
  const pasteOccurred = useRef(false);
  const projectCustomFields = props.customFields;
  const commonState = useSelector((state) => state.common);
  const [fields, setFields] = useState({
    title: "",
    status: "in-progress",
    members: [],
    client: "",
  });
  const [errors, setErrors] = useState({ title: "" });
  const [loader, setLoader] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const apiResult = useSelector((state) => state.project);
  const apiClient = useSelector((state) => state.client);
  const [clientlist, setClientList] = useState([]);
  const [isActive, setIsActive] = useState(2);
  const [currentProject, setCurrentProject] = useState({});
  const [showdialog, setShowDialog] = useState(false);
  const handleStatusShow = () => dispatch(togglePopups("status", true));
  const [selectedworkflow, setSelectedWorkflow] = useState({});
  const handleSidebarSmall = () =>
    dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true));
  const handleWorkflowClose = () => dispatch(togglePopups("workflow", false));
  const [showBadges, setShowBadges] = useState(null);
  const projects = props.projects;
  const handleWorkflowShow = async () => {
    await dispatch(updateStateData(DIRECT_UPDATE, false));
    dispatch(togglePopups("workflow", true));
  };

  const [showUpload, setUploadShow] = useState(false);
  const handleUploadClose = () => {
    setUploadShow(false);
  };
  const handleUploadShow = () => setUploadShow(true);
  const [isEditor, setIsEditor] = useState(false);
  const [filetoPreview, setFiletoPreview] = useState(null);
  const [showPreview, setPreviewShow] = useState(false);
  const handlePreviewClose = () => setPreviewShow(false);
  const [clientsearchTerm, setClientSearchTerm] = useState("");
  const [datepickerShow, setDateshow] = useState(false);
  let fieldErrors = {};

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link"],
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
    autoLinks: true,
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
  ];

  useEffect(() => {
    selectboxObserver();
  }, []);

  useEffect(() => {
    if (commonState.currentProject) {
      setIsEditor(false);
      setCurrentProject(commonState.currentProject);
      setSelectedWorkflow(commonState.currentProject?.workflow || {});
    }
  }, [commonState.currentProject]);

  useEffect(() => {
    if (commonState.allclients && commonState.allclients.length > 0) {
      setClientList(commonState.allclients);
    } else {
      setClientList([]);
    }
  }, [commonState.allclients]);

  useEffect(() => {
    if (commonState.editProjectForm) {
      setFields(commonState.editProjectForm);
    }
  }, [commonState.editProjectForm]);

  useEffect(() => {
    if (currentProject && Object.keys(currentProject).length > 0) {
      setSelectedFiles([]);
      setImagePreviews([]);
      let fieldsSetup = {
        title: currentProject.title,
        status: currentProject.status,
        client: currentProject.client
          ? currentProject.client._id || fields["client"]
          : "",
        description: currentProject.description || "",
        start_date: currentProject.start_date
          ? new Date(currentProject.start_date).toISOString().split("T")[0]
          : "",
        due_date: currentProject.due_date
          ? new Date(currentProject.due_date).toISOString().split("T")[0]
          : "",
        files: currentProject.files
          ? currentProject.files.map((image) => image._id)
          : [],
        workflow: currentProject.workflow ? currentProject.workflow : {},
      };

      if (currentProject.description && currentProject.description !== "") {
        setIsEditor(true);
      }
      // Set members if present
      if (currentProject.members && currentProject.members.length > 0) {
        let projectMembers = [];
        let membersdrop = {};

        currentProject.members.forEach((member) => {
          const { _id, name, avatar } = member;
          projectMembers.push(_id);
          membersdrop[_id] = {name, avatar, id: _id};
        });

        fieldsSetup.members = membersdrop;
      } else {
        fieldsSetup.members = [];
      }

      if (
        currentProject.customFields &&
        Object.keys(currentProject.customFields).length > 0
      ) {
        Object.values(currentProject.customFields).forEach((field) => {
          fieldsSetup[`custom_field[${field.meta_key}]`] = field.meta_value;
        });
      } else {
        projectCustomFields.forEach((field) => {
          fieldsSetup[`custom_field[${field.name}]`] = "";
        });
      }

      setTimeout(function () {
        selectboxObserver();
      }, 150);
      dispatch(updateStateData(EDIT_PROJECT_FORM, fieldsSetup));
    }
  }, [currentProject, dispatch]);

  const handleattachfiles = (e) => {
    handleUploadClose();
  };

  useEffect(() => {
    if (apiResult.success) {
      setShowDialog(false);
    }
  }, [apiResult]);

  function handleLabelClick(event) {
    event.preventDefault(); // Ensure the default behavior is prevented
    document.getElementById("updateattachments").click();
  }

  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (apiClient.createClient) {
      setFields({ ...fields, client: apiClient.createClient });
      handleChange({
        target: { name: "client", value: apiClient.createClient },
      });
      setTimeout(function () {
        selectboxObserver();
      }, 200);
    }
  }, [apiClient]);

  useEffect(() => {
    if (selectedFiles?.length > 0) {
      setFields({ ...fields, images: selectedFiles });
      const previews = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileExtension = selectedFiles[i].name
            .split(".")
            .pop()
            .toLowerCase();
          previews.push({
            src: e.target.result,
            file: selectedFiles[i],
            mimetype: fileExtension,
            filename: selectedFiles[i].name,
            _id: i,
          });
          if (previews.length === selectedFiles.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(selectedFiles[i]);
      }
    } else {
      const { images, ...updatedFields } = fields;
      setFields(updatedFields);
    }
  }, [selectedFiles]);

  const handleEditor = (event) => {
    setIsEditor((current) => !current);
  };

  const handlePreviewShow = (file) => {
    setFiletoPreview(file);
    setPreviewShow(true);
  };

  const handleSelectedFiles = (acceptedFiles) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxSize);

  if (oversizedFiles.length > 0) {
    setErrors({ ...errors, ['file_error']:`Some files exceed 10MB and were not added: ${oversizedFiles.map(f => f.name).join(', ')}`})
  }else{
      setErrors({...errors, ['file_error']: ''})
      setSelectedFiles((prevSelectedFiles) => {
        // Filter out duplicates by comparing file names or other unique properties
        const uniqueFiles = Array.from(
          new Set([...prevSelectedFiles, ...acceptedFiles])
        );
        return uniqueFiles;
      });
    }
  };

  const handleclientSearch = (e) => {
    setClientSearchTerm(e.target.value);
  };

  const filteredItems = clientlist.filter((item) =>
    item.name.toLowerCase().includes(clientsearchTerm.toLowerCase())
  );

  const handleRemove = (indexToRemove) => {
    // Filter out the file to remove from both selectedFiles and imagePreviews
    const updatedSelectedFiles = selectedFiles.filter(
      (_, index) => index !== indexToRemove
    );
    const updatedImagePreviews = imagePreviews.filter(
      (_, index) => index !== indexToRemove
    );

    setSelectedFiles(updatedSelectedFiles);
    setImagePreviews(updatedImagePreviews);
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

  const onDrop = useCallback((acceptedFiles) => {
    handleSelectedFiles(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDateChange = (value, name) => {
    console.log(new Date(value));
    setFields({ ...fields, [name]: formatDateToDDMMYYYY(value) });
    dispatch(
      updateStateData(EDIT_PROJECT_FORM, {
        [name]: formatDateToDDMMYYYY(value),
      })
    );
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

    setFields((prev) => ({ ...prev, [name]: finalValue }));
    dispatch(updateStateData(EDIT_PROJECT_FORM, { [name]: finalValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleWorkflowSelect = (flow) => {
    setFields({ ...fields, ["workflow"]: flow });
    setSelectedWorkflow(flow);
  };

  const showError = (name) => {
    if (errors[name]) return <span className="error">{errors[name]}</span>;
    return null;
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "v") {
      pasteOccurred.current = true;
      console.log("Paste keyboard shortcut detected");
    }

    // Optional: Handle Shift+Enter to insert a line break manually
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault(); // Prevent default if needed
      const editor = quillRef.current?.getEditor();
      if (editor) {
        const range = editor.getSelection(true);
        editor.insertText(range.index, "\n");
        editor.setSelection(range.index + 1);
      }
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("text");
    console.log("Pasted content:", pastedData);
    pasteOccurred.current = true;

    setTimeout(() => {
      pasteOccurred.current = false;
    }, 500);
  };

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    const root = editor?.root;

    if (root) {
      root.addEventListener("paste", handlePaste);
    }

    return () => {
      if (root) {
        root.removeEventListener("paste", handlePaste);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    const updatedErrorsPromises = Object.entries(fields).map(
      async ([fieldName, value]) => {
        // Get rules for the current field
        const rules = getFieldRules("project", fieldName);
        // Validate the field
        const error = await validateField("project", fieldName, value, rules);
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
      setLoader(false);
      setErrors(fieldErrors);
    } else {
      const formData = new FormData();
      for (const [key, value] of Object.entries(fields)) {
        if (typeof value === "object" && key === "images") {
          value.forEach((attach) => {
            formData.append("images[]", attach);
          });
        } else if (typeof value === "object" && key === "members") {
          const memberids = Object.keys(fields["members"]);
          if (memberids.length > 0) {
            memberids.forEach((item) => {
              formData.append(`members[]`, item); // Append with the same key for non-empty arrays
            });
          } else {
            formData.append(`members`, "[]");
          }
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
      let payload = formData;
      await dispatch(updateProject(currentProject._id, payload));
      setLoader(false);
    }
  };

  const handledeleteProject = async () => {
    await dispatch(deleteProject(currentProject._id));
    await dispatch(updateStateData(CURRENT_PROJECT, {}));
    await dispatch(updateStateData(RESET_FORMS, "edit_project"));
  };

  const handleRemovefiles = (id) => {
    let previousfiles = fields["files"];
    const updatedFiles = previousfiles.filter((file) => file !== id);
    setFields({ ...fields, ["files"]: updatedFiles });
    const previewfiles = currentProject.files.filter((file) => file._id !== id);
    setCurrentProject({ ...currentProject, ["files"]: previewfiles });
  };

  const renderPreview = (type, preview, index) => {
    const { src, _id } = preview;
    const mimetype = preview.mimetype
      ? preview.mimetype
      : src.split(".").pop().toLowerCase();

    const previewComponents = {
      image: (
        <div className="preview--cell" key={`image-${type}-${_id}`}>
          <p
            onClick={() =>
              handlePreviewShow({
                src,
                _id,
                mimetype,
                filename: preview?.filename || `Preview file-${index}`,
              })
            }
          >
            {preview?.filename || `Preview file-${index}`}
          </p>
          {type !== "new" && (
            <Button
              variant="secondary"
              className="ms-auto"
              onClick={() => handleDownload(src)}
            >
              <MdFileDownload />
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() =>
              type === "new" ? handleRemove(index) : handleRemovefiles(_id)
            }
          >
            <FaRegTrashAlt />
          </Button>
        </div>
      ),
      video: (
        <div className="preview--cell" key={`video-${type}-${_id}`}>
          <p
            onClick={() =>
              handlePreviewShow({
                src,
                _id,
                mimetype,
                filename: preview?.filename || `Preview file-${index}`,
              })
            }
          >
            {preview?.filename || `Preview file-${index}`}
          </p>
          {type !== "new" && (
            <Button
              variant="secondary"
              className="ms-auto"
              onClick={() => handleDownload(src)}
            >
              <MdFileDownload />
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() =>
              type === "new" ? handleRemove(index) : handleRemovefiles(_id)
            }
          >
            <FaRegTrashAlt />
          </Button>
        </div>
      ),
      pdf: (
        <div className="preview--cell" key={`pdf-${type}-${_id}`}>
          <p
            onClick={() =>
              handlePreviewShow({
                src,
                _id,
                mimetype,
                filename: preview?.filename || `Preview file-${index}`,
              })
            }
          >
            {preview?.filename || `Preview file-${index}`}
          </p>
          {type !== "new" && (
            <Button
              variant="secondary"
              className="ms-auto"
              onClick={() => handleDownload(src)}
            >
              <MdFileDownload />
            </Button>
          )}

          <Button
            variant="primary"
            onClick={() =>
              type === "new" ? handleRemove(index) : handleRemovefiles(_id)
            }
          >
            <FaRegTrashAlt />
          </Button>
        </div>
      ),
      other: (
        <div className="preview--cell" key={`other-${type}-${_id}`}>
          <p
            onClick={() =>
              handlePreviewShow({
                src,
                _id,
                mimetype,
                filename: preview?.filename || `Preview file-${index}`,
              })
            }
          >
            {preview?.filename || `Preview file-${index}`}
          </p>
          {type !== "new" && (
            <Button
              variant="secondary"
              className="ms-auto"
              onClick={() => handleDownload(src)}
            >
              <MdFileDownload />
            </Button>
          )}

          <Button
            variant="primary"
            onClick={() =>
              type === "new" ? handleRemove(index) : handleRemovefiles(_id)
            }
          >
            <FaRegTrashAlt />
          </Button>
        </div>
      ),
    };

    if (["jpg", "jpeg", "png", "webp"].includes(mimetype)) {
      return previewComponents.image;
    } else if (mimetype === "mp4") {
      return previewComponents.video;
    } else if (mimetype === "pdf") {
      return previewComponents.pdf;
    } else {
      return previewComponents.other;
    }

    return null;
  };

  const handleDateclose = useCallback(() => {
    setDateshow(false);
  }, []); // Empty dependency array means this function is memoized and won't change across renders

  return (
    <>
      <div className="details--projects--view common--project--grid">
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
                  {currentProject?.title?.charAt(0)}
                </div>
                <div className="title--span flex-column align-items-start gap-0">
                  <h3 key={`project-title-${currentProject?._id}`}>
                    <strong>{currentProject?.title}</strong>
                    <span>{currentProject?.client?.name}</span>
                  </h3>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <div className="drop--scroll">
                  {projects.map((project, index) => {
                    return (
                      <>
                        <Dropdown.Item
                          value={project._id}
                          onClick={() => props?.projectChange(project)}
                          className={
                            currentProject?._id === project?._id
                              ? "active-project"
                              : ""
                          }
                        >
                          <div className="title--initial">
                            {project.title.charAt(0)}
                          </div>
                          <div className="title--span flex-column align-items-start gap-0">
                            <strong>{project.title}</strong>
                            <span>
                              {project.client?.name || (
                                <span className="text-muted">__</span>
                              )}
                            </span>
                          </div>
                        </Dropdown.Item>
                      </>
                    );
                  })}
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <ListGroup
            horizontal
            className="members--list mx-auto d-none d-xxl-flex"
          >
            <ListGroup.Item
              key={`project-assign-${currentProject?._id}`}
              className="me-3"
            >
              Members
            </ListGroup.Item>
            <MemberInitials
              showRemove={
                memberProfile?.role?.permissions?.projects
                  ?.create_edit_delete_project === true ||
                memberProfile?.role?.slug === "owner"
                  ? true
                  : false
              }
              members={fields?.members || []}
              directUpdate={true}
              showAssignBtn={
                memberProfile?.role?.permissions?.members?.view === true ||
                memberProfile?.role?.slug === "owner"
                  ? true
                  : false
              }
              postId={currentProject?._id}
              type="project"
            />
          </ListGroup>
          <ListGroup
            horizontal
            className="ms-auto ms-xxl-0 p-0 mt-0 mt-md-0 d-none d-md-flex"
          >
            <ListGroup horizontal className="bx--shadow">
              <Button
                variant="secondary"
                className="active btn--view d-none d-sm-flex"
                onClick={() => setIsActive(2)}
              >
                <BsEye className="me-1" /> Details
              </Button>
              <Button
                variant="primary"
                className="btn--view d-none d-sm-flex"
                onClick={() => props.closeview(1)}
              >
                <BiEdit className="me-1" /> Tasks
              </Button>
            </ListGroup>
          </ListGroup>

          <ListGroup
            horizontal
            className="bg-white expand--icon gap-2 p-0 b-0 rounded-0 align-items-center ms-auto ms-md-0"
          >
            <ListGroup.Item
              onClick={props.toggleSidebars}
              className="d-none d-lg-flex"
            >
              <GrExpand />
            </ListGroup.Item>
            <ListGroupItem
              className="btn btn-primary ms-0"
              key={`closekey`}
              onClick={() => {
                props.closeview(0);
                dispatch(toggleSidebarSmall(false));
              }}
            >
              <MdOutlineClose />
            </ListGroupItem>
          </ListGroup>
        </div>
        {memberProfile?.role?.permissions?.projects?.create_edit_delete_project ===
          true || memberProfile?.role?.slug === "owner" ? (
          <>
            <div className="project--form rounded--box">
              <div className="project--form--inputs">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-0 form-group">
                    <FloatingLabel label="Project Title *">
                      <Form.Control
                        type="text"
                        name="title"
                        placeholder="Project Title"
                        value={fields["title"] || ""}
                        onChange={handleChange}
                      />
                    </FloatingLabel>
                    {showError("title")}
                  </Form.Group>
                  <Form.Group className="mb-0 form-group">
                    <Form.Label>
                      <small>Status</small>
                      <div className="status--modal" onClick={handleStatusShow}>
                        <span
                          className={`${
                            fields["status"] === "in-progress"
                              ? "progress--circle"
                              : fields["status"] === "on-hold"
                              ? "hold--circle"
                              : fields["status"] === "completed"
                              ? "complete--circle"
                              : ""
                          } status--circle`}
                        ></span>{" "}
                        {fields["status"]
                          ?.replace(/-/g, " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase())}{" "}
                        <FaChevronDown />
                      </div>
                    </Form.Label>
                  </Form.Group>
                  <Form.Group
                    className="mb-0 form-group"
                    key={`clientbox-${currentProject?._id}`}
                  >
                    <Form.Label>
                      <small>Client</small>
                    </Form.Label>
                    <div className="client--input">
                      {(memberProfile?.role?.permissions?.clients?.view === true &&
                        filteredItems &&
                        filteredItems.length > 0) ||
                      memberProfile?.role?.slug === "owner" ? (
                        <Dropdown className={`select--dropdown`}>
                          <Dropdown.Toggle
                            variant="success"
                            key={`success-selectkey-${Math.floor(
                              Math.random() * 1001
                            )}`}
                          >
                            {clientlist && clientlist.length > 0
                              ? clientlist.find(
                                  (client) => client._id === fields["client"]
                                )?.name || "None"
                              : "None"}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <div className="drop--scroll">
                              <Form>
                                <Form.Group className="form-group mb-3">
                                  <Form.Control
                                    type="text"
                                    placeholder="Search here.."
                                    value={clientsearchTerm}
                                    onChange={handleclientSearch}
                                  />
                                </Form.Group>
                              </Form>

                              {
                                <>
                                  <Dropdown.Item
                                    key={"None"}
                                    className={
                                      !fields["client"]
                                        ? "selected--option"
                                        : ""
                                    }
                                    onClick={() => {
                                      handleChange({
                                        target: { name: "client", value: "" },
                                      });
                                    }}
                                    href="#"
                                  >
                                    None
                                  </Dropdown.Item>
                                  {filteredItems.map((client, index) => {
                                    return (
                                      <Dropdown.Item
                                        key={client._id}
                                        className={
                                          client._id === fields["client"]
                                            ? "selected--option"
                                            : ""
                                        }
                                        onClick={() => {
                                          handleChange({
                                            target: {
                                              name: "client",
                                              value: client._id,
                                            },
                                          });
                                        }}
                                        href="#"
                                      >
                                        {client.name}{" "}
                                        {client._id === fields["client"] && (
                                          <FaCheck />
                                        )}
                                      </Dropdown.Item>
                                    );
                                  })}
                                </>
                              }
                            </div>
                          </Dropdown.Menu>
                        </Dropdown>
                      ) : (
                        <>
                          {clientlist && clientlist.length > 0
                            ? clientlist.find(
                                (client) => client._id === fields["client"]
                              )?.name || "None"
                            : "None"}
                        </>
                      )}
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-0 form-group">
                    <Form.Label>
                      <small>Workflow</small>
                      <div
                        className="workflow--modal"
                        onClick={handleWorkflowShow}
                      >
                        <span className="workflow--selected">
                          {fields["workflow"]?.title
                            ? "Current Workflow"
                            : "Current Workflow"}{" "}
                          <FaChevronDown />
                        </span>
                      </div>
                    </Form.Label>
                  </Form.Group>
                  <Form.Group className="mb-0 form-group">
                    <Form.Label className="w-100 m-0">
                      <small>Description</small>
                      {!isEditor && (
                        <strong className="add-descrp" onClick={handleEditor}>
                          <FiFileText /> Add a description
                        </strong>
                      )}
                    </Form.Label>
                    <div
                      className={
                        isEditor ||
                        (fields["description"] && fields["description"] !== "")
                          ? "text--editor show--editor"
                          : "text--editor"
                      }
                    >
                      <ReactQuill
                        value={fields["description"] || ""}
                        onChange={(value) => {
                          setFields({ ...fields, ["description"]: value });
                          setErrors({ ...errors, ["description"]: "" });
                        }}
                        formats={formats}
                        modules={modules}
                        onKeyDown={handleKeyDown}
                        ref={quillRef}
                      />
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-0 form-group">
                    <Form.Label>
                      <small>Start/Due Date</small>
                    </Form.Label>
                    <Row>
                      {!fields?.start_date && !fields?.due_date ? (
                        <label
                          htmlFor="startdate--picker"
                          className="task--date--picker"
                          onClick={() => {
                            setDateshow(true);
                          }}
                        >
                          <FaRegCalendarAlt /> Set due date
                        </label>
                      ) : (
                        <label
                          htmlFor="startdate--picker"
                          className="task--date--change"
                          onClick={() => {
                            setDateshow(true);
                          }}
                        >
                          {fields?.start_date &&
                            new Date(fields.start_date)
                              .toISOString()
                              .split("T")[0]}

                          {fields?.start_date && fields?.due_date && (
                            <span>/</span>
                          )}

                          {fields?.due_date && (
                            <>
                              {
                                new Date(fields.due_date)
                                  .toISOString()
                                  .split("T")[0]
                              }
                            </>
                          )}

                          {(fields?.start_date || fields?.due_date) && (
                            <MdOutlineCancel
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch(
                                  updateStateData(EDIT_PROJECT_FORM, {
                                    ["start_date"]: "",
                                    ["due_date"]: "",
                                  })
                                );
                              }}
                            />
                          )}
                        </label>
                      )}
                      <ProjectDatePicker
                        isShow={datepickerShow}
                        close={handleDateclose}
                      ></ProjectDatePicker>
                    </Row>
                  </Form.Group>
                  <Form.Group className="mb-0 form-group pb-0 other__fields">
                    {projectCustomFields?.length > 0 && (
                      <>
                        {/* <h4>Other Fields</h4> */}
                        {projectCustomFields?.map((field, index) =>
                          renderDynamicField({
                            name: `custom_field[${field.name}]`,
                            type: field.type,
                            label: field.label,
                            value:
                              field.type === "date" &&
                              fields[`custom_field[${field.name}]`]
                                ? convertDDMMYYYYtoYYYYMMDD(
                                    fields[`custom_field[${field.name}]`]
                                  )
                                : fields[`custom_field[${field.name}]`] || "",
                            options: field?.options || [],
                            onChange: (e) => {
                              if (field.type === "date") {
                                handleDateChange(
                                  e,
                                  `custom_field[${field.name}]`
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
                              toggleShowPassword(`custom_field[${field.name}]`),
                            toggleBadges: () => toggleBadges(field),
                          })
                        )}
                      </>
                    )}
                  </Form.Group>
                </Form>
              </div>
              <div className="project--form--actions">
                <h4>Actions</h4>
                <ListGroup>
                  <ListGroup.Item
                    key="assign-membermodal-key"
                    onClick={() => {
                      dispatch(togglePopups("members", true));
                    }}
                  >
                    <FaPlus /> Assign to
                  </ListGroup.Item>
                  <div className="m-0 d-flex align-items-center flex-wrap">
                    {fields.members &&
                      Object.keys(fields.members).length > 0 && (
                        <MemberInitials
                          directUpdate={false}
                          members={fields["members"]}
                          showRemove={true}
                          showall={true}
                          showAssignBtn={
                            memberProfile?.role?.permissions?.members?.view ===
                              true || memberProfile?.role?.slug === "owner"
                              ? true
                              : false
                          }
                          postId={currentProject?._id}
                          type="project"
                        />
                      )}
                  </div>
                  <ListGroup.Item
                    key="assign-files-key"
                    onClick={handleUploadShow}
                  >
                    <GrAttachment /> Attach files
                  </ListGroup.Item>
                  <div className="output--file-preview">
                    <div className="preview--grid">
                      {currentProject.files &&
                        currentProject.files.length > 0 &&
                        currentProject.files.map((preview, index) => (
                          <div key={index}>
                            {renderPreview("old", preview, index)}
                          </div>
                        ))}
                      {!showUpload &&
                        imagePreviews.map((preview, index) => (
                          <div
                            key={`uploaded-preview-${index}`}
                            className="file-preview"
                          >
                            {renderPreview("new", preview, index)}
                          </div>
                        ))}
                    </div>
                  </div>
                </ListGroup>
                <ListGroup className="mt-auto mb-0">
                  <ListGroup.Item className="d-flex align-items-center justify-content-end gap-3">
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={loader}
                    >
                      {loader ? "Please wait..." : "Save"}
                    </Button>
                    <Button
                      variant="secondary"
                      key="delete-key"
                      onClick={() => setShowDialog(true)}
                    >
                      Delete
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </div>
            {/*--=-=Upload Files Modal**/}
            <Modal
              show={showUpload}
              onHide={handleUploadClose}
              centered
              size="md"
              className="upload--status"
            >
              <Modal.Header closeButton>
                <Modal.Title>Attach Files</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form {...getRootProps()}>
                  <Form.Group>
                    <Form.Control
                      type="file"
                      hidden
                      multiple
                      name="images[]"
                      onChange={(e) =>
                        handleSelectedFiles(Array.from(e.target.files))
                      }
                      {...getInputProps()}
                      id="updateattachments"
                    />
                    <Form.Label
                      className="file--upload"
                      for="updateattachments"
                      onClick="handleLabelClick(event)"
                    >
                      <span>
                        <FaUpload />
                      </span>
                      <p>
                        Drop your files here or <strong>browse</strong>
                      </p>
                    </Form.Label>
                  </Form.Group>
                  {
                      
                        <span className='error'>{ errors['file_error'] || ''}</span>
                      
                    }
                </Form>
                <div className="preview--grid">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={`uploaded-preview-${index}`}
                      className="file-preview"
                    >
                      {renderPreview("new", preview, index)}
                    </div>
                  ))}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedFiles([]);
                    setImagePreviews([]);
                    handleUploadClose();
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleattachfiles}>
                  Attach
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        ) : (
          <div className="project--form rounded--box">
            <div className="project--form--inputs">
              <Form
                onSubmit={(e) => {
                  return false;
                }}
              >
                <Form.Group className="mb-0 form-group">
                  <FloatingLabel label="Project Title *">
                    <Form.Control
                      type="text"
                      name="title"
                      placeholder="Project Title"
                      value={currentProject?.title || ""}
                    />
                  </FloatingLabel>
                  {showError("title")}
                </Form.Group>
                <Form.Group className="mb-0 form-group">
                  <Form.Label>
                    <small>Status</small>
                    <div className="status--modal">
                      <span
                        className={`${
                          currentProject?.status === "in-progress"
                            ? "progress--circle"
                            : currentProject?.status === "on-hold"
                            ? "hold--circle"
                            : currentProject?.status === "completed"
                            ? "complete--circle"
                            : ""
                        } status--circle`}
                      ></span>{" "}
                      {currentProject?.status
                        ?.replace(/-/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}{" "}
                      <FaChevronDown />
                    </div>
                  </Form.Label>
                </Form.Group>
                <Form.Group
                  className="mb-0 form-group"
                  key={`clientbox-${currentProject?._id}`}
                >
                  <Form.Label>
                    <small>Client</small>
                  </Form.Label>
                  <div className="client--input">
                    <Dropdown className={`select--dropdown`}>
                      <Dropdown.Toggle
                        variant="success"
                        key={`success-selectkey-${Math.floor(
                          Math.random() * 1001
                        )}`}
                      >
                        {currentProject?.client?.name || "None"}
                      </Dropdown.Toggle>
                    </Dropdown>
                  </div>
                </Form.Group>
                <Form.Group className="mb-0 form-group">
                  <Form.Label>
                    <small>Workflow</small>
                    <div className="workflow--modal">
                      <span className="workflow--selected">
                        {currentProject?.workflow?.title
                          ? "Current Workflow"
                          : "Current Workflow"}{" "}
                        <FaChevronDown />
                      </span>
                    </div>
                  </Form.Label>
                </Form.Group>
                <Form.Group className="mb-0 form-group">
                  <Form.Label className="w-100 m-0">
                    <small>Description</small>
                  </Form.Label>
                  <div
                    className={
                      isEditor ||
                      (currentProject?.description &&
                        currentProject?.description !== "")
                        ? "text--editor show--editor"
                        : "text--editor"
                    }
                  >
                    <ReactQuill
                      value={currentProject?.description || ""}
                      formats={formats}
                      modules={modules}
                      disabled
                      ref={quillRef}
                    />
                  </div>
                </Form.Group>
                <Form.Group className="mb-0 form-group pb-0">
                  <Form.Label>
                    <small>Start/Due Date</small>
                  </Form.Label>
                  <Row>
                    {!currentProject?.start_date &&
                    !currentProject?.due_date ? (
                      <label
                        htmlFor="startdate--picker"
                        className="task--date--picker"
                      >
                        <FaRegCalendarAlt /> Set due date
                      </label>
                    ) : (
                      <label
                        htmlFor="startdate--picker"
                        className="task--date--change"
                      >
                        {currentProject?.start_date &&
                          new Date(currentProject.start_date)
                            .toISOString()
                            .split("T")[0]}

                        {currentProject?.start_date &&
                          currentProject?.due_date && <span>/</span>}

                        {currentProject?.due_date && (
                          <>
                            {
                              new Date(currentProject.due_date)
                                .toISOString()
                                .split("T")[0]
                            }
                          </>
                        )}

                        {(currentProject?.start_date ||
                          currentProject?.due_date) && <MdOutlineCancel />}
                      </label>
                    )}
                  </Row>
                </Form.Group>
              </Form>
            </div>
            <div className="project--form--actions">
              <h4>Actions</h4>
              <ListGroup>
                <ListGroup.Item key="assign-membermodal-key">
                  <FaPlus /> Assign to
                </ListGroup.Item>
                <div className="m-0 d-flex align-items-center flex-wrap">
                  {currentProject?.members &&
                    Object.keys(currentProject?.members).length > 0 && (
                      <MemberInitials
                        directUpdate={false}
                        members={currentProject?.members}
                        showRemove={false}
                        showall={true}
                        showAssignBtn={false}
                        postId={currentProject?._id}
                        type="project"
                      />
                    )}
                </div>
                <ListGroup.Item key="assign-files-key">
                  <GrAttachment /> Attach files
                </ListGroup.Item>
                <div className="output--file-preview">
                  <div className="preview--grid">
                    {currentProject.files &&
                      currentProject.files.length > 0 &&
                      currentProject.files.map((preview, index) => (
                        <div key={index}>
                          {renderPreview("old", preview, index)}
                        </div>
                      ))}
                  </div>
                </div>
              </ListGroup>
            </div>
          </div>
        )}
      </div>

      {/*--=-=File Preview Modal**/}
      <Modal
        show={showPreview}
        onHide={handlePreviewClose}
        size="xl"
        className="file--preview--modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {filetoPreview?.filename}
            <Dropdown>
              <Dropdown.Toggle variant="light">
                <FaEllipsisV />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  key={`openfile-${filetoPreview?._id}`}
                  onClick={() => handleDownload(filetoPreview?.src)}
                >
                  <MdFileDownload /> Download
                </Dropdown.Item>
                {/* <Dropdown.Item href="#/action-2" onClick={() => //handleRemovefiles(filetoPreview?._id)}><FaTrashAlt /> Delete file</Dropdown.Item> */}
              </Dropdown.Menu>
            </Dropdown>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="file--flex">
            <ListGroup>
              {currentProject?.files &&
                currentProject?.files.length > 0 &&
                currentProject.files.map((preview, index) => (
                  <ListGroup.Item
                    key={`preview-key-${index}`}
                    onClick={() =>
                      setFiletoPreview({
                        src: preview.src,
                        mimetype: preview.src.split(".").pop().toLowerCase(),
                        _id: preview._id,
                        filename: preview?.filename || `Preview file-${index}`,
                      })
                    }
                    className={
                      preview._id === filetoPreview?._id ? "selected--file" : ""
                    }
                  >
                    {preview?.filename}
                  </ListGroup.Item>
                ))}
              {imagePreviews.map((preview, index) => (
                <>
                  <ListGroup.Item
                    key={`preview-key-new-${index}`}
                    onClick={() =>
                      setFiletoPreview({
                        mimetype: preview.mimetype,
                        src: preview.src,
                        _id: index,
                        filename: preview?.filename || `Preview file-${index}`,
                      })
                    }
                    className={
                      index === filetoPreview?._id ? "selected--file" : ""
                    }
                  >
                    {preview?.filename}
                  </ListGroup.Item>{" "}
                </>
                // <div key={`uploaded-preview-${index}`} className="file-preview">{renderPreview('new', preview, index)}</div>
              ))}
            </ListGroup>
            <div className="file--preview">
              {["jpg", "jpeg", "png", "webp", "gif", "ico"].includes(
                filetoPreview?.mimetype
              ) ? (
                <img src={filetoPreview?.src} alt=".." />
              ) : filetoPreview?.mimetype === "mp4" ? (
                <video
                  src={filetoPreview?.src}
                  alt={`video--file`}
                  width="200"
                  controls
                />
              ) : filetoPreview?.mimetype === "pdf" ? (
                <embed
                  src={filetoPreview?.src}
                  type="application/pdf"
                  width="200"
                  height="200"
                />
              ) : (
                <>
                  <img src={fileIcon} alt=".." width="100" height="100" />{" "}
                  <br />
                </>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <>
        <AlertDialog
          showdialog={showdialog}
          toggledialog={setShowDialog}
          msg="Are you sure you want to delete this project?"
          callback={handledeleteProject}
        />
      </>
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

export default SingleProject;
