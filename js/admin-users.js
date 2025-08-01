// admin-users.js - ユーザー管理画面用JavaScript

// ページング状態管理
const userPagination = {
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
  allUsers: []
};

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', async () => {
  // データローダーのインスタンスを取得
  const loader = window.dataLoader;
  
  // ユーザーデータを読み込む
  await loadAndDisplayUsers();
  
  // イベントリスナーの設定
  setupEventListeners();
  
  // Lucideアイコンの初期化
  if (window.lucide) {
    lucide.createIcons();
  }
});

// ユーザーデータの読み込みと表示
async function loadAndDisplayUsers() {
  const loader = window.dataLoader;
  
  try {
    // ローディング表示
    showLoading();
    
    // データを読み込む
    const users = await loader.loadUsersForAdmin();
    
    // ページング用にデータを保存
    userPagination.allUsers = users;
    userPagination.totalItems = users.length;
    
    // ページング付きテーブルを表示
    displayUsersTableWithPaging();
    
    // 統計情報を更新
    updateStatistics(users);
    
  } catch (error) {
    console.error('Failed to load users:', error);
    showError('ユーザーデータの読み込みに失敗しました');
  } finally {
    hideLoading();
  }
}

// ページング付きユーザーテーブルの表示
function displayUsersTableWithPaging() {
  const startIndex = (userPagination.currentPage - 1) * userPagination.itemsPerPage;
  const endIndex = startIndex + userPagination.itemsPerPage;
  const paginatedUsers = userPagination.allUsers.slice(startIndex, endIndex);
  
  displayUsersTable(paginatedUsers);
  renderUserPaginationControls();
}

// ユーザーテーブルの表示
function displayUsersTable(users) {
  const tbody = document.querySelector('#users-table tbody');
  if (!tbody) return;
  
  // 既存の行をクリア
  tbody.innerHTML = '';
  
  // 各ユーザーの行を作成
  users.forEach(user => {
    const row = createUserRow(user);
    tbody.appendChild(row);
  });
  
  // アイコンを再初期化
  if (window.lucide) {
    lucide.createIcons();
  }
}

