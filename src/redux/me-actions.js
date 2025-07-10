import { myActions } from "./me-slice"

const setMyDetails = (details) =>{
    return (dispatch)=>{
        details.email = details.email.toLowerCase()
        dispatch(myActions.setMyself(details))
    }
}

export default setMyDetails