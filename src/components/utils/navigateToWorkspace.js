export function navigateToWorkspace(wsId, location, wouterNavigate) {
  if (wsId) {
    if (location.match("/user-management") || location === "/user") {
      wouterNavigate(`/user-management`);
    } else {
      wouterNavigate(`/admin`);
    }
  }
}
