from .baseotp import BaseOtpEmailSender

class LoginOtpSender(BaseOtpEmailSender):
    def __init__(self,email):
        super().__init__(email,purpose="login")

    def send(self):
        otp=self.generate_otp()
        subject = "🔐 Government of India MPOS - Login Authentication Required"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MPOS Login Authentication</title>
            <style>
                @keyframes slideDown {{
                    from {{ transform: translateY(-20px); opacity: 0; }}
                    to {{ transform: translateY(0); opacity: 1; }}
                }}
                @keyframes subtlePulse {{
                    0%, 100% {{ transform: scale(1); }}
                    50% {{ transform: scale(1.02); }}
                }}
                .container {{
                    max-width: 650px;
                    margin: 0 auto;
                    background: #f8f9fa;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 0;
                    border: 1px solid #e9ecef;
                }}
                .header {{
                    background: linear-gradient(135deg, #FF6600 0%, #FF8C00 100%);
                    padding: 30px;
                    text-align: center;
                    color: white;
                    border-bottom: 3px solid #138808;
                }}
                .gov-emblem {{
                    width: 60px;
                    height: 60px;
                    background: white;
                    border-radius: 50%;
                    margin: 0 auto 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: #FF6600;
                }}
                .logo {{
                    font-size: 22px;
                    font-weight: 700;
                    margin-bottom: 5px;
                    letter-spacing: 1px;
                }}
                .subtitle {{
                    font-size: 14px;
                    opacity: 0.95;
                    font-weight: 400;
                    margin-bottom: 5px;
                }}
                .hindi-text {{
                    font-size: 16px;
                    opacity: 0.9;
                    font-weight: 500;
                    margin-bottom: 10px;
                }}
                .content {{
                    background: white;
                    padding: 40px 35px;
                    animation: slideDown 0.6s ease-out;
                }}
                .security-badge {{
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, #FF6600, #138808);
                    border-radius: 50%;
                    margin: 0 auto 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: white;
                    animation: subtlePulse 3s infinite;
                    border: 3px solid #fff;
                    box-shadow: 0 4px 15px rgba(255, 102, 0, 0.3);
                }}
                .title {{
                    color: #138808;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 20px 0;
                    text-align: center;
                }}
                .description {{
                    color: #495057;
                    font-size: 16px;
                    line-height: 1.6;
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .otp-section {{
                    background: linear-gradient(135deg, #fff5e6 0%, #ffe0cc 100%);
                    border: 2px solid #FF6600;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                    text-align: center;
                    position: relative;
                }}
                .otp-label {{
                    color: #138808;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }}
                .otp {{
                    font-size: 32px;
                    font-weight: 700;
                    color: #138808;
                    letter-spacing: 8px;
                    font-family: 'Courier New', monospace;
                    margin: 0;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                }}
                .security-notice {{
                    background: #e8f5e8;
                    border-left: 4px solid #138808;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 25px 0;
                }}
                .notice-title {{
                    color: #138808;
                    font-weight: 600;
                    margin-bottom: 8px;
                    font-size: 14px;
                }}
                .notice-text {{
                    color: #0d5f0d;
                    font-size: 14px;
                    margin: 0;
                }}
                .footer {{
                    background: #138808;
                    color: #ffffff;
                    padding: 25px;
                    text-align: center;
                    font-size: 13px;
                }}
                .footer-link {{
                    color: #FFE5B4;
                    text-decoration: none;
                }}
                .divider {{
                    height: 2px;
                    background: linear-gradient(90deg, #FF6600, #138808, #FF6600);
                    margin: 25px 0;
                }}
                .satyamev {{
                    color: #138808;
                    font-size: 12px;
                    font-weight: 600;
                    margin-top: 10px;
                    font-style: italic;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="gov-emblem">🇮🇳</div>
                    <div class="logo">GOVERNMENT OF INDIA</div>
                    <div class="subtitle">Multi-Purpose Online Survey Platform</div>
                    <div class="hindi-text">भारत सरकार - MPOS</div>
                </div>
                <div class="content">
                    <div class="security-badge">🔐</div>
                    <h1 class="title">प्रमाणीकरण आवश्यक / Authentication Required</h1>
                    <p class="description">
                        आपके MPOS खाते के लिए लॉगिन प्रयास का पता चला है। कृपया अपना प्रमाणीकरण पूरा करने के लिए नीचे दिए गए सत्यापन कोड का उपयोग करें।<br><br>
                        A login attempt has been detected for your MPOS account. Please use the verification code below to complete your authentication.
                    </p>
                    
                    <div class="otp-section">
                        <div class="otp-label">सत्यापन कोड / Verification Code</div>
                        <div class="otp">{otp}</div>
                    </div>
                    
                    <div class="security-notice">
                        <div class="notice-title">🛡️ सुरक्षा जानकारी / Security Information</div>
                        <p class="notice-text">यह कोड 10 मिनट में समाप्त हो जाता है और केवल एक बार उपयोग किया जा सकता है। कभी भी इस कोड को किसी के साथ साझा न करें। / This code expires in 10 minutes and can only be used once. Never share this code with anyone.</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">
                        यदि आपने इस लॉगिन अनुरोध की शुरुआत नहीं की है, तो कृपया इस ईमेल को अनदेखा करें और अपना पासवर्ड बदलने पर विचार करें।<br>
                        If you did not initiate this login request, please ignore this email and consider changing your password.
                    </p>
                    <div class="satyamev">सत्यमेव जयते</div>
                </div>
                <div class="footer">
                    <p>© 2025 Government of India - MPOS. All rights reserved.</p>
                    <p>सहायता / Support: <a href="mailto:support@mpos.gov.in" class="footer-link">support@mpos.gov.in</a></p>
                    <p style="margin-top: 10px; font-size: 11px;">
                        <a href="#" class="footer-link">गोपनीयता नीति / Privacy Policy</a> | 
                        <a href="#" class="footer-link">सेवा की शर्तें / Terms of Service</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"Government of India MPOS Authentication Code: {otp}\n\nThis verification code expires in 10 minutes. Do not share it with anyone.\n\nIf you did not request this login, please ignore this email.\n\nसत्यमेव जयते"

        self.send_email(subject, text_content, html_content=html_content)
        return otp

class forgetPasswordOtpSender(BaseOtpEmailSender):
    def __init__(self,email):
        super().__init__(email,purpose="forget")

    def send(self):
        otp = self.generate_otp()
        subject = "🔑 Government of India MPOS - Password Reset Verification"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MPOS Password Reset</title>
            <style>
                @keyframes slideDown {{
                    from {{ transform: translateY(-20px); opacity: 0; }}
                    to {{ transform: translateY(0); opacity: 1; }}
                }}
                @keyframes subtlePulse {{
                    0%, 100% {{ transform: scale(1); }}
                    50% {{ transform: scale(1.02); }}
                }}
                .container {{
                    max-width: 650px;
                    margin: 0 auto;
                    background: #f8f9fa;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 0;
                    border: 1px solid #e9ecef;
                }}
                .header {{
                    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                    padding: 30px;
                    text-align: center;
                    color: white;
                    border-bottom: 3px solid #138808;
                }}
                .gov-emblem {{
                    width: 60px;
                    height: 60px;
                    background: white;
                    border-radius: 50%;
                    margin: 0 auto 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: #dc3545;
                }}
                .logo {{
                    font-size: 22px;
                    font-weight: 700;
                    margin-bottom: 5px;
                    letter-spacing: 1px;
                }}
                .subtitle {{
                    font-size: 14px;
                    opacity: 0.95;
                    font-weight: 400;
                    margin-bottom: 5px;
                }}
                .hindi-text {{
                    font-size: 16px;
                    opacity: 0.9;
                    font-weight: 500;
                    margin-bottom: 10px;
                }}
                .content {{
                    background: white;
                    padding: 40px 35px;
                    animation: slideDown 0.6s ease-out;
                }}
                .reset-badge {{
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, #dc3545, #138808);
                    border-radius: 50%;
                    margin: 0 auto 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: white;
                    animation: subtlePulse 3s infinite;
                    border: 3px solid #fff;
                    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
                }}
                .title {{
                    color: #138808;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 20px 0;
                    text-align: center;
                }}
                .description {{
                    color: #495057;
                    font-size: 16px;
                    line-height: 1.6;
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .otp-section {{
                    background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
                    border: 2px solid #dc3545;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                    text-align: center;
                }}
                .otp-label {{
                    color: #721c24;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }}
                .otp {{
                    font-size: 32px;
                    font-weight: 700;
                    color: #dc3545;
                    letter-spacing: 8px;
                    font-family: 'Courier New', monospace;
                    margin: 0;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                }}
                .steps {{
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 25px;
                    margin: 25px 0;
                    border: 1px solid #dee2e6;
                }}
                .step {{
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                    font-size: 14px;
                    color: #495057;
                }}
                .step-number {{
                    width: 28px;
                    height: 28px;
                    background: #138808;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 12px;
                    font-weight: 600;
                    font-size: 12px;
                }}
                .critical-notice {{
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 25px 0;
                }}
                .notice-title {{
                    color: #856404;
                    font-weight: 600;
                    margin-bottom: 8px;
                    font-size: 14px;
                }}
                .notice-text {{
                    color: #664d03;
                    font-size: 14px;
                    margin: 0;
                }}
                .footer {{
                    background: #138808;
                    color: #ffffff;
                    padding: 25px;
                    text-align: center;
                    font-size: 13px;
                }}
                .footer-link {{
                    color: #FFE5B4;
                    text-decoration: none;
                }}
                .divider {{
                    height: 2px;
                    background: linear-gradient(90deg, #FF6600, #138808, #FF6600);
                    margin: 25px 0;
                }}
                .satyamev {{
                    color: #138808;
                    font-size: 12px;
                    font-weight: 600;
                    margin-top: 10px;
                    font-style: italic;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="gov-emblem">🇮🇳</div>
                    <div class="logo">GOVERNMENT OF INDIA</div>
                    <div class="subtitle">Multi-Purpose Online Survey Platform</div>
                    <div class="hindi-text">भारत सरकार - MPOS</div>
                </div>
                <div class="content">
                    <div class="reset-badge">🔓</div>
                    <h1 class="title">पासवर्ड रीसेट अनुरोध / Password Reset Request</h1>
                    <p class="description">
                        हमें आपका पासवर्ड रीसेट करने का अनुरोध मिला है। नया पासवर्ड बनाने के लिए नीचे दिए गए सत्यापन कोड का उपयोग करें।<br><br>
                        We received a request to reset your password. Use the verification code below to proceed with creating a new password.
                    </p>
                    
                    <div class="otp-section">
                        <div class="otp-label">रीसेट सत्यापन कोड / Reset Verification Code</div>
                        <div class="otp">{otp}</div>
                    </div>
                    
                    <div class="steps">
                        <h3 style="color: #138808; margin: 0 0 20px 0; font-size: 16px;">अगले चरण / Next Steps:</h3>
                        <div class="step">
                            <div class="step-number">1</div>
                            <span>ऊपर दिया गया सत्यापन कोड दर्ज करें / Enter the verification code above</span>
                        </div>
                        <div class="step">
                            <div class="step-number">2</div>
                            <span>एक मजबूत, अनूठा पासवर्ड बनाएं / Create a strong, unique password</span>
                        </div>
                        <div class="step">
                            <div class="step-number">3</div>
                            <span>अपनी नई साख के साथ लॉग इन करें / Log in with your new credentials</span>
                        </div>
                    </div>
                    
                    <div class="critical-notice">
                        <div class="notice-title">⚠️ सुरक्षा चेतावनी / Security Alert</div>
                        <p class="notice-text">यदि आपने इस पासवर्ड रीसेट का अनुरोध नहीं किया है, तो कृपया तुरंत हमारी सुरक्षा टीम से संपर्क करें। यह कोड 10 मिनट में समाप्त हो जाता है। / If you did not request this password reset, please contact our security team immediately. This code expires in 10 minutes.</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">
                        सुरक्षा कारणों से, यह लिंक केवल एक बार उपयोग किया जा सकता है और 10 मिनट बाद समाप्त हो जाता है।<br>
                        For security reasons, this link can only be used once and expires after 10 minutes.
                    </p>
                    <div class="satyamev">सत्यमेव जयते</div>
                </div>
                <div class="footer">
                    <p>© 2025 Government of India - MPOS. All rights reserved.</p>
                    <p>सुरक्षा / Security: <a href="mailto:security@mpos.gov.in" class="footer-link">security@mpos.gov.in</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"Government of India MPOS Password Reset Code: {otp}\n\nUse this code to reset your password. This code expires in 10 minutes.\n\nIf you did not request this reset, please contact security@mpos.gov.in immediately.\n\nसत्यमेव जयते"

        self.send_email(subject, text_content, html_content=html_content)
        return otp

class RegistrationOtpSender(BaseOtpEmailSender):
    def __init__(self,email):
        super().__init__(email,purpose="register")

    def send(self):
        otp = self.generate_otp()
        subject = "📧 Government of India MPOS - Account Verification Required"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MPOS Account Verification</title>
            <style>
                @keyframes slideDown {{
                    from {{ transform: translateY(-20px); opacity: 0; }}
                    to {{ transform: translateY(0); opacity: 1; }}
                }}
                @keyframes subtlePulse {{
                    0%, 100% {{ transform: scale(1); }}
                    50% {{ transform: scale(1.02); }}
                }}
                .container {{
                    max-width: 650px;
                    margin: 0 auto;
                    background: #f8f9fa;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 0;
                    border: 1px solid #e9ecef;
                }}
                .header {{
                    background: linear-gradient(135deg, #0056b3 0%, #007bff 100%);
                    padding: 30px;
                    text-align: center;
                    color: white;
                    border-bottom: 3px solid #138808;
                }}
                .gov-emblem {{
                    width: 60px;
                    height: 60px;
                    background: white;
                    border-radius: 50%;
                    margin: 0 auto 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: #0056b3;
                }}
                .logo {{
                    font-size: 22px;
                    font-weight: 700;
                    margin-bottom: 5px;
                    letter-spacing: 1px;
                }}
                .subtitle {{
                    font-size: 14px;
                    opacity: 0.95;
                    font-weight: 400;
                    margin-bottom: 5px;
                }}
                .hindi-text {{
                    font-size: 16px;
                    opacity: 0.9;
                    font-weight: 500;
                    margin-bottom: 10px;
                }}
                .content {{
                    background: white;
                    padding: 40px 35px;
                    animation: slideDown 0.6s ease-out;
                }}
                .verify-badge {{
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, #0056b3, #138808);
                    border-radius: 50%;
                    margin: 0 auto 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: white;
                    animation: subtlePulse 3s infinite;
                    border: 3px solid #fff;
                    box-shadow: 0 4px 15px rgba(0, 86, 179, 0.3);
                }}
                .title {{
                    color: #138808;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 20px 0;
                    text-align: center;
                }}
                .description {{
                    color: #495057;
                    font-size: 16px;
                    line-height: 1.6;
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .otp-section {{
                    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                    border: 2px solid #2196f3;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                    text-align: center;
                }}
                .otp-label {{
                    color: #1565c0;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }}
                .otp {{
                    font-size: 32px;
                    font-weight: 700;
                    color: #0056b3;
                    letter-spacing: 8px;
                    font-family: 'Courier New', monospace;
                    margin: 0;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                }}
                .progress-section {{
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 25px;
                    margin: 25px 0;
                    border: 1px solid #dee2e6;
                }}
                .progress-title {{
                    color: #138808;
                    font-weight: 600;
                    margin-bottom: 20px;
                    font-size: 16px;
                    text-align: center;
                }}
                .progress-steps {{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                }}
                .progress-step {{
                    text-align: center;
                    flex: 1;
                }}
                .step-circle {{
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    margin: 0 auto 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;
                }}
                .step-completed {{
                    background: #28a745;
                    color: white;
                }}
                .step-active {{
                    background: #007bff;
                    color: white;
                }}
                .step-pending {{
                    background: #e9ecef;
                    color: #6c757d;
                }}
                .step-text {{
                    font-size: 12px;
                    color: #6c757d;
                    font-weight: 500;
                }}
                .progress-line {{
                    position: absolute;
                    top: 18px;
                    left: 25%;
                    right: 25%;
                    height: 2px;
                    background: #e9ecef;
                    z-index: 1;
                }}
                .progress-fill {{
                    height: 100%;
                    background: #28a745;
                    width: 50%;
                }}
                .features {{
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 25px;
                    margin: 25px 0;
                    border: 1px solid #dee2e6;
                }}
                .feature {{
                    display: flex;
                    align-items: center;
                    margin-bottom: 12px;
                    font-size: 14px;
                    color: #495057;
                }}
                .feature-icon {{
                    margin-right: 12px;
                    font-size: 16px;
                }}
                .welcome-notice {{
                    background: #d4edda;
                    border-left: 4px solid #28a745;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 25px 0;
                }}
                .notice-title {{
                    color: #155724;
                    font-weight: 600;
                    margin-bottom: 8px;
                    font-size: 14px;
                }}
                .notice-text {{
                    color: #155724;
                    font-size: 14px;
                    margin: 0;
                }}
                .footer {{
                    background: #138808;
                    color: #ffffff;
                    padding: 25px;
                    text-align: center;
                    font-size: 13px;
                }}
                .footer-link {{
                    color: #FFE5B4;
                    text-decoration: none;
                }}
                .divider {{
                    height: 2px;
                    background: linear-gradient(90deg, #FF6600, #138808, #FF6600);
                    margin: 25px 0;
                }}
                .satyamev {{
                    color: #138808;
                    font-size: 12px;
                    font-weight: 600;
                    margin-top: 10px;
                    font-style: italic;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="gov-emblem">🇮🇳</div>
                    <div class="logo">GOVERNMENT OF INDIA</div>
                    <div class="subtitle">Multi-Purpose Online Survey Platform</div>
                    <div class="hindi-text">भारत सरकार - MPOS</div>
                </div>
                <div class="content">
                    <div class="verify-badge">✓</div>
                    <h1 class="title">अपना पंजीकरण पूरा करें / Complete Your Registration</h1>
                    <p class="description">
                        MPOS में आपका स्वागत है! आप हमारे सरकारी सर्वेक्षण प्लेटफॉर्म तक पहुंचने से केवल एक कदम दूर हैं। कृपया नीचे दिए गए कोड का उपयोग करके अपना ईमेल पता सत्यापित करें।<br><br>
                        Welcome to MPOS! You're one step away from accessing our government survey platform. Please verify your email address using the code below.
                    </p>
                    
                    <div class="progress-section">
                        <div class="progress-title">पंजीकरण प्रगति / Registration Progress</div>
                        <div class="progress-steps">
                            <div class="progress-line">
                                <div class="progress-fill"></div>
                            </div>
                            <div class="progress-step">
                                <div class="step-circle step-completed">✓</div>
                                <div class="step-text">खाता बनाया गया / Account Created</div>
                            </div>
                            <div class="progress-step">
                                <div class="step-circle step-active">2</div>
                                <div class="step-text">ईमेल सत्यापन / Email Verification</div>
                            </div>
                            <div class="progress-step">
                                <div class="step-circle step-pending">3</div>
                                <div class="step-text">सेटअप पूरा करें / Complete Setup</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="otp-section">
                        <div class="otp-label">सत्यापन कोड / Verification Code</div>
                        <div class="otp">{otp}</div>
                    </div>
                    
                    <div class="features">
                        <h3 style="color: #138808; margin: 0 0 20px 0; font-size: 16px;">आपका इंतजार कर रहा है / What's waiting for you:</h3>
                        <div class="feature">
                            <div class="feature-icon">🎯</div>
                            <span>सरकारी सर्वेक्षण और डेटा संग्रह / Government surveys and data collection</span>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">📊</div>
                            <span>विस्तृत रिपोर्टिंग और विश्लेषण / Detailed reporting and analytics</span>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">🏛️</div>
                            <span>नीति निर्माण में योगदान / Contribute to policy making</span>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">🔒</div>
                            <span>सुरक्षित और गोपनीय / Secure and confidential</span>
                        </div>
                    </div>
                    
                    <div class="welcome-notice">
                        <div class="notice-title">🎯 राष्ट्रीय सेवा / National Service</div>
                        <p class="notice-text">यह सत्यापन कोड 10 मिनट में समाप्त हो जाता है। इस जानकारी को गोपनीय और सुरक्षित रखें। / This verification code expires in 10 minutes. Keep this information confidential and secure.</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">
                        यदि आपने यह खाता नहीं बनाया है, तो कृपया इस ईमेल को अनदेखा करें या हमारी सहायता टीम से संपर्क करें।<br>
                        If you didn't create this account, please ignore this email or contact our support team.
                    </p>
                    <div class="satyamev">सत्यमेव जयते</div>
                </div>
                <div class="footer">
                    <p>© 2025 Government of India - MPOS. All rights reserved.</p>
                    <p>सहायता / Support: <a href="mailto:support@mpos.gov.in" class="footer-link">support@mpos.gov.in</a></p>
                    <p style="margin-top: 10px; font-size: 11px;">
                        <a href="#" class="footer-link">गोपनीयता नीति / Privacy Policy</a> | 
                        <a href="#" class="footer-link">सेवा की शर्तें / Terms of Service</a> | 
                        <a href="#" class="footer-link">सहायता केंद्र / Help Center</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"Government of India MPOS में आपका स्वागत है!\n\nसत्यापन कोड / Verification Code: {otp}\n\nकृपया अपना खाता सत्यापन पूरा करने के लिए इस कोड का उपयोग करें। यह कोड 10 मिनट में समाप्त हो जाता है।\n\nयदि आपने यह खाता नहीं बनाया है, तो कृपया इस ईमेल को अनदेखा करें।\n\nसत्यमेव जयते"

        self.send_email(subject, text_content, html_content=html_content)
        return otp

class UpdatePasswordOtpSender(BaseOtpEmailSender):
    def __init__(self,email):
        super().__init__(email,purpose="update")

    def send(self):
        otp = self.generate_otp()
        subject = "🔐 Government of India MPOS - Password Update Authorization"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MPOS Password Update</title>
            <style>
                @keyframes slideDown {{
                    from {{ transform: translateY(-20px); opacity: 0; }}
                    to {{ transform: translateY(0); opacity: 1; }}
                }}
                @keyframes subtlePulse {{
                    0%, 100% {{ transform: scale(1); }}
                    50% {{ transform: scale(1.02); }}
                }}
                .container {{
                    max-width: 650px;
                    margin: 0 auto;
                    background: #f8f9fa;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 0;
                    border: 1px solid #e9ecef;
                }}
                .header {{
                    background: linear-gradient(135deg, #6f42c1 0%, #8e24aa 100%);
                    padding: 30px;
                    text-align: center;
                    color: white;
                    border-bottom: 3px solid #138808;
                }}
                .gov-emblem {{
                    width: 60px;
                    height: 60px;
                    background: white;
                    border-radius: 50%;
                    margin: 0 auto 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: #6f42c1;
                }}
                .logo {{
                    font-size: 22px;
                    font-weight: 700;
                    margin-bottom: 5px;
                    letter-spacing: 1px;
                }}
                .subtitle {{
                    font-size: 14px;
                    opacity: 0.95;
                    font-weight: 400;
                    margin-bottom: 5px;
                }}
                .hindi-text {{
                    font-size: 16px;
                    opacity: 0.9;
                    font-weight: 500;
                    margin-bottom: 10px;
                }}
                .content {{
                    background: white;
                    padding: 40px 35px;
                    animation: slideDown 0.6s ease-out;
                }}
                .security-badge {{
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, #6f42c1, #138808);
                    border-radius: 50%;
                    margin: 0 auto 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: white;
                    animation: subtlePulse 3s infinite;
                    border: 3px solid #fff;
                    box-shadow: 0 4px 15px rgba(111, 66, 193, 0.3);
                }}
                .title {{
                    color: #138808;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 20px 0;
                    text-align: center;
                }}
                .description {{
                    color: #495057;
                    font-size: 16px;
                    line-height: 1.6;
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .otp-section {{
                    background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
                    border: 2px solid #9c27b0;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                    text-align: center;
                }}
                .otp-label {{
                    color: #4a148c;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }}
                .otp {{
                    font-size: 32px;
                    font-weight: 700;
                    color: #6f42c1;
                    letter-spacing: 8px;
                    font-family: 'Courier New', monospace;
                    margin: 0;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                }}
                .progress-container {{
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 25px;
                    margin: 25px 0;
                    border: 1px solid #dee2e6;
                }}
                .progress-title {{
                    color: #138808;
                    font-weight: 600;
                    margin-bottom: 20px;
                    font-size: 16px;
                    text-align: center;
                }}
                .timeline {{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                }}
                .timeline-step {{
                    text-align: center;
                    flex: 1;
                    position: relative;
                    z-index: 2;
                }}
                .timeline-circle {{
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin: 0 auto 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;
                }}
                .step-completed {{
                    background: #28a745;
                    color: white;
                }}
                .step-active {{
                    background: #6f42c1;
                    color: white;
                    animation: subtlePulse 2s infinite;
                }}
                .step-pending {{
                    background: #e9ecef;
                    color: #6c757d;
                }}
                .step-label {{
                    font-size: 12px;
                    color: #6c757d;
                    font-weight: 500;
                }}
                .progress-line {{
                    position: absolute;
                    top: 20px;
                    left: 15%;
                    right: 15%;
                    height: 2px;
                    background: #e9ecef;
                    z-index: 1;
                }}
                .progress-fill {{
                    height: 100%;
                    background: #28a745;
                    width: 50%;
                    border-radius: 1px;
                }}
                .security-tips {{
                    background: #e3f2fd;
                    border-left: 4px solid #2196f3;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 25px 0;
                }}
                .tips-title {{
                    color: #0d47a1;
                    font-weight: 600;
                    margin-bottom: 15px;
                    font-size: 14px;
                }}
                .tip-item {{
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #1565c0;
                }}
                .tip-bullet {{
                    margin-right: 8px;
                    margin-top: 2px;
                }}
                .security-notice {{
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 25px 0;
                }}
                .notice-title {{
                    color: #856404;
                    font-weight: 600;
                    margin-bottom: 8px;
                    font-size: 14px;
                }}
                .notice-text {{
                    color: #664d03;
                    font-size: 14px;
                    margin: 0;
                }}
                .footer {{
                    background: #138808;
                    color: #ffffff;
                    padding: 25px;
                    text-align: center;
                    font-size: 13px;
                }}
                .footer-link {{
                    color: #FFE5B4;
                    text-decoration: none;
                }}
                .divider {{
                    height: 2px;
                    background: linear-gradient(90deg, #FF6600, #138808, #FF6600);
                    margin: 25px 0;
                }}
                .satyamev {{
                    color: #138808;
                    font-size: 12px;
                    font-weight: 600;
                    margin-top: 10px;
                    font-style: italic;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="gov-emblem">🇮🇳</div>
                    <div class="logo">GOVERNMENT OF INDIA</div>
                    <div class="subtitle">Multi-Purpose Online Survey Platform</div>
                    <div class="hindi-text">भारत सरकार - MPOS</div>
                </div>
                <div class="content">
                    <div class="security-badge">🔄</div>
                    <h1 class="title">पासवर्ड अपडेट अनुरोध / Password Update Request</h1>
                    <p class="description">
                        आपने अपने खाते का पासवर्ड अपडेट करने का अनुरोध किया है। इस सुरक्षा-संवेदनशील कार्रवाई के साथ आगे बढ़ने के लिए कृपया नीचे दिए गए प्राधिकरण कोड का उपयोग करें।<br><br>
                        You have requested to update your account password. Please use the authorization code below to proceed with this security-sensitive operation.
                    </p>
                    
                    <div class="progress-container">
                        <div class="progress-title">सुरक्षा प्रक्रिया / Security Process</div>
                        <div class="timeline">
                            <div class="progress-line">
                                <div class="progress-fill"></div>
                            </div>
                            <div class="timeline-step">
                                <div class="timeline-circle step-completed">✓</div>
                                <div class="step-label">अनुरोध शुरू किया गया / Request Initiated</div>
                            </div>
                            <div class="timeline-step">
                                <div class="timeline-circle step-active">2</div>
                                <div class="step-label">ईमेल सत्यापन / Email Verification</div>
                            </div>
                            <div class="timeline-step">
                                <div class="timeline-circle step-pending">3</div>
                                <div class="step-label">पासवर्ड अपडेट / Password Update</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="otp-section">
                        <div class="otp-label">प्राधिकरण कोड / Authorization Code</div>
                        <div class="otp">{otp}</div>
                    </div>
                    
                    <div class="security-tips">
                        <div class="tips-title">🛡️ पासवर्ड सुरक्षा सर्वोत्तम प्रथाएं / Password Security Best Practices</div>
                        <div class="tip-item">
                            <div class="tip-bullet">•</div>
                            <span>बड़े, छोटे अक्षरों, संख्याओं और प्रतीकों का संयोजन का उपयोग करें / Use uppercase, lowercase, numbers, and symbols</span>
                        </div>
                        <div class="tip-item">
                            <div class="tip-bullet">•</div>
                            <span>कम से कम 12 वर्णों का पासवर्ड बनाएं / Create a password that's at least 12 characters long</span>
                        </div>
                        <div class="tip-item">
                            <div class="tip-bullet">•</div>
                            <span>व्यक्तिगत जानकारी या शब्दकोश शब्दों का उपयोग न करें / Avoid personal information or dictionary words</span>
                        </div>
                        <div class="tip-item">
                            <div class="tip-bullet">•</div>
                            <span>दो-कारक प्रमाणीकरण सक्षम करने पर विचार करें / Consider enabling two-factor authentication</span>
                        </div>
                    </div>
                    
                    <div class="security-notice">
                        <div class="notice-title">⚠️ महत्वपूर्ण सुरक्षा जानकारी / Important Security Information</div>
                        <p class="notice-text">यह प्राधिकरण कोड 10 मिनट में समाप्त हो जाता है। यदि आपने इस पासवर्ड परिवर्तन का अनुरोध नहीं किया है, तो कृपया तुरंत हमारी सुरक्षा टीम से संपर्क करें और इस कोड को साझा न करें। / This authorization code expires in 10 minutes. If you did not request this password change, please contact our security team immediately and do not share this code.</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">
                        यह अनुरोध आपके खाते से शुरू किया गया था। यदि यह आप नहीं थे, तो कृपया तुरंत अपने खाते को सुरक्षित करें।<br>
                        This request was initiated from your account. If this was not you, please secure your account immediately.
                    </p>
                    <div class="satyamev">सत्यमेव जयते</div>
                </div>
                <div class="footer">
                    <p>© 2025 Government of India - MPOS. All rights reserved.</p>
                    <p>सुरक्षा टीम / Security Team: <a href="mailto:security@mpos.gov.in" class="footer-link">security@mpos.gov.in</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"Government of India MPOS Password Update Authorization\n\nप्राधिकरण कोड / Authorization Code: {otp}\n\nयह कोड 10 मिनट में समाप्त हो जाता है। अपना पासवर्ड अपडेट पूरा करने के लिए इसका उपयोग करें।\n\nयदि आपने इस परिवर्तन का अनुरोध नहीं किया है, तो तुरंत security@mpos.gov.in से संपर्क करें।\n\nसत्यमेव जयते"

        self.send_email(subject, text_content, html_content=html_content)
        return otp
