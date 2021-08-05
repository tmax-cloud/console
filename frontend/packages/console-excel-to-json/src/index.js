const fs = require('fs');
const getXlsxStream = require('./parse.js');
const cliProgress = require('cli-progress');
require('dotenv').config();

const LanguageMap = {
  KR: { column: 'String(KR)', file: 'ko.json' },
  EN: { column: 'String(EN)', file: 'en.json' },
};

const KeyMap = {
  COMMON: { label: 'COMMON', sheet: 'Common String', column: 'StringID' },
  SINGLE: { label: 'SINGLE', sheet: 'Single', column: 'String ID' },
  MULTI: { label: 'MULTI', sheet: 'Multi', column: 'String ID' },
  DESCRIPTION: { label: 'DESCRIPTION', sheet: 'Description', column: 'String ID' },
};

const progressBar = new cliProgress.SingleBar({ format: 'progress [{bar}] {percentage}% | {value}/{total} bytes' }, cliProgress.Presets.lagacy);

const dir = './langs';

/**
 * EXCEL에 입력된 문자열을 수정
 * @param {string} str 수정할 문자열
 * @param {string} key String ID 컬럼 값
 * @param {Object} option 문자열 수정에 대한 옵션
 * @param {boolean} option.addSingleQuote 문자열 앞에 "'" 문자를 추가할 지 여부
 */
const fixExcelString = (str, key, option = {}) => {
  if (key === 'MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_SEARCHBAR_2') {
    return fixExcelString(str, '', { addSingleQuote: true });
  }
  // 일부 스트링에 '{{0}}'가 앞에 위치할 경우 따옴표가 삭제되는 이상 현상 발생. 의도적으로 따옴표를 붙임
  if (option && option.addSingleQuote) {
    return "'" + str;
  }
  return !!str ? (str + '').replace(/\"/g, "'").replace(/\r/g, '') : '';
};

/**
 * JSON으로 저장할 문자열을 수정
 * @param {string} str 수정할 문자열
 */
const fixJsonString = str => {
  return (str + '').replace(/\\\\/g, '\\');
};

/**
 * 삭제된 키인지 검사
 * @param {Object} data 데이터 객체
 */
const isDeletedKey = data => {
  if (process.env.INCLUDE_UNUSED_STRING === 'Y') {
    return false;
  }
  const deletedStringColumn = data.raw['삭제여부'];
  if (deletedStringColumn && deletedStringColumn.toString().toUpperCase() === 'O') {
    return true;
  }
  return false;
};

/**
 * 유효한 키인지 검사
 * @param {string} str 키
 */
const isValidKey = str => {
  if (!str) {
    return false;
  }
  // "MSG_"이나 "%"으로 시작하지 않는 키는 넣지 않음
  if (!((str + '').startsWith('MSG_') || (str + '').toString().startsWith('%'))) {
    return false;
  }
  return true;
};

/**
 * EXCEL 파일을 읽어 파싱된 결과물을 객체로 담아 리턴
 * @param {string} filePath 파일 경로
 * @param {string} sheetName 시트 이름
 * @param {string} keyColumn 키 컬럼 이름
 * @returns LanguageMap을 키로 하는 객체 (ex: { KR: {...}, EN: {...}})
 */
const read = async (filePath, sheetName, keyColumn) => {
  const stream = await getXlsxStream({ filePath, sheet: sheetName, withHeader: true, ignoreEmpty: true });
  const result = {};
  let isFirst = true;
  let totalSheetSize = 0;

  /**
   * | A column  |  B column  |
   * | --------- | ---------- |
   * |   hello   |    123     |
   * 엑셀 구성이 위와 같을 때, data 구성은 다음과 같습니다.
   * {
   *    "raw":  { "A column": "hello", "B column": 123.123 },
   *    "header": [],
   *    "totalSheetSize": 1110,
   *    "processedSheetSize": 1110
   * }
   */
  stream.on('data', data => {
    if (isFirst) {
      totalSheetSize = data.totalSheetSize;
      progressBar.start(data.totalSheetSize, 0);
      isFirst = false;
    } else {
      const key = data.raw[keyColumn];
      if (!isDeletedKey(data) && isValidKey(key)) {
        for (const lang of Object.keys(LanguageMap)) {
          let value = data.raw[LanguageMap[lang].column];
          value = fixExcelString(value, key);
          result[lang] = { ...result[lang], [key]: value };
        }
      }
    }
    progressBar.update(data.processedSheetSize);
  });

  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      progressBar.update(totalSheetSize);
      resolve(result);
    });
    stream.on('error', error => {
      reject(new Error(error));
    });
  }).finally(() => progressBar.stop());
};

/**
 * 파싱된 결과물이 담긴 JSON 파일 생성
 * @param {string} filePath 파일 경로
 * @param {Object} data JSON 객체
 */
const write = (filePath, data) => {
  console.log(`Writing to ${filePath}...`);
  const jsonData = fixJsonString(JSON.stringify(data, null, 2));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.writeFile(filePath, jsonData, { encoding: 'utf8' }, error => {
    if (error) throw error;
    console.log(`Writing to ${filePath} finished successfully!`);
  });
};

/** script start */
console.log('--------------------------------------------------------------------------------');
console.log('                            Convert EXCEL to JSON                               ');
console.log('--------------------------------------------------------------------------------');

(async function main() {
  const commonFile = '16.uiSTR_HyperCloud5.xlsx';
  const descFile = '16.uiSTR_HyperCloud5_Description.xlsx';

  const result = {};

  // get common/single/multi string
  for (const key of Object.keys(KeyMap)) {
    if (key !== KeyMap.DESCRIPTION.label) {
      console.log(`${KeyMap[key].sheet} sheet conversion start...`);
      const data = await read(commonFile, KeyMap[key].sheet, KeyMap[key].column);
      for (const lang of Object.keys(LanguageMap)) {
        result[lang] = { ...result[lang], [KeyMap[key].label]: data[lang] };
      }
      console.log(`[KR] ${key} Size:`, Object.keys(result.KR[key]).length); // result's size check
    }
  }

  // get description string
  console.log(`${KeyMap.DESCRIPTION.sheet} sheet conversion start...`);
  const data = await read(descFile, KeyMap.DESCRIPTION.sheet, KeyMap.DESCRIPTION.column);
  for (const lang of Object.keys(LanguageMap)) {
    result[lang] = { ...result[lang], [KeyMap.DESCRIPTION.label]: data[lang] };
  }
  // result's size check
  console.log(`[KR] ${KeyMap.DESCRIPTION.label} Size:`, Object.keys(result.KR.DESCRIPTION).length);

  // write file
  for (const lang of Object.keys(LanguageMap)) {
    write(`${dir}/${LanguageMap[lang].file}`, result[lang]);
  }
})();
/** script end */
