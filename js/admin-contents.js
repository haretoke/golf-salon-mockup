// admin-contents.js - コンテンツ管理画面用JavaScript

// グローバル変数
let currentTab = "video";











// ユーティリティ関数

// ローディング表示
function showLoading() {
  const containers = [
    document.querySelector("#videoGrid"),
    document.querySelector("#imageGrid"),
    document.querySelector("#tweetGrid"),
  ];

  containers.forEach((container) => {
    if (container) {
      container.innerHTML = `
        <div class="col-span-full flex justify-center items-center py-8">
          <div class="flex items-center gap-2 text-gray-500">
            <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            データを読み込んでいます...
          </div>
        </div>
      `;
    }
  });
}

// ローディング非表示
function hideLoading() {
  // 特に処理なし（コンテンツが更新されるため）
}

// エラー表示
function showError(message) {
  const containers = [
    document.querySelector("#videoGrid"),
    document.querySelector("#imageGrid"),
    document.querySelector("#tweetGrid"),
  ];

  containers.forEach((container) => {
    if (container) {
      container.innerHTML = `
        <div class="col-span-full flex justify-center items-center py-8">
          <div class="flex items-center gap-2 text-red-600">
            <i data-lucide="alert-circle" class="w-5 h-5"></i>
            ${message}
          </div>
        </div>
      `;
      if (window.lucide) {
        lucide.createIcons();
      }
    }
  });
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

// モバイル対応
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (sidebar) {
    sidebar.classList.toggle("-translate-x-full");
  }
  if (overlay) {
    overlay.classList.toggle("hidden");
  }
}

// コンテンツタブ切り替え機能
let currentSlideIndex = 0;
const contentTypes = ["tweet", "image", "video"];

// ページング状態管理
const paginationState = {
  tweet: { currentPage: 1, totalPages: 3 },
  image: { currentPage: 1, totalPages: 2 },
  video: { currentPage: 1, totalPages: 4 },
};

document.querySelectorAll(".content-tab").forEach((tab, index) => {
  tab.addEventListener("click", function () {
    switchToTab(index);
  });
});

function switchToTab(index) {
  currentSlideIndex = index;
  updateActiveTab();
  updateSliderPosition();

  // スワイプ状態を完全にリセット
  resetTouchState();

  // タッチハンドリングとクリックハンドリングを再初期化
  setTimeout(() => {
    initializeTouchHandling();
    setupCardClickHandlers();
  }, 100);
}

function updateActiveTab() {
  document.querySelectorAll(".content-tab").forEach((tab, index) => {
    tab.classList.toggle("active", index === currentSlideIndex);
  });

  document.querySelectorAll(".content-section").forEach((section, index) => {
    section.classList.toggle("active", index === currentSlideIndex);
  });

  // ページネーション表示更新
  updatePaginationVisibility();
}

function updatePaginationVisibility() {
  document.querySelectorAll(".pagination").forEach((pagination) => {
    pagination.style.display = "none";
  });

  const currentType = contentTypes[currentSlideIndex];
  const currentPagination = document.getElementById(`${currentType}Pagination`);
  if (currentPagination) {
    currentPagination.style.display = "flex";
  }
}

function updateSliderPosition() {
  const translateX = -currentSlideIndex * 100;
  slider.style.transform = `translateX(${translateX}%)`;
}

// スワイプ機能（整理版）
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let isDragging = false;
let hasMoved = false;
let isHorizontalSwipe = false;
let swipeStartTime = 0;

const slider = document.getElementById("contentSlider");
const SWIPE_THRESHOLD = 50;
const MAX_SWIPE_TIME = 500;
const MIN_MOVEMENT = 15;

// モバイルデバイス判定
function isMobileDevice() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
}

// iOS Safari判定
function isIOSSafari() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// スワイプ状態をリセット
function resetTouchState() {
  isDragging = false;
  hasMoved = false;
  isHorizontalSwipe = false;
  startX = 0;
  startY = 0;
  currentX = 0;
  currentY = 0;
  swipeStartTime = 0;
}

// タッチイベントハンドラー
function handleTouchStart(e) {
  resetTouchState();

  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
  currentX = startX;
  currentY = startY;
  isDragging = true;
  swipeStartTime = Date.now();
}

