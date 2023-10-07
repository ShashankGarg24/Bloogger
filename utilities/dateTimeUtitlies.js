
export default function getCurrentDateTimeInMonthYearFormat(){
    var dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateTime = new Date().toLocaleDateString([],dateOptions);
    return dateTime
}

