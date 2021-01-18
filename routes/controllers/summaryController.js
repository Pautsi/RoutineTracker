import * as service from "../../services/reportService.js";
import { authenticated } from "../../services/userService.js";

const data = {
    week_sleep_dur: '', // Weekly average sleep duration
    week_active: '',    // Weekly average time spent on sports and excercise
    week_study: '',     // Weekly average time spent sudying
    week_sleep_qua: '', // Weekly average sleep quality
    week_mood: '',      // Weekly average mood
    weekNumber: '',
    m_sleep_dur: '',    // Monthly average sleep duration
    m_active: '',       // Monthly average time spent on sports and excercise
    m_study: '',        // Monthly average time spent sudying
    m_sleep_qua: '',    // Monthly average sleep quality
    m_mood: '',         // Monthly average mood
    month: '',
    auth: ''            // Currently authenticated user's email
};

let weekSelected = false;
let monthSelected = false;
let year = new Date().getFullYear(); // current year

const getSummary = async({render, session}) => {
    const defaultWeek = await service.getLastWeek(); // By default, last (calendar) week and last (calendar) month are displayed
    const defaultMonth = await service.getLastMonth();
    
    if (!weekSelected) {
        data.weekNumber = defaultWeek;
    }
    if (!monthSelected) {
        data.month = defaultMonth;
    }
    
    const week_averages = await service.getWeeklyAverage({session: session}, data.weekNumber, year); // Fetching weekly averages  
// Updating weekly averages to data    
    data.week_sleep_dur = week_averages.sleep_dur;
    data.week_active = week_averages.active;
    data.week_study = week_averages.study;
    data.week_sleep_qua = week_averages.sleep_qua;
    data.week_mood = week_averages.mood;

    const m_averages = await service.getMonthlyAverage({session: session}, data.month, year); // Fetching monthly averages
// Updating monthly averages to data  
    data.m_sleep_dur = m_averages.sleep_dur;
    data.m_active = m_averages.active;
    data.m_study = m_averages.study;
    data.m_sleep_qua = m_averages.sleep_qua;
    data.m_mood = m_averages.mood;

    data.auth = await authenticated({session: session});
    
    render('summary.ejs', data);

    weekSelected = false;
    monthSelected = false;
    year = new Date().getFullYear();
}

// Selecting a certain week or a month
// Selected week or month is only displayed immediately after. Selection is replaced with default if page is refreshed.
const selectSummary = async({request, render, session}) => {
    const body = request.body();
    const params = await body.value;
    if (params.has('week')) {
        const res = params.get('week') + '';
        const week = Number(res.substring(res.length-2, res.length));
        year = Number(res.substring(0, 4)); // Updating selected year to data
        weekSelected = true;
        data.weekNumber = week; // Updating selected week number to data
    } else if (params.has('month')) {
        const res = params.get('month') + '';
        const month = Number(res.substring(res.length-2, res.length));
        year = Number(res.substring(0, 4)); // Updating selected year to data
        monthSelected = true;
        data.month = month; // Updating selected month to data
    }
    await getSummary({render: render, session: session}); // Selected week/month is displayed in summary
}

export { getSummary, selectSummary };