import { Router } from "../deps.js";
import { report, addReportMorning, reportMorning, reportEvening, addReportEvening } from "./controllers/reportController.js";
import { getSummary, selectSummary } from "./controllers/summaryController.js";
import { showLanding } from "./controllers/landingController.js";
import { showRegistration, postRegistrationForm } from "./controllers/registrationController.js";
import { showLoginForm, postLoginForm } from "./controllers/loginController.js";
import { showLogout, postLogout } from "./controllers/logoutController.js";

const router = new Router();

router.get('/', showLanding);

router.get('/behavior/reporting/morning', reportMorning);
router.post('/behavior/reporting/morning', addReportMorning);
router.get('/behavior/reporting/evening', reportEvening);
router.post('/behavior/reporting/evening', addReportEvening);

router.get('/behavior/reporting', report);
router.get('/behavior/summary', getSummary);
router.post('/behavior/summary', selectSummary);

router.get('/auth/registration', showRegistration);
router.post('/auth/registration', postRegistrationForm);
router.get('/auth/login', showLoginForm);
router.post('/auth/login', postLoginForm);
router.get('/auth/logout', showLogout);
router.post('/auth/logout', postLogout);

export { router };