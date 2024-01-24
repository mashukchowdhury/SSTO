import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import dayjs from 'dayjs';
import useDarkMode from './useDarkMode';


export function DigitalTimeSelector(props) {
    const [startHour, setStartHour] = useState(props.startHour);
    const [startMerid, setStartMerid] = useState(props.startMerid);
    // Dark Mode State and Toggle Function
    const [darkMode, toggleDarkMode] = useDarkMode();

    var hour = startHour;
    var minute = 0;
    const [timeValue, setTimeValue] = useState(dayjs().hour(startHour).minute(0).add(12, 'hour'));

    var merid = startMerid;
    var timeObj = { hour, minute, merid };

    function sendTime() {
        merid = 'am';
        if (hour > 12) {
            hour = hour % 12;
            merid = 'pm';
        }
        timeObj = { hour, minute, merid };
        props.submitter(timeObj);
    }

    function updateClockTimes(newTimeValue) {
        hour = newTimeValue.hour();
        minute = newTimeValue.minute();
        setTimeValue(newTimeValue);

        sendTime();
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <form onSubmit={(event) => {
                event.preventDefault();
                sendTime();
            }}>
                <div className="flex flex-row items-center text-2xl">
                    <TimeField
                        value={timeValue}
                        onChange={(newTimeValue) => {
                            updateClockTimes(newTimeValue);
                        }}
                        sx={{
                            "& .MuiOutlinedInput-input": ".MuiOutlinedInput-input",
                            "& .MuiInputLabel-root": ".MuiInputLabel-root",
                            "& .MuiOutlinedInput-notchedOutline": "MuiOutlinedInput-notchedOutline",
                        }}
                        label="Time"
                    />
                </div>
            </form>
        </LocalizationProvider>
    );
}
