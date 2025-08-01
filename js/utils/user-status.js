// Golf Salon ユーザーステータス管理ユーティリティ

/**
 * ユーザーステータス設定
 * 業界標準に基づく統一的な表示設定とアイコンを管理
 */
const STATUS_CONFIG = {
  // 登録フェーズ（24時間期限付き）
  'pending-verification': {
    name: '認証待ち',
    class: 'bg-yellow-100 text-yellow-800',
    icon: 'mail-check',
    priority: 1,
    expiryHours: 24
  },
  'verification-expired': {
    name: '認証期限切れ',
    class: 'bg-red-100 text-red-800',
    icon: 'clock-x',
    priority: 2,
    autoCleanup: true
  },
  'verified-no-payment': {
    name: '決済未完了',
    class: 'bg-orange-100 text-orange-800',
    icon: 'credit-card',
    priority: 3
  },
  
  // アクティブフェーズ
  'active': {
    name: 'アクティブ',
    class: 'bg-green-100 text-green-800',
    icon: 'check-circle',
    priority: 4
  },
  'payment-failed': {
    name: '決済失敗',
    class: 'bg-yellow-100 text-yellow-800',
    icon: 'alert-triangle',
    priority: 5
  },
  
  // 段階的無効化フェーズ（改善）
  'payment-suspended': {
    name: '利用停止中',
    class: 'bg-orange-100 text-orange-800',
    icon: 'pause-circle',
    priority: 6,
    graceDays: 30
  },
  'auto-canceled': {
    name: '失効',
    class: 'bg-blue-100 text-blue-800',
    icon: 'clock',
    priority: 7
  },
  'withdrawal-pending': {
    name: '退会申請中',
    class: 'bg-orange-100 text-orange-800',
    icon: 'user-minus',
    priority: 8
  },
  'canceled': {
    name: '退会済み',
    class: 'bg-gray-100 text-gray-800',
    icon: 'user-x',
    priority: 9
  },
  'suspended': {
    name: '停止中',
    class: 'bg-red-100 text-red-800',
    icon: 'ban',
    priority: 10
  },
  'expired': {
    name: '期限切れ',
    class: 'bg-gray-100 text-gray-800',
    icon: 'calendar-x',
    priority: 11,
    autoCleanup: true
  },
  
  // フォールバック
  'unknown': {
    name: '不明',
    class: 'bg-gray-100 text-gray-800',
    icon: 'help-circle',
    priority: 9
  }
};

/**
 * ユーザーステータス管理クラス
 */
class UserStatusUtils {
  
  /**
   * ユーザーの表示用ステータスを取得
   * @param {Object} user - ユーザーオブジェクト
   * @returns {Object} ステータス表示情報
   */
  static getDisplayStatus(user) {
    const statusKey = this.getStatusKey(user);
    const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.unknown;
    
    return {
      key: statusKey,
      name: config.name,
      class: config.class,
      icon: config.icon,
      priority: config.priority
    };
  }
  
  /**
   * ユーザーのステータスキーを判定（期限チェック付き）
   * @param {Object} user - ユーザーオブジェクト
   * @returns {string} ステータスキー
   */
  static getStatusKey(user) {
    // 1. 課金済みユーザー（subscription.statusで判定）
    if (user.subscription?.status) {
      // 決済未完了ユーザーの段階的無効化チェック
      if (user.subscription.status === 'verified-no-payment') {
        return this.checkPaymentGracePeriod(user);
      }
      return user.subscription.status;
    }
    
    // 2. 認証済み・決済未完了（期限チェック付き）
    if (user.emailVerified) {
      return this.checkPaymentGracePeriod(user);
    }
    
    // 3. 未認証（期限チェック付き）
    return this.checkVerificationExpiry(user);
  }
  
  /**
   * 認証期限をチェック（24時間制限）
   * @param {Object} user - ユーザーオブジェクト
   * @returns {string} ステータスキー
   */
  static checkVerificationExpiry(user) {
    const createdAt = new Date(user.createdAt);
    const expiryTime = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24時間後
    const now = new Date();
    
    if (now > expiryTime) {
      return 'verification-expired';
    }
    return 'pending-verification';
  }
  
  /**
   * 決済猶予期間をチェック（段階的無効化）
   * @param {Object} user - ユーザーオブジェクト
   * @returns {string} ステータスキー
   */
  static checkPaymentGracePeriod(user) {
    const verifiedAt = new Date(user.emailVerified);
    const daysSinceVerification = Math.floor((new Date() - verifiedAt) / (1000 * 60 * 60 * 24));
    
    // 段階的無効化スケジュール
    if (daysSinceVerification >= 90) {
      return 'expired';           // 90日後: 完全無効化
    } else if (daysSinceVerification >= 30) {
      return 'payment-suspended'; // 30日後: 利用停止
    }
    
    return 'verified-no-payment'; // 30日以内: 通常状態
  }
  
