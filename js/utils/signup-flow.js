// Golf Salon 登録フロー管理ユーティリティ

/**
 * メールアドレス検証設定
 */
const EMAIL_VALIDATION = {
  // 基本的なメール形式の正規表現
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // 使い捨てメールドメインのブラックリスト（一部）
  DISPOSABLE_DOMAINS: [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'temp-mail.org',
    'throwaway.email'
  ],
  
  // よくあるタイポパターン
  COMMON_TYPOS: {
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'yaho.co.jp': 'yahoo.co.jp',
    'yahooo.co.jp': 'yahoo.co.jp'
  }
};

/**
 * 登録フロー管理クラス
 */
class SignupFlow {
  
  /**
   * Step1: メールアドレス入力画面の初期化
   */
  static initStep1() {
    const emailInput = document.getElementById('email');
    const continueBtn = document.getElementById('continue-btn');
    const emailForm = document.getElementById('email-form');
    
    if (!emailInput || !continueBtn || !emailForm) return;
    
    // リアルタイム検証
    emailInput.addEventListener('input', this.debounce(async (e) => {
      const email = e.target.value.trim();
      await this.validateEmailRealtime(email);
    }, 500));
    
    // フォーム送信
    emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      await this.handleEmailSubmit(email);
    });
  }
  
  /**
   * リアルタイムメール検証
   */
  static async validateEmailRealtime(email) {
    const continueBtn = document.getElementById('continue-btn');
    const emailValidation = document.getElementById('email-validation');
    const errorMessage = document.getElementById('error-message');
    const duplicateWarning = document.getElementById('duplicate-warning');
    
    // エラー・警告をクリア
    this.hideElement(errorMessage);
    this.hideElement(duplicateWarning);
    this.hideElement(emailValidation);
    
    if (!email) {
      continueBtn.disabled = true;
      return;
    }
    
    try {
      // 基本形式チェック
      if (!this.isValidEmailFormat(email)) {
        throw new Error('正しいメールアドレス形式で入力してください');
      }
      
      // タイポ修正提案
      const suggestion = this.getSuggestion(email);
      if (suggestion) {
        this.showEmailSuggestion(email, suggestion);
        continueBtn.disabled = true;
        return;
      }
      
      // 使い捨てメールチェック
      if (this.isDisposableEmail(email)) {
        throw new Error('使い捨てメールアドレスは使用できません');
      }
      
      // 重複チェック（実際の実装では API コール）
      const isDuplicate = await this.checkEmailExists(email);
      if (isDuplicate) {
        this.showElement(duplicateWarning);
        continueBtn.disabled = true;
        return;
      }
      
      // 検証成功
      this.showElement(emailValidation);
      continueBtn.disabled = false;
      
    } catch (error) {
      this.showError(error.message);
      continueBtn.disabled = true;
    }
  }
  
  /**
   * メール送信処理
   */
  static async handleEmailSubmit(email) {
    console.log('handleEmailSubmit called with email:', email);
    
    const continueBtn = document.getElementById('continue-btn');
    const btnText = document.getElementById('btn-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // ローディング状態
    continueBtn.disabled = true;
    btnText.textContent = '送信中...';
    this.showElement(loadingSpinner);
    
    try {
      console.log('Starting validation...');
      
      // 最終検証
      await this.validateEmailFinal(email);
      
      console.log('Validation passed, creating temp user...');
      
      // 仮ユーザー作成とOTP送信（実際の実装では API コール）
      await this.createTempUserAndSendOTP(email);
      
      console.log('Temp user created, navigating to step 2...');
      
      // Step2 に遷移
      this.navigateToStep2(email);
      
    } catch (error) {
      console.error('Error in handleEmailSubmit:', error);
      this.showError(error.message);
      
      // ローディング状態をリセット
      continueBtn.disabled = false;
      btnText.textContent = '認証コードを送信';
      this.hideElement(loadingSpinner);
    }
  }
  
  /**
   * Step2: OTP認証画面の初期化
   */
  static initStep2() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const verifyBtn = document.getElementById('verify-btn');
    const resendBtn = document.getElementById('resend-btn');
    const otpForm = document.getElementById('otp-form');
    
    // URLからメールアドレスを取得
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    
    if (!email) {
      // メールアドレスがない場合はStep1に戻る
      window.location.href = 'signup-step1.html';
      return;
    }
    
    // メールアドレス表示
    const emailDisplay = document.getElementById('email-display');
    if (emailDisplay) {
      emailDisplay.textContent = email;
    }
    
    // OTP入力フィールドの制御
    this.setupOTPInputs(otpInputs);
    
    // フォーム送信
    if (otpForm) {
      otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otpCode = this.getOTPCode(otpInputs);
        await this.handleOTPSubmit(email, otpCode);
      });
    }
    
    // 再送信
    if (resendBtn) {
      resendBtn.addEventListener('click', async () => {
        await this.handleResendOTP(email);
      });
    }
    
    // 再送信タイマー開始
    this.startResendTimer();
  }
  
  /**
   * Step3: 詳細情報入力画面の初期化
   */
  static initStep3() {
    // URLパラメータから認証済みセッション確認
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('token');
    
    if (!sessionToken || !this.isValidSession(sessionToken)) {
      // 無効なセッションの場合はStep1に戻る
      window.location.href = 'signup-step1.html';
      return;
    }
    
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
      registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registrationForm);
        await this.handleRegistrationSubmit(sessionToken, formData);
      });
    }
  }
  
  // ===================
  // バリデーション関数
  // ===================
  
  /**
   * メールアドレス形式チェック
   */
  static isValidEmailFormat(email) {
    return EMAIL_VALIDATION.EMAIL_REGEX.test(email);
  }
  
  /**
   * 使い捨てメールチェック
   */
  static isDisposableEmail(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    return EMAIL_VALIDATION.DISPOSABLE_DOMAINS.includes(domain);
  }
  
  /**
   * タイポ修正提案
   */
  static getSuggestion(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    return EMAIL_VALIDATION.COMMON_TYPOS[domain] || null;
  }
  
  /**
   * メール重複チェック（モック）
   */
  static async checkEmailExists(email) {
    // 実際の実装では API コール
    // モックデータでの確認
    const existingEmails = [
      'tanaka@example.com',
      'sato@example.com',
      'yamada@example.com'
    ];
    
    // 0.5秒の遅延をシミュレート
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return existingEmails.includes(email.toLowerCase());
  }
  
  /**
   * 最終メール検証
   */
  static async validateEmailFinal(email) {
    if (!this.isValidEmailFormat(email)) {
      throw new Error('正しいメールアドレス形式で入力してください');
    }
    
    if (this.isDisposableEmail(email)) {
      throw new Error('使い捨てメールアドレスは使用できません');
    }
    
    const isDuplicate = await this.checkEmailExists(email);
    if (isDuplicate) {
      throw new Error('このメールアドレスは既に登録されています');
    }
  }
  
  // ===================
  // API処理（モック）
  // ===================
  
  /**
   * 仮ユーザー作成とOTP送信
   */
  static async createTempUserAndSendOTP(email) {
    // 実際の実装では API コール
    console.log('Creating temp user and sending OTP to:', email);
    
    // モック遅延
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // LocalStorageに仮データ保存（実際はサーバーサイド）
    const tempUser = {
      email: email,
      otpCode: '123456', // 実際はランダム生成
      otpExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24時間
      createdAt: Date.now()
    };
    
    localStorage.setItem('temp_user', JSON.stringify(tempUser));
  }
  
  /**
   * OTP認証
   */
  static async handleOTPSubmit(email, otpCode) {
    const verifyBtn = document.getElementById('verify-btn');
    const btnText = verifyBtn.querySelector('span');
    const loadingSpinner = verifyBtn.querySelector('.loading-spinner');
    
    // ローディング状態
    verifyBtn.disabled = true;
    btnText.textContent = '認証中...';
    this.showElement(loadingSpinner);
    
    try {
      // OTP検証（実際の実装では API コール）
      const isValid = await this.verifyOTP(email, otpCode);
      
      if (!isValid) {
        throw new Error('認証コードが正しくありません');
      }
      
      // 認証成功 → Step3へ
      const sessionToken = this.generateSessionToken();
      this.navigateToStep3(sessionToken);
      
    } catch (error) {
      this.showError(error.message);
    } finally {
      // ローディング状態をリセット
      verifyBtn.disabled = false;
      btnText.textContent = '認証する';
      this.hideElement(loadingSpinner);
    }
  }
  
  /**
   * OTP検証（モック）
   */
  static async verifyOTP(email, otpCode) {
    // モック遅延
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const tempUser = JSON.parse(localStorage.getItem('temp_user') || '{}');
    
    // 期限チェック
    if (Date.now() > tempUser.otpExpiry) {
      throw new Error('認証コードの有効期限が切れています');
    }
    
    // コード照合（モック）
    return tempUser.otpCode === otpCode;
  }
  
  // ===================
  // ナビゲーション
  // ===================
  
  static navigateToStep2(email) {
    window.location.href = `./signup-step2.html?email=${encodeURIComponent(email)}`;
  }
  
  static navigateToStep3(sessionToken) {
    window.location.href = `./signup-step3.html?token=${sessionToken}`;
  }
  
  // ===================
  // ユーティリティ関数
  // ===================
  
  static showElement(element) {
    if (element) element.classList.remove('hidden');
  }
  
  static hideElement(element) {
    if (element) element.classList.add('hidden');
  }
  
  static showError(message) {
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (errorMessage && errorText) {
      errorText.textContent = message;
      this.showElement(errorMessage);
    }
  }
  
  static showEmailSuggestion(email, suggestion) {
    const currentDomain = email.split('@')[1];
    const suggestedEmail = email.replace(currentDomain, suggestion);
    
    this.showError(`もしかして「${suggestedEmail}」ですか？`);
  }
  
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  static generateSessionToken() {
    // 実際の実装では安全なトークン生成
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }
  
  static isValidSession(token) {
    // 実際の実装ではサーバーサイドで検証
    return token && token.startsWith('session_');
  }
  
  // OTP入力フィールド制御
  static setupOTPInputs(otpInputs) {
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // 数字のみ許可
        if (!/^\d*$/.test(value)) {
          e.target.value = value.replace(/\D/g, '');
          return;
        }
        
        // 次のフィールドに自動移動
        if (value.length === 1 && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
        
        // 送信ボタンの有効化チェック
        this.checkOTPComplete(otpInputs);
      });
      
      input.addEventListener('keydown', (e) => {
        // バックスペースで前のフィールドに移動
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
          otpInputs[index - 1].focus();
        }
      });
    });
  }
  
  static getOTPCode(otpInputs) {
    return Array.from(otpInputs).map(input => input.value).join('');
  }
  
  static checkOTPComplete(otpInputs) {
    const verifyBtn = document.getElementById('verify-btn');
    const otpCode = this.getOTPCode(otpInputs);
    
    if (verifyBtn) {
      verifyBtn.disabled = otpCode.length !== 6;
    }
  }
  
  static startResendTimer() {
    const resendBtn = document.getElementById('resend-btn');
    const timerSpan = document.getElementById('resend-timer');
    
    if (!resendBtn || !timerSpan) return;
    
    let timeLeft = 60; // 60秒
    resendBtn.disabled = true;
    
    const timer = setInterval(() => {
      timerSpan.textContent = `(${timeLeft}秒後に再送信可能)`;
      timeLeft--;
      
      if (timeLeft < 0) {
        clearInterval(timer);
        resendBtn.disabled = false;
        timerSpan.textContent = '';
      }
    }, 1000);
  }
  
  static async handleResendOTP(email) {
    const resendBtn = document.getElementById('resend-btn');
    
    resendBtn.disabled = true;
    resendBtn.textContent = '送信中...';
    
    try {
      await this.createTempUserAndSendOTP(email);
      
      // 成功メッセージ表示
      this.showSuccess('認証コードを再送信しました');
      
      // タイマー再開
      this.startResendTimer();
      
    } catch (error) {
      this.showError('再送信に失敗しました。しばらく後にお試しください。');
    } finally {
      resendBtn.textContent = '認証コードを再送信';
    }
  }
  
  static showSuccess(message) {
    // 成功メッセージ表示（実装は省略）
    console.log('Success:', message);
  }
}

// グローバルに公開
window.SignupFlow = SignupFlow;