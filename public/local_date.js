
export function get_local_date(strdate) {
    let utcdate = new Date(strdate);
    return new Date(utcdate.getTime() - utcdate.getTimezoneOffset() * 60000);
}


function add_leading_zero(number) {
    let str_number = String(number);
    if (str_number.length == 1) {
        str_number = '0' + str_number;
    }
    return str_number;
}

export function get_str_local_date(strdate) {
    let local_date = get_local_date(strdate);
    return `${add_leading_zero(local_date.getDate())}`
    + `.${add_leading_zero(local_date.getMonth()+1)}`
    + `.${local_date.getFullYear()}`
    + ` ${add_leading_zero(local_date.getHours())}:${add_leading_zero(local_date.getMinutes())}`;
}