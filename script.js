// ============================================================
// GAS トラッキング設定
// ============================================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbx5Cf97A3SUGcfb8F3l87unhhSgjoo7TGZ1ozyRdk2JFGlxmJF9SxQN06QtjtJbJ5RV/exec';

const SESSION_ID = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

function sendLog(status, step, formType) {
  var payload = {
    timestamp:  new Date().toISOString(),
    form_type:  formType,
    last_step:  step,
    status:     status,
    session_id: SESSION_ID
  };
  fetch(GAS_URL, {
    method:    'POST',
    body:      JSON.stringify(payload),
    keepalive: true
  }).catch(function() {});
}

sendLog('visited', 0, 'landing');

var consentDone = false;
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden' && !consentDone) {
    sendLog('abandoned_landing', 0, 'landing');
  }
});

// ============================================================
// フォームURL定義
// ============================================================
const FORM_URLS = {
  A: 'https://morikawa001.github.io/idea_form_2/',     // A群：PICO型
  B: 'https://morikawa001.github.io/idea_test2/',      // B群：非構造化型　→　調査しない
  C: 'https://morikawa001.github.io/idea_test_base/',  // C群：従来型（研究参加・同意あり）
  D: 'https://morikawa001.github.io/idea_test_base0/'  // D群：従来型（研究外・同意なし）
};

// ============================================================
// UI制御
// ============================================================
function toggleConsent() {
  const cb = document.getElementById('consentCheck');
  cb.checked = !cb.checked;
  handleConsent();
}

function handleConsent() {
  const cb     = document.getElementById('consentCheck');
  const btn    = document.getElementById('startBtn');
  //const noArea = document.getElementById('noConsentArea');
  if (cb.checked) {
    btn.classList.add('active');
    //noArea.classList.add('hide');
  } else {
    btn.classList.remove('active');
    //noArea.classList.remove('hide');
  }
}

// ============================================================
// 同意あり：A/C群にランダム割付して遷移
// ============================================================
function goToForm() {
  const cb = document.getElementById('consentCheck');
  if (!cb.checked) return;

  // A・C群に均等ランダム割付は第Ⅱ相以降で計画
  // その際に ['A'] を ['A', 'C'] に変更
  const groups   = ['A'];
  const formType = groups[Math.floor(Math.random() * groups.length)];
  const targetUrl = FORM_URLS[formType];

  consentDone = true;
  sendLog('consented', 0, 'landing');
  sendLog('redirected', 0, formType);

  document.getElementById('modalMsg').innerHTML =
    'ご参加ありがとうございます。<br>フォームを読み込んでいます…';
  document.getElementById('modalOverlay').classList.add('show');

  setTimeout(function() {
    window.location.href = targetUrl + '?sid=' + SESSION_ID + '&ft=' + formType + '&consent=1';
  }, 1200);
}

// ============================================================
// 同意なし：D群（通常運用フォーム）へ誘導
// ============================================================
function goToFormD() {
  consentDone = true;
  sendLog('no_consent', 0, 'D');
  sendLog('redirected', 0, 'D');

  document.getElementById('modalMsg').innerHTML =
    'フォームへ移動しています。<br>そのままお待ちください…';
  document.getElementById('modalOverlay').classList.add('show');

  setTimeout(function() {
    window.location.href = FORM_URLS['D'] + '?sid=' + SESSION_ID + '&ft=D&consent=0';
  }, 1200);
}
