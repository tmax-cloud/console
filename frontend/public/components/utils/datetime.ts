// import React from 'react';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

// Behaves like moment.js's fromNow
export const fromNow = (dateTime, now = undefined, options = { omitSuffix: false }, t = undefined) => {
  if (!now) {
    now = new Date();
  }
  if (!t) {
    t = useTranslation().t;
  }
  dateTime = new Date(dateTime);
  const secondsAgo = (now.getTime() - dateTime.getTime()) / 1000;
  const minutesAgo = secondsAgo / 60;
  const hoursAgo = minutesAgo / 60;
  const daysAgo = hoursAgo / 24;

  if (daysAgo > 548) {
    const count = Math.round(daysAgo / 365);
    return options.omitSuffix ? `${count} ${t ? t('DATETIME:YEARS') : 'years'}` : `${count} ${t ? t('DATETIME:YEARSAGO') : 'years ago'}`;
  }
  if (daysAgo > 320) {
    return options.omitSuffix ? (t ? t('DATETIME:YEAR') : 'year') : t ? t('DATETIME:AYEARAGO') : 'a year ago';
  }
  if (daysAgo > 45) {
    const count = Math.round(daysAgo / 30);
    return options.omitSuffix ? `${count} ${t ? t('DATETIME:MONTHS') : 'months'}` : `${count} ${t ? t('DATETIME:MONTHSAGO') : 'months ago'}`;
  }
  if (daysAgo > 26) {
    return options.omitSuffix ? (t ? t('DATETIME:MONTH') : 'month') : t ? t('DATETIME:AMONTHAGO') : 'a month ago';
  }
  if (hoursAgo > 36) {
    const count = Math.round(daysAgo);
    return options.omitSuffix ? `${count} ${t ? t('DATETIME:DAYS') : 'DAYS'}` : `${count} ${t ? t('DATETIME:DAYSAGO') : 'days ago'}`;
  }
  if (hoursAgo > 22) {
    return options.omitSuffix ? (t ? t('DATETIME:DAY') : 'day') : t ? t('DATETIME:ADAYAGO') : 'a day ago';
  }
  if (minutesAgo > 90) {
    const count = Math.round(hoursAgo);
    return options.omitSuffix ? `${count} ${t ? t('DATETIME:HOURS') : 'hours'}` : `${count} ${t ? t('DATETIME:HOURSAGO') : 'hours ago'}`;
  }
  if (minutesAgo > 45) {
    return options.omitSuffix ? (t ? t('DATETIME:HOUR') : 'hour') : t ? t('DATETIME:ANHOURAGO') : 'an hour ago';
  }
  if (secondsAgo > 90) {
    const count = Math.round(minutesAgo);
    return options.omitSuffix ? `${count} ${t ? t('DATETIME:MINUTES') : 'minutes'}` : `${count} ${t ? t('DATETIME:MINUTESAGO') : 'minutes ago'}`;
  }
  if (secondsAgo > 45) {
    return options.omitSuffix ? (t ? t('DATETIME:MINUTE') : 'minute') : t ? t('DATETIME:AMINUTEAGO') : 'a minute ago';
  }
  if (secondsAgo > 15) {
    return options.omitSuffix ? (t ? t('DATETIME:FEWSECONDS') : 'few seconds') : t ? t('DATETIME:LESSTHANAMINUTEAGO') : 'less than a minute ago';
  }

  if (secondsAgo >= 0) {
    return options.omitSuffix ? (t ? t('DATETIME:FEWSECONDS') : 'few seconds') : t ? t('DATETIME:AFEWSECONDSAGO') : 'a few seconds ago';
  }

  if (secondsAgo > -45) {
    return t ? t('DATETIME:AFEWSECONDSFROMNOW') : 'a few seconds from now';
  }
  if (secondsAgo > -90) {
    return t ? t('DATETIME:AMINUTEFROMNOW') : 'a minute from now';
  }
  if (minutesAgo > -45) {
    return `${-Math.round(minutesAgo)} ${t ? t('DATETIME:MINUTESFROMNOW') : 'minutes from now'}`;
  }
  if (minutesAgo > -90) {
    return t ? t('DATETIME:ANHOURFROMNOW') : 'an hour from now';
  }
  if (hoursAgo > -22) {
    return `${-Math.round(hoursAgo)} ${t ? t('DATETIME:HOURSFROMNOW') : 'hours from now'}`;
  }
  if (hoursAgo > -36) {
    return t ? t('DATETIME:ADAYFROMNOW') : 'a day from now';
  }
  if (daysAgo > -26) {
    return `${-Math.round(daysAgo)} ${t ? t('DATETIME:DAYSFROMNOW') : 'days from now'}`;
  }
  if (daysAgo > -45) {
    return t ? t('DATETIME:AMONTHFROMNOW') : 'a month from now';
  }
  if (daysAgo > -320) {
    return `${-Math.round(daysAgo / 30)} ${t ? t('DATETIME:MONTHSFROMNOW') : 'months from now'}`;
  }
  if (daysAgo > -580) {
    return t ? t('DATETIME:AYEARFROMNOW') : 'a year from now';
  }
  return `${-Math.round(daysAgo / 365)} ${t ? t('DATETIME:YEARSFROMNOW') : 'years from now'}`;
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
