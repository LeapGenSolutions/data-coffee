export function navigateToWorkspace(wsId, location, wouterNavigate) {
  if (wsId) {
    if (location.match("/pipeline-management") || location === "/pipeline") {
      wouterNavigate(`/pipeline-management`);
    } else {
      wouterNavigate(`/admin`);
    }
  }
}