function handleTouchMove(e) {
  if (!isDragging) return;

  const touch = e.touches[0];
  currentX = touch.clientX;
  currentY = touch.clientY;

  const deltaX = Math.abs(startX - currentX);
  const deltaY = Math.abs(startY - currentY);

  // 方向判定
  if (!hasMoved && (deltaX > MIN_MOVEMENT || deltaY > MIN_MOVEMENT)) {
    isHorizontalSwipe = deltaX > deltaY;
    hasMoved = true;
  }

  // 水平スワイプの場合のみpreventDefault
  if (isHorizontalSwipe && deltaX > MIN_MOVEMENT) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function handleTouchEnd(e) {
  if (!isDragging) return;

  const touchDuration = Date.now() - swipeStartTime;
  const deltaX = startX - currentX;

  // 水平スワイプでない場合はクリック動作を許可
  if (!isHorizontalSwipe) {
    resetTouchState();
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  // スワイプ判定と実行
  if (hasMoved && isHorizontalSwipe && touchDuration < MAX_SWIPE_TIME) {
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      // スワイプが実行された場合、短時間クリックを無効化
      clickDisabledUntil = Date.now() + 300; // 300ms間クリック無効

      if (deltaX > 0 && currentSlideIndex < contentTypes.length - 1) {
        switchToTab(currentSlideIndex + 1);
      } else if (deltaX < 0 && currentSlideIndex > 0) {
        switchToTab(currentSlideIndex - 1);
      }
    }
  }

  resetTouchState();
}

// タッチイベントリスナーの初期化
function initializeTouchHandling() {
  if (!slider) {
    console.warn("contentSlider element not found, cannot initialize touch handling");
    return;
  }

  // 既存のイベントリスナーを削除
  slider.removeEventListener("touchstart", handleTouchStart);
  slider.removeEventListener("touchmove", handleTouchMove);
  slider.removeEventListener("touchend", handleTouchEnd);
  slider.removeEventListener("touchcancel", handleTouchEnd);

  const eventOptions = { passive: false, capture: true };

  // スライダーにイベントリスナーを追加
  slider.addEventListener("touchstart", handleTouchStart, eventOptions);
  slider.addEventListener("touchmove", handleTouchMove, eventOptions);
  slider.addEventListener("touchend", handleTouchEnd, eventOptions);
  slider.addEventListener("touchcancel", handleTouchEnd, eventOptions);

  // iOS Safari用：各セクションに直接追加
  if (isIOSSafari()) {
    const sections = document.querySelectorAll(".content-section");
    sections.forEach((section) => {
      section.removeEventListener("touchstart", handleTouchStart);
      section.removeEventListener("touchmove", handleTouchMove);
      section.removeEventListener("touchend", handleTouchEnd);
      section.removeEventListener("touchcancel", handleTouchEnd);

      section.addEventListener("touchstart", handleTouchStart, eventOptions);
      section.addEventListener("touchmove", handleTouchMove, eventOptions);
      section.addEventListener("touchend", handleTouchEnd, eventOptions);
      section.addEventListener("touchcancel", handleTouchEnd, eventOptions);
    });
  }
}

// 初期化は管理画面が完全に読み込まれてから実行

// マウスイベント（デスクトップ対応）
if (!isMobileDevice()) {
  slider.addEventListener("mousedown", handleMouseStart);
  slider.addEventListener("mousemove", handleMouseMove);
  slider.addEventListener("mouseup", handleMouseEnd);
  slider.addEventListener("mouseleave", handleMouseEnd);
}

function handleMouseStart(e) {
  startX = e.clientX;
  isDragging = true;
  hasMoved = false;
  slider.style.cursor = "grabbing";
  
  // ドラッグ開始時点でクリックを一時的に無効化
  preventNextClick = true;
  setTimeout(() => {
    if (!hasMoved) {
      preventNextClick = false; // 実際にドラッグしなかった場合はクリックを許可
    }
  }, 50);
  
  e.preventDefault();
}

function handleMouseMove(e) {
  if (!isDragging) return;
  currentX = e.clientX;
  const deltaX = Math.abs(startX - currentX);

  if (deltaX > 5) {
    hasMoved = true;
  }
}

function handleMouseEnd(e) {
  if (!isDragging) return;
  isDragging = false;
  slider.style.cursor = "grab";

  if (hasMoved) {
    const deltaX = startX - currentX;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      // スワイプが実行された場合、短時間クリックを無効化
      clickDisabledUntil = Date.now() + 300; // 300ms間クリック無効
      preventNextClick = true; // 次のクリックを確実に無効化
      
      if (deltaX > 0 && currentSlideIndex < contentTypes.length - 1) {
        switchToTab(currentSlideIndex + 1);
      } else if (deltaX < 0 && currentSlideIndex > 0) {
        switchToTab(currentSlideIndex - 1);
      }
    } else if (hasMoved) {
      // ドラッグの意図があったが閾値に届かなかった場合も短時間クリックを無効化
      clickDisabledUntil = Date.now() + 150; // 150ms間クリック無効
      preventNextClick = true;
    }
  }

  hasMoved = false;
}

// フィルター機能（現在のタブ内のみ）
document
  .getElementById("categoryFilter")
  .addEventListener("change", filterCurrentTabContent);
document
  .getElementById("statusFilter")
  .addEventListener("change", filterCurrentTabContent);

function filterCurrentTabContent() {
  const category = document.getElementById("categoryFilter").value;
  const status = document.getElementById("statusFilter").value;
  const currentSection = document.querySelector(".content-section.active");

  currentSection.querySelectorAll(".content-card").forEach((card) => {
    const cardCategory = card.dataset.category;
    const cardStatus = card.dataset.status;

    const categoryMatch = !category || cardCategory === category;
    const statusMatch = !status || cardStatus === status;

    card.style.display = categoryMatch && statusMatch ? "flex" : "none";
  });
}

// ページング機能
function changePage(type, direction) {
  const state = paginationState[type];
  let newPage = state.currentPage + direction;

  if (newPage < 1) newPage = 1;
  if (newPage > state.totalPages) newPage = state.totalPages;

  goToPage(type, newPage);
}

function goToPage(type, page) {
  const state = paginationState[type];
  if (page < 1 || page > state.totalPages) return;

  state.currentPage = page;
  updatePaginationButtons(type);
  loadPageContent(type, page);
}

function updatePaginationButtons(type) {
  const pagination = document.getElementById(`${type}Pagination`);
  const state = paginationState[type];

  // 前へボタンの状態更新
  const prevBtn = pagination.querySelector(".page-btn:first-child");
  prevBtn.disabled = state.currentPage === 1;

  // 次へボタンの状態更新
  const nextBtn = pagination.querySelector(".page-btn:last-child");
  nextBtn.disabled = state.currentPage === state.totalPages;

  // ページ番号ボタンの状態更新
  pagination.querySelectorAll(".page-btn").forEach((btn) => {
    if (btn.textContent && !isNaN(btn.textContent)) {
      const pageNum = parseInt(btn.textContent);
      btn.classList.toggle("active", pageNum === state.currentPage);
    }
  });
}

function loadPageContent(type, page) {
  // 実際の実装では、ここでサーバーから該当ページのデータを取得
  console.log(`Loading ${type} content for page ${page}`);

  // サンプル実装：現在表示中のコンテンツはそのまま
  // 実際にはAJAXでデータを取得してコンテンツを更新
}

// 初期化時にページネーションを設定
function initializePagination() {
  Object.keys(paginationState).forEach((type) => {
    updatePaginationButtons(type);
  });
  updatePaginationVisibility();
}

// カード全体のクリックハンドラー設定（リスト表示専用）
function setupCardClickHandlers() {
  // イベント委譲を使用してクリックイベントを処理
  const contentSlider = document.getElementById("contentSlider");

  // 既存のクリックハンドラーを削除
  contentSlider.removeEventListener("click", handleCardClickDelegate);

  // 新しいクリックハンドラーを追加
  contentSlider.addEventListener("click", handleCardClickDelegate);
}

// スワイプ完了後の短時間クリック無効化用
let clickDisabledUntil = 0;
let preventNextClick = false;

// イベント委譲によるカードクリック処理を改善
function handleCardClickDelegate(event) {
  const now = Date.now();

  // スワイプ中またはスワイプ完了直後の場合はクリックを無効化
  if (hasMoved || isDragging || now < clickDisabledUntil) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  // .content-cardの要素を探す
  const card = event.target.closest(".content-card");
  if (card && card.dataset.cardId) {
    // 少し遅延を入れて確実にクリック処理を行う
    setTimeout(() => {
      if (!hasMoved && !isDragging && Date.now() >= clickDisabledUntil) {
        editContent(card.dataset.cardId);
      }
    }, 10);
  }
}

