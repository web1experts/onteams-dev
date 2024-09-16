import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { withRouter } from "./Components/wrapper";
import { connect, useDispatch, useSelector } from "react-redux";
import { publicRoutes, privateRoutes, hideSidebarRoutes } from "./routes";
import { parseIfValidJSON } from "./helpers/commonfunctions";
import SidebarPanel from "./Components/Sidebar/Sidebar";
import { REFRESH_DASHBOARDS } from "./redux/actions/types";
import {
  socket,
  isAuth,
  encryptJsonData,
  decryptJsonData,
  setupDashboards,
} from "./helpers/auth";
import { refreshUserWorkspace } from "./redux/actions/auth.actions";
import { checkifUserhasworkspace } from "./helpers/commonfunctions";
import ToastAlerts from "./Components/toasts";
import 'react-select2-wrapper/css/select2.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Styles/common.css';
import './Styles/Sidebar.css';
import './Styles/ModalStyle.css';
import './App.css';


const secretKey = process.env.REACT_APP_SECRET_KEY;
function App(props) {

  const token = isAuth();
  const [hideSideBar, setHideSideBar] = useState(true);
  const [loggedIn, setLoggedIn] = useState(token ? true : false);
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState(null);
  const apiResultAuth = useSelector((state) => state.auth);
  const userCompanies = useSelector((state) => state.auth.userCompanies);
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

    // socket.on("userStatusUpdate", (data) => {
    //   props.trackingStatus(data);
    // });
  }, [props.userdata]);

  // useEffect(() => {
  //   checkIfSidebarShouldBeVisible();
  // }, []);

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
  //trackingStatus: async payload => { await dispatch({ type: TIME_TRACKING_STATUS, payload }) }
});

const mapStateToProps = (state) => {
  const { loggedIn, token, userdata } = state.auth;
  return { loggedIn, token, userdata };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));
