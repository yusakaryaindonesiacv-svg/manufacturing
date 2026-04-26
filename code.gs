/**
 * Google Apps Script Backend for Manufaktur UMKM App
 * Deploy this as a Web App with 'Anyone' access.
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Ganti dengan ID Spreadsheet Anda

function doGet(e) {
  const action = e.parameter.action || 'getAll';
  let result;
  
  try {
    switch (action) {
      case 'getAll':
        result = getAllData();
        break;
      default:
        result = { error: 'Invalid action' };
    }
  } catch (err) {
    result = { error: err.message };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let result;
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    
    switch (action) {
      case 'saveAll':
        result = saveAllData(postData.data);
        break;
      case 'updateEntity':
        result = updateEntity(postData.entity, postData.data);
        break;
      default:
        result = { error: 'Invalid action' };
    }
  } catch (err) {
    result = { error: err.message };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Mendapatkan semua data dari berbagai sheet
 */
function getAllData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = {};
  
  const entities = [
    'users', 'materials', 'packaging', 'products', 
    'formulas', 'productions', 'purchases', 'suppliers', 
    'activityLogs', 'settings'
  ];
  
  entities.forEach(entity => {
    let sheet = ss.getSheetByName(entity);
    if (!sheet) {
      sheet = ss.insertSheet(entity);
    }
    
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      data[entity] = (entity === 'settings') ? {} : [];
    } else {
      const headers = values[0];
      const rows = values.slice(1);
      
      if (entity === 'settings') {
        const settingsObj = {};
        rows.forEach(row => {
          settingsObj[row[0]] = row[1];
        });
        data[entity] = settingsObj;
      } else {
        data[entity] = rows.map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
            
            // Handle JSON strings (for arrays/nested objects)
            if (typeof obj[header] === 'string' && (obj[header].startsWith('[') || obj[header].startsWith('{'))) {
              try {
                obj[header] = JSON.parse(obj[header]);
              } catch (e) {}
            }
          });
          return obj;
        });
      }
    }
  });
  
  return data;
}

/**
 * Menyimpan seluruh data ke sheet
 */
function saveAllData(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  for (const entity in data) {
    updateSheet(ss, entity, data[entity]);
  }
  
  return { success: true };
}

/**
 * Update entity secara spesifik
 */
function updateEntity(entity, items) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  updateSheet(ss, entity, items);
  return { success: true };
}

/**
 * Helper untuk mengupdate sheet berdasarkan array object
 */
function updateSheet(ss, entity, data) {
  let sheet = ss.getSheetByName(entity);
  if (!sheet) {
    sheet = ss.insertSheet(entity);
  }
  
  sheet.clear();
  
  if (entity === 'settings') {
    const headers = ['key', 'value'];
    const rows = Object.keys(data).map(key => [key, data[key]]);
    sheet.getRange(1, 1, 1, 2).setValues([headers]);
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 2).setValues(rows);
    }
    return;
  }
  
  if (!Array.isArray(data) || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  const rows = data.map(item => {
    return headers.map(header => {
      const value = item[header];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}
