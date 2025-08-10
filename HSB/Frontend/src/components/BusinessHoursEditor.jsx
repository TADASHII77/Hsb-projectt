import React from 'react';

const BusinessHoursEditor = ({ businessHours, onChange, disabled = false }) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const timeOptions = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', 
    '8:00 PM', '9:00 PM', '10:00 PM'
  ];

  const handleTimeChange = (day, field, value) => {
    onChange({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value
      }
    });
  };

  const handleClosedToggle = (day) => {
    onChange({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        closed: !businessHours[day]?.closed
      }
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-900 mb-4">Business Hours</h4>
      
      {days.map(day => {
        const dayHours = businessHours?.[day] || { start: '9:00 AM', end: '5:00 PM', closed: false };
        
        return (
          <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="w-20 text-sm font-medium text-gray-900 capitalize">
                {day}:
              </span>
              
              {!dayHours.closed ? (
                <div className="flex items-center gap-2">
                  <select
                    value={dayHours.start}
                    onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                    disabled={disabled}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  
                  <span className="text-gray-500 text-sm">to</span>
                  
                  <select
                    value={dayHours.end}
                    onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                    disabled={disabled}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-gray-500 text-sm font-medium">Closed</span>
              )}
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dayHours.closed}
                onChange={() => handleClosedToggle(day)}
                disabled={disabled}
                className="w-4 h-4 text-[#AF2638] focus:ring-[#AF2638] border-gray-300 rounded disabled:cursor-not-allowed"
              />
              <span className="text-sm text-gray-700">Closed</span>
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default BusinessHoursEditor; 