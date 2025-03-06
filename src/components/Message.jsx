import { Calendar, Clock, FileText, CheckCircle2, XCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Message({ message, onDateSelect, onSend }) {
  const { role, content, timestamp } = message;
  const isBot = role === "bot";
  
  const isValidDate = (date) => date instanceof Date && !isNaN(date.getTime());

  const renderStructuredContent = () => {
    if (typeof content !== 'object') return null;

    switch (content.type) {
      case 'date_picker':
        return (
          <div className="mt-2 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-emerald-600" />
              <span className="font-medium text-emerald-800 text-sm">{content.message}</span>
            </div>
            <div className="relative">
              <DatePicker
                selected={null}
                onChange={(date) => onDateSelect && onDateSelect(content.field, date)}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                className="w-full p-2 text-sm border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholderText="Click to select a date"
                showPopperArrow={false}
                popperPlacement="bottom"
                popperModifiers={[
                  {
                    name: "offset",
                    options: {
                      offset: [0, 8]
                    }
                  }
                ]}
                calendarClassName="!bg-white !border-emerald-200 !shadow-xl !text-sm"
                dayClassName={date => "!text-emerald-800 hover:!bg-emerald-50"}
                monthClassName={date => "!text-emerald-800"}
                weekDayClassName={date => "!text-emerald-600"}
              />
            </div>
          </div>
        );

      case 'leave_type_selection':
        return (
          <div className="mt-2 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-emerald-600" />
              <span className="font-medium text-emerald-800 text-sm">{content.message}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {content.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => onDateSelect && onDateSelect('leave_type', option.value)}
                  className="p-2 bg-white rounded-lg hover:bg-emerald-100 transition-all duration-200 text-left border border-emerald-200 hover:border-emerald-300 group"
                >
                  <span className="font-medium text-emerald-800 group-hover:text-emerald-900 text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'leave_confirmation':
        let details;
        try {
          details = typeof content.details === 'string' ? JSON.parse(content.details) : content.details;
        } catch (error) {
          console.error("Failed to parse details:", error);
          details = content.details || {};
        }
        
        return (
          <div className="mt-2 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-emerald-600" />
              <span className="font-medium text-emerald-800 text-sm">Leave Request Details</span>
            </div>
            <div className="space-y-1.5 text-sm">
              {details.user_id && (
                <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-emerald-200">
                  <span className="text-emerald-700">User ID</span>
                  <span className="font-medium text-emerald-900">{details.user_id}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-emerald-200">
                <span className="text-emerald-700">Start Date</span>
                <span className="font-medium text-emerald-900">{details.startDate}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-emerald-200">
                <span className="text-emerald-700">End Date</span>
                <span className="font-medium text-emerald-900">{details.endDate}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-emerald-200">
                <span className="text-emerald-700">Type</span>
                <span className="font-medium text-emerald-900">
                  {details.Leave_type === 'CL' ? 'Casual Leave' :
                   details.Leave_type === 'PL' ? 'Privilege Leave' :
                   details.Leave_type === 'SL' ? 'Sick Leave' : details.Leave_type}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-emerald-200">
                <span className="text-emerald-700">Reason</span>
                <span className="font-medium text-emerald-900">{details.reason}</span>
              </div>
              {details.half_day === 'Y' && (
                <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-emerald-200">
                  <span className="text-emerald-700">Duration</span>
                  <span className="font-medium text-emerald-900">Half Day</span>
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              <button
                onClick={() => onSend && onSend('N')}
                className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onSend && onSend('Y')}
                className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
              >
                Confirm
              </button>
            </div>
          </div>
        );

      case 'leave_balance':
        return (
          <div className="mt-2 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-emerald-600" />
              <span className="font-medium text-emerald-800 text-sm">Leave Balance</span>
            </div>
            <div className="space-y-1.5">
              {Object.entries(content.details).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-white rounded-lg border border-emerald-200 hover:border-emerald-300 transition-colors">
                  <span className="text-emerald-700 font-medium text-sm">{key}</span>
                  <span className="text-emerald-600 font-bold text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'leave_response':
        const isSuccess = content.status === "success" || content.message?.toLowerCase().includes("success");
        return (
          <div className={`mt-2 p-3 rounded-lg border ${
            isSuccess
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-emerald-50/50 border-emerald-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {isSuccess ? (
                <>
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-800 text-sm font-medium">{content.message}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-800 text-sm font-medium">{content.message}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (!content) return null;
    
    if (typeof content === "object" && 'message' in content) {
      return content.message;
    } else if (typeof content === "string") {
      return content;
    }
    return String(content);
  };

  return (
    <div className={`flex items-start gap-2.5 mb-3 ${isBot ? 'justify-start' : 'justify-end flex-row-reverse'}`}>
      {isBot && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-green-500 flex items-center justify-center text-white font-bold text-xs shadow-md ring-2 ring-white">
          U
        </div>
      )}
      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isBot ? '' : 'items-end'}`}>
        <div className={`flex items-center gap-2 mb-1 ${isBot ? '' : 'flex-row-reverse'}`}>
          <span className="text-xs font-medium text-emerald-800">
            {isBot ? 'UKNOWVA HRMS Assistant' : 'You'}
          </span>
          <span className="text-[10px] text-emerald-600">
            {timestamp && isValidDate(new Date(timestamp))
              ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Unknown time'}
          </span>
        </div>
        <div className={`p-2.5 rounded-lg ${
          isBot 
            ? 'bg-white border border-emerald-200 shadow-sm hover:shadow-md transition-shadow' 
            : 'bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md'
        }`}>
          <div
            className="whitespace-pre-wrap text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderContent().replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") }}
          ></div>

          {renderStructuredContent()}
        </div>
      </div>
    </div>
  );
}