import { executeQuery } from '../database/database.js'
import { authenticatedId } from "./userService.js"

const morningTime = 'morning';
const eveningTime = 'evening';

const emptyMetrics = () => {
    const data = {
        sleep_dur: '',
        active: '',
        study: '',
        sleep_qua: '',
        mood: ''
    };
    return data;
}

// Checks if morning report is done today for this user
const morningReportDone = async({session}) => {
    const user_id = await authenticatedId({session: session});
    const res = await executeQuery("SELECT * FROM reports WHERE user_id = $1 AND date = current_date AND time = $2;", user_id, morningTime);
    if (res.rowCount > 0) {
        return true;
    } else return false;
}

// Checks if evening report is done today for this user
const eveningReportDone = async({session}) => {
    const user_id = await authenticatedId({session: session});
    const res = await executeQuery("SELECT * FROM reports WHERE user_id = $1 AND date = current_date AND time = $2;", user_id, eveningTime);
    if (res.rowCount > 0) {
        return true;
    } else return false;
}


// Morning report is added
const reportMorning = async({session}, sleep_dur, sleep_qua, mood, date) => {
    const user_id = await authenticatedId({session: session});
    const overlappingReports = await executeQuery("SELECT * FROM reports WHERE user_id = $1 AND date = $2 AND time = $3;", user_id, date, morningTime);
    if (overlappingReports.rowCount > 0) { // Checks if there exists an earlier report
        console.log('Deleting earlier report for this morning...');
        await executeQuery("DELETE from reports WHERE user_id = $1 AND date = $2 AND time = $3;", user_id, date, morningTime);
    } else {
        console.log('No earlier reports for this morning.');
    }
// Adding sleep duration, sleep quality and generic mood
    await executeQuery("INSERT INTO reports (type, user_id, hours, time, date) VALUES ('sleep_dur', $1, $2, $3, $4);", user_id, sleep_dur, morningTime, date);
    await executeQuery("INSERT INTO reports (type, user_id, quality, time, date) VALUES ('sleep_qua', $1, $2, $3, $4);", user_id, sleep_qua, morningTime, date);
    await executeQuery("INSERT INTO reports (type, user_id, quality, time, date) VALUES ('mood', $1, $2, $3, $4);", user_id, mood, morningTime, date);
    console.log('Added morning report to database.');    
}


// evening report is added
const reportEvening = async({session}, active, study, eating, mood, date) => {
    const user_id = await authenticatedId({session: session});
    const overlappingReports = await executeQuery("SELECT * FROM reports WHERE user_id = $1 AND date = $2 AND time = $3;", user_id, date, eveningTime);
    if (overlappingReports.rowCount > 0) { // Checks if there exists an earlier report
        console.log('Deleting earlier report for this evening...');
        await executeQuery("DELETE from reports WHERE user_id = $1 AND date = $2 AND time = $3;", user_id, date, eveningTime);
        
    } else {
        console.log('No earlier reports for this evening.');
    }
// Adding time spent studying, time spent on sports and excercise, regularity and quality of eating, generic mood
    await executeQuery("INSERT INTO reports (type, user_id, hours, time, date) VALUES ('active', $1, $2, $3, $4);", user_id, active, eveningTime, date);
    await executeQuery("INSERT INTO reports (type, user_id, hours, time, date) VALUES ('study', $1, $2, $3, $4);", user_id, study, eveningTime, date);
    await executeQuery("INSERT INTO reports (type, user_id, quality, time, date) VALUES ('eating', $1, $2, $3, $4);", user_id, eating, eveningTime, date);
    await executeQuery("INSERT INTO reports (type, user_id, quality, time, date) VALUES ('mood', $1, $2, $3, $4);", user_id, mood, eveningTime, date);
    console.log('Added evening report to database.');    
}

// Get last week's number
const getLastWeek = async() => {
    const weekNumber = await executeQuery("SELECT extract(week from current_date - 7);");
    return weekNumber.rowsOfObjects()[0].date_part;
}

