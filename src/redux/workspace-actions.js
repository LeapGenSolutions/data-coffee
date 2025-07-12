import axios from "axios";
import { BACKEND_URL } from "../constants";
import { workspacesActions } from "./workspace-slice";

const fetchWorkspaces = (userEmail) => {    
    return async (dispatch) => {
        try {
            userEmail = userEmail.toLowerCase();
            const res = await axios.get(`${BACKEND_URL}/api/workspaces/owner/${encodeURIComponent(userEmail)}`);
            const workspaces = Array.isArray(res.data) ? res.data : [res.data];
            dispatch(workspacesActions.setWorkspaces(workspaces));
        } catch (error) {
            console.error("Failed to fetch workspaces:", error);
        }
    };
};

export default fetchWorkspaces;