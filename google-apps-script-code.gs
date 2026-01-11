// ✅ PAYMENT SYSTEM - GOOGLE APPS SCRIPT CODE WITH EMAIL NOTIFICATIONS
// Այս code-ը ավելացրու Google Apps Script-ում
// ⚠️ ԿԱՐԵՎՈՐ: Մուտքագրիր քո email address-ը ներքևում (ADMIN_EMAIL)

// ⚠️ ԿԱՐԵՎՈՐ: Այստեղ մուտքագրիր քո email address-ը
const ADMIN_EMAIL = 'karmik1996@gmail.com'; // ⚠️ ՓՈՓՈԽԻՐ այս email-ը քո email-ով

// Helper function to create JSONP response (MORE ROBUST)
function createJsonpResponse(callbackName, data) {
  try {
    // Sanitize callback name to prevent XSS
    const safeCallback = String(callbackName || '').replace(/[^a-zA-Z0-9_$]/g, '');
    if (!safeCallback || safeCallback.length === 0) {
      Logger.log('⚠️ Invalid callback name, using default');
      return createCorsResponse(data);
    }
    
    const jsonData = JSON.stringify(data);
    Logger.log('📤 JSONP Response: callback=' + safeCallback + ', data=' + jsonData.substring(0, 100) + '...');
    
    return ContentService.createTextOutput(safeCallback + '(' + jsonData + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (error) {
    Logger.log('❌ Error creating JSONP response: ' + error.toString());
    return createCorsResponse(data);
  }
}

// Helper function to add CORS headers
function createCorsResponse(data) {
  try {
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('❌ Error creating CORS response: ' + error.toString());
    return ContentService.createTextOutput('{"success":false,"error":"Internal server error"}')
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle OPTIONS preflight requests
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

// Send email notification
function sendEmailNotification(subject, body) {
  try {
    if (ADMIN_EMAIL === 'YOUR_EMAIL@gmail.com' || !ADMIN_EMAIL) {
      Logger.log('⚠️ Email not configured. Please set ADMIN_EMAIL in the script.');
      return;
    }
    
    // Check if subject and body are defined
    if (!subject || typeof subject !== 'string') {
      subject = 'No Subject';
    }
    if (!body || typeof body !== 'string') {
      body = 'No body content';
    }
    
    // Ensure body is a string before calling replace
    const safeBody = String(body || 'No body content');
    
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: String(subject || 'No Subject'),
      body: safeBody,
      htmlBody: safeBody
    });
    
    Logger.log('✅ Email sent successfully to ' + ADMIN_EMAIL);
  } catch (error) {
    Logger.log('❌ Error sending email: ' + error.toString());
  }
}

// ✅ TEST EMAIL FUNCTION - Run this to test email notifications
function testEmail() {
  try {
    if (ADMIN_EMAIL === 'YOUR_EMAIL@gmail.com' || !ADMIN_EMAIL) {
      Logger.log('⚠️ Email not configured. Please set ADMIN_EMAIL in the script.');
      return;
    }
    
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: '✅ Test Email from Google Apps Script',
      body: 'This is a test email. If you receive this, email notifications are working correctly!\\n\\nTimestamp: ' + new Date().toLocaleString('hy-AM')
    });
    
    Logger.log('✅ Test email sent successfully to ' + ADMIN_EMAIL);
    Logger.log('📧 Ստուգիր spam folder-ը, եթե email չի գալիս');
  } catch (error) {
    Logger.log('❌ Test email error: ' + error.toString());
    Logger.log('⚠️ Authorization չի տրված: Run արա այս function-ը և authorization տուր');
  }
}

