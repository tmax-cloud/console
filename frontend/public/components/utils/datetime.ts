import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

// Behaves like moment.js's fromNow
export const fromNow = (dateTime, now = undefined, options = { omitSuffix: false }, t = undefined) => {
  if (!now) {
    now = new Date();
  }
  if (!t) {
    // t = useTranslation().t;
  }
  dateTime = new Date(dateTime);
  const secondsAgo = (now.getTime() - dateTime.getTime()) / 1000;
  const minutesAgo = secondsAgo / 60;
  const hoursAgo = minutesAgo / 60;
  const daysAgo = hoursAgo / 24;

  if (daysAgo > 548) {
    const count = Math.round(daysAgo / 365);
    return options.omitSuffix ? `${count} ${t ? t('CONTENT:YEARS') : 'years'}` : `${count} ${t ? t('CONTENT:YEARSAGO') : 'years ago'}`;
  }
  if (daysAgo > 320) {
    return options.omitSuffix ? (t ? t('CONTENT:YEAR') : 'year') : t ? t('CONTENT:AYEARAGO') : 'a year ago';
  }
  if (daysAgo > 45) {
    const count = Math.round(daysAgo / 30);
    return options.omitSuffix ? `${count} ${t ? t('CONTENT:MONTHS') : 'months'}` : `${count} ${t ? t('CONTENT:MONTHSAGO') : 'months ago'}`;
  }
  if (daysAgo > 26) {
    return options.omitSuffix ? (t ? t('CONTENT:MONTH') : 'month') : t ? t('CONTENT:AMONTHAGO') : 'a month ago';
  }
  if (hoursAgo > 36) {
    const count = Math.round(daysAgo);
    return options.omitSuffix ? `${count} ${t ? t('CONTENT:DAYS') : 'DAYS'}` : `${count} ${t ? t('CONTENT:DAYSAGO') : 'days ago'}`;
  }
  if (hoursAgo > 22) {
    return options.omitSuffix ? (t ? t('CONTENT:DAY') : 'day') : t ? t('CONTENT:ADAYAGO') : 'a day ago';
  }
  if (minutesAgo > 90) {
    const count = Math.round(hoursAgo);
    return options.omitSuffix ? `${count} ${t ? t('CONTENT:HOURS') : 'hours'}` : `${count} ${t ? t('CONTENT:HOURSAGO') : 'hours ago'}`;
  }
  if (minutesAgo > 45) {
    return options.omitSuffix ? (t ? t('CONTENT:HOUR') : 'hour') : t ? t('CONTENT:ANHOURAGO') : 'an hour ago';
  }
  if (secondsAgo > 90) {
    const count = Math.round(minutesAgo);
    return options.omitSuffix ? `${count} ${t ? t('CONTENT:MINUTES') : 'minutes'}` : `${count} ${t ? t('CONTENT:MINUTESAGO') : 'minutes ago'}`;
  }
  if (secondsAgo > 45) {
    return options.omitSuffix ? (t ? t('CONTENT:MINUTE') : 'minute') : t ? t('CONTENT:AMINUTEAGO') : 'a minute ago';
  }
  if (secondsAgo > 15) {
    return options.omitSuffix ? (t ? t('CONTENT:FEWSECONDS') : 'few seconds') : t ? t('CONTENT:LESSTHANAMINUTEAGO') : 'less than a minute ago';
  }

  if (secondsAgo >= 0) {
    return options.omitSuffix ? (t ? t('CONTENT:FEWSECONDS') : 'few seconds') : t ? t('CONTENT:AFEWSECONDSAGO') : 'a few seconds ago';
  }

  if (secondsAgo > -45) {
    return t ? t('CONTENT:AFEWSECONDSFROMNOW') : 'a few seconds from now';
  }
  if (secondsAgo > -90) {
    return t ? t('CONTENT:AMINUTEFROMNOW') : 'a minute from now';
  }
  if (minutesAgo > -45) {
    return `${-Math.round(minutesAgo)} ${t ? t('CONTENT:MINUTESFROMNOW') : 'minutes from now'}`;
  }
  if (minutesAgo > -90) {
    return t ? t('CONTENT:ANHOURFROMNOW') : 'an hour from now';
  }
  if (hoursAgo > -22) {
    return `${-Math.round(hoursAgo)} ${t ? t('CONTENT:HOURSFROMNOW') : 'hours from now'}`;
  }
  if (hoursAgo > -36) {
    return t ? t('CONTENT:ADAYFROMNOW') : 'a day from now';
  }
  if (daysAgo > -26) {
    return `${-Math.round(daysAgo)} ${t ? t('CONTENT:DAYSFROMNOW') : 'days from now'}`;
  }
  if (daysAgo > -45) {
    return t ? t('CONTENT:AMONTHFROMNOW') : 'a month from now';
  }
  if (daysAgo > -320) {
    return `${-Math.round(daysAgo / 30)} ${t ? t('CONTENT:MONTHSFROMNOW') : 'months from now'}`;
  }
  if (daysAgo > -580) {
    return t ? t('CONTENT:AYEARFROMNOW') : 'a year from now';
  }
  return `${-Math.round(daysAgo / 365)} ${t ? t('CONTENT:YEARSFROMNOW') : 'years from now'}`;
};

export const isValid = (dateTime: Date) => dateTime instanceof Date && !_.isNaN(dateTime.valueOf());

// Formats a duration in milliseconds like '1h10m23s'.
export const formatDuration = (ms: number) => {
  if (!_.isFinite(ms) || ms < 0) {
    return '';
  }
  const { t } = useTranslation();
  const totalSeconds = Math.round(ms / 1000);
  const secondsInHour = 60 * 60;
  const secondsInMinute = 60;

  const hours = Math.floor(totalSeconds / secondsInHour);
  const minutes = Math.floor((totalSeconds % secondsInHour) / secondsInMinute);
  const seconds = totalSeconds % secondsInMinute;

  let formatted = '';
  if (hours) {
    formatted += `${hours}${t('CONTENT:H')} `;
  }
  if (hours || minutes) {
    formatted += `${minutes}${t('CONTENT:M')} `;
  }
  formatted += `${seconds}${t('CONTENT:S')}`;

  return formatted;
};
