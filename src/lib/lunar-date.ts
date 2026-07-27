const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const VIETNAM_UTC_OFFSET = 7;
const PI = Math.PI;

export type LunarDate = {
  day: number;
  month: number;
  year: number;
  leap: boolean;
  yearName: string;
};

function integer(value: number) {
  return Math.floor(value);
}

function julianDayFromDate(day: number, month: number, year: number) {
  const a = integer((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jd =
    day +
    integer((153 * m + 2) / 5) +
    365 * y +
    integer(y / 4) -
    integer(y / 100) +
    integer(y / 400) -
    32045;

  if (jd < 2_299_161) {
    jd =
      day +
      integer((153 * m + 2) / 5) +
      365 * y +
      integer(y / 4) -
      32_083;
  }
  return jd;
}

function newMoon(k: number) {
  const t = k / 1236.85;
  const t2 = t * t;
  const t3 = t2 * t;
  const degrees = PI / 180;
  let result =
    2_415_020.75933 +
    29.53058868 * k +
    0.0001178 * t2 -
    0.000000155 * t3;
  result += 0.00033 * Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * degrees);

  const meanAnomaly =
    359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
  const moonAnomaly =
    306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
  const latitudeArgument =
    21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;
  const correction =
    (0.1734 - 0.000393 * t) * Math.sin(meanAnomaly * degrees) +
    0.0021 * Math.sin(2 * meanAnomaly * degrees) -
    0.4068 * Math.sin(moonAnomaly * degrees) +
    0.0161 * Math.sin(2 * moonAnomaly * degrees) -
    0.0004 * Math.sin(3 * moonAnomaly * degrees) +
    0.0104 * Math.sin(2 * latitudeArgument * degrees) -
    0.0051 * Math.sin((meanAnomaly + moonAnomaly) * degrees) -
    0.0074 * Math.sin((meanAnomaly - moonAnomaly) * degrees) +
    0.0004 * Math.sin((2 * latitudeArgument + meanAnomaly) * degrees) -
    0.0004 * Math.sin((2 * latitudeArgument - meanAnomaly) * degrees) -
    0.0006 * Math.sin((2 * latitudeArgument + moonAnomaly) * degrees) +
    0.001 * Math.sin((2 * latitudeArgument - moonAnomaly) * degrees) +
    0.0005 * Math.sin((2 * moonAnomaly + meanAnomaly) * degrees);
  const deltaT =
    t < -11
      ? 0.001 +
        0.000839 * t +
        0.0002261 * t2 -
        0.00000845 * t3 -
        0.000000081 * t * t3
      : -0.000278 + 0.000265 * t + 0.000262 * t2;
  return result + correction - deltaT;
}

function sunLongitude(julianDay: number) {
  const t = (julianDay - 2_451_545) / 36_525;
  const t2 = t * t;
  const degrees = PI / 180;
  const meanAnomaly =
    357.5291 + 35_999.0503 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
  const meanLongitude =
    280.46645 + 36_000.76983 * t + 0.0003032 * t2;
  const delta =
    (1.9146 - 0.004817 * t - 0.000014 * t2) *
      Math.sin(degrees * meanAnomaly) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * degrees * meanAnomaly) +
    0.00029 * Math.sin(3 * degrees * meanAnomaly);
  const longitude = (meanLongitude + delta) * degrees;
  return longitude - PI * 2 * integer(longitude / (PI * 2));
}

function newMoonDay(k: number) {
  return integer(newMoon(k) + 0.5 + VIETNAM_UTC_OFFSET / 24);
}

function sunLongitudeSector(dayNumber: number) {
  return integer(
    (sunLongitude(dayNumber - 0.5 - VIETNAM_UTC_OFFSET / 24) / PI) * 6,
  );
}

function lunarMonthEleven(year: number) {
  const offset = julianDayFromDate(31, 12, year) - 2_415_021;
  const k = integer(offset / 29.530588853);
  let result = newMoonDay(k);
  if (sunLongitudeSector(result) >= 9) result = newMoonDay(k - 1);
  return result;
}

function leapMonthOffset(monthEleven: number) {
  const k = integer((monthEleven - 2_415_021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let index = 1;
  let arc = sunLongitudeSector(newMoonDay(k + index));
  do {
    last = arc;
    index += 1;
    arc = sunLongitudeSector(newMoonDay(k + index));
  } while (arc !== last && index < 14);
  return index - 1;
}

function convertSolarToLunar(
  day: number,
  month: number,
  year: number,
): Omit<LunarDate, "yearName"> {
  const dayNumber = julianDayFromDate(day, month, year);
  const k = integer((dayNumber - 2_415_021.076998695) / 29.530588853);
  let monthStart = newMoonDay(k + 1);
  if (monthStart > dayNumber) monthStart = newMoonDay(k);

  let monthElevenA = lunarMonthEleven(year);
  let monthElevenB = monthElevenA;
  let lunarYear: number;
  if (monthElevenA >= monthStart) {
    lunarYear = year;
    monthElevenA = lunarMonthEleven(year - 1);
  } else {
    lunarYear = year + 1;
    monthElevenB = lunarMonthEleven(year + 1);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const difference = integer((monthStart - monthElevenA) / 29);
  let lunarMonth = difference + 11;
  let leap = false;

  if (monthElevenB - monthElevenA > 365) {
    const leapOffset = leapMonthOffset(monthElevenA);
    if (difference >= leapOffset) {
      lunarMonth = difference + 10;
      leap = difference === leapOffset;
    }
  }

  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && difference < 4) lunarYear -= 1;

  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap };
}

function vietnamDateParts(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: VIETNAM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  const year = read("year");
  const month = read("month");
  const day = read("day");
  return year && month && day ? { year, month, day } : null;
}

export function lunarYearName(year: number) {
  const stems = [
    "Giáp",
    "Ất",
    "Bính",
    "Đinh",
    "Mậu",
    "Kỷ",
    "Canh",
    "Tân",
    "Nhâm",
    "Quý",
  ];
  const branches = [
    "Tý",
    "Sửu",
    "Dần",
    "Mão",
    "Thìn",
    "Tỵ",
    "Ngọ",
    "Mùi",
    "Thân",
    "Dậu",
    "Tuất",
    "Hợi",
  ];
  return `${stems[(year + 6) % 10]} ${branches[(year + 8) % 12]}`;
}

export function getVietnameseLunarDate(value: string | null): LunarDate | null {
  if (!value) return null;
  const solar = vietnamDateParts(value);
  if (!solar) return null;
  const lunar = convertSolarToLunar(solar.day, solar.month, solar.year);
  return { ...lunar, yearName: lunarYearName(lunar.year) };
}

export function formatVietnameseLunarDate(value: string | null) {
  const lunar = getVietnameseLunarDate(value);
  if (!lunar) return null;
  const day = String(lunar.day).padStart(2, "0");
  const month = String(lunar.month).padStart(2, "0");
  return `Nhằm ngày ${day} tháng ${month}${lunar.leap ? " nhuận" : ""} năm ${
    lunar.yearName
  }`;
}
