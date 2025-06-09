import React, { useEffect, useState, useRef } from 'react';
import { debounce } from 'lodash';
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Form, ListGroup, Row, Col, InputGroup, Dropdown, Image } from "react-bootstrap";
import { MdFileDownload } from "react-icons/md";
import { FaEllipsisV, FaPlus, FaRegTrashAlt, FaChevronDown, FaCheck, FaEdit } from "react-icons/fa";
import { selectboxObserver, getMemberdata, makeLinksClickable, formatTimeAgo, parseDateWithoutTimezone, timeAgo } from "../../helpers/commonfunctions";
import { updateStateData, togglePopups } from '../../redux/actions/common.action';
import { TASK_FORM, RESET_FORMS, ACTIVE_FORM_TYPE, CURRENT_TASK } from '../../redux/actions/types';
import { FiFileText } from "react-icons/fi";
import { GrAttachment } from "react-icons/gr";
import { FaPaperPlane, FaRegCalendarAlt } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import { GrDrag } from "react-icons/gr";
import { LuWorkflow } from "react-icons/lu";
import { FilesPreviewModal } from '../modals';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { getFieldRules, validateField } from '../../helpers/rules';
import { updateTask, deleteTask } from '../../redux/actions/task.action';
import { socket, SendComment, DeleteComment, UpdateComment } from '../../helpers/auth';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { MemberInitials } from '../common/memberInitials';
import { DatePicker, Calendar } from "react-multi-date-picker";
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AutoLinks from "quill-auto-links";
Quill.register("modules/autoLinks", AutoLinks);

