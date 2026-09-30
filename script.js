/**
 * ELENA CHEN | PERSONAL EDITORIAL PORTFOLIO JAVASCRIPT
 * Features:
 * - Real-time clock in editorial banner
 * - Dark/Light mode toggle with persistence
 * - In-Browser Live Edit Mode (contenteditable, local storage save, JSON backup/restore, custom photo)
 * - Interactive Skills Matrix filter
 * - Dynamic Project Case Study Modal
 * - One-click clipboard copy with Toast notifications
 * - Contact Form submission simulator
 * - Print Resume trigger
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. REAL-TIME CLOCK DISPLAY
  // ==========================================
  const localTimeDisplay = document.getElementById('localTimeDisplay');
  function updateTime() {
    if (!localTimeDisplay) return;
    const now = new Date();
    const options = {
      timeZone: 'Asia/Taipei',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    const timeStr = now.toLocaleTimeString('en-US', options);
    localTimeDisplay.textContent = `TAIPEI ${timeStr}`;
  }
  updateTime();
  setInterval(updateTime, 1000);

  // ==========================================
  // 2. THEME TOGGLE (DARK / LIGHT)
  // ==========================================
  const themeToggle = document.getElementById('themeToggle');
  const htmlRoot = document.documentElement;

  // Retrieve saved theme or fallback to system preference
  const savedTheme = localStorage.getItem('portfolio_theme');
  if (savedTheme) {
    htmlRoot.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    htmlRoot.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('portfolio_theme', newTheme);
      showToast(`已切換為 ${newTheme === 'dark' ? '深色夜間模式' : '簡約暖白模式'}`);
    });
  }

  // ==========================================
  // 3. TOAST NOTIFICATION SYSTEM
  // ==========================================
  const toastContainer = document.getElementById('toastContainer');
  function showToast(message, duration = 3000) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ==========================================
  // 4. IN-BROWSER LIVE EDIT MODE
  // ==========================================
  const editModeToggle = document.getElementById('editModeToggle');
  const editToolbar = document.getElementById('editToolbar');
  const btnSaveData = document.getElementById('btnSaveData');
  const btnExportJSON = document.getElementById('btnExportJSON');
  const btnImportJSON = document.getElementById('btnImportJSON');
  const importFileInput = document.getElementById('importFileInput');
  const btnResetData = document.getElementById('btnResetData');
  const btnCloseEdit = document.getElementById('btnCloseEdit');
  const editableElements = document.querySelectorAll('[data-editable="true"]');
  const avatarImage = document.getElementById('avatarImage');
  const btnChangeAvatar = document.getElementById('btnChangeAvatar');
  const avatarFileInput = document.getElementById('avatarFileInput');

  const STORAGE_KEY = 'portfolio_custom_data';
  let isEditMode = false;

  // Load saved content from localStorage on startup
  function loadSavedContent() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return;
    try {
      const data = JSON.parse(rawData);
      // Load editable texts
      if (data.texts) {
        editableElements.forEach(el => {
          const key = el.getAttribute('data-key');
          if (key && data.texts[key] !== undefined) {
            el.innerHTML = data.texts[key];
          }
        });
      }
      // Load custom avatar
      if (data.avatar && avatarImage) {
        avatarImage.src = data.avatar;
      }
    } catch (e) {
      console.error('Failed to parse saved portfolio data:', e);
    }
  }
  loadSavedContent();

  // Save current content to localStorage
  function saveCurrentContent(showFeedback = true) {
    const data = {
      texts: {},
      avatar: avatarImage ? avatarImage.src : null,
      lastUpdated: new Date().toISOString()
    };

    editableElements.forEach(el => {
      const key = el.getAttribute('data-key');
      if (key) {
        data.texts[key] = el.innerHTML;
      }
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (showFeedback) {
        showToast('✓ 個人資料變更已成功儲存至本地！');
      }
    } catch (e) {
      console.error('Storage quota exceeded or error:', e);
      showToast('⚠️ 儲存失敗（可能圖片過大超過瀏覽器儲存上限）');
    }
  }

  // Toggle Edit Mode
  function setEditMode(enable) {
    isEditMode = enable;
    if (enable) {
      document.body.classList.add('is-editing');
      editToolbar.classList.add('active');
      editToolbar.setAttribute('aria-hidden', 'false');
      editModeToggle.classList.add('active');
      editModeToggle.setAttribute('aria-pressed', 'true');
      editableElements.forEach(el => {
        el.setAttribute('contenteditable', 'true');
      });
      showToast('✏️ 已啟動編輯模式！點擊頁面任何虛線文字即可修改。');
    } else {
      document.body.classList.remove('is-editing');
      editToolbar.classList.remove('active');
      editToolbar.setAttribute('aria-hidden', 'true');
      editModeToggle.classList.remove('active');
      editModeToggle.setAttribute('aria-pressed', 'false');
      editableElements.forEach(el => {
        el.removeAttribute('contenteditable');
      });
    }
  }

  if (editModeToggle) {
    editModeToggle.addEventListener('click', () => {
      setEditMode(!isEditMode);
    });
  }

  if (btnCloseEdit) {
    btnCloseEdit.addEventListener('click', () => {
      setEditMode(false);
    });
  }

  if (btnSaveData) {
    btnSaveData.addEventListener('click', () => {
      saveCurrentContent(true);
    });
  }

  // Change avatar in edit mode
  if (btnChangeAvatar && avatarFileInput) {
    btnChangeAvatar.addEventListener('click', () => {
      avatarFileInput.click();
    });

    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        showToast('⚠️ 建議上傳 2MB 以內圖片，以利本地流暢儲存');
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (avatarImage) {
          avatarImage.src = event.target.result;
          saveCurrentContent(false);
          showToast('✓ 頭像已成功更新！');
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Export JSON backup
  if (btnExportJSON) {
    btnExportJSON.addEventListener('click', () => {
      saveCurrentContent(false);
      const dataStr = localStorage.getItem(STORAGE_KEY) || '{}';
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('✓ 備份檔案已匯出下載！');
    });
  }

  // Import JSON backup
  if (btnImportJSON && importFileInput) {
    btnImportJSON.addEventListener('click', () => {
      importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          if (importedData.texts) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData));
            loadSavedContent();
            showToast('✓ 成功匯入並套用設定！');
          } else {
            showToast('⚠️ 檔案格式不符合規範');
          }
        } catch (err) {
          showToast('⚠️ JSON 解析失敗');
        }
      };
      reader.readAsText(file);
    });
  }

  // Reset to original default sample
  if (btnResetData) {
    btnResetData.addEventListener('click', () => {
      if (confirm('確定要清除所有自訂修改，恢復為初始精美範例資料嗎？')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    });
  }

  // Auto-save on blur of editable items
  editableElements.forEach(el => {
    el.addEventListener('blur', () => {
      if (isEditMode) {
        saveCurrentContent(false);
      }
    });
  });

  // ==========================================
  // 5. SKILLS MATRIX CATEGORY FILTER
  // ==========================================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const skillCards = document.querySelectorAll('.skill-category-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterVal = tab.getAttribute('data-filter');

      skillCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filterVal === 'all' || cat === filterVal) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transition = 'opacity 0.3s ease';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ==========================================
  // 6. PROJECT CASE STUDY MODAL DRAWER
  // ==========================================
  const caseModal = document.getElementById('caseModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const modalCategory = document.getElementById('modalCategory');
  const modalContent = document.getElementById('modalContent');
  const viewCaseButtons = document.querySelectorAll('.btn-view-case');

  // Rich case study content data
  const caseStudyData = {
    p1: {
      category: 'CASE STUDY 01 • MOBILE APP UX/UI',
      title: 'AURA — 極簡沉浸式身心音律與專注冥想 App',
      heroImg: 'assets/images/project1.jpg',
      meta: {
        role: 'Lead UX Researcher & UI Designer',
        timeline: '2023.10 — 2024.03 (5 個月)',
        tools: 'Figma, FigJam, After Effects, Spline'
      },
      htmlContent: `
        <div class="modal-section">
          <h4 class="modal-section-title">01 / 背景與挑戰 (Background & Problem)</h4>
          <p class="modal-paragraph">
            隨著現代都市生活節奏加速，超過 78% 的年輕工作者面臨注意力分散與焦慮困擾。市場上主流冥想 App 往往充斥過度複雜的社群功能與視覺干擾，造成使用者二次資訊過載。
          </p>
          <div class="modal-highlight-box">
            <strong>核心設計命題：</strong>如何打造一款「零認知負擔」的專注應用，在 3 秒內引導使用者進入平靜心流？
          </div>
        </div>

        <div class="modal-section">
          <h4 class="modal-section-title">02 / 使用者研究與痛點洞察 (Research & Insights)</h4>
          <p class="modal-paragraph">
            我們針對 25 位 22–32 歲的目標受眾展開半結構化訪談與可用性走查，梳理出三大關鍵痛點：
          </p>
          <ul style="list-style:disc; margin-left:20px; color:var(--text-secondary); line-height:1.7; margin-bottom:12px;">
            <li><strong>選擇困難：</strong>首頁音檔分類過多，使用者需耗費逾 45 秒選曲。</li>
            <li><strong>視覺刺激過強：</strong>色彩過於鮮豔飽和，夜間使用對眼睛造成疲憊。</li>
            <li><strong>操作回饋生硬：</strong>缺乏儀式感與實體物件般的情感觸覺連結。</li>
          </ul>
        </div>

        <div class="modal-section">
          <h4 class="modal-section-title">03 / 設計策略與亮點 (Design Solutions)</h4>
          <p class="modal-paragraph">
            <strong>1. 雜誌感溫潤色盤：</strong>採用燕麥色（Oatmeal Cream）與深炭灰（Charcoal）構築自然低對比視界，支援環境光自適應切換。
          </p>
          <p class="modal-paragraph">
            <strong>2. 一鍵聲景混音：</strong>將風聲、雨聲、林濤與雙耳節拍抽象化為觸摸波形卡片，手指輕觸即自然淡入淡出。
          </p>
          <p class="modal-paragraph">
            <strong>3. 微動態與觸覺回饋：</strong>在播放切換與計時結束時導入精準貝茲緩動（Bezier Easing）與細膩震動，營造深層安心感。
          </p>
        </div>

        <div class="modal-section">
          <h4 class="modal-section-title">04 / 成效與成果 (Outcomes & Impact)</h4>
          <p class="modal-paragraph">
            經過 3 輪線框圖與高保真原型迭代，SUS 易用性評分由初期的 64 分大幅提升至 <strong>88.5 分</strong>（超越業界平均 20%）；首月留存率預估模型提升 42%，專案榮獲設計學院年度畢業專題評選<strong>「特優第一名」</strong>。
          </p>
        </div>
      `
    },
    p2: {
      category: 'CASE STUDY 02 • DESIGN SYSTEM',
      title: 'NORDIC — 北歐現代排版設計系統與元件庫架構',
      heroImg: 'assets/images/project2.jpg',
      meta: {
        role: 'Design System Architect',
        timeline: '2024.01 — 2024.04 (3 個月)',
        tools: 'Figma Variables, Tokens Studio, CSS Grid, Zeroheight'
      },
      htmlContent: `
        <div class="modal-section">
          <h4 class="modal-section-title">01 / 專案挑戰 (The Core Challenge)</h4>
          <p class="modal-paragraph">
            在多專案跨團隊協作中，常見按鈕樣式破碎、字級行高不一致、工程端反覆造輪子的問題。我們需要一套兼具北歐雜誌質感、嚴謹工程落地標準且易於擴展的數位設計系統。
          </p>
        </div>

        <div class="modal-section">
          <h4 class="modal-section-title">02 / 設計系統架構 (Architecture & Tokens)</h4>
          <p class="modal-paragraph">
            我們採用 Atomic Design 思維與 W3C Design Tokens 規範建構多階層結構：
          </p>
          <ul style="list-style:disc; margin-left:20px; color:var(--text-secondary); line-height:1.7; margin-bottom:12px;">
            <li><strong>Global Tokens：</strong>精確定義 12 色階 HSL、8pt 基線網格與 6 種圓角規範。</li>
            <li><strong>Semantic Tokens：</strong>語意化映射（如 surface-subtle, text-primary, border-hairline），實現一鍵深淺色平滑轉化。</li>
            <li><strong>Component Library：</strong>包含 50+ 響應式 Figma 元件，全面支援 Auto Layout 5.0 與 Component Properties。</li>
          </ul>
        </div>

        <div class="modal-section">
          <h4 class="modal-section-title">03 / 無障礙與工程端交付 (Accessibility & Handoff)</h4>
          <p class="modal-paragraph">
            全色盤通過 WCAG 2.1 AAA 級對比檢驗；撰寫完善的 Zeroheight 線上規範指南，並與前端開發者共同訂定 CSS 變數命名規範，使跨團隊溝通時間縮短超過 <strong>55%</strong>。
          </p>
        </div>
      `
    },
    p3: {
      category: 'CASE STUDY 03 • INTERACTIVE 3D WEB',
      title: 'META-FORMS — 當代數位幾何雕塑線上展覽體驗',
      heroImg: 'assets/images/project3.jpg',
      meta: {
        role: 'Creative Web Designer & Technologist',
        timeline: '2023.11 — 2024.02 (3 個月)',
        tools: 'Spline 3D, HTML5/CSS3, JavaScript, WebGL'
      },
      htmlContent: `
        <div class="modal-section">
          <h4 class="modal-section-title">01 / 展覽概念 (Curatorial Concept)</h4>
          <p class="modal-paragraph">
            《META-FORMS》是由新世代數位藝術家共同發起的線上雕塑聯展。目標是打破實體美術館的物理邊界，讓全球觀眾能透過瀏覽器以 360 度無縫視角觸摸、旋轉、聆聽每一件虛擬雕塑的空間回響。
          </p>
        </div>

        <div class="modal-section">
          <h4 class="modal-section-title">02 / 新粗獷排版與 3D 空間互動</h4>
          <p class="modal-paragraph">
            視覺上運用高對比粗黑線條、黑白雕塑灰階材質與細膩字體排印，形成極具張力的冷冽未來感；透過 Spline 3D 建立輕量化 WebGL 幾何體，在維持 60 FPS 流暢度的同時降低 60% 算力負擔。
          </p>
          <div class="modal-highlight-box">
            <strong>獲獎認可：</strong>榮獲 2024 全國大專校院數位創作競賽「最佳視覺與互動設計金獎」，並獲選於新媒體藝術年會線上展出。
          </div>
        </div>
      `
    }
  };

  function openCaseModal(projectId) {
    const data = caseStudyData[projectId];
    if (!data) return;

    modalCategory.textContent = data.category;
    modalContent.innerHTML = `
      <img src="${data.heroImg}" alt="${data.title}" class="modal-hero-img">
      <h3 class="modal-title">${data.title}</h3>
      <div class="modal-meta-grid">
        <div class="modal-meta-item">
          <span class="label">ROLE 擔當角色</span>
          <span class="val">${data.meta.role}</span>
        </div>
        <div class="modal-meta-item">
          <span class="label">TIMELINE 專案期程</span>
          <span class="val">${data.meta.timeline}</span>
        </div>
        <div class="modal-meta-item">
          <span class="label">TOOLS 運用工具</span>
          <span class="val">${data.meta.tools}</span>
        </div>
      </div>
      ${data.htmlContent}
      <div style="margin-top:36px; padding-top:20px; border-top:1px solid var(--border-hairline); display:flex; gap:12px;">
        <a href="#contact" class="btn btn-primary" onclick="document.getElementById('caseModal').classList.remove('open')">與我聊聊此專案</a>
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('caseModal').classList.remove('open')">返回作品總覽</button>
      </div>
    `;

    caseModal.classList.add('open');
    caseModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCaseModal() {
    caseModal.classList.remove('open');
    caseModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  viewCaseButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      openCaseModal(targetId);
    });
  });

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeCaseModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeCaseModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseModal.classList.contains('open')) {
      closeCaseModal();
    }
  });

  // ==========================================
  // 7. ONE-CLICK EMAIL COPY
  // ==========================================
  const EMAIL_ADDRESS = 'elena.chen.design@email.com';

  function copyEmailToClipboard() {
    navigator.clipboard.writeText(EMAIL_ADDRESS).then(() => {
      showToast('✓ 已複製信箱地址 (elena.chen.design@email.com)');
    }).catch(() => {
      showToast('已選取信箱：elena.chen.design@email.com');
    });
  }

  const heroCopyEmailBtn = document.getElementById('heroCopyEmailBtn');
  if (heroCopyEmailBtn) {
    heroCopyEmailBtn.addEventListener('click', copyEmailToClipboard);
  }

  const btnCopyEmailInCard = document.getElementById('btnCopyEmailInCard');
  if (btnCopyEmailInCard) {
    btnCopyEmailInCard.addEventListener('click', copyEmailToClipboard);
  }

  // ==========================================
  // 8. PRINT RESUME ACTION
  // ==========================================
  const printResumeBtn = document.getElementById('printResumeBtn');
  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // ==========================================
  // 9. MOBILE MENU TOGGLE
  // ==========================================
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuToggle && mobileNavDrawer) {
    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = mobileNavDrawer.classList.toggle('open');
      mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavDrawer.classList.remove('open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ==========================================
  // 10. CONTACT FORM SUBMISSION
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const senderName = document.getElementById('senderName').value;
      showToast(`✓ 謝謝您，${senderName}！您的訊息已送出，我將在 24 小時內回覆。`);
      contactForm.reset();
    });
  }

  // ==========================================
  // 11. SMOOTH SCROLL FOR ANCHORS
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

});
