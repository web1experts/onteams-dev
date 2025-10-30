import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, FloatingLabel } from "react-bootstrap";
import { FaPlus, FaRegTimesCircle } from "react-icons/fa";
import { ACTIVE_FORM_TYPE, CURRENT_TASK } from "../../redux/actions/types";
import {
  togglePopups,
  updateStateData
} from "../../redux/actions/common.action";
import {
  ListTasks,
  createTask,
  reorderTasks,
  getTaskById
} from "../../redux/actions/task.action";
import { GrAttachment } from "react-icons/gr";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { getFieldRules, validateField } from "../../helpers/rules";
import { TiInputChecked } from "react-icons/ti";
import { MemberInitials } from "../common/memberInitials";
import { socket } from "../../helpers/auth";
import { hexToRgba } from "../../helpers/commonfunctions";
const TasksList = React.memo((props) => {
  const dispatch = useDispatch();
  const memberProfile = props.memberProfile || {};
  const [fields, setFields] = useState({ title: "" });
  const [errors, setErrors] = useState({});
  const [selectedTask, setSelectedTask] = useState({})
  const commonState = useSelector((state) => state.common);
  const apiResult = useSelector((state) => state.task);
  const [showtaskform, setShowtaskform] = useState({});
  const taskFeed = useSelector((state) => state.task?.tasks);
  const [taskslists, setTasksLists] = useState([]);
  const handleTaskShow = () => dispatch(togglePopups("taskform", true));
  const [currentProject, setCurrentProject] = useState({});
  const [spinner, setSpinner] = useState(false);
  const [loader, setLoader] = useState(false);

  let fieldErrors = {};
  const handleListTasks = async () => {
    await dispatch(ListTasks(commonState?.currentProject?._id));
    setSpinner(false);
  };

  useEffect(() => {
    if (commonState.currentProject) {
      setCurrentProject(commonState.currentProject);
    }

    socket.on("refreshTasks", function (msg) {
      if (commonState.currentProject) {
        dispatch(ListTasks(commonState?.currentProject?._id));
      }
    });
  }, [commonState.currentProject]);

  useEffect(() => {
    if (commonState?.currentProject && commonState?.currentProject?._id) {
      handleListTasks();
      setSpinner(true);
    }
  }, [commonState?.currentProject]);

  useEffect(() => {
    if (taskFeed?.taskData && Object.keys(taskFeed.taskData).length > 0) {
      setTasksLists(taskFeed.taskData);
    }
  }, [taskFeed, dispatch]);

  useEffect(() => {
    if (apiResult.newTask) {
      setTasksLists({
        ...taskslists,
        [apiResult.newTask?.tab]: {
          ...taskslists[apiResult.newTask?.tab],
          tasks: [
            apiResult.newTask,
            ...taskslists[apiResult.newTask?.tab]?.tasks?.filter(
              (task) => task._id !== apiResult.newTask._id
            ),
          ],
        },
      });
    }

    if (apiResult.success) {
      handleListTasks();
      setShowtaskform(false);
    }

  }, [apiResult.newTask]);

  useEffect(() => {
    if (apiResult.UpdatedTask) { 
      setSelectedTask(apiResult.UpdatedTask)
      const newTab = apiResult.UpdatedTask.tab;
      const oldTab = apiResult.tabChangefrom || null;
      const taskId = apiResult.UpdatedTask._id;
      // if (oldTab !== null && oldTab !== false && oldTab !== newTab) {
        setTasksLists((prev) => {
          const existingTasksNewTab = prev[newTab]?.tasks || [];
          const taskExistsInNewTab = existingTasksNewTab.some(
            (task) => task._id === taskId
          );

          let updatedState = {
            ...prev,
            [newTab]: {
              ...prev[newTab],
              tasks: taskExistsInNewTab
                ? existingTasksNewTab.map((task) =>
                    task._id === taskId ? apiResult.UpdatedTask : task
                  )
                : [...existingTasksNewTab, apiResult.UpdatedTask],
            },
          };

          updatedState[newTab].tasks.sort((a, b) => a.order - b.order);

          const existingTasksOldTab = prev[oldTab]?.tasks || [];
          updatedState = {
            ...updatedState,
            [oldTab]: {
              ...prev[oldTab],
              tasks: existingTasksOldTab.filter((task) => task._id !== taskId),
            },
          };

          return updatedState;
        });
     
    }
  },[apiResult.UpdatedTask])

  useEffect(() => {
    if (apiResult.comment) {
      setTasksLists((prev) => {
        const oldTab = selectedTask?.tab;
        const taskId = selectedTask?._id;

        if (!oldTab || !taskId) return prev;

        const existingTasksOldTab = prev[oldTab]?.tasks || [];

        return {
          ...prev,
          [oldTab]: {
            ...prev[oldTab],
            tasks: existingTasksOldTab.map((task) => {
              if (task._id === taskId) {
                return {
                  ...task,
                  comments: [...(task.comments || []), apiResult.comment],
                };
              }
              return task;
            }),
          },
        };
      });
    }
  },[apiResult.comment])

  useEffect(() => {
    if(apiResult.singleTask && Object.keys(apiResult.singleTask)?.length > 0){
      // setSelectedTask(apiResult.singleTask);
       dispatch(
        updateStateData(
          ACTIVE_FORM_TYPE,
          "task_edit"
        )
      );
       dispatch(
        updateStateData(CURRENT_TASK, apiResult.singleTask)
      );
      handleTaskShow();
    }
  },[apiResult.singleTask])


  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const taskId = draggableId.split("-")[1];
    const sourceTabId = source.droppableId.split("-")[1];
    const destinationTabId = destination.droppableId.split("-")[1];
    let replacedTaskId = null;

    const prevState = JSON.parse(JSON.stringify(taskslists));

    try {
      if (sourceTabId === destinationTabId) {
        const reorderedTasks = Array.from(taskslists[sourceTabId]?.tasks);
        replacedTaskId = reorderedTasks[destination.index]?._id;
        // No change
        if (source.index === destination.index) return;

        const [removed] = reorderedTasks.splice(source.index, 1);
        reorderedTasks.splice(destination.index, 0, removed);

        // Check if the new order is actually different
        const hasChanged = reorderedTasks.some(
          (task, idx) => task._id !== taskslists[sourceTabId]?.tasks[idx]?._id
        );
        if (!hasChanged) return;
      //   const updatedTasks = reorderedTasks.map((task, index) => ({
      //   ...task,
      //   order: index,
      // }));

        setTasksLists({
          ...taskslists,
          [sourceTabId]: { ...taskslists[sourceTabId], tasks: reorderedTasks },
        });

        const tasksToUpdate = reorderedTasks.map((task, index) => ({
          task_id: task._id,
          order: index,
          tabId: sourceTabId,
        }));

        if (!navigator.onLine) {
          setTasksLists(prevState);
          return;
        }

        await dispatch(reorderTasks({ tasks: tasksToUpdate, updatedTaskID: taskId }));
      } else {
        const sourceTasks = Array.from(taskslists[sourceTabId]?.tasks);
        const destinationTasks = Array.from(
          taskslists[destinationTabId]?.tasks
        );
        replacedTaskId = destinationTasks[destination.index]?._id;

        const [movedTask] = sourceTasks.splice(source.index, 1);
        destinationTasks.splice(destination.index, 0, movedTask);

        // Check if the task was already in the destination index
        if (
          taskslists[sourceTabId]?.tasks[source.index]?._id ===
            taskslists[destinationTabId]?.tasks[destination.index]?._id &&
          sourceTabId === destinationTabId
        ) {
          return;
        }
         // Update order field for both tabs
        // const updatedSourceTasks = sourceTasks.map((task, index) => ({
        //   ...task,
        //   order: index,
        // }));

        // const updatedDestinationTasks = destinationTasks.map((task, index) => ({
        //   ...task,
        //   order: index,
        // }));
        
         setTasksLists({
          ...taskslists,
          [sourceTabId]: { ...taskslists[sourceTabId], tasks: sourceTasks },
          [destinationTabId]: {
            ...taskslists[destinationTabId],
            tasks: destinationTasks,
          },
        });

        const tasksToUpdate = destinationTasks.map((task, index) => ({
          task_id: task._id,
          order: index,
          tabId: destinationTabId,
          ...(task._id === movedTask._id && { tab_update: true }),
        }));

        if (!navigator.onLine) {
          setTasksLists(prevState);
          return;
        }
        await dispatch(reorderTasks({ tasks: tasksToUpdate, updatedTaskID: taskId }));
      }
    } catch (error) {
      console.error("Reorder failed, rolling back...", error);
      setTasksLists(prevState);
    }
  };

  const handleChange = ({ target: { name, value } }) => {
    setFields({ ...fields, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  function getStyle(style, snapshot) {
    if (snapshot.isDragging) {
      return {
        ...style,
        zIndex: 999, // Keep on top
      };
    }

    if (snapshot.isDropAnimating) {
      return {
        ...style,
        transitionDuration: `0.001s`, // Fast drop
      };
    }
    return style;
  }

  const handleTasksubmit = async (e) => {
    e.preventDefault();
    if (e.type === "submit") {
      const formElements = e.target.elements;
      for (let element of formElements) {
        if (
          element.tagName === "INPUT" ||
          element.tagName === "TEXTAREA" ||
          element.tagName === "SELECT"
        ) {
          element.disabled = true;
        }
      }
    }

    setLoader(true);
    const updatedErrorsPromises = Object.entries(fields).map(
      async ([fieldName, value]) => {
        // Get rules for the current field
        const rules = getFieldRules("task", fieldName);
        // Validate the field
        const error = await validateField("task", fieldName, value, rules);
        // If error exists, return it as part of the resolved promise
        return { fieldName, error };
      }
    );
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
        formData.append(key, value);
      }
      let payload = formData;
      await dispatch(createTask(fields));
      setLoader(false);
      closetask(fields["tab"]);
    }
  };

  const closetask = (tabid) => {
    setShowtaskform({ [tabid]: false });
  };

  return (
    <>
      {spinner && (
        <div className="loading-bar">
          <img src="images/OnTeam-icon-gray.png" className="flipchar" />
        </div>
      )}
      {props.activeTab === "GridView" && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="task--list">
            {currentProject &&
              Object.keys(currentProject).length > 0 &&
              currentProject?.workflow?.tabs?.length > 0 &&
              currentProject?.workflow?.tabs?.map((tab, index) => (
                //workflow--color-${index}
                <div
                  key={tab._id}
                  className={`task--grid`}
                  style={{
                    background: hexToRgba(tab?.color || "#3b82f6", 0.1),
                  }}
                >
                  <h5>
                    {tab.title}
                    {(memberProfile?.permissions?.projects
                      ?.create_edit_delete_task === true ||
                      memberProfile?.role?.slug === "owner") && (
                      <Button
                        variant="dark"
                        onClick={() => {
                          if (
                            !showtaskform[tab._id] ||
                            showtaskform[tab._id] === false
                          ) {
                            setFields({
                              title: "",
                              tab: tab._id,
                              project_id: currentProject?._id,
                              order: 0,
                            });
                            setShowtaskform({ [tab._id]: true });
                          }
                        }}
                      >
                        <FaPlus />
                      </Button>
                    )}
                  </h5>
                  {(memberProfile?.permissions?.projects
                    ?.create_edit_delete_task === true &&
                    memberProfile?.permissions?.projects.update_tasks_order ===
                      true) ||
                  memberProfile?.role?.slug === "owner" ? (
                    <Droppable
                      droppableId={`droppable-${tab._id}`}
                      type="TASKS"
                    >
                      {(provided, snapshot) => (
                        <ul
                          id={`workflow-tab-${tab._id}`}
                          className="tasks--list"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{ overflowY: "auto", height: "100%" }}
                        >
                          {showtaskform[tab._id] &&
                            showtaskform[tab._id] === true && (
                              <li className="task--button">
                                <Form
                                  onSubmit={(e) => {
                                    e.stopPropagation();
                                    handleTasksubmit(e);
                                    //closetask(tab._id)
                                  }}
                                >
                                  <Form.Group className="mb-0 form-group">
                                    <FloatingLabel label="Task Title *">
                                      <Form.Control
                                        type="text"
                                        name="title"
                                        placeholder="Task Title"
                                        onChange={handleChange}
                                        readOnly={loader}
                                      />
                                    </FloatingLabel>
                                    <span
                                      className="close-task"
                                      onClick={() => {
                                        closetask(tab._id);
                                      }}
                                    >
                                      <FaRegTimesCircle />
                                    </span>
                                  </Form.Group>
                                  <Form.Text muted>
                                    Press enter to add
                                  </Form.Text>
                                </Form>
                              </li>
                            )}

                          {taskslists[tab._id]?.tasks &&
                            taskslists[tab._id]?.tasks?.length > 0 &&
                            taskslists[tab._id]?.tasks?.map((task, index) => (
                              <Draggable
                                key={task?._id}
                                draggableId={`task-${task?._id}`}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    key={`${task._id}--item-${index}-${tab._id}`}
                                    className="task--button"
                                    onClick={async () => {
                                      setSpinner(true)
                                      dispatch(getTaskById(task?._id))
                                      setSpinner(false)
                                      setSelectedTask(task)
                                      // await dispatch(
                                      //   updateStateData(
                                      //     ACTIVE_FORM_TYPE,
                                      //     "task_edit"
                                      //   )
                                      // );
                                      // await dispatch(
                                      //   updateStateData(CURRENT_TASK, task)
                                      // );
                                      // handleTaskShow();
                                    }}
                                    style={getStyle(
                                      provided.draggableProps.style,
                                      snapshot
                                    )}
                                  >
                                    <div className="task-card">
                                      {task.title}
                                      <div className="tasks-form-action">
                                        {task.subtasks &&
                                          task.subtasks?.length > 0 && (
                                            <>
                                              <span
                                                className="subtask-count"
                                                key={`subtask-count-${task._id}`}
                                              >
                                                <TiInputChecked />
                                                {
                                                  task.subtasks.filter(
                                                    (subtask) =>
                                                      subtask.status === true
                                                  ).length
                                                }{" "}
                                                / {task.subtasks.length}
                                              </span>
                                            </>
                                          )}
                                        {task.files &&
                                          task.files.length > 0 && (
                                            <>
                                              <span
                                                className="files-count"
                                                key={`files-count-${task._id}`}
                                              >
                                                <GrAttachment />
                                                {task.files.length}
                                              </span>
                                            </>
                                          )}
                                        <p className="m-0 ms-auto">
                                          {task?.members &&
                                            task?.members.length > 0 && (
                                              <MemberInitials
                                                directUpdate={true}
                                                members={task?.members}
                                                showRemove={false}
                                                showAssign={false}
                                                postId={task._id}
                                                type="task"
                                              />
                                            )}
                                        </p>
                                      </div>
                                    </div>
                                  </li>
                                )}
                              </Draggable>
                            ))}

                          {provided.placeholder}
                        </ul>
                      )}
                    </Droppable>
                  ) : memberProfile?.permissions?.projects
                      ?.create_edit_delete_task === true ||
                    memberProfile?.role?.slug === "owner" ? (
                    <ul
                      id={`workflow-tab-${tab._id}`}
                      className="tasks--list"
                      style={{ overflowY: "auto", height: "100%" }}
                    >
                      {showtaskform[tab._id] &&
                        showtaskform[tab._id] === true && (
                          <li className="task--button">
                            <Form
                              onSubmit={(e) => {
                                e.stopPropagation();
                                handleTasksubmit(e);
                              }}
                            >
                              <Form.Group className="mb-0 form-group">
                                <FloatingLabel label="Task Title *">
                                  <Form.Control
                                    type="text"
                                    name="title"
                                    placeholder="Task Title"
                                    onChange={handleChange}
                                    readOnly={loader}
                                  />
                                </FloatingLabel>
                                <span
                                  className="close-task"
                                  onClick={() => {
                                    closetask(tab._id);
                                  }}
                                >
                                  <FaRegTimesCircle />
                                </span>
                              </Form.Group>
                              <Form.Text muted>Press enter to add</Form.Text>
                            </Form>
                          </li>
                        )}

                      {taskslists[tab._id]?.tasks &&
                        taskslists[tab._id]?.tasks?.length > 0 &&
                        taskslists[tab._id]?.tasks?.map((task, index) => (
                          <li
                            className="task--button"
                            onClick={async () => {
                              setSelectedTask(task)
                              await dispatch(
                                updateStateData(ACTIVE_FORM_TYPE, "task_edit")
                              );
                              await dispatch(
                                updateStateData(CURRENT_TASK, task)
                              );
                              handleTaskShow();
                            }}
                          >
                            <div className="task-card">
                              {task.title}
                              <div className="tasks-form-action">
                                {task.subtasks && task.subtasks.length > 0 && (
                                  <>
                                    <span
                                      className="subtask-count"
                                      key={`subtask-count-${task._id}`}
                                    >
                                      <TiInputChecked />
                                      {
                                        task.subtasks.filter(
                                          (subtask) => subtask.status === true
                                        ).length
                                      }{" "}
                                      / {task.subtasks.length}
                                    </span>
                                  </>
                                )}
                                {task.files && task.files.length > 0 && (
                                  <>
                                    <span
                                      className="files-count"
                                      key={`files-count-${task._id}`}
                                    >
                                      <GrAttachment />
                                      {task.files.length}
                                    </span>
                                  </>
                                )}
                                <p className="m-0 ms-auto">
                                  {task?.members &&
                                    task?.members.length > 0 && (
                                      <MemberInitials
                                        directUpdate={true}
                                        members={task?.members}
                                        showRemove={false}
                                        showAssign={false}
                                        postId={task._id}
                                        type="task"
                                      />
                                    )}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  ) : memberProfile?.permissions?.projects
                      .update_tasks_order === true ||
                    memberProfile?.role?.slug === "owner" ? (
                    <Droppable
                      droppableId={`droppable-${tab._id}`}
                      type="TASKS"
                    >
                      {(provided, snapshot) => (
                        <ul
                          id={`workflow-tab-${tab._id}`}
                          className="tasks--list"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{ overflowY: "auto", height: "100%" }}
                        >
                          {taskslists[tab._id]?.tasks &&
                            taskslists[tab._id]?.tasks?.length > 0 &&
                            taskslists[tab._id]?.tasks?.map((task, index) => (
                              <Draggable
                                key={task?._id}
                                draggableId={`task-${task?._id}`}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <li
                                    onClick={async () => {
                                      setSelectedTask(task)
                                      await dispatch(
                                        updateStateData(
                                          ACTIVE_FORM_TYPE,
                                          "task_edit"
                                        )
                                      );
                                      await dispatch(
                                        updateStateData(CURRENT_TASK, task)
                                      );
                                      handleTaskShow();
                                    }}
                                    key={`${task._id}--item-${index}-${tab._id}`}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="task--button"
                                    style={getStyle(
                                      provided.draggableProps.style,
                                      snapshot
                                    )}
                                  >
                                    <div className="task-card">
                                      {task.title}
                                      <div className="tasks-form-action">
                                        {task.subtasks &&
                                          task.subtasks.length > 0 && (
                                            <>
                                              <span
                                                className="subtask-count"
                                                key={`subtask-count-${task._id}`}
                                              >
                                                <TiInputChecked />
                                                {
                                                  task.subtasks.filter(
                                                    (subtask) =>
                                                      subtask.status === true
                                                  ).length
                                                }{" "}
                                                / {task.subtasks.length}
                                              </span>
                                            </>
                                          )}
                                        {task.files &&
                                          task.files.length > 0 && (
                                            <>
                                              <span
                                                className="files-count"
                                                key={`files-count-${task._id}`}
                                              >
                                                <GrAttachment />
                                                {task.files.length}
                                              </span>
                                            </>
                                          )}
                                        <p className="m-0 ms-auto">
                                          {task?.members &&
                                            task?.members.length > 0 && (
                                              <MemberInitials
                                                directUpdate={false}
                                                members={task?.members}
                                                showRemove={false}
                                                showAssign={false}
                                                postId={task._id}
                                                type="task"
                                              />
                                            )}
                                        </p>
                                      </div>
                                    </div>
                                  </li>
                                )}
                              </Draggable>
                            ))}

                          {provided.placeholder}
                        </ul>
                      )}
                    </Droppable>
                  ) : (
                    <ul
                      id={`workflow-tab-${tab._id}`}
                      className="tasks--list"
                      style={{ overflowY: "auto", height: "100%" }}
                    >
                      {taskslists[tab._id]?.tasks &&
                        taskslists[tab._id]?.tasks?.length > 0 &&
                        taskslists[tab._id]?.tasks?.map((task, index) => (
                          <li
                            className="task--button"
                            onClick={async () => {
                              setSelectedTask(task)
                              await dispatch(
                                updateStateData(ACTIVE_FORM_TYPE, "task_edit")
                              );
                              await dispatch(
                                updateStateData(CURRENT_TASK, task)
                              );
                              handleTaskShow();
                            }}
                          >
                            <div className="task-card">
                              {task.title}
                              <div className="tasks-form-action">
                                {task.subtasks && task.subtasks.length > 0 && (
                                  <>
                                    <span
                                      className="subtask-count"
                                      key={`subtask-count-${task._id}`}
                                    >
                                      <TiInputChecked />
                                      {
                                        task.subtasks.filter(
                                          (subtask) => subtask.status === true
                                        ).length
                                      }{" "}
                                      / {task.subtasks.length}
                                    </span>
                                  </>
                                )}
                                {task.files && task.files.length > 0 && (
                                  <>
                                    <span
                                      className="files-count"
                                      key={`files-count-${task._id}`}
                                    >
                                      <GrAttachment />
                                      {task.files.length}
                                    </span>
                                  </>
                                )}
                                <p className="m-0 ms-auto">
                                  {task?.members &&
                                    task?.members.length > 0 && (
                                      <MemberInitials
                                        directUpdate={false}
                                        members={task?.members}
                                        showRemove={false}
                                        showAssign={false}
                                        postId={task._id}
                                        type="task"
                                      />
                                    )}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        </DragDropContext>
      )}
    </>
  );
});

export default TasksList;
