import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Col,
  Row,
  Card,
  Button,
  ListGroup,
  Image,
  CardTitle,
  CardBody,
  CardGroup,
  Tab,
  Tabs,
  Modal,
  Form,
  Dropdown,
} from "react-bootstrap";
import { toggleSidebarSmall } from "../../redux/actions/common.action";
import {
  FaRegStar,
  FaDesktop,
  FaRegFileAlt,
  FaQuoteRight,
  FaImage,
  FaRegQuestionCircle,
  FaRegEnvelope,
  FaPlus,
  FaEllipsisV,
} from "react-icons/fa";
import {
  FiShield,
  FiGlobe,
  FiDownload,
  FiUpload,
  FiX,
  FiSend,
  FiYoutube,
} from "react-icons/fi";
import { DeletePost } from "../../helpers/auth";
import { LuVideo } from "react-icons/lu";
import { MdLaptopMac, MdOutlineChatBubbleOutline } from "react-icons/md";
import { BsChat, BsHeart, BsClock, BsHeartFill } from "react-icons/bs";
import { HiOutlineLightningBolt } from "react-icons/hi";
import {
  acceptCompanyinvite,
  listCompanyinvite,
  deleteInvite,
} from "../../redux/actions/members.action";
import {
  createPost,
  ListPosts,
  likePost,
  updatePost,
} from "../../redux/actions/post.action";
import { LuQuote } from "react-icons/lu";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import DateTimeCard from "../common/DateTimeCard";
import {
  convertYouTubeToEmbed,
  getMemberdata,
} from "../../helpers/commonfunctions";
import CommentThread from "../common/CommentThread";
import API from "../../helpers/api";
import { useDropzone } from 'react-dropzone'

