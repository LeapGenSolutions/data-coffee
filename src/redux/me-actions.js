import { myActions } from "./me-slice"

const setMyDetails = (details) =>{
    return (dispatch)=>{
        if( !details.email ){
            details.email = details.preferred_username.toLowerCase()
        }
        details.email = details.email.toLowerCase()
        dispatch(myActions.setMyself(details))
    }
}

export default setMyDetails