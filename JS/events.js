let eventBoxHeader = (function () {
    let _$currSelectedElement = $("td[data-value=\"9/23/2018\"]");
    let _$eventDate = $("#eventDate");

    let _setDateOnMouseEnter = function () {
        let date = $(this).data("value");
        let newEventDate = utils.dateUtils.getTextForDate(date);
        _$eventDate.data("value", date);
        _$eventDate.text(newEventDate);
        _showEvents(date);
    }

    let _setDateOnMouseLeave = function () {
        let newEventDate = utils.dateUtils.getTextForDate(_$currSelectedElement.data("value"));
        _$eventDate.text(newEventDate);
        _$eventDate.data("value", _$currSelectedElement.data("value"));
        _showEvents(_$currSelectedElement.data("value"));
    }

    let _setDefaultDate = function () {
        _$currSelectedElement.removeClass("selected-day")
        _$currSelectedElement = $(this);
        _$currSelectedElement.addClass("selected-day");

    }

    let _openAddEventPopup = function () {
        eventPopupHandler.openPopup();
    }

    let _showEvents = function (date) {
        let obj = utils.localStorageUtils.getItem(utils.localStorageUtils.getEventListKey);
        let tempObj;
        if (obj) {
            let dateObj = new Date(date);
            tempObj = obj[dateObj.getFullYear()];
            tempObj = tempObj ? tempObj[dateObj.getMonth()] : tempObj;
            tempObj = tempObj ? tempObj[dateObj.getDate()] : tempObj;
        }
        let eventHTML = _getHtmlForEventList(tempObj);
        $(".event-list").html(eventHTML);
    }
    let _getHtmlForEventList = function (obj) {
        let _eventHTML;
        if (obj && obj.length > 0) {
            _eventHTML = "<table><tr><td><span class=\"event-text\">Events:-" +
                "</span></td><td><ul>"
            obj.forEach((item, index) => {
                _eventHTML += "<li class=\"margin10 " + (index % 2 ? "li-odd" : "li-even")
                    + "\"><div><span " +
                    "class=\"event-content\">Time:-&nbsp;&nbsp;</span>" +
                    "<span class=\"event-info\">" + item.time.from +
                    " to " + item.time.to + "</span></div>" +
                    "<table class=\"margin-top-5\"><tr><td " +
                    "class=\"event-content\">Event:- &nbsp;&nbsp;</td>" +
                    "<td class=\"event-info\">" + item.title + "</td></tr></table></li>";
            });
        }
        else {
            _eventHTML = "<span class=\"no-event\">No Events.</span>";
        }
        return _eventHTML;
    }

    let registerEvents = function () {
        $(document).on("mouseenter", ".calendar tbody td", _setDateOnMouseEnter);
        $(document).on("mouseleave", ".calendar tbody td", _setDateOnMouseLeave);
        $(document).on("click", ".calendar tbody td", _setDefaultDate);
        $("#addEventBtn").on("click", _openAddEventPopup);
    }

    return {
        registerEvents
    }
})();

let monthChange = (function () {
    let _$calendarMonth = $("#calendarMonth");
    let _setDate = function () {
        let cuurMonth = _$calendarMonth.data("month");
        let monthToAdd = $(this).data("value");
        let resultantMonth = cuurMonth + monthToAdd;  //adding +1 or -1 to current selected month
        resultantMonth -= resultantMonth > 12 ? 12 : 0; //if resultant month become >12 then make it less then 12 by subtracting 12 from it
        resultantMonth += resultantMonth <= 0 ? 12 : 0; //if resultant month become <0 then makeing it >0 by adding 12 to it
        _$calendarMonth.data("month", resultantMonth);
        let month = utils.dateUtils.getMonth(resultantMonth);
        _$calendarMonth.text(month.toUpperCase());
        _setDateAccordingToMonth(resultantMonth);

    }
    let _setDateAccordingToMonth = function (month) {
        let year = 2018;
        let date = new Date(month + "/1/" + year); //getting fisrt date of month
        //first raw
        let firstRaw;
        date.setDate(date.getDate() - 7); //removing 7 from it to get previous 7 days
        let tempDate = new Date(date);
        while (tempDate.getDay() !== 1) { //looping until get monday
            tempDate.setDate(tempDate.getDate() + 1);
        }
        for (let i = 1; i < 7; i++) {
            let row = "";
            for (let j = 0; j < 7; j++) { // creating calender
                tempDate = new Date(tempDate);
                let className = _getClassName(month, tempDate);
                let tempString = "<td data-value=\"" + tempDate.toLocaleDateString()
                    + "\" class=\"" + className + "\">" + tempDate.getDate() + "</td>";
                row += tempString;
                tempDate.setDate(tempDate.getDate() + 1);
            }
            $("#row" + i).html(row);
        }
    }

    let _getClassName = function (month, date) {
        let currDateMonth = date.getMonth();
        let currDateYear = date.getFullYear();
        let name = currDateMonth === (month % 12)
            ? "next-month" : currDateMonth + 1 === month ? "" : "prev-month";
        let obj = utils.localStorageUtils.getItem(utils.localStorageUtils.getEventListKey);
        if (obj && obj[currDateYear] && obj[currDateYear][currDateMonth]
            && obj[currDateYear][currDateMonth][date.getDate()]   // checking whether event exist or not
            && obj[currDateYear][currDateMonth][date.getDate()].length > 0) {
            name += " event";
        }
        return name;
    }

    let registerEvents = function () {
        $("#nextMonth").on("click", _setDate);
        $("#prevMonth").on("click", _setDate);
    }

    return {
        registerEvents
    }
})();