dayjs.extend(relativeTime);
function DashboardPage() {
  const dispatch = useDispatch();
  const memberdata = getMemberdata();
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentPostIds, setCommentPostIds] = useState([]);
  const memberstate = useSelector((state) => state.member);
  const invitationsFeed = useSelector((state) => state.member.invitations);
  const postFeed = useSelector((state) => state.post.posts);
  const postApi = useSelector((state) => state.post);
  const [invitationsFeeds, setInvitationsFeed] = useState([]);
  const [selectedPost, setSelectedPost] = useState({});
  const [isEdit, setIseEdit] = useState(false);
  const [quote, setQuote] = useState("");
  const [isActive, setIsActive] = useState(0);
  const commonState = useSelector((state) => state.common);
  const [show, setShow] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loader, setLoader] = useState(false)
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({
    type: "text",
    content: "",
    files: [],
  });
  // const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
  const handleClose = () => {
    setFields({
      type: "text",
      title: "",
      content: "",
      caption: "",
      quote: "",
      quoteAuthor: "",
      videoType: "",
      youtubeUrl: "",
      vimeoUrl: "",
      description: "",
      files: [],
    });
    setShow(false);
    setSelectedPost({});
    setIseEdit(false);
  };
  const handleShow = () => setShow(true);
  const [error, setError] = useState("");

  const removeExistingFile = () => {
    setFields((prev) => {
      const updated = { ...prev };
      delete updated["existing_file"];
      return updated;
    });
  };

  const handlevideoTypeChange = (type) => {
    setFields({
      ...fields,
      ["videoType"]: type,
    });
  };
  const handletypeChange = (type) => {
    if (!isEdit) {
      setFields({
        type: type,
        title: "",
        content: "",
        caption: "",
        imageUrl: "",
        quote: "",
        quoteAuthor: "",
        videoType: "youtube",
        youtubeUrl: "",
        vimeoUrl: "",
        videoUrl: "",
        description: "",
      });
    }
  };

  const handleDelete = (post) => {
    DeletePost(post);
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    setIseEdit(true);
    setShow(true);
  };

  useEffect(() => {
    if (selectedPost) {
      switch (selectedPost?.post_type) {
        case "text":
          setFields({
            type: selectedPost?.post_type,
            title: selectedPost?.title,
            content: selectedPost?.content,
          });
          break;
        case "quote":
          setFields({
            type: selectedPost?.post_type,
            quote: selectedPost?.content,
            quoteAuthor: selectedPost?.quoteAuthor || "",
          });
          break;
        case "image":
          setFields({
            type: selectedPost?.post_type,
            caption: selectedPost?.caption,
            existing_file: selectedPost?.files[0]?.url,
          });
          break;
        case "video":
          if (selectedPost?.videoType === "youtube") {
            setFields({
              type: selectedPost?.post_type,
              description: selectedPost?.description,
              youtubeUrl: selectedPost?.content,
              videoType: selectedPost?.videoType,
            });
          } else if (selectedPost?.videoType === "vimeo") {
            setFields({
              type: selectedPost?.post_type,
              description: selectedPost?.description,
              vimeoUrl: selectedPost?.content,
              videoType: selectedPost?.videoType,
            });
          } else {
            setFields({
              type: selectedPost?.post_type,
              description: selectedPost?.description,
              existing_file: selectedPost?.files[0]?.url,
              videoType: selectedPost?.videoType,
            });
          }

          break;
        default:
          break;
      }
    }
  }, [selectedPost]);

  const handleTextChange = ({ target: { name, value, type } }) => {
    setFields({ ...fields, [name]: value });
  };
  const removeFile = (index) => {
    const newFiles = [...fields.files];
    newFiles.splice(index, 1);
    setFields({ ...fields, files: newFiles });
  };
  const handleupdate = async () => {
    const {
      type,
      title,
      content,
      caption,
      quote,
      quoteAuthor,
      videoType,
      youtubeUrl,
      vimeoUrl,
      description,
      files,
    } = fields;

    // Basic validation
    if (!type) {
      setError("Please select a post type.");
      return;
    }

    if (type === "text" && !content.trim()) {
      setError("Fields marked with an asterisk (*) are mandatory.");
      return;
    }

    if (type === "quote" && !quote.trim()) {
      setError("Fields marked with an asterisk (*) are mandatory.");
      return;
    }

    if (
      type === "image" &&
      !fields.existing_file &&
      (!files || files.length === 0)
    ) {
      setError("Fields marked with an asterisk (*) are mandatory.");
      return;
    }

    if (type === "video") {
      if (!videoType) {
        setError("Fields marked with an asterisk (*) are mandatory.");
        return;
      }

      if (videoType === "youtube" && !youtubeUrl.trim()) {
        setError("Fields marked with an asterisk (*) are mandatory.");
        return;
      }

      if (videoType === "vimeo" && !vimeoUrl.trim()) {
        setError("Fields marked with an asterisk (*) are mandatory.");
        return;
      }

      if (
        videoType === "upload" &&
        !fields.existing_file &&
        (!files || files.length === 0)
      ) {
        setError("Fields marked with an asterisk (*) are mandatory.");
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("type", type);

      if (type === "text") {
        formData.append("title", title || "");
        formData.append("content", content);
      }

      if (type === "quote") {
        formData.append("quote", quote);
        formData.append("quoteAuthor", quoteAuthor || "");
      }

      if (type === "image") {
        formData.append("caption", caption || "");
      }

      if (type === "video") {
        formData.append("videoType", videoType);
        formData.append("description", description || "");

        if (videoType === "youtube") {
          formData.append("youtubeUrl", youtubeUrl);
        }

        if (videoType === "vimeo") {
          formData.append("vimeoUrl", vimeoUrl);
        }
      }

      // Attach files if present
      if (files && files.length > 0) {
        files.forEach((file) => formData.append("files", file));
      } else {
        if (type === "image" || (type === "video" && videoType === "upload")) {
          formData.append("existing_file", fields?.existing_file);
        }
      }

      // Dispatch the post creation
      const res = await dispatch(updatePost(selectedPost?._id, formData));

      // Add the new post to the top of the list
      if (res?.post) {
        setPosts((prevPosts) => [res.post, ...prevPosts]);
      }

      // Reset and close modal
      handleClose();
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const {
      type,
      title,
      content,
      caption,
      quote,
      quoteAuthor,
      videoType,
      youtubeUrl,
      vimeoUrl,
      description,
      files,
    } = fields;

    // Basic validation
    if (!type) {
      setError("Please select a post type.");
      return;
    }

    if (type === "text" && !content.trim()) {
      setError("Fields marked with an asterisk (*) are mandatory.");
      return;
    }

    if (type === "quote" && !quote.trim()) {
      setError("Fields marked with an asterisk (*) are mandatory.");
      return;
    }

    if (type === "image" && (!files || files.length === 0)) {
      setError("Fields marked with an asterisk (*) are mandatory.");
      return;
    }

    if (type === "video") {
      if (!videoType) {
        setError("Fields marked with an asterisk (*) are mandatory.");
        return;
      }

      if (videoType === "youtube" && !youtubeUrl.trim()) {
        setError("Fields marked with an asterisk (*) are mandatory.");
        return;
      }

      if (videoType === "vimeo" && !vimeoUrl.trim()) {
        setError("Fields marked with an asterisk (*) are mandatory.");
        return;
      }

      if (videoType === "upload" && (!files || files.length === 0)) {
        setError("Fields marked with an asterisk (*) are mandatory.");
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("type", type);

      if (type === "text") {
        formData.append("title", title || "");
        formData.append("content", content);
      }

      if (type === "quote") {
        formData.append("quote", quote);
        formData.append("quoteAuthor", quoteAuthor || "");
      }

      if (type === "image") {
        formData.append("caption", caption || "");
      }

      if (type === "video") {
        formData.append("videoType", videoType);
        formData.append("description", description || "");

        if (videoType === "youtube") {
          formData.append("youtubeUrl", youtubeUrl);
        }

        if (videoType === "vimeo") {
          formData.append("vimeoUrl", vimeoUrl);
        }
      }

      // Attach files if present
      if (files && files.length > 0) {
        files.forEach((file) => formData.append("files", file));
      }

      // Dispatch the post creation
      const res = await dispatch(createPost(formData));

      // Add the new post to the top of the list
      if (res?.post) {
        setPosts((prevPosts) => [res.post, ...prevPosts]);
      }

      // Reset and close modal
      handleClose();
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isPostLikedByMember = (likes = [], memberId) => {
    return likes.some((like) => like.member === memberId);
  };

  const handleFileChange = (e) => {
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    const fileList = Array.from(e.target.files);
    // const accepted =
    //   fields.type === "image"
    //     ? fileList.filter((f) => f.type.startsWith("image/"))
    //     : fileList.filter((f) => f.type.startsWith("video/"));
    let typeError = false;
  let sizeError = false;

  const accepted =
    fields.type === "image"
      ? fileList.filter((f) => {
          if (!f.type.startsWith("image/")) {
            typeError = true;
            return false;
          }
          if (f.size > maxSize) {
            sizeError = true;
            return false;
          }
          return true;
        })
      : fileList.filter((f) => {
          if (!f.type.startsWith("video/")) {
            typeError = true;
            return false;
          }
          if (f.size > maxSize) {
            sizeError = true;
            return false;
          }
          return true;
        });

  if (typeError && sizeError) {
    setError(`Some files are of the wrong type and exceed 10MB.`);
  } else if (typeError) {
    setError(`Only ${fields.type} files are allowed.`);
  } else if (sizeError) {
    setError(`File size must be 10MB or less.`);
  } else {
      setError("");
    

      setFields({ ...fields, files: accepted });
      setError("");

      if (isEdit) {
        setFields((prev) => {
          const updated = { ...prev };
          delete updated["existing_file"];
          return updated;
        });
      }
    }
  };
  const handlePosts = async () => {
    await dispatch(ListPosts());
  };

  const handleInvitationList = async () => {
    await dispatch(listCompanyinvite());
  };

  const getQuote = async () => {
    const response = await API.apiGet("quote");
    if (response.data && response.data.success) {
      setQuote(response.data.quote);
    }
  };

  useEffect(() => {
    const check = ["undefined", undefined, "null", null, ""];

    if (invitationsFeed && invitationsFeed.inviteData) {
      setInvitationsFeed(invitationsFeed.inviteData);
    }
  }, [invitationsFeed]);

  useEffect(() => {
    if (postFeed) {
      setPosts(postFeed);
    }
  }, [postFeed]);

  useEffect(() => {
    if (postApi.singlePost) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postApi.singlePost._id ? postApi.singlePost : post
        )
      );
    }

    if (postApi.createPost) {
      setPosts((prevPosts) => [postApi.createPost, ...prevPosts]);
    }
    if (postApi.deletePost) {
      console.log("deletePost:: ", postApi.deletePost);
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post._id !== postApi.deletePost)
      );
    }
  }, [postApi]);

  const acceptInvite = (token) => {
    dispatch(acceptCompanyinvite({ token: token }));
    setLoader(false)
  };

  const rejectInvite = (inviteId) => {
    dispatch(deleteInvite(inviteId));
  };

  useEffect(() => {
    if (memberstate.invite) {
      handleInvitationList();
    }
  }, [memberstate]);

  useEffect(() => {
    setTimeout(function(){
      handleInvitationList();
      handlePosts();
      getQuote();
    },1500)
  }, []);

  const handleLike = async (postId) => {
    try {
      dispatch(likePost(postId));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  return (
    <>
      <div
        className={
          isActive === 1
            ? "show--details team--page dashboard--page"
            : isActive === 2
            ? " view--project team--page dashboard--page"
            : "team--page dashboard--page"
        }
      >
        <div className="page--wrapper px-md-2 pb-4 pt-4 text-center">
          <Container fluid>
            <Row className="justify-content-center">
              <Col sm={12}>
                <DateTimeCard />
                <ListGroup className="invitation--list">
                  {invitationsFeeds &&
                    invitationsFeeds.length > 0 &&
                    invitationsFeeds.map((invitation, index) => {
                      return (
                        <>
                          <ListGroup.Item>
                            <p className="mb-0">
                              You got an invitation from{" "}
                              <strong>{invitation.company?.name}</strong> to
                              join their team as a &nbsp;
                              <strong>
                                {invitation.role?.name?.replace(
                                  /\b\w/g,
                                  function (char) {
                                    return char.toUpperCase();
                                  }
                                )}
                              </strong>
                            </p>
                            <div className="ms-lg-auto mt-3 mt-lg-0">
                              <Button
                                onClick={() => rejectInvite(invitation._id)}
                                className="me-2"
                                variant="secondary"
                              >
                                Decline
                              </Button>
                              <Button
                                onClick={() =>
                                {
                                  setLoader(true)
                                  acceptInvite(invitation.inviteToken)
                                }
                                  
                                }
                                disabled={loader}
                                variant="primary"
                              >
                                {
                                  loader ? 'Please wait...' : 'Accept'
                                }
                              </Button>
                            </div>
                          </ListGroup.Item>
                        </>
                      );
                    })}
                </ListGroup>
              </Col>
              <Col xl={8}>
                <Card className="daily--star">
                  <div className="card--icon">
                    <div className="star--icon">
                      <FaRegStar color="white" />
                    </div>
                    <h6 className="mb-0">Daily Inspiration</h6>
                  </div>
                  <blockquote className="blockquote mb-0">
                    <div dangerouslySetInnerHTML={{ __html: quote }} />
                  </blockquote>
                </Card>

                <Card className="p-4 border-0 rounded-4 team--updates">
                  <Row className="align-items-center mb-4">
                    <Col xs="auto">
                      <div
                        className="team--chat p-2 rounded d-flex align-items-center justify-content-center"
                        style={{ width: 48, height: 48 }}
                      >
                        <BsChat color="white" />
                      </div>
                    </Col>
                    <Col>
                      <h5 className="mb-0 d-flex align-items-center justify-content-between">
                        Team Updates{" "}
                        <Button onClick={handleShow} variant="primary">
                          <FaPlus />
                        </Button>
                      </h5>
                    </Col>
                  </Row>

                  {!posts || posts.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <p>No team updates yet.</p>
                    </div>
                  ) : (
                    posts.map((post) => {
                      const isLiked = isPostLikedByMember(
                        post.likes,
                        memberdata?._id
                      );
                      const isCommentBoxOpen = commentPostIds.includes(post._id);
                      return (
                        <Card
                          key={post._id}
                          className="mb-4 p-3 rounded-4 inner--card"
                        >
                          <Row className="mb-2">
                            <Col sm={12}>
                              <div className="d-flex align-items-center gap-3">
                                <div className="update--image">
                                  <Image
                                    src={
                                      post.author?.avatar ||
                                      "/images/default.jpg"
                                    }
                                    roundedCircle
                                  />
                                </div>
                                <strong>
                                  {post.author?.name || "Unknown"}{" "}
                                  <span
                                    className="text-muted d-block"
                                    style={{ fontSize: "0.875rem" }}
                                  >
                                    • {dayjs(post.createdAt).fromNow()}
                                  </span>
                                </strong>{" "}
                                {memberdata?._id === post.author?._id && (
                                  <Dropdown className="edit--dropdown">
                                    <Dropdown.Toggle variant="dark">
                                      <FaEllipsisV />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                      <Dropdown.Item
                                        onClick={() => handleEdit(post)}
                                      >
                                        Edit
                                      </Dropdown.Item>
                                      <Dropdown.Item
                                        onClick={() => handleDelete(post?._id)}
                                      >
                                        Delete
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                )}
                              </div>
                              <div className="comment--body">
                                <div className="mt-3">
                                  {/* Text Post */}
                                  {post.post_type === "text" && (
                                    <>
                                      {post.title && <h5>{post.title}</h5>}
                                      <p>{post.content}</p>
                                    </>
                                  )}

                                  {/* Image Post */}
                                  {post.post_type === "image" && (
                                    <>
                                      {post.caption && <p>{post.caption}</p>}
                                      {Array.isArray(post.files) &&
                                        post.files.map((img, i) => (
                                          <Image
                                            key={i}
                                            src={img.url}
                                            alt={img.file_name}
                                            fluid
                                            className="rounded"
                                          />
                                        ))}
                                    </>
                                  )}

                                  {/* Quote Post */}
                                  {post.post_type === "quote" && (
                                    <blockquote className="blockquote p-3 rounded mt-3">
                                      <LuQuote className="me-2" />
                                      <p
                                        className="mb-0"
                                        style={{ fontStyle: "italic" }}
                                      >
                                        {post.content}
                                      </p>
                                      {post?.quoteAuthor && (
                                        <p>
                                          <strong>- {post.quoteAuthor}</strong>
                                        </p>
                                      )}
                                    </blockquote>
                                  )}

                                  {/* Video Post */}
                                  {post.post_type === "video" && (
                                    <>
                                      {post.videoType === "youtube" && (
                                        <div className="ratio ratio-16x9 mb-2 rounded-3 w-100">
                                          <iframe
                                            key={`video-post-${post.content}-0`}
                                            src={convertYouTubeToEmbed(
                                              post.content
                                            )}
                                            title="YouTube Video"
                                            allowFullScreen
                                          ></iframe>
                                        </div>
                                      )}
                                      {post.videoType === "vimeo" && (
                                        <div className="ratio ratio-16x9 mb-2 rounded-3 w-100">
                                          <iframe
                                            key={`video-post-${post.content}-0`}
                                            src={post.content}
                                            title="Vimeo Video"
                                            allowFullScreen
                                          ></iframe>
                                        </div>
                                      )}
                                      {post.videoType === "upload" &&
                                        Array.isArray(post.files) &&
                                        post.files.map((vid, i) => (
                                          <video
                                            key={`video-post-${vid.url}-${i}`}
                                            controls
                                            className="mb-2 rounded-3 w-100"
                                          >
                                            <source
                                              src={`${vid.url}?t=${Date.now()}`}
                                              type="video/mp4"
                                            />
                                            Your browser does not support the
                                            video tag.
                                          </video>
                                        ))}
                                      {post.description && (
                                        <p>{post.description}</p>
                                      )}
                                    </>
                                  )}
                                </div>

                                {/* Likes / Comments */}
                                <div className="d-flex gap-3 text-muted mt-3 align-items-center">
                                  <span className="icon--heart">
                                    {isLiked ? (
                                      <BsHeartFill
                                        onClick={() => handleLike(post._id)}
                                        className="me-1 filled--heart"
                                      />
                                    ) : (
                                      <BsHeart
                                        onClick={() => handleLike(post._id)}
                                        className="me-1"
                                      />
                                    )}
                                    {post.likes?.length || 0}
                                  </span>
                                  <span
                                    className="open--comment"
                                    onClick={() => {
                                      setCommentPostIds((prev) => {
                                        if (prev.includes(post._id)) {
                                          // remove id if it already exists
                                          return prev.filter((id) => id !== post._id);
                                        } else {
                                          // add id if it doesn't exist
                                          return [...prev, post._id];
                                        }
                                      });
                                    }}

                                  >
                                    <BsChat className="me-1" />{" "}
                                    {post?.comments?.length || 0}
                                  </span>
                                </div>
                                {isCommentBoxOpen && (
                                  <CommentThread
                                    comments={post?.comments}
                                    post={post._id}
                                    toggle={() => {
                                       setCommentPostIds((prev) => {
                                        if (prev.includes(post._id)) {
                                          // remove id if it already exists
                                          return prev.filter((id) => id !== post._id);
                                        }
                                      });
                                    }}
                                  />
                                )}

                                {/* {showCommentBox && (
                                  <CommentThread
                                    comments={post?.comments}
                                    post={commentPostId}
                                    toggle={setShowCommentBox}
                                  />
                                )} */}
                              </div>
                            </Col>
                          </Row>
                        </Card>
                      );
                    })
                  )}
                </Card>
              </Col>
              <Col xl={4} className="pb-2 pb-lg-0">
                <div className="sticky--right">
                  <div className="download--wrapper">
                    <div className="app--title">
                      <div className="image--title">
                        <span>
                          <BsClock />
                        </span>
                        <h3>
                          Time Tracker Apps{" "}
                          <small>Professional time tracking suite</small>
                        </h3>
                      </div>
                      <p className="heading--text">
                        Download our award-winning desktop app and install it on
                        your computer to track your work.
                      </p>
                      <CardGroup>
                        <Card className="track--features">
                          <CardTitle>
                            <span>
                              <HiOutlineLightningBolt />
                            </span>
                            Fast
                          </CardTitle>
                        </Card>
                        <Card className="track--features Enterprise">
                          <CardTitle>
                            <span>
                              <FiShield />
                            </span>
                            Secure
                          </CardTitle>
                        </Card>
                        <Card className="track--features global">
                          <CardTitle>
                            <span>
                              <FiGlobe />
                            </span>
                            Global Sync
                          </CardTitle>
                        </Card>
                        <Card className="track--features rating">
                          <CardTitle>
                            <span>
                              <FiGlobe />
                            </span>
                            4.7 Rating
                          </CardTitle>
                        </Card>
                      </CardGroup>
                    </div>
                    <CardGroup className="card--download">
                      <Card className="win--download app--download">
                        <Card.Link
                          href="/downloads/primeteams-win32-ia32.zip"
                          download
                        >
                          <CardTitle>
                            <span>
                              <FaDesktop />
                            </span>
                            <h4>
                              Windows App <small>Windows 10/11</small>
                            </h4>
                          </CardTitle>
                          <CardBody>
                            <FiDownload />
                          </CardBody>
                        </Card.Link>
                      </Card>
                      <Card className="mac--download app--download">
                        <Card.Link
                          href="/downloads/primeteams-darwin-x64.zip"
                          download
                        >
                          <CardTitle>
                            <span>
                              <MdLaptopMac />
                            </span>
                            <h4>
                              macOS App <small>macOS Monterey and later</small>
                            </h4>
                          </CardTitle>
                          <CardBody>
                            <FiDownload />
                          </CardBody>
                        </Card.Link>
                      </Card>
                    </CardGroup>
                  </div>
                  <div className="download--wrapper mt-5">
                    <div className="image--title help--card">
                      <span>
                        <FaRegQuestionCircle />
                      </span>
                      <h3>
                        Need Support? <small>We're here to help you</small>
                      </h3>
                    </div>
                    <div className="latest--version">
                      <Container>
                        <Card className="new--card">
                          <Card.Body className="p-2">
                            <h5 className="fw-bold mb-3">
                              <FaRegEnvelope /> Email Support
                            </h5>
                            <ListGroup variant="flush">
                              <ListGroup.Item className="border-0 ps-0">
                                Get help via email within 24 hours
                              </ListGroup.Item>
                              <ListGroup.Item className="border-0 ps-0">
                                <strong>
                                  <a href="mailto:support@primeteams.ai">
                                    support@primeteams.ai
                                  </a>
                                </strong>
                              </ListGroup.Item>
                            </ListGroup>
                          </Card.Body>
                        </Card>
                        <Button
                          variant="primary"
                          className="w-100 my-3"
                          onClick={() => {
                            if (window.Tawk_API?.toggle) {
                              window.Tawk_API.toggle();
                            }
                          }}
                        >
                          <MdOutlineChatBubbleOutline /> Start Live Chat
                        </Button>
                        <p className="mb-0">
                          Average response time: <strong>2 minutes</strong>
                        </p>
                      </Container>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        centered
        size="lg"
        className="theme--modal"
      >
        <Modal.Header closeButton className="py-3">
          <Modal.Title>
            <span className="nav--item--icon">
              <FiSend />
            </span>
            <strong>
              Share Team Update{" "}
              <small>Share your progress, thoughts, or inspiration</small>
            </strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Tabs
            defaultActiveKey="text"
            id="icon-tabs"
            activeKey={fields?.type}
            onSelect={(k) => handletypeChange(k)}
          >
            <Tab
              eventKey="text"
              title={
                <span>
                  <FaRegFileAlt /> Text
                </span>
              }
            >
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Title (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Add a title to your post..."
                    name="title"
                    value={fields?.title}
                    onChange={handleTextChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Content <sup className="text-danger">*</sup>
                  </Form.Label>
                  <Form.Control
                    required
                    as="textarea"
                    placeholder="What's happening with you work? Share updates, achievements, or insights..."
                    rows={5}
                    name="content"
                    value={fields?.content}
                    onChange={handleTextChange}
                  />
                </Form.Group>
              </Form>
            </Tab>
            <Tab
              eventKey="quote"
              title={
                <span>
                  <FaQuoteRight /> Quote
                </span>
              }
            >
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Add a Quote</Form.Label>
                  <Form.Control
                    as="textarea"
                    placeholder="Share an inspiring quote or meaningful message..."
                    rows={5}
                    name="quote"
                    value={fields?.quote}
                    onChange={handleTextChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Author (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Quote author..."
                    name="quoteAuthor"
                    value={fields?.quoteAuthor}
                    onChange={handleTextChange}
                  />
                </Form.Group>
              </Form>
            </Tab>
            <Tab
              eventKey="image"
              title={
                <span>
                  <FaImage /> Image
                </span>
              }
            >
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Upload Image <sup className="text-danger">*</sup>
                  </Form.Label>
                  <label
                    for="imageUpload"
                    className="update--file--upload"
                    onChange={handleFileChange}
                    accept="image/*"
                  >
                    <Form.Control
                      type="file"
                      multiple
                      id="imageUpload"
                      hidden
                    />
                    <span>
                      <FiUpload /> Click to upload an image{" "}
                      <small>PNG, JPG, GIF up to 10MB</small>
                    </span>
                  </label>
                  <div className="mt-3 d-flex flex-wrap gap-3">
                    {fields?.files?.map((file, idx) => (
                      <div key={idx} className="position-relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          width="100"
                          height="100"
                          style={{ objectFit: "cover", borderRadius: 8 }}
                        />
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => removeFile(idx)}
                          className="position-absolute top-0 end-0 p-1"
                        >
                          <FiX size={14} />
                        </Button>
                      </div>
                    ))}

                    {fields?.existing_file && fields?.type === "image" && (
                      <div key={`1-file`} className="position-relative">
                        <img
                          src={fields?.existing_file}
                          alt="preview"
                          width="100"
                          height="100"
                          style={{ objectFit: "cover", borderRadius: 8 }}
                        />
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => removeExistingFile()}
                          className="position-absolute top-0 end-0 p-1"
                        >
                          <FiX size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Caption</Form.Label>
                  <Form.Control
                    as="textarea"
                    placeholder="Add a caption to your image..."
                    rows={5}
                    value={fields?.caption}
                    name="caption"
                    onChange={handleTextChange}
                  />
                </Form.Group>
              </Form>
            </Tab>
            <Tab
              eventKey="video"
              title={
                <span>
                  <LuVideo /> Video
                </span>
              }
            >
              <Form>
                <Form.Label>Video Type</Form.Label>
                <Tabs
                  defaultActiveKey="youtube"
                  id="video--type"
                  activeKey={fields?.videoType}
                  onSelect={(k) => handlevideoTypeChange(k)}
                >
                  <Tab
                    eventKey="youtube"
                    title={
                      <span>
                        <FiYoutube /> Youtube
                      </span>
                    }
                  >
                    <Form.Group className="mb-3">
                      <Form.Label>
                        YouTube URL <sup className="text-danger">*</sup>
                      </Form.Label>
                      <Form.Control
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={fields?.youtubeUrl}
                        name="youtubeUrl"
                        onChange={handleTextChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={fields?.description}
                        onChange={handleTextChange}
                        placeholder="Why are you sharing this video?"
                        rows={5}
                      />
                    </Form.Group>
                  </Tab>
                  <Tab
                    eventKey="vimeo"
                    title={
                      <span>
                        <LuVideo /> Vimeo
                      </span>
                    }
                  >
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Vimeo URL <sup className="text-danger">*</sup>
                      </Form.Label>
                      <Form.Control
                        type="url"
                        placeholder="https://vimeo.com/..."
                        value={fields?.vimeoUrl}
                        name="vimeoUrl"
                        onChange={handleTextChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={fields?.description}
                        onChange={handleTextChange}
                        placeholder="Why are you sharing this video?"
                        rows={5}
                      />
                    </Form.Group>
                  </Tab>
                  <Tab
                    eventKey="upload"
                    title={
                      <span>
                        <FiUpload /> Upload
                      </span>
                    }
                  >
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Upload Video <sup className="text-danger">*</sup>
                      </Form.Label>
                      <label for="videoUpload" className="update--file--upload">
                        <Form.Control
                          type="file"
                          id="videoUpload"
                          hidden
                          accept="video/mp4"
                          onChange={handleFileChange}
                        />
                        <span>
                          <FiUpload /> Click to upload a video{" "}
                          <small>MP4, MOV, AVI up to 100MB</small>
                        </span>
                      </label>
                      <div className="mt-3">
                        {fields?.files?.map((file, idx) => (
                          <div
                            key={idx}
                            className="d-flex align-items-center justify-content-between mb-2"
                          >
                            <div>
                              <strong>{file.name}</strong> –{" "}
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => removeFile(idx)}
                            >
                              <FiX />
                            </Button>
                          </div>
                        ))}
                        {fields?.existing_file && (
                          <div key={`video-file`} className="position-relative">
                            <video
                              key="0"
                              className="mb-2 rounded-3 w-100"
                              style={{
                                objectFit: "cover",
                                borderRadius: 8,
                                pointerEvents: "none",
                              }}
                              preload="metadata"
                              muted
                              playsInline
                            >
                              <source
                                src={fields?.existing_file}
                                type="video/mp4"
                              />
                              Your browser does not support the video tag.
                            </video>

                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => removeExistingFile()}
                              className="position-absolute top-0 end-0 p-1"
                            >
                              <FiX size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={fields?.description}
                        onChange={handleTextChange}
                        placeholder="Why are you sharing this video?"
                        rows={5}
                      />
                    </Form.Group>
                  </Tab>
                </Tabs>
              </Form>
            </Tab>
          </Tabs>
          <p className="text-danger">
            <small>{error}</small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              if (selectedPost && Object.keys(selectedPost).length > 0) {
                handleupdate();
              } else {
                handleSubmit();
              }
            }}
            disabled={loading}
          >
            <FiSend /> {loading ? "Sharing..." : "Share Update "}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DashboardPage;
