import * as service from "../../services/reportService.js";
import { authenticated } from "../../services/userService.js";

const morningData = { // Information passed on during morning report
  sleep_dur: '',      // Sleep duration
  mood: '',           //Generic mood
  sleep_qua: '',      // Sleep quality
  date: new Date().toISOString().substr(0, 10),
  errors: [],
  auth: ''            // Currently authenticated user's email
};

const eveningData = { // Information passed on during evening report
  active: '',         // Time spent on sports and excercise
  study: '',          // Time spent studying
  mood: '', 
  eating: '',         // Regularity and quality of eating
  date: new Date().toISOString().substr(0, 10),
  errors: [],
  auth: ''            // Currently authenticated user's email
};

const clearMorningData = async() => {
  morningData.sleep_dur = '';
  morningData.mood = '';
  morningData.sleep_qua = '';
  morningData.date = new Date().toISOString().substr(0, 10);
  morningData.errors = [];
}

const clearEveningData = async() => {
  eveningData.active = '';
  eveningData.study = '';
  eveningData.mood = '';
  eveningData.eating = '',
  eveningData.date = new Date().toISOString().substr(0, 10);
  eveningData.errors = [];
}

// Processing input in case it is entered as a decimal that contains extra zeros
// e.g. 10.00 is converted into 10
const processDecimal = (input) => {
  while (input.includes(".")) { 
    if (input.charAt(input.length-1) === '0') {   // Removing extra zeros after decimal point, e.g. 10.00 -> 10.
      input = input.slice(0,input.length-1);
      if (input.charAt(input.length-1) === '.') {
        input = input.slice(0,input.length-1);    // Removing '.' at the end, e.g. 10. -> 10
        return input;
      }
    } else return input;
  }
  return input;
}

// Controlling view in /behavior/reporting
const report = async({render, session}) => {
  const data = {
    morning: false,
    evening: false,
    auth: await authenticated({session: session})
  };
  data.morning = await service.morningReportDone({session: session}); // Checks if morning report is done for today
  data.evening = await service.eveningReportDone({session: session}); // Checks if evening report is done for today
  render('reporting.ejs', data);
};

// Template for morning report
const reportMorning = async({render, session}) => {
  clearMorningData();
  morningData.auth = await authenticated({session: session});
  render('reportMorning.ejs', morningData);
};

// Adding morning report
// All 4 parameters must be or are automatically entered
const addReportMorning = async({request, render, session}) => {
  clearMorningData();
  const body = request.body();
  const params = await body.value;

  morningData.sleep_dur = params.get('sleep_dur');
  morningData.sleep_qua = params.get('sleep_qua');
  morningData.date = params.get('date');
  morningData.mood = params.get('mood');

// Processing sleeping duration in case it is entered as a decimal that contains extra zeros
  morningData.sleep_dur = processDecimal(morningData.sleep_dur);

// Validation  
  console.log('validating... ' + morningData.sleep_dur + morningData.sleep_qua + morningData.mood + morningData.date);

  let passes = true;
  if (morningData.sleep_dur === '' ) { // Sleep duration must be entered
    passes = false;
    morningData.errors.push('Sleep duration must be entered.');
  }
  if (Number(morningData.sleep_dur).toString() !== morningData.sleep_dur || Number(morningData.sleep_dur) < 0) { // Sleep duration must be a non-negative number or decimal
    passes = false;
    morningData.errors.push('Sleep duration must be a non-negative number or decimal.');
  }
  // Sleep quality and generic mood must be integers between 1 and 5
  if (!Number.isInteger(Number(morningData.mood)) || !Number.isInteger(Number(morningData.sleep_qua)) || Number(morningData.mood) < 1 || Number(morningData.mood) > 5 || Number(morningData.sleep_qua) < 1 || Number(morningData.sleep_qua) > 5) {
    passes = false;
    morningData.errors.push('Sleep quality and generic mood must be integers between 1 and 5.');
  }
  if (Number(morningData.sleep_dur) >= 100) { // Sleep duration must be less than 100 hours
    passes = false;
    morningData.errors.push('Sleep duration must be less than 100 hours.');
  }

  if (passes) {   // Validation ok
    await service.reportMorning({session: session}, morningData.sleep_dur, morningData.sleep_qua, morningData.mood, morningData.date); // Morning report added
    clearMorningData();
    morningData.auth = await authenticated({session: session});
    render('reportMorning.ejs', morningData);
  } else {        // Validation failed
    console.log('Not validated: ' + morningData.errors);
    morningData.auth = await authenticated({session: session});
    render('reportMorning.ejs', morningData);
  }
}