export const TaskForm = (props) => {
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' },
            { 'indent': '-1' }, { 'indent': '+1' }],
            ['link'],
        ],
        clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false,
        },
        autoLinks: true
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link'
    ];

    const memberProfile = props.memberProfile

    const dispatch = useDispatch()
    const quillRef = useRef(null);
    const pasteOccurred = useRef(false);
    const memberdata = getMemberdata()
    const [workflowstatus, setWorkflowStatus] = useState(false)
    const [datePickerModal, setDatePickerModal] = useState(false)
    const modalstate = useSelector(state => state.common.taskmodal);
    const taskForm = useSelector(state => state.common.taskForm)
    const apiResult = useSelector(state => state.task);
    const commonState = useSelector(state => state.common)
    const members = useSelector((state) => state.common.allmembers);
    const [currentProject, setCurrentProject] = useState({})
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loader, setLoader] = useState(false);
    const [fields, setFields] = useState({ title: apiResult?.currentTask?.title || '', members: [], description: apiResult?.currentTask?.description || '' })
    const [errors, setErrors] = useState({})
    const [subtasks, setSubtasks] = useState([]);
    const [issubopen, setissubopen] = useState(false)
    const handleUploadShow = () => dispatch(togglePopups('files', true))
    const [isdescEditor, setIsDescEditor] = useState(false);
    const [filetoPreview, setFiletoPreview] = useState(null);
    const [showPreview, setPreviewShow] = useState(false);
    const handlePreviewClose = () => setPreviewShow(false);
    const [currentTask, setCurrentTask] = useState(apiResult.currentTask || {})
    const [enablesubtaskedit, setEnableSubtaskEdit] = useState({})
    const [ShowCommentModel, setShowCommentModel] = useState(false);
    const handleCloseCommentModel = () => setShowCommentModel(false);
    const handleDatetModal = () => setDatePickerModal(false);
    const [editmessage, setEditMessage] = useState({})
    const [comments, setComments] = useState('');
    const [workflowstatuses, setFlowstatus] = useState([])
    const handleNewComment = (event) => {
        setComments(event.target.value);
    }



    const [search, setSearch] = useState('');
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const filteredStatuses = workflowstatuses.filter(status =>
        status.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleShowCommentModel = (image) => {
        // handleSelectedImage(image);
        setShowCommentModel(true);
    }
    let fieldErrors = {};
    const handlePreviewShow = (file) => {
        setFiletoPreview(file)
        setPreviewShow(true)
    };

    useEffect(() => {
        if (modalstate === true) {
            dispatch(updateStateData(TASK_FORM, { title: '' }))
        }
    }, [modalstate])

    useEffect(() => {
        if (apiResult.currentTask) {
            setCurrentTask(apiResult.currentTask)
        }

    }, [apiResult.currentTask])
    useEffect(() => {
        
        if (apiResult.UpdatedTask) {
            setCurrentTask(apiResult.UpdatedTask)
        }

    }, [apiResult.UpdatedTask])

    useEffect(() => {
        if (apiResult.tasks?.taskData && Object.keys(apiResult.tasks.taskData).length > 0) {
            if (currentTask && currentTask._id && apiResult.tasks?.taskData?.[currentTask?.tab] && apiResult.tasks?.taskData?.[currentTask?.tab].tasks) {
                const taskToUpdate = apiResult.tasks.taskData[currentTask.tab].tasks.find(task => task._id === currentTask?._id);

                if (taskToUpdate) {
                    dispatch(updateStateData(CURRENT_TASK, taskToUpdate));
                }
            }
        }
    }, [apiResult.tasks, dispatch])

    useEffect(() => {
        if (currentTask && Object.keys(currentTask).length > 0) {
            setImagePreviews([]);
            let fieldsSetup = {
                title: currentTask.title,
                tab: currentTask.tab,
                description: currentTask.description || '',
                files: currentTask.files ? currentTask.files.map(image => image._id) : [],
                order: currentTask.order ? currentTask.order : '',
                subtasks: currentTask.subtasks ? currentTask.subtasks : [],
                due_date: currentTask.due_date ? new Date(currentTask.due_date).toISOString().split('T')[0] : ''
            };

            setSubtasks(() => {
                const subtasks = currentTask.subtasks ? currentTask.subtasks : [];
                if (issubopen) {
                    return [...subtasks, ""];
                }
                return subtasks;
            });



            if (currentTask.description && currentTask.description !== "") {
                setIsDescEditor(true);
            } else {
                setIsDescEditor(false);
            }

            // Set members if present
            if (currentTask.members && currentTask.members.length > 0) {
                let taskMembers = [];
                let membersdrop = {};

                currentTask.members.forEach(member => {
                    const { _id, name } = member;
                    taskMembers.push(_id);
                    membersdrop[_id] = name;
                });

                fieldsSetup.members = membersdrop;
                // setselectedMembers(membersdrop);
            } else {
                fieldsSetup.members = [];
                //setselectedMembers({});
            }
            // setTimeout(function () {
            //     selectboxObserver()
            // }, 150)
            dispatch(updateStateData(TASK_FORM, fieldsSetup))
        }
    }, [currentTask]);

    const refreshstates = (formtype) => {
        switch (formtype) {
            case 'task':
                const stateObject = {}
                // stateObject['status'] = commonState.projectForm.status
                stateObject['formtype'] = commonState.active_formtype
                return stateObject

            case 'edit_task':
                const editstateObject = {}
                // editstateObject['status'] = commonState.editProjectForm.status
                editstateObject['formtype'] = commonState.active_formtype
                return editstateObject

            default:
                return {}
                break;
        }
    }

    const handleCommentSubmit = async () => {
        const newComment = { text: comments };
        SendComment(comments, currentTask?._id, memberdata?._id);
        setComments('');
    };

    useEffect(() => {
        if (taskForm) {
            setFields(prevFields => {
                const updatedFields = {
                    ...prevFields, // Retain the existing properties of fields
                    ...taskForm // Merge properties from commonState.taskForm
                };
                return updatedFields; // Return the new state
            });

        }
    }, [taskForm]);


    useEffect(() => {
        if (commonState.taskForm.images?.length > 0) {
            const selectedFiles = commonState.taskForm.images
            const previews = [];
            for (let i = 0; i < selectedFiles.length; i++) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const fileExtension = selectedFiles[i].name?.split('.').pop().toLowerCase();
                    previews.push({
                        src: e.target.result,
                        file: selectedFiles[i],
                        mimetype: fileExtension,
                        filename: selectedFiles[i].name,
                        _id: i
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
    }, [taskForm.images])

    const TaskUpdate = async () => { 
        if (currentTask?.description === fields?.description) {
            return false;
        }
        // console.log(currentTask?.description  + '===' + fields?.description)
        await dispatch(updateTask(currentTask._id, { description: fields?.description }))

    }

    const handleDelteComment = async (commentId, feedId) => {
        DeleteComment(commentId, feedId)
    }

    const showError = (name) => {
        if (errors[name]) return (<span className="error">{errors[name]}</span>)
        return null
    }

    const handleRemovefiles = (id) => {
        let previousfiles = fields['files']
        
        const updatedFiles = previousfiles.filter(file => file !== id);
        setFields({ ...fields, ['files']: updatedFiles })
        const previewfiles = currentTask.files.filter(file => file._id !== id);
        dispatch(updateStateData(CURRENT_TASK, { ...currentTask, ['files']: previewfiles }));
        dispatch(updateTask(currentTask._id, { files: updatedFiles }))
    }

    const handleRemove = (indexToRemove) => {
        const selectedFiles = commonState.projectForm.images
        const updatedSelectedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        const updatedImagePreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
        // setSelectedFiles(updatedSelectedFiles);
        dispatch(updateStateData(TASK_FORM, { images: updatedSelectedFiles }))
        setImagePreviews(updatedImagePreviews);
    };

    const renderPreview = (type, preview, index) => {

        const { src, _id } = preview;
        const mimetype = (preview.mimetype) ? preview.mimetype : src?.split('.').pop().toLowerCase();
       
        const previewComponents = {
            image: (
                <div className="preview--cell">
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
            video: (
                <div className="preview--cell">
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
            pdf: (
                <div className="preview--cell">
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
            other: (
                <div className="preview--cell">
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
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

    const [taskModalState, setTaskModalState] = useState(refreshstates(commonState.active_formtype || false))

    const handlesubtaskChange = (index, oldval, newval, directupdate = false) => {
        if(memberProfile?.permissions?.projects?.create_edit_delete_task === true || memberProfile?.role?.slug === 'owner' ){
            const newSubtasks = [...subtasks];
            newSubtasks[index] = (typeof oldval === "object" && oldval._id) ? { ...oldval, ['title']: newval } : newval; // Update the specific subtask
            setSubtasks(newSubtasks); // Update the local state with the new subtasks array
            setFields({ ...fields, ['subtasks']: newSubtasks })
            // Dispatch the updated subtasks to global state
            dispatch(updateStateData(TASK_FORM, { subtasks: newSubtasks }));
            if (directupdate === true) {
                dispatch(updateTask(currentTask._id, { subtasks: newSubtasks }))
            }
        }
    }

    const handleChange = ({ target: { name, value } }) => {

        // Handle other form inputs
        setFields({ ...fields, [name]: value })
        dispatch(updateStateData(TASK_FORM, { [name]: value }));
        setErrors({ ...errors, [name]: '' });
        // }
    };
    const addSubtask = () => {
        if(memberProfile?.permissions?.projects?.create_edit_delete_task === true || memberProfile?.role?.slug === 'owner' ){
            setissubopen(true)
            setSubtasks([...subtasks, '']);
        }
    }

    const removeSubtask = (index) => {
        console.log('index:: ', index)
        const newSubtasks = subtasks.filter((_, i) => i !== index); // Remove the subtask at the given index
        setSubtasks(newSubtasks); // Update local state
        dispatch(updateStateData(TASK_FORM, { subtasks: newSubtasks })); // Dispatch the updated subtasks
        dispatch(updateTask(currentTask._id, { subtasks: newSubtasks }))
    };

    // Function to handle blur event on subtask input
    const handleBlur = (index) => {
        if((memberProfile?.permissions?.projects?.create_edit_delete_task === true || memberProfile?.role?.slug === 'owner' )){
            const subtaskValue = subtasks[index];
            if (subtaskValue === '') {
                removeSubtask(index);
                setissubopen(false)
            } else {
                const updatedSubtask = {
                    title: subtaskValue,
                    _id: 0, // Replace with your method to generate a unique ID
                    order: 0, // Use index as the order, or modify as needed
                    status: false // Default status, update as necessary
                };

                // Update `subtasks` with the new object at the specified index
                const updatedSubtasks = [...subtasks];
                updatedSubtasks[index] = updatedSubtask;
                setSubtasks(updatedSubtasks)

                dispatch(updateTask(currentTask._id, { subtasks: updatedSubtasks }))

            }
        }
    };

    const updateSubtask = (ischecked, index) => {
        const newSubtasks = [...subtasks];
        newSubtasks[index] = { ...newSubtasks[index], ['status']: ischecked }; // Update the specific subtask
        setSubtasks(newSubtasks);
        dispatch(updateTask(currentTask._id, { subtasks: newSubtasks }))
    }

    const handleDragEnd = (result) => {
        const { source, destination } = result;

        // Check if the item was dropped outside the list or in the same place
        if (!destination || (source.index === destination.index)) {
            return; // Do nothing if not moved
        }

        // Create a new array to update subtasks
        const newSubtasks = Array.from(subtasks);
        // Move the dragged subtask to the new position
        const [removed] = newSubtasks.splice(source.index, 1);
        newSubtasks.splice(destination.index, 0, removed);

        // Update the order for each subtask based on the new index
        const updatedSubtasks = newSubtasks.map((subtask, index) => ({
            ...subtask,
            order: index // Set the order to the current index
        }));

        // Update the state with the new order
        setSubtasks(updatedSubtasks);
        dispatch(updateTask(currentTask._id, { subtasks: updatedSubtasks }))
    };


const [editValues, setEditValues] = useState({});

const renderSubtasks = () => {
    return subtasks.map((subtask, index) => {
        const isEditing = typeof subtask === 'object' && enablesubtaskedit[subtask._id];
        const subtaskText = typeof subtask === 'object' ? subtask.title || '' : subtask;
        
        return (
            <Draggable
                key={`subtaskindex-${index}`}
                draggableId={`sub-task-${index}`}
                index={index}
            >
                {(provided) => (
                    <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    >
                        <Form.Group className="mb-0 form-group pb-0" key={`subtask-${index}`}>
                            {typeof subtask === 'object' && !isEditing && (
                                <>
                                    <GrDrag />
                                    <input
                                        type="checkbox"
                                        onChange={(e) => updateSubtask(e.target.checked, index)}
                                        checked={subtask?.status || false}
                                    />
                                </>
                            )}

                            {isEditing ? (
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    autoFocus
                                    value={editValues[subtask._id] || ''}
                                    onChange={(e) =>
                                        setEditValues((prev) => ({
                                            ...prev,
                                            [subtask._id]: e.target.value,
                                        }))
                                    }
                                    onBlur={(e) => {
                                        handlesubtaskChange(index, subtask, e.target.value, true);
                                        setEnableSubtaskEdit((prev) => ({
                                            ...prev,
                                            [subtask._id]: false,
                                        }));
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            e.target.blur();
                                        }
                                    }}
                                />
                            ) : typeof subtask === 'object' ? (
                                <div
                                    className="form-control"
                                    style={{
                                        cursor: 'pointer',
                                        border: 'none',
                                        padding: '0.5rem 0',
                                        minHeight: '2rem',
                                        overflowWrap: 'break-word',
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: makeLinksClickable(
                                            String(subtask.title || '').replace(/\n/g, '<br/>')
                                        ),
                                    }}
                                />
                            ) : (
                                <div className="message--area">
                                    <div
                                        className="textarea--content"
                                        dangerouslySetInnerHTML={{
                                            __html: subtask?.replace(/\n/g, '<br>&nbsp;'),
                                        }}
                                    />
                                    <textarea
                                        className="form-control mb-5"
                                        rows="1"
                                        onBlur={() => handleBlur(index)}
                                        name={`subtask-${index}`}
                                        placeholder="Enter subtask"
                                        value={subtask}
                                        onChange={({ target: { value } }) =>
                                            handlesubtaskChange(index, subtask, value)
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' && !event.shiftKey) {
                                                event.preventDefault();
                                                handleBlur(index);
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            {typeof subtask === 'object' && !isEditing && (
                                <div className="d-flex align-items-center gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEnableSubtaskEdit((prev) => ({
                                                ...prev,
                                                [subtask._id]: true,
                                            }));
                                            setEditValues((prev) => ({
                                                ...prev,
                                                [subtask._id]: subtask.title?.replace(/<br\s*\/?>/g, '\n') || '',
                                            }));
                                        }}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button type="button" onClick={() => removeSubtask(index)}>
                                        <FaRegTrashAlt />
                                    </button>
                                </div>
                            )}
                        </Form.Group>
                    </li>
                )}
            </Draggable>
        );
    });
};

    
    const renderSubtaskssss = () => {

        return subtasks.map((subtask, index) => (

            <Draggable
                key={`subtaskindex-${index}`}
                draggableId={`sub-task-${index}`}
                index={index}
            >
                {(provided) => (
                    <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    >
                        <Form.Group className="mb-0 form-group pb-0" key={`subtask-${index}`}>
                            {
                                (typeof subtask === 'object') &&
                                <>
                                    <GrDrag />
                                    <input type='checkbox' onChange={(e) => { 
                                        
                                            updateSubtask(e.target.checked, index)
                                        
                                    }} checked={
                                        subtask?.status || false
                                    } />
                                </>
                            }

                            {typeof subtask !== 'object' ? (
                                <div className='message--area'>
                                    <div className='textarea--content' id="textContentDiv" dangerouslySetInnerHTML={subtask ? {
                                        __html: subtask
                                            .replace(/\n/g, '<br>&nbsp;')  // Replace line breaks with <br> tags
                                        // .replace(/ /g, '&nbsp;') // Replace spaces with non-breaking spaces
                                    } : null}>

                                    </div>
                                    <textarea
                                        className="form-control"
                                        rows="1"
                                        onBlur={() => handleBlur(index)}
                                        name={`subtask-${index}`}
                                        placeholder="Enter subtask"
                                        value={subtask}
                                        onChange={({ target: { value } }) => handlesubtaskChange(index, subtask, value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' && !event.shiftKey) {
                                                event.preventDefault(); // Prevent form submission on Enter
                                                handleBlur(index); // Handle saving on Enter
                                            }
                                        }}

                                    />
                                </div>
                            ) : (
                                <div
                                    className="form-control"
                                    contentEditable={typeof subtask === 'object' && enablesubtaskedit[subtask._id] === true}
                                    suppressContentEditableWarning={true}
                                    onMouseDown={(e) => {
                                        if (e.target.tagName === 'A') {
                                            e.stopPropagation();
                                        }
                                    }}

                                    onClick={(e) => {
                                        if (e.target.tagName === 'A') {
                                            e.stopPropagation();
                                            return;
                                        }
                                        const selection = window.getSelection();
                                        if (selection && selection.type === 'Range') {
                                            // User is selecting text, so don't move the caret
                                            return;
                                        }
                                        if (typeof subtask === 'object') {
                                            setEnableSubtaskEdit({ [subtask._id]: true });

                                            // Set caret to the end after enabling edit
                                            setTimeout(() => {
                                                const editableDiv = document.getElementById(`editable-subtask-${subtask._id}`);
                                                editableDiv.focus();
                                                const range = document.createRange();
                                                const selection = window.getSelection();
                                                range.selectNodeContents(editableDiv);
                                                range.collapse(false);
                                                selection.removeAllRanges();
                                                selection.addRange(range);
                                            }, 0);
                                        }
                                    }}

                                    onBlur={(e) => {
                                        if (typeof subtask === 'object') {
                                            console.log('On blur')
                                            setEnableSubtaskEdit({ [subtask._id]: false });
                                            // Save content, converting <br> to \n
                                            let content = e.target.innerHTML
                                                .replace(/<a\s+href="[^"]*"[^>]*>(.*?)<\/a>/g, '$1')  // Convert <a> tags to plain text
                                                .replace(/<\/?div>/g, '')                             // Remove wrapping <div> tags if present
                                                .replace(/<br\s*\/?>/g, '\n')                         // Convert <br> back to newlines
                                                .replace(/&nbsp;/g, ' ')                              // Convert non-breaking spaces to regular spaces
                                                .replace(/(?:\r\n|\r|\n)/g, '\n');                    // Normalize newlines

                                            console.log('content is:: ', content)
                                            handlesubtaskChange(index, subtask, content, true);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault(); // Prevent new line on Enter
                                            e.target.blur(); // Trigger blur to save and disable editing
                                        }
                                    }}
                                    id={`editable-subtask-${subtask._id}`}
                                    style={{
                                        cursor: enablesubtaskedit[subtask._id] ? 'text' : 'pointer',
                                        border: 'none',
                                        padding: '0.5rem 0',
                                        minHeight: '2rem',
                                        overflowWrap: 'break-word',
                                    }}
                                    placeholder="Enter subtask"
                                    dangerouslySetInnerHTML={{
                                        __html: typeof subtask === 'object'
                                            ? makeLinksClickable(String(subtask.title).replace(/\n/g, '<br/>')) // Ensure title is a string
                                            : makeLinksClickable(String(subtask).replace(/\n/g, '<br/>')),      // Ensure subtask is a string
                                    }}

                                ></div>
                            )}

                            <button type="button" variant="primary" onClick={() => removeSubtask(index)}>
                                <FaRegTrashAlt />
                            </button>
                        </Form.Group>
                    </li>
                )}
            </Draggable>


        ));
    };

    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            pasteOccurred.current = true; // Mark that a paste action is expected
            console.log('Paste keyboard shortcut detected');
        }
    };

    useEffect(() => {
        // Add the paste listener to the editor
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            editor.root.addEventListener('paste', handlePaste);
        }

        // Cleanup the event listener on unmount
        return () => {
            if (quillRef.current) {
                const editor = quillRef.current.getEditor();
                editor.root.removeEventListener('paste', handlePaste);
            }
        };
    }, []);

    const handlePaste = (e) => {
        const pastedData = e.clipboardData.getData('text');
        console.log('Pasted content:', pastedData);
        pasteOccurred.current = true; // Set the paste flag to true
        setTimeout(function () {
            pasteOccurred.current = false;
        }, 500)
    };

    const handleDescBlur = debounce(async () => {
        if (pasteOccurred.current) {
            pasteOccurred.current = false; // Reset the flag after handling paste
            return;
        }
        await dispatch(updateTask(currentTask._id, { description: fields['description'] }));

    }, 2000)

    const Initials = ({ id, children, title }) => {
        return (
            <OverlayTrigger placement="bottom" overlay={<Tooltip id={id}>{title}</Tooltip>}>
                {children}
            </OverlayTrigger>

        )
    };
    const formatDate = (dateString) => {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
        const date = new Date(dateString);

        // Format the time part
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        const formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');
        const formattedTime = date.toLocaleTimeString('en-US', timeOptions).toLowerCase();

        return `${formattedDate} | ${formattedTime}`;
    };

    return (
        <>
            <Modal show={modalstate} onHide={async () => {
                if(memberProfile?.permissions?.projects?.create_edit_delete_task === true || memberProfile?.role?.slug === 'owner' ){
                    TaskUpdate()
                }
                
                dispatch(updateStateData(CURRENT_TASK, {})); dispatch(updateStateData(ACTIVE_FORM_TYPE, 'edit_project')); 
                dispatch(togglePopups('taskform', false));
            }
            } centered size="lg" className="add--member--modal edit--task--modal modalbox" 
            //onShow={() => selectboxObserver()}
            >
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <div className="project--form">
                        { (memberProfile?.permissions?.projects?.create_edit_delete_task === true || memberProfile?.role?.slug === 'owner' ) ?
                        <>
                        <div className="project--form--inputs" data-tabid={fields['tab']}>
                            <Form onSubmit={() => { return false }} key={`taskform-${commonState?.taskForm?.tab}`}>
                                <Form.Group className="mb-0 form-group task--title">
                                    <Form.Label><small>Title</small></Form.Label>
                                    <Form.Control type="text" key={`task-title-${commonState?.taskForm?.tab}`} name="title" placeholder="Task Title" value={fields['title'] || ""} onChange={handleChange} onBlur={(e) => {
                                        if (currentTask.title !== fields['title']) {
                                            if(memberProfile?.permissions?.projects?.create_edit_delete_task === true || memberProfile?.role?.slug === 'owner' ){
                                                dispatch(updateTask(currentTask._id, { title: fields['title'] }))
                                            }
                                            
                                        }
                                    }} />
                                    {showError('title')}
                                    <span className='pencil--edit'><BiSolidPencil /></span>
                                </Form.Group>

                                <Form.Group className="mb-0 form-group">
                                    <Form.Label className="w-100 m-0">
                                        <small onClick={() => {
                                            setIsDescEditor(prevState => !prevState);
                                        }}>Description</small>
                                        {
                                            !isdescEditor &&
                                            <strong className="add-descrp" onClick={() => {
                                                setIsDescEditor(prevState => !prevState);
                                            }}><FiFileText /> Add a description</strong>
                                        }


                                    </Form.Label>
                                    <div className={isdescEditor ? 'text--editor show--editor' : 'text--editor'}>
                                        <ReactQuill
                                            value={fields['description'] || ''}
                                            onChange={(value) => {
                                                setFields((prevFields) => ({
                                                    ...prevFields,
                                                    description: value,
                                                }));
                                                setErrors((prevErrors) => ({ ...prevErrors, description: '' }));
                                            }}
                                            onKeyDown={handleKeyDown}
                                            ref={quillRef}
                                            modules={modules}
                                            formats={formats}
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-0 form-group pb-0">
                                    <Form.Label className="w-100 m-0">
                                        <small>Subtasks</small>
                                    </Form.Label>
                                </Form.Group>

                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId={`droppable-subtasks-List-${currentTask?._id}`} type="SUBTASKS">
                                        {(provided) => (
                                            <div className='subtasks-List' ref={provided.innerRef} {...provided.droppableProps}>
                                                <ul
                                                    id={`subtasks-ul`}
                                                    className="subtasks--list"
                                                >
                                                    {
                                                        subtasks && subtasks.length > 0 &&
                                                        renderSubtasks()
                                                    }
                                                    {provided.placeholder}
                                                </ul>
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>


                                <small
                                    className="add-subtasks"
                                    style={{ cursor: 'pointer', opacity: subtasks.length && subtasks.some(subtask => subtask === '') ? 0.5 : 1 }}
                                    onClick={subtasks.length && subtasks.some(subtask => subtask === '') ? null : addSubtask}
                                >
                                    <FaPlus /> Add subtasks
                                </small>

                                <Form.Group className="mb-0 mt-3 form-group">
                                    <Form.Label className="w-100 m-0">
                                        <small>Task chat</small>
                                    </Form.Label>
                                    {
                                        currentTask && currentTask.comments && currentTask.comments.length > 0 &&
                                        <Row key={`task-comments-${currentTask?._idß}`}>
                                            <Col sm={12}>
                                                {
                                                    currentTask.comments.map((comment, index) => {
                                                        if (editmessage[comment._id] && editmessage[comment._id]['show'] === true) {
                                                            return (
                                                                <div className='message--edit'>
                                                                    <Form.Control type='text' value={editmessage[comment._id].msg} onChange={(e) => {
                                                                        setEditMessage(prev => ({
                                                                            ...prev, // Spread the previous state
                                                                            [comment._id]: {
                                                                                show: true,
                                                                                msg: e.target.value // Update with the current input value
                                                                            }
                                                                        }));
                                                                    }}
                                                                    ></Form.Control>
                                                                    <ListGroup horizontal className='task--action--buttons'>
                                                                        <ListGroup.Item key={`edit-comment-${comment._id}`} className="more--actions">
                                                                            <Button variant='secondary' onClick={(e) => {
                                                                                setEditMessage(prev => ({
                                                                                    ...prev, // Spread the previous state
                                                                                    [comment._id]: {
                                                                                        show: false,
                                                                                        msg: e.target.value // Update with the current input value
                                                                                    }
                                                                                }));
                                                                            }}>Cancel</Button>
                                                                        </ListGroup.Item>
                                                                        <ListGroup.Item key={`delete-comment-${comment?._id}`} className="more--actions">
                                                                            <Button variant='primary' onClick={() => {
                                                                                UpdateComment(comment._id, editmessage[comment?._id]['msg'])
                                                                                setEditMessage({ [comment._id]: { show: false, msg: editmessage[comment?._id]['msg'] } })
                                                                            }}>Save</Button>
                                                                        </ListGroup.Item>
                                                                    </ListGroup>
                                                                </div>
                                                            )
                                                        } else {
                                                            return (
                                                                <p className='d-flex task--message' key={`comment-${comment._id}`}>
                                                                    <div className='msg-member-info'>
                                                                        {
                                                                            comment?.author?.avatar && comment?.author?.avatar !== null ?

                                                                                <Image src={comment?.author?.avatar} roundedCircle />
                                                                                :
                                                                                <Initials title={comment?.author?.name}>
                                                                                    <span className={`team--initial nm-${comment?.author?.name?.substring(0, 1).toLowerCase()}`}>
                                                                                        {comment?.author?.name?.substring(0, 1).toUpperCase()}
                                                                                    </span>
                                                                                </Initials>
                                                                        }


                                                                        <div className='msg-view'>
                                                                            <small>{formatTimeAgo(comment?.createdAt)}</small>
                                                                            {/* Render sanitized HTML content */}
                                                                            <p dangerouslySetInnerHTML={{ __html: makeLinksClickable(comment.text) }} />

                                                                        </div>
                                                                    </div>
                                                                    <Dropdown>
                                                                        <Dropdown.Toggle variant="primary" id={`toogle-btn-${currentTask?._id}`}>
                                                                            <FaEllipsisV />
                                                                        </Dropdown.Toggle>
                                                                        <Dropdown.Menu>
                                                                            <div className="over--scroll">
                                                                                <Dropdown.Item key={`dropdown-member-${index}`}>
                                                                                    <Button onClick={() => { setEditMessage({ [comment._id]: { show: true, msg: comment.text } }) }}>Edit message</Button>
                                                                                    <Button onClick={() => handleDelteComment(comment?._id, currentTask?._id)}>Delete message</Button>
                                                                                </Dropdown.Item>
                                                                            </div>
                                                                        </Dropdown.Menu>
                                                                    </Dropdown>
                                                                </p>
                                                            )
                                                        }
                                                    })
                                                }

                                            </Col>
                                        </Row>
                                    }

                                    <Row>
                                        <Col sm={12}>
                                            <InputGroup className="mb-0">
                                                <div className='message--area'>
                                                    <div className='textarea--content' id="textContentDiv" dangerouslySetInnerHTML={comments ? {
                                                        __html: comments
                                                            .replace(/\n/g, '<br>&nbsp;')  // Replace line breaks with <br> tags
                                                        // .replace(/ /g, '&nbsp;') // Replace spaces with non-breaking spaces
                                                    } : null}>

                                                    </div>
                                                    <textarea
                                                        placeholder="Message"
                                                        name="message"
                                                        className='form-control'
                                                        onChange={(event) => {
                                                            handleNewComment(event);
                                                            // appendToDiv(event.target.value); // Call function to update div content
                                                        }}
                                                        value={comments || ''}
                                                        onKeyDown={(event) => {
                                                            if (event.key === 'Enter' && !event.shiftKey) {
                                                                event.preventDefault(); // Prevent the default behavior (like form submission)
                                                                handleCommentSubmit(); // Call your function to handle the Enter press
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <Button variant="outline-secondary" id="send-message" onClick={() => handleCommentSubmit()}>
                                                    <FaPaperPlane />
                                                </Button>
                                            </InputGroup>
                                        </Col>
                                    </Row>
                                </Form.Group>

                                {currentTask?.taskmeta?.length > 0 &&

                                    currentTask.taskmeta.sort((a, b) => {
                                        // Sort such that 'timeline' comes before 'task_created_updated'
                                        const order = ['timeline', 'task_created_updated'];
                                        return order.indexOf(a.meta_key) - order.indexOf(b.meta_key);
                                    }).map((meta, index) => {
                                        // Conditionally render based on the meta_key value
                                        if (meta.meta_key === 'timeline') {
                                            return (
                                                <Form.Group className="mb-0 mt-3 form-group">
                                                    <Form.Label className="w-100 m-0">
                                                        <small>Timeline</small>
                                                    </Form.Label>
                                                    <div className='timeline--container' key={`timeline-area-${currentTask?._id}`}>
                                                        {
                                                            meta?.meta_value?.length > 0 &&
                                                            meta.meta_value.map((timeline, index) => {
                                                                return (
                                                                    <div className='timeline--blip'>
                                                                        <div className='timeline--blip--line'></div>
                                                                        <div className={`timeline--blip--status workflow--color-${index}`}></div>
                                                                        <div className='blip--container'>
                                                                            <small>{formatDate(timeline?.createdAt)}</small>
                                                                            <p dangerouslySetInnerHTML={{ __html: timeline.message }}></p>
                                                                            {/* <p>Status changed to <strong>in review</strong> by <strong>Php Web1 Experts</strong></p> */}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })

                                                        }

                                                    </div>
                                                </Form.Group>
                                            );
                                        } else if (meta.meta_key === 'task_created_updated') {
                                            return (
                                                <div className='task--cr--status'>
                                                    <p className='mb-0'>Created on: <strong>{timeAgo(meta?.createdAt)} by {meta.meta_value?.created_by}</strong></p>
                                                    {
                                                        meta.meta_value?.updated_by && meta.meta_value?.updated_by !== "" &&
                                                        <p className='mb-0'>Last update: <strong>{timeAgo(meta?.updatedAt)} by {meta.meta_value?.updated_by}</strong></p>
                                                    }

                                                </div>
                                            );
                                        }
                                    })
                                }



                            </Form>
                        </div>
                        <div className="project--form--actions">
                            <h4>Actions</h4>
                            <ListGroup>
                                <ListGroup.Item onClick={() => { dispatch(togglePopups('members', true)) }}><FaPlus />Assign to</ListGroup.Item>
                                <p className="m-0">
                                    {fields['members'] && Object.keys(fields['members']).length > 0 && (
                                        <MemberInitials directUpdate={true} members={fields['members']} showRemove={(memberProfile?.permissions?.projects?.create_edit_delete_task === true || memberProfile?.role?.slug === 'owner') ? true : false} showall={true} showAssign={false} postId={`${currentTask?._id}`} type="task" />
                                    )}
                                </p>

                                <ListGroup.Item onClick={handleUploadShow}><GrAttachment />Attach files</ListGroup.Item>
                                <div className="output--file-preview">
                                    <div className="preview--grid">
                                        {
                                            currentTask && currentTask.files && currentTask.files.length > 0 &&
                                            currentTask.files.map((preview, index) => (
                                                <div key={index}>{renderPreview('old', preview, index)}</div>
                                            ))
                                        }
                                        {imagePreviews.map((preview, index) => (
                                            <div key={`uploaded-preview-${index}`} className="file-preview">{renderPreview('new', preview, index)}</div>
                                        ))}
                                    </div>
                                </div>
                                <ListGroup.Item>
                                    <label onClick={() => { setDatePickerModal(true) }}><FaRegCalendarAlt /> Due date</label>
                                    <label onClick={() => { setDatePickerModal(true) }} className='date--new w-100 mb-0'>{fields['due_date'] ? fields['due_date'] : ''}</label>
                                </ListGroup.Item>
                                <ListGroup.Item onClick={() => { 
                                    if(memberProfile?.permissions?.projects?.update_tasks_order === true || memberProfile?.role?.slug === 'owner'){
                                        setFlowstatus(commonState.currentProject.workflow.tabs); setWorkflowStatus(true) 
                                    }
                                    
                                    }}>
                                    <LuWorkflow />Workflow status
                                    <Form.Group className="mb-0 form-group pb-0">
                                        <Form.Label>
                                            {
                                                commonState.currentProject && commonState.currentProject.workflow && commonState.currentProject.workflow.tabs && commonState.currentProject.workflow.tabs.length > 0 &&
                                                <div className="status--modal" >
                                                    {commonState.currentProject.workflow.tabs.map((status, index) =>
                                                        // Directly compare and return if matched
                                                        status._id === commonState?.taskForm?.tab ? (
                                                            <div key={`status-${index}`} className="status-item">
                                                                <span className={`status--circle workflow--color-${index}`}></span>
                                                                {status.title} <FaChevronDown />
                                                            </div>
                                                        ) : null // Return null for non-matching items
                                                    )}

                                                </div>
                                            }
                                        </Form.Label>
                                    </Form.Group>
                                </ListGroup.Item>
                                <ListGroup.Item className='text-danger' onClick={async () => {
                                    if(memberProfile?.permissions?.projects?.create_edit_delete_task === true || memberProfile?.role?.slug === 'owner'){
                                        setLoader(true)
                                        await dispatch(deleteTask(currentTask._id))
                                        setLoader(false)
                                        dispatch(togglePopups('taskform', false))
                                    }
                                }} disabled={loader}><FaRegTrashAlt
                                    /> {loader ? 'Please wait...' : 'Delete'}</ListGroup.Item>
                            </ListGroup>
                        </div>
                        </>
                        :
                            <>
                                <div className="project--form--inputs" data-tabid={fields['tab']}>
                                    <Form onSubmit={() => { return false }} key={`taskform-${commonState?.taskForm?.tab}`}>
                                        <Form.Group className="mb-0 form-group task--title">
                                            <Form.Label><small>Title</small></Form.Label>
                                            <Form.Control type="text" key={`task-title-${commonState?.taskForm?.tab}`} name="title" placeholder="Task Title" value={fields['title'] || ""} readOnly/>
                                        </Form.Group>

                                        <Form.Group className="mb-0 form-group">
                                            <Form.Label className="w-100 m-0">
                                                <small>Description</small>
                                            </Form.Label>
                                            <div className={isdescEditor ? 'text--editor show--editor' : 'text--editor'}>
                                                <ReactQuill
                                                    value={fields['description'] || ''}
                                                    disabled
                                                    readOnly
                                                    ref={quillRef}
                                                    modules={modules}
                                                    formats={formats}
                                                />
                                            </div>
                                        </Form.Group>

                                        <Form.Group className="mb-0 form-group pb-0">
                                            <Form.Label className="w-100 m-0">
                                                <small>Subtasks</small>
                                            </Form.Label>
                                        </Form.Group>

                                        <div className='subtasks-List'>
                                            <ul
                                                id={`subtasks-ul`}
                                                className="subtasks--list"
                                            >
                                                {
                                                    subtasks && subtasks.length > 0 &&
                                                    subtasks.map((subtask, index) => (

                                                        <li>
                                                            <Form.Group className="mb-0 form-group pb-0" key={`subtask-${index}`}>
                                                                {
                                                                    (typeof subtask === 'object') &&
                                                                    <>
                                                                        <GrDrag />
                                                                        <input type='checkbox' checked={
                                                                            subtask?.status || false
                                                                        } />
                                                                    </>
                                                                }
                                                                    <div  className="form-control"
                                                                                contentEditable={typeof subtask === 'object' && enablesubtaskedit[subtask._id] === true}
                                                                                suppressContentEditableWarning={true}
                                                                                
                                            
                                                                                onClick={(e) => {
                                                                                    if (e.target.tagName === 'A') {
                                                                                        e.stopPropagation();
                                                                                        return;
                                                                                    }
                                                                                    const selection = window.getSelection();
                                                                                    if (selection && selection.type === 'Range') {
                                                                                        // User is selecting text, so don't move the caret
                                                                                        return;
                                                                                    }
                                                                                }}
                                            
                                                                                
                                                                                id={`editable-subtask-${subtask._id}`}
                                                                                style={{
                                                                                    cursor: enablesubtaskedit[subtask._id] ? 'text' : 'pointer',
                                                                                    border: 'none',
                                                                                    padding: '0.5rem 0',
                                                                                    minHeight: '2rem',
                                                                                    overflowWrap: 'break-word',
                                                                                }}
                                                                                placeholder="Enter subtask"
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html: typeof subtask === 'object'
                                                                                        ? makeLinksClickable(String(subtask.title).replace(/\n/g, '<br/>')) // Ensure title is a string
                                                                                        : makeLinksClickable(String(subtask).replace(/\n/g, '<br/>')),      // Ensure subtask is a string
                                                                                }}
                                            
                                                                            >

                                                                        </div>
                                                                    </Form.Group>
                                                                </li>
                                                    ))}
                                                </ul>
                                            </div>
                                                
                                        <Form.Group className="mb-0 mt-3 form-group">
                                            <Form.Label className="w-100 m-0">
                                                <small>Task chat</small>
                                            </Form.Label>
                                            {
                                                currentTask && currentTask.comments && currentTask.comments.length > 0 &&
                                                <Row key={`task-comments-${currentTask?._idß}`}>
                                                    <Col sm={12}>
                                                        {
                                                            currentTask.comments.map((comment, index) => {
                                                                return (
                                                                    <p className='d-flex task--message' key={`comment-${comment._id}`}>
                                                                        <div className='msg-member-info'>
                                                                            {
                                                                                comment?.author?.avatar && comment?.author?.avatar !== null ?

                                                                                    <Image src={comment?.author?.avatar} roundedCircle />
                                                                                    :
                                                                                    <Initials title={comment?.author?.name}>
                                                                                        <span className={`team--initial nm-${comment?.author?.name?.substring(0, 1).toLowerCase()}`}>
                                                                                            {comment?.author?.name?.substring(0, 1).toUpperCase()}
                                                                                        </span>
                                                                                    </Initials>
                                                                            }


                                                                            <div className='msg-view'>
                                                                                <small>{formatTimeAgo(comment?.createdAt)}</small>
                                                                                {/* Render sanitized HTML content */}
                                                                                <p dangerouslySetInnerHTML={{ __html: makeLinksClickable(comment.text) }} />

                                                                            </div>
                                                                        </div>
                                                                    </p>
                                                                )
                                                            })
                                                        }
                                                    </Col>
                                                </Row>
                                            }

                                            
                                        </Form.Group>

                                        {currentTask?.taskmeta?.length > 0 &&

                                            currentTask.taskmeta.sort((a, b) => {
                                                // Sort such that 'timeline' comes before 'task_created_updated'
                                                const order = ['timeline', 'task_created_updated'];
                                                return order.indexOf(a.meta_key) - order.indexOf(b.meta_key);
                                            }).map((meta, index) => {
                                                // Conditionally render based on the meta_key value
                                                if (meta.meta_key === 'timeline') {
                                                    return (
                                                        <Form.Group className="mb-0 mt-3 form-group">
                                                            <Form.Label className="w-100 m-0">
                                                                <small>Timeline</small>
                                                            </Form.Label>
                                                            <div className='timeline--container' key={`timeline-area-${currentTask?._id}`}>
                                                                {
                                                                    meta?.meta_value?.length > 0 &&
                                                                    meta.meta_value.map((timeline, index) => {
                                                                        return (
                                                                            <div className='timeline--blip'>
                                                                                <div className='timeline--blip--line'></div>
                                                                                <div className={`timeline--blip--status workflow--color-${index}`}></div>
                                                                                <div className='blip--container'>
                                                                                    <small>{formatDate(timeline?.createdAt)}</small>
                                                                                    <p dangerouslySetInnerHTML={{ __html: timeline.message }}></p>
                                                                                    {/* <p>Status changed to <strong>in review</strong> by <strong>Php Web1 Experts</strong></p> */}
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })

                                                                }

                                                            </div>
                                                        </Form.Group>
                                                    );
                                                } else if (meta.meta_key === 'task_created_updated') {
                                                    return (
                                                        <div className='task--cr--status'>
                                                            <p className='mb-0'>Created on: <strong>{timeAgo(meta?.createdAt)} by {meta.meta_value?.created_by}</strong></p>
                                                            {
                                                                meta.meta_value?.updated_by && meta.meta_value?.updated_by !== "" &&
                                                                <p className='mb-0'>Last update: <strong>{timeAgo(meta?.updatedAt)} by {meta.meta_value?.updated_by}</strong></p>
                                                            }

                                                        </div>
                                                    );
                                                }
                                            })
                                        }
                                    </Form>
                                </div> 
                                <div className="project--form--actions">
                                    <h4>Actions</h4>
                                    <ListGroup>
                                        <ListGroup.Item><FaPlus />Assign to</ListGroup.Item>
                                        <p className="m-0">
                                            {fields['members'] && Object.keys(fields['members']).length > 0 && (
                                                <MemberInitials directUpdate={false} members={fields['members']} showRemove={false} showall={true} showAssign={false} postId={`${currentTask?._id}`} type="task" />
                                            )}
                                        </p>

                                        <ListGroup.Item><GrAttachment />Attach files</ListGroup.Item>
                                        <div className="output--file-preview">
                                            <div className="preview--grid">
                                                {
                                                    currentTask && currentTask.files && currentTask.files.length > 0 &&
                                                    currentTask.files.map((preview, index) => (
                                                        <div key={index}>{renderPreview('old', preview, index)}</div>
                                                    ))
                                                }
                                                
                                            </div>
                                        </div>
                                        <ListGroup.Item>
                                            <label ><FaRegCalendarAlt /> Due date</label>
                                            <label  className='date--new w-100 mb-0'>{fields['due_date'] ? fields['due_date'] : ''}</label>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <LuWorkflow />Workflow status
                                            <Form.Group className="mb-0 form-group pb-0">
                                                <Form.Label>
                                                    {
                                                        commonState.currentProject && commonState.currentProject.workflow && commonState.currentProject.workflow.tabs && commonState.currentProject.workflow.tabs.length > 0 &&
                                                        <div className="status--modal" >
                                                            {commonState.currentProject.workflow.tabs.map((status, index) =>
                                                                // Directly compare and return if matched
                                                                status._id === commonState?.taskForm?.tab ? (
                                                                    <div key={`status-${index}`} className="status-item">
                                                                        <span className={`status--circle workflow--color-${index}`}></span>
                                                                        {status.title} <FaChevronDown />
                                                                    </div>
                                                                ) : null // Return null for non-matching items
                                                            )}

                                                        </div>
                                                    }
                                                </Form.Label>
                                            </Form.Group>
                                        </ListGroup.Item>
                                        
                                    </ListGroup>
                                </div>
                            </>
                        }
                    </div>
                </Modal.Body>
            </Modal>
            <Modal show={datePickerModal} onHide={() => { setDatePickerModal(false) }}  centered size="md" className="date--picker--modal">
                <Modal.Header closeButton>
                    {/* <Modal.Title>Workflow status</Modal.Title> */}
                </Modal.Header>
                <Modal.Body>
                    <Calendar
                        name="due_date"
                        id='date--picker'
                        value={fields['due_date'] ? parseDateWithoutTimezone(fields['due_date']) : null}
                        onChange={async (value) => {
                            const formattedDate = value.format("YYYY-MM-DD")
                            dispatch(updateStateData(TASK_FORM, { ['due_date']: formattedDate }));
                            setDatePickerModal(false)
                        }
                        }
                        className="form-control"
                        placeholder="dd/mm/yyyy"
                    />
                </Modal.Body>
            </Modal>
            <FilesPreviewModal showPreview={showPreview} imagePreviews={imagePreviews} toggle={setPreviewShow} filetoPreview={filetoPreview} />
            <Modal show={workflowstatus} onHide={() => { setWorkflowStatus(false) }} centered size="md" className="status--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Workflow status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Control type="text" placeholder="Search here" value={search} onChange={handleSearchChange} />
                        </Form.Group>
                    </Form>
                    <ListGroup className="status--list">
                        {
                            filteredStatuses.map((status, index) => (
                                <ListGroup.Item key={`status-${status._id}`} className={commonState?.taskForm?.tab == status._id ? "status--active" : ""} onClick={async () => {
                                    setWorkflowStatus(false)
                                    await dispatch(updateTask(currentTask._id, { tab: status._id }))

                                }}>
                                    <p><span class={`workflow--color-${index} status--circle`}></span> {status.title} {commonState?.taskForm?.tab === status._id && <FaCheck />}</p>
                                </ListGroup.Item>
                            ))}

                    </ListGroup>
                </Modal.Body>
            </Modal>

        </>
    )
}