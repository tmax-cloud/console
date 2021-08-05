/**
 * XLSX 파일을 일정한 형식의 스트림으로 변환합니다.
 * Based on https://github.com/Claviz/xlstream
 * 한글 인코딩 문제 때문에 xlstream 라이브러리를 일부 수정하였습니다.
 */
const fclone = require('fclone');
const path = require('path');
// const ssf = require('ssf');
const { Transform } = require('stream');
const StreamZip = require('node-stream-zip');
const saxStream = require('sax-stream');
const rename = require('deep-rename-keys');
const iconv = require('iconv-lite');

let currentSheetProcessedSize = 0;
let currentSheetSize = 0;

function lettersToNumber(letters) {
  return letters.split('').reduce((r, a) => r * 26 + parseInt(a, 36) - 9, 0);
}

function numbersToLetter(number) {
  let colName = '';
  let dividend = Math.floor(Math.abs(number));
  let rest;

  while (dividend > 0) {
    rest = (dividend - 1) % 26;
    colName = String.fromCharCode(65 + rest) + colName;
    dividend = parseInt(`${(dividend - rest) / 26}`);
  }
  return colName;
}

function applyHeaderToObj(obj, header) {
  if (!header || !header.length) {
    return obj;
  }
  const newObj = {};
  for (const columnName of Object.keys(obj)) {
    const index = lettersToNumber(columnName) - 1;
    newObj[header[index] || `[${columnName}]`] = obj[columnName];
  }
  return newObj;
}

/*function getFilledHeader(arr, header) {
  if (!header || !header.length) {
    return header;
  }
  const filledHeader = [];
  for (let i = 0; i < arr.length; i++) {
    filledHeader.push(header[i] ? header[i] : `[${numbersToLetter(i + 1)}]`);
  }
  return filledHeader;
}*/

function formatNumericValue(attr, value) {
  if (attr === 'inlineStr' || attr === 's') {
    return value;
  }
  return isNaN(value) ? value : Number(value);
}

function getTransform(strings, withHeader, ignoreEmpty) {
  let lastReceivedRow = 0;
  let header = [];
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, done) {
      let arr = [];
      // let formattedArr = [];
      let obj = {};
      // let formattedObj = {};
      const record = rename(fclone(chunk.record), key => {
        const keySplit = key.split(':');
        const tag = keySplit.length === 2 ? keySplit[1] : key;
        return tag;
      });
      const children = record.children ? (record.children.c.length ? record.children.c : [record.children.c]) : [];
      const nextRow = record.attribs ? parseInt(record.attribs.r) : lastReceivedRow + 1;
      if (!ignoreEmpty) {
        const emptyRowCount = nextRow - lastReceivedRow - 1;
        for (let i = 0; i < emptyRowCount; i++) {
          this.push({
            raw: {},
            /*raw: {
              obj: {},
              arr: [],
            },
            formatted: {
              obj: {},
              arr: [],
            },
            header: getFilledHeader(arr, header),*/
            processedSheetSize: currentSheetProcessedSize,
            totalSheetSize: currentSheetSize,
          });
        }
      }
      lastReceivedRow = nextRow;
      for (let i = 0; i < children.length; i++) {
        const ch = children[i];
        if (ch.children) {
          let value;
          const type = ch.attribs && ch.attribs.t;
          const columnName = ch.attribs && ch.attribs.r;
          // const formatId = ch.attribs && ch.attribs.s ? Number(ch.attribs.s) : 0;
          if (type === 'inlineStr') {
            value = ch.children.is.children.t.value;
          } else {
            value = ch.children.v.value;
            if (type === 's') {
              value = strings[value];
            }
          }
          value = formatNumericValue(type, value);
          let column = columnName ? columnName.replace(/[0-9]/g, '') : numbersToLetter(i + 1);
          const index = lettersToNumber(column) - 1;
          arr[index] = value;
          obj[column] = value;
          /*if (formatId) {
            let numFormat = formats[formatId];
            value = ssf.format(numFormat, value);
            value = formatNumericValue(type, value);
          }
          formattedArr[index] = value;
          formattedObj[column] = value;*/
        }
      }
      if (((typeof withHeader === 'number' && withHeader === lastReceivedRow - 1) || (typeof withHeader !== 'number' && withHeader)) && !header.length) {
        for (let i = 0; i < arr.length; i++) {
          const hasDuplicate = arr.filter(x => x === arr[i]).length > 1;
          header[i] = hasDuplicate ? `[${numbersToLetter(i + 1)}] ${arr[i]}` : arr[i];
        }
        done();
      } else {
        done(
          undefined,
          ignoreEmpty && !arr.length
            ? null
            : {
                raw: applyHeaderToObj(obj, header),
                /*raw: {
                  obj: applyHeaderToObj(obj, header),
                  arr,
                },
                formatted: {
                  obj: applyHeaderToObj(formattedObj, header),
                  arr: formattedArr,
                },
                header: getFilledHeader(arr, header),*/
                processedSheetSize: currentSheetProcessedSize,
                totalSheetSize: currentSheetSize,
              },
        );
      }
    },
    flush(callback) {
      callback();
    },
  });
}

/**
 * @param {object} options
 * @param {string} options.filePath Path to the XLSX file
 * @param {string|number} options.sheet If string is passed, finds sheet by it's name. If number, finds sheet by it's index.
 * @param {boolean|number} options.withHeader If true, column names will be taken from the first sheet row. If duplicated header name is found, column name will be prepended with column letter to maintain uniqueness. 0-based row location can be passed to this option if header is not located on the first row.
 * @param {boolean} options.ignoreEmpty If true, empty rows won't be emitted.
 */
