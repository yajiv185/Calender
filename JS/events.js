let eventBoxHeader = (function () {
    let _defaultDate = "9/26/2018";
    let _$eventDate;
    let _initVariables = function () {
        _$eventDate = $("#eventDate");
    }

    let _setDateOnMouseEnter = function (e) {
        let $element = $(this);
        let date = $element.data("value");
        let newEventDate = utils.dateUtils.getTextForDate(date);
        _$eventDate.text(newEventDate);
        _showEvents(date);
    }

    let _setDateOnMouseLeave = function (e) {
        let newEventDate = utils.dateUtils.getTextForDate(_defaultDate);
        _$eventDate.text(newEventDate);
        _showEvents(_defaultDate);
    }

    let _setDefaultDate = function(){
        $element = $(this);
        _defaultDate = $element.data("value");
    }

    let _openAddEventPopup = function(){
        $(".add-event-popup, .blackout-window").show();
    }

    let _showEvents = function (date) {
        let obj = localStorage.getItem("ListOfEvents");
        let tempObj;
        if(obj)
        {
            obj = JSON.parse(obj);
            let dateObj = new Date(date);
            tempObj = obj[dateObj.getFullYear()];
            tempObj = tempObj ?tempObj[dateObj.getMonth()]:tempObj;
            tempObj = tempObj ?tempObj[dateObj.getDate()]:tempObj;
        }
        let eventHTML;
        if(tempObj)
        {
            eventHTML="<span>Events:-</span><ul style=\"display:inline-block\">";
            tempObj.forEach(item=>{
                eventHTML+="<li>"+item.time.from+" to "+item.time.to+
                           ": "+ item.title+"</li>";
            })
        }
        else
        {
            eventHTML="<span>No Events.</span>";
            console.log(eventHTML);
        }
        $(".event-list div").html(eventHTML);
    }

    let registerEvents = function () {
        _initVariables();
        $(document).on("mouseenter", ".calendar tbody td", _setDateOnMouseEnter);
        $(document).on("mouseleave",  ".calendar tbody td",_setDateOnMouseLeave);
        $(document).on("click", ".calendar tbody td", _setDefaultDate);
        $("#addEventBtn").on("click", _openAddEventPopup);
    }

    return {
        registerEvents
    }
})();

let monthChange = (function () {
    let _$prevMonth;
    let _$nextMonth;
    let _$calendarMonth;
    let _initVariables = function () {
        _$prevMonth = $("#prevMonth");
        _$nextMonth = $("#nextMonth");
        _$calendarMonth = $("#calendarMonth");
    }
    let _setDate = function () {
        let cuurMonth = _$calendarMonth.data("month");
        let monthToAdd = $(this).data("value");
        let resutantMonth = cuurMonth + monthToAdd;
        resutantMonth -= resutantMonth > 12 ? 12 : 0;
        resutantMonth += resutantMonth <= 0 ? 12 : 0;
        _$calendarMonth.data("month", resutantMonth);
        let month = utils.dateUtils.getMonth(resutantMonth);
        _$calendarMonth.text(month.toUpperCase());
        _setDateAccordingToMonth(resutantMonth);

    }
    let registerEvents = function () {
        _initVariables();
        $("#nextMonth").on("click", _setDate);
        $("#prevMonth").on("click", _setDate);
    }
    let _setDateAccordingToMonth = function (month) {
        let year = 2018;
        let date = new Date(month + "/1/" + year);
        //first raw
        let firstRaw;
        date.setDate(date.getDate() - 7);
        let tempDate = new Date(date);
        while (tempDate.getDay() !== 1) {
            tempDate.setDate(tempDate.getDate() + 1);
        }
        for (let i = 1; i < 7; i++) {
            let row = "";
            for (let j = 0; j < 7; j++) {
                tempDate = new Date(tempDate);
                let currDateMonth = tempDate.getMonth();
                let className = currDateMonth === (month % 12)
                    ? "next-month" : currDateMonth + 1 === month ? "" : "prev-month";
                let tempString = "<td data-value=\"" + tempDate.toLocaleDateString()
                    + "\" class=\"" + className + "\">" + tempDate.getDate() + "</td>";
                row += tempString;
                tempDate.setDate(tempDate.getDate() + 1);
            }
            $("#row" + i).html(row);
        }
    }

    return {
        registerEvents
    }
})();

let utils = (function () {
    let dateUtils = (function () {
        let _months = ["January", "February", "March",
            "April", "May", "June", "July", "August",
            "September", "October", "November", "December"];
        let getMonth = function (month) {
            return _months[month - 1];
        }
        let _getDayText = function (day) {
            switch (day) {
                case 1:
                    return "1st";
                case 2:
                    return "2nd";
                case 3:
                    return "3rd";
                default:
                    return (day + "th");
            }
        }
        let getTextForDate = function (value) {
            let date = new Date(value);
            let dateText;
            if (date) {
                dateText = _getDayText(date.getDate());
                dateText += " " + getMonth(date.getMonth() + 1);
                dateText += ", " + date.getFullYear();
            }
            return dateText;
        }
        return {
            getTextForDate,
            getMonth
        }
    })();

    return {
        dateUtils
    }
})();

let eventPopupHandler = (function(){

    let _saveEvent = function(){
        let obj = localStorage.getItem("ListOfEvents");
        let dateValue = new Date($("#popUpDate input").val());
        let tempObj={};
        tempObj["time"]={from: $("#popUpTimeFrom").val(),to: $("#popUpTimeTo").val()};
        tempObj["title"]=$("#popUpTitle input").val();
        if(!obj)
        {
            obj={};
        }
        else
        {
        obj=JSON.parse(obj);
        }
        if(!obj[dateValue.getFullYear()])
        {
            obj[dateValue.getFullYear()] = {};
        };
        if(!obj[dateValue.getFullYear()][dateValue.getMonth()])
        {
            obj[dateValue.getFullYear()][dateValue.getMonth()] = {};
        };
        if(!obj[dateValue.getFullYear()][dateValue.getMonth()][dateValue.getDate()])
        {
            obj[dateValue.getFullYear()][dateValue.getMonth()][dateValue.getDate()] = [];
        };
        obj[dateValue.getFullYear()][dateValue.getMonth()][dateValue.getDate()].push(tempObj);
        obj[dateValue.getFullYear()][dateValue.getMonth()][dateValue.getDate()] = obj[dateValue.getFullYear()][dateValue.getMonth()][dateValue.getDate()].sort((a,b)=>{
            a=a.time;
            b=b.time;
            if(a.from===b.from)
                return a.to > b.to;
            else
                a.from > b.from;
        });
        localStorage.setItem("ListOfEvents",JSON.stringify(obj));
        _cancelEvent();
    }
    let _cancelEvent = function(){
        $(".add-event-popup, .blackout-window").hide();
    }

    let registerEvents = function(){
        $("#saveEvent").on("click", _saveEvent);
        $("#cancelEvent").on("click", _cancelEvent);
    }
    return {
        registerEvents
    }
})();

eventBoxHeader.registerEvents();
monthChange.registerEvents();
eventPopupHandler.registerEvents();