// HTMLから呼び出される初期化関数（JS側の処理のみ）
function initializeAdminJS() {
  // グローバル変数をwindowオブジェクトに設定（HTMLから参照するため）
  window.hasMoved = hasMoved;
  window.isDragging = isDragging;
  window.clickDisabledUntil = clickDisabledUntil;
  window.preventNextClick = preventNextClick;
  
  // 変数の更新を追跡するための仕組み
  const originalHasMoved = hasMoved;
  Object.defineProperty(window, 'hasMoved', {
    get: () => hasMoved,
    set: (value) => { hasMoved = value; }
  });
  
  Object.defineProperty(window, 'isDragging', {
    get: () => isDragging,
    set: (value) => { isDragging = value; }
  });
  
  Object.defineProperty(window, 'clickDisabledUntil', {
    get: () => clickDisabledUntil,
    set: (value) => { clickDisabledUntil = value; }
  });
  
  Object.defineProperty(window, 'preventNextClick', {
    get: () => preventNextClick,
    set: (value) => { preventNextClick = value; }
  });

  // カードクリックハンドラーを設定
  setupCardClickHandlers();

  // タッチハンドリングを初期化
  initializeTouchHandling();

  // Lucideアイコンを初期化
  lucide.createIcons();
}

// 検索機能（現在のタブ内のみ）
function filterContents() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const currentSection = document.querySelector(".content-section.active");

  currentSection.querySelectorAll(".content-card").forEach((card) => {
    const title =
      card.querySelector(".content-title")?.textContent.toLowerCase() || "";
    const description =
      card
        .querySelector(".content-description, .tweet-text")
        ?.textContent.toLowerCase() || "";

    card.style.display =
      title.includes(searchTerm) || description.includes(searchTerm)
        ? "flex"
        : "none";
  });
}

// 検索入力イベントリスナー
document
  .getElementById("searchInput")
  .addEventListener("input", filterContents);

// グローバルスコープに公開（HTMLから呼び出し可能にする）
window.filterContents = filterContents;

// コンテンツ管理機能
let currentEditingId = null;
let isEditMode = false;
let selectedVideoFile = null; // 選択された動画ファイルを保持

// 新規作成アクションシート制御
function showCreateActionSheet() {
  const actionSheet = document.getElementById("createActionSheet");
  actionSheet.style.display = "flex";

  // 次のフレームでアニメーションを開始
  requestAnimationFrame(() => {
    actionSheet.classList.add("show");
  });

  // Lucideアイコンを初期化
  setTimeout(() => lucide.createIcons(), 100);
}

function hideCreateActionSheet() {
  const actionSheet = document.getElementById("createActionSheet");
  actionSheet.classList.remove("show");

  // アニメーション完了後に非表示
  setTimeout(() => {
    if (!actionSheet.classList.contains("show")) {
      actionSheet.style.display = "none";
    }
  }, 400);
}

function createContent(type) {
  if (type === "video") {
    // 動画の場合はアクションシートを開いたままファイル選択ダイアログを開く
    openVideoFileDialog();
  } else {
    // 動画以外の場合は従来通り
    hideCreateActionSheet();
    setTimeout(() => {
      openEditScreenForType(type);
    }, 200);
  }
}

function openVideoFileDialog() {
  // 動画ファイル選択用の input を作成
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "video/*";
  input.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      // ファイル選択完了後にアクションシートを閉じる
      hideCreateActionSheet();

      // 動画ファイルから最初のフレームを抽出してサムネイルに設定
      extractVideoThumbnail(file, function (thumbnailDataUrl) {
        // サムネイル設定後に編集画面を開く
        openEditScreenForType("video", file, thumbnailDataUrl);
      });
    } else {
      // ファイル選択がキャンセルされた場合もアクションシートを閉じる
      hideCreateActionSheet();
    }
  });

  // ファイル選択ダイアログがキャンセルされた場合の処理
  input.addEventListener("cancel", function () {
    hideCreateActionSheet();
  });

  input.click();
}

function extractVideoThumbnail(videoFile, callback) {
  const video = document.createElement("video");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  video.addEventListener("loadedmetadata", function () {
    // キャンバスサイズを16:9に設定
    canvas.width = 320;
    canvas.height = 180;

    // 最初のフレームを取得
    video.currentTime = 0.1; // 0.1秒の位置のフレーム
  });

  video.addEventListener("seeked", function () {
    // キャンバスに動画フレームを描画
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // データURLとして取得
    const thumbnailDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    callback(thumbnailDataUrl);

    // メモリ解放
    video.src = "";
    video.load();
  });

  // 動画ファイルを読み込み
  const videoUrl = URL.createObjectURL(videoFile);
  video.src = videoUrl;
  video.load();
}


// 共通: 文字数カウント更新関数
function updateCharacterCount(text) {
  const characterCount = document.getElementById("characterCount");
  if (characterCount) {
    const count = text.length;
    characterCount.textContent = count;

    // 文字数による色分け（親要素のcharacter-countクラスを制御）
    const characterCountContainer = characterCount.parentElement;
    characterCountContainer.className = "character-count";
    if (count > 450) {
      characterCountContainer.classList.add("warning");
    }
    if (count > 500) {
      characterCountContainer.classList.add("error");
    }
  }
}

// 共通: ステータステキスト変換関数
function getStatusText(status) {
  const statusMap = {
    published: "公開中",
    draft: "下書き",
    scheduled: "予約投稿",
  };
  return statusMap[status] || "下書き";
}

// 共通: DOM要素安全取得・設定関数
function setElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

function setElementValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.value = value;
  }
}

// 共通: タイプ別設定値リセット関数
function resetSettingsForType(type) {
  const settings = {
    tweet: {
      category: "tweetCategoryValue",
      publish: "tweetPublishValue",
      defaults: { category: "スイング", publish: "下書き" },
    },
    image: {
      category: "categoryValue-image",
      description: "descriptionValue-image",
      publish: "publishValue-image",
      defaults: {
        category: "スイング",
        description: "説明を追加...",
        publish: "下書き",
      },
    },
    video: {
      category: "categoryValue-video",
      description: "descriptionValue-video",
      publish: "publishValue-video",
      defaults: {
        category: "スイング",
        description: "説明を追加...",
        publish: "下書き",
      },
    },
  };

  const typeSettings = settings[type];
  if (typeSettings) {
    Object.keys(typeSettings.defaults).forEach((key) => {
      const elementId = typeSettings[key];
      setElementText(elementId, typeSettings.defaults[key]);
    });
  }

  // フォーム要素も初期値にリセット
  const contentCategory = document.getElementById("contentCategory");
  const publishStatus = document.getElementById("publishStatus");
  const scheduleDate = document.getElementById("scheduleDate");
  
  if (contentCategory) {
    contentCategory.value = "";
  }
  if (publishStatus) {
    publishStatus.value = "draft";
  }
  if (scheduleDate) {
    scheduleDate.value = "";
  }
}

