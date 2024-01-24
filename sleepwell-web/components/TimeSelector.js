import { useState, useEffect } from 'react';
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeClock } from '@mui/x-date-pickers/TimeClock';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import dayjs from 'dayjs';
import useDarkMode from './useDarkMode';


export function TimeSelector(props) {
	const [startHour, setStartHour] = useState(props.startHour);
  	const [startMerid, setStartMerid] = useState(props.startMerid);
  	// Dark Mode State and Toggle Function
  	const [darkMode, toggleDarkMode] = useDarkMode();

  	var hour = startHour;
  	var minute = 0;
  	const [timeValue, setTimeValue] = useState(dayjs().hour(startHour).minute(0).add(12, 'hour'));

  	const sxClock = {
    	"& .MuiClock-squareMask": "MuiClock-squareMask",
    	"& .MuiClock-root": "MuiClock-root",
    	"& .MuiClock-pin": "MuiClock-pin",
    	"& .MuiClockPointer-root": "MuiClockPointer-root",
    	"& .MuiClockPointer-thumb": "MuiClockPointer-thumb",
  	};

	
	
	var merid = startMerid;
	var timeObj = { hour, minute, merid };


	// This function is called whenever the time is changed, each button click is interpreted as a submit
	// Send current time vars to props, use with submitter={anotherFunction} in parent
	function sendTime() {
		merid = 'am';
		if (hour > 12) {	// dayJS uses 24hr time, but we're using 12hr
			hour = hour % 12;
			merid = 'pm';
        }
		timeObj = { hour, minute, merid };
		//console.log("submitting time: " + hour + ":" + minute + merid);
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
            }
		
		}
            label= "Time"
          />

          <div className="flex flex-row">
            {/* Use Tailwind CSS classes for responsive design */}
    
			<div className={`hidden lg:flex `}>

              <TimeClock
                value={timeValue}
                views={['hours']}
                onChange={(newTimeValue) => {
                  updateClockTimes(newTimeValue);
                }}
                sx={sxClock}
              />
            </div>
            <div className="hidden lg:flex">
              <TimeClock
                value={timeValue}
                views={['minutes']}
                onChange={(newTimeValue) => {
                  updateClockTimes(newTimeValue);
                }}
                sx={sxClock}
              />
              </div>
          </div>
        </div>
      </form>
    </LocalizationProvider>

	);
}
