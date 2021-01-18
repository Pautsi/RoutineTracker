import { session } from '../app.js';
import { executeQuery } from '../database/database.js';
import { bcrypt } from "../deps.js";

// Return true if no user has that email, false if email is reserved
const emailFree = async(email) => {
    const existingUsers = await executeQuery("SELECT * FROM users WHERE email = $1", email);
    if (existingUsers.rowCount > 0) {
      return false;
    } else {
        return true;
    }
}

const hashPassword = async(email, password) => {
    const hash = await bcrypt.hash(password);
    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2);", email, hash);
    return true;
}

// Return true if password and email match, false otherwise
const passwordCorrect = async(email, password) => {
    const res = await executeQuery("SELECT * FROM users WHERE email = $1;", email);
    const userObj = res.rowsOfObjects()[0];
    const hash = userObj.password;
    const passwordCorrect = await bcrypt.compare(password, hash);
    if (passwordCorrect) {
        return true;
    } else {
        return false;
    }
}

// Logs user in
const authenticate = async({ session }, email) => {
    const res = await executeQuery("SELECT * FROM users WHERE email = $1;", email);
    const userObj = res.rowsOfObjects()[0];
    await session.set('authenticated', true);
        await session.set('user', {
            id: userObj.id,
            email: userObj.email
        });
}

// Logs user out
const logout = async({session}) => {
    await session.set('authenticated', false);
    await session.set('user', {
        id: '',
        email: ''
    });
}

// Returns currently authenticated user's email
// displayed usually in header if a user has logged in
const authenticated = async({session}) => {
    if (await session.get('authenticated')) {
        const email = (await session.get('user')).email;
        return email;
    } else return '';   
}

// Returns currently authenticated user's id
const authenticatedId = async({session}) => {
    if (await session.get('authenticated')) {
        const user_id = (await session.get('user')).id;
        return user_id;
    } else return '';  
}


export { emailFree, hashPassword, passwordCorrect, authenticate, authenticated, logout, authenticatedId }