  /**
   * フィルター用のステータスキーを取得
   * @param {Object} user - ユーザーオブジェクト
   * @returns {string} フィルター用ステータスキー
   */
  static getStatusForFilter(user) {
    return this.getStatusKey(user);
  }
  
  /**
   * ステータス遷移が可能かチェック（業界標準準拠）
   * @param {Object} user - ユーザーオブジェクト
   * @param {string} newStatus - 遷移先ステータス
   * @returns {boolean} 遷移可能かどうか
   */
  static canTransitionTo(user, newStatus) {
    const currentStatus = this.getStatusKey(user);
    
    // 業界標準に基づく遷移ルール
    const transitionRules = {
      'pending-verification': ['verified-no-payment', 'verification-expired'],
      'verification-expired': [], // 不可逆（削除対象）
      'verified-no-payment': ['active', 'payment-suspended'],
      'payment-suspended': ['active', 'expired'], // 復活可能 or 完全無効化
      'active': ['payment-failed', 'withdrawal-pending', 'suspended'],
      'payment-failed': ['active', 'auto-canceled', 'suspended'],
      'auto-canceled': ['active'], // 再登録のみ可能
      'withdrawal-pending': ['canceled', 'active'], // 取り消し可能
      'canceled': [], // 完全不可逆
      'suspended': ['canceled'], // 管理者による強制退会のみ
      'expired': [] // 完全不可逆（削除対象）
    };
    
    return transitionRules[currentStatus]?.includes(newStatus) || false;
  }
  
  /**
   * ステータス別ユーザー数を集計
   * @param {Array} users - ユーザー配列
   * @returns {Object} ステータス別集計
   */
  static getStatusCounts(users) {
    const counts = {};
    
    // 全ステータスを0で初期化
    Object.keys(STATUS_CONFIG).forEach(key => {
      if (key !== 'unknown') {
        counts[key] = 0;
      }
    });
    
    // ユーザーごとにカウント
    users.forEach(user => {
      const statusKey = this.getStatusKey(user);
      counts[statusKey] = (counts[statusKey] || 0) + 1;
    });
    
    return counts;
  }
  
  /**
   * ステータス一覧を優先順位順で取得
   * @returns {Array} ステータス設定の配列
   */
  static getStatusList() {
    return Object.entries(STATUS_CONFIG)
      .filter(([key]) => key !== 'unknown')
      .map(([key, config]) => ({ key, ...config }))
      .sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * 特定ステータスの設定を取得
   * @param {string} statusKey - ステータスキー
   * @returns {Object} ステータス設定
   */
  static getStatusConfig(statusKey) {
    return STATUS_CONFIG[statusKey] || STATUS_CONFIG.unknown;
  }
  
  /**
   * 自動クリーンアップ対象ユーザーを取得（業界標準）
   * @param {Array} users - ユーザー配列
   * @returns {Object} クリーンアップ対象ユーザー
   */
  static getCleanupTargets(users) {
    const now = new Date();
    const targets = {
      expiredVerifications: [], // 24時間経過した未認証ユーザー
      expiredAccounts: [],      // 90日経過した決済未完了ユーザー
      gracePeriodWarnings: []   // 30日経過（警告対象）
    };
    
    users.forEach(user => {
      const statusKey = this.getStatusKey(user);
      
      switch(statusKey) {
        case 'verification-expired':
          targets.expiredVerifications.push(user);
          break;
          
        case 'expired':
          targets.expiredAccounts.push(user);
          break;
          
        case 'payment-suspended':
          targets.gracePeriodWarnings.push(user);
          break;
      }
    });
    
    return targets;
  }
  
  /**
   * 日次バッチ処理用の期限チェック
   * @param {Array} users - ユーザー配列
   * @returns {Object} アクション推奨リスト
   */
  static getDailyActions(users) {
    const actions = {
      sendReminders: [],     // 催促メール送信対象
      suspendAccounts: [],   // アカウント停止対象
      cleanupAccounts: []    // 削除対象
    };
    
    users.forEach(user => {
      if (!user.emailVerified) return; // 未認証は別処理
      
      const verifiedAt = new Date(user.emailVerified);
      const daysSince = Math.floor((new Date() - verifiedAt) / (1000 * 60 * 60 * 24));
      
      if (daysSince === 14 && !user.paymentReminderSent) {
        actions.sendReminders.push(user);
      } else if (daysSince === 30) {
        actions.suspendAccounts.push(user);
      } else if (daysSince >= 90) {
        actions.cleanupAccounts.push(user);
      }
    });
    
    return actions;
  }
}

// グローバルに公開
window.UserStatusUtils = UserStatusUtils;

// NodeJS環境での利用も考慮
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserStatusUtils;
}