// Payment verification
function doGet(e) {
  try {
    Logger.log('📥 doGet called with parameters: ' + JSON.stringify(e.parameter));
    const action = e.parameter.action;
    const callback = e.parameter.callback;
    
    Logger.log('🔍 Action: ' + action + ', Callback: ' + callback);
    
    // ✅ SEND PAYMENT CODE TO CUSTOMER (called from admin email button)
    if (action === 'sendPaymentCodeToCustomer') {
      try {
        Logger.log('📥 ========== sendPaymentCodeToCustomer START ==========');
        const paymentCode = String(e.parameter.paymentCode || '').trim();
        const customerEmail = String(e.parameter.customerEmail || '').trim();
        const customerName = String(e.parameter.customerName || '').trim();
        const paymentMethod = String(e.parameter.paymentMethod || '').trim();
        
        Logger.log('📥 Payment Code: ' + paymentCode);
        Logger.log('📥 Customer Email: ' + customerEmail);
        Logger.log('📥 Customer Name: ' + customerName);
        
        if (!paymentCode || !customerEmail) {
          Logger.log('❌ Missing required parameters');
          return ContentService.createTextOutput('<html><head><meta charset="UTF-8"><title>❌ Սխալ</title></head><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5;"><div style="background: white; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><h1 style="color: #dc3545;">❌ Սխալ</h1><p style="font-size: 18px; color: #333; margin: 20px 0;">Payment code-ը կամ customer email-ը բացակայում է:</p><p style="font-size: 14px; color: #666;">Payment Code: ' + (paymentCode || 'Չկա') + '</p><p style="font-size: 14px; color: #666;">Customer Email: ' + (customerEmail || 'Չկա') + '</p></div></body></html>')
            .setMimeType(ContentService.MimeType.HTML);
        }
        
        // Send email to customer with payment code
        const customerEmailSubject = '🔑 Ձեր Վճարման Կոդը - Your Payment Code';
        
        const customerEmailBody = ('Բարև ' + (customerName || 'Հարգելի Հաճախորդ') + ',\\n\\n' +
'Շնորհակալություն վճարման հարցման համար:\\n\\n' +
'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n' +
'💰 Վճարման Գումար: 15,000 դրամ\\n' +
'💳 Վճարման Եղանակ: ' + (paymentMethod || 'Չկա') + '\\n' +
'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n' +
'🔑 ՁԵՐ ՎՃԱՐՄԱՆ ԿՈԴԸ:\\n' +
'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n' +
paymentCode + '\\n' +
'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n' +
'📋 Copy արեք վերևի code-ը և մուտքագրեք կայքում\\n\\n' +
'✅ Ինչպես օգտագործել:\\n' +
'1. Վճարեք 15,000 դրամ ' + (paymentMethod === 'IDram' ? 'IDram' : paymentMethod === 'ArCa' ? 'ArCa' : 'ընտրված եղանակով') + '\\n' +
'2. Copy արեք վերևի payment code-ը\\n' +
'3. Մուտքագրեք code-ը կայքում\\n' +
'4. Սկսեք հարցաթերթիկները\\n\\n' +
'⚠️ Կարևոր:\\n' +
'- Code-ը կարող եք օգտագործել 18 թեստ, ամեն թեստը 3 անգամ (ընդամենը 54 անգամ)\\n' +
'- Code-ը պահեք անվտանգ տեղում\\n\\n' +
'Հարցերի դեպքում կապվեք մեզ հետ:\\n' +
'📧 Email: ' + ADMIN_EMAIL + '\\n\\n' +
'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n' +
'Ավտոմատ հաղորդագրություն - Payment System').trim();
        
        // HTML version with better formatting for copy - payment code is large and easy to select
        const customerHtmlBody = ('<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">' +
'<div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
'<h2 style="color: #333; margin-top: 0;">Բարև ' + (customerName || 'Հարգելի Հաճախորդ') + ',</h2>' +
'<p style="color: #666; font-size: 16px;">Շնորհակալություն վճարման հարցման համար:</p>' +
'<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">' +
'<p style="margin: 5px 0;"><strong>💰 Վճարման Գումար:</strong> 15,000 դրամ</p>' +
'<p style="margin: 5px 0;"><strong>💳 Վճարման Եղանակ:</strong> ' + (paymentMethod || 'Չկա') + '</p>' +
'</div>' +
'<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">' +
'<h3 style="color: white; margin-top: 0; font-size: 18px;">🔑 ՁԵՐ ՎՃԱՐՄԱՆ ԿՈԴԸ</h3>' +
'<div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 3px solid #ffc107;">' +
'<p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff; margin: 0; font-family: "Courier New", monospace; user-select: all; cursor: text;">' + paymentCode + '</p>' +
'</div>' +
'<p style="color: white; font-size: 14px; margin: 10px 0 0 0;">📋 <strong>Copy արեք վերևի code-ը</strong> և մուտքագրեք կայքում</p>' +
'</div>' +
'<div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">' +
'<h4 style="color: #155724; margin-top: 0;">✅ Ինչպես օգտագործել:</h4>' +
'<ol style="color: #155724; padding-left: 20px;">' +
'<li style="margin: 8px 0;">Վճարեք 15,000 դրամ ' + (paymentMethod === 'IDram' ? 'IDram' : paymentMethod === 'ArCa' ? 'ArCa' : 'ընտրված եղանակով') + '</li>' +
'<li style="margin: 8px 0;"><strong>Copy արեք վերևի payment code-ը</strong></li>' +
'<li style="margin: 8px 0;">Մուտքագրեք code-ը կայքում</li>' +
'<li style="margin: 8px 0;">Սկսեք հարցաթերթիկները</li>' +
'</ol>' +
'</div>' +
'<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">' +
'<p style="color: #856404; margin: 0;"><strong>⚠️ Կարևոր:</strong></p>' +
'<ul style="color: #856404; padding-left: 20px; margin: 10px 0;">' +
'<li style="margin: 5px 0;">Code-ը կարող եք օգտագործել 18 թեստ, ամեն թեստը 3 անգամ (ընդամենը 54 անգամ)</li>' +
'<li style="margin: 5px 0;">Code-ը պահեք անվտանգ տեղում</li>' +
'</ul>' +
'</div>' +
'<p style="color: #666; font-size: 14px; margin-top: 30px;">Հարցերի դեպքում կապվեք մեզ հետ:<br>' +
'📧 Email: <a href="mailto:' + ADMIN_EMAIL + '" style="color: #007bff;">' + ADMIN_EMAIL + '</a></p>' +
'<p style="color: #999; font-size: 11px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">Ավտոմատ հաղորդագրություն - Payment System</p>' +
'</div></div>').trim();
        
        // Send email to customer with BCC to admin (so admin can see what was sent)
        MailApp.sendEmail({
          to: customerEmail,
          bcc: ADMIN_EMAIL, // Admin-ը կտեսնի հաճախորդին ուղարկված email-ը
          subject: customerEmailSubject,
          body: customerEmailBody,
          htmlBody: customerHtmlBody
        });
        
        Logger.log('✅ Email sent successfully to customer: ' + customerEmail);
        Logger.log('✅ Email also sent to admin (BCC): ' + ADMIN_EMAIL);
        Logger.log('📥 ========== sendPaymentCodeToCustomer SUCCESS ==========');
        
        // Return success HTML page
        return ContentService.createTextOutput('<html><head><meta charset="UTF-8"><title>✅ Կոդը Ուղարկված է</title></head><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5;"><div style="background: white; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><h1 style="color: #28a745;">✅ Հաջողություն</h1><p style="font-size: 18px; color: #333; margin: 20px 0;">Payment code-ը հաջողությամբ ուղարկված է հաճախորդին:</p><p style="font-size: 16px; color: #666; margin: 10px 0;"><strong>Email:</strong> ' + customerEmail + '</p><p style="font-size: 16px; color: #666; margin: 10px 0;"><strong>Payment Code:</strong> ' + paymentCode + '</p><p style="font-size: 14px; color: #28a745; margin: 20px 0;">📧 Email-ը նույնպես ուղարկված է admin-ին (BCC)՝ տեսնելու համար</p><p style="margin-top: 30px;"><a href="mailto:' + ADMIN_EMAIL + '" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">🔙 Վերադառնալ Email-ին</a></p></div></body></html>')
          .setMimeType(ContentService.MimeType.HTML);
        
      } catch (error) {
        Logger.log('❌ ========== sendPaymentCodeToCustomer ERROR ==========');
        Logger.log('❌ Error: ' + error.toString());
        return ContentService.createTextOutput('<html><head><meta charset="UTF-8"><title>❌ Սխալ</title></head><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5;"><div style="background: white; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><h1 style="color: #dc3545;">❌ Սխալ</h1><p style="font-size: 18px; color: #333; margin: 20px 0;">Սխալ է տեղի ունեցել payment code-ի ուղարկման ժամանակ:</p><p style="font-size: 14px; color: #666;">' + error.toString() + '</p></div></body></html>')
          .setMimeType(ContentService.MimeType.HTML);
      }
    }
    
    // Payment verification
    if (action === 'verify') {
      const code = (e.parameter.code || '').trim().toUpperCase();
      
      if (!code) {
        const errorResponse = {
          success: false,
          error: 'Payment code is required'
        };
        if (callback) {
          return createJsonpResponse(callback, errorResponse);
        }
        return createCorsResponse(errorResponse);
      }
      
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payments') || 
                    SpreadsheetApp.getActiveSpreadsheet().insertSheet('Payments');
      
      // Check if headers exist
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Date', 'Payment Code', 'Amount', 'Status', 'Verified', 'User Info', 'IP Address', 'Device Fingerprint']);
      } else if (sheet.getLastColumn() < 8) {
        // Add IP and Device columns if they don't exist
        const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        if (!headerRow.includes('IP Address')) {
          sheet.getRange(1, 7).setValue('IP Address');
          sheet.getRange(1, 8).setValue('Device Fingerprint');
        }
      }
      
      // Search for payment code
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      // Get user IP (from request)
      const userIP = e.parameter.ip || 'unknown';
      const deviceFingerprint = e.parameter.device || 'unknown';
      
      Logger.log('🔍 Searching for payment code: ' + code);
      Logger.log('📊 Total rows in sheet: ' + values.length);
      
      for (let i = 1; i < values.length; i++) {
        const storedCode = String(values[i][1] || '').trim().toUpperCase();
        const currentStatus = String(values[i][3] || '').trim();
        const verifiedValue = String(values[i][4] || '').trim();
        const isVerified = verifiedValue === 'Yes' || verifiedValue === 'Այո';
        
        Logger.log('🔍 Row ' + (i + 1) + ': Code="' + storedCode + '", Status="' + currentStatus + '", Verified="' + verifiedValue + '"');
        
        if (storedCode === code) {
          Logger.log('✅ Found matching code at row ' + (i + 1));
          
          // Allow verification for "Pending", "Paid", "Հաստատված", or empty status
          // Also allow RE-VERIFICATION if code is already verified (for continuing quiz)
          // User can verify code multiple times until 54 quiz attempts are exhausted
          // Also allow RE-VERIFICATION if code is already verified (for continuing quiz)
          const statusUpper = currentStatus.toUpperCase();
          if (statusUpper === 'PENDING' || statusUpper === 'PAID' || currentStatus === 'Հաստատված' || currentStatus === '' || !currentStatus) {
            // Security check: Verify IP and device if stored (but allow same device/IP)
            const storedIP = values[i][6] || '';
            const storedDevice = values[i][7] || '';
            
            // Allow re-verification if code is already verified (for continuing quiz)
            // User can verify code multiple times until 54 attempts are exhausted
            if (isVerified && (currentStatus === 'Paid' || currentStatus === 'Հաստատված')) {
              Logger.log('✅ Re-verification allowed - code can be used multiple times until exhausted');
              // Don't block re-verification - allow user to continue quiz
            }
            
            // Update status to "Paid" and verified to "Yes" (if not already)
            if (currentStatus !== 'Paid' && currentStatus !== 'Հաստատված') {
              sheet.getRange(i + 1, 4).setValue('Paid');
            }
            if (verifiedValue !== 'Yes' && verifiedValue !== 'Այո') {
              sheet.getRange(i + 1, 5).setValue('Yes');
            }
            // Update IP and device if not set or if same device
            if (!storedIP || storedIP === 'unknown' || storedIP === userIP) {
              sheet.getRange(i + 1, 7).setValue(userIP);
            }
            if (!storedDevice || storedDevice === 'unknown' || storedDevice === deviceFingerprint) {
              sheet.getRange(i + 1, 8).setValue(deviceFingerprint);
            }
            
            // Also update Payment Requests sheet status
            const requestsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payment Requests');
            if (requestsSheet) {
              const requestsData = requestsSheet.getDataRange().getValues();
              // Find header row to get column indices
              let statusColumnIndex = 6; // Default: Status column (index 6, column 7)
              let paymentCodeColumnIndex = 7; // Default: Payment Code column (index 7, column 8)
              
              // Check if headers exist and find correct column indices
              if (requestsData.length > 0) {
                const headers = requestsData[0];
                for (let h = 0; h < headers.length; h++) {
                  const header = String(headers[h] || '').toLowerCase();
                  if (header.includes('status') || header.includes('կարգավիճակ')) {
                    statusColumnIndex = h;
                  }
                  if (header.includes('payment code') || header.includes('վճարման կոդ') || header.includes('code')) {
                    paymentCodeColumnIndex = h;
                  }
                }
              }
              
              for (let j = 1; j < requestsData.length; j++) {
                const requestCode = String(requestsData[j][paymentCodeColumnIndex] || '').trim().toUpperCase();
                if (requestCode === code) {
                  requestsSheet.getRange(j + 1, statusColumnIndex + 1).setValue('Paid'); // Status column (1-based indexing)
                  Logger.log('✅ Updated Payment Requests sheet status to Paid for code: ' + code + ' at row ' + (j + 1));
                  break;
                }
              }
            }
            
            Logger.log('✅ Payment code verified successfully (re-verification allowed)');
            
            const successResponse = {
              success: true,
              verified: true,
              message: 'Payment code verified successfully',
              reVerified: isVerified && (currentStatus === 'Paid' || currentStatus === 'Հաստատված')
            };
            
            if (callback) {
              return createJsonpResponse(callback, successResponse);
            }
            
            return createCorsResponse(successResponse);
          } else {
            Logger.log('⚠️ Code found but status is not allowed: ' + currentStatus);
            const errorResponse = {
              success: false,
              verified: false,
              error: 'Payment code status is not valid for verification'
            };
            if (callback) {
              return createJsonpResponse(callback, errorResponse);
            }
            return createCorsResponse(errorResponse);
          }
        }
      }
      
      Logger.log('❌ Payment code not found: ' + code);
      const errorResponse = {
        success: false,
        verified: false,
        error: 'Payment code not found'
      };
      
      if (callback) {
        return createJsonpResponse(callback, errorResponse);
      }
      
      return createCorsResponse(errorResponse);
    }
    
    // Track quiz progress (also support GET/JSONP for better compatibility)
    if (action === 'trackQuizProgress') {
      try {
        const params = e.parameter || {};
        const paymentCode = params.paymentCode || '';
        const eventType = params.eventType || '';
        const userName = params.userName || 'Անանուն';
        const quizSetNumber = parseInt(params.quizSetNumber) || 0;
        const currentQuestion = parseInt(params.currentQuestion) || 0;
        const totalQuestions = parseInt(params.totalQuestions) || 0;
        const score = parseInt(params.score) || 0;
        const timestamp = params.timestamp || new Date().toISOString();
        
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quiz Progress') || 
                      SpreadsheetApp.getActiveSpreadsheet().insertSheet('Quiz Progress');
        
        if (sheet.getLastRow() === 0 || sheet.getRange(1, 1).getValue() !== 'Ամսաթիվ') {
          sheet.clear();
          sheet.appendRow(['Ամսաթիվ', 'Payment Code', 'Անուն', 'Event', 'Quiz Set', 'Question', 'Total', 'Score', 'Status']);
        }
        
        let status = '';
        if (eventType === 'start') {
          status = 'Սկսված';
        } else if (eventType === 'continue') {
          status = 'Շարունակված';
        } else if (eventType === 'complete') {
          status = 'Ավարտված';
        }
        
        sheet.appendRow([
          timestamp,
          paymentCode,
          userName,
          eventType,
          quizSetNumber,
          currentQuestion,
          totalQuestions,
          score,
          status
        ]);
        
        Logger.log('✅ Quiz progress tracked: ' + eventType + ' for code: ' + paymentCode);
        
        const successResponse = {
          success: true,
          message: 'Quiz progress tracked successfully'
        };
        
        if (callback) {
          return createJsonpResponse(callback, successResponse);
        }
        
        return createCorsResponse(successResponse);
        
      } catch (error) {
        Logger.log('❌ Error tracking quiz progress: ' + error.toString());
        const errorResponse = {
          success: false,
          error: error.toString(),
          progress: null
        };
        if (callback) {
          return createJsonpResponse(callback, errorResponse);
        }
        return createCorsResponse(errorResponse);
      }
    }
    
    // ✅ SAVE PAYMENT REQUEST (VIA GET/JSONP FOR CORS BYPASS) - ENHANCED VERSION
    if (action === 'savePaymentRequest') {
      try {
        Logger.log('📥 ========== savePaymentRequest START ==========');
        Logger.log('📥 Received savePaymentRequest via GET/JSONP');
        Logger.log('📥 All parameters: ' + JSON.stringify(e.parameter));
        
        // Get callback from parameters
        const callback = e.parameter.callback || null;
        Logger.log('📥 Callback: ' + (callback || 'NO CALLBACK'));
        
        // Extract parameters with validation
        const paymentRequest = {
          name: String(e.parameter.name || '').trim(),
          phone: String(e.parameter.phone || '').trim(),
          email: String(e.parameter.email || '').trim(),
          paymentMethod: String(e.parameter.paymentMethod || '').trim(),
          message: String(e.parameter.message || '').trim(),
          timestamp: e.parameter.timestamp || new Date().toISOString()
        };
        
        Logger.log('📋 Parsed payment request: ' + JSON.stringify(paymentRequest));
        
        // Validate required fields
        if (!paymentRequest.name || !paymentRequest.phone || !paymentRequest.paymentMethod) {
          Logger.log('❌ Validation failed: Missing required fields');
          const errorResponse = {
            success: false,
            error: 'Missing required fields: name, phone, and paymentMethod are required'
          };
          if (callback) {
            return createJsonpResponse(callback, errorResponse);
          }
          return createCorsResponse(errorResponse);
        }
        
        // ✅ GENERATE UNIQUE PAYMENT CODE
        Logger.log('🔑 Generating payment code...');
        const paymentCode = generatePaymentCode();
        Logger.log('✅ Generated payment code: ' + paymentCode);
        
        // Get or create Payment Requests sheet
        Logger.log('📊 Getting Payment Requests sheet...');
        let requestsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payment Requests');
        if (!requestsSheet) {
          Logger.log('📊 Creating Payment Requests sheet...');
          requestsSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Payment Requests');
        }
        
        // Check if headers exist
        if (requestsSheet.getLastRow() === 0) {
          Logger.log('📊 Adding headers to Payment Requests sheet...');
          requestsSheet.appendRow(['Date', 'Name', 'Phone', 'Email', 'Payment Method', 'Message', 'Status', 'Payment Code']);
        }
        
        // Add payment request record WITH CODE
        Logger.log('📊 Adding payment request to sheet...');
        requestsSheet.appendRow([
          paymentRequest.timestamp,
          paymentRequest.name,
          paymentRequest.phone,
          paymentRequest.email,
          paymentRequest.paymentMethod,
          paymentRequest.message,
          'Pending',
          paymentCode
        ]);
        Logger.log('✅ Payment request added to Payment Requests sheet');
        
        // Get or create Payments sheet
        Logger.log('📊 Getting Payments sheet...');
        let paymentsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payments');
        if (!paymentsSheet) {
          Logger.log('📊 Creating Payments sheet...');
          paymentsSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Payments');
        }
        
        // Check if headers exist
        if (paymentsSheet.getLastRow() === 0) {
          Logger.log('📊 Adding headers to Payments sheet...');
          paymentsSheet.appendRow(['Date', 'Payment Code', 'Amount', 'Status', 'Verified', 'User Info', 'IP Address', 'Device Fingerprint']);
        }
        
        // Add payment record with Pending status
        let userInfo = paymentRequest.name + (paymentRequest.phone ? ' - ' + paymentRequest.phone : '') + (paymentRequest.email ? ' (' + paymentRequest.email + ')' : '');
        if (paymentRequest.paymentMethod) {
          userInfo += ' | Վճարման Եղանակ: ' + paymentRequest.paymentMethod;
        }
        if (paymentRequest.message && paymentRequest.message.trim() !== '') {
          userInfo += ' | Հաղորդագրություն: ' + paymentRequest.message;
        }
        
        Logger.log('📊 Adding payment to Payments sheet...');
        paymentsSheet.appendRow([
          paymentRequest.timestamp,
          paymentCode,
          15000,
          'Pending',
          'No',
          userInfo,
          'unknown',
          'unknown'
        ]);
        Logger.log('✅ Payment added to Payments sheet');
        
        // ✅ CREATE GOOGLE DRIVE FOLDER STRUCTURE
        try {
          Logger.log('📁 Creating Google Drive folder structure...');
          const folderResult = createPaymentCodeFolder(
            paymentCode,
            paymentRequest.name,
            paymentRequest.email,
            paymentRequest.phone,
            paymentRequest.paymentMethod,
            paymentRequest.message,
            paymentRequest.timestamp
          );
          if (folderResult.success) {
            Logger.log('✅ Folder structure created successfully');
            Logger.log('📁 Main Folder ID: ' + folderResult.mainFolderId);
            Logger.log('📁 Code Folder ID: ' + folderResult.codeFolderId);
            Logger.log('📁 Date Folder ID: ' + folderResult.dateFolderId);
            Logger.log('📄 Document URL: ' + folderResult.docUrl);
          } else {
            Logger.log('⚠️ Folder creation failed: ' + folderResult.error);
          }
        } catch (folderError) {
          Logger.log('❌ Error creating folder structure: ' + folderError.toString());
          Logger.log('⚠️ Continuing despite folder error...');
        }
        
        // ✅ SEND EMAIL NOTIFICATION WITH PAYMENT CODE
        try {
          Logger.log('📧 Preparing email notification...');
          const emailSubject = '💰 Նոր Վճարման Հարցում - Payment Request';
          
          let formattedDate = 'Unknown';
          try {
            const dateObj = paymentRequest.timestamp ? new Date(paymentRequest.timestamp) : new Date();
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toLocaleString('hy-AM');
            }
          } catch (dateError) {
            Logger.log('Date formatting error: ' + dateError.toString());
          }
          
          const adminPanelUrl = 'https://cheerful-haupia-ebc8f8.netlify.app/admin';
          
          // Get web app URL for button
          const webAppUrl = ScriptApp.getService().getUrl();
          
          const emailBody = ('💰 Նոր Վճարման Հարցում է ստացվել:\\n\\n' +
'📋 Տվյալներ:\\n' +
'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n' +
'👤 Անուն: ' + (paymentRequest.name || 'Չկա') + '\\n' +
'📞 Հեռախոս: ' + (paymentRequest.phone || 'Չկա') + '\\n' +
'📧 Email: ' + (paymentRequest.email || 'Չկա') + '\\n' +
'💳 Վճարման Եղանակ: ' + (paymentRequest.paymentMethod || 'Չկա') + '\\n' +
'💬 Հաղորդագրություն: ' + (paymentRequest.message || 'Չկա') + '\\n' +
'📅 Ամսաթիվ: ' + formattedDate + '\\n' +
'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n' +
'✅ Գործողություն:\\n' +
'1. Ստուգիր վճարման հարցումը\\n' +
'2. Եթե վճարումը ստացված է, սեղմիր email-ում "🔑 Կոդի Տրամադրում" button-ը\\n' +
'3. Payment code-ը ավտոմատ կուղարկվի հաճախորդին email-ով\\n\\n' +
'⚠️ ՆՇՈՒՄ: Payment code-ը պատրաստ է և պահվում է Payments sheet-ում "Pending" status-ով:\\n' +
'Երբ հաճախորդը մուտքագրի code-ը, status-ը կփոխվի "Paid"-ի:\\n\\n' +
'🔗 Բացել Ադմին Պանել:\\n' +
adminPanelUrl + '\\n\\n' +
'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n' +
'Ավտոմատ հաղորդագրություն - Payment System').trim();
          
          // Enhanced HTML email for admin with button to send code to customer
          const sendCodeUrl = webAppUrl + '?action=sendPaymentCodeToCustomer&paymentCode=' + encodeURIComponent(paymentCode) + '&customerEmail=' + encodeURIComponent(paymentRequest.email || '') + '&customerName=' + encodeURIComponent(paymentRequest.name || '') + '&paymentMethod=' + encodeURIComponent(paymentRequest.paymentMethod || '');
          
          const adminHtmlBody = ('<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: #f5f5f5;">' +
'<div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
'<h2 style="color: #333; margin-top: 0;">💰 Նոր Վճարման Հարցում է ստացվել</h2>' +
'<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">' +
'<p style="margin: 5px 0;"><strong>👤 Անուն:</strong> ' + (paymentRequest.name || 'Չկա') + '</p>' +
'<p style="margin: 5px 0;"><strong>📞 Հեռախոս:</strong> ' + (paymentRequest.phone || 'Չկա') + '</p>' +
'<p style="margin: 5px 0;"><strong>📧 Email:</strong> ' + (paymentRequest.email || 'Չկա') + '</p>' +
'<p style="margin: 5px 0;"><strong>💳 Վճարման Եղանակ:</strong> ' + (paymentRequest.paymentMethod || 'Չկա') + '</p>' +
'<p style="margin: 5px 0;"><strong>💬 Հաղորդագրություն:</strong> ' + (paymentRequest.message || 'Չկա') + '</p>' +
'<p style="margin: 5px 0;"><strong>📅 Ամսաթիվ:</strong> ' + formattedDate + '</p>' +
'</div>' +
'<div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">' +
'<h4 style="color: #155724; margin-top: 0;">✅ Գործողություն:</h4>' +
'<ol style="color: #155724; padding-left: 20px;">' +
'<li style="margin: 8px 0;">Ստուգիր վճարման հարցումը</li>' +
'<li style="margin: 8px 0;">Եթե վճարումը ստացված է, սեղմիր ներքևի "🔑 Կոդի Տրամադրում" button-ը</li>' +
'<li style="margin: 8px 0;">Payment code-ը ավտոմատ կուղարկվի հաճախորդին email-ով</li>' +
'<li style="margin: 8px 0;">Հաճախորդը կմուտքագրի code-ը կայքում</li>' +
'</ol>' +
'</div>' +
'<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">' +
'<p style="color: #856404; margin: 0;"><strong>⚠️ ՆՇՈՒՄ:</strong> Payment code-ը պատրաստ է և պահվում է Payments sheet-ում "Pending" status-ով:</p>' +
'<p style="color: #856404; margin: 10px 0 0 0;">Երբ հաճախորդը մուտքագրի code-ը, status-ը կփոխվի "Paid"-ի:</p>' +
'</div>' +
'<div style="text-align: center; margin: 30px 0;">' +
'<a href="' + sendCodeUrl + '" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 18px 36px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);">🔑 Կոդի Տրամադրում</a>' +
'</div>' +
'<p style="text-align: center; margin-top: 20px;">' +
'<a href="' + adminPanelUrl + '" target="_blank" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">🔗 Բացել Ադմին Պանել</a>' +
'</p>' +
'<p style="color: #999; font-size: 11px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; text-align: center;">Ավտոմատ հաղորդագրություն - Payment System</p>' +
'</div></div>').trim();
          
          Logger.log('📧 Sending email notification to admin...');
          // Send email with enhanced HTML body
          MailApp.sendEmail({
            to: ADMIN_EMAIL,
            subject: emailSubject,
            body: emailBody,
            htmlBody: adminHtmlBody
          });
          Logger.log('✅ Email notification sent to admin');
          
          // ⚠️ Customer email-ը չի ուղարկվում ինքնաբերաբար - միայն երբ admin-ը կտտացնի button-ը
          Logger.log('⚠️ Customer email-ը կուղարկվի միայն երբ admin-ը կտտացնի "Կոդի Տրամադրում" button-ը');
        } catch (emailError) {
          Logger.log('❌ Error sending email notification: ' + emailError.toString());
          Logger.log('⚠️ Continuing despite email error...');
        }
        
        Logger.log('✅ Payment request saved successfully. Code: ' + paymentCode);
        Logger.log('📥 ========== savePaymentRequest SUCCESS ==========');
        
        const successResponse = {
          success: true,
          message: 'Payment request saved successfully',
          paymentCode: paymentCode
        };
        
        if (callback) {
          Logger.log('📤 Returning JSONP response with callback: ' + callback);
          return createJsonpResponse(callback, successResponse);
        }
        
        Logger.log('📤 Returning CORS response (no callback)');
        return createCorsResponse(successResponse);
        
      } catch (error) {
        Logger.log('❌ ========== savePaymentRequest ERROR ==========');
        Logger.log('❌ Error saving payment request: ' + error.toString());
        Logger.log('❌ Error stack: ' + (error.stack || 'No stack trace'));
        Logger.log('❌ Error name: ' + (error.name || 'Unknown'));
        Logger.log('❌ Error message: ' + (error.message || 'Unknown'));
        
        const errorResponse = {
          success: false,
          error: error.toString()
        };
        
        if (callback) {
          Logger.log('📤 Returning JSONP error response with callback: ' + callback);
          return createJsonpResponse(callback, errorResponse);
        }
        
        Logger.log('📤 Returning CORS error response (no callback)');
        return createCorsResponse(errorResponse);
      }
    }
    
    // Add payment with code (from admin panel)
    if (action === 'addPaymentWithCode') {
      try {
        Logger.log('📥 Received addPaymentWithCode with params: ' + JSON.stringify(e.parameter));
        
        const paymentCode = String(e.parameter.paymentCode || '').trim().toUpperCase();
        const name = String(e.parameter.name || '').trim();
        const phone = String(e.parameter.phone || '').trim();
        const email = String(e.parameter.email || '').trim();
        const amount = parseFloat(e.parameter.amount) || 15000;
        const status = String(e.parameter.status || 'Pending').trim();
        const verified = String(e.parameter.verified || 'No').trim();
        const date = e.parameter.date || new Date().toISOString();
        const userInfo = e.parameter.userInfo || (name + (phone ? ' - ' + phone : '') + (email ? ' (' + email + ')' : ''));
        
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payments') || 
                      SpreadsheetApp.getActiveSpreadsheet().insertSheet('Payments');
        
        // Check if headers exist
        if (sheet.getLastRow() === 0) {
          sheet.appendRow(['Date', 'Payment Code', 'Amount', 'Status', 'Verified', 'User Info', 'IP Address', 'Device Fingerprint']);
        }
        
        // Check if code already exists
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();
        for (let i = 1; i < values.length; i++) {
          if (String(values[i][1] || '').trim().toUpperCase() === paymentCode) {
            // Update existing entry
            sheet.getRange(i + 1, 3).setValue(amount); // Amount
            sheet.getRange(i + 1, 4).setValue(status); // Status
            sheet.getRange(i + 1, 5).setValue(verified); // Verified
            sheet.getRange(i + 1, 6).setValue(userInfo); // User Info
            
            Logger.log('✅ Updated existing payment with code: ' + paymentCode);
            
            const updateResponse = {
              success: true,
              message: 'Payment code updated successfully',
              paymentCode: paymentCode
            };
            
            if (callback) {
              return createJsonpResponse(callback, updateResponse);
            }
            
            return createCorsResponse(updateResponse);
          }
        }
        
        // Add new payment record
        sheet.appendRow([
          date,
          paymentCode,
          amount,
          status,
          verified,
          userInfo,
          'unknown',
          'unknown'
        ]);
        
        Logger.log('✅ Added new payment with code: ' + paymentCode);
        
        const response = {
          success: true,
          message: 'Payment code added successfully',
          paymentCode: paymentCode
        };
        
        if (callback) {
          return createJsonpResponse(callback, response);
        }
        
        return createCorsResponse(response);
      } catch (error) {
        Logger.log('❌ Error adding payment with code: ' + error.toString());
        const errorResponse = { success: false, error: error.toString() };
        if (callback) {
          return createJsonpResponse(callback, errorResponse);
        }
        return createCorsResponse(errorResponse);
      }
    }
    
    // Get quiz progress
    if (action === 'getQuizProgress') {
      try {
        const paymentCode = String(e.parameter.paymentCode || '').trim().toUpperCase();
        
        if (!paymentCode) {
          const errorResponse = {
            success: false,
            error: 'Payment code is required'
          };
          if (callback) {
            return createJsonpResponse(callback, errorResponse);
          }
          return createCorsResponse(errorResponse);
        }
        
        // First, try to get from 'Quiz Progress Save' sheet (detailed progress)
        const saveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quiz Progress Save');
        
        if (saveSheet && saveSheet.getLastRow() > 0) {
          const dataRange = saveSheet.getDataRange();
          const values = dataRange.getValues();
          
          // Find progress for this payment code
          for (let i = 1; i < values.length; i++) {
            const rowCode = String(values[i][0] || '').trim().toUpperCase();
            if (rowCode === paymentCode) {
              // Found detailed progress
              let userAnswers = [];
              let shuffledQuizData = [];
              
              try {
                userAnswers = JSON.parse(values[i][4] || '[]');
              } catch (e) {
                Logger.log('⚠️ Error parsing userAnswers: ' + e.toString());
              }
              
              try {
                shuffledQuizData = JSON.parse(values[i][7] || '[]');
              } catch (e) {
                Logger.log('⚠️ Error parsing shuffledQuizData: ' + e.toString());
              }
              
              const progress = {
                paymentCode: paymentCode,
                currentQuestion: parseInt(values[i][1]) || 0,
                totalQuestions: parseInt(values[i][2]) || 0,
                score: parseInt(values[i][3]) || 0,
                userAnswers: userAnswers,
                gameStarted: values[i][5] === 'true',
                quizSetNumber: parseInt(values[i][6]) || 0,
                shuffledQuizData: shuffledQuizData,
                deviceId: values[i][8] || '', // Device ID for session tracking
                timestamp: values[i][9] || '' // Timestamp moved to column 9 (was column 8)
              };
              
              const successResponse = {
                success: true,
                progress: progress
              };
              
              if (callback) {
                return createJsonpResponse(callback, successResponse);
              }
              
              return createCorsResponse(successResponse);
            }
          }
        }
        
        // Fallback: try to get from 'Quiz Progress' sheet (tracking data)
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quiz Progress');
        
        if (!sheet || sheet.getLastRow() === 0) {
          const emptyResponse = {
            success: true,
            progress: null
          };
          if (callback) {
            return createJsonpResponse(callback, emptyResponse);
          }
          return createCorsResponse(emptyResponse);
        }
        
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();
        
        // Find the most recent progress entry for this payment code
        let latestProgress = null;
        for (let i = values.length - 1; i >= 1; i--) {
          const rowCode = String(values[i][1] || '').trim().toUpperCase();
          if (rowCode === paymentCode) {
            latestProgress = {
              paymentCode: paymentCode,
              userName: values[i][2] || 'Անանուն',
              eventType: values[i][3] || '',
              quizSetNumber: parseInt(values[i][4]) || 0,
              currentQuestion: parseInt(values[i][5]) || 0,
              totalQuestions: parseInt(values[i][6]) || 0,
              score: parseInt(values[i][7]) || 0,
              status: values[i][8] || '',
              timestamp: values[i][0] || '',
              gameStarted: true, // Assume game started if we have tracking data
              userAnswers: [],
              shuffledQuizData: []
            };
            break;
          }
        }
        
        const successResponse = {
          success: true,
          progress: latestProgress
        };
        
        if (callback) {
          return createJsonpResponse(callback, successResponse);
        }
        
        return createCorsResponse(successResponse);
        
      } catch (error) {
        Logger.log('❌ Error getting quiz progress: ' + error.toString());
        const errorResponse = {
          success: false,
          error: error.toString(),
          progress: null
        };
        if (callback) {
          return createJsonpResponse(callback, errorResponse);
        }
        return createCorsResponse(errorResponse);
      }
    }
    
    // Save quiz progress (for cross-device access)
    if (action === 'saveQuizProgress') {
      try {
        const paymentCode = String(e.parameter.paymentCode || '').trim().toUpperCase();
        const currentQuestion = parseInt(e.parameter.currentQuestion) || 0;
        const totalQuestions = parseInt(e.parameter.totalQuestions) || 0;
        const score = parseInt(e.parameter.score) || 0;
        const userAnswers = e.parameter.userAnswers || '[]';
        const gameStarted = e.parameter.gameStarted === 'true';
        const quizSetNumber = parseInt(e.parameter.quizSetNumber) || 0;
        const shuffledQuizData = e.parameter.shuffledQuizData || '[]';
        const deviceId = e.parameter.deviceId || ''; // Track device to prevent multiple simultaneous sessions
        const timestamp = e.parameter.timestamp || new Date().toISOString();
        
        if (!paymentCode) {
          const errorResponse = {
            success: false,
            error: 'Payment code is required'
          };
          if (callback) {
            return createJsonpResponse(callback, errorResponse);
          }
          return createCorsResponse(errorResponse);
        }
        
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quiz Progress Save') || 
                      SpreadsheetApp.getActiveSpreadsheet().insertSheet('Quiz Progress Save');
        
        // Create headers if needed
        if (sheet.getLastRow() === 0 || sheet.getRange(1, 1).getValue() !== 'Payment Code') {
          sheet.clear();
          sheet.appendRow(['Payment Code', 'Current Question', 'Total Questions', 'Score', 'User Answers', 'Game Started', 'Quiz Set Number', 'Shuffled Quiz Data', 'Device ID', 'Timestamp']);
        }
        
        // Check if progress already exists for this payment code
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();
        let existingRowIndex = -1;
        
        for (let i = 1; i < values.length; i++) {
          const rowCode = String(values[i][0] || '').trim().toUpperCase();
          if (rowCode === paymentCode) {
            existingRowIndex = i + 1;
            break;
          }
        }
        
        // Prepare progress data
        const progressData = [
          paymentCode,
          currentQuestion,
          totalQuestions,
          score,
          userAnswers,
          gameStarted ? 'true' : 'false',
          quizSetNumber,
          shuffledQuizData,
          deviceId, // Track device to prevent multiple simultaneous sessions
          timestamp
        ];
        
        if (existingRowIndex > 0) {
          // Update existing row
          for (let col = 1; col <= progressData.length; col++) {
            sheet.getRange(existingRowIndex, col).setValue(progressData[col - 1]);
          }
          Logger.log('✅ Updated quiz progress for code: ' + paymentCode);
        } else {
          // Append new row
          sheet.appendRow(progressData);
          Logger.log('✅ Saved new quiz progress for code: ' + paymentCode);
        }
        
        const successResponse = {
          success: true,
          message: 'Quiz progress saved successfully'
        };
        
        if (callback) {
          return createJsonpResponse(callback, successResponse);
        }
        
        return createCorsResponse(successResponse);
        
      } catch (error) {
        Logger.log('❌ Error saving quiz progress: ' + error.toString());
        const errorResponse = {
          success: false,
          error: error.toString()
        };
        if (callback) {
          return createJsonpResponse(callback, errorResponse);
        }
        return createCorsResponse(errorResponse);
      }
    }
    
    // List Google Drive folders (for admin panel)
    if (action === 'listDriveFolders') {
      try {
        Logger.log('📁 Listing Google Drive folders...');
        const folderResult = listDriveFolders();
        
        if (callback) {
          return createJsonpResponse(callback, folderResult);
        }
        return createCorsResponse(folderResult);
        
      } catch (error) {
        Logger.log('❌ Error listing folders: ' + error.toString());
        const errorResponse = {
          success: false,
          error: error.toString(),
          folders: []
        };
        if (callback) {
          return createJsonpResponse(callback, errorResponse);
        }
        return createCorsResponse(errorResponse);
      }
    }
    
    // Get payment requests (for admin panel)
    if (action === 'getPaymentRequests' || action === 'readPaymentRequests') {
      try {
        Logger.log('📖 Reading payment requests from Payment Requests sheet...');
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payment Requests');
        
        if (!sheet) {
          Logger.log('⚠️ Payment Requests sheet not found');
          const emptyResponse = {
            success: true,
            requests: []
          };
          if (callback) {
            return createJsonpResponse(callback, emptyResponse);
          }
          return createCorsResponse(emptyResponse);
        }
        
        if (sheet.getLastRow() === 0) {
          Logger.log('⚠️ Payment Requests sheet is empty');
          const emptyResponse = {
            success: true,
            requests: []
          };
          if (callback) {
            return createJsonpResponse(callback, emptyResponse);
          }
          return createCorsResponse(emptyResponse);
        }
        
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();
        const headers = values[0];
        const dataRows = values.slice(1);
        
        const requests = dataRows.map((row, index) => {
          return {
            id: index + 1,
            date: row[0] || '',
            name: row[1] || '',
            phone: row[2] || '',
            email: row[3] || '',
            paymentMethod: row[4] || '',
            message: row[5] || '',
            status: row[6] || 'Pending',
            paymentCode: row[7] || ''
          };
        });
        
        Logger.log('✅ Found ' + requests.length + ' payment requests');
        
        const successResponse = {
          success: true,
          requests: requests
        };
        
        if (callback) {
          return createJsonpResponse(callback, successResponse);
        }
        
        return createCorsResponse(successResponse);
        
      } catch (error) {
        Logger.log('❌ Error getting payment requests: ' + error.toString());
        const errorResponse = {
          success: false,
          error: error.toString(),
          requests: []
        };
        if (callback) {
          return createJsonpResponse(callback, errorResponse);
        }
        return createCorsResponse(errorResponse);
      }
    }
    
    // Clear all payment requests (for admin panel)
    if (action === 'clearAllPaymentRequests') {
      try {
        Logger.log('🗑️ Clearing all payment requests from Payment Requests sheet...');
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payment Requests');
        
        if (!sheet) {
          Logger.log('⚠️ Payment Requests sheet not found');
          const errorResponse = {
            success: false,
            error: 'Payment Requests sheet not found'
          };
          if (callback) {
            return createJsonpResponse(callback, errorResponse);
          }
          return createCorsResponse(errorResponse);
        }
        
        const lastRow = sheet.getLastRow();
        
        if (lastRow <= 1) {
          Logger.log('⚠️ Payment Requests sheet is empty or has only headers');
          const successResponse = {
            success: true,
            message: 'No payment requests to clear',
            deletedCount: 0
          };
          if (callback) {
            return createJsonpResponse(callback, successResponse);
          }
          return createCorsResponse(successResponse);
        }
        
        // Delete all rows except header (row 1)
        const deletedCount = lastRow - 1;
        sheet.deleteRows(2, deletedCount);
        Logger.log('✅ Cleared ' + deletedCount + ' payment request entries');
        
        const successResponse = {
          success: true,
          message: 'All payment requests cleared successfully',
          deletedCount: deletedCount
        };
        if (callback) {
          return createJsonpResponse(callback, successResponse);
        }
        return createCorsResponse(successResponse);
      } catch (error) {
        Logger.log('❌ Error clearing payment requests: ' + error.toString());
        const errorResponse = { success: false, error: error.toString() };
        if (callback) {
          return createJsonpResponse(callback, errorResponse);
        }
        return createCorsResponse(errorResponse);
      }
    }
    
    // Get quiz usage statistics
    if (action === 'getQuizUsage') {
      try {
        Logger.log('📊 Getting quiz usage statistics...');
        const paymentCode = String(e.parameter.paymentCode || '').trim().toUpperCase();
        
        if (!paymentCode) {
          const errorResponse = {
            success: false,
            error: 'Payment code is required'
          };
          if (callback) {
            return createJsonpResponse(callback, errorResponse);
          }
          return createCorsResponse(errorResponse);
        }
        
        const progressSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quiz Progress');
        const paymentsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payments');
        
        const statistics = {};
        
        if (progressSheet && progressSheet.getLastRow() > 1) {
          const progressData = progressSheet.getDataRange().getValues();
          const headers = progressData[0];
          const dataRows = progressData.slice(1);
          
          // Group by payment code
          const codeStats = {};
          
          for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const code = row[1] || ''; // Payment Code column
            const userName = row[2] || 'Անանուն'; // Անուն column
            const eventType = row[3] || ''; // Event column
            const quizSet = parseInt(row[4]) || 0; // Quiz Set column
            const status = row[8] || ''; // Status column
            
            if (!code) continue;
            
            if (!codeStats[code]) {
              codeStats[code] = {
                paymentCode: code,
                userName: userName,
                completedTests: 0,
                totalAttempts: 0,
                inProgressTests: [],
                lastActivity: ''
              };
            }
            
            // Count completed tests and attempts
            if (eventType === 'complete' && status === 'Ավարտված') {
              codeStats[code].completedTests++;
              codeStats[code].totalAttempts++;
            } else if (eventType === 'start') {
              // Every 'start' counts as an attempt
              codeStats[code].totalAttempts++;
              // Track in-progress tests
              if (quizSet > 0 && !codeStats[code].inProgressTests.includes(quizSet)) {
                codeStats[code].inProgressTests.push(quizSet);
              }
            } else if (eventType === 'continue') {
              // 'continue' doesn't count as a new attempt, just continuation
              // Track in-progress tests
              if (quizSet > 0 && !codeStats[code].inProgressTests.includes(quizSet)) {
                codeStats[code].inProgressTests.push(quizSet);
              }
            }
            
            // Update last activity
            const timestamp = row[0] || '';
            if (timestamp && (!codeStats[code].lastActivity || timestamp > codeStats[code].lastActivity)) {
              codeStats[code].lastActivity = timestamp;
            }
          }
          
          statistics[paymentCode] = codeStats[paymentCode] || {
            paymentCode: paymentCode,
            userName: 'Անանուն',
            completedTests: 0,
            totalAttempts: 0,
            inProgressTests: [],
            lastActivity: ''
          };
        } else {
          statistics[paymentCode] = {
            paymentCode: paymentCode,
            userName: 'Անանուն',
            completedTests: 0,
            totalAttempts: 0,
            inProgressTests: [],
            lastActivity: ''
          };
        }
        
        // Get detailed quiz set usage
        const quizUsage = {};
        if (progressSheet && progressSheet.getLastRow() > 1) {
          const progressData = progressSheet.getDataRange().getValues();
          const dataRows = progressData.slice(1);
          
          for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const code = String(row[1] || '').trim().toUpperCase();
            const quizSet = parseInt(row[4]) || 0;
            const eventType = row[3] || '';
            const status = row[8] || '';
            const currentQuestion = parseInt(row[5]) || 0; // Question column (0-indexed, so +1 for display)
            
            if (code !== paymentCode || quizSet === 0) continue;
            
            if (!quizUsage[quizSet]) {
              quizUsage[quizSet] = {
                quizSet: quizSet,
                attempts: 0,
                questionsUsed: 0, // Maximum questions reached in this quiz set
                completed: false,
                lastActivity: ''
              };
            }
            
            // Track maximum questions reached (currentQuestion is 0-indexed, so we use currentQuestion + 1)
            // Only count if user actually answered questions (currentQuestion > 0)
            if (currentQuestion > 0) {
              const questionsReached = currentQuestion + 1; // Convert to 1-indexed
              if (questionsReached > quizUsage[quizSet].questionsUsed) {
                quizUsage[quizSet].questionsUsed = questionsReached;
              }
            }
            
            // Count attempts: every 'start' or 'complete' event counts as an attempt
            if (eventType === 'start' || eventType === 'complete') {
              quizUsage[quizSet].attempts++;
              if (eventType === 'complete' && status === 'Ավարտված') {
                quizUsage[quizSet].completed = true;
              }
            } else if (eventType === 'continue') {
              // 'continue' doesn't count as a new attempt, just continuation
            }
            
            const timestamp = row[0] || '';
            if (timestamp && (!quizUsage[quizSet].lastActivity || timestamp > quizUsage[quizSet].lastActivity)) {
              quizUsage[quizSet].lastActivity = timestamp;
            }
          }
        }
        
        // ✅ UPDATE QUIZ USAGE IN GOOGLE DRIVE FOLDER
        try {
          Logger.log('📁 Updating quiz usage in Google Drive folder...');
          const updateResult = updateQuizUsageInFolder(paymentCode, quizUsage);
          if (updateResult.success) {
            Logger.log('✅ Quiz usage updated in folder successfully');
            Logger.log('📄 Document URL: ' + updateResult.docUrl);
          } else {
            Logger.log('⚠️ Quiz usage update failed: ' + updateResult.error);
          }
        } catch (updateError) {
          Logger.log('❌ Error updating quiz usage in folder: ' + updateError.toString());
          Logger.log('⚠️ Continuing despite update error...');
        }
        
        const successResponse = {
          success: true,
          statistics: statistics[paymentCode],
          quizUsage: quizUsage
        };
        
        if (callback) {
          return createJsonpResponse(callback, successResponse);
        }
        
        return createCorsResponse(successResponse);
        
      } catch (error) {
        Logger.log('❌ Error getting quiz usage: ' + error.toString());
        const errorResponse = {
          success: false,
          error: error.toString()
        };
        if (callback) {
          return createJsonpResponse(callback, errorResponse);
        }
        return createCorsResponse(errorResponse);
      }
    }
    
    // Read payments (for admin panel)
    if (action === 'readPayments') {
      try {
        Logger.log('📖 Reading payments from Payments sheet...');
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payments');
        
        if (!sheet) {
          Logger.log('⚠️ Payments sheet not found');
          const emptyResponse = {
            success: true,
            payments: []
          };
          if (callback) {
            return createJsonpResponse(callback, emptyResponse);
          }
          return createCorsResponse(emptyResponse);
        }
        
        if (sheet.getLastRow() === 0) {
          Logger.log('⚠️ Payments sheet is empty');
          const emptyResponse = {
            success: true,
            payments: []
          };
          if (callback) {
            return createJsonpResponse(callback, emptyResponse);
          }
          return createCorsResponse(emptyResponse);
        }
        
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();
        const headers = values[0];
        const dataRows = values.slice(1);
        
        const payments = dataRows.map((row, index) => {
          return {
            id: index + 1,
            date: row[0] || '',
            paymentCode: row[1] || '',
            amount: row[2] || 0,
            status: row[3] || 'Pending',
            verified: row[4] || 'No',
            userInfo: row[5] || '',
            ipAddress: row[6] || 'unknown',
            deviceFingerprint: row[7] || 'unknown'
          };
        });
        
        Logger.log('✅ Found ' + payments.length + ' payments');
        
        const successResponse = {
          success: true,
          payments: payments
        };
        
        if (callback) {
          return createJsonpResponse(callback, successResponse);
        }
        
        return createCorsResponse(successResponse);
        
      } catch (error) {
        Logger.log('❌ Error reading payments: ' + error.toString());
        const errorResponse = {
          success: false,
          error: error.toString(),
          payments: []
        };
        if (callback) {
          return createJsonpResponse(callback, errorResponse);
        }
        return createCorsResponse(errorResponse);
      }
    }
    
    // Delete payment (for admin panel)
    if (action === 'deletePayment') {
      try {
        Logger.log('🗑️ Deleting payment...');
        const paymentCode = String(e.parameter.paymentCode || '').trim().toUpperCase();
        
        if (!paymentCode) {
          const errorResponse = {
            success: false,
            error: 'Payment code is required'
          };
          if (callback) {
            return createJsonpResponse(callback, errorResponse);
          }
          return createCorsResponse(errorResponse);
        }
        
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payments');
        
        if (!sheet) {
          const errorResponse = {
            success: false,
            error: 'Payments sheet not found'
          };
          if (callback) {
            return createJsonpResponse(callback, errorResponse);
          }
          return createCorsResponse(errorResponse);
        }
        
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();
        
        Logger.log('📊 Total rows: ' + values.length);
        
        for (let i = values.length - 1; i >= 1; i--) {
          const storedCode = String(values[i][1] || '').trim().toUpperCase();
          Logger.log('🔍 Row ' + (i + 1) + ': Code="' + storedCode + '"');
          
          if (storedCode === paymentCode) {
            Logger.log('✅ Found matching code at row ' + (i + 1));
            sheet.deleteRow(i + 1);
            Logger.log('✅ Deleted payment: ' + paymentCode);
            
            const successResponse = { success: true, message: 'Payment deleted successfully' };
            if (callback) {
              return createJsonpResponse(callback, successResponse);
            }
            return createCorsResponse(successResponse);
          }
        }
        
        Logger.log('❌ Payment code not found: ' + paymentCode);
        const notFoundResponse = { success: false, error: 'Payment code not found' };
        if (callback) {
          return createJsonpResponse(callback, notFoundResponse);
        }
        return createCorsResponse(notFoundResponse);
        
      } catch (error) {
        Logger.log('❌ Error deleting payment: ' + error.toString());
        Logger.log('❌ Error stack: ' + error.stack);
        const errorResponse = { success: false, error: error.toString() };
        if (callback) {
          return createJsonpResponse(callback, errorResponse);
        }
        return createCorsResponse(errorResponse);
      }
    }
    
    // Clear all payments (for admin panel)
    if (action === 'clearAllPayments') {
      try {
        Logger.log('🗑️ Clearing all payments from Payments sheet...');
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payments');
        
        if (!sheet) {
          Logger.log('⚠️ Payments sheet not found');
          const errorResponse = {
            success: false,
            error: 'Payments sheet not found'
          };
          if (callback) {
            return createJsonpResponse(callback, errorResponse);
          }
          return createCorsResponse(errorResponse);
        }
        
        const lastRow = sheet.getLastRow();
        if (lastRow <= 1) {
          Logger.log('✅ Payments sheet is already empty');
          const successResponse = {
            success: true,
            message: 'Payments sheet is already empty',
            deletedCount: 0
          };
          if (callback) {
            return createJsonpResponse(callback, successResponse);
          }
          return createCorsResponse(successResponse);
        }
        
        // Delete all rows except header (row 1)
        const deletedCount = lastRow - 1;
        sheet.deleteRows(2, deletedCount);
        Logger.log('✅ Cleared ' + deletedCount + ' payment entries');
        
        const successResponse = {
          success: true,
          message: 'All payments cleared successfully',
          deletedCount: deletedCount
        };
        if (callback) {
          return createJsonpResponse(callback, successResponse);
        }
        return createCorsResponse(successResponse);
      } catch (error) {
        Logger.log('❌ Error clearing payments: ' + error.toString());
        const errorResponse = { success: false, error: error.toString() };
        if (callback) {
          return createJsonpResponse(callback, errorResponse);
        }
        return createCorsResponse(errorResponse);
      }
    }
    
    // Delete payments by date (for admin panel)
    if (action === 'deletePaymentsByDate') {
      try {
        Logger.log('🗑️ Deleting payments by date...');
        const dateKey = String(e.parameter.dateKey || '').trim();
        
        if (!dateKey) {
          const errorResponse = {
            success: false,
            error: 'Date key is required'
          };
          if (callback) {
            return createJsonpResponse(callback, errorResponse);
          }
          return createCorsResponse(errorResponse);
        }
        
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payments');
        
        if (!sheet) {
          const errorResponse = {
            success: false,
            error: 'Payments sheet not found'
          };
          if (callback) {
            return createJsonpResponse(callback, errorResponse);
          }
          return createCorsResponse(errorResponse);
        }
        
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();
        
        Logger.log('📊 Total rows: ' + values.length);
        Logger.log('📅 Looking for date: ' + dateKey);
        
        // Parse dateKey (format: DD/MM/YYYY)
        const dateParts = dateKey.split('/');
        if (dateParts.length !== 3) {
          const errorResponse = {
            success: false,
            error: 'Invalid date format. Expected DD/MM/YYYY'
          };
          if (callback) {
            return createJsonpResponse(callback, errorResponse);
          }
          return createCorsResponse(errorResponse);
        }
        
        const targetDay = parseInt(dateParts[0]);
        const targetMonth = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JavaScript
        const targetYear = parseInt(dateParts[2]);
        
        let deletedCount = 0;
        
        // Delete rows from bottom to top to avoid index shifting issues
        for (let i = values.length - 1; i >= 1; i--) {
          const rowDate = values[i][0]; // Date is in column A (index 0)
          
          if (!rowDate) continue;
          
          try {
            const dateObj = new Date(rowDate);
            if (isNaN(dateObj.getTime())) continue;
            
            const rowDay = dateObj.getDate();
            const rowMonth = dateObj.getMonth();
            const rowYear = dateObj.getFullYear();
            
            // Check if date matches (only date part, not time)
            if (rowDay === targetDay && rowMonth === targetMonth && rowYear === targetYear) {
              Logger.log('✅ Found matching date at row ' + (i + 1) + ': ' + rowDate);
              sheet.deleteRow(i + 1);
              deletedCount++;
            }
          } catch (dateError) {
            Logger.log('⚠️ Error parsing date at row ' + (i + 1) + ': ' + dateError.toString());
            continue;
          }
        }
        
        Logger.log('✅ Deleted ' + deletedCount + ' payment(s) for date: ' + dateKey);
        
        const successResponse = {
          success: true,
          message: 'Payments deleted successfully',
          deletedCount: deletedCount
        };
        if (callback) {
          return createJsonpResponse(callback, successResponse);
        }
        return createCorsResponse(successResponse);
        
      } catch (error) {
        Logger.log('❌ Error deleting payments by date: ' + error.toString());
        Logger.log('❌ Error stack: ' + error.stack);
        const errorResponse = { success: false, error: error.toString() };
        if (callback) {
          return createJsonpResponse(callback, errorResponse);
        }
        return createCorsResponse(errorResponse);
      }
    }
    
    // Default: return error
    Logger.log('⚠️ Unknown action: ' + action);
    const errorResponse = {
      success: false,
      error: 'Unknown action: ' + action
    };
    
    if (callback) {
      return createJsonpResponse(callback, errorResponse);
    }
    
    return createCorsResponse(errorResponse);
    
  } catch (error) {
    Logger.log('❌ ========== doGet ERROR ==========');
    Logger.log('❌ Error in doGet: ' + error.toString());
    Logger.log('❌ Error stack: ' + (error.stack || 'No stack trace'));
    
    const errorResponse = {
      success: false,
      error: error.toString()
    };
    
    const callback = e.parameter.callback || null;
    if (callback) {
      return createJsonpResponse(callback, errorResponse);
    }
    
    return createCorsResponse(errorResponse);
  }
}