// ユーザー行の作成
function createUserRow(user) {
  const tr = document.createElement('tr');
  tr.className = 'hover:bg-gray-50';
  tr.dataset.userId = user.id;
  
  // 日付フォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };
  
  // プランの表示名とクラス
  const planDisplay = {
    standard: { name: 'スタンダード', class: 'bg-blue-100 text-blue-800' },
    gold: { name: 'ゴールド', class: 'bg-yellow-100 text-yellow-800' },
    platinum: { name: 'プラチナ', class: 'bg-purple-100 text-purple-800' }
  };
  
  // 統一ステータス判定ロジックを使用
  const statusDisplay = UserStatusUtils.getDisplayStatus(user);
  
  // 決済ステータス
  const paymentStatusDisplay = user.lastPayment?.status === 'completed'
    ? { name: '成功', class: 'bg-green-100 text-green-800' }
    : user.lastPayment?.status === 'failed'
    ? { name: '失敗', class: 'bg-red-100 text-red-800' }
    : { name: '-', class: '' };
  
  const plan = user.plan ? planDisplay[user.plan.name] || { name: '-', class: '' } : { name: '-', class: '' };
  
  tr.innerHTML = `
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="flex-shrink-0 h-10 w-10">
          <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <i data-lucide="user" class="w-5 h-5 text-gray-600"></i>
          </div>
        </div>
        <div class="ml-4">
          <div class="text-sm font-medium text-gray-900">${user.lastName && user.firstName ? `${user.lastName} ${user.firstName}` : (user.name || '名前未設定')}</div>
          <div class="text-sm text-gray-500">${user.email}</div>
        </div>
      </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      ${plan.name !== '-' 
        ? `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${plan.class}">${plan.name}</span>`
        : '<span class="text-gray-500">-</span>'
      }
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusDisplay.class}">
        ${statusDisplay.name}
      </span>
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      ${formatDate(user.createdAt)}
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      ${paymentStatusDisplay.name !== '-'
        ? `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusDisplay.class}">${paymentStatusDisplay.name}</span>`
        : '<span class="text-gray-500">-</span>'
      }
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      ${user.subscription?.status === 'withdrawal-pending' && user.subscription?.withdrawalEffectiveDate
        ? formatDate(user.subscription.withdrawalEffectiveDate)
        : '<span class="text-gray-400">-</span>'
      }
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <button class="text-gray-600 hover:text-gray-900" onclick="editUser('${user.id}')">
        <i data-lucide="edit" class="w-4 h-4"></i>
      </button>
    </td>
  `;
  
  return tr;
}

// 統計情報の更新
function updateStatistics(users) {
  // 総ユーザー数
  const totalUsers = users.length;
  
  // アクティブユーザー数
  const activeUsers = users.filter(u => u.subscription?.status === 'active').length;
  
  // プラン別ユーザー数
  const planCounts = {
    standard: 0,
    gold: 0,
    platinum: 0
  };
  
  users.forEach(user => {
    if (user.plan && user.subscription?.status === 'active') {
      planCounts[user.plan.name] = (planCounts[user.plan.name] || 0) + 1;
    }
  });
  
  // パーセンテージ計算
  const activeUsersTotal = activeUsers || 1; // ゼロ除算を防ぐ
  const percentages = {
    standard: Math.round((planCounts.standard / activeUsersTotal) * 100),
    gold: Math.round((planCounts.gold / activeUsersTotal) * 100),
    platinum: Math.round((planCounts.platinum / activeUsersTotal) * 100)
  };
  
  // 統計表示を更新（対応する要素がある場合）
  const statsElements = {
    totalUsers: document.querySelector('[data-stat="total-users"]'),
    activeUsers: document.querySelector('[data-stat="active-users"]'),
    standardUsers: document.querySelector('[data-stat="standard-users"]'),
    goldUsers: document.querySelector('[data-stat="gold-users"]'),
    platinumUsers: document.querySelector('[data-stat="platinum-users"]'),
    standardPercentage: document.querySelector('[data-stat="standard-percentage"]'),
    goldPercentage: document.querySelector('[data-stat="gold-percentage"]'),
    platinumPercentage: document.querySelector('[data-stat="platinum-percentage"]')
  };
  
  if (statsElements.totalUsers) statsElements.totalUsers.textContent = totalUsers;
  if (statsElements.activeUsers) statsElements.activeUsers.textContent = activeUsers;
  if (statsElements.standardUsers) statsElements.standardUsers.textContent = `${planCounts.standard}名`;
  if (statsElements.goldUsers) statsElements.goldUsers.textContent = `${planCounts.gold}名`;
  if (statsElements.platinumUsers) statsElements.platinumUsers.textContent = `${planCounts.platinum}名`;
  if (statsElements.standardPercentage) statsElements.standardPercentage.textContent = `${percentages.standard}%`;
  if (statsElements.goldPercentage) statsElements.goldPercentage.textContent = `${percentages.gold}%`;
  if (statsElements.platinumPercentage) statsElements.platinumPercentage.textContent = `${percentages.platinum}%`;
}

// イベントリスナーの設定
function setupEventListeners() {
  // 検索入力
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }
  
  // フィルター変更
  const filterSelects = document.querySelectorAll('select[data-filter]');
  filterSelects.forEach(select => {
    select.addEventListener('change', handleFilterChange);
  });
  
  // サイドバートグル
  window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
  };
  
  // 画面サイズ変更時の処理
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 1024) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebarOverlay');
      
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.add('hidden');
    }
  });
}

// 検索処理
async function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const loader = window.dataLoader;
  
  // データを再読み込み
  const users = await loader.loadUsersForAdmin();
  
  // フィルタリング
  const filteredUsers = users.filter(user => {
    const fullName = user.lastName && user.firstName ? `${user.lastName} ${user.firstName}` : (user.name || '');
    return fullName.toLowerCase().includes(searchTerm) ||
           user.email?.toLowerCase().includes(searchTerm);
  });
  
  // 表示更新
  displayUsersTable(filteredUsers);
}

// フィルター変更処理
async function handleFilterChange() {
  const loader = window.dataLoader;
  const users = await loader.loadUsersForAdmin();
  
  // 各フィルターの値を取得
  const statusFilter = document.querySelector('select[data-filter="status"]')?.value || 'all';
  const planFilter = document.querySelector('select[data-filter="plan"]')?.value || 'all';
  const paymentFilter = document.querySelector('select[data-filter="payment"]')?.value || 'all';
  
  // フィルタリング
  let filteredUsers = users;
  
  if (statusFilter !== 'all') {
    filteredUsers = filteredUsers.filter(user => {
      const userStatusKey = UserStatusUtils.getStatusForFilter(user);
      return userStatusKey === statusFilter;
    });
  }
  
  if (planFilter !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.plan?.name === planFilter);
  }
  
  if (paymentFilter !== 'all') {
    filteredUsers = filteredUsers.filter(user => {
      if (paymentFilter === 'success') return user.lastPayment?.status === 'completed';
      if (paymentFilter === 'failed') return user.lastPayment?.status === 'failed';
      return !user.lastPayment;
    });
  }
  
  // 表示更新
  displayUsersTable(filteredUsers);
}


// ユーザー編集
function editUser(userId) {
  console.log('Edit user:', userId);
  // TODO: 編集フォームの表示
  alert(`ユーザー編集機能は実装予定です (ID: ${userId})`);
}

// ユーティリティ関数

// ローディング表示
function showLoading() {
  const tbody = document.querySelector('#users-table tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-4 text-center text-gray-500">
          <div class="flex justify-center items-center">
            <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            データを読み込んでいます...
          </div>
        </td>
      </tr>
    `;
  }
}

