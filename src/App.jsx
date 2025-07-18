import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster.jsx";
import LoginPage from "./pages/login.jsx";
import Home from "./pages/home.jsx";
import AdminPanel from "./pages/admin-panel.jsx";
import UserManagementPage from "./pages/user-management.jsx";
import ControlPanel from "./pages/ControlPanel.jsx";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated, useMsal } from "@azure/msal-react";
import ChatbotWidget from './components/chatbot-widget.jsx';
import { Provider, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { loginRequest } from "./authConfig.js";
import { store } from "./redux/store.js";
import setMyDetails from "./redux/me-actions.js";

import { useSelector } from "react-redux";
import NotAuthorized from "./components/ui/not-authorized.jsx";
import fetchWorkspaces from "./redux/workspace-actions.js";

function Router() {
  const user = useSelector((state) => state.me.me);
  const hasBaristaRole = user && Array.isArray(user.roles) && user.roles.includes("barista");

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Home} />
      <Route path="/admin" component={hasBaristaRole ? AdminPanel : NotAuthorized}
      />
      <Route path="/admin/source" component={hasBaristaRole ? AdminPanel : NotAuthorized}
      />
      <Route path="/admin/source/edit/:id" component={hasBaristaRole ? AdminPanel : NotAuthorized}
      />
      <Route path="/admin-panel" component={hasBaristaRole ? AdminPanel : NotAuthorized}
      />
      <Route path="/user-management" component={UserManagementPage} />
      <Route path="/user" component={UserManagementPage} />
      <Route path="/control-panel" component={ControlPanel} />
      <Route>404: Not Found!</Route>
    </Switch>
  );
}


function Main() {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();
  const [hasRole, setHasRole] = useState(true)
  const workspaces = useSelector((state) => state.workspaces.workspaces);
  const dispatch = useDispatch()
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  function requestProfileData() {
    // Silently acquires an access token which is then attached to a request for MS Graph data
    instance
      .acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })
      .then((response) => {
        dispatch(setMyDetails(response.idTokenClaims))
        if (response.idTokenClaims.roles && response.idTokenClaims.roles.includes("SeismicDoctors")) {
          setHasRole(true)
        }
      });
  }

  useEffect(() => {
    if (isAuthenticated) {
      requestProfileData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0 && workspaces.length === 0) {
      dispatch(fetchWorkspaces(accounts[0].username));
    }
  }, [isAuthenticated, accounts, dispatch, workspaces.length]);

  return (
    <>
      {hasRole ? <AuthenticatedTemplate>
        <QueryClientProvider client={queryClient}>
          <Router />
          <Toaster />
          <ChatbotWidget />
        </QueryClientProvider>
      </AuthenticatedTemplate> :
        <AuthenticatedTemplate>
          Sign is successful but you dont previlaged role to view this app. Try contacting your admin
        </AuthenticatedTemplate>
      }
      <UnauthenticatedTemplate>
        <LoginPage />
      </UnauthenticatedTemplate>
    </>
  )
}

function App() {

  return (
    <Provider store={store}>
      <div className="App">
        <Main />
      </div>
    </Provider>
  );
}


export default App;