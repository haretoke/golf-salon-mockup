// サイドバートグル機能
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  sidebar.classList.toggle("-translate-x-full");
  overlay.classList.toggle("hidden");
}

// 画面サイズ変更時の処理
window.addEventListener("resize", function () {
  if (window.innerWidth >= 1024) {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    sidebar.classList.remove("-translate-x-full");
    overlay.classList.add("hidden");
  }
});


// メール表示
function viewEmail(emailId) {
  // メールデータを検索（原データから検索）
  const email = emailPagination.originalEmails.find((e) => e.id === emailId);
  if (!email) {
    alert("メールが見つかりません");
    return;
  }

  // モーダルにデータを設定
  showEmailDetailModal(email);
}

// メール詳細モーダル表示
function showEmailDetailModal(email) {
  const modal = document.getElementById("emailDetailModal");
  
  // データを設定
  populateEmailDetailModal(email);

  // モーダルを表示
  modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
  
  // Lucideアイコンを再初期化
  if (window.lucide) {
    lucide.createIcons();
  }
}


// メール詳細モーダルにデータを設定
function populateEmailDetailModal(email) {
  // 基本情報
  document.getElementById("modal-subject").textContent = email.subject || "-";
  document.getElementById("modal-from-email").textContent =
    email.fromEmail || "-";
  document.getElementById("modal-to-email").textContent = email.toEmail || "-";
  document.getElementById("modal-template").textContent = email.template || "-";

  // ステータス表示
  const statusContainer = document.getElementById("modal-status-container");
  const statusClass = getStatusClass(email.status);
  statusContainer.innerHTML = `<span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">${getStatusText(
    email.status
  )}</span>`;

  // 送信情報
  document.getElementById("modal-resend-id").textContent =
    email.resendEmailId || email.resendId || "-";
  document.getElementById("modal-sent-at").textContent = formatDateTime(
    email.sentAt
  );
  document.getElementById("modal-delivered-at").textContent = formatDateTime(
    email.deliveredAt
  );

  // エラー情報
  const errorSection = document.getElementById("modal-error-section");
  if (email.errorMessage || email.error) {
    document.getElementById("modal-error-message").textContent =
      email.errorMessage || email.error || "";
    document.getElementById("modal-error-type").textContent =
      email.errorType || email.error_code || "";
    errorSection.classList.remove("hidden");
  } else {
    errorSection.classList.add("hidden");
  }

  // バウンス情報
  const bounceSection = document.getElementById("modal-bounce-section");
  if (email.bounceMessage) {
    document.getElementById("modal-bounce-message").textContent =
      email.bounceMessage || "";
    document.getElementById("modal-bounce-code").textContent =
      email.bounceCode || "";
    document.getElementById("modal-bounce-enhanced").textContent =
      email.bounceEnhancedCode || "";
    bounceSection.classList.remove("hidden");
  } else {
    bounceSection.classList.add("hidden");
  }

  // Webhook情報
  document.getElementById("modal-webhook-type").textContent =
    email.lastWebhookType || "-";
  document.getElementById("modal-webhook-at").textContent = formatDateTime(
    email.lastWebhookAt
  );

  // 再試行情報
  const retrySection = document.getElementById("modal-retry-section");
  if (email.retryCount !== undefined || email.canRetry !== undefined) {
    document.getElementById("modal-retry-count").textContent =
      email.retryCount || "0";
    document.getElementById("modal-can-retry").textContent = email.canRetry
      ? "はい"
      : "いいえ";

    const nextRetryContainer = document.getElementById(
      "modal-next-retry-container"
    );
    const nextRetryElement = document.getElementById("modal-next-retry");
    if (email.nextRetryAt) {
      nextRetryElement.textContent = formatDateTime(email.nextRetryAt);
      nextRetryContainer.classList.remove("hidden");
    } else {
      nextRetryContainer.classList.add("hidden");
    }

    retrySection.classList.remove("hidden");
  } else {
    retrySection.classList.add("hidden");
  }

  // 再送信ボタンの表示制御
  const resendBtn = document.getElementById("modal-resend-btn");
  if (email.status === "failed" && email.canRetry) {
    resendBtn.classList.remove("hidden");
    resendBtn.setAttribute("data-email-id", email.id);
  } else {
    resendBtn.classList.add("hidden");
  }

  // Lucideアイコンを再初期化
  if (window.lucide) {
    lucide.createIcons();
  }
}

