import * as service from "../../services/userService.js";

const data = {
    errors: [],
    email: '',
    auth: ''
};

const showRegistration = async({render, session}) => {
    data.errors = [];
    data.email = '';
    data.auth = await service.authenticated({session: session}); // Currently authenticated user's email
    render('register.ejs', data);
} 

// Handling registration
const postRegistrationForm = async({request, response, render, session}) => {
    const body = request.body();
    const params = await body.value;
    
    const email = params.get('email');
    const password = params.get('password');
    const verification = params.get('verification'); // Password needs to be re-entered for confirmation

    data.errors = [];
    data.email = email;
    data.auth = await service.authenticated({session: session}); // Currently authenticated user's email
  
    console.log('Validating registration...');

    // Validation
    let passes = true;
    
    if (password !== verification) { // Mismatch in password confirmation
        passes = false;
        data.errors.push('The entered passwords did not match.');
    }
    if (!password || password.length < 4) { // Password must contain at least 4 characters, and must be confirmed correctly
        passes = false;
        data.errors.push('Password must contain at least 4 characters.');
    }
    
    if (!(await service.emailFree(email))) { // Email should not be reserved
        passes = false;
        data.errors.push('The email is already reserved.');
    }
    if (!email || !email.includes('@') || email.length < 6) { // Email must be an authentic email (include @ and have at least 6 characters)
        passes = false;
        data.errors.push('Email should include @ and have at least 6 characters.');
    }
  
    if (passes) { // Validation ok
        console.log('Validated registration, adding user...');
        if (await service.hashPassword(email, password)) { // Adding user
            response.body = "Registration successful!";
        }
    } else { // Validation failed
        console.log('Registration not validated.');
        render('register.ejs', data);
    }
    
}

export { showRegistration, postRegistrationForm }