let utils = (function () {

    let localStorageUtils = (function () {

        let _localStorageKeyForEventList = "ListOfEvents";
        let _localStorageExist = typeof (localStorage) ? true : false;
        let getItem = function (key) {
            return _localStorageExist
                ? JSON.parse(localStorage.getItem(key))
                : null;
        }
        let setItem = function (key, value) {
            if (_localStorageExist) {
                let objString = typeof (value) !== "string" ? JSON.stringify(value) : value;
                localStorage.setItem(key, objString);
            }
        }
        let getEventListKey = function () {
            return _localStorageKeyForEventList;
        }
        return {
            getItem,
            setItem,
            getEventListKey
        }
    })();

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
        localStorageUtils,
        dateUtils
    }
})();

let eventPopupHandler = (function () {

    let _blackoutWindow = $(".blackout-window");
    let _eventPopupWindow = $(".add-event-popup");
    let _$popupDate = $("#popUpDate");
    let _$popUpTimeFrom = $("#popUpTimeFrom");
    let _$popUpTimeTo = $("#popUpTimeTo");
    let _$popUpTitle = $("#popUpTitle");
    let _$eventContainerDate = $("#eventDate");
    let _$enableBtn = $("#enableBtn");
    let _saveEvent = function () {
        let obj = utils.localStorageUtils.getItem(utils.localStorageUtils.getEventListKey);
        let dateValue = new Date(_$popupDate.val());
        let tempObj = {};
        tempObj["time"] = {
            from: _$popUpTimeFrom.val(),
            to: _$popUpTimeTo.val()
        };
        tempObj["title"] = _$popUpTitle.val();
        if (!obj) {
            obj = {};
        }
        if (!obj[dateValue.getFullYear()]) {
            obj[dateValue.getFullYear()] = {};
        };
        if (!obj[dateValue.getFullYear()][dateValue.getMonth()]) {
            obj[dateValue.getFullYear()][dateValue.getMonth()] = {};
        };
        if (!obj[dateValue.getFullYear()][dateValue.getMonth()][dateValue.getDate()]) {
            obj[dateValue.getFullYear()][dateValue.getMonth()][dateValue.getDate()] = [];
        };
        obj[dateValue.getFullYear()][dateValue.getMonth()][dateValue.getDate()].push(tempObj);
        obj[dateValue.getFullYear()][dateValue.getMonth()][dateValue.getDate()] = obj[dateValue.getFullYear()][dateValue.getMonth()][dateValue.getDate()].sort((a, b) => {
            a = a.time;
            b = b.time;
            if (a.from === b.from)
                return a.to > b.to;
            else
                a.from > b.from;
        });
        utils.localStorageUtils.setItem(utils.localStorageUtils.getEventListKey, obj);
        closePopup();//closing popup
    }

    let openPopup = function () {
        _blackoutWindow.show();
        _eventPopupWindow.show();
        let date = new Date(_$eventContainerDate.data("value"));
        let dateString = date.getFullYear() + "-" +
            ("00" + (date.getMonth() + 1)).substr(-2) + "-" +
            ("00" + date.getDate()).substr(-2);
        _$popupDate.val(dateString);

    }
    let closePopup = function () {
        _blackoutWindow.hide();
        _eventPopupWindow.hide();
    }

    let _enableDate = function () {
        if (_$enableBtn.hasClass("cancel-event")) {
            _$popupDate.prop("disabled", true);
            _$enableBtn.removeClass("cancel-event").addClass("date-enable-button").text("Enable");
        }
        else {
            _$popupDate.prop("disabled", false);
            _$enableBtn.addClass("cancel-event").removeClass("date-enable-button").text("Disable");
        }
    }

    let registerEvents = function () {
        $("#saveEvent").on("click", _saveEvent);
        $("#cancelEvent").on("click", closePopup);
        $("#enableBtn").on("click", _enableDate);
    }
    return {
        registerEvents,
        openPopup,
        closePopup
    }
})();

$(document).ready(function () {
    eventBoxHeader.registerEvents();
    monthChange.registerEvents();
    eventPopupHandler.registerEvents();
    $("#nextMonth").trigger("click");
    $("#prevMonth").trigger("click");
    $("td[data-value=\"9/15/2018\"]").trigger("mouseover");
    $("td[data-value=\"9/15/2018\"]").trigger("click");
});