// メール詳細モーダルを閉じる
function closeEmailDetailModal() {
  const modal = document.getElementById("emailDetailModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }
}

// モーダルから再送信
function resendEmailFromModal() {
  const resendBtn = document.getElementById("modal-resend-btn");
  const emailId = resendBtn.getAttribute("data-email-id");
  if (emailId) {
    resendEmail(emailId);
    closeEmailDetailModal();
  }
}

// 日時フォーマット関数
function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ステータスのCSSクラスを取得
function getStatusClass(status) {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "sent":
      return "bg-blue-100 text-blue-800";
    case "sending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "bounced":
      return "bg-orange-100 text-orange-800";
    case "scheduled":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// ステータスの表示テキストを取得
function getStatusText(status) {
  switch (status) {
    case "delivered":
      return "配信済み";
    case "sent":
      return "送信済み";
    case "sending":
      return "送信中";
    case "failed":
      return "失敗";
    case "bounced":
      return "バウンス";
    case "scheduled":
      return "スケジュール済み";
    default:
      return "不明";
  }
}

// メール再送
function resendEmail(emailId) {
  if (confirm("このメールを再送信しますか？")) {
    alert(`再送信: ${emailId}`);
  }
}

// メールキャンセル
function cancelEmail(emailId) {
  if (confirm("このメールをキャンセルしますか？")) {
    alert(`キャンセル: ${emailId}`);
  }
}

// グローバル変数
let currentTemplateData = null;
let allTemplates = {};
let currentTemplateTab = "account";

// ==============================================
// シンプルなテンプレート管理機能
// ==============================================

// テンプレートデータの初期化
async function initializeTemplates() {
  try {
    const response = await fetch("data/email_logs.json");
    const data = await response.json();
    allTemplates = data.email_templates || {};
    loadTemplates();
  } catch (error) {
    console.error("Failed to load templates:", error);
  }
}

// テンプレートの読み込みと表示
function loadTemplates() {
  renderTemplateList();
}

// テンプレートタブの切り替え
function switchTemplateTab(category) {
  currentTemplateTab = category;

  // タブのスタイルを更新
  document.querySelectorAll(".template-tab").forEach((tab) => {
    tab.className =
      "template-tab flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap";
  });

  const activeTab = document.getElementById(`tab-${category}`);
  if (activeTab) {
    activeTab.className =
      "template-tab flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 border-primary-600 text-primary-600 bg-primary-50 whitespace-nowrap";
  }

  renderTemplateList();
}

// テンプレートリストの描画
function renderTemplateList() {
  const list = document.getElementById("templateList");
  let itemsHTML = "";

  if (allTemplates[currentTemplateTab]) {
    Object.keys(allTemplates[currentTemplateTab]).forEach((key) => {
      const template = allTemplates[currentTemplateTab][key];
      itemsHTML += createTemplateItem(key, template);
    });
  }

  list.innerHTML = itemsHTML;

  // Lucideアイコンを再初期化
  if (window.lucide) {
    lucide.createIcons();
  }
}

// テンプレートアイテムの作成
function createTemplateItem(templateKey, template) {
  const iconConfig = getTemplateIconConfig(templateKey);
  
  return `
    <div class="template-item group flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onclick="previewTemplate('${templateKey}')">
      <div class="flex items-center gap-3">
        <div class="p-2 ${iconConfig.bgColor} rounded-lg">
          <i data-lucide="${iconConfig.icon}" class="w-5 h-5 ${iconConfig.textColor}"></i>
        </div>
        <div>
          <h4 class="font-medium text-gray-800">${template.name}</h4>
          <p class="text-sm text-gray-600">${template.subject}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          onclick="event.stopPropagation(); previewTemplate('${templateKey}')"
          title="編集・プレビュー"
        >
          <i data-lucide="edit" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `;
}

// テンプレートアイコン設定の取得
function getTemplateIconConfig(templateKey) {
  const configs = {
    welcome: {
      icon: "user-plus",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    registration_verification: {
      icon: "user-check",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    email_change_verification: {
      icon: "mail",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    email_change_confirmation: {
      icon: "check-circle",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    password_reset: {
      icon: "key",
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
    },
    payment_success: {
      icon: "credit-card",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    payment_failed: {
      icon: "credit-card",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },
    plan_registration_complete: {
      icon: "star",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    auto_billing_suspended: {
      icon: "pause-circle",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
    plan_changed: {
      icon: "repeat",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    cancellation_started: {
      icon: "user-x",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
    subscription_canceled: {
      icon: "user-minus",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },
  };

  return (
    configs[templateKey] || {
      icon: "file-text",
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
    }
  );
}

// 現在のカテゴリからテンプレートを取得
function getTemplateByKey(templateKey) {
  for (const category of Object.keys(allTemplates)) {
    if (allTemplates[category][templateKey]) {
      const template = {
        ...allTemplates[category][templateKey],
        key: templateKey,
        category,
      };
      return template;
    }
  }
  return null;
}

// テンプレートプレビュー（改善されたUX）
function previewTemplate(templateKey) {
  const template = getTemplateByKey(templateKey);

  if (!template) {
    alert("テンプレートが見つかりません");
    return;
  }

  showTemplatePreviewModal(template);
}

// プレビューモーダルの表示
function showTemplatePreviewModal(template) {
  // モーダルが存在しない場合は作成
  let modal = document.getElementById("templatePreviewModal");

  if (!modal) {
    modal = createTemplatePreviewModal();
    document.body.appendChild(modal);

    // Lucideアイコンを初期化
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // 現在のテンプレートを保存
  currentTemplateData = template;
  
  // モーダルを表示
  modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");

  // データを設定
  populateTemplateModal(template);
}

// テンプレートモーダルにデータを設定
function populateTemplateModal(template) {
  // 基本情報を設定
  const nameElement = document.getElementById("preview-template-name");
  const subjectElement = document.getElementById("preview-template-subject");
  const categoryElement = document.getElementById("preview-template-category");
  const contentElement = document.getElementById("preview-template-content");
  const variablesContainer = document.getElementById(
    "preview-template-variables"
  );

  if (nameElement) {
    nameElement.value = template.name || "";
  }

  if (subjectElement) {
    subjectElement.value = template.subject || "";
  }

  if (categoryElement) {
    categoryElement.textContent = template.category || "";
  }

  // 本文コンテンツを設定
  const sampleContent = getTemplateContent(template.key);
  if (contentElement) {
    contentElement.value = sampleContent;
  }

  // 変数を表示
  if (variablesContainer) {
    if (template.variables && template.variables.length > 0) {
      variablesContainer.innerHTML = template.variables
        .map(
          (variable) =>
            `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{{${variable}}}</span>`
        )
        .join(" ");
    } else {
      variablesContainer.innerHTML =
        '<span class="text-gray-500 text-sm">変数なし</span>';
    }
  }
  
  // モーダルの変数ドロップダウンを更新
  updateModalVariableDropdown();

  // プレビューを更新
  updateTemplatePreview();


  // モバイル表示の初期状態を設定
  if (window.innerWidth < 768) {
    switchMobileTab("edit");
  }
}

// テンプレートの本文コンテンツを取得（モックアップ用）
function getTemplateContent(templateKey) {
  const contents = {
    welcome: `{{user_name}}様

この度は、Golf Salonにご登録いただき、誠にありがとうございます。

アカウントの作成が正常に完了いたしました。
下記のリンクからログインして、サービスをお楽しみください。

ログインURL: {{login_link}}

【サポートについて】
ご不明な点やご質問がございましたら、{{support_contact}}まで
お気軽にお問い合わせください。

今後ともGolf Salonをよろしくお願いいたします。

────────────────────────────
Golf Salon チーム
{{support_contact}}
────────────────────────────`,
    registration_verification: `{{user_name}}様

Golf Salonへのご登録ありがとうございます。

アカウント登録を完了するため、下記のリンクをクリックして
メールアドレスの確認を行ってください。

【確認URL】
{{verification_link}}

※このリンクは{{expiry_time}}以内に有効です。
※リンクの有効期限が切れた場合は、再度ご登録をお願いいたします。

────────────────────────────
Golf Salon チーム
{{support_contact}}
────────────────────────────`,
    password_reset: `{{user_name}}様

パスワードリセットのご依頼を承りました。

下記のリンクをクリックして、新しいパスワードを設定してください。

【パスワードリセットURL】
{{reset_link}}

【重要事項】
・このリンクは{{expiry_time}}以内に有効です
・リクエスト元IP: {{ip_address}}
・身に覚えのないリクエストの場合は、このメールを無視してください

────────────────────────────
Golf Salon チーム
{{support_contact}}
────────────────────────────`,
    payment_success: `{{user_name}}様

{{plan_name}}のお支払いが正常に完了いたしました。
いつもご利用いただき、ありがとうございます。

【決済詳細】
決済金額      : {{amount}}
請求サイクル  : {{billing_cycle}}
決済日        : {{payment_date}}
次回請求日    : {{next_billing_date}}

【領収書】
下記URLから領収書をダウンロードいただけます。
{{receipt_url}}

今後ともGolf Salonをよろしくお願いいたします。

────────────────────────────
Golf Salon チーム
{{support_contact}}
────────────────────────────`,
    payment_failed: `{{user_name}}様

{{plan_name}}の決済処理に失敗いたしました。
ご迷惑をおかけして申し訳ございません。

【決済詳細】
決済金額  : {{amount}}
プラン名  : {{plan_name}}
失敗理由  : {{failure_reason}}

【対処方法】
お手数ですが、決済情報をご確認の上、下記のリンクから
再度お手続きをお願いいたします。

【再試行URL】
{{retry_link}}

ご不明な点やお困りの際は、{{support_contact}}まで
お気軽にお問い合わせください。

────────────────────────────
Golf Salon チーム
{{support_contact}}
────────────────────────────`,
  };

  const result =
    contents[templateKey] ||
    `{{user_name}}様

こちらはサンプルテンプレートです。
実際のテンプレート内容をここに記載してください。

────────────────────────────
Golf Salon チーム
{{support_contact}}
────────────────────────────`;
  return result;
}

// プレビューを更新
function updateTemplatePreview() {
  const subjectElement = document.getElementById("preview-template-subject");
  const contentElement = document.getElementById("preview-template-content");
  const subjectDisplayElement = document.getElementById(
    "preview-subject-display"
  );
  const contentDisplayElement = document.getElementById(
    "preview-content-display"
  );

  const subject = subjectElement ? subjectElement.value : "";
  const content = contentElement ? contentElement.value : "";

  // 件名のプレビュー
  if (subjectDisplayElement) {
    subjectDisplayElement.textContent = subject;
  }

  // 本文のプレビュー（変数をハイライト）
  let previewContent = content;
  
  // 変数をハイライト表示
  previewContent = highlightVariables(previewContent);
  
  // 変数を実際の値に置換（オプション）
  if (currentTemplateData && currentTemplateData.variables) {
    currentTemplateData.variables.forEach((variable) => {
      const placeholder = getSampleVariableValue(variable);
      // ハイライトされた変数を実際の値に置換
      previewContent = previewContent.replace(
        new RegExp(`<span[^>]*>{{${variable}}}</span>`, "g"),
        `<span class="inline-block px-1 py-0.5 bg-green-100 text-green-700 text-xs rounded">${placeholder}</span>`
      );
    });
  }

  // HTMLとして表示（改行は<br>に変換）
  if (contentDisplayElement) {
    // 改行を<br>に変換してHTMLとして表示
    contentDisplayElement.innerHTML = previewContent.replace(/\n/g, '<br>');
  }
}

// サンプル変数値を取得
function getSampleVariableValue(variable) {
  const samples = {
    user_name: "田中 太郎",
    login_link: "https://golfsalon.jp/login",
    support_contact: "support@golfsalon.jp",
    verification_link: "https://golfsalon.jp/verify?token=abc123",
    expiry_time: "24時間",
    reset_link: "https://golfsalon.jp/reset?token=def456",
    ip_address: "192.168.1.1",
    plan_name: "ゴールドプラン",
    amount: "¥6,600",
    billing_cycle: "月額",
    payment_date: "2024年7月29日",
    next_billing_date: "2024年8月29日",
    receipt_url: "https://golfsalon.jp/receipt/123",
    failure_reason: "カードの有効期限切れ",
    retry_link: "https://golfsalon.jp/billing/retry",
  };

  return samples[variable] || `{${variable}}`;
}


// プレビューモーダルの作成
function createTemplatePreviewModal() {
  const modal = document.createElement("div");
  modal.id = "templatePreviewModal";
  modal.className =
    "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4 hidden";

  modal.innerHTML = `
          <div class="bg-white rounded-lg w-full h-full md:max-w-6xl md:w-full md:max-h-[90vh] flex flex-col overflow-hidden">
            <!-- ヘッダー -->
            <div class="flex items-center justify-between p-4 md:p-6 border-b bg-white">
              <div class="flex items-center gap-3">
                <i data-lucide="file-text" class="w-5 h-5 text-primary-600"></i>
                <h3 class="text-lg font-semibold text-gray-900">テンプレート管理</h3>
              </div>
              <button onclick="closeTemplatePreviewModal()" class="text-gray-400 hover:text-gray-600 p-1">
                <i data-lucide="x" class="w-6 h-6"></i>
              </button>
            </div>

            <!-- モバイル用タブナビゲーション -->
            <div class="md:hidden border-b border-gray-200">
              <nav class="flex">
                <button
                  id="mobile-edit-tab"
                  class="mobile-tab flex-1 px-4 py-3 text-sm font-medium border-b-2 border-primary-600 text-primary-600 bg-primary-50"
                  onclick="switchMobileTab('edit')"
                >
                  編集
                </button>
                <button
                  id="mobile-preview-tab"
                  class="mobile-tab flex-1 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500"
                  onclick="switchMobileTab('preview')"
                >
                  プレビュー
                </button>
              </nav>
            </div>

            <!-- コンテンツ -->
            <div class="flex flex-col md:flex-row flex-1 overflow-hidden">
              <!-- 編集エリア -->
              <div id="edit-area" class="w-full md:w-1/2 md:border-r p-4 md:p-6 overflow-y-auto flex-1">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">カテゴリ</label>
                    <p id="preview-template-category" class="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full inline-block"></p>
                  </div>

                  <div>
                    <label for="preview-template-name" class="block text-sm font-medium text-gray-600 mb-1">テンプレート名</label>
                    <input
                      type="text"
                      id="preview-template-name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readonly
                      oninput="updateTemplatePreview()"
                    >
                  </div>

                  <div>
                    <label for="preview-template-subject" class="block text-sm font-medium text-gray-600 mb-1">件名</label>
                    <input
                      type="text"
                      id="preview-template-subject"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      oninput="updateTemplatePreview()"
                    >
                  </div>

                  <div>
                    <label for="preview-template-content" class="block text-sm font-medium text-gray-600 mb-1">本文</label>
                    <div class="relative">
                      <textarea
                        id="preview-template-content"
                        rows="12"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg field-sizing-content focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        oninput="updateTemplatePreview()"
                        placeholder="プレーンテキスト形式でメール本文を入力してください"
                      ></textarea>
                      <!-- 変数挿入ボタン -->
                      <div class="absolute top-2 right-2">
                        <button
                          onclick="toggleModalVariableDropdown()"
                          class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                        >
                          <i data-lucide="plus" class="w-3 h-3"></i>
                          変数
                        </button>
                        <div id="modal-var-dropdown" class="hidden absolute right-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
                          <!-- 変数リストが動的に挿入されます -->
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">使用可能な変数</label>
                    <div id="preview-template-variables" class="flex flex-wrap gap-2 mb-2"></div>
                    <p class="text-xs text-gray-500">これらの変数は {{variable_name}} の形式で件名と本文で使用できます</p>
                  </div>
                </div>
              </div>

              <!-- プレビューエリア -->
              <div id="preview-area" class="hidden w-full md:w-1/2 p-4 md:p-6 overflow-y-auto bg-gray-50 md:block flex-1">
                <div class="mb-4 flex items-center justify-between">
                  <h4 class="text-sm font-medium text-gray-700">プレビュー</h4>
                  <span class="text-xs text-gray-500">※ 変数はサンプル値で表示されています</span>
                </div>

                <div class="bg-white border rounded-lg shadow-sm overflow-hidden">
                  <!-- メールヘッダー -->
                  <div class="p-4 border-b bg-gray-50">
                    <div class="text-xs text-gray-500 mb-1">件名</div>
                    <div id="preview-subject-display" class="font-medium text-gray-900"></div>
                  </div>

                  <!-- メール本文 -->
                  <div class="p-4 md:p-6">
                    <div id="preview-content-display" class="text-gray-900 whitespace-pre-wrap leading-relaxed text-sm md:text-base"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- フッター -->
            <div class="flex items-center justify-end gap-3 p-4 md:p-6 border-t bg-gray-50">
              <button onclick="closeTemplatePreviewModal()" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                キャンセル
              </button>
              <button
                onclick="saveTemplateChanges()"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                変更を保存
              </button>
            </div>
          </div>
        `;

  // クリックでモーダルを閉じる
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeTemplatePreviewModal();
    }
  });

  return modal;
}

// モーダル制御関数
function closeTemplatePreviewModal() {
  const modal = document.getElementById("templatePreviewModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }
  // リセット
  currentTemplateData = null;
  }

// テンプレート保存
function saveTemplateChanges() {
  if (!currentTemplateData) return;

  const name = document.getElementById("preview-template-name").value;
  const subject = document.getElementById("preview-template-subject").value;
  const content = document.getElementById("preview-template-content").value;

  if (!name.trim() || !subject.trim()) {
    alert("テンプレート名と件名は必須です");
    return;
  }

  // 実際の保存処理はここに実装
  alert(`テンプレート "${name}" を保存しました（モックアップ）`);

}

// 変数をハイライト
function highlightVariables(content) {
  return content.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return `<span class="inline-block px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">${match}</span>`;
  });
}

// モーダル用変数ドロップダウンをトグル
function toggleModalVariableDropdown() {
  const dropdown = document.getElementById('modal-var-dropdown');
  dropdown.classList.toggle('hidden');
}

// モーダル用変数ドロップダウンを更新
function updateModalVariableDropdown() {
  if (!currentTemplateData || !currentTemplateData.variables) return;
  
  const dropdown = document.getElementById('modal-var-dropdown');
  if (dropdown) {
    dropdown.innerHTML = currentTemplateData.variables.map(v => `
      <button
        onclick="insertModalVariable('${v}')"
        class="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
      >
        {{${v}}}
      </button>
    `).join('');
  }
}

// モーダルに変数を挿入
function insertModalVariable(variable) {
  const textarea = document.getElementById('preview-template-content');
  const position = textarea.selectionStart;
  const content = textarea.value;
  const newContent = 
    content.slice(0, position) + 
    `{{${variable}}}` + 
    content.slice(position);
  
  textarea.value = newContent;
  textarea.focus();
  textarea.setSelectionRange(position + variable.length + 4, position + variable.length + 4);
  
  // プレビューを更新
  updateTemplatePreview();
  
  // ドロップダウンを閉じる
  document.getElementById('modal-var-dropdown').classList.add('hidden');
}

// モバイル用タブ切り替え
function switchMobileTab(tab) {
  const editTab = document.getElementById("mobile-edit-tab");
  const previewTab = document.getElementById("mobile-preview-tab");
  const editArea = document.getElementById("edit-area");
  const previewArea = document.getElementById("preview-area");

  if (tab === "edit") {
    // 編集タブをアクティブに
    editTab.className =
      "mobile-tab flex-1 px-4 py-3 text-sm font-medium border-b-2 border-primary-600 text-primary-600 bg-primary-50";
    previewTab.className =
      "mobile-tab flex-1 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500";

    // 編集エリアを表示、プレビューエリアを非表示
    editArea.classList.remove("hidden");
    previewArea.classList.add("hidden");
  } else if (tab === "preview") {
    // プレビュータブをアクティブに
    previewTab.className =
      "mobile-tab flex-1 px-4 py-3 text-sm font-medium border-b-2 border-primary-600 text-primary-600 bg-primary-50";
    editTab.className =
      "mobile-tab flex-1 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500";

    // プレビューエリアを表示、編集エリアを非表示
    editArea.classList.add("hidden");
    previewArea.classList.remove("hidden");

    // プレビューを更新
    updateTemplatePreview();
  }
}

// 失敗メール再試行
function retryEmail(emailId) {
  if (confirm("このメールを再試行しますか？")) {
    alert(`再試行: ${emailId}`);
  }
}

// 失敗メールステータス管理
function markFailedEmailAsAcknowledged(emailId) {
  const email = findEmailInFailedList(emailId);
  if (!email) {
    alert('メール情報が見つかりません');
    return;
  }
  
  // ステータスを更新
  email.failureStatus = 'acknowledged';
  email.acknowledgedAt = new Date().toISOString();
  
  // UIを再描画
  renderFailedEmails(currentFailedEmails);
}

// 現在調査中のメール情報を保持
let currentInvestigatingEmail = null;

function investigateFailedEmail(emailId) {
  // 詳細調査機能の実装
  const email = findEmailInFailedList(emailId);
  if (!email) {
    alert('メール情報が見つかりません');
    return;
  }

  // 現在のメール情報を保存
  currentInvestigatingEmail = email;
  
  // モーダルに情報を表示
  showInvestigationModal(email);
}

// 調査モーダルを表示
function showInvestigationModal(email) {
  const modal = document.getElementById('investigationModal');
  const overlay = document.getElementById('investigationModal');
  
  // エラー分析
  const errorAnalysis = analyzeEmailError(email);
  const recommendations = getErrorRecommendations(email);
  
  // 基本情報を設定
  document.getElementById('modal-investigation-email').textContent = email.toEmail;
  document.getElementById('modal-investigation-error').textContent = email.error;
  document.getElementById('modal-investigation-date').textContent = new Date(
    email.failedAt || email.bouncedAt || email.complainedAt || email.delayedAt
  ).toLocaleString('ja-JP');
  
  // エラー分析を設定
  document.getElementById('modal-investigation-category').textContent = errorAnalysis.category;
  const severityElement = document.getElementById('modal-investigation-severity');
  severityElement.textContent = errorAnalysis.severity;
  severityElement.className = `text-sm font-medium ${
    errorAnalysis.severity === '高' ? 'text-red-600' :
    errorAnalysis.severity === '中' ? 'text-amber-600' : 'text-blue-600'
  }`;
  
  // 推奨対応を設定
  const recommendationsContainer = document.getElementById('modal-investigation-recommendations');
  recommendationsContainer.innerHTML = recommendations.map(rec => `
    <div class="py-1">
      <p class="text-sm text-gray-700">${rec}</p>
    </div>
  `).join('');
  
  // 技術詳細を設定
  document.getElementById('modal-investigation-resend-id').textContent = email.resendEmailId || 'N/A';
  document.getElementById('modal-investigation-webhook').textContent = email.webhookType || 'N/A';
  
  // 現在のステータスを選択
  document.querySelectorAll('input[name="status"]').forEach(radio => {
    radio.checked = false;
  });
  if (email.failureStatus === 'investigating') {
    document.querySelector('input[name="status"][value="investigating"]').checked = true;
  } else if (email.failureStatus === 'resolved') {
    document.querySelector('input[name="status"][value="resolved"]').checked = true;
  } else if (email.failureStatus === 'unresolvable') {
    document.querySelector('input[name="status"][value="unresolvable"]').checked = true;
  }
  
  // メモを設定
  document.getElementById('investigationNotes').value = email.notes || '';
  
  // 解決不可オプションを設定
  if (email.suppressed) {
    document.getElementById('suppressFutureEmailsInv').checked = true;
    document.getElementById('unresolvableReasonInv').value = email.suppressReason || '';
  } else {
    document.getElementById('suppressFutureEmailsInv').checked = false;
    document.getElementById('unresolvableReasonInv').value = '';
  }
  
  // 解決不可オプションの表示/非表示
  const unresolvableOptions = document.getElementById('unresolvableOptionsInv');
  if (email.failureStatus === 'unresolvable') {
    unresolvableOptions.classList.remove('hidden');
  } else {
    unresolvableOptions.classList.add('hidden');
  }
  
  // 保存ボタンの状態
  document.getElementById('modal-save-status-btn').disabled = !email.failureStatus || email.failureStatus === 'unresolved';
  
  // モーダルを表示
  modal.classList.remove('hidden');
  
  // Lucideアイコンを再初期化
  lucide.createIcons();
}

// 調査モーダルを閉じる
function closeInvestigationModal() {
  const modal = document.getElementById('investigationModal');
  modal.classList.add('hidden');
  currentInvestigatingEmail = null;
}

// 失敗ステータスを保存
function saveFailureStatus() {
  if (!currentInvestigatingEmail) return;
  
  const selectedStatus = document.querySelector('input[name="status"]:checked');
  if (!selectedStatus) return;
  
  const statusValue = selectedStatus.value;
  const notes = document.getElementById('investigationNotes').value;
  
  // ステータスを更新
  currentInvestigatingEmail.failureStatus = statusValue;
  currentInvestigatingEmail.notes = notes;
  
  // タイムスタンプを更新
  if (statusValue === 'investigating' && !currentInvestigatingEmail.investigatingAt) {
    currentInvestigatingEmail.investigatingAt = new Date().toISOString();
  } else if ((statusValue === 'resolved' || statusValue === 'unresolvable') && !currentInvestigatingEmail.resolvedAt) {
    currentInvestigatingEmail.resolvedAt = new Date().toISOString();
  }
  
  // 解決不可の場合の追加処理
  if (statusValue === 'unresolvable') {
    if (document.getElementById('suppressFutureEmailsInv').checked) {
      currentInvestigatingEmail.suppressed = true;
      currentInvestigatingEmail.suppressReason = document.getElementById('unresolvableReasonInv').value;
    }
  }
  
  // 元のデータも更新
  const emailIndex = currentFailedEmails.findIndex(e => e.id === currentInvestigatingEmail.id);
  if (emailIndex !== -1) {
    currentFailedEmails[emailIndex] = currentInvestigatingEmail;
  }
  
  // カードの表示を更新
  renderFailedEmails(currentFailedEmails);
  
  // モーダルを閉じる
  closeInvestigationModal();
  
  // 成功メッセージ（オプション）
  // alert('ステータスを更新しました。');
}

// グローバル変数で失敗メールデータを保持
let currentFailedEmails = [];

// 解決モーダルを表示（統合モーダルへリダイレクト）
function showResolutionModal(emailId) {
  const email = findEmailInFailedList(emailId);
  if (!email) {
    alert('メール情報が見つかりません');
    return;
  }
  
  // 統合モーダルを開く
  showInvestigationModal(email);
}

// 失敗メールリストからメールを検索
function findEmailInFailedList(emailId) {
  return currentFailedEmails.find(email => email.id === emailId);
}

// 調査レポートの生成
function generateInvestigationReport(email) {
  const errorAnalysis = analyzeEmailError(email);
  const recommendations = getErrorRecommendations(email);
  
  return `【配信失敗詳細分析】
宛先: ${email.toEmail}
エラー: ${email.error}
分類: ${errorAnalysis.category}
重要度: ${errorAnalysis.severity}

【推奨対応】
${recommendations.join('\n')}

【技術詳細】
Resend ID: ${email.resendEmailId || 'N/A'}
Webhook: ${email.webhookType || 'N/A'}
発生日時: ${new Date(email.failedAt || email.complainedAt).toLocaleString('ja-JP')}`;
}

// エラー分析
function analyzeEmailError(email) {
  const errorPatterns = {
    'Invalid email address': { category: 'フォーマット不正', severity: '高' },
    'Domain not found': { category: 'ドメイン不正', severity: '高' },
    'Mailbox full': { category: '一時的エラー', severity: '中' },
    'marked sender as spam': { category: 'スパム判定', severity: '高' },
    'suppression list': { category: '配信停止', severity: '中' },
    'Server temporarily unavailable': { category: 'サーバー問題', severity: '低' }
  };
  
  for (const [pattern, analysis] of Object.entries(errorPatterns)) {
    if (email.error.includes(pattern)) {
      return analysis;
    }
  }
  
  return { category: '不明', severity: '中' };
}

// 推奨対応の取得
function getErrorRecommendations(email) {
  const recommendations = [];
  
  if (email.error.includes('Invalid email address')) {
    recommendations.push('・ユーザーに正しいメールアドレスの再入力を依頼');
    recommendations.push('・入力フォームのバリデーション強化を検討');
  } else if (email.error.includes('Domain not found')) {
    recommendations.push('・ユーザーにメールアドレスの確認を依頼');
    recommendations.push('・typoの可能性を調査');
  } else if (email.error.includes('Mailbox full')) {
    recommendations.push('・数日後に自動再試行を実行');
    recommendations.push('・ユーザーに容量不足の可能性を通知');
  } else if (email.error.includes('spam')) {
    recommendations.push('・送信内容とタイミングの見直し');
    recommendations.push('・SPF/DKIM/DMARC設定の確認');
    recommendations.push('・送信頻度の調整を検討');
  } else if (email.error.includes('suppression')) {
    recommendations.push('・抑制リストからの除外申請を検討');
    recommendations.push('・ユーザーの配信停止意思を確認');
  }
  
  recommendations.push('・類似エラーの傾向分析を実施');
  recommendations.push('・必要に応じてResendサポートに相談');
  
  return recommendations;
}

// フィルター機能（動的データ対応）
function applyFilters() {
  const statusFilter = document.getElementById("statusFilter").value;
  const templateFilter = document.getElementById("templateFilter").value;
  const dateFilter = document.getElementById("dateFilter").value;

  // 元データから開始
  let filteredEmails = [...emailPagination.originalEmails];

  // ステータスフィルター
  if (statusFilter) {
    filteredEmails = filteredEmails.filter((email) => {
      return email.status === statusFilter;
    });
  }

  // テンプレートフィルター
  if (templateFilter) {
    filteredEmails = filteredEmails.filter((email) => {
      return email.template === templateFilter;
    });
  }

  // 日付フィルター
  if (dateFilter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    filteredEmails = filteredEmails.filter((email) => {
      const emailDate = new Date(email.sentAt || email.scheduledAt);

      switch (dateFilter) {
        case "today":
          return emailDate >= today;
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return emailDate >= weekAgo;
        case "month":
          const monthAgo = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            today.getDate()
          );
          return emailDate >= monthAgo;
        default:
          return true;
      }
    });
  }

  // フィルタリング結果を設定してページングを更新
  emailPagination.allEmails = filteredEmails;
  emailPagination.totalItems = filteredEmails.length;
  emailPagination.currentPage = 1; // フィルター時は1ページ目に戻る

  renderEmailTableWithPaging();

  // フィルター状態の表示
  updateFilterStatus(
    statusFilter,
    templateFilter,
    dateFilter,
    filteredEmails.length,
    emailPagination.originalEmails.length
  );
}

// フィルター状態の表示更新
function updateFilterStatus(
  statusFilter,
  templateFilter,
  dateFilter,
  filteredCount,
  totalCount
) {
  const hasFilters = statusFilter || templateFilter || dateFilter;

  if (hasFilters) {
    // フィルター適用中の表示
    const filterInfo = document.getElementById("paginationInfo");
    if (filterInfo) {
      filterInfo.innerHTML = `
              <span class="text-primary-600">フィルター適用中: ${filteredCount}件</span>
              <span class="text-gray-500 ml-2">（全${totalCount}件）</span>
            `;
    }
  }
}

// フィルターをクリア
function clearFilters() {
  document.getElementById("statusFilter").value = "";
  document.getElementById("templateFilter").value = "";
  document.getElementById("dateFilter").value = "";

  // 元データを復元
  emailPagination.allEmails = [...emailPagination.originalEmails];
  emailPagination.totalItems = emailPagination.originalEmails.length;
  emailPagination.currentPage = 1;

  renderEmailTableWithPaging();

  // ページング情報を通常表示に戻す
  const startItem = 1;
  const endItem = Math.min(
    emailPagination.itemsPerPage,
    emailPagination.totalItems
  );
  document.getElementById(
    "paginationInfo"
  ).textContent = `${startItem}-${endItem} of ${emailPagination.totalItems} results`;
}

// フィルターイベントリスナー
document
  .getElementById("statusFilter")
  .addEventListener("change", applyFilters);
document
  .getElementById("templateFilter")
  .addEventListener("change", applyFilters);
document.getElementById("dateFilter").addEventListener("change", applyFilters);

// ページング状態管理
const emailPagination = {
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
  allEmails: [],
  originalEmails: [], // フィルター前の元データを保持
};

// データ読み込みと表示
async function loadEmailData() {
  try {
    const data = await loadEmailLogs();
    if (data) {
      // 送信日時で降順ソート（新しいものが上）
      const sortedEmails = data.email_logs.sort((a, b) => {
        const dateA = new Date(a.sentAt || a.scheduledAt);
        const dateB = new Date(b.sentAt || b.scheduledAt);
        return dateB - dateA; // 降順
      });

      // 元データを保存
      emailPagination.originalEmails = [...sortedEmails];
      emailPagination.allEmails = [...sortedEmails];
      emailPagination.totalItems = sortedEmails.length;
      renderEmailTableWithPaging();
      renderFailedEmails(data.failed_emails);
      renderResendIntegration(data.resend_integration);
    }
  } catch (error) {
    console.error("Failed to load email data:", error);
  }
}

// ページング付きメールテーブルの描画
function renderEmailTableWithPaging() {
  const startIndex =
    (emailPagination.currentPage - 1) * emailPagination.itemsPerPage;
  const endIndex = startIndex + emailPagination.itemsPerPage;
  const paginatedEmails = emailPagination.allEmails.slice(startIndex, endIndex);

  renderEmailTable(paginatedEmails);
  renderPaginationControls();
}

// メールテーブルの描画
function renderEmailTable(emails) {
  const tbody = document.getElementById("emailTableBody");
  tbody.innerHTML = "";

  emails.forEach((email) => {
    const row = createEmailTableRow(email);
    tbody.appendChild(row);
  });

  // Lucideアイコンを再初期化
  lucide.createIcons();
}

// テーブル行の作成
function createEmailTableRow(email) {
  const row = document.createElement("tr");
  row.className = "hover:bg-gray-50";

  const sentDate = new Date(email.sentAt).toLocaleString("ja-JP");
  const deliveryTime = getDeliveryTime(email);
  const statusInfo = getStatusInfo(email.status);
  const typeInfo = getTypeInfo(email.type);

  row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${sentDate}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            ${email.toEmail}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            ${email.subject}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              typeInfo.bgColor
            } ${typeInfo.textColor}">
              ${typeInfo.label}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              statusInfo.bgColor
            } ${statusInfo.textColor} email-status">
              ${statusInfo.label}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${deliveryTime}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button class="text-primary-600 hover:text-primary-700 mr-3" onclick="viewEmail('${
              email.id
            }')">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
            ${getActionButton(email)}
          </td>
        `;

  return row;
}

// 配信時間の取得
function getDeliveryTime(email) {
  if (email.deliveredAt && email.sentAt) {
    const sent = new Date(email.sentAt);
    const delivered = new Date(email.deliveredAt);
    const diff = (delivered - sent) / 1000;
    return `${diff.toFixed(1)}秒`;
  }
  return email.status === "scheduled" ? "予定" : "-";
}

// ステータス情報の取得
function getStatusInfo(status) {
  const statusMap = {
    delivered: {
      label: "配信済み",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
    },
    sent: {
      label: "送信済み",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
    },
    failed: {
      label: "失敗",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
    },
    bounced: {
      label: "バウンス",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
    },
    scheduled: {
      label: "スケジュール",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    },
    sending: {
      label: "送信中",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
    },
  };
  return (
    statusMap[status] || {
      label: status,
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    }
  );
}

// タイプ情報の取得
function getTypeInfo(type) {
  const typeMap = {
    welcome: {
      label: "ウェルカム",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
    },
    registration_verification: {
      label: "登録確認",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    },
    email_change_verification: {
      label: "メール変更確認",
      bgColor: "bg-teal-100",
      textColor: "text-teal-800",
    },
    email_change_confirmation: {
      label: "メール変更完了",
      bgColor: "bg-teal-100",
      textColor: "text-teal-800",
    },
    password_reset: {
      label: "パスワードリセット",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    },
    plan_registration_complete: {
      label: "プラン登録完了",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
    },
    payment_success: {
      label: "決済成功",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    },
    payment_failed: {
      label: "決済失敗",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
    },
    auto_billing_suspended: {
      label: "自動課金停止",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
    },
    plan_changed: {
      label: "プラン変更",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-800",
    },
    cancellation_started: {
      label: "退会手続き開始",
      bgColor: "bg-orange-100",
      textColor: "text-orange-800",
    },
    subscription_canceled: {
      label: "退会完了",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
    },
  };
  return (
    typeMap[type] || {
      label: type,
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    }
  );
}

// アクションボタンの取得
function getActionButton(email) {
  if (email.status === "scheduled") {
    return `<button class="text-red-600 hover:text-red-700" onclick="cancelEmail('${email.id}')">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>`;
  }
  return `<button class="text-blue-600 hover:text-blue-700" onclick="resendEmail('${email.id}')">
          <i data-lucide="refresh-cw" class="w-4 h-4"></i>
        </button>`;
}

// 失敗メールの描画
function renderFailedEmails(failedEmails) {
  const container = document.getElementById("failedEmailsList");
  const countElement = document.getElementById("failedEmailCount");
  
  // グローバル変数に保存
  currentFailedEmails = failedEmails || [];
  
  container.innerHTML = "";

  if (currentFailedEmails && currentFailedEmails.length > 0) {
    // 件数表示を更新
    countElement.textContent = `${currentFailedEmails.length}件`;
    
    currentFailedEmails.forEach((email) => {
      const emailDiv = createFailedEmailCard(email);
      container.appendChild(emailDiv);
    });
  } else {
    // 失敗メールがない場合
    countElement.textContent = "0件";
    
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "p-12 text-center text-gray-400";
    emptyDiv.innerHTML = `
            <i data-lucide="check-circle" class="w-12 h-12 mx-auto mb-3 text-gray-300"></i>
            <p class="text-sm text-gray-500">配信失敗メールはありません</p>
          `;
    container.appendChild(emptyDiv);
  }

  // Lucideアイコンを再初期化
  lucide.createIcons();
}

// 失敗メールカードの作成
function createFailedEmailCard(email) {
  const div = document.createElement("div");
  
  const failedDate = new Date(
    email.failedAt || email.bouncedAt || email.complainedAt || email.delayedAt
  ).toLocaleString(
    "ja-JP",
    {
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  );

  // 配信失敗の種類を判定
  const bounceType = email.bounceType || (email.status === "bounced" ? "hard" : "soft");
  const severityInfo = getBounceTypeInfo(bounceType);
  
  // ステータス情報
  const statusInfo = getFailureStatusInfo(email.failureStatus);

  // 未対応の場合は背景色を付ける
  const bgColor = email.failureStatus === 'unresolved' ? 'bg-red-50' : '';
  const hoverColor = email.failureStatus === 'unresolved' ? 'hover:bg-red-100' : 'hover:bg-gray-50';
  
  div.className = `p-4 ${bgColor} ${hoverColor} transition-colors`;
  div.setAttribute('data-email-id', email.id);
  
  div.innerHTML = `
          <div class="flex items-start gap-4">
            <!-- 左側：メイン情報 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-2">
                <h4 class="font-medium text-gray-900 text-sm break-all">${email.toEmail}</h4>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${severityInfo.bgColor} ${severityInfo.textColor}">
                    ${severityInfo.label}
                  </span>
                  ${email.failureStatus !== 'unresolved' ? `
                    <span 
                      onclick="showResolutionModal('${email.id}')"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor} cursor-pointer hover:opacity-80 transition-opacity">
                      ${statusInfo.label}
                    </span>
                  ` : ''}
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-1">${email.error}</p>
              <p class="text-xs text-gray-500">${failedDate}</p>
            </div>
            
            <!-- 右側：アクション -->
            <div class="flex items-center gap-2 flex-shrink-0">
              ${
                email.canRetry
                  ? `
                <button 
                  class="text-gray-400 hover:text-blue-600 transition-colors" 
                  onclick="retryEmail('${email.id}')"
                  title="再送信"
                >
                  <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                </button>
              `
                  : ""
              }
              ${
                email.failureStatus === 'unresolved'
                  ? `
                <button 
                  class="text-gray-400 hover:text-green-600 transition-colors" 
                  onclick="markFailedEmailAsAcknowledged('${email.id}')"
                  title="確認済みにする"
                >
                  <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                </button>
              `
                  : ""
              }
              <button 
                class="text-gray-400 hover:text-amber-600 transition-colors" 
                onclick="investigateFailedEmail('${email.id}')"
                title="詳細調査"
              >
                <i data-lucide="search" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        `;

  return div;
}

// バウンス種類の情報を取得
function getBounceTypeInfo(bounceType) {
  const typeMap = {
    hard: {
      label: "ハードバウンス",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
    },
    soft: {
      label: "ソフトバウンス", 
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
    },
    suppressed: {
      label: "抑制済み",
      bgColor: "bg-gray-100", 
      textColor: "text-gray-800",
    },
    complaint: {
      label: "苦情",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
    }
  };
  
  return typeMap[bounceType] || {
    label: "不明",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
  };
}

// 失敗ステータス情報を取得
function getFailureStatusInfo(failureStatus) {
  const statusMap = {
    unresolved: {
      label: "未対応",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
    },
    acknowledged: {
      label: "確認済み",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    },
    investigating: {
      label: "調査中",
      bgColor: "bg-amber-100",
      textColor: "text-amber-800",
    },
    resolved: {
      label: "解決済み",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
    },
    unresolvable: {
      label: "解決不可",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    }
  };
  
  return statusMap[failureStatus] || {
    label: "未対応",
    bgColor: "bg-red-100",
    textColor: "text-gray-800",
  };
}


// Resend連携情報の描画
function renderResendIntegration(integration) {
  if (!integration) {
    console.warn('renderResendIntegration: integration data is missing');
    return;
  }
  
  try {
    // 接続ステータス
    const statusElement = document.querySelector('.resend-connection-status');
    if (statusElement && integration.connection_status) {
      statusElement.textContent = integration.connection_status === 'connected' ? '接続中' : '未接続';
      statusElement.className = integration.connection_status === 'connected' 
        ? 'text-sm font-medium text-green-600' 
        : 'text-sm font-medium text-red-600';
    }
    
    // 月次クォータ
    const quotaElement = document.querySelector('.resend-quota');
    if (quotaElement && integration.quota_used !== undefined && integration.quota_limit !== undefined) {
      quotaElement.textContent = `${integration.quota_used.toLocaleString()} / ${integration.quota_limit.toLocaleString()}`;
    }
    
    // API成功率
    const successRateElement = document.querySelector('.resend-success-rate');
    if (successRateElement && integration.success_rate !== undefined) {
      const rate = (integration.success_rate * 100).toFixed(1);
      successRateElement.textContent = `${rate}%`;
      successRateElement.className = integration.success_rate >= 0.95 
        ? 'text-sm font-medium text-green-600' 
        : 'text-sm font-medium text-orange-600';
    }
    
    // 最終Webhook
    const lastWebhookElement = document.querySelector('.resend-last-webhook');
    if (lastWebhookElement && integration.last_webhook_at) {
      lastWebhookElement.textContent = formatDateTime(integration.last_webhook_at);
    }
    
  } catch (error) {
    console.error('Error updating Resend integration status:', error);
  }
}

// ページング制御の描画
function renderPaginationControls() {
  const totalPages = Math.ceil(
    emailPagination.totalItems / emailPagination.itemsPerPage
  );
  const currentPage = emailPagination.currentPage;

  // 情報表示の更新
  const startItem = (currentPage - 1) * emailPagination.itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * emailPagination.itemsPerPage,
    emailPagination.totalItems
  );
  document.getElementById(
    "paginationInfo"
  ).textContent = `${startItem}-${endItem} of ${emailPagination.totalItems} results`;

  // 前へボタンの状態
  const prevBtn = document.getElementById("prevPageBtn");
  prevBtn.disabled = currentPage === 1;

  // 次へボタンの状態
  const nextBtn = document.getElementById("nextPageBtn");
  nextBtn.disabled = currentPage === totalPages;

  // ページ番号ボタンの生成
  const pageNumbers = document.getElementById("pageNumbers");
  pageNumbers.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className = `px-3 py-1 text-sm rounded-md ${
      i === currentPage
        ? "bg-primary-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;
    pageBtn.textContent = i;
    pageBtn.onclick = () => goToPage(i);
    pageNumbers.appendChild(pageBtn);
  }
}

// ページ移動
function goToPage(page) {
  const totalPages = Math.ceil(
    emailPagination.totalItems / emailPagination.itemsPerPage
  );
  if (page >= 1 && page <= totalPages) {
    emailPagination.currentPage = page;
    renderEmailTableWithPaging();
  }
}

// 前のページ
function goToPrevPage() {
  if (emailPagination.currentPage > 1) {
    goToPage(emailPagination.currentPage - 1);
  }
}

// 次のページ
function goToNextPage() {
  const totalPages = Math.ceil(
    emailPagination.totalItems / emailPagination.itemsPerPage
  );
  if (emailPagination.currentPage < totalPages) {
    goToPage(emailPagination.currentPage + 1);
  }
}

// ページング用イベントリスナー
document.getElementById("prevPageBtn").addEventListener("click", goToPrevPage);
document.getElementById("nextPageBtn").addEventListener("click", goToNextPage);

// ページ読み込み時にデータを読み込み
document.addEventListener("DOMContentLoaded", async function () {
  await loadEmailData();
  await initializeTemplates();
  
  // メール詳細モーダルのクリックイベントを設定
  const emailDetailModal = document.getElementById("emailDetailModal");
  if (emailDetailModal) {
    emailDetailModal.addEventListener("click", (e) => {
      if (e.target === emailDetailModal) {
        closeEmailDetailModal();
      }
    });
  }
  
  // 調査モーダルのクリックイベントを設定
  const investigationModal = document.getElementById("investigationModal");
  if (investigationModal) {
    investigationModal.addEventListener("click", (e) => {
      if (e.target === investigationModal) {
        closeInvestigationModal();
      }
    });
  }
  
  // ESCキーでモーダルを閉じる
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // メール詳細モーダルが開いている場合
      if (emailDetailModal && !emailDetailModal.classList.contains("hidden")) {
        closeEmailDetailModal();
      }
      // 調査モーダルが開いている場合
      if (investigationModal && !investigationModal.classList.contains("hidden")) {
        closeInvestigationModal();
      }
    }
  });
  
  // ドキュメントクリックで変数ドロップダウンを閉じる
  document.addEventListener("click", (e) => {
    if (!e.target.closest('[id^="var-dropdown-"]') && !e.target.closest('button[onclick*="toggleVariableDropdown"]')) {
      document.querySelectorAll('[id^="var-dropdown-"]').forEach(dropdown => {
        dropdown.classList.add('hidden');
      });
    }
  });
  
  // ステータス選択の監視
  document.querySelectorAll('input[name="status"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const saveBtn = document.getElementById('modal-save-status-btn');
      saveBtn.disabled = false;
      
      // 解決不可を選択した場合、追加オプションを表示
      const unresolvableOptions = document.getElementById('unresolvableOptionsInv');
      if (e.target.value === 'unresolvable') {
        unresolvableOptions.classList.remove('hidden');
      } else {
        unresolvableOptions.classList.add('hidden');
      }
    });
  });
});

lucide.createIcons();