function openEditScreenForType(
  type,
  videoFile = null,
  thumbnailDataUrl = null
) {
  currentEditingId = null;
  isEditMode = false;

  // コンテンツタイプを設定
  setElementValue("contentType", type);

  // タイトルを設定
  const titleMap = {
    tweet: "新規つぶやき作成",
    image: "新規画像作成",
    video: "新規動画作成",
  };
  setElementText("editTitle", titleMap[type]);

  // フォーム全体をリセット
  const contentForm = document.getElementById("contentForm");
  if (contentForm) {
    contentForm.reset();
  }
  
  // 削除セクションを非表示
  document.getElementById("deleteSection").style.display = "none";

  // 全タイプ共通のリセット処理
  resetAllEditSections();

  // タイプ別の初期化
  if (type === "tweet") {
    initializeTweetEditor();
  } else if (type === "image") {
    initializeImageEditor();
  } else if (type === "video") {
    initializeVideoEditor(videoFile, thumbnailDataUrl);
  }

  // 設定値をリセット
  resetSettingsForType(type);

  showEditScreen();
  handleTypeChange();

  // 初期状態では保存ボタンを無効化
  resetChangeState();
}

// 全編集セクションをリセット
function resetAllEditSections() {
  // つぶやきエディターのリセット
  const tweetEditor = document.getElementById("tweetEditor");
  if (tweetEditor) {
    tweetEditor.textContent = "";
    tweetEditor.innerHTML = "";
  }
  
  // 文字数カウンターのリセット
  const characterCount = document.getElementById("characterCount");
  if (characterCount) {
    updateCharacterCount("");
  }

  // 画像関連のリセット
  const inlineTitle = document.getElementById("inlineTitle-image");
  if (inlineTitle) {
    inlineTitle.textContent = "";
  }
  
  // 画像データをリセット
  selectedImages = [];
  updateImageGrid();

  // 動画関連のリセット
  const videoInlineTitle = document.getElementById("inlineTitle-video");
  if (videoInlineTitle) {
    videoInlineTitle.textContent = "";
  }
  
  // 動画ファイルをリセット
  selectedVideoFile = null;
  resetThumbnailToPlaceholder();

  // 従来のフォーム要素もクリア
  const traditionalInputs = [
    "contentTitle",
    "contentDescription", 
    "contentCategory",
    "publishStatus",
    "scheduleDate"
  ];
  
  traditionalInputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.value = "";
    }
  });
}

// つぶやきエディターの初期化
function initializeTweetEditor() {
  const tweetEditor = document.getElementById("tweetEditor");
  const characterCount = document.getElementById("characterCount");
  
  if (tweetEditor) {
    tweetEditor.textContent = "";
    tweetEditor.innerHTML = "";
  }
  
  if (characterCount) {
    updateCharacterCount("");
  }
  
  setupTweetEditor();
}

// 画像エディターの初期化
function initializeImageEditor() {
  const inlineTitle = document.getElementById("inlineTitle-image");
  
  // 画像データをリセット
  selectedImages = [];
  updateImageGrid();

  if (inlineTitle) {
    inlineTitle.textContent = "";
  }

  // インライン編集機能を設定
  setupInlineTitleEdit();

  // 初期状態では保存ボタンを無効化
  resetChangeState();
}

// 動画エディターの初期化
function initializeVideoEditor(videoFile = null, thumbnailDataUrl = null) {
  const videoInlineTitle = document.getElementById("inlineTitle-video");
  if (videoInlineTitle) {
    videoInlineTitle.textContent = "";
  }

  if (thumbnailDataUrl) {
    // 抽出されたサムネイルを設定
    setVideoThumbnail(thumbnailDataUrl);
  } else {
    resetThumbnailToPlaceholder();
  }

  if (videoFile) {
    // ファイル情報を保存
    selectedVideoFile = videoFile;
  } else {
    selectedVideoFile = null;
  }
  
  setupVideoInlineTitleEdit();
}

function setVideoThumbnail(dataUrl) {
  const thumbnailContainer = document.getElementById("videoThumbnailContainer");
  const placeholder = document.getElementById("thumbnailPlaceholder");

  // プレースホルダーを非表示
  if (placeholder) {
    placeholder.style.display = "none";
  }

  // 既存の画像があれば削除
  const existingImg = thumbnailContainer.querySelector("img");
  if (existingImg) {
    existingImg.remove();
  }

  // 新しいサムネイル画像を追加
  const img = document.createElement("img");
  img.src = dataUrl;
  img.alt = "Video thumbnail";
  thumbnailContainer.insertBefore(img, thumbnailContainer.firstChild);
}

// オーバーレイクリックで閉じる
document
  .getElementById("createActionSheet")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      hideCreateActionSheet();
    }
  });


function resetThumbnailToPlaceholder() {
  const thumbnailContainer = document.getElementById("videoThumbnailContainer");
  const placeholder = document.getElementById("thumbnailPlaceholder");
  const existingImg = thumbnailContainer.querySelector("img");

  // 既存の画像があれば削除
  if (existingImg) {
    existingImg.remove();
  }

  // プレースホルダーを表示
  if (placeholder) {
    placeholder.style.display = "flex";
  }
}

async function editContent(id) {
  currentEditingId = id;
  isEditMode = true;
  document.getElementById("editTitle").textContent = "コンテンツ編集";
  document.getElementById("deleteSection").style.display = "flex";
  showEditScreen();
  // データローダーを使用してコンテンツデータを読み込む
  await loadContentData(id);
}

function showEditScreen() {
  const editScreen = document.getElementById("editScreen");
  editScreen.classList.add("show");
  // サイドバーを隠す（モバイル表示の場合）
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) {
    sidebar.classList.add("-translate-x-full");
  }
  if (overlay) {
    overlay.classList.add("hidden");
  }
}

function hideEditScreen() {
  const editScreen = document.getElementById("editScreen");
  editScreen.classList.remove("show");
  currentEditingId = null;
  isEditMode = false;

  // 画像データをリセット
  selectedImages = [];

  // 変更フラグをリセット
  resetChangeState();
}