// Summary for weekly average: sleep duration, time spent on sports and exercise, time spent studying, sleep quality, generic mood
const getWeeklyAverage = async({session}, weekNumber, year) => {
    const user_id = await authenticatedId({session: session});
    const data = emptyMetrics();
    // Sleep duration
    const res_sleep_dur = await executeQuery("SELECT AVG(hours) FROM reports WHERE type = 'sleep_dur' AND user_id = $1 AND extract(week from date) = $2 AND extract(year from date) = $3;", user_id, weekNumber, year);
    if (res_sleep_dur.rowsOfObjects()[0].avg === null) {
        data.sleep_dur = 'Not reported';
    } else {
        data.sleep_dur = res_sleep_dur.rowsOfObjects()[0].avg;
    }

    // Time spent on sports and excercise
    const res_active = await executeQuery("SELECT AVG(hours) FROM reports WHERE type = 'active' AND user_id = $1 AND extract(week from date) = $2 AND extract(year from date) = $3;", user_id, weekNumber, year);
    if (res_active.rowsOfObjects()[0].avg === null) {
        data.active = 'Not reported';
    } else {
        data.active = res_active.rowsOfObjects()[0].avg;
    }

    // Time spent studying
    const res_study = await executeQuery("SELECT AVG(hours) FROM reports WHERE type = 'study' AND user_id = $1 AND extract(week from date) = $2 AND extract(year from date) = $3;", user_id, weekNumber, year);
    if (res_study.rowsOfObjects()[0].avg === null) {
        data.study = 'Not reported';
    } else {
        data.study = res_study.rowsOfObjects()[0].avg;
    }

    // Sleep quality
    const res_sleep_qua = await executeQuery("SELECT AVG(quality) FROM reports WHERE type = 'sleep_qua' AND user_id = $1 AND extract(week from date) = $2 AND extract(year from date) = $3;", user_id, weekNumber, year);
    if (res_sleep_qua.rowsOfObjects()[0].avg === null) {
        data.sleep_qua = 'Not reported';
    } else {
        data.sleep_qua = res_sleep_qua.rowsOfObjects()[0].avg;
    }

    // Generic mood
    const res_mood = await executeQuery("SELECT AVG(quality) FROM reports WHERE type = 'mood' AND user_id = $1 AND extract(week from date) = $2 AND extract(year from date) = $3;", user_id, weekNumber, year);
    if (res_mood.rowsOfObjects()[0].avg === null) {
        data.mood = 'Not reported';
    } else {
        data.mood = res_mood.rowsOfObjects()[0].avg;
    }

    return data;
}

// Get last month's number
const getLastMonth = async() => {
    const res = await executeQuery("SELECT extract(month from current_date);");
    const currentMonth = Number(res.rowsOfObjects()[0].date_part);
    let month = 12;
    if (currentMonth !== 1) {
        month = currentMonth - 1;
    }
    return month;
}

// Summary for monthly average: sleep duration, time spent on sports and exercise, time spent studying, sleep quality, generic mood
const getMonthlyAverage = async({session}, month, year) => {
    const user_id = await authenticatedId({session: session});
    const data = emptyMetrics();

    // Sleep duration
    const res_sleep_dur = await executeQuery("SELECT AVG(hours) FROM reports WHERE type = 'sleep_dur' AND user_id = $1 AND extract(month from date) = $2 AND extract(year from date) = $3;", user_id, month, year);
    if (res_sleep_dur.rowsOfObjects()[0].avg === null) {
        data.sleep_dur = 'Not reported';
    } else {
        data.sleep_dur = res_sleep_dur.rowsOfObjects()[0].avg;
    }

    // Time spent on sports and excercise
    const res_active = await executeQuery("SELECT AVG(hours) FROM reports WHERE type = 'active' AND user_id = $1 AND extract(month from date) = $2 AND extract(year from date) = $3;", user_id, month, year);
    if (res_active.rowsOfObjects()[0].avg === null) {
        data.active = 'Not reported';
    } else {
        data.active = res_active.rowsOfObjects()[0].avg;
    }

    // Time spent sudying
    const res_study = await executeQuery("SELECT AVG(hours) FROM reports WHERE type = 'study' AND user_id = $1 AND extract(month from date) = $2 AND extract(year from date) = $3;", user_id, month, year);
    if (res_study.rowsOfObjects()[0].avg === null) {
        data.study = 'Not reported';
    } else {
        data.study = res_study.rowsOfObjects()[0].avg;
    }

    // Sleep quality
    const res_sleep_qua = await executeQuery("SELECT AVG(quality) FROM reports WHERE type = 'sleep_qua' AND user_id = $1 AND extract(month from date) = $2 AND extract(year from date) = $3;", user_id, month, year);
    if (res_sleep_qua.rowsOfObjects()[0].avg === null) {
        data.sleep_qua = 'Not reported';
    } else {
        data.sleep_qua = res_sleep_qua.rowsOfObjects()[0].avg;
    }

    // Generic mood
    const res_mood = await executeQuery("SELECT AVG(quality) FROM reports WHERE type = 'mood' AND user_id = $1 AND extract(month from date) = $2 AND extract(year from date) = $3;", user_id, month, year);
    if (res_mood.rowsOfObjects()[0].avg === null) {
        data.mood = 'Not reported';
    } else {
        data.mood = res_mood.rowsOfObjects()[0].avg;
    }
    
    return data;

}

// All users' average mood today
const moodToday = async() => {
    const mood = await executeQuery("SELECT avg(quality) FROM reports WHERE type = 'mood' AND date = current_date");
    if (mood.rowsOfObjects()[0].avg === null) {
        return 0; // Return 0 if there is no data
    } else {
        return Number(mood.rowsOfObjects()[0].avg);
    }
}

// All users' average mood yesterday
const moodYesterday = async() => {
    const mood = await executeQuery("SELECT avg(quality) FROM reports WHERE type = 'mood' AND date = current_date - 1");
    if (mood.rowsOfObjects()[0].avg === null) {
        return 0; // Return 0 if there is no data
    } else {
        return Number(mood.rowsOfObjects()[0].avg);
    }
}

export { morningTime, eveningTime, reportMorning, reportEvening, getLastWeek, getLastMonth, getWeeklyAverage, getMonthlyAverage, moodToday, moodYesterday, morningReportDone, eveningReportDone }