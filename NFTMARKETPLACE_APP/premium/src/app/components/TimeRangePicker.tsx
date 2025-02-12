import React, { useState, useEffect, useCallback } from "react";
import { DatePicker, Space } from "antd";
import type { GetProps } from "antd";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
export type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;

interface TimeRangePickerProps {
  onChange: (value: RangePickerProps["value"]) => void;
  value?: RangePickerProps["value"];
}

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  onChange,
  value,
}) => {
  const [now, setNow] = useState(dayjs()); // Tracks the current time
  const [startTime, setStartTime] = useState<Dayjs | null>(null); // Stores confirmed start time

  // ⏳ Updates `now` every minute to keep time current
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs());
    }, 60000); // Every 60 seconds

    return () => clearInterval(timer);
  }, []);

  // ⏰ Compute disabled hours & minutes dynamically
  const getDisabledTime = (current: Dayjs, minTime: Dayjs, maxTime: Dayjs) => {
    return {
      disabledHours: () => {
        const hoursBeforeMin = Array.from(
          { length: minTime.hour() },
          (_, i) => i
        );
        const hoursAfterMax = Array.from(
          { length: 23 - maxTime.hour() },
          (_, i) => maxTime.hour() + 1 + i
        );
        return [...hoursBeforeMin, ...hoursAfterMax];
      },
      disabledMinutes: (selectedHour: number) => {
        if (selectedHour === minTime.hour()) {
          return Array.from({ length: minTime.minute() }, (_, i) => i);
        }
        if (selectedHour === maxTime.hour()) {
          return Array.from(
            { length: 60 - maxTime.minute() },
            (_, i) => maxTime.minute() + i
          );
        }
        return [];
      },
    };
  };

  // ⏳ Disable times for Start Time (Recomputes as `now` changes)
  const disabledStartTime = useCallback(
    (current: Dayjs | null) => {
      if (!current) return {};
      const minTime = now;
      const maxTime = now.add(30, "minute");
      return getDisabledTime(current, minTime, maxTime);
    },
    [now]
  );

  // 🕒 Disable times for End Time (Recomputes when Start Time is selected)
  const disabledEndTime = useCallback(
    (current: Dayjs | null) => {
      if (!current || !startTime) return {};
      const minTime = startTime;
      const maxTime = startTime.add(1.5, "hour");
      return getDisabledTime(current, minTime, maxTime);
    },
    [startTime]
  );

  // ✅ Handles user selection and ensures validation
  const handleChange = (dates: RangePickerProps["value"]) => {
    if (dates && dates[0] && dates[1]) {
      const duration = dates[1].diff(dates[0], "minute");
      if (duration > 90) return; // Restrict to 1.5 hours max
    }
    onChange?.(dates);
  };

  // 🎯 When user clicks "OK" after picking Start Time, update state & recompute End Time
  const handleStartTimeOk = (selectedStart: Dayjs | null) => {
    if (selectedStart) {
      setStartTime(selectedStart); // Store the confirmed start time
    }
  };

  // 🛠 **UPDATED: Disabled Date Logic**
  const disabledDate = (current: Dayjs) => {
    if (!now) return false;
    // Prevent selecting past dates
    if (current.isBefore(now, "day")) return true;

    // Disable dates beyond 30 mins from now for start time
    const maxStartDate = now.add(30, "minute");
    if (!startTime && current.isAfter(maxStartDate, "day")) return true;

    // Disable dates beyond 1.5 hrs from start time for end time
    if (startTime) {
      const maxEndDate = startTime.add(1.5, "hour");
      if (current.isAfter(maxEndDate, "day")) return true;
    }

    return false;
  };

  return (
    <div className="range-picker-container">
      <Space direction="vertical" size={15}>
        <RangePicker
          showTime={{
            format: "HH:mm",
            disabledTime: (current, type) =>
              type === "start"
                ? disabledStartTime(current)
                : disabledEndTime(current),
          }}
          format="YYYY-MM-DD HH:mm"
          value={value}
          disabledDate={disabledDate} // 🔥 **UPDATED: Applied disabled date logic**
          onChange={handleChange}
          onOk={(dates) => handleStartTimeOk(dates?.[0])} // 🔥 Ensures first-pass recomputation works
          popupClassName="responsive-dropdown" // Responsive styling
        />
      </Space>
    </div>
  );
};

export default TimeRangePicker;