async function loadContentData(id) {
  // HTMLで生成されたsampleDataを使用
  const data = window.sampleData ? window.sampleData[id] : null;
  
  if (data) {
    // HTMLからdata-images属性を取得
    const cardElement = document.querySelector(`[data-card-id="${id}"]`);
    if (cardElement && cardElement.getAttribute("data-images")) {
      try {
        data.images = JSON.parse(cardElement.getAttribute("data-images"));
      } catch (e) {
        data.images = [];
      }
    }

    document.getElementById("contentType").value = data.type;
    document.getElementById("contentCategory").value = data.category || "";
    document.getElementById("contentTitle").value = data.title || "";
    document.getElementById("contentDescription").value = data.description || "";
    document.getElementById("publishStatus").value = data.status || "draft";
    

    // 予約投稿の場合は公開日時も設定
    if (data.status === "scheduled" && data.scheduleDate) {
      document.getElementById("scheduleDate").value = data.scheduleDate;
    }

    // タイトルをタイプに応じて変更
    updateEditTitle(data.type);

    // タイプ別の設定値を適用
    if (data.type === "tweet") {
      setElementText("tweetCategoryValue", data.category);
      setElementText("tweetPublishValue", getStatusText(data.status));

      // つぶやき内容を設定
      const tweetEditor = document.getElementById("tweetEditor");
      if (tweetEditor) {
        tweetEditor.textContent = data.content;
        // 文字数カウントを更新
        updateCharacterCount(data.content);
      }
    } else if (data.type === "image") {
      const inlineTitle = document.getElementById("inlineTitle-image");
      if (inlineTitle) {
        inlineTitle.textContent = data.title || "";
      }
      setElementText("categoryValue-image", data.category);
      setElementText(
        "descriptionValue-image",
        data.description || "説明を追加..."
      );
      setElementText("publishValue-image", getStatusText(data.status));

      // 既存画像のサンプルデータ読み込み（同期実行）
      // data-images属性からサンプル画像を取得
      const imagesData = data.images || [];
      selectedImages = imagesData.map((img) => ({
        id: img.id,
        file: null,
        dataUrl: img.dataUrl,
        name: img.name,
      }));
      updateImageGrid();

      // インライン編集機能を設定
      setupInlineTitleEdit();
    } else if (data.type === "video") {
      // 動画編集インターフェースのセットアップ
      const videoInlineTitle = document.getElementById("inlineTitle-video");
      if (videoInlineTitle) {
        videoInlineTitle.textContent = data.title || "";
      }

      setElementText(
        "descriptionValue-video",
        data.description || "説明を追加..."
      );
      setElementText("categoryValue-video", data.category);

      let displayText = getStatusText(data.status);

      // 予約投稿で日時が設定されている場合は日時も表示
      if (data.status === "scheduled" && data.scheduleDate) {
        const scheduleDateTime = new Date(data.scheduleDate);
        const formattedDate = scheduleDateTime.toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        displayText = `予約投稿 (${formattedDate})`;
      }

      setElementText("publishValue-video", displayText);

      // 既存動画の場合はサンプル画像を表示
      const thumbnailContainer = document.getElementById(
        "videoThumbnailContainer"
      );
      const placeholder = document.getElementById("thumbnailPlaceholder");

      if (placeholder) {
        placeholder.style.display = "none";
      }

      // 既存の画像があれば削除
      const existingImg = thumbnailContainer.querySelector("img");
      if (existingImg) {
        existingImg.remove();
      }

      // サンプル画像を追加
      if (data.thumbnail) {
        const img = document.createElement("img");
        img.src = data.thumbnail;
        img.alt = "Video thumbnail";
        thumbnailContainer.insertBefore(img, thumbnailContainer.firstChild);
      }

      setupVideoInlineTitleEdit();
    }

    // データの準備が完了してからUIを表示
    handleTypeChange();
  } else {
    console.error("Content data not found for id:", id);
    alert("コンテンツデータが見つかりません");
  }
}

// 編集タイトル更新
function updateEditTitle(type) {
  const titleElement = document.getElementById("editTitle");
  switch (type) {
    case "tweet":
      titleElement.textContent = "つぶやきの編集";
      break;
    case "image":
      titleElement.textContent = "画像の編集";
      break;
    case "video":
      titleElement.textContent = "動画の編集";
      break;
    default:
      titleElement.textContent = "コンテンツ編集";
  }
}

// 削除モーダル表示
function showDeleteModal() {
  document.getElementById("deleteModal").style.display = "flex";
}

// 削除モーダル非表示
function hideDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
}

// 削除確認
function confirmDelete() {
  // 実際の実装では、サーバーから削除
  alert("コンテンツが削除されました");
  hideDeleteModal();
  hideEditScreen();
}

function handleTypeChange() {
  const contentTypeElement = document.getElementById("contentType");
  
  if (!contentTypeElement) {
    console.error("contentType element not found");
    return;
  }

  const type = contentTypeElement.value;

  // 全てのセクションを非表示にしてリセット
  const sections = [
    "editSection-tweet",
    "editSection-image",
    "editSection-video",
  ];

  const settingsLists = [
    "tweetSettingsList",
    "settingsList-image",
    "settingsList-video",
  ];

  // 現在のタイプ以外のセクションのみを非表示に
  sections.forEach((id) => {
    const element = document.getElementById(id);
    
    if (element) {
      const shouldShow =
        (type === "tweet" && id === "editSection-tweet") ||
        (type === "image" && id === "editSection-image") ||
        (type === "video" && id === "editSection-video");

  
      // インラインスタイルを強制的に設定
      if (shouldShow) {
        element.style.display = "block";
        element.style.visibility = "visible";
        element.classList.add("active");
      } else {
        element.style.display = "none";
        element.style.visibility = "hidden";
        element.classList.remove("active");
      }
    } else {
      console.error(`Section ${id} not found`);
    }
  });

  settingsLists.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      const shouldShow =
        (type === "tweet" && id === "tweetSettingsList") ||
        (type === "image" && id === "settingsList-image") ||
        (type === "video" && id === "settingsList-video");
      element.style.display = shouldShow ? "block" : "none";
    }
  });

  // 従来のフォームを非表示
  const traditionalForm = document.querySelector(".traditional-form");
  if (traditionalForm) traditionalForm.style.display = "none";

  // タイプ別の初期化処理
  if (type === "tweet") {
    setupTweetEditor();
    // 画像データをリセット
    selectedImages = [];
  } else if (type === "image") {
    // 画像タイプの場合は何もしない（データ読み込み後に処理）
  } else if (type === "video") {
    setupVideoInlineTitleEdit();
    // 画像データをリセット
    selectedImages = [];
  }
}

