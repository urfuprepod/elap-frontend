export const formatDate = (date: string) => {
    const cur = new Date(date);
    const year = cur.getFullYear();
    const month = `${cur.getMonth() + 1}`.padStart(2, "0");
    const day = `${cur.getDate()}`.padStart(2, '0');
    return [day,month, year].join('.')
};
