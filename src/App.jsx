import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import LoginPage from "./pages/login.jsx";
import Home from "./pages/home.jsx";
import AdminPanel from "./pages/admin-panel.jsx";
import UserManagementPage from "./pages/user-management.jsx";
import ControlPanel from "./pages/ControlPanel.jsx";
import ChatbotWidget from './components/chatbot-widget.jsx';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/" component={LoginPage} />
          <Route path="/dashboard" component={Home} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/admin-panel" component={AdminPanel} />
          <Route path="/user-management" component={UserManagementPage} />
          <Route path="/user" component={UserManagementPage} />
           <Route path="/control-panel" component={ControlPanel} />
          <Route>404: Not Found!</Route>
        </Switch>
        <ChatbotWidget />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;