// ローディング非表示
function hideLoading() {
  // 特に処理なし（テーブルが更新されるため）
}

// エラー表示
function showError(message) {
  const tbody = document.querySelector('#users-table tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-4 text-center text-red-600">
          <div class="flex justify-center items-center">
            <i data-lucide="alert-circle" class="w-5 h-5 mr-2"></i>
            ${message}
          </div>
        </td>
      </tr>
    `;
    if (window.lucide) {
      lucide.createIcons();
    }
  }
}

// デバウンス関数
function debounce(func, wait) {
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

// ユーザーページング制御の描画
function renderUserPaginationControls() {
  const totalPages = Math.ceil(userPagination.totalItems / userPagination.itemsPerPage);
  const currentPage = userPagination.currentPage;
  
  // ページング要素を取得または作成
  let paginationContainer = document.getElementById('userPagination');
  if (!paginationContainer) {
    // ページング要素が存在しない場合は作成
    const tableContainer = document.querySelector('#users-table').closest('.overflow-x-auto').parentElement;
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'userPagination';
    paginationContainer.className = 'flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200';
    paginationContainer.innerHTML = `
      <div class="flex items-center text-sm text-gray-700">
        <span id="userPaginationInfo">1-10 of ${userPagination.totalItems} results</span>
      </div>
      <div class="flex items-center space-x-2">
        <button id="userPrevPageBtn" class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
          <i data-lucide="chevron-left" class="w-4 h-4"></i>
        </button>
        <div id="userPageNumbers" class="flex items-center space-x-1">
          <!-- ページ番号がここに動的に挿入されます -->
        </div>
        <button id="userNextPageBtn" class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
      </div>
    `;
    tableContainer.appendChild(paginationContainer);
    
    // イベントリスナーを追加
    document.getElementById('userPrevPageBtn').addEventListener('click', goToUserPrevPage);
    document.getElementById('userNextPageBtn').addEventListener('click', goToUserNextPage);
  }
  
  // 情報表示の更新
  const startItem = (currentPage - 1) * userPagination.itemsPerPage + 1;
  const endItem = Math.min(currentPage * userPagination.itemsPerPage, userPagination.totalItems);
  document.getElementById('userPaginationInfo').textContent = 
    `${startItem}-${endItem} of ${userPagination.totalItems} results`;
  
  // 前へボタンの状態
  const prevBtn = document.getElementById('userPrevPageBtn');
  prevBtn.disabled = currentPage === 1;
  
  // 次へボタンの状態
  const nextBtn = document.getElementById('userNextPageBtn');
  nextBtn.disabled = currentPage === totalPages;
  
  // ページ番号ボタンの生成
  const pageNumbers = document.getElementById('userPageNumbers');
  pageNumbers.innerHTML = '';
  
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `px-3 py-1 text-sm rounded-md ${
      i === currentPage 
        ? 'bg-primary-600 text-white' 
        : 'text-gray-700 hover:bg-gray-100'
    }`;
    pageBtn.textContent = i;
    pageBtn.onclick = () => goToUserPage(i);
    pageNumbers.appendChild(pageBtn);
  }
  
  // Lucideアイコンを再初期化
  if (window.lucide) {
    lucide.createIcons();
  }
}

// ユーザーページ移動
function goToUserPage(page) {
  const totalPages = Math.ceil(userPagination.totalItems / userPagination.itemsPerPage);
  if (page >= 1 && page <= totalPages) {
    userPagination.currentPage = page;
    displayUsersTableWithPaging();
  }
}

// 前のページ
function goToUserPrevPage() {
  if (userPagination.currentPage > 1) {
    goToUserPage(userPagination.currentPage - 1);
  }
}

// 次のページ  
function goToUserNextPage() {
  const totalPages = Math.ceil(userPagination.totalItems / userPagination.itemsPerPage);
  if (userPagination.currentPage < totalPages) {
    goToUserPage(userPagination.currentPage + 1);
  }
}

// 検索クリア機能
function clearSearch() {
  const searchInput = document.getElementById("searchInput");
  searchInput.value = "";
  searchInput.focus();
  handleSearch({ target: searchInput }); // 検索を再実行
}