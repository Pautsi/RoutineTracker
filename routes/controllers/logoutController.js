import * as service from "../../services/userService.js";

const data = {
    auth: ''
};

const showLogout = async({render, session}) => {
    data.auth = await service.authenticated({session: session});
    render('logout.ejs', data);
}

const postLogout = ({session, response}) => {
    service.logout({session: session}); // Authentication-related information is cleared from the session
    response.body = 'Successfully logged out.';
}

export { showLogout, postLogout }