// 公開設定変更
document
  .getElementById("publishStatus")
  .addEventListener("change", function () {
    const scheduleGroup = document.getElementById("scheduleGroup");
    scheduleGroup.style.display = this.value === "scheduled" ? "block" : "none";
  });



// 保存機能
function saveContent() {
  if (!hasChanges) {
    return; // 変更がない場合は何もしない
  }

  const publishStatus = document.getElementById("publishStatus").value;
  let statusText = "";

  switch (publishStatus) {
    case "draft":
      statusText = "下書きとして";
      break;
    case "published":
      statusText = "公開済みとして";
      break;
    case "scheduled":
      statusText = "予約投稿として";
      break;
  }

  if (isEditMode) {
    alert(`コンテンツ（ID: ${currentEditingId}）が${statusText}更新されました`);
  } else {
    alert(`新しいコンテンツが${statusText}作成されました`);
  }

  // 保存後は変更フラグをリセット
  resetChangeState();
  hideEditScreen();
}

function logout() {
  if (confirm("ログアウトしますか？")) {
    window.location.href = "login.html";
  }
}

// 動画編集インターフェース機能
function changeThumbnail() {
  // サムネイル変更の実装
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,image/jpg,image/png,image/gif";
  input.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      // ファイルサイズチェック（2MB以下）
      if (file.size > 2 * 1024 * 1024) {
        alert("ファイルサイズは2MB以下にしてください。");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const thumbnailContainer = document.getElementById(
          "videoThumbnailContainer"
        );
        const placeholder = document.getElementById("thumbnailPlaceholder");

        // プレースホルダーを非表示にして画像を表示
        if (placeholder) {
          placeholder.style.display = "none";
        }

        // 既存の画像があれば削除
        const existingImg = thumbnailContainer.querySelector("img");
        if (existingImg) {
          existingImg.remove();
        }

        // 新しい画像を追加
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Video thumbnail";
        thumbnailContainer.insertBefore(img, thumbnailContainer.firstChild);

        lucide.createIcons();

        // 変更フラグを立てる
        markAsChanged();
      };
      reader.readAsDataURL(file);
    }
  });
  input.click();
}

let currentSettingsType = null;

function openSettingsDetail(type) {
  currentSettingsType = type;
  const settingsScreen = document.getElementById("settingsDetailScreen");
  const titleElement = document.getElementById("settingsDetailTitle");
  const contentElement = document.getElementById("settingsDetailContent");
  const currentContentType = document.getElementById("contentType").value;

  // タイトルを設定
  switch (type) {
    case "description":
      titleElement.textContent = "説明";
      contentElement.innerHTML = `
              <div class="settings-form-group">
                <label class="settings-form-label">説明</label>
                <textarea
                  id="videoDescription"
                  class="settings-form-textarea"
                  placeholder="内容を詳しく説明してください..."
                  rows="5"
                  oninput="updateDescriptionSetting(this.value)"
                >${
                  document.getElementById("contentDescription").value || ""
                }</textarea>
              </div>
            `;
      break;

    case "category":
      titleElement.textContent = "カテゴリ";
      const currentCategory =
        document.getElementById("contentCategory").value || "スイング";
      contentElement.innerHTML = `
              <div class="settings-form-group">
                <label class="settings-form-label">カテゴリを選択</label>
                <select id="videoCategory" class="settings-select" onchange="updateCategorySetting(this.value)">
                  <option value="スイング" ${
                    currentCategory === "スイング" ? "selected" : ""
                  }>スイング</option>
                  <option value="パッティング" ${
                    currentCategory === "パッティング" ? "selected" : ""
                  }>パッティング</option>
                  <option value="アプローチ" ${
                    currentCategory === "アプローチ" ? "selected" : ""
                  }>アプローチ</option>
                  <option value="コースマネジメント" ${
                    currentCategory === "コースマネジメント" ? "selected" : ""
                  }>コースマネジメント</option>
                  <option value="メンタル" ${
                    currentCategory === "メンタル" ? "selected" : ""
                  }>メンタル</option>
                  <option value="フィジカル" ${
                    currentCategory === "フィジカル" ? "selected" : ""
                  }>フィジカル</option>
                </select>
              </div>
            `;
      break;

    case "publish":
      titleElement.textContent = "公開設定";
      const currentStatus =
        document.getElementById("publishStatus").value || "draft";
      contentElement.innerHTML = `
              <div class="settings-form-group">
                <label class="settings-form-label">公開状態を選択</label>
                <div class="publish-options">
                  <div class="publish-option ${
                    currentStatus === "draft" ? "selected" : ""
                  }" onclick="selectPublishOption('draft')">
                    <div class="publish-option-title">下書き</div>
                    <div class="publish-option-desc">保存されますが、ユーザーには表示されません</div>
                  </div>
                  <div class="publish-option ${
                    currentStatus === "published" ? "selected" : ""
                  }" onclick="selectPublishOption('published')">
                    <div class="publish-option-title">公開</div>
                    <div class="publish-option-desc">すぐにユーザーに表示されます</div>
                  </div>
                  <div class="publish-option ${
                    currentStatus === "scheduled" ? "selected" : ""
                  }" onclick="selectPublishOption('scheduled')">
                    <div class="publish-option-title">予約投稿</div>
                    <div class="publish-option-desc">指定した日時に自動的に公開されます</div>
                  </div>
                </div>
              </div>
              <div class="settings-form-group" id="scheduleSettingGroup" style="${
                currentStatus === "scheduled"
                  ? "display: block;"
                  : "display: none;"
              }">
                <label class="settings-form-label">公開日時</label>
                <input type="datetime-local" id="scheduleDateTime" class="settings-form-input" value="${
                  document.getElementById("scheduleDate")?.value || ""
                }">
              </div>
            `;
      break;
  }

  // 画面を表示
  settingsScreen.classList.add("show");

  // Lucideアイコンを初期化
  setTimeout(() => lucide.createIcons(), 100);
}

function hideSettingsDetail() {
  const settingsScreen = document.getElementById("settingsDetailScreen");
  settingsScreen.classList.remove("show");
}

