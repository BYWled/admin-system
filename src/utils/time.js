export const timeToDate = (timestamp, type) => {
    const datePoint = Temporal.Instant.from(timestamp); // TODO:Instant 平替 Date 对象，表示一个特定的时间点。但不是带时区的日期时间对象
    const date = datePoint.toZonedDateTimeISO(Temporal.Now.timeZoneId()); // TODO:转换为带时区的日期时间对象;获取当前时区的标识符
    const year = date.year.toString().padStart(4, '0');
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    const hours = date.hour.toString().padStart(2, '0');
    const minutes = date.minute.toString().padStart(2, '0');
    const seconds = date.second.toString().padStart(2, '0');

    if (type === 'date') {
        return `${year}-${month}-${day}`;
    }
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const numToTime = (num) => {
    const datePoint = Temporal.Instant.fromEpochMilliseconds(num); // TODO:fromEpochMilliseconds （毫秒）时间戳转换为时间点
    const date = datePoint.toZonedDateTimeISO(Temporal.Now.timeZoneId()); // TODO:转换为带时区的日期时间对象;获取当前时区的标识符
    const year = date.year.toString().padStart(4, '0');
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    const hours = date.hour.toString().padStart(2, '0');
    const minutes = date.minute.toString().padStart(2, '0');
    const seconds = date.second.toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}