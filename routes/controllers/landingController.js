import * as service from "../../services/reportService.js";
import { authenticated } from "../../services/userService.js";

const showLanding = async({render, session}) => {
    const data = {
        trend: '',
        today: 'Not reported',
        yesterday: 'Not reported',
        auth: await authenticated({session: session})
    };

    const today = await service.moodToday(); // Average mood of all users today
    const yesterday = await service.moodYesterday(); // Average mood of all users yesterday
    
// If the average mood yesterday was better than today, tells that things are looking gloomy today
// If the average mood yesterday was was worse today, tells that things are looking bright today    
    if (today !== 0 && yesterday !== 0) {
        if (today !== yesterday) {
            if (today < yesterday) {
                data.trend = 'gloomy';
            } else {
                data.trend = 'bright';
            }
        }
    }
    if (today !== 0) data.today = today;
    if (yesterday !== 0) data.yesterday = yesterday;
    
    render('landing.ejs', data);
}

export { showLanding }