function updatePublishSetting(status) {
  // 現在のコンテンツタイプを取得
  const contentType = document.getElementById("contentType").value;

  // 公開設定を更新
  document.getElementById("publishStatus").value = status;
  const statusText = {
    draft: "下書き",
    published: "公開",
    scheduled: "予約投稿",
  };

  // タイプごとに適切な表示要素を更新
  let publishElement;
  if (contentType === "tweet") {
    publishElement = document.getElementById("tweetPublishValue");
  } else {
    publishElement = document.getElementById(`publishValue-${contentType}`);
  }

  if (publishElement) {
    let displayText = statusText[status];

    if (status === "scheduled") {
      const scheduleDate = document.getElementById("scheduleDateTime").value;
      let finalScheduleDate;

      if (scheduleDate) {
        document.getElementById("scheduleDate").value = scheduleDate;
        finalScheduleDate = scheduleDate;
      } else {
        // 公開日時が設定されていない場合、現在の日時を設定
        const now = new Date();
        // 現在時刻から1時間後を初期値とする
        now.setHours(now.getHours() + 1);
        // ユーザーのタイムゾーンに合わせてフォーマット
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const defaultDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        document.getElementById("scheduleDate").value = defaultDateTime;
        finalScheduleDate = defaultDateTime;
      }

      // 予約投稿の場合は日時も表示
      const scheduleDateTime = new Date(finalScheduleDate);
      const formattedDate = scheduleDateTime.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      displayText = `予約投稿 (${formattedDate})`;
    }

    publishElement.textContent = displayText;
  }
}

function updateDescriptionSetting(description) {
  const contentType = document.getElementById("contentType").value;

  document.getElementById("contentDescription").value = description;

  // つぶやきには説明がないため、画像と動画のみ対応
  if (contentType !== "tweet") {
    const descriptionElement = document.getElementById(
      `descriptionValue-${contentType}`
    );
    if (descriptionElement) {
      descriptionElement.textContent = description || "説明を追加...";
    }
  }

  markAsChanged();
}

function updateCategorySetting(category) {
  const contentType = document.getElementById("contentType").value;

  document.getElementById("contentCategory").value = category;

  // タイプごとに適切な表示要素を更新
  let categoryElement;
  if (contentType === "tweet") {
    categoryElement = document.getElementById("tweetCategoryValue");
  } else {
    categoryElement = document.getElementById(`categoryValue-${contentType}`);
  }

  if (categoryElement) {
    categoryElement.textContent = category;
  }
  markAsChanged();
}

// 変更追跡システム
let hasChanges = false;

function markAsChanged() {
  hasChanges = true;
  const saveButton = document.getElementById("saveButton");
  if (saveButton) {
    saveButton.disabled = false;
  }
}

function resetChangeState() {
  hasChanges = false;
  const saveButton = document.getElementById("saveButton");
  if (saveButton) {
    saveButton.disabled = true;
  }
}

function selectPublishOption(status) {
  // すべての選択を解除
  document.querySelectorAll(".publish-option").forEach((option) => {
    option.classList.remove("selected");
  });

  // 選択したオプションをアクティブに
  event.currentTarget.classList.add("selected");
  event.currentTarget.setAttribute("data-status", status);

  // 予約投稿の場合は日時入力を表示
  const scheduleGroup = document.getElementById("scheduleSettingGroup");
  if (scheduleGroup) {
    scheduleGroup.style.display = status === "scheduled" ? "block" : "none";
  }

  // 即座に設定を更新
  updatePublishSetting(status);

  // 変更フラグを立てる
  markAsChanged();
}



// つぶやきエディター設定
function setupTweetEditor() {
  const tweetEditor = document.getElementById("tweetEditor");
  const characterCount = document.getElementById("characterCount");

  if (tweetEditor) {
    // 変更追跡を追加
    tweetEditor.addEventListener("input", function () {
      markAsChanged();
    });

    // 文字数カウント機能
    tweetEditor.addEventListener("input", function () {
      const text = this.textContent || "";
      updateCharacterCount(text);
    });

    // 初期値設定
    const initialText = tweetEditor.textContent || "";
    updateCharacterCount(initialText);
  }
}

// 画像管理用変数
let selectedImages = [];
let maxImages = 5;

