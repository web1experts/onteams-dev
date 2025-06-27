import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { withRouter } from "./Components/wrapper";
import { connect, useDispatch, useSelector } from "react-redux";
import { publicRoutes, privateRoutes, hideSidebarRoutes } from "./routes";
import { socket, currentMemberProfile } from "./helpers/auth";
import { parseIfValidJSON } from "./helpers/commonfunctions";
import SidebarPanel from "./Components/Sidebar/Sidebar";
import { REFRESH_DASHBOARDS } from "./redux/actions/types";
import { isAuth } from "./helpers/auth";
import { refreshUserWorkspace } from "./redux/actions/auth.actions";
import { checkifUserhasworkspace } from "./helpers/commonfunctions";
import ToastAlerts from "./Components/toasts";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Styles/common.css';
import './Styles/Sidebar.css';
import './Styles/ModalStyle.css';
import './App.css';
import {CREATE_POST_LIST_COMMENT, CREATE_LIST_COMMENT, DELETE_COMMENT } from "./redux/actions/types";

const secretKey = process.env.REACT_APP_SECRET_KEY;
function App(props) {

  const token = isAuth();
  const memberProfile = currentMemberProfile()
  const [hideSideBar, setHideSideBar] = useState(true);
  const [loggedIn, setLoggedIn] = useState(token ? true : false);
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState(null);
  const apiResultAuth = useSelector((state) => state.auth);
  const userCompanies = useSelector((state) => state.auth.userCompanies);
  const commonState = useSelector((state) => state.common);
  const [currentMember, setCurrentMember] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const companies = checkifUserhasworkspace();
  const [hasCompanies, setHasCompanies] = useState(
    companies && companies.length > 0 ? true : false
  );


  const dispatch = useDispatch();
  const memberstate = useSelector((state) => state.member);

  const refreshDashboards = () => ({
    type: REFRESH_DASHBOARDS,
  });

  useEffect(() => {
    if (userCompanies) {
      //setupDashboards(userCompanies);
      dispatch(refreshDashboards());
    }
  }, [userCompanies, dispatch]);

  useEffect(() => {
    if (memberstate.currentMember) {
      setCurrentMember(memberstate.currentMember);
    }
  }, [memberstate]);

  useEffect(() => {
    checkIfSidebarShouldBeVisible();
    const token = isAuth();
    if (token) {
      setCurrentLoggedInUser(props.userdata);
      setLoggedIn(true);
    }
  }, [props.userdata]);


  useEffect(() => {
    if (apiResultAuth.profile) {
      const authprofile = apiResultAuth.profile
      if( localStorage.getItem('current_loggedin_user')){
        const jsondata = parseIfValidJSON(localStorage.getItem('current_loggedin_user'));

        if( jsondata){
          jsondata['name'] = authprofile?.name
          jsondata['avatar'] = authprofile?.avatar
          jsondata['name'] = authprofile?.name
          localStorage.setItem('current_loggedin_user', JSON.stringify(jsondata, secretKey));
        }
      }
    }
  }, [apiResultAuth, dispatch]);

  useEffect(() => {
    if (loggedIn) {
      dispatch(refreshUserWorkspace());
    }
  }, [loggedIn, dispatch]);

  useEffect(() => {
    checkIfSidebarShouldBeVisible();
  }, [location]);

  useEffect(() => {
    const handleCommentReceived = (data) => {
      if (data.success) {
        props.createComment(data);
      }
    };

    socket.on('comment_received', handleCommentReceived);

    // Cleanup function to remove the socket listener when the component unmounts
    return () => {
      socket.off('comment_received', handleCommentReceived);
    };

    
  }, [props.createComment]);

  useEffect(() => {
    const handleCommentDeleted = (data) => {
      if (data.success) {
        props.deleteComment(data); // You can dispatch or use props function
      }
    };

    // Listening for the comment_deleted event from the socket
    socket.on('comment_deleted', handleCommentDeleted);

    // Cleanup the event listener when the component unmounts
    return () => {
      socket.off('comment_deleted', handleCommentDeleted);
    };
  }, [dispatch, props.deleteComment]);

 useEffect(() => {
  let themecolor = localStorage.getItem('theme')
  if( !themecolor){
    themecolor = JSON.stringify({
      color: 'linear-gradient(135deg, rgb(30,144,255), rgb(0,191,255))',
      primaryColor: 'rgb(30,144,255)', 
      secondaryColor: 'rgb(0,191,255)'
    })
  }
  const themedata = JSON.parse(themecolor)
  document.documentElement.style.setProperty(
    '--theme-gradient',
    themedata.color
  );
  document.documentElement.style.setProperty(
    '--theme-primary',
    themedata.primaryColor
  );
  document.documentElement.style.setProperty(
    '--theme-secondary',
    themedata.secondaryColor
  );
}, []);

 useEffect(() => {
  if( commonState.current_theme){ console.log('here ',commonState.current_theme)
    document.documentElement.style.setProperty(
      '--theme-gradient',
      commonState.current_theme.color
    );

    document.documentElement.style.setProperty(
      '--theme-primary',
      commonState.current_theme.primaryColor
    );
    document.documentElement.style.setProperty(
      '--theme-secondary',
      commonState.current_theme.secondaryColor
    );

  
  }
  
}, [commonState]);

  /************************   helping functions  ***********************************/
  // Function to determine if the header should be shown
  const showHeader = () => {
    // List all paths where the header should not be shown
    const hideOnPaths = ["/login"]; // Add the path for your login page here
    return !hideOnPaths.includes(location.pathname);
  };

  const islogin = props.loggedIn ? props.loggedIn : loggedIn;
  const userdata = currentLoggedInUser;
  /*******************************************************************************/
  /*****************************    using for dynamic routing  *******************/
  const getRoutes = (routes, _privateRoute) => {
    return routes.map((route, _privateRoute) => {
      // If the route has a 'module' key, check permissions
      if (route.module) {
        const hasPermission =
          memberProfile?.permissions?.[route.module]?.view === true ||
          memberProfile?.role?.slug === 'owner';
  
        if (!hasPermission) return null;
      }
      if (route.route) {
        return (
          <Route
            exact
            path={route.route}
            element={route.component}
            key={route.key}
          />
        );
      }
      return null;
    });
  };

  const doesPathMatch = (pathPattern, pathname) => {
    const patternSegments = pathPattern.split("/").filter(Boolean);
    const pathSegments = pathname.split("/").filter(Boolean);
    if (patternSegments.length !== pathSegments.length) {
      return false;
    }
    return patternSegments.every((segment, index) => {
      return segment.startsWith(":") || segment === pathSegments[index];
    });
  };

  const checkIfSidebarShouldBeVisible = () => {
    const { pathname } = location;
    const hideSideBar = !hideSidebarRoutes.some((route) =>
      doesPathMatch(route, pathname)
    );
    setHideSideBar(hideSideBar);
  };

  /********************************************************************************************/
  return (
    <div className="App">
       <section className={`module__wrapper ${window.location.pathname.replace(/^\/+|\/+$/g, '')}--page`}>
       {hideSideBar && islogin && 
        <SidebarPanel />
       }
      <ToastAlerts />
      {loggedIn ? (
        <Routes>{getRoutes(privateRoutes)}</Routes>
      ) : (
        <Routes>{getRoutes(publicRoutes)}</Routes>
      )}
      </section>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => ({
  createComment: async payload => { await dispatch({ type: CREATE_POST_LIST_COMMENT, payload }) },
  deleteComment: async payload => { await dispatch({ type: DELETE_COMMENT, payload }) },
  //trackingStatus: async payload => { await dispatch({ type: TIME_TRACKING_STATUS, payload }) }
});

const mapStateToProps = (state) => {
  const { loggedIn, token, userdata } = state.auth;
  return { loggedIn, token, userdata };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));