// Template for evening report
const reportEvening = async({render, session}) => {
  clearEveningData();
  eveningData.auth = await authenticated({session: session});
  render('reportEvening.ejs', eveningData);
};

// Adding evening report
// contains time spent on sports and exercise, time spent studying, regularity and quality of eating, and generic mood
const addReportEvening = async({request, render, session}) => {
  clearEveningData();
  const body = request.body();
  const params = await body.value;

  eveningData.active = params.get('active');
  eveningData.study = params.get('study');
  eveningData.eating = params.get('eating');
  eveningData.mood = params.get('mood');
  eveningData.date = params.get('date');

// Processing time spent on sports and excercise & time spent studying in case it is entered as a decimal that contains extra zeros
  eveningData.active = processDecimal(eveningData.active);
  eveningData.study = processDecimal(eveningData.study);  

  
// Validation

  let passes = true;
  if (eveningData.active === '' ) { // Time spent on sports and exercise and time spent studying are reported in hours must be entered
    passes = false;
    eveningData.errors.push('Time spent on sports and exercise must be entered.');
  }
  if (eveningData.study === '' ) {
    passes = false;
    eveningData.errors.push('Time spent studying must be entered.');
  }
  // Time spent on sports and exercise and time spent studying must be a non-negative number or decimal
  if (Number(eveningData.active).toString() !== eveningData.active || Number(eveningData.active < 0)) {
    passes = false;
    eveningData.errors.push('Time spent on sports and exercise must be a non-negative number or decimal.');
  }
  if (Number(eveningData.study).toString() !== eveningData.study || Number(eveningData.study < 0)) {
    passes = false;
    eveningData.errors.push('Time spent on studying must be a non-negative number or decimal.');
  }
  // Regularity and quality of eating and generic mood must be reported using numbers between 1 and 5 (integers).
  if (!Number.isInteger(Number(eveningData.mood)) || !Number.isInteger(Number(eveningData.eating)) || Number(eveningData.mood) < 1 || Number(eveningData.mood) > 5 || Number(eveningData.eating) < 1 || Number(eveningData.eating) > 5) {
    passes = false;
    eveningData.errors.push('Regularity and quality of eating and generic mood must be integers between 1 and 5.');
  }
  if (Number(eveningData.active) >= 100) {  // Time spent on sports and exercise must be less than 100 hours
    passes = false;
    eveningData.errors.push('Time spent on sports and exercise must be less than 100 hours.');
  }
  if (Number(eveningData.study) >= 100) {   // Time spent on studying must be less than 100 hours
    passes = false;
    eveningData.errors.push('Time spent on studying must be less than 100 hours.');
  }

  if (passes) { // Validation ok
    await service.reportEvening({session: session}, eveningData.active, eveningData.study, eveningData.eating, eveningData.mood, eveningData.date); // Adding report
    clearEveningData();
    eveningData.auth = await authenticated({session: session});
    render('reportEvening.ejs', eveningData);
  } else {      // Validation failed
    console.log('Not validated: ' + eveningData.errors);
    eveningData.auth = await authenticated({session: session});
    render('reportEvening.ejs', eveningData);
  }
}
 
export { report, addReportMorning, reportMorning, addReportEvening, reportEvening };