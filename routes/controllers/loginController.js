import * as service from "../../services/userService.js";

const data = {
    errors: [],
    auth: ''
};

const invalid = 'Invalid email or password';

const showLoginForm = async({render, session}) => {
    data.errors = [];
    data.auth = await service.authenticated({session: session});
    render('login.ejs', data);
}

// Handles log in
const postLoginForm = async({request, response, render, session}) => {
    data.errors = [];
    data.auth = await service.authenticated({session: session});
    
    const body = request.body();
    const params = await body.value;
  
    const email = params.get('email');
    const password = params.get('password');
  
// Validation    
    if (await service.emailFree(email)) { // Email does not exist in the database
        data.errors.push(invalid);
        render('login.ejs', data);
    } else {
        if (!(await service.passwordCorrect(email, password))) { // Password is incorrect
            data.errors.push(invalid);
            render('login.ejs', data);
        }
      
        console.log('Authenticating...');
        if (service.authenticate({ session }, email)) { // User is authenticated using session-based authentication
            response.body = 'Authentication successful!';
        } else {
            response.body = 'Error in authentication';
        }        
    }
  }

export { showLoginForm, postLoginForm }