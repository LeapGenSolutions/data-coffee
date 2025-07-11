import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../constants";

export function useSaveSource() {
    console.log("useSaveSource hook initialized");

    return useMutation({
        mutationFn: async ({ email, newSource }) => {
            const response = await axios.post(`${BACKEND_URL}/api/source/${encodeURIComponent(email)}`, newSource);
            return response.data;
        }
    });
}