module.exports = async function getXlsxStream(options) {
  const generator = getXlsxStreams({
    filePath: options.filePath,
    sheets: [
      {
        id: options.sheet,
        withHeader: options.withHeader,
        ignoreEmpty: options.ignoreEmpty,
      },
    ],
  });
  const stream = await generator.next();
  return stream.value;
};

async function* getXlsxStreams(options) {
  const sheets = [];
  const rels = {};
  // const numberFormats = {};
  // const formats = [];
  const strings = [];
  const zip = new StreamZip({
    file: options.filePath,
    storeEntries: true,
  });
  let zipEntries = {};
  let currentSheetIndex = 0;

  function setupGenericData() {
    return new Promise((resolve, reject) => {
      function processSharedStrings(numberFormats, formats) {
        /*for (let i = 0; i < formats.length; i++) {
          const format = numberFormats[formats[i]];
          if (format) {
            formats[i] = format;
          }
        }*/
        zip.stream('xl/sharedStrings.xml', (err, stream) => {
          if (stream) {
            stream
              .pipe(iconv.decodeStream('utf8'))
              .pipe(
                saxStream({
                  strict: true,
                  tag: ['x:si', 'si'],
                }),
              )
              .on('data', x => {
                const record = x.record;
                if (record.children.t) {
                  strings.push(record.children.t.value);
                } else if (!record.children.r.length) {
                  strings.push(record.children.r.children.t.value);
                } else {
                  let str = '';
                  for (let i = 0; i < record.children.r.length; i++) {
                    str += record.children.r[i].children.t.value;
                  }
                  strings.push(str);
                }
              });
            stream.on('end', () => {
              resolve();
            });
          } else {
            resolve();
          }
        });
      }

      function processStyles() {
        zip.stream(`xl/styles.xml`, (err, stream) => {
          if (stream) {
            stream.pipe(
              saxStream({
                strict: true,
                tag: ['x:cellXfs', 'x:numFmts', 'cellXfs', 'numFmts'],
              }),
            );
            /*.on('data', x => {
                if ((x.tag === 'numFmts' || x.tag === 'x:numFmts') && x.record.children) {
                  const children = x.record.children.numFmt.length ? x.record.children.numFmt : [x.record.children.numFmt];
                  for (let i = 0; i < children.length; i++) {
                    numberFormats[Number(children[i].attribs.numFmtId)] = children[i].attribs.formatCode;
                  }
                } else if ((x.tag === 'cellXfs' || x.tag === 'x:cellXfs') && x.record.children) {
                  for (let i = 0; i < x.record.children.xf.length; i++) {
                    const ch = x.record.children.xf[i];
                    formats[i] = Number(ch.attribs.numFmtId);
                  }
                }
              });*/
            stream.on('end', () => {
              processSharedStrings();
            });
          } else {
            processSharedStrings();
          }
        });
      }

      function processWorkbook() {
        zip.stream('xl/workbook.xml', (err, stream) => {
          stream
            .pipe(
              saxStream({
                strict: true,
                tag: ['x:sheet', 'sheet'],
              }),
            )
            .on('data', x => {
              const attribs = x.record.attribs;
              sheets.push({ name: attribs.name, relsId: attribs['r:id'] });
            });
          stream.on('end', () => {
            processStyles();
          });
        });
      }

      function getRels() {
        zip.stream('xl/_rels/workbook.xml.rels', (err, stream) => {
          stream
            .pipe(
              saxStream({
                strict: true,
                tag: ['x:Relationship', 'Relationship'],
              }),
            )
            .on('data', x => {
              rels[x.record.attribs.Id] = path.basename(x.record.attribs.Target);
            });
          stream.on('end', () => {
            processWorkbook();
          });
        });
      }

      zip.on('ready', () => {
        zipEntries = zip.entries();
        getRels();
      });
      zip.on('error', err => {
        reject(new Error(err));
      });
    });
  }

  async function getSheetTransform(sheetFileName, withHeader, ignoreEmpty) {
    return new Promise((resolve, reject) => {
      const sheetFullFileName = `xl/worksheets/${sheetFileName}`;
      zip.stream(sheetFullFileName, (err, stream) => {
        currentSheetProcessedSize = 0;
        currentSheetSize = zipEntries[sheetFullFileName].size;
        const readStream = stream
          .pipe(
            new Transform({
              transform(chunk, encoding, done) {
                currentSheetProcessedSize += chunk.length;
                done(undefined, chunk);
              },
            }),
          )
          .pipe(
            saxStream({
              strict: true,
              tag: ['x:row', 'row'],
            }),
          )
          .pipe(getTransform(strings, withHeader, ignoreEmpty));
        readStream.on('end', () => {
          if (currentSheetIndex + 1 === options.sheets.length) {
            zip.close();
          }
        });
        resolve(readStream);
      });
    });
  }

  await setupGenericData();
  for (currentSheetIndex = 0; currentSheetIndex < options.sheets.length; currentSheetIndex++) {
    const sheet = options.sheets[currentSheetIndex];
    const id = sheet.id;
    let sheetIndex = 0;
    if (typeof id === 'number') {
      sheetIndex = id;
    } else if (typeof id === 'string') {
      sheetIndex = sheets.findIndex(x => x.name === id);
    }
    const sheetFileName = rels[sheets[sheetIndex].relsId];
    const transform = await getSheetTransform(sheetFileName, sheet.withHeader, sheet.ignoreEmpty);

    yield transform;
  }
}
