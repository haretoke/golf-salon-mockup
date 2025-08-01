// Golf Salon データローダー
// JSONファイルからデータを読み込み、キャッシュ管理を行う（関数ベース）

// グローバルキャッシュとベースURL
const dataCache = new Map();
const baseUrl = './data/';

// 汎用的なデータ読み込み関数
async function loadData(filename) {
  // キャッシュチェック
  if (dataCache.has(filename)) {
    return dataCache.get(filename);
  }

  try {
    const response = await fetch(baseUrl + filename);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.status}`);
    }
    
    const data = await response.json();
    dataCache.set(filename, data);
    return data;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return null;
  }
}

// キャッシュクリア関数
function clearCache() {
  dataCache.clear();
}

// 特定のファイルのキャッシュをクリア
function clearCacheForFile(filename) {
  dataCache.delete(filename);
}

// ユーザーデータ読み込み
async function loadUsers() {
  return loadData('users.json');
}

// サブスクリプションデータ読み込み
async function loadSubscriptions() {
  return loadData('subscriptions.json');
}

// 決済データ読み込み
async function loadPayments() {
  return loadData('payments.json');
}

// プランデータ読み込み
async function loadPlans() {
  return loadData('plans.json');
}

// コンテンツデータ読み込み
async function loadContents() {
  return loadData('contents.json');
}

// コンテンツメディアデータ読み込み
async function loadContentMedia() {
  return loadData('content_media.json');
}

// カテゴリデータ読み込み
async function loadCategories() {
  return loadData('categories.json');
}

// コンテンツ視聴データ読み込み
async function loadContentViews() {
  return loadData('content_views.json');
}

// メールログデータ読み込み
async function loadEmailLogs() {
  return loadData('email_logs.json');
}

// システム設定データ読み込み
async function loadSystemSettings() {
  return loadData('system_settings.json');
}

// 通知設定データ読み込み
async function loadNotificationSettings() {
  return loadData('notification_settings.json');
}

// 変更履歴データ読み込み
async function loadChangeHistory() {
  return loadData('changeHistory.json');
}

// 管理者ユーザーデータ読み込み
async function loadAdminUsers() {
  return loadData('admin_users.json');
}

// ユーザー詳細情報取得（ID指定）
async function loadUserWithDetails(userId) {
  const [users, subscriptions, payments, plans] = await Promise.all([
    loadUsers(),
    loadSubscriptions(), 
    loadPayments(),
    loadPlans()
  ]);

  const user = users?.find(u => u.id === userId);
  if (!user) return null;

  const userSubscriptions = subscriptions?.filter(s => s.userId === userId) || [];
  const userPayments = payments?.filter(p => p.userId === userId) || [];
  const userPlans = userSubscriptions.map(sub => plans?.find(p => p.id === sub.planId)).filter(Boolean);

  return {
    ...user,
    subscriptions: userSubscriptions,
    payments: userPayments,
    plans: userPlans,
    totalPayments: userPayments.filter(p => p.status === 'completed').length,
    activeSubscription: userSubscriptions.find(s => s.status === 'active')
  };
}

// ユーザー管理画面用のデータ取得
async function loadUsersForAdmin() {
  const users = await loadUsers();
  
  // users.jsonに既にsubscription、plan、lastPaymentが含まれているので、そのまま返す
  return users || [];
}

// コンテンツ管理画面用のデータ取得
async function loadContentsForAdmin() {
  const [contents, contentMedia, categories, contentViews] = await Promise.all([
    loadContents(),
    loadContentMedia(),
    loadCategories(),
    loadContentViews()
  ]);

  // 各コンテンツに関連情報を付加
  return contents?.map(content => {
    const media = contentMedia?.filter(m => m.contentId === content.id) || [];
    const category = categories?.find(c => c.id === content.categoryId);
    const views = contentViews?.filter(v => v.contentId === content.id) || [];

    // サムネイルURLの決定（優先順位: 既存のthumbnailUrl > メディアのthumbnail > 画像配列の最初の画像 > メディアの最初の画像）
    let thumbnailUrl = content.thumbnailUrl;
    if (!thumbnailUrl && content.images && content.images.length > 0) {
      thumbnailUrl = content.images[0].dataUrl;
    }
    if (!thumbnailUrl) {
      const thumbnailMedia = media.find(m => m.type === 'thumbnail');
      if (thumbnailMedia) {
        thumbnailUrl = thumbnailMedia.url;
      } else if (media.length > 0) {
        thumbnailUrl = media[0].url;
      }
    }

    return {
      ...content,
      media: media,
      category: category,
      // 既存のviewCountを保持し、content_viewsの数は参考情報として追加
      actualViewCount: views.length,
      thumbnailUrl: thumbnailUrl
    };
  }) || [];
}

// メール管理画面用のデータ取得
async function loadEmailLogsForAdmin() {
  const [emailLogs, users] = await Promise.all([
    loadEmailLogs(),
    loadUsers()
  ]);

  // 各メールログにユーザー情報を付加
  return emailLogs?.map(log => {
    const user = users?.find(u => u.id === log.userId);
    return {
      ...log,
      user: user
    };
  }) || [];
}

// システム設定管理画面用のデータ取得
async function loadSystemSettingsForAdmin() {
  const [systemSettings, notificationSettings, changeHistory] = await Promise.all([
    loadSystemSettings(),
    loadNotificationSettings(),
    loadChangeHistory()
  ]);

  return {
    systemSettings: systemSettings || {},
    notificationSettings: notificationSettings || {},
    changeHistory: changeHistory || []
  };
}

// データ統計情報の取得
async function loadStatistics() {
  const [users, subscriptions, payments, contents] = await Promise.all([
    loadUsers(),
    loadSubscriptions(),
    loadPayments(),
    loadContents()
  ]);

  const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
  const completedPayments = payments?.filter(p => p.status === 'completed') || [];
  const publishedContents = contents?.filter(c => c.status === 'published') || [];

  return {
    totalUsers: users?.length || 0,
    activeSubscriptions: activeSubscriptions.length,
    totalRevenue: completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
    publishedContents: publishedContents.length,
    totalContents: contents?.length || 0
  };
}

// すべてのデータを事前読み込み（パフォーマンス向上用）
async function preloadAllData() {
  const files = [
    'users.json',
    'subscriptions.json', 
    'payments.json',
    'plans.json',
    'contents.json',
    'content_media.json',
    'categories.json',
    'content_views.json',
    'email_logs.json',
    'system_settings.json',
    'notification_settings.json',
    'changeHistory.json',
    'admin_users.json'
  ];

  try {
    await Promise.all(files.map(file => loadData(file)));
    console.log('All data preloaded successfully');
  } catch (error) {
    console.error('Error preloading data:', error);
  }
}

// データローダー関数をグローバルに公開
window.dataLoader = {
  // 基本データ読み込み関数
  loadData,
  clearCache,
  clearCacheForFile,
  
  // 個別データ読み込み関数
  loadUsers,
  loadSubscriptions,
  loadPayments,
  loadPlans,
  loadContents,
  loadContentMedia,
  loadCategories,
  loadContentViews,
  loadEmailLogs,
  loadSystemSettings,
  loadNotificationSettings,
  loadChangeHistory,
  loadAdminUsers,
  
  // 詳細データ取得関数
  loadUserWithDetails,
  
  // 管理画面用データ取得関数
  loadUsersForAdmin,
  loadContentsForAdmin,
  loadEmailLogsForAdmin,
  loadSystemSettingsForAdmin,
  
  // 統計・その他
  loadStatistics,
  preloadAllData
};

// 初期化時にデータを事前読み込み（オプション）
// preloadAllData();