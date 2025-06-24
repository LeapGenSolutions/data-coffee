import { LogLevel } from "@azure/msal-browser";
import { REDIRECT_URI } from "./constants";


export const msalConfig = {
    auth: {
        clientId: "529bcde4-d3c1-4896-9277-b7d72ec4f57b",
        authority: "https://login.microsoftonline.com/b3e3a3db-e3db-4f76-9a7c-5bca46062c8c",
        redirectUri: REDIRECT_URI
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    default:
                        return;
                }
            }
        }
    }
};

export const loginRequest = {
    scopes: ["openid", "profile","User.Read", "Directory.Read.All", "Group.Read.All", "User.Read.All"]
};
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};