// Generate unique payment code
function generatePaymentCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let code = '';
  
  // Add 6 random letters
  for (let i = 0; i < 6; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Add 4 random numbers
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  // Check if code already exists in Payments sheet
  const paymentsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payments');
  if (paymentsSheet && paymentsSheet.getLastRow() > 1) {
    const dataRange = paymentsSheet.getDataRange();
    const values = dataRange.getValues();
    const existingCodes = values.slice(1).map(row => row[1]); // Column B (index 1) contains codes
    
    // If code exists, generate a new one (max 10 attempts)
    let attempts = 0;
    while (existingCodes.includes(code) && attempts < 10) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
      }
      for (let i = 0; i < 4; i++) {
        code += numbers.charAt(Math.floor(Math.random() * numbers.length));
      }
      attempts++;
    }
  }
  
  return code;
}

// Create Google Drive folder structure for payment codes
function createPaymentCodeFolder(paymentCode, userName, email, phone, paymentMethod, message, timestamp) {
  try {
    Logger.log('📁 Creating folder structure for payment code: ' + paymentCode);
    
    // Get or create main folder "Payment Codes" in Drive root
    const mainFolderName = 'Payment Codes';
    let mainFolder;
    const folders = DriveApp.getFoldersByName(mainFolderName);
    if (folders.hasNext()) {
      mainFolder = folders.next();
      Logger.log('✅ Found existing main folder: ' + mainFolderName);
    } else {
      mainFolder = DriveApp.createFolder(mainFolderName);
      Logger.log('✅ Created main folder: ' + mainFolderName);
    }
    
    // Create folder for this payment code (if doesn't exist)
    const codeFolderName = paymentCode + ' - ' + (userName || 'Անանուն');
    let codeFolder;
    const codeFolders = mainFolder.getFoldersByName(codeFolderName);
    if (codeFolders.hasNext()) {
      codeFolder = codeFolders.next();
      Logger.log('✅ Found existing code folder: ' + codeFolderName);
    } else {
      codeFolder = mainFolder.createFolder(codeFolderName);
      Logger.log('✅ Created code folder: ' + codeFolderName);
    }
    
    // Parse timestamp to get date
    const date = new Date(timestamp || new Date());
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-11 to 1-12
    const day = date.getDate();
    
    // Format: YYYY-MM-DD (e.g., 2024-01-15)
    const dateFolderName = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    
    // Create date folder (if doesn't exist)
    let dateFolder;
    const dateFolders = codeFolder.getFoldersByName(dateFolderName);
    if (dateFolders.hasNext()) {
      dateFolder = dateFolders.next();
      Logger.log('✅ Found existing date folder: ' + dateFolderName);
    } else {
      dateFolder = codeFolder.createFolder(dateFolderName);
      Logger.log('✅ Created date folder: ' + dateFolderName);
    }
    
    // Create Google Doc with user information
    const docName = paymentCode + ' - ' + userName + ' - ' + dateFolderName;
    let doc;
    const docs = dateFolder.getFilesByName(docName);
    if (docs.hasNext()) {
      doc = DocumentApp.openById(docs.next().getId());
      Logger.log('✅ Found existing document: ' + docName);
    } else {
      doc = DocumentApp.create(docName);
      const docFile = DriveApp.getFileById(doc.getId());
      docFile.moveTo(dateFolder);
      Logger.log('✅ Created document: ' + docName);
    }
    
    // Add or update content in document
    const body = doc.getBody();
    
    // Clear existing content if it's a new document
    if (body.getParagraphs().length <= 1) {
      body.clear();
    }
    
    // Add header
    body.appendParagraph('📋 Վճարման Հարցում - ' + paymentCode)
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    body.appendParagraph('');
    
    // Add user information
    body.appendParagraph('👤 Օգտատիրոջ Տվյալներ:')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
    
    body.appendParagraph('Անուն: ' + (userName || 'Նշված չէ'));
    body.appendParagraph('Հեռախոս: ' + (phone || 'Նշված չէ'));
    body.appendParagraph('Email: ' + (email || 'Նշված չէ'));
    body.appendParagraph('Վճարման Եղանակ: ' + (paymentMethod || 'Նշված չէ'));
    
    if (message) {
      body.appendParagraph('');
      body.appendParagraph('💬 Հաղորդագրություն:')
        .setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph(message);
    }
    
    body.appendParagraph('');
    body.appendParagraph('📅 Ամսաթիվ: ' + dateFolderName + ' ' + date.toLocaleTimeString('hy-AM'));
    
    // Save document
    doc.saveAndClose();
    
    Logger.log('✅ Folder structure created successfully for payment code: ' + paymentCode);
    
    return {
      success: true,
      mainFolderId: mainFolder.getId(),
      codeFolderId: codeFolder.getId(),
      dateFolderId: dateFolder.getId(),
      docId: doc.getId(),
      docUrl: doc.getUrl()
    };
    
  } catch (error) {
    Logger.log('❌ Error creating folder structure: ' + error.toString());
    Logger.log('❌ Error stack: ' + (error.stack || 'No stack trace'));
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Update quiz usage in payment code folder
function updateQuizUsageInFolder(paymentCode, quizUsage) {
  try {
    Logger.log('📊 Updating quiz usage in folder for payment code: ' + paymentCode);
    
    // Find the payment code folder
    const mainFolderName = 'Payment Codes';
    const folders = DriveApp.getFoldersByName(mainFolderName);
    if (!folders.hasNext()) {
      Logger.log('⚠️ Main folder not found');
      return { success: false, error: 'Main folder not found' };
    }
    
    const mainFolder = folders.next();
    
    // Search for folder that starts with payment code
    let codeFolder = null;
    const allFolders = mainFolder.getFolders();
    while (allFolders.hasNext()) {
      const folder = allFolders.next();
      const folderName = folder.getName();
      if (folderName.startsWith(paymentCode + ' - ')) {
        codeFolder = folder;
        break;
      }
    }
    
    if (!codeFolder) {
      Logger.log('⚠️ Code folder not found for: ' + paymentCode);
      return { success: false, error: 'Code folder not found' };
    }
    
    // Create or update quiz usage document
    const quizDocName = 'Quiz Usage Statistics';
    let quizDoc;
    const quizDocs = codeFolder.getFilesByName(quizDocName);
    
    if (quizDocs.hasNext()) {
      quizDoc = DocumentApp.openById(quizDocs.next().getId());
    } else {
      quizDoc = DocumentApp.create(quizDocName);
      const quizDocFile = DriveApp.getFileById(quizDoc.getId());
      quizDocFile.moveTo(codeFolder);
    }
    
    const body = quizDoc.getBody();
    body.clear();
    
    body.appendParagraph('📊 Օգտագործման Վիճակագրություն - ' + paymentCode)
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    body.appendParagraph('');
    
    // Calculate totals
    let totalUsed = 0;
    let usedTests = [];
    let exhaustedTests = [];
    
    for (let i = 1; i <= 18; i++) {
      const quizSet = quizUsage[i.toString()] || quizUsage[i];
      if (quizSet && quizSet.attempts > 0) {
        totalUsed += quizSet.attempts;
        usedTests.push({ test: i, attempts: quizSet.attempts, completed: quizSet.completed || false });
        if (quizSet.attempts >= 3) {
          exhaustedTests.push(i);
        }
      }
    }
    
    body.appendParagraph('Ընդամենը օգտագործված: ' + totalUsed + ' / 54 անգամ')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('Օգտագործված թեստեր: ' + usedTests.length + ' / 18 թեստ');
    
    if (exhaustedTests.length > 0) {
      body.appendParagraph('Սպառված թեստեր: ' + exhaustedTests.join(', '));
    }
    
    body.appendParagraph('');
    body.appendParagraph('Մանրամասն:')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
    
    // Add detailed breakdown
    usedTests.forEach(({ test, attempts, completed }) => {
      const status = completed ? '✅ Ավարտված' : '⏳ Ընթացքի մեջ';
      body.appendParagraph('Թեստ ' + test + ': ' + attempts + ' / 3 անգամ - ' + status);
    });
    
    body.appendParagraph('');
    body.appendParagraph('📅 Վերջին թարմացում: ' + new Date().toLocaleString('hy-AM'));
    
    quizDoc.saveAndClose();
    
    Logger.log('✅ Quiz usage updated successfully');
    
    return {
      success: true,
      docId: quizDoc.getId(),
      docUrl: quizDoc.getUrl()
    };
    
  } catch (error) {
    Logger.log('❌ Error updating quiz usage in folder: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