// 複数画像選択
function selectMultipleImages() {
  // 画像編集モードでない場合は何もしない
  const currentType = document.getElementById("contentType").value;
  if (currentType !== "image") {
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,image/jpg,image/png,image/gif";
  input.multiple = true;

  input.addEventListener("change", function (e) {
    const files = Array.from(e.target.files);
    const availableSlots = maxImages - selectedImages.length;

    if (availableSlots <= 0) {
      alert(`画像は最大${maxImages}枚まで選択できます。`);
      return;
    }

    // 追加可能な枚数に制限
    const filesToProcess = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      alert(
        `最大${maxImages}枚まで選択できます。${filesToProcess.length}枚を追加します。`
      );
    }

    filesToProcess.forEach((file) => {
      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        alert(`ファイル「${file.name}」のサイズが5MBを超えています。`);
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const imageData = {
          id: `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          file: file,
          dataUrl: e.target.result,
          name: file.name,
        };

        selectedImages.push(imageData);
        updateImageGrid();

        // 変更フラグを立てる
        markAsChanged();
      };
      reader.readAsDataURL(file);
    });
  });

  input.click();
}

// 画像グリッド更新
function updateImageGrid() {
  const placeholder = document.getElementById("imageUploadPlaceholder");
  const grid = document.getElementById("editImageGrid");
  const addButton = document.getElementById("editImageAddButton");

  // 必要な要素が存在しない場合は何もしない
  if (!placeholder || !grid || !addButton) {
    return;
  }

  if (selectedImages.length === 0) {
    // 画像がない場合：プレースホルダー表示
    placeholder.style.display = "block";
    grid.style.display = "none";
    addButton.style.display = "none";
  } else {
    // 画像がある場合：グリッド表示
    placeholder.style.display = "none";
    grid.style.display = "grid";

    // グリッドクラス更新（画像枚数で計算）
    const totalItems =
      selectedImages.length + (selectedImages.length < maxImages ? 1 : 0);
    grid.className = `image-grid count-${selectedImages.length + 1}`;

    // 画像アイテム生成
    const imageItems = selectedImages.map(
      (image, index) => `
            <div class="image-item" data-id="${image.id}" draggable="true">
              <img src="${image.dataUrl}" alt="${image.name.replace(
        /"/g,
        "&quot;"
      )}" />
              <div class="image-item-overlay w-full h-full">
                <button class="image-item-btn btn-preview" onclick="previewImage('${
                  image.id
                }')" title="プレビュー">
                  <i data-lucide="eye"></i>
                </button>
                <button class="image-item-btn btn-delete" onclick="removeImage('${
                  image.id
                }')" title="削除">
                  <i data-lucide="x"></i>
                </button>
              </div>
            </div>
          `
    );

    // 追加ボタンまたは最大枚数表示をグリッドの一部として追加
    if (selectedImages.length < maxImages) {
      imageItems.push(`
              <div class="image-item image-add-item" onclick="selectMultipleImages()">
                <div class="image-add-content">
                  <i data-lucide="plus"></i>
                  <span>追加</span>
                  <div class="image-count">${selectedImages.length}/${maxImages}</div>
                </div>
              </div>
            `);
    } else {
      // 最大枚数に達した場合の表示
      imageItems.push(`
              <div class="image-item image-full-item">
                <div class="image-full-content">
                  <i data-lucide="alert-circle"></i>
                  <span>最大枚数</span>
                  <div class="image-count">${selectedImages.length}/${maxImages}</div>
                  <div class="image-full-note">削除すると追加できます</div>
                </div>
              </div>
            `);
    }

    grid.innerHTML = imageItems.join("");

    // 外部の追加ボタンは非表示に
    addButton.style.display = "none";

    // ドラッグ&ドロップ機能を初期化
    initializeDragAndDrop();
  }

  // アイコンを再初期化
  lucide.createIcons();
}

// 画像プレビュー機能
let currentPreviewIndex = 0;

function previewImage(imageId) {
  const imageIndex = selectedImages.findIndex((img) => img.id === imageId);
  if (imageIndex === -1) return;

  currentPreviewIndex = imageIndex;
  showImagePreview();
}

function showImagePreview() {
  if (selectedImages.length === 0) return;

  const modal = document.getElementById("imagePreviewModal");
  const img = document.getElementById("previewImage");
  const counter = document.getElementById("previewCounter");
  const prevBtn = document.getElementById("prevImageBtn");
  const nextBtn = document.getElementById("nextImageBtn");

  // 現在の画像を表示
  const currentImage = selectedImages[currentPreviewIndex];
  img.src = currentImage.dataUrl;
  img.alt = currentImage.name;

  // カウンターを更新
  counter.textContent = `${currentPreviewIndex + 1} / ${selectedImages.length}`;

  // ナビゲーションボタンの状態を更新
  prevBtn.disabled = currentPreviewIndex === 0;
  nextBtn.disabled = currentPreviewIndex === selectedImages.length - 1;

  // モーダルを表示
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeImagePreview() {
  const modal = document.getElementById("imagePreviewModal");
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

function prevImage() {
  if (currentPreviewIndex > 0) {
    currentPreviewIndex--;
    showImagePreview();
  }
}

function nextImage() {
  if (currentPreviewIndex < selectedImages.length - 1) {
    currentPreviewIndex++;
    showImagePreview();
  }
}

// キーボードナビゲーション
document.addEventListener("keydown", function (e) {
  const modal = document.getElementById("imagePreviewModal");
  if (modal.style.display === "flex") {
    if (e.key === "ArrowLeft") {
      prevImage();
    } else if (e.key === "ArrowRight") {
      nextImage();
    } else if (e.key === "Escape") {
      closeImagePreview();
    }
  }
});

// 画像削除
function removeImage(imageId) {
  if (confirm("この画像を削除しますか？")) {
    selectedImages = selectedImages.filter((img) => img.id !== imageId);

    // プレビュー中の画像が削除された場合の処理
    if (selectedImages.length === 0) {
      closeImagePreview();
    } else if (currentPreviewIndex >= selectedImages.length) {
      currentPreviewIndex = selectedImages.length - 1;
    }

    updateImageGrid();

    // 変更フラグを立てる
    markAsChanged();
  }
}

// ドラッグ&ドロップ機能
function initializeDragAndDrop() {
  const items = document.querySelectorAll(".image-item");
  const grid = document.getElementById("editImageGrid");

  // 必要な要素が存在しない場合は何もしない
  if (!grid || items.length === 0) {
    return;
  }

  items.forEach((item) => {
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragover", handleDragOver);
    item.addEventListener("drop", handleDrop);
    item.addEventListener("dragend", handleDragEnd);
  });

  grid.addEventListener("dragover", handleGridDragOver);
  grid.addEventListener("dragleave", handleGridDragLeave);
}

let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.outerHTML);
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDrop(e) {
  e.preventDefault();
  if (this !== draggedElement) {
    const draggedId = draggedElement.dataset.id;
    const targetId = this.dataset.id;

    // 配列内で位置を入れ替え
    const draggedIndex = selectedImages.findIndex((img) => img.id == draggedId);
    const targetIndex = selectedImages.findIndex((img) => img.id == targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      [selectedImages[draggedIndex], selectedImages[targetIndex]] = [
        selectedImages[targetIndex],
        selectedImages[draggedIndex],
      ];
      updateImageGrid();
    }
  }
}

function handleDragEnd(e) {
  this.classList.remove("dragging");
  document.getElementById("editImageGrid").classList.remove("drag-over");
  draggedElement = null;
}

function handleGridDragOver(e) {
  e.preventDefault();
  this.classList.add("drag-over");
}

function handleGridDragLeave(e) {
  this.classList.remove("drag-over");
}

// インラインタイトル編集機能（画像用）
function setupInlineTitleEdit() {
  const titleElement = document.querySelector("#inlineTitle-image");
  if (titleElement) {
    titleElement.addEventListener("click", function () {
      this.focus();
    });

    titleElement.addEventListener("input", function () {
      markAsChanged();
    });

    titleElement.addEventListener("blur", function () {
      // タイトルが空の場合のデフォルト値設定
      if (!this.textContent.trim()) {
        this.textContent = "無題の画像";
      }
    });

    titleElement.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        this.blur();
      }
    });
  }
}

// インラインタイトル編集機能（動画用）
function setupVideoInlineTitleEdit() {
  const titleElement = document.querySelector("#inlineTitle-video");
  if (titleElement) {
    titleElement.addEventListener("click", function () {
      this.focus();
    });

    titleElement.addEventListener("input", function () {
      markAsChanged();
    });

    titleElement.addEventListener("blur", function () {
      // タイトルが空の場合のデフォルト値設定
      if (!this.textContent.trim()) {
        this.textContent = "無題の動画";
      }
    });

    titleElement.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        this.blur();
      }
    });
  }
}

// ESCキーで編集画面を閉じる
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const editScreen = document.getElementById("editScreen");
    if (editScreen.classList.contains("show")) {
      hideEditScreen();
    }
  }
});

// 初期化
initializePagination();


// グローバルスコープに編集関数を公開（HTML側から呼び出すため）
window.editContent = editContent;
window.initializeTouchHandling = initializeTouchHandling;
window.initializeAdminJS = initializeAdminJS;
window.getStatusText